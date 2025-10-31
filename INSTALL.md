# Installation Guide

## Prerequisites

Make sure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **npm or yarn** - Comes with Node.js

Verify installations:
```bash
node --version    # Should show v18.0.0 or higher
npm --version     # Should show 9.0.0 or higher
psql --version    # Should show PostgreSQL 12+
```

## Installation Methods

### Method 1: Automated Setup (Recommended)

**Windows:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Method 2: Manual Setup

#### Step 1: Install Dependencies

```bash
# Install root dependencies (if using root package.json with scripts)
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

#### Step 2: Create PostgreSQL Database

**Option A: Command Line**
```bash
createdb certificate_generator
```

**Option B: psql**
```bash
psql postgres
CREATE DATABASE certificate_generator;
\q
```

**Option C: pgAdmin**
1. Open pgAdmin
2. Right-click "Databases"
3. Create → Database
4. Name: `certificate_generator`
5. Save

#### Step 3: Configure Environment Variables

**Backend (.env):**

Create `backend/.env`:

```env
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=certificate_generator
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT - CHANGE THIS IN PRODUCTION!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# SMTP (Optional - for email delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# AWS S3 (Optional - for cloud storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Verification
VERIFICATION_SECRET=your-verification-secret-change-this
```

**Frontend (.env):**

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

#### Step 4: Create Admin User

Start the backend:

```bash
cd backend
npm run dev
```

In another terminal:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Or use Postman:
- Method: POST
- URL: http://localhost:5000/api/auth/register
- Body (JSON):
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123"
}
```

## Running the Application

### Development Mode

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

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Using Root Scripts

If you have `concurrently` installed in root:

```bash
npm run dev
```

This runs both frontend and backend simultaneously.

## Verification

1. Open browser: http://localhost:3000
2. You should see the login page
3. Login with credentials created in Step 4
4. You should see the dashboard

## Optional: Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use this password in `SMTP_PASS`

### Other SMTP Providers

Update these in `backend/.env`:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

Common providers:
- **Outlook:** smtp-mail.outlook.com:587
- **SendGrid:** smtp.sendgrid.net:587
- **Mailgun:** smtp.mailgun.org:587

## Optional: AWS S3 Setup

### Create S3 Bucket

1. Log in to AWS Console
2. Go to S3
3. Create bucket
4. Set permissions:
   - Block public access: OFF
   - Add bucket policy for public read

### Create IAM User

1. Go to IAM → Users
2. Create user with programmatic access
3. Attach policy: AmazonS3FullAccess
4. Save Access Key ID and Secret Access Key

### Configure

Add to `backend/.env`:
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## Troubleshooting

### Database Connection Failed

**Problem:** "Database connection error"

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Windows
   net start postgresql-x64-14
   
   # Linux/Mac
   sudo systemctl start postgresql
   ```

2. Verify credentials in `backend/.env`

3. Test connection:
   ```bash
   psql -U postgres -d certificate_generator -c "SELECT NOW();"
   ```

### Port Already in Use

**Problem:** "Port 5000 already in use"

**Solutions:**
1. Change port in `backend/.env`:
   ```env
   PORT=5001
   ```

2. Update `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5001
   ```

3. Or kill the process using port 5000

### PDF Generation Fails

**Problem:** Puppeteer errors

**Solutions:**
1. Puppeteer downloads Chromium on first run (wait 1-2 minutes)

2. Install system dependencies:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install -y libgbm-dev libnss3
   
   # macOS
   brew install chromium
   ```

### Module Not Found Errors

**Problem:** "Cannot find module"

**Solutions:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

### Environment Variables Not Loading

**Problem:** "undefined" in logs

**Solutions:**
1. Check `.env` file exists in correct location
2. Verify no syntax errors in `.env`
3. Restart the dev server

## Next Steps

After successful installation:

1. ✅ Read [QUICKSTART.md](QUICKSTART.md) for basic usage
2. ✅ Check [README.md](README.md) for full documentation
3. ✅ Upload your first template from [examples/](examples/)
4. ✅ Generate a test certificate

## Production Deployment

For production deployment:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

3. Set `NODE_ENV=production` in environment

4. Use a process manager (PM2, systemd, etc.)

5. Set up reverse proxy (nginx, Apache)

6. Enable HTTPS with SSL certificate

7. Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)

For detailed deployment instructions, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Support

If you encounter issues:

1. Check [README.md](README.md) troubleshooting section
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system details
3. Check logs for error messages
4. Verify all prerequisites are installed
5. Ensure database is accessible

Happy coding! 🚀

