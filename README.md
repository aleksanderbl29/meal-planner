# Meal Planner

A modern meal planning application built with Next.js and designed to help you organize your weekly meals efficiently.

![Vercel Deploy](https://deploy-badge.vercel.app/vercel/v0-meal-planning-app-nu)
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
   This provides Node.js, npm, and pnpm. Install project dependencies in the next step.

3. **Install project dependencies**
   ```bash
   devenv shell pnpm install --frozen-lockfile
   ```

4. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   
   # Vercel KV Database (for storage)
   KV_URL=your_vercel_kv_url_here
   KV_REST_API_URL=your_vercel_kv_rest_api_url_here
   KV_REST_API_TOKEN=your_vercel_kv_rest_api_token_here
   KV_REST_API_READ_ONLY_TOKEN=your_vercel_kv_rest_api_read_only_token_here
   
   # Next.js
   NEXTAUTH_URL=http://localhost:3000
   ```

5. **Start the development server**
   ```bash
   devenv shell pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

Run each project command through `devenv shell`, including in separate terminal
or agent calls. Do not install tools globally.

### Checks

```bash
devenv shell pnpm test
devenv shell pnpm exec tsc --noEmit
devenv shell pnpm build
```

The similarity tests compile into a temporary directory using the existing
TypeScript dependency, run with Node's built-in test runner, and remove the
temporary files. They need no Clerk, KV, or AI credentials.

See [Lignende retter](docs/similar-meals.md) for the matching rule and its limits.

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
