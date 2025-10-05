# Grow My Team - AI Recruitment Agent

**Grow My Team** is a powerful, white-labelable SaaS platform designed to streamline recruitment for businesses of all sizes. Built with modern web technologies, it offers AI-powered recruitment workflows, intelligent candidate management, and comprehensive theming capabilities for multi-tenant deployments.

## ✨ Key Features

- **🎯 Position Management**: Create, edit, and manage job listings from a centralized dashboard
- **🤖 AI-Powered Recruitment**: Automated multi-step workflow including application, AI screening, review, interview, and offer stages
- **📊 Centralized Candidate Database**: Searchable database with AI-powered profile updates and merging
- **📄 Intelligent Resume Parsing**: Automatic extraction of key information from resumes
- **🎨 White-Label Theming**: Complete branding customization with multi-tenant support

- **🌙 Light/Dark Mode**: Built-in theme switching with system preference detection

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/installation) (recommended package manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your_username/grow-my-team.git
   cd grow-my-team
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Add your configuration variables.

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🎨 Theming & White Labeling

Grow My Team includes a comprehensive theming system that supports complete white labeling for multi-tenant deployments. Create custom themes with your brand colors, logos, and styling while maintaining full light/dark mode support.

For detailed theming instructions, see the [Theming Guide](docs/THEMING_GUIDE.md).

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)

- **UI Components**: Custom components with shadcn/ui patterns
- **Development**: [Biome](https://biomejs.dev/) for linting and formatting
- **Testing**: [Playwright](https://playwright.dev/) for E2E testing
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📜 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run linter
pnpm format       # Format code
pnpm type-check   # TypeScript type checking

# Testing
pnpm test:e2e     # Run E2E tests
pnpm test:unit    # Run unit tests

# Theme Development
pnpm theme:build  # Build theme assets
pnpm theme:dev    # Theme development mode
```

## 📚 Documentation

For detailed documentation, visit the `docs/` folder:

- [Next-Auth Setup](docs/NEXT_AUTH_SETUP.md)
- [Theming Guide](docs/THEMING_GUIDE.md)
- [Streaming Modal System](docs/STREAMING_MODAL.md)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables:**
   ```bash
   NEXT_PUBLIC_THEME_ID=your_theme_id
   ```
3. **Deploy automatically on push**

### Custom Deployment

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Run tests: `pnpm test:e2e`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/)
2. Search existing [GitHub Issues](https://github.com/your_username/grow-my-team/issues)
3. Create a new issue with detailed information

---

**Built with ❤️ for modern recruitment workflows**
