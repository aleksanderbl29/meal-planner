# Meal planning app

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/aleksanderbl29s-projects/v0-meal-planning-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/D6HPvrKtFRz)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Setup

### Authentication Configuration

This app uses [Clerk](https://clerk.com) for authentication. To make the sign-in and sign-up buttons work properly:

1. **Create a Clerk account** at [https://clerk.com](https://clerk.com)
2. **Create a new application** in your Clerk dashboard
3. **Get your API keys** from [https://dashboard.clerk.com/last-active?path=api-keys](https://dashboard.clerk.com/last-active?path=api-keys)
4. **Create a `.env.local` file** in the project root with your actual keys:

```bash
# Replace with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here

# Optional routing configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

5. **Restart your development server** after adding the environment variables

### Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

## Deployment

Your project is live at:

**[https://vercel.com/aleksanderbl29s-projects/v0-meal-planning-app](https://vercel.com/aleksanderbl29s-projects/v0-meal-planning-app)**

For production deployment, make sure to add the Clerk environment variables to your Vercel project settings.

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/D6HPvrKtFRz](https://v0.dev/chat/projects/D6HPvrKtFRz)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
