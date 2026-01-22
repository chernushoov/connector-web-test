# Connector Web 2.0

A modern web application for connecting workers with employers in Israel. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Free World Mode (Primary Entry Point)
- **Interactive Map** - See workers and tasks nearby on a map (like Avito Rabota / Too Good To Go)
- **Quick Registration** - 30 seconds to get on the map
- **Availability Toggle** - Show you're available with one tap
- **Instant Connection** - Contact workers or respond to tasks directly

### Worker Mode
- Browse available shifts with smart matching
- Apply to shifts with one click
- Track earnings and completed work
- Build reputation with ratings and reviews

### Employer Mode
- Post shifts quickly with guided form
- Find workers instantly
- Payment protection with Escrow
- Manage applications and schedules

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State**: Zustand with persist middleware
- **Animations**: Framer Motion
- **Maps**: React Leaflet
- **i18n**: Custom solution with 4 languages (RU, EN, HE, AR)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (Free World)
│   └── providers.tsx      # App providers
├── components/
│   ├── ui/                # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   └── Toast.tsx
│   ├── free-world/        # Free World mode components
│   │   ├── Map.tsx
│   │   ├── WorkerCard.tsx
│   │   ├── TaskCard.tsx
│   │   ├── AvailabilityToggle.tsx
│   │   └── QuickRegistration.tsx
│   ├── worker/            # Worker mode components
│   │   └── ShiftCard.tsx
│   ├── employer/          # Employer mode components
│   │   └── CreateShiftForm.tsx
│   └── psychology/        # NLP/Psychology triggers
│       └── index.tsx
├── hooks/                 # Custom React hooks
│   └── useTranslation.ts
├── i18n/                  # Internationalization
│   └── translations.ts   # All translations (RU, EN, HE, AR)
├── lib/                   # Utilities
│   └── utils.ts          # Helper functions
├── store/                 # Zustand store
│   └── index.ts          # Global state management
├── styles/               # Global styles
│   └── globals.css       # Tailwind + custom CSS
└── types/                # TypeScript types
    └── index.ts          # All type definitions
```

## Design System

### Colors
- **Brand Primary**: #6B5CE7 (Purple)
- **Brand Accent**: #F5BD42 (Gold)
- **Success**: #34C759 (Green)
- **Warning**: #FF9500 (Orange)
- **Danger**: #FF3B30 (Red)

### Psychology Features
- **Urgency Triggers**: Countdown timers, pulsing animations
- **Scarcity Indicators**: Slots left, limited time offers
- **Social Proof**: View counts, applicant numbers, earnings
- **Loss Aversion**: "You're missing out" messages
- **Trust Indicators**: Verified badges, escrow protection

## Languages

The app supports 4 languages with RTL support:
- Russian (RU) - Default
- English (EN)
- Hebrew (HE) - RTL
- Arabic (AR) - RTL

## PWA Support

The app is PWA-ready with:
- Web manifest
- App icons
- Offline capability (coming soon)
- Add to home screen

## License

Private - All rights reserved
