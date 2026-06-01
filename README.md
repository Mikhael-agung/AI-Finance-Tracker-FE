# 🎯 AI Finance Tracker - Frontend

A modern, intelligent financial management application built with Next.js and TypeScript. This frontend application helps users track their finances with AI-powered insights and beautiful, responsive UI.

**Live Demo:** https://ai-finance-tracker-fe.vercel.app

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Available Scripts](#available-scripts)
- [Key Dependencies](#key-dependencies)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## 🌟 Overview

AI Finance Tracker is a comprehensive financial management solution that combines modern web technologies with AI capabilities to provide users with intelligent financial insights and tracking tools. The frontend is built with a focus on user experience, accessibility, and performance.

**Main Features:**
- 💰 Track income and expenses
- 📊 AI-powered financial analytics
- 🎨 Beautiful, responsive UI with dark mode support
- 🔐 Secure authentication with Supabase
- 📱 Mobile-friendly design
- ⚡ Real-time data updates

---

## ✨ Features

### Financial Management
- **Expense Tracking**: Categorize and track all your expenses
- **Income Management**: Monitor all income sources
- **Budget Planning**: Set and track budgets for different categories
- **Financial Reports**: View detailed financial analytics and charts

### AI Capabilities
- **Smart Insights**: AI-generated financial recommendations
- **Pattern Analysis**: Automatic detection of spending patterns
- **Predictive Analytics**: Forecast future financial trends
- **Personalized Suggestions**: Get tailored financial advice

### User Experience
- **Dark Mode**: Beautiful dark theme support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant data synchronization
- **Smooth Animations**: Framer Motion powered interactions
- **Accessibility**: Built with accessibility in mind using Radix UI components

---

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15.5**: React framework with built-in optimization and routing
- **React 18.2**: UI library with hooks support
- **TypeScript 5**: Type-safe development

### Styling & UI
- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible component primitives
- **Framer Motion**: Animation library for smooth interactions
- **Lucide React**: Icon library

### State Management & Forms
- **Zustand**: Lightweight state management
- **React Hook Form**: Efficient form management
- **React Table**: Advanced table component

### Backend Integration
- **Supabase**: Backend-as-a-service for authentication and database
- **Supabase SSR**: Server-side rendering support

### Additional Tools
- **Zod**: TypeScript-first schema validation
- **date-fns**: Modern date utility library
- **Recharts**: Composable charting library
- **Sonner**: Toast notifications
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional CSS classname utility

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher
- **npm** or **yarn**: Package manager
- **Git**: Version control

### System Requirements
- RAM: 2GB minimum
- Storage: 500MB minimum for node_modules
- OS: Windows, macOS, or Linux

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Mikhael-agung/AI-Finance-Tracker-FE.git
cd AI-Finance-Tracker-FE
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables) section)

### 4. Verify Installation

```bash
npm run lint
```

---

## 🎯 Getting Started

### Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The page auto-updates as you edit files thanks to Next.js hot module replacement.

### Build for Production

```bash
npm run build
```

### Start Production Server

After building:

```bash
npm start
```

---

## 📁 Project Structure

```
AI-Finance-Tracker-FE/
├── app/                      # Next.js app directory (routes)
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page
│   ├── (auth)/              # Authentication-related pages
│   ├── (dashboard)/         # Dashboard pages
│   └── api/                 # API routes
│
├── components/              # React components
│   ├── ui/                  # Reusable UI components (buttons, cards, etc.)
│   ├── forms/               # Form components
│   ├── dashboard/           # Dashboard-specific components
│   └── layout/              # Layout components (header, sidebar, etc.)
│
├── lib/                     # Utility functions and helpers
│   ├── supabase.ts          # Supabase client configuration
│   ├── utils.ts             # General utilities
│   └── constants.ts         # Application constants
│
├── types/                   # TypeScript type definitions
│   ├── index.ts             # Main type exports
│   ├── database.ts          # Database-related types
│   └── api.ts               # API-related types
│
├── styles/                  # Global styles
│   └── globals.css          # Global CSS
│
├── public/                  # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── middleware.ts            # Next.js middleware (auth, redirects, etc.)
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── components.json          # Shadcn/ui configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file

```

---

## ⚙️ Configuration

### Next.js Configuration

The `next.config.js` file contains Next.js-specific configuration for:
- Image optimization
- Build optimization
- Environment-specific settings

### Tailwind CSS

Configuration in `tailwind.config.js`:
- Custom theme colors and spacing
- Custom font families
- Plugin setup
- Animation configurations

### TypeScript

