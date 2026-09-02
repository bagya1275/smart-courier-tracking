# Smart Courier Tracking & Delivery Route Management Platform

A full-stack courier management and parcel tracking platform with a glassmorphic frontend, Spring Boot REST API, JWT authentication, and **MongoDB Atlas** persistence.

## Architecture

```text
Browser
  ↓
Spring Boot 3 REST API + static frontend
  ↓
MongoDB Atlas
```

The application can also be run with the frontend separately during development. The production configuration is designed for a **single-service deployment**, where Spring Boot serves the frontend and API from the same host.


## FASTEST WAY TO RUN IN VS CODE

1. Make sure Java 17+ and Maven are installed.
2. Copy `.env.example` to `.env`.
3. In `.env`, set:
   - `MONGODB_URI` to your MongoDB Atlas connection string.
   - `JWT_SECRET` to a long random secret.
4. From the repository root, run:
   ```powershell
   .\RUN-BACKEND.ps1
   ```
   or double-click `RUN-BACKEND.bat`.
5. Open `http://localhost:8080/`.

**Important:** the frontend no longer falls back to mock/local data. Login, shipments, drivers, routes, deliveries, dashboard statistics, and other API-backed actions use the Spring Boot + MongoDB backend. This avoids a local demo appearing to work when Atlas is not connected.

The root `.env` is automatically loaded by Spring Boot for local development. Real credentials are ignored by Git.

## RENDER DEPLOYMENT — QUICK PATH

This project includes `render.yaml` and a Dockerfile for a single-service deployment.

1. Push the project to GitHub.
2. In Render, create a Web Service from the repository and use the included Dockerfile (or use the included Blueprint).
3. Set these environment variables in Render:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a strong random secret
   - `SEED_DEMO_DATA` = `true` for the demo accounts/data
   - `CORS_ALLOWED_ORIGINS` = `*` for the single-service deployment
4. Set the health check path to `/actuator/health`.
5. Deploy. The same service serves the UI and `/api/v1`, so no frontend URL needs to be changed.
6. In MongoDB Atlas Network Access, allow the deployment service to connect. For a quick academic deployment, Atlas may be configured to allow access from all IPs; for production, restrict access to the required deployment IP ranges where possible.

### Demo login

- Admin: `admin@courier.com` / `admin123`
- Driver: `driver@courier.com` / `driver123`
- Customer: `customer@courier.com` / `customer123`

## Features

- Role-based Admin, Driver, and Customer workspaces
- JWT authentication and registration
- Shipment creation, search, tracking, status updates, and deletion
- Driver roster and availability management
- Delivery assignment and milestone tracking
- Route management and shortest-path optimization simulation
- Dashboard statistics, activity feed, and charts
- Interactive Three.js 3D route visualization
- MongoDB Atlas persistence with indexed collections
- Demo data seeding on an empty database
- Production-safe environment variables for database and JWT secrets
- Health endpoint at `/actuator/health`
- Dockerfile for deployment

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2.3, Spring Security 6 |
| Database | MongoDB Atlas, Spring Data MongoDB |
| Authentication | JWT + BCrypt |
| Validation | Jakarta Bean Validation |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| 3D | Three.js |
| Charts | Chart.js |
| Deployment | Docker-compatible hosting |

## MongoDB Collections

The backend creates these collections automatically:

- `users`
- `drivers`
- `shipments`
- `routes`
- `deliveries`
- `database_sequences`

Unique indexes are enabled for usernames, emails, vehicle numbers, tracking IDs, and route codes.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas project and a free M0 cluster.
2. Create a database user.
3. Add the IP address used by your deployment platform to Atlas Network Access. For local testing, add your current IP.
4. Use a connection string with a database name, for example:

```text
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart_courier_db?retryWrites=true&w=majority&appName=SmartCourierCluster
```

If the password contains characters such as `@`, `:`, `/`, `?`, `#`, `%`, or `&`, URL-encode the password before placing it in the connection string.

## Environment Variables

Never commit real credentials. Copy `.env.example` as a reference and configure these variables in your deployment host:

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Long random JWT signing secret |
| `JWT_EXPIRATION_MS` | No | JWT lifetime; defaults to 24 hours |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated frontend origins |
| `SEED_DEMO_DATA` | No | Seeds demo records when database is empty; defaults to `true` |
| `PORT` | No | Server port; defaults to `8080` |

