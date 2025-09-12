# Backend API - Hustle Competition Platform

RESTful API for the Hustle Competition Platform built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `config.env`:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hustle_competition
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5175
```

### 3. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register team
- `POST /api/auth/login` - Login team
- `GET /api/auth/profile` - Get profile (Auth required)
- `PUT /api/auth/profile` - Update profile (Auth required)
- `PUT /api/auth/change-password` - Change password (Auth required)
- `POST /api/auth/logout` - Logout (Auth required)

### Competition
- `GET /api/competition/leaderboard` - Get leaderboard
- `GET /api/competition/stats` - Get stats
- `GET /api/competition/status` - Get team status (Auth required)
- `PUT /api/competition/status` - Update status (Auth required)

### Health
- `GET /api/health` - Health check

## 🗄️ Database

MongoDB with Mongoose ODM. Main collection: `teams`

## 🛡️ Security

- JWT authentication
- Password hashing with bcrypt
- Input validation
- Rate limiting
- CORS protection
- Helmet security headers

## 📁 Structure

```
backend/
├── controllers/     # Route handlers
├── middleware/      # Auth, validation, error handling
├── models/         # Database schemas
├── routes/         # API routes
├── config/         # Database configuration
└── server.js       # Main server file
```