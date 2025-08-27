# LT Assistant Frontend

A modern React frontend application built with TypeScript, Vite, and Tailwind CSS. This project follows enterprise-grade architecture patterns while being simplified for educational purposes.

## 🚀 Features

- **Modern React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing with protected routes
- **TanStack Query** for server state management and caching
- **Context API** for global state management
- **Role-based authentication** with admin routes
- **Responsive design** with mobile-first approach
- **Component library** following shadcn/ui patterns

## 🏗️ Architecture

The application follows a feature-driven architecture:

```
src/
├── api/          # API service modules
├── components/   # Reusable UI components
│   ├── ui/      # Base UI primitives
│   └── Layout/  # Layout components
├── context/     # React Context providers
├── hooks/       # Custom React hooks
├── lib/         # Utility functions and services
├── pages/       # Route-level components
└── types/       # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Frontend Framework:** React 18.3.1
- **Language:** TypeScript 5.2.2
- **Build Tool:** Vite 5.3.4
- **Styling:** Tailwind CSS 3.4.4
- **Routing:** React Router DOM 6.22.3
- **State Management:** React Context + TanStack Query 5.80.2
- **HTTP Client:** Axios 1.9.0
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lt-assistant-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your backend API URL:
   ```
   VITE_SERVER_URL=http://localhost:3001/api
   ```

## 🏃‍♂️ Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🏗️ Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

## 🚀 Deployment

The application includes a simple Express.js server for production deployment:

1. Build the application
2. Start the production server:
   ```bash
   node server.js
   ```

For platforms like Heroku, the server will automatically start using the `PORT` environment variable.

## 🧪 Demo Credentials

For testing purposes, you can use these demo credentials:
- **Email:** admin@example.com
- **Password:** password

*Note: You'll need a backend API that accepts these credentials.*

## 🔐 Authentication & Authorization

The application supports role-based access control:
- **Public routes:** Login page
- **Protected routes:** Dashboard, Meetings, Settings
- **Admin routes:** Admin dashboard (requires admin or super_admin role)

## 🎨 UI Components

The application uses a custom component library based on shadcn/ui patterns:
- Fully typed TypeScript components
- Accessible design with proper ARIA attributes
- Consistent styling with Tailwind CSS
- Customizable variants using class-variance-authority

## 📱 Responsive Design

- Mobile-first approach
- Collapsible sidebar navigation
- Touch-friendly interactive elements
- Optimized for all screen sizes

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 Project Structure

This project follows the architecture described in the original Ergo Dashboard, simplified for educational use:

- **Feature-driven development** with clear separation of concerns
- **Service layer abstraction** for API calls
- **Context + Hooks pattern** for state management
- **Protected routing** with role-based access
- **Type-safe API integration** with comprehensive error handling

## 🤝 Contributing

This is a school project template. Feel free to:
1. Fork the repository
2. Create feature branches
3. Add new components and pages
4. Implement additional functionality
5. Improve the existing codebase

## 📚 Learning Resources

This project demonstrates:
- Modern React patterns and best practices
- TypeScript integration in React applications
- State management with Context API and TanStack Query
- Routing with React Router
- Component library development
- API integration and error handling
- Responsive design with Tailwind CSS

Perfect for learning enterprise-level React development patterns!
