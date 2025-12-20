using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace WellTrackAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;
        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlMessage)
        {
            _logger.LogInformation("Sending email to {Email} with subject {Subject}", to, subject);
            var message = new MimeMessage();
            var fromEmail = _config["Smtp:FromEmail"] ?? "noreply@welltrack.local";
            var fromName = _config["Smtp:FromName"] ?? "WellTrack";
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = htmlMessage };

            using var client = new SmtpClient();
            await client.ConnectAsync(_config["Smtp:Host"], int.Parse(_config["Smtp:Port"] ?? "587"), false);
            var username = _config["Smtp:Username"];
            var password = _config["Smtp:Password"];
            if (!string.IsNullOrEmpty(username))
                await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            _logger.LogInformation("Email sent successfully to {Email}", to);
        }
    }
}
