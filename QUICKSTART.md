# Quick Start Guide

Get your Certificate Generator up and running in 5 minutes!

## Prerequisites Check

✅ Node.js 18+ installed  
✅ PostgreSQL installed and running  
✅ Git installed  

## Step-by-Step Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
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

**Backend** - Copy and edit `.env`:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
DB_PASSWORD=your_password
JWT_SECRET=change-this-to-a-random-string
```

For email (optional):
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Database connected successfully
Database initialized
Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open: http://localhost:3000

### 5. Create Your First Admin User

Open a new terminal and run:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"admin123"}'
```

### 6. You're Ready!

1. Login at http://localhost:3000/login
2. Go to "Manage Templates"
3. Upload an SVG template
4. Add recipients
5. Generate certificates!

## First Certificate Template

Create a simple SVG file (`template.svg`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" style="background:#fff">
  <rect width="800" height="600" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
  <text x="400" y="200" text-anchor="middle" font-size="48" font-weight="bold" fill="#667eea">
    Certificate of Participation
  </text>
  <text x="400" y="300" text-anchor="middle" font-size="32" fill="#333">
    This is to certify that
  </text>
  <text x="400" y="350" text-anchor="middle" font-size="36" font-weight="bold" fill="#764ba2">
    {{NAME}}
  </text>
  <text x="400" y="420" text-anchor="middle" font-size="24" fill="#666">
    has successfully completed
  </text>
  <text x="400" y="470" text-anchor="middle" font-size="28" font-weight="bold" fill="#667eea">
    {{EVENT}}
  </text>
</svg>
```

Save it and upload via the web interface!

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Database issues? Verify PostgreSQL is running: `pg_ctl status`
- Port conflicts? Change ports in `.env` (backend) and `vite.config.ts` (frontend)

## Next Steps

- Set up AWS S3 for cloud storage
- Configure SMTP for email delivery
- Customize the UI with your branding
- Add more placeholder types

Happy certifying! 🎓

