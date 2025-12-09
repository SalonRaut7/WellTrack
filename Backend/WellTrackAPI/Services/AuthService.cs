using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _db;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext db,
            ITokenService tokenService,
            IEmailService emailService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _db = db;
            _tokenService = tokenService;
            _emailService = emailService;
        }

        public async Task<bool> DoesUserExist(string email)
        {
            return await _userManager.FindByEmailAsync(email) != null;
        }
        public async Task<(bool Succeeded, string? UserId, IEnumerable<string>? Errors)> RegisterAsync(RegisterModel model, string originIp)
        {
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                Name = model.Name
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded) return (false,null, result.Errors.Select(e => e.Description));

            // ensure "User" role exists and assign
            if (!await _roleManager.RoleExistsAsync("User"))
                await _roleManager.CreateAsync(new IdentityRole("User"));
            await _userManager.AddToRoleAsync(user, "User");

            // send OTP
            await SendEmailOtpAsync(user.Id, user.Email!);

            return (true, user.Id, null);
        }

        public async Task<(string? AccessToken, string? RefreshToken, string? Error)> LoginAsync(LoginModel model, string ipAddress)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return (null, null, "Invalid credentials");
            if (!await _userManager.CheckPasswordAsync(user, model.Password)) return (null, null, "Invalid credentials");
            if (!user.EmailConfirmed) return (null, null, "Email not verified");

            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = _tokenService.CreateAccessToken(user, roles);
            var refreshToken = _tokenService.CreateRefreshToken(ipAddress, user.Id);

            _db.RefreshTokens.Add(refreshToken);
            await _db.SaveChangesAsync();

            return (accessToken, refreshToken.Token, null);
        }

        public async Task<(string? AccessToken, string? Error)> RefreshTokenAsync(string token, string ipAddress)
        {
            var refresh = await _db.RefreshTokens.Include(r => r.User).FirstOrDefaultAsync(r => r.Token == token);
            if (refresh == null || !refresh.IsActive) return (null, "Invalid refresh token");

            // revoke current token and issue new refresh token
            refresh.Revoked = DateTime.UtcNow;
            refresh.RevokedByIp = ipAddress;

            var newRefresh = _tokenService.CreateRefreshToken(ipAddress, refresh.UserId);
            refresh.ReplacedByToken = newRefresh.Token;

            _db.RefreshTokens.Add(newRefresh);

            var roles = await _userManager.GetRolesAsync(refresh.User);
            var newAccess = _tokenService.CreateAccessToken(refresh.User, roles);

            await _db.SaveChangesAsync();
            return (newAccess, null);
        }

        public async Task<bool> RevokeRefreshTokenAsync(string token, string ipAddress)
        {
            var refresh = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);
            if (refresh == null || !refresh.IsActive) return false;
            refresh.Revoked = DateTime.UtcNow;
            refresh.RevokedByIp = ipAddress;
            await _db.SaveChangesAsync();
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

            await _emailService.SendEmailAsync(email, "Your WellTrack OTP", $"Your verification code is: <b>{code}</b>. It expires in 15 minutes.");
        }

        public async Task<bool> VerifyEmailOtpAsync(string userId, string code)
        {
            var otp = await _db.EmailOtps
                .Where(o => o.UserId == userId && !o.Used && o.ExpiresAt >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != code) return false;

            otp.Used = true;

            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }

            await _db.SaveChangesAsync();
            return true;
        }
        public async Task SendPasswordResetOtpAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return; 

            var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            var otp = new EmailOtp
            {
                UserId = user.Id,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                CreatedAt = DateTime.UtcNow,
                Purpose = "PasswordReset" //mark purpose as password reset
            };
            _db.EmailOtps.Add(otp);
            await _db.SaveChangesAsync();

            await _emailService.SendEmailAsync(email, "Reset Your Password", $"Your reset code is: <b>{code}</b>. It expires in 15 minutes.");
        }
        public async Task<bool> ResetPasswordAsync(string email, string code, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return false;

            var otp = await _db.EmailOtps
                .Where(o => o.UserId == user.Id && !o.UsedForReset && o.ExpiresAt >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != code) return false;

            otp.UsedForReset = true; // mark as fully consumed for reset
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            await _db.SaveChangesAsync();
            return result.Succeeded;
        }


        public async Task<bool> VerifyPasswordResetOtpAsync(string email, string code)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return false;

            var otp = await _db.EmailOtps
                .Where(o => o.UserId == user.Id && o.Purpose == "PasswordReset" && !o.Used && o.ExpiresAt >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != code) return false;

            otp.Used = true;
            await _db.SaveChangesAsync();
            return true;
        }

        

    }
}
