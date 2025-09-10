# Black Tie Menswear - Internal Management System

> A comprehensive iPad-first web application for managing customers, orders, and wedding party fittings at Black Tie Menswear.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue)
![License](https://img.shields.io/badge/license-private-red)

## 🎯 Overview

Black Tie Menswear Internal Tool is a modern, responsive web application designed specifically for managing the day-to-day operations of a formal wear rental business. Built with React, TypeScript, and Supabase, it provides a seamless experience for staff to manage customers, orders, and wedding party fittings.

### Key Features

- 🔐 **PIN-Based Authentication** - Simple 4-digit PIN system for staff access
- 👥 **Customer Management** - Comprehensive customer profiles with order history
- 📋 **Order Management** - Two-stage order process: groom appointments and group fittings
- 👔 **Garment & Sizing** - Complete outfit builder with measurements tracking
- 📊 **Real-time Dashboard** - KPIs, upcoming functions, and activity monitoring
- 📱 **iPad-First Design** - Optimized for iPad use with touch-friendly interactions
- 🔍 **Advanced Search** - Powerful search and filtering across all data
- 📈 **Activity Logging** - Complete audit trail of all user actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/blacktierob/internal-tool.git
cd internal-tool

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Visit `http://localhost:5174` to access the application.

### Default Login

Use PIN: `1234` (test account) to access the system in development.

## 🏗️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Mantine UI** - Complete React components library
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security** - Database-level security policies
- **Real-time subscriptions** - Live data updates

### Development & Deployment
- **ESLint & Prettier** - Code quality and formatting
- **Vercel** - Production deployment platform
- **GitHub Actions** - CI/CD pipeline
- **Sentry** - Error monitoring and performance tracking
- **PostHog** - Product analytics and user insights

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Generic components
│   ├── customers/    # Customer-specific components
│   ├── orders/       # Order management components
│   └── garments/     # Garment and sizing components
├── pages/            # Page components and routing
├── hooks/            # Custom React hooks
├── services/         # API services and business logic
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and helpers
└── assets/           # Static assets and styles
```

## 📊 Features Overview

### Dashboard
- Real-time KPI widgets (orders, customers, revenue)
- Today's functions with progress tracking
- Recent activity feed
- Upcoming events calendar

### Customer Management
- Customer profiles with contact information
- Order history and relationship tracking
- Advanced search and filtering
- Quick customer creation

### Order Management
**Stage 1: Groom Appointment**
- Basic order information and wedding details
- Groom's outfit selection and measurements
- Initial order setup

**Stage 2: Wedding Party Fittings**
- Add wedding party members
- Individual outfit selection for each member
- Complete measurement collection
- Progress tracking

### Garment System
- Comprehensive garment categories
- Size management with measurement history
- Outfit builder with rental/purchase options
- Inventory integration ready

## 🔐 Authentication & Security

- PIN-based authentication system
- Session management with auto-timeout
- Row Level Security (RLS) policies in database
- Comprehensive activity logging
- HTTPS enforcement in production
- Content Security Policy headers

## 📱 Responsive Design

- **iPad-First**: Optimized for iPad Pro and standard iPad
- **Touch-Friendly**: Large touch targets and gestures
- **Mobile Support**: Works on iPhone and Android
- **Desktop Compatible**: Full functionality on desktop browsers

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:with-types # Build with TypeScript checking
npm run typecheck    # Run TypeScript validation
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run preview      # Preview production build
npm run deploy       # Deploy to production
```

### Environment Variables

Create `.env.local` with the following:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Environment
VITE_ENV=development

# Optional: Error Monitoring
VITE_SENTRY_DSN=your-sentry-dsn

# Optional: Analytics
VITE_POSTHOG_KEY=your-posthog-key
```

### Database Schema

The application uses Supabase with the following main tables:
- `users` - Staff authentication and profiles
- `customers` - Customer information and contacts
- `orders` - Order details and wedding information
- `order_members` - Wedding party members
- `member_garments` - Individual garment selections
- `member_sizes` - Measurement records
- `activity_logs` - Audit trail

## 🚀 Deployment

### Production Deployment

The application is configured for deployment on Vercel:

1. **Automatic Deployment**: Pushes to `main` branch deploy automatically
2. **Environment Configuration**: Set production environment variables in Vercel
3. **Custom Domain**: Configure custom domain in Vercel settings
4. **SSL Certificate**: Automatic HTTPS via Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Performance

- Build size: ~1.2MB (gzipped: ~370KB)
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Lighthouse Score: 95+ performance rating

## 📈 Monitoring & Analytics

### Error Monitoring (Sentry)
- Automatic error reporting
- Performance monitoring
- Session replays with privacy controls
- Real-time alerts

### Analytics (PostHog)
- User behavior tracking
- Feature usage analytics
- Custom event tracking
- Privacy-first approach

### Activity Logging
- Complete audit trail of user actions
- Database operation tracking
- User session monitoring

## 🤝 Contributing

This is a private internal application. For authorized contributors:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow existing component patterns
- Maintain responsive design principles
- Write meaningful commit messages
- Update documentation as needed

## 📋 Status & Roadmap

### Current Status: ✅ Production Ready

- [x] Core functionality complete
- [x] Authentication system implemented
- [x] Customer and order management
- [x] Responsive design optimized
- [x] Production deployment configured
- [x] Error monitoring and analytics
- [x] Security measures implemented

### Future Enhancements

- [ ] Advanced reporting features
- [ ] Inventory management integration
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Automated backup systems
- [ ] Multi-location support

## 🐛 Known Issues

- Some TypeScript strict mode warnings (non-blocking)
- Bundle size optimization opportunities
- Advanced search performance can be improved

See [Issues](https://github.com/blacktierob/internal-tool/issues) for current bug reports and feature requests.

## 📞 Support

For support and questions:
- Check the [Documentation](./docs/)
- Review [Deployment Guide](./DEPLOYMENT.md)
- Contact the development team
- Check system status pages

## 📄 License

This project is private and confidential. All rights reserved by Black Tie Menswear.

---

**Built with ❤️ for Black Tie Menswear**

*Last Updated: December 2024*
