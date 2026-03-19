using Microsoft.AspNetCore.Identity;
using WellTrackAPI.DTOs;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Models;
using WellTrackAPI.Services.Core;

namespace WellTrackAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IEmailOtpService _emailOtpService;
        private readonly IPasswordResetService _passwordResetService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IUserRoleService _userRoleService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ITokenService tokenService,
            IEmailOtpService emailOtpService,
            IPasswordResetService passwordResetService,
            IRefreshTokenService refreshTokenService,
            IUserRoleService userRoleService,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _emailOtpService = emailOtpService;
            _passwordResetService = passwordResetService;
            _refreshTokenService = refreshTokenService;
            _userRoleService = userRoleService;
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

            await _userRoleService.EnsureUserRoleAssignedAsync(user);
            await _emailOtpService.SendEmailVerificationOtpAsync(user.Id, user.Email!);

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
            var refreshToken = await _refreshTokenService.CreateAndSaveRefreshTokenAsync(user.Id, ipAddress);

            _logger.LogInformation("Login successful. UserId: {UserId}", user.Id);

            return (accessToken, refreshToken, null);
        }

        public async Task<(string? AccessToken, string? Error)> RefreshTokenAsync(string token, string ipAddress)
        {
            var accessToken = await _refreshTokenService.RefreshTokenAsync(token, ipAddress);
            return (accessToken, null);
        }

        public async Task<bool> RevokeRefreshTokenAsync(string token, string ipAddress)
        {
            return await _refreshTokenService.RevokeRefreshTokenAsync(token, ipAddress);
        }

        public async Task SendEmailOtpAsync(string userId, string email)
        {
            await _emailOtpService.SendEmailVerificationOtpAsync(userId, email);
        }

        public async Task<bool> VerifyEmailOtpAsync(string userId, string code)
        {
            var verified = await _emailOtpService.VerifyEmailOtpAsync(userId, code);

            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);

            return verified;
        }

        public async Task SendPasswordResetOtpAsync(string email)
        {
            await _passwordResetService.SendPasswordResetOtpAsync(email);
        }

        public async Task<bool> ResetPasswordAsync(string email, string code, string newPassword)
        {
            return await _passwordResetService.ResetPasswordAsync(email, code, newPassword);
        }

        public async Task<bool> VerifyPasswordResetOtpAsync(string email, string code)
        {
            return await _passwordResetService.VerifyPasswordResetOtpAsync(email, code);
        }
    }
}