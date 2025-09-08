# Måltidsplanlægger (Meal Planner)

A modern Danish meal planning application built with Next.js and designed to help you organize your weekly meals efficiently.

[![Vercel](https://vercelbadge.vercel.app/api/aleksanderbl29/meal-planner)](https://meal-planner-aleksanderbl29s-projects.vercel.app/)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=flat-square)](https://v0.dev/chat/projects/D6HPvrKtFRz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## ✨ Features

- 📅 **Weekly Meal Planning**: Plan your meals for the entire week
- 🔐 **Secure Authentication**: User authentication powered by Clerk
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean interface built with Radix UI and Tailwind CSS
- ⚡ **Real-time Updates**: Instant synchronization of meal plans
- 🌙 **Dark Mode Support**: Toggle between light and dark themes

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.2.4](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components

### Backend & Services
- **[Clerk](https://clerk.com/)** - Authentication and user management
- **[Vercel KV](https://vercel.com/storage/kv)** - Redis-compatible database
- **[Vercel](https://vercel.com/)** - Deployment and hosting

### Development Tools
- **[devenv.nix](https://devenv.sh/)** - Reproducible development environment
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[ESLint](https://eslint.org/)** - Code linting

## 🚀 Live Demo

The application is deployed and available at: **https://meal-planner-aleksanderbl29s-projects.vercel.app/**

## 💻 Local Development

This project uses [devenv.sh](https://devenv.sh/) for a reproducible development environment.

### Prerequisites
- [Nix](https://nixos.org/download.html) package manager
- [devenv](https://devenv.sh/getting-started/) installed

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aleksanderbl29/meal-planner.git
   cd meal-planner
   ```

2. **Enter the development environment**
   ```bash
   devenv shell
   ```
   This will automatically set up Node.js, npm, pnpm, and all required dependencies.

3. **Install project dependencies**
   ```bash
   pnpm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Clerk publishable key and other required environment variables.

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Alternative Setup (without devenv)

If you prefer not to use devenv:

1. Ensure you have Node.js 18+ installed
2. Install pnpm: `npm install -g pnpm`
3. Follow steps 1, 3-6 above

## 🏗️ Project Structure

```
├── app/                  # Next.js App Router
│   ├── actions.ts       # Server actions
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/          # Reusable UI components
│   └── ui/             # Radix UI components
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/             # Global styles
├── devenv.nix          # Development environment config
└── devenv.yaml         # devenv configuration
```

## 📝 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🎨 Built with v0.dev

This application was initially created using [v0.dev](https://v0.dev/chat/projects/D6HPvrKtFRz) and continues to be enhanced with additional features and improvements.
