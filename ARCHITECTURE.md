# Architecture Overview

## System Architecture

```
┌─────────────────┐
│   React App     │
│   (Port 3000)   │
└────────┬────────┘
         │ HTTP/REST API
         ▼
┌─────────────────┐
│  Express API    │
│   (Port 5000)   │
└────────┬────────┘
         │
    ┌────┴─────┬──────────────┐
    ▼          ▼              ▼
┌────────┐ ┌────────┐ ┌──────────────┐
│Postgres│ │  AWS   │ │   Puppeteer  │
│   DB   │ │   S3   │ │   + QRCode   │
└────────┘ └────────┘ └──────────────┘
```

## Component Breakdown

### Frontend (React + TypeScript)

**Pages:**
- `Login.tsx` - Admin authentication
- `Dashboard.tsx` - Main admin interface
- `TemplateManagement.tsx` - Upload/manage SVG templates
- `Generate.tsx` - Single certificate generation
- `Verify.tsx` - Public certificate verification

**Services:**
- `api.ts` - Axios instance with auth interceptors
- `authService.ts` - Login/logout/auth state
- `templateService.ts` - Template CRUD operations
- `generateService.ts` - Certificate generation API calls
- `verifyService.ts` - Verification API calls

### Backend (Node.js + Express + TypeScript)

**Routes:**
- `/api/auth/*` - Authentication endpoints
- `/api/template/*` - Template management
- `/api/generate/*` - Certificate generation
- `/api/verify/*` - Public verification
- `/api/allowed-recipients/*` - Recipient whitelist

**Services:**
- `pdfService.ts` - Puppeteer-based PDF generation
- `qrService.ts` - QR code generation and verification
- `mailService.ts` - Nodemailer email delivery
- `storageService.ts` - AWS S3 file uploads

**Middleware:**
- `auth.ts` - JWT verification and role-based access

**Database Models:**
- `users` - Admin accounts
- `templates` - SVG templates with placeholders
- `allowed_recipients` - Whitelisted recipients
- `certificates` - Generated certificates

## Data Flow

### Certificate Generation Flow

```
1. User uploads SVG template
   └─> Extracts placeholders ({{NAME}}, {{EVENT}})
   └─> Stores in templates table

2. Admin enters recipient info
   └─> Verifies against allowed_recipients
   └─> POST /api/generate

3. Backend processing
   ├─> Fetch template SVG
   ├─> Replace placeholders
   ├─> Generate verification code (UUID)
   ├─> Create QR code (embeds verification URL)
   ├─> Inject QR into SVG
   ├─> Convert SVG → PDF (Puppeteer)
   ├─> Upload PDF to S3
   ├─> Save record to certificates table
   └─> Send email (optional)

4. Response
   ├─> Download PDF
   └─> Store verification_code

5. Verification
   └─> GET /api/verify/:code
       ├─> Lookup certificate
       ├─> Mark as verified
       └─> Return certificate details
```

## Database Schema

```sql
-- Users (Admin accounts)
users (
  id, username, email, password (hashed), role, created_at
)

-- Certificate templates
templates (
  id, name, svg_content, placeholders[], file_url, created_by, created_at
)

-- Allowed recipients (whitelist)
allowed_recipients (
  id, name, email, event, metadata (JSON), created_at
)

-- Generated certificates
certificates (
  id,
  verification_code (unique),
  recipient_name,
  recipient_email,
  template_id (FK),
  file_url,
  qr_code_url,
  metadata (JSON),
  issued_at,
  verified_at,
  is_verified (boolean)
)
```

## Security Features

1. **Authentication**
   - JWT tokens
   - Bcrypt password hashing
   - Role-based access control

2. **Verification**
   - UUID generation for codes
   - HMAC/SHA256 hashing
   - Database integrity checks

3. **Recipient Validation**
   - Whitelist system
   - Email verification
   - Prevents unauthorized generation

4. **File Security**
   - Temporary file cleanup
   - S3 ACL configuration
   - Secure file URLs

## Environment Variables

**Backend (.env):**
```env
# Database
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# Security
JWT_SECRET
VERIFICATION_SECRET

# Email
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

# Storage
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET

# URLs
FRONTEND_URL
```

**Frontend (.env):**
```env
VITE_API_URL
```

## API Endpoints

### Public
- `GET /health` - Health check
- `GET /api/verify/:code` - Verify certificate
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Protected (Admin)
- `GET /api/template` - List templates
- `POST /api/template/upload` - Upload template
- `GET /api/template/:id` - Get template
- `POST /api/generate` - Generate certificate
- `POST /api/generate/bulk` - Bulk generation
- `GET /api/allowed-recipients` - List recipients
- `POST /api/allowed-recipients` - Add recipient

## Deployment Architecture

### Development
```
npm run dev
├─> Backend: localhost:5000
└─> Frontend: localhost:3000 (proxy → 5000)
```

### Production
```
Frontend Build → Static hosting (Vercel/Netlify)
Backend → Server (AWS/Railway/Heroku)
Database → Managed PostgreSQL
Storage → AWS S3
Email → Gmail SMTP
```

## Scalability Considerations

1. **Database**
   - Add indexes on `verification_code`, `email`, `template_id`
   - Consider partitioning for high volume

2. **File Storage**
   - CDN for S3 assets
   - Lazy loading for templates

3. **Generation Queue**
   - Redis queue for bulk operations
   - Worker processes for PDF generation

4. **Caching**
   - Template caching
   - API response caching

## Technology Choices

**Why Puppeteer?**
- Excellent SVG → PDF conversion
- Reliable rendering
- Supports HTML templates

**Why PostgreSQL?**
- ACID compliance
- JSONB support
- Excellent performance
- Relational data benefits

**Why React?**
- Modern UI framework
- Component reusability
- Strong ecosystem

**Why Express?**
- Minimal, flexible
- Middleware support
- Great TypeScript support

## Future Enhancements

- [ ] Batch certificate generation UI
- [ ] Template preview before upload
- [ ] Custom QR code positioning
- [ ] Multiple language support
- [ ] Advanced analytics dashboard
- [ ] Webhook support
- [ ] Template marketplace
- [ ] API rate limiting
- [ ] Certificate expiry dates
- [ ] Blockchain verification

## Monitoring & Logging

Recommended tools:
- Winston (backend logging)
- Sentry (error tracking)
- DataDog/New Relic (APM)
- CloudWatch (AWS resources)

## Testing Strategy

```bash
# Unit tests
backend: Jest + Supertest
frontend: Vitest + React Testing Library

# Integration tests
API endpoints
Database operations

# E2E tests
Playwright/Cypress
User workflows
```

## Performance Metrics

Target metrics:
- PDF generation: < 5 seconds
- API response: < 500ms
- Page load: < 2 seconds
- Database queries: < 100ms

## Security Checklist

- [ ] JWT token expiration
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] HTTPS enforcement
- [ ] Secrets management
- [ ] Dependencies auditing
- [ ] Security headers