Configuration in `tsconfig.json`:
- Strict mode enabled
- Path aliases configured
- React JSX transform

### Supabase

Configuration managed through environment variables (see [Environment Variables](#environment-variables))

---

## 💻 Development

### Code Style

This project uses ESLint for code quality:

```bash
npm run lint
```

### Component Development

Components are organized by feature/page:
- Each component should be in its own file
- Use TypeScript for type safety
- Follow the existing naming conventions
- Use Tailwind CSS for styling

### Example Component Structure

```typescript
// components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // base styles
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white',
        outline: 'border border-gray-300 text-gray-900',
      },
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button
      className={buttonVariants({ variant, className })}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

### State Management with Zustand

Example store:

```typescript
// lib/store/financeStore.ts
import { create } from 'zustand';

interface FinanceState {
  balance: number;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  balance: 0,
  transactions: [],
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),
}));
```

### Forms with React Hook Form

Example form:

```typescript
// components/forms/AddExpenseForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const expenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.date(),
  description: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function AddExpenseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  const onSubmit = (data: ExpenseFormData) => {
    // Handle form submission
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 🔨 Build & Deployment

### Local Build

```bash
npm run build
npm start
```

### Production Build Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Build completes without errors
- [ ] Performance optimized
- [ ] Security review completed

### Deployment to Vercel

This project is configured for Vercel deployment:

1. Push to your GitHub repository
2. Connect to Vercel via GitHub
3. Configure environment variables in Vercel dashboard
4. Deploy

**Current Live URL:** https://ai-finance-tracker-fe.vercel.app

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |

### Development with Turbo

The development server uses `--turbo` flag for faster builds with Turbopack.

---

## 📚 Key Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^15.5.9 | React framework |
| react | 18.2.0 | UI library |
| typescript | ^5 | Type safety |
| tailwindcss | ^4.1.18 | Styling framework |
| @supabase/supabase-js | ^2.39.0 | Backend client |
| zustand | ^4.5.7 | State management |
| react-hook-form | ^7.70.0 | Form management |
| recharts | ^2.15.4 | Data visualization |
| framer-motion | ^12.33.0 | Animations |
| zod | ^3.25.76 | Schema validation |

### Dev Dependencies

- `@types/node`: Type definitions for Node.js
- `@types/react`: Type definitions for React
- `@types/react-dom`: Type definitions for React DOM
- `autoprefixer`: CSS vendor prefixing
- `postcss`: CSS transformation

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true

# Optional: Vercel specific
VERCEL_ENV=development
```

### Environment Variable Explanation

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anonymous/public key
- **NEXT_PUBLIC_API_URL**: Backend API endpoint
- **NEXT_PUBLIC_ENABLE_ANALYTICS**: Enable analytics features
- **NEXT_PUBLIC_ENABLE_AI_FEATURES**: Enable AI-powered features

⚠️ **Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never expose sensitive keys.

---

## 🔐 Security

- All authentication is handled through Supabase
- Sensitive data is never stored in environment variables committed to git
- Use `.env.local` (gitignored) for local development
- Middleware enforces authentication on protected routes

---

## 📊 Performance Optimization

### Built-in Optimizations

- **Image Optimization**: Next.js Image component for automatic optimization
- **Code Splitting**: Automatic route-based code splitting
- **CSS Optimization**: Tailwind CSS tree-shaking
- **Script Optimization**: Next.js Script component with loading strategies

### Recommendations

- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Optimize images before uploading
- Regular performance audits with Lighthouse

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use

```bash
# On macOS/Linux
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Dependencies conflict

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build fails

```bash
npm run lint  # Check for lint errors
npm run build  # Rebuild
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** following code style guidelines
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Guidelines

- Follow TypeScript best practices
- Write clear, descriptive commit messages
- Add comments for complex logic
- Ensure all tests pass
- Update documentation as needed

---

## 📄 License

This project is currently private. Please contact the owner for licensing information.

---

## 📞 Support & Contact

- **Author**: Mikhael-agung
- **GitHub**: https://github.com/Mikhael-agung
- **Email**: Check GitHub profile for contact information
- **Issues**: Report bugs via GitHub Issues

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI Components powered by [Radix UI](https://radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Backend with [Supabase](https://supabase.io/)
- Chart visualization by [Recharts](https://recharts.org/)

---

## 📈 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Investment portfolio tracking
- [ ] Bill reminders and notifications
- [ ] Budget sharing with family members
- [ ] Machine learning predictions
- [ ] Integration with banking APIs

---

**Last Updated**: June 1, 2026