For a public production application, use a strong unique `JWT_SECRET` of at least 32 bytes and consider setting `SEED_DEMO_DATA=false` after creating your own users.

## Local Development

### Backend

From `backend/`:

```bash
mvn clean spring-boot:run
```

Before starting, set the required environment variables. On Windows PowerShell, for example:

```powershell
$env:MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart_courier_db?retryWrites=true&w=majority&appName=SmartCourierCluster"
$env:JWT_SECRET="REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS_LONG"
mvn clean spring-boot:run
```

The API runs on `http://localhost:8080`.

### Frontend separately

You can run the frontend with VS Code Live Server or:

```bash
cd frontend
python -m http.server 3000
```

For local development, the frontend automatically uses `http://localhost:8080/api/v1`.

## Production Deployment

### Recommended: one service

The project includes a root `Dockerfile`. Build and run it with:

```bash
docker build -t smart-courier .
docker run -p 8080:8080 \
  -e MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart_courier_db?retryWrites=true&w=majority&appName=SmartCourierCluster" \
  -e JWT_SECRET="YOUR_LONG_RANDOM_SECRET" \
  -e SEED_DEMO_DATA="true" \
  smart-courier
```

The same container serves both the frontend and API. Open:

```text
http://localhost:8080/
```

The frontend calls `/api/v1` on the same host, so no frontend API URL change is required.

### Docker-compatible cloud host

Create a web service from this repository and use the included `Dockerfile`. Configure the environment variables in the host's secret/environment-variable settings. Do not place `MONGODB_URI` or `JWT_SECRET` directly in source code.

Set the service health check to:

```text
/actuator/health
```

The application honors the hosting platform's `PORT` environment variable.

## Separate Frontend Deployment

If you deploy the frontend to a different domain, edit `frontend/js/config.js`:

```javascript
window.SMART_COURIER_API_BASE_URL = 'https://YOUR-BACKEND-DOMAIN/api/v1';
```

Then set the backend environment variable:

```text
CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND-DOMAIN
```

Use the exact frontend origin and do not add a trailing slash.

## Demo Accounts

When `SEED_DEMO_DATA=true` and the MongoDB database is empty:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@courier.com` | `admin123` |
| Driver | `driver@courier.com` | `driver123` |
| Customer | `customer@courier.com` | `customer123` |

These are demo credentials only. Do not use them for a real production system.

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/register` | Public |
| GET | `/api/v1/auth/me` | Authenticated |
| GET | `/api/v1/dashboard/stats` | Authenticated |
| GET | `/api/v1/shipments` | Authenticated |
| GET | `/api/v1/shipments/{id}` | Authenticated |
| GET | `/api/v1/shipments/track/{trackingId}` | Public |
| GET | `/api/v1/shipments/generate-tracking-id` | Authenticated |
| POST | `/api/v1/shipments` | Admin |
| PATCH | `/api/v1/shipments/{id}/status` | Admin/Driver |
| DELETE | `/api/v1/shipments/{id}` | Admin |
| GET | `/api/v1/routes` | Public |
| POST | `/api/v1/routes` | Admin |
| POST | `/api/v1/routes/{id}/optimize` | Admin/Driver |
| GET | `/api/v1/drivers` | Authenticated |
| POST | `/api/v1/drivers` | Admin |
| PATCH | `/api/v1/drivers/{id}/status` | Admin/Driver |
| DELETE | `/api/v1/drivers/{id}` | Admin |
| GET | `/api/v1/deliveries` | Authenticated |
| POST | `/api/v1/deliveries/assign` | Admin |
| PATCH | `/api/v1/deliveries/{id}/status` | Admin/Driver |
| GET | `/actuator/health` | Public |

## Important Deployment Notes

- The application no longer requires MySQL or H2.
- `schema.sql` and `data.sql` are intentionally removed; demo data is created by `DataSeeder` through MongoDB repositories.
- IDs remain numeric to preserve the existing frontend/API contract. A MongoDB-backed atomic sequence collection generates them safely.
- Related records use MongoDB `DBRef` references instead of relational foreign keys.
- Production frontend requests do not silently fall back to the local mock data store. This prevents a deployed application from appearing functional while database/API requests are actually failing.
- Keep MongoDB Atlas Network Access restricted to the IPs required by your local machine and deployment service whenever possible.
