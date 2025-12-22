using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using Microsoft.Extensions.Logging;
using WellTrackAPI.ExceptionHandling;

namespace WellTrackAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _db;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext db,
            ITokenService tokenService,
            IEmailService emailService,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _db = db;
            _tokenService = tokenService;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<bool> DoesUserExist(string email)
        {
            return await _userManager.FindByEmailAsync(email) != null;
        }
        public async Task<(bool Succeeded, string? UserId, IEnumerable<string>? Errors)> RegisterAsync(RegisterModel model, string originIp)
        {
            _logger.LogInformation("Registering attempt for user with email {Email} from IP {IP}", model.Email, originIp);
            if (await DoesUserExist(model.Email))
            {
                _logger.LogWarning("Registration failed: Email {Email} is already in use", model.Email);
                throw new ConflictException("User already exists");
            }

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                Name = model.Name
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                _logger.LogWarning(
                    "Registration failed for email {Email}. Errors: {Errors}",
                    model.Email,
                    result.Errors.Select(e => e.Description)
                );
                throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            // ensure "User" role exists and assign
            if (!await _roleManager.RoleExistsAsync("User"))
                await _roleManager.CreateAsync(new IdentityRole("User"));
            await _userManager.AddToRoleAsync(user, "User");

            // send OTP
            await SendEmailOtpAsync(user.Id, user.Email!);

            _logger.LogInformation("User registered successfully, UserId: {UserId}", user.Id);

            return (true, user.Id, null);
        }

        public async Task<(string? AccessToken, string? RefreshToken, string? Error)> LoginAsync(LoginModel model, string ipAddress)
        {
            _logger.LogInformation("Login attempt for email {Email} from IP {IP}", model.Email, ipAddress);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Invalid login attempt for email {Email}", model.Email);
                throw new UnauthorizedException("Invalid credentials");
            }

            if (await _userManager.IsLockedOutAsync(user))
            {
                _logger.LogWarning("Login blocked. Account locked for email {Email}", model.Email);
                throw new UnauthorizedException($"Account locked. Try again after {user.LockoutEnd?.ToLocalTime():HH:mm}");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: true);
            if (!result.Succeeded)
            {
                var failedCount = await _userManager.GetAccessFailedCountAsync(user);
                var maxAttempts = _userManager.Options.Lockout.MaxFailedAccessAttempts;
                var attemptsLeft = Math.Max(0, maxAttempts - failedCount);

                _logger.LogWarning("Invalid login attempt for email {Email}. {AttemptsLeft} attempts left.", model.Email, attemptsLeft);
                throw new UnauthorizedException(attemptsLeft > 0
                    ? $"Invalid credentials. {attemptsLeft} attempt(s) left before account lock."
                    : "Account locked due to too many failed login attempts.");
            }

            await _userManager.ResetAccessFailedCountAsync(user);

            if (!user.EmailConfirmed)
            {
                _logger.LogWarning("Login blocked. Email not verified for {Email}", model.Email);
                throw new UnauthorizedException("Email not verified");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = _tokenService.CreateAccessToken(user, roles);
            var refreshToken = _tokenService.CreateRefreshToken(ipAddress, user.Id);

            _db.RefreshTokens.Add(refreshToken);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Login successful. UserId: {UserId}", user.Id);

            return (accessToken, refreshToken.Token, null);
        }

        public async Task<(string? AccessToken, string? Error)> RefreshTokenAsync(string token, string ipAddress)
        {
            var refresh = await _db.RefreshTokens.Include(r => r.User).FirstOrDefaultAsync(r => r.Token == token);
            if (refresh == null || !refresh.IsActive)
            {
                _logger.LogWarning("Invalid refresh token attempt from IP {IP}", ipAddress);
                throw new UnauthorizedException("Invalid refresh token");
            }

            // revoke current token and issue new refresh token
            refresh.Revoked = DateTime.UtcNow;
            refresh.RevokedByIp = ipAddress;

            var newRefresh = _tokenService.CreateRefreshToken(ipAddress, refresh.UserId);
            refresh.ReplacedByToken = newRefresh.Token;

            _db.RefreshTokens.Add(newRefresh);

            var roles = await _userManager.GetRolesAsync(refresh.User);
            var newAccess = _tokenService.CreateAccessToken(refresh.User, roles);

            await _db.SaveChangesAsync();

            _logger.LogInformation("Refresh token rotated for UserId {UserId}", refresh.UserId);
            return (newAccess, null);
        }

        public async Task<bool> RevokeRefreshTokenAsync(string token, string ipAddress)
        {
            var refresh = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);
            if (refresh == null || !refresh.IsActive)
            {
                _logger.LogWarning("Attempt to revoke invalid or inactive refresh token from IP {IP}", ipAddress);
                throw new NotFoundException("Refresh token not found or already inactive");
            }
            refresh.Revoked = DateTime.UtcNow;
            refresh.RevokedByIp = ipAddress;
            await _db.SaveChangesAsync();
            _logger.LogInformation("Refresh token revoked for UserId {UserId} from IP {IP}", refresh.UserId, ipAddress);
            return true;
        }

        public async Task SendEmailOtpAsync(string userId, string email)
        {
            var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            var otp = new EmailOtp
            {
                UserId = userId,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                CreatedAt = DateTime.UtcNow
            };
            _db.EmailOtps.Add(otp);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Sending email OTP to {Email} for UserId {UserId}", email, userId);

            await _emailService.SendEmailAsync(email, "Your WellTrack OTP", $"Your verification code is: <b>{code}</b>. It expires in 15 minutes.");
        }

        public async Task<bool> VerifyEmailOtpAsync(string userId, string code)
        {
            var otp = await _db.EmailOtps
                .Where(o => o.UserId == userId && !o.Used && o.ExpiresAt >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != code)
            {
                _logger.LogWarning("Invalid email OTP verification attempt for UserId {UserId}", userId);
                throw new ValidationException("Invalid or expired OTP");
            }

            otp.Used = true;

            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);
            _logger.LogInformation("Email OTP verified successfully for UserId {UserId}", userId);
            await _db.SaveChangesAsync();
            return true;
        }
        public async Task SendPasswordResetOtpAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }
            var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            var otp = new EmailOtp
            {
                UserId = user.Id,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                CreatedAt = DateTime.UtcNow,
                Purpose = "PasswordReset" //mark purpose as password reset
            };
            _logger.LogInformation("Sending password reset OTP to {Email}", email);
            _db.EmailOtps.Add(otp);
            await _db.SaveChangesAsync();

            await _emailService.SendEmailAsync(email, "Reset Your Password", $"Your reset code is: <b>{code}</b>. It expires in 15 minutes.");
        }
        public async Task<bool> ResetPasswordAsync(string email, string code, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            var otp = await _db.EmailOtps
                .Where(o => o.UserId == user.Id && !o.UsedForReset && o.ExpiresAt >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != code)
            {
                _logger.LogWarning("Invalid password reset OTP attempt for email {Email}", email);
                return false;
            }

            otp.UsedForReset = true; // mark as fully consumed for reset
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            await _db.SaveChangesAsync();
            _logger.LogInformation("Password reset successfully for email {Email}", email);
            return result.Succeeded;
        }


        public async Task<bool> VerifyPasswordResetOtpAsync(string email, string code)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            var otp = await _db.EmailOtps
                .Where(o => o.UserId == user.Id && o.Purpose == "PasswordReset" && !o.Used && o.ExpiresAt >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != code)
            {
                _logger.LogWarning("Invalid password reset OTP verification attempt for email {Email}", email);
                return false;
            }

            otp.Used = true;
            await _db.SaveChangesAsync();
            _logger.LogInformation("Password reset OTP verified successfully for email {Email}", email);
            return true;
        }
    }
}
