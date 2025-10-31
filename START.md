# 🚀 Quick Start - Certificate Generator

## ✅ Project is READY!

Both frontend and backend are running!

## 📍 Current Status

- ✅ Backend: Running on http://localhost:5000
- ✅ Frontend: Running on http://localhost:3000
- ✅ Database: Connected to PostgreSQL
- ✅ Tables: Auto-initialized

## 🎯 Next Steps

### 1. Open the Application

Open your browser and go to:
```
http://localhost:3000
```

### 2. Create Your First Admin User

Open PowerShell or CMD and run:

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/auth/register -Method POST -ContentType "application/json" -Body '{"username":"admin","email":"admin@example.com","password":"admin123"}' -UseBasicParsing
```

Or with curl:
```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```

### 3. Login

Go to http://localhost:3000/login
- Username: `admin`
- Password: `admin123`

### 4. Upload Your First Template

1. Click "Manage Templates"
2. Click "Upload Template"
3. Upload the example from `examples/sample-template.svg`
4. Name it "Sample Certificate"

### 5. Add a Recipient

Add someone to the allowed recipients list:

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/allowed-recipients -Method POST -ContentType "application/json" -Body '{"name":"John Doe","email":"john@example.com","event":"Test Event 2024"}' -UseBasicParsing
```

### 6. Generate Your First Certificate!

1. Go to "Generate Certificate"
2. Select "Sample Certificate" template
3. Enter:
   - Name: John Doe
   - Email: john@example.com
   - Event: Test Event 2024
4. Click "Generate Certificate"
5. 🎉 Your certificate will download!

## 🔧 Troubleshooting

### Frontend shows errors?

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check console for errors (F12)

### Backend not running?

Check if port 5000 is in use:
```powershell
netstat -ano | findstr :5000
```

Kill if needed:
```powershell
taskkill /PID <process_id> /F
```

Then restart:
```powershell
cd backend
npm run dev
```

### Database connection issues?

1. Verify PostgreSQL is running
2. Check credentials in backend/.env
3. Create database if missing:
```bash
createdb certificate_generator
```

## 📚 Documentation

- **README.md** - Full documentation
- **QUICKSTART.md** - Quick setup guide  
- **ARCHITECTURE.md** - Technical details
- **INSTALL.md** - Installation instructions

## 🎓 Features Available

✅ Template upload (SVG with placeholders)
✅ Certificate generation
✅ QR code verification
✅ PDF download
✅ Admin dashboard
✅ Email delivery (optional)
✅ S3 storage (optional)

## 🆘 Need Help?

Check the documentation files or restart the servers:

**Restart Backend:**
```powershell
cd backend
npm run dev
```

**Restart Frontend:**
```powershell
cd frontend  
npm run dev
```

Happy certifying! 🎉

