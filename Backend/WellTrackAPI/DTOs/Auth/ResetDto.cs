namespace WellTrackAPI.DTOs.Auth
{
    public record ResetPasswordDto(
        string Email,
        string Code,
        string NewPassword
    );

    public record VerifyResetOtpDto(
        string Email,
        string Code
    );
}
