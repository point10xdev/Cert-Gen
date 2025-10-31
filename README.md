# Certificate Generator

Automated Certificate Generator web application built with React, Node.js, Express, and PostgreSQL. Generate personalized PDF certificates with embedded QR codes for verification.

## Features

- 📄 Upload SVG templates with placeholder support
- ✨ Generate personalized PDF certificates
- 🔐 QR code verification for authenticity
- 📧 Email delivery with PDF attachments
- 👥 Admin dashboard for template management
- 🔒 JWT-based authentication
- ☁️ S3 cloud storage integration
- 📊 Bulk generation support

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- React Router
- Axios
- React Hot Toast

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Puppeteer (PDF generation)
- QRCode (verification codes)
- Nodemailer (email delivery)
- AWS S3 (storage)
- JWT (authentication)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- AWS S3 bucket (optional, for cloud storage)
- SMTP email account (Gmail recommended)

## Installation

### Quick Setup (Recommended)

**Windows:**
```bash
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

Or manually:

### 1. Install Dependencies

**From project root:**
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb certificate_generator
```

Or using psql:
```sql
CREATE DATABASE certificate_generator;
```

### 3. Configure Environment

Backend `.env` will be created automatically. Update with your settings:

```bash
# Edit backend/.env
DB_PASSWORD=your_password
JWT_SECRET=change-this-to-a-random-string
```

## Configuration

### Backend Environment Variables

```env
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=certificate_generator
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `SMTP_PASS`

### AWS S3 Setup (Optional)

If you want cloud storage:

1. Create an S3 bucket
2. Configure IAM user with S3 upload permissions
3. Add credentials to `.env`

## Running the Application

### Development Mode

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Production Mode

Build and start:

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Usage

### 1. Create Admin User

First, register an admin user via the backend API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"securepassword"}'
```

### 2. Login

Navigate to `http://localhost:3000/login` and login with your credentials.

### 3. Upload Template

1. Go to "Manage Templates"
2. Upload an SVG template with placeholders
3. Use `{{NAME}}`, `{{EVENT}}`, etc. as placeholders

Example SVG:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <text x="400" y="300" text-anchor="middle" font-size="24">
    Certificate for {{NAME}}
  </text>
  <text x="400" y="350" text-anchor="middle" font-size="18">
    Event: {{EVENT}}
  </text>
</svg>
```

### 4. Add Recipients

Before generating certificates, add recipients to the allowed list:

```bash
curl -X POST http://localhost:5000/api/allowed-recipients \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","event":"Hackathon 2024"}'
```

### 5. Generate Certificate

1. Go to "Generate Certificate"
2. Select template
3. Fill recipient details
4. Click "Generate"
5. Certificate downloads automatically

### 6. Verify Certificate

Share the verification URL:
```
http://localhost:3000/verify/<verification_code>
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Templates
- `GET /api/template` - List templates (admin)
- `POST /api/template/upload` - Upload template (admin)
- `GET /api/template/:id` - Get template details

### Generation
- `POST /api/generate` - Generate certificate
- `POST /api/generate/bulk` - Bulk generation

### Verification
- `GET /api/verify/:code` - Verify certificate

### Recipients
- `GET /api/allowed-recipients` - List recipients
- `POST /api/allowed-recipients` - Add recipient

## Project Structure

```
Certificate-Generator/
├── backend/
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── services/      # API services
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Placeholder System

Templates support dynamic placeholders:
- `{{NAME}}` - Recipient name
- `{{EVENT}}` - Event name
- `{{EMAIL}}` - Recipient email
- Custom placeholders via metadata

## Troubleshooting

### PDF Generation Issues

If Puppeteer fails:
- Install Chromium dependencies
- Check `puppeteer` installation

### Email Not Sending

- Verify SMTP credentials
- Check Gmail App Password
- Review firewall/network settings

### Database Connection

- Ensure PostgreSQL is running
- Check connection credentials
- Verify database exists

## Security Notes

- Never commit `.env` files
- Use strong JWT secrets
- Enable HTTPS in production
- Implement rate limiting
- Validate all inputs

## License

MIT

## Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

## Support

For issues or questions, please open an issue on the repository.

