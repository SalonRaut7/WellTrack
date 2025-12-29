using System.Net.Http.Json;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Models;
using Microsoft.AspNetCore.SignalR;
using WellTrackAPI.Hubs;

namespace WellTrackAPI.Services;

public class MotivationService : IMotivationService
{
    private readonly ApplicationDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMapper _mapper;
    private readonly IConfiguration _config;
    private readonly ILogger<MotivationService> _logger;
    private readonly IHubContext<NotificationHub> _hub;

    public MotivationService(
        ApplicationDbContext db,
        IHttpClientFactory httpClientFactory,
        IMapper mapper,
        IConfiguration config,
        ILogger<MotivationService> logger,
        IHubContext<NotificationHub> hub)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _mapper = mapper;
        _config = config;
        _logger = logger;
        _hub = hub;
    }

    public async Task<DailyMotivationDTO> GetTodayMotivationAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var existing = await _db.DailyMotivations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Date == today);

        if (existing != null)
        {
            _logger.LogInformation("Daily motivation loaded from DB for {Date}", today);
            return _mapper.Map<DailyMotivationDTO>(existing);
        }
        try
        {
            var baseUrl = _config["MotivationAI:BaseUrl"];
            if (string.IsNullOrWhiteSpace(baseUrl))
                throw new ValidationException("Motivation AI BaseUrl is not configured");

            var client = _httpClientFactory.CreateClient();
            client.BaseAddress = new Uri(baseUrl);

            var response = await client.PostAsync("/motivation/daily", content: null);

            if (!response.IsSuccessStatusCode)
                throw new ExternalServiceException(
                    $"Motivation AI service failed with status {response.StatusCode}");

            var aiResult = await response.Content.ReadFromJsonAsync<FastApiMotivationResponse>();

            if (aiResult == null || string.IsNullOrWhiteSpace(aiResult.Message))
                throw new ValidationException("Invalid motivation response received from AI service");

            var motivation = new DailyMotivation
            {
                Date = today,
                Message = aiResult.Message
            };

            _db.DailyMotivations.Add(motivation);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Daily motivation generated and saved for {Date}", today);
            await _hub.Clients.All.SendAsync("ReceiveMotivation", new
            {
                Date = today,
                Message = aiResult.Message
            });
            return _mapper.Map<DailyMotivationDTO>(motivation);
        }
        catch (DomainException)
        {
            throw; 
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected failure while generating daily motivation for {Date}", today);
            throw new ExternalServiceException("Failed to generate daily motivation");
        }
    }

    private sealed class FastApiMotivationResponse
    {
        public string Message { get; set; } = null!;
    }
}
