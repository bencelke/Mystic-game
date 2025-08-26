# Mystic - Epic Gaming Adventure

A modern Next.js 14 project showcasing a gaming landing page with stunning animations and responsive design.

## 🚀 Features

- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for modern, responsive styling
- **shadcn/ui** components for consistent design
- **Framer Motion** for smooth animations
- **ESLint + Prettier** for code quality
- **Commit hooks** with lefthook
- **Absolute imports** with `@/*` alias
- **Sticky navbar** and responsive footer
- **Hero section** with animated content

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Animations**: Framer Motion
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Git Hooks**: lefthook

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd mystic
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up lefthook (optional)**
   ```bash
   pnpm lefthook install
   ```

## 🚀 Available Scripts

- **`pnpm dev`** - Start development server with Turbopack
- **`pnpm build`** - Build for production with Turbopack
- **`pnpm start`** - Start production server
- **`pnpm lint`** - Run ESLint
- **`pnpm lint:fix`** - Fix ESLint issues automatically
- **`pnpm typecheck`** - Run TypeScript type checking
- **`pnpm format`** - Format code with Prettier
- **`pnpm format:check`** - Check code formatting

## 🏗️ Project Structure

```
mystic/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx      # Root layout with navbar/footer
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/          # Reusable components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components
│   │   └── sections/       # Page sections
│   └── lib/                # Utility functions
├── public/                  # Static assets
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
├── lefthook.yml            # Git hooks configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Components

### Layout Components

- **`Navbar`** - Sticky navigation with animated logo and menu
- **`Footer`** - Responsive footer with links and social media

### UI Components

- **`Button`** - Customizable button component
- **`Card`** - Card container with hover effects

### Sections

- **`Hero`** - Landing hero section with animated content

## 🔧 Configuration

### ESLint

Configured with TypeScript support, Next.js rules, and Prettier integration.

### Prettier

Set up with common formatting rules for consistent code style.

### Tailwind CSS

Configured with custom color schemes and responsive utilities.

### Git Hooks

Lefthook runs linting, type checking, and formatting checks before commits.

## 🚀 Deployment

The project is ready for deployment on platforms like:

- Vercel (recommended for Next.js)
- Netlify
- Railway
- Any Node.js hosting platform

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

## 🎭 Animations

- Smooth page transitions
- Hover effects on interactive elements
- Staggered animations for content
- Floating background elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and type checking
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

---

Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion
