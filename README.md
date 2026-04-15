# WellTrack

[![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)

WellTrack is a full-stack personal wellness platform that helps users track mood, sleep, steps, hydration, food, and habits while providing analytics, real-time notifications, admin management, and AI-assisted recommendations (via a FastAPI microservice).

---

## Features

### Authentication & Security
- Secure auth with **email OTP verification**, **JWT access/refresh tokens**, and **per-route rate limiting**.
- **OTP Email Verification**:
  - 6-digit code on registration
  - Verification required before account activation
  - POST `/api/auth/verify-otp` endpoint
- **JWT Token Management**:
  - Access tokens: 60-minute expiration (configurable)
  - Refresh tokens: Longer expiration, stored in database
  - Token validation: Issuer, Audience, Lifetime, Signing Key
  - POST `/api/auth/refresh` - Refresh access token
- **Forgot Password** → OTP verification → reset password
  - Secure OTP-based password reset flow
- **Change Password** inside Profile page
- **Account Lockout**: 5 failed attempts → 15-minute lockout
- Role-based authorization and routing:
  - **User** → `/dashboard`
  - **Admin** → `/admin`
- Protected routes:
  - `PrivateRoute` for authenticated-only pages
  - `AdminRoute` for admin pages
  - `UserRoute` redirects admins away from user-only pages

### Wellness Trackers
Users can **create, edit, delete** entries for:
- Mood Tracker (mood + optional notes)
- Sleep Tracker (bed time, wake time, quality)
- Steps Tracker (count + activity type)
- Hydration Tracker (water intake; stored as liters)
- Habits Tracker (habit name + completed status)
- Food Logging (meals + macros)

Each tracker page includes:
- Entry form
- History list/table
- Edit-in-place and delete operations

### Food Tracking + USDA Search
- Log meals with:
  - food name
  - calories, protein, carbs, fat
  - serving size
  - meal type (Breakfast/Lunch/Dinner/Snack)
- Search USDA Food database and auto-fill macros from selected result
- “Today’s totals” summary of macros
- Edit and delete food entries

### Analytics + Charts
- Weekly/monthly analytics charts for:
  - Steps
  - Sleep
  - Hydration
  - (Backend also supports analytics endpoints like `food` depending on range)
- Backend aggregates daily totals using `DateOnly` and returns chart points:
  - `{ date, value }`

### Real-time Notifications
- Real-time notifications via **SignalR** hub for health reminders and updates.
- Hub hosted at `/hubs/notifications`; frontend uses `@microsoft/signalr`.

### AI Features
Powered by the `WellTrackAI` FastAPI microservice:
- AI predictions for:
  - mood
  - sleep quality
  - habit success
  - daily motivation
- Analytics page can compile latest signals and call AI endpoints (example: `/predict/predict-all`)
- Displays:
  - summary
  - actionable recommendations list

> Note: AI services depend on `WellTrackAI` configuration and `GROQ_API_KEY`.

### Profile Management
- View and edit comprehensive user profile:
  - Basic info: name, email, username
  - Health metrics: age, gender, weight, height, bio, goals
  - **BMI** automatically calculated if height + weight provided
- Profile photo management:
  - Upload via **Cloudinary** integration
  - Delete existing photo
- Admin-restricted profile view: minimal exposure of admin account details
- GET `/api/profile` - Get current user profile
- PUT `/api/profile` - Update profile (including health metrics)
- POST `/api/profile/photo` - Upload profile photo
- DELETE `/api/profile/photo` - Delete profile photo

### Admin Portal
- **Admin Dashboard** (`/admin`):
  - System-wide statistics: total users, mood entries, sleep records, steps, hydration, habits, food
  - GET `/api/admin/dashboard` - Fetch analytics
- **User Management**:
  - GET `/api/admin/users` - List all users with role info
  - GET `/api/admin/user/{id}` - Detailed user profile, all entries, and stats
  - GET `/api/admin/user/{id}/entries/{entryType}` - Filter entries by type
  - Edit/update tracker records per user (admin-exclusive endpoints)
  - Delete tracker entries per user
  - Assign/remove Admin role
  - Delete user accounts
- Rate-limited with **AdminPolicy** (30 req/min)
- Role-based access: `[Authorize(Roles = "Admin")]`

### Data Import & Export
- **Export to Excel**: Download all tracker data with optional date-range filtering
  - GET `/api/export/excel?from=YYYY-MM-DD&to=YYYY-MM-DD` (range optional)
  - Returns timestamped file: `WellTrack_Export_{timestamp}_Filtered.xlsx`
  - Multi-sheet export: Steps, Sleep, Mood, Hydration, Habits, Food
- **Import from Excel**: Preview and validate data before importing
  - POST `/api/import/preview` - Validate and preview import data
  - POST `/api/import/confirm` - Confirm and save imported entries
  - Conflict detection: Warns about overwrite scenarios
  - Supports range modes: `all`, `today`, `range`
- **Template Download**: GET `/api/template` - Download blank import template
- Validation includes activity types, meal types, sleep quality, mood values
- Auto-removes future-dated entries

### Rate Limiting by Endpoint
- **AuthPolicy** (5 req/min): Registration, email verification
- **TokenPolicy** (10 req/min): Token refresh endpoints
- **UserPolicy** (100 req/min): Standard authenticated endpoints
- **AdminPolicy** (30 req/min): Admin endpoints
- Returns HTTP 429 when limits exceeded
- **Account Lockout**: 5 failed login attempts → 15-minute lockout

### Daily Hydration Goals
- Set and track personal daily water intake targets
- **GET `/api/hydration/daily-goal`** - Current goal (ML)
- **PUT `/api/hydration/daily-goal`** - Update goal
- **GET `/api/hydration/daily-summary`** - Today's progress vs goal

### Daily Motivation
- AI-powered motivation messages delivered via **FastAPI microservice**
- **GET `/api/motivation/today`** - Fetch today's message
- Cached per-user per-day
- Integrated into dashboard

### Background Jobs
- **HealthNotificationWorker**: Continuous background service
  - Checks health metrics and triggers notifications
  - Broadcasts via SignalR hub in real-time
  - Integrates with email/notification systems

### Integrations & Logging
- Integrations:
  - USDA nutrition lookup (auto-fill food macros)
  - Cloudinary image uploads (profile photos)
  - SMTP email (OTP, password reset, notifications)
  - Groq API (AI service via `GROQ_API_KEY`)
  - FastAPI microservice (mood/sleep/habit predictions, motivation)
- Structured logging with **Serilog**:
  - console + rolling file logs in `Backend/WellTrackAPI/Logs/`
  - Daily rolling logs with 14-day retention

---

## Tech Stack

### Frontend
- React + TypeScript + Vite
- React Router
- Tailwind CSS + PostCSS
- Recharts
- Axios
- lucide-react
- SignalR client (`@microsoft/signalr`)

### Backend
- ASP.NET Core 9 Web API
- Entity Framework Core + PostgreSQL
- Identity
- JWT Authentication + Role-based Authorization
- Swagger
- AutoMapper
- Rate limiting
- Hosted jobs
- SignalR
- Serilog

### AI Service
- FastAPI
- scikit-learn models and training scripts
- Groq API (via `GROQ_API_KEY`)

---

## Architecture

- **Backend:** ASP.NET Core 9 Web API with EF Core (PostgreSQL), Identity, JWT, Swagger, AutoMapper, rate limiting, hosted jobs, and SignalR.  
  - Entry point: `Backend/WellTrackAPI/Program.cs`  
  - Settings: `Backend/WellTrackAPI/appsettings.json`

- **Frontend:** React + TypeScript + Vite SPA using Axios, React Router, Tailwind/PostCSS, SignalR client, and Recharts.  
  - Routes: `Frontend/src/App.tsx`  
  - API client: `Frontend/src/api/axios.ts`

- **AI service:** FastAPI microservice exposing mood/habit/sleep predictors and combined recommendations.  
  - App: `WellTrackAI/app/main.py`  
  - Routes: `WellTrackAI/app/routes`

---

## Project Layout

- `Backend/WellTrackAPI` – ASP.NET Core API, data layer, controllers, mappings, background jobs
- `Frontend` – React SPA served by Vite
- `WellTrackAI` – FastAPI + scikit-learn models and training scripts

---

## Getting Started

### Prerequisites
- .NET SDK 9
- Node.js 20+ and npm
- Python 3.10+ and pip
- PostgreSQL 14+ running locally
- Accounts/keys as needed:
  - SMTP email
  - Cloudinary
  - USDA API key
  - Groq API key (AI service)

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email + password
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### Tracker Endpoints (All require `[Authorize]`)
- **Steps**: `GET/POST /api/steps`, `GET/PUT/DELETE /api/steps/{id}`
- **Sleep**: `GET/POST /api/sleep`, `GET/PUT/DELETE /api/sleep/{id}`
- **Mood**: `GET/POST /api/mood`, `GET/PUT/DELETE /api/mood/{id}`
- **Hydration**: `GET/POST /api/hydration`, `GET/PUT/DELETE /api/hydration/{id}`
- **Habits**: `GET/POST /api/habit`, `GET/PUT/DELETE /api/habit/{id}`
- **Food**: `GET/POST /api/food`, `GET/PUT/DELETE /api/food/{id}`

### Analytics
- `GET /api/analytics/steps?from=DATE&to=DATE` - Step analytics
- `GET /api/analytics/sleep?from=DATE&to=DATE` - Sleep analytics
- `GET /api/analytics/hydration?from=DATE&to=DATE` - Hydration analytics
- `GET /api/analytics/food?from=DATE&to=DATE` - Food macros analytics

### Data Management
- `GET /api/export/excel?from=DATE&to=DATE` - Export data (range optional)
- `POST /api/import/preview` - Preview import data
- `POST /api/import/confirm` - Confirm import
- `GET /api/template` - Download import template

### Hydration Goals
- `GET /api/hydration/daily-goal` - Get daily goal
- `PUT /api/hydration/daily-goal` - Set daily goal
- `GET /api/hydration/daily-summary` - Get today's progress

### Motivation & Notifications
- `GET /api/motivation/today` - Get today's motivation
- SignalR Hub: `/hubs/notifications` (real-time notifications)

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/photo` - Upload profile photo
- `DELETE /api/profile/photo` - Delete profile photo
- `POST /api/profile/change-password` - Change password

### Admin (All require `[Authorize(Roles = "Admin")]`)
- `GET /api/admin/dashboard` - System statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/user/{id}` - Get user details
- `GET /api/admin/user/{id}/entries/{entryType}` - Get user's entries
- `PUT/DELETE /api/admin/user/{id}/entries/{entryType}/{entryId}` - Manage entries
- `POST /api/admin/user/{id}/role` - Assign/remove admin role
- `DELETE /api/admin/user/{id}` - Delete user

### External APIs (Frontend)
- `GET /api/food/search?query=QUERY` - Search USDA food database

---

## Backend API Setup

### 1) Configuration
Copy configuration and set secrets:

```bash
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=Backend_WellTrackDB;Username=YOUR_DB_USER;Password=YOUR_DB_PASSWORD"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY",
    "Issuer": "WellTrackAPI",
    "Audience": "WellTrackClient",
    "DurationInMinutes": 60
  },
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": "587",
    "Username": "YOUR_EMAIL",
    "Password": "YOUR_EMAIL_PASSWORD",
    "FromEmail": "YOUR_EMAIL",
    "FromName": "WellTrack"
  },
  "AdminUser": {
    "Email": "YOUR_ADMIN_EMAIL",
    "Password": "YOUR_ADMIN_PASSWORD"
  },
  "Cloudinary": {
    "CloudName": "your_cloud_name",
    "ApiKey": "your_api_key",
    "ApiSecret": "your_api_secret"
  },
  "USDA": {
    "ApiKey": "YOUR_USDA_API_KEY"
  },
  "RateLimiting": {
    "AuthPolicy": {
      "Limit": 5,
      "Window": "1m"
    },
    "TokenPolicy": {
      "Limit": 10,
      "Window": "1m"
    },
    "UserPolicy": {
      "Limit": 100,
      "Window": "1m"
    },
    "AdminPolicy": {
      "Limit": 30,
      "Window": "1m"
    }
  },
  "ImportSettings": {
    "MaxFileSizeBytes": 5242880
  },
  "AccountLockout": {
    "MaxFailedAttempts": 5,
    "LockoutDurationMinutes": 15
  },
  "PasswordPolicy": {
    "RequireDigit": true,
    "RequireLowercase": true,
    "RequireUppercase": true,
    "RequireNonAlphanumeric": true,
    "RequiredLength": 8
  },
  "Serilog": {
    "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.File" ],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.AspNetCore": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "Logs/welltrack-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 14
        }
      }
    ],
    "Enrich": [ "FromLogContext" ]
  },
  "MotivationAI": {
    "BaseUrl": "http://127.0.0.1:8000"
  }
}
```
>Tip: for production, move secrets to environment variables or a secret manager and never commit real credentials.

2) Apply Migrations:
```bash
dotnet ef database update
```

