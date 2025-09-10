# Black Tie Menswear - Production Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- GitHub account with access to the repository: `https://github.com/blacktierob/internal-tool.git`
- Vercel account (recommended) or alternative deployment platform
- Supabase project with production database

### 1. Environment Configuration

Copy `.env.production` and update with your production values:

```bash
# Production Environment Configuration
VITE_SUPABASE_URL=https://your-production-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_ENV=production

# Error Monitoring (Optional but Recommended)
VITE_SENTRY_DSN=your-sentry-dsn-here

# Analytics (Optional)
VITE_POSTHOG_KEY=your-posthog-key-here
VITE_POSTHOG_HOST=https://app.posthog.com

# Security Configuration
VITE_SECURE_MODE=true
VITE_ENABLE_LOGGING=false
```

### 2. Deploy to Vercel (Recommended)

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import from GitHub: `blacktierob/internal-tool`
4. Add environment variables from your production config
5. Deploy

#### Option B: Deploy via CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
npm run deploy
```

### 3. Post-Deployment Setup

#### Database Migration
Ensure your Supabase database has the latest schema:
```bash
# Using Supabase CLI (if available)
supabase db push

# Or manually run migrations in Supabase dashboard
```

#### SSL Certificate
Vercel automatically provides SSL certificates. Ensure HTTPS is enabled.

#### Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Go to Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

## 🔧 Build Configuration

### Build Scripts
- `npm run build` - Standard production build (without TypeScript checking)
- `npm run build:with-types` - Production build with TypeScript validation
- `npm run build:production` - Production build with NODE_ENV=production

### Bundle Analysis
The current build outputs approximately:
- **Total Size**: ~1.2MB (gzipped: ~370KB)
- **Main Bundle**: ~504KB (gzipped: ~166KB)
- **Vendor Chunks**: Properly split for caching

### Performance Optimizations Included
- ✅ Automatic code splitting
- ✅ Vendor chunk separation
- ✅ Asset optimization
- ✅ Gzip compression
- ✅ Lazy loading of routes
- ✅ Optimized dependency bundling

## 🛡️ Security Configuration

### Environment Security
- All sensitive data is stored in environment variables
- No secrets are committed to the repository
- Production mode disables debug features

### Content Security Policy
The application includes security headers via `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=63072000

### Supabase Security
- Row Level Security (RLS) policies are enabled
- Anonymous access is controlled via API keys
- All data access is audited via activity logs

## 📊 Monitoring & Analytics

### Error Monitoring (Sentry)
If `VITE_SENTRY_DSN` is configured:
- Automatic error reporting
- Performance monitoring
- Session replays (with privacy controls)
- Error filtering for production

### Analytics (PostHog)
If `VITE_POSTHOG_KEY` is configured:
- User behavior tracking
- Feature usage analytics
- Custom event tracking
- Privacy-first approach

### Application Monitoring
- Built-in activity logging system
- User action audit trails
- Database operation tracking
- Performance metrics via browser tools

## 🔄 CI/CD Pipeline

### Automatic Deployment
The repository is configured for automatic deployment:
- Pushes to `master` branch trigger production builds
- Pull requests trigger preview deployments
- Build status is reported back to GitHub

### Manual Deployment
```bash
# Build locally
npm run build:production

# Deploy to Vercel
vercel --prod

# Or deploy to other platforms
# Copy dist/ folder contents to your hosting provider
```

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved (use `npm run typecheck`)
- [ ] ESLint warnings addressed (use `npm run lint`)
- [ ] Code formatted (use `npm run format`)
- [ ] Build completes successfully (`npm run build`)

### Configuration
- [ ] Production environment variables set
- [ ] Supabase production database configured
- [ ] Authentication working with production data
- [ ] All API endpoints accessible

### Testing
- [ ] Login functionality works with production PINs
- [ ] Customer management operations function
- [ ] Order creation and management work
- [ ] Dashboard displays correct data
- [ ] All navigation works correctly
- [ ] Responsive design tested on mobile/tablet
- [ ] Print functionality works (if applicable)

### Security
- [ ] No development credentials in production
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Database access properly secured

### Performance
- [ ] Build size acceptable (<2MB total)
- [ ] Page load times under 3 seconds
- [ ] Images and assets optimized
- [ ] Caching headers configured

## 🐛 Troubleshooting

### Common Deployment Issues

#### Build Fails
```bash
# Check TypeScript errors
npm run typecheck

# Check for missing dependencies
npm install

# Clear build cache
rm -rf dist node_modules package-lock.json
npm install
```

#### Environment Variables Not Loading
- Ensure variables are prefixed with `VITE_`
- Check Vercel dashboard environment variable configuration
- Verify variables are set for production environment

#### Database Connection Issues
- Verify Supabase URL and key are correct
- Check network connectivity to Supabase
- Ensure RLS policies allow access

#### Authentication Problems
- Verify PIN codes exist in production database
- Check user table structure matches expected format
- Ensure localStorage is working in production

### Support Resources
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- React Documentation: https://react.dev/
- Mantine UI Documentation: https://mantine.dev/

## 📈 Production Monitoring

### Key Metrics to Monitor
- User login success rate
- Page load performance
- Database query performance
- Error rates and types
- User engagement metrics

### Recommended Tools
- Vercel Analytics (built-in)
- Sentry for error monitoring
- PostHog for user analytics
- Supabase dashboard for database metrics

## 🔐 Backup & Recovery

### Database Backups
Supabase provides automatic backups, but consider:
- Regular manual exports of critical data
- Testing backup restoration procedures
- Documenting data recovery processes

### Application Recovery
- Source code is backed up in GitHub
- Deployment can be restored from any commit
- Environment configuration should be documented
- Consider having staging environment for testing

---

## 🎯 Quick Start Commands

```bash
# Clone repository
git clone https://github.com/blacktierob/internal-tool.git
cd internal-tool

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npm run deploy
```

## 📞 Support

For deployment issues or questions:
1. Check this documentation first
2. Review GitHub Issues
3. Contact the development team
4. Check Vercel/Supabase status pages

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Environment**: Production Ready