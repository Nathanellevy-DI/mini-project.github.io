# Secure Collaborative Storytelling App

A full-stack collaborative storytelling application built with the PERN stack (PostgreSQL, Express, React, Node.js) and TypeScript, featuring enterprise-grade security.

## 🔒 Security Features

- **Rate Limiting**: IP-based and user-based rate limiting on all endpoints
- **Input Validation**: Strict schema validation using Zod
- **Secure Authentication**: JWT access tokens + HTTP-only refresh cookies
- **Password Security**: Bcrypt hashing with 12 rounds
- **SQL Injection Prevention**: Parameterized queries
- **Security Headers**: Helmet.js middleware
- **CORS Protection**: Restricted to frontend origin only

## 🚀 Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (Render)
- JWT + bcrypt
- Zod validation
- express-rate-limit + Helmet

### Frontend
- React 18 + TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS + daisyUI
- Axios with interceptors

## 📦 Project Structure

```
Story-Telling-App/
├── backend/          # Express API server
├── frontend/         # React application
├── shared/           # Shared TypeScript types
└── package.json      # Root workspace config
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use Render)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Nathanellevy-DI/mini-project.github.io.git
cd Story-Telling-App
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and JWT secrets
```

4. **Set up database**
```bash
npm run db:setup --workspace=backend
```

5. **Start development servers**
```bash
# From root directory
npm run dev

# Or separately:
npm run dev:backend  # Runs on http://localhost:5000
npm run dev:frontend # Runs on http://localhost:5173
```

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
BCRYPT_ROUNDS=12
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Stories
- `GET /api/stories` - Get all accessible stories
- `GET /api/stories/:id` - Get single story
- `POST /api/stories` - Create new story
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story
- `POST /api/stories/:id/collaborators` - Add collaborator
- `DELETE /api/stories/:id/collaborators/:userId` - Remove collaborator

### Comments
- `GET /api/stories/:storyId/comments` - Get story comments
- `POST /api/stories/:storyId/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

## 🚢 Deployment

### Backend (Render.com)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install && npm run build --workspace=backend`
   - Start Command: `npm start --workspace=backend`
4. Add environment variables from `.env`
5. Use internal DATABASE_URL for production

### Frontend (Render Static Site / Vercel)

1. Build the frontend:
```bash
npm run build --workspace=frontend
```

2. Deploy the `frontend/dist` directory

## 🧪 Testing

### Manual API Testing
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

## 📝 Features

- ✅ User authentication with JWT
- ✅ Create, read, update, delete stories
- ✅ Public and private stories
- ✅ Collaborator system (editors and viewers)
- ✅ Comments on stories
- ✅ Automatic token refresh
- ✅ Rate limiting protection
- ✅ Input validation and sanitization

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS in production** - Handled by Render
4. **Regular dependency updates** - Run `npm audit` regularly
5. **Monitor rate limits** - Adjust based on traffic

## 📄 License

ISC

## 👨‍💻 Author

Built with security-first principles following OWASP guidelines.