3) Start the backend:
```bash
dotnet run
```

## Frontend Setup

1) Install dependencies:
```bash
cd Frontend
npm install
```

2) Start the server:
```bash
npm run dev
```

## AI Service Setup

1) Add Groq Key in WellTrackAI/.env:
```bash
GROQ_API_KEY="YOUR_KEY_HERE"
```

2) Run the AI service:
```bash
cd WellTrackAI
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
3) Ensure backends point to AI base URL:
```bash
"MotivationAI": {
  "BaseUrl": "http://127.0.0.1:8000"
}
```

---

## Database Schema

### Core Tables

**ApplicationUser** (Identity user extended with tracking fields)
- Id, Email, UserName (unique identifiers)
- Name, Age, Gender, Weight, Height, Bio, Goals
- DailyWaterGoalMl (hydration target)
- ProfilePhotoUrl (Cloudinary)
- Relationships: One-to-many with all tracker entities, RefreshToken, EmailOtp, DailyMotivation

**StepEntry**
- Id (PK), UserId (FK), Date
- StepsCount (int), ActivityType (string: Running/Walking/Hiking/Cycling)

**SleepEntry**
- Id (PK), UserId (FK), Date
- BedTime, WakeUpTime (UTC datetimes)
- Hours (calculated from bed/wake times)
- Quality (string: Good/Average/Poor)

**MoodEntry**
- Id (PK), UserId (FK), Date
- Mood (string: Happy/Neutral/Relaxed/Sad/Angry)
- Notes (optional text)

**HydrationEntry**
- Id (PK), UserId (FK), Date
- WaterIntakeLiters (double)

**HabitEntry**
- Id (PK), UserId (FK), Date
- Name (string), Completed (boolean)

**FoodEntry**
- Id (PK), UserId (FK), Date
- FoodName (string)
- Calories, Protein, Carbs, Fat (double)
- ServingSize (string)
- MealType (string: Breakfast/Lunch/Snack/Dinner)

**DailyMotivation**
- Id (PK), UserId (FK), Date
- Message (AI-generated motivation text)

**RefreshToken**
- Id (PK), UserId (FK)
- Token (string), ExpiryDate (datetime)
- Used for OAuth token refresh flow

**EmailOtp**
- Id (PK), UserId (FK)
- OtpCode (6-digit string), ExpiryDate
- Purpose (string: EmailVerification/PasswordReset)
- IsUsed (boolean)

---

## Troubleshooting

### Backend Issues
- **Database connection fails**: Check `appsettings.json` connection string and PostgreSQL service
- **EF migrations error**: Ensure `dotnet ef` tools installed: `dotnet tool install --global dotnet-ef`
- **Rate limiting blocks requests**: Wait 1 minute or adjust policy limits in settings
- **Logging not appearing**: Check Serilog config and Logs/ directory permissions

### Frontend Issues
- **API calls fail**: Verify backend is running and CORS is configured
- **SignalR connection fails**: Backend must be running; check `/hubs/notifications` endpoint
- **Cloudinary issues**: Verify credentials; ensure photo endpoint reachable

### AI Service Issues
- **Motivation empty**: Ensure FastAPI running on `http://127.0.0.1:8000`
- **GROQ key error**: Check `GROQ_API_KEY` environment variable set correctly
- **Model predictions fail**: Verify models trained; check WellTrackAI logs

---

## Future Enhancements
- Mobile app (React Native)
- Advanced workout metrics and form analysis
- Social features (friend connections, challenges)
- Wearable device integrations (Fitbit, Apple Watch, Garmin)
- Advanced predictive analytics using machine learning
- Push notifications for mobile
- Offline data sync capabilities
- Dark mode UI theme

---

## Contact & Support
For issues, feature requests, or contributions, please open an issue on the project repository.

---

**Last Updated**: April 2026
