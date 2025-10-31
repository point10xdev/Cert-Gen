# 🎉 Certificate Generator - Running Instructions

## ✅ GOOD NEWS! Your Project is Complete and Ready!

I've set up everything for you. Here's how to use it.

## 🚀 Quick Start

### Step 1: Start Backend Server

Open **Terminal 1** (PowerShell or CMD):

```powershell
cd D:\FOSS\Certificate-Generator\backend
npm run dev
```

Wait for: `Server running on port 5000`

### Step 2: Start Frontend Server

Open **Terminal 2** (PowerShell or CMD):

```powershell
cd D:\FOSS\Certificate-Generator\frontend
npm run dev
```

Wait for: `Local: http://localhost:3000`

### Step 3: Open Browser

Go to: **http://localhost:3000**

## 🔐 Create Admin Account

Before you can login, create an admin user:

Open **Terminal 3** (PowerShell):

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/auth/register -Method POST -ContentType "application/json" -Body '{"username":"admin","email":"admin@example.com","password":"admin123"}' -UseBasicParsing
```

You should see: `{"user":{"id":1,"username":"admin",...}}`

## 🎯 Use the Application

1. **Login** at http://localhost:3000
   - Username: `admin`
   - Password: `admin123`

2. **Upload Template** 
   - Go to "Manage Templates"
   - Upload `examples/sample-template.svg`

3. **Add Recipient**
   ```powershell
   Invoke-WebRequest -Uri http://localhost:5000/api/allowed-recipients -Method POST -ContentType "application/json" -Body '{"name":"John Doe","email":"john@example.com","event":"Test Event"}' -UseBasicParsing
   ```

4. **Generate Certificate**
   - Go to "Generate Certificate"
   - Fill in details
   - Click Generate
   - PDF downloads! 🎉

## 📂 Project Structure

```
Certificate-Generator/
├── backend/          ← Node.js + Express API
│   └── src/
│       ├── routes/   ← API endpoints
│       ├── services/ ← PDF, QR, Email logic
│       └── config/   ← Database setup
├── frontend/         ← React + TypeScript UI
│   └── src/
│       ├── pages/    ← Login, Dashboard, etc.
│       └── services/ ← API calls
└── examples/         ← Sample SVG templates
```

## 🎓 What's Included

✅ **Backend (Port 5000)**
- Express + TypeScript server
- PostgreSQL database
- JWT authentication
- PDF generation (Puppeteer)
- QR code generation
- Email delivery
- File storage

✅ **Frontend (Port 3000)**
- React + TypeScript UI
- Admin dashboard
- Template management
- Certificate generation
- Public verification page

✅ **Features**
- SVG template upload
- Placeholder replacement
- PDF generation
- QR verification codes
- Email delivery
- Secure authentication

## ⚙️ Configuration

### Backend (.env)

You can create `backend/.env` with these settings (optional):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=certificate_generator
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=change-this-to-random-string

SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Defaults work for local development!

### Frontend (.env)

Create `frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Can't connect to database?

Make sure PostgreSQL is running and database exists:

```powershell
# Create database if missing
createdb certificate_generator

# Or using psql
psql -U postgres -c "CREATE DATABASE certificate_generator;"
```

### Port already in use?

Kill the process:
```powershell
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### Frontend shows errors?

1. Clear browser cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+F5
3. Check browser console: F12

### Puppeteer issues?

Puppeteer might be slow on first run. Wait 1-2 minutes for Chromium download.

## 📚 Documentation

- **START.md** - Quick start guide
- **README.md** - Full documentation
- **QUICKSTART.md** - Detailed setup
- **ARCHITECTURE.md** - Technical details
- **INSTALL.md** - Installation guide

## 🎉 You're All Set!

Everything is ready to go. Just:

1. ✅ Start backend: `cd backend && npm run dev`
2. ✅ Start frontend: `cd frontend && npm run dev`
3. ✅ Open http://localhost:3000
4. ✅ Create admin account
5. ✅ Generate certificates!

Need help? Check the documentation files!

Happy certifying! 🎓✨

