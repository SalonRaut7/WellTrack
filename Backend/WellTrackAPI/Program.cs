using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WellTrackAPI.Data;
using WellTrackAPI.Mapping;
using WellTrackAPI.Models;
using WellTrackAPI.Services;
using WellTrackAPI.Settings;
using WellTrackAPI.ExceptionHandling;
using Serilog;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using WellTrackAPI.Hubs;
using WellTrackAPI.BackgroundJobs;
using WellTrackAPI.SignalR;
using Microsoft.AspNetCore.SignalR;


var builder = WebApplication.CreateBuilder(args);
// Configure Serilog
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
);

// USDA API settings
builder.Services.Configure<UsdaSettings>(builder.Configuration.GetSection("USDA"));

// Register HttpClient for calling external APIs like USDA(in this case)
builder.Services.AddHttpClient();


// PostgreSQL (Npgsql)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedEmail = true;
    options.Password.RequiredLength = 6;

    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing")))
    };
});

// Controllers
builder.Services.AddControllers();

// AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile)); // registers the mapping profile from Mapping folder

// SignalR
builder.Services.AddSignalR();

//policy-based rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("AuthPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,              // 5 requests
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.AddPolicy("TokenPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.AddPolicy("UserPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name
                          ?? context.Connection.RemoteIpAddress?.ToString()
                          ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.AddPolicy("AdminPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? "admin",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1)
            }));
});


// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "WellTrack API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {your JWT token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


// Register application services (including auth/email/token)
builder.Services.AddScoped<IMoodService, MoodService>();
builder.Services.AddScoped<ISleepService, SleepService>();
builder.Services.AddScoped<IHydrationService, HydrationService>();
builder.Services.AddScoped<IStepService, StepService>();
builder.Services.AddScoped<IHabitService, HabitService>();
builder.Services.AddScoped<IFoodService, FoodService>();
builder.Services.AddScoped<IMotivationService, MotivationService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IImageService, CloudinaryImageService>();

builder.Services.AddScoped<IStepAnalyticsService, StepAnalyticsService>();
builder.Services.AddScoped<ISleepAnalyticsService, SleepAnalyticsService>();
builder.Services.AddScoped<IHydrationAnalyticsService, HydrationAnalyticsService>();
builder.Services.AddScoped<IFoodAnalyticsService, FoodAnalyticsService>();

builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<HealthNotificationWorker>();

builder.Services.AddSingleton<IUserIdProvider, NameIdentifierUserIdProvider>();

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseExceptionHandler();

app.UseCors("CorsPolicy");

//call seed admin
await SeedData.SeedAdminAsync(app.Services);

app.MapHub<NotificationHub>("/hubs/notifications");

// Middleware
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "WellTrack API v1"));

app.UseHttpsRedirection();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

