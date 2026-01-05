# WellTrack

[![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)

WellTrack is a full-stack personal wellness platform that helps users track mood, sleep, steps, hydration, food, and habits while providing analytics, real-time notifications, admin management, and AI-assisted recommendations (via a FastAPI microservice).

---

## Features

### Authentication & Security
- Secure auth with **email OTP verification**, **JWT access/refresh tokens**, and **per-route rate limiting**.
- Forgot password → OTP verification → reset password.
- Change password inside Profile page.
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
- View and edit user profile fields (name, age, gender, weight, height, goals, bio)
- Profile photo upload + delete (Cloudinary)
- BMI calculated on UI if height + weight exist
- Admin profile view:
  - Admin fields are restricted; admin sees minimal account info

### Admin Portal
- Admin dashboard system-wide statistics:
  - total users
  - total mood entries
  - total sleep records
  - total steps records
  - total hydration records
  - total habit entries
  - total food entries
- User management:
  - list users
  - view user details and all tracker entries
  - edit tracker records per user (admin endpoints)
  - delete tracker entries per user
  - assign/remove Admin role
  - delete user

### Integrations & Logging
- Integrations:
  - USDA nutrition lookup
  - Cloudinary image uploads
  - SMTP email (OTP, password reset)
  - Groq API (used by AI service via `GROQ_API_KEY`)
- Structured logging with **Serilog**:
  - console + rolling file logs in `Backend/WellTrackAPI/Logs/`

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

##AI service setup:

1) Add Groq Key in WellTrackAI/.env:
```bash
GROQ_API_KEY="YOUR_KEY_HERE"
```

2) Rum the AI service:
```bash
cd WellTrackAI
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
3) Ensure backends point to AI base URL:
```bash
"MotivationAI": {
  "BaseUrl": "http://127.0.0.1:8000"
}
```


