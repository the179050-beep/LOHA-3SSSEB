# Next.js Firebase Authentication App

## Overview
This is a Next.js 13.5 application with Firebase authentication. It features a beautiful RTL (right-to-left) Arabic login interface with modern UI components.

## Tech Stack
- **Framework**: Next.js 13.5.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives with custom styling
- **Animation**: Framer Motion
- **Backend**: Firebase (Auth, Firestore, Realtime Database)
- **Font**: Noto Kufi Arabic

## Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Login page (home)
│   ├── login/             # Alternative login route
│   ├── notifications/     # Protected notifications page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── cards.tsx         # Card components
│   └── personal.tsx      # Personal info components
├── lib/                   # Utilities and configs
│   ├── firestore.ts      # Firebase configuration
│   ├── actions.ts        # Server actions
│   └── utils.ts          # Helper utilities
├── hooks/                 # Custom React hooks
│   └── use-toast.ts      # Toast notifications hook
└── public/               # Static assets
```

## Configuration
- **Port**: 5000 (development and production)
- **Host**: 0.0.0.0 (accessible from Replit proxy)
- **Firebase**: Configured with environment-embedded credentials

## Running the App
```bash
npm run dev    # Development server on port 5000
npm run build  # Build for production
npm start      # Production server on port 5000
```

## Recent Changes
- December 2025: UI Enhancements
  - Enhanced login page with glowing emerald theme, gradient orbs, and floating particles
  - Upgraded notifications page with dark slate theme and animated backgrounds
  - Improved loading states with glowing emerald spinner and blur effects
  - Enhanced StatisticsCard components with dark theme and hover effects
  - Updated header styling with glowing bell icon
  - Added gradient border effects and improved visual consistency
- December 2025: Initial Replit setup
  - Configured Next.js for Replit proxy compatibility
  - Updated to use port 5000

## Features
- Beautiful RTL Arabic interface
- Firebase email/password authentication
- Animated background with gradient orbs
- Responsive design
- Form validation with error states
- Loading states with animations
