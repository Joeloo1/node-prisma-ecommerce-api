# Node.js TypeScript eCommerce API

A robust, scalable eCommerce backend built with Node.js, Express, and TypeScript. It leverages Prisma ORM for PostgreSQL database management and Redis for high-performance caching.

## 🚀 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Caching**: [Redis](https://redis.io/)
- **Authentication**: [JWT](https://jwt.io/) & [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: [Winston](https://github.com/winstonjs/winston) & [Morgan](https://github.com/expressjs/morgan)
- **Security**: [Helmet](https://helmetjs.github.io/) & [Express Rate Limit](https://github.com/n670/express-rate-limit)
- **Email**: [Nodemailer](https://nodemailer.com/) (Mailtrap integration)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) & [Multer](https://github.com/expressjs/multer)

## ✨ Features

- **User Management**:
  - Registration & Login with JWT Authentication.
  - Email Verification & Password Reset.
  - Profile Management & Multiple Shipping Addresses.
  - Role-based Access Control (User & Admin).
- **Ecommerce Core**:
  - **Product Catalog**: Advanced product management with categories, brands, and availability tracking.
  - **Cart System**: Fully functional shopping cart.
  - **Order Life Cycle**: Complete flow from `PENDING` -> `PAID` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` -> `CANCELLED`.
  - **Reviews & Ratings**: User-generated reviews for products.
- **System Features**:
  - Secure image uploads and resizing using Multer and Sharp.
  - Modern request validation using Zod schemas.
  - Production-ready logging with Winston.
  - Security hardening with Helmet and Rate Limiting.
  - Redis integration for optimized performance.

## 📁 Project Structure

```text
src/
├── Routes/          # API Route definitions (Admin & User)
├── controller/      # Business logic handlers
├── middleware/      # Auth, error handling, file uploads
├── Schema/          # Zod validation schemas
├── config/          # System configurations (DB, Redis, etc.)
├── utils/           # Helper functions
├── app.ts           # Express app configuration
└── server.ts        # Application entry point
prisma/
└── schema.prisma    # Database models and relations
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- Redis Server
- NPM or PNPM

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd node-prisma-ecommerce-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and configure the following:

   ```env
   PORT=8000
   NODE_ENV=development

   DATABASE_URL=your_postgresql_url
   DIRECT_URL=your_direct_postgresql_url

   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=90d

   REDIS_URL=redis://127.0.0.1:6379

   EMAIL_HOST=sandbox.smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USERNAME=your_mailtrap_username
   EMAIL_PASSWORD=your_mailtrap_password
   ```

4. **Database Migration**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Running the App

- **Development Mode**:
  ```bash
  npm run dev
  ```
- **Build for Production**:
  ```bash
  npm run build
  ```
- **Start Production Server**:
  ```bash
  npm start
  ```

## 🛡️ API Endpoints (Summary)

### Admin Routes
- `POST /api/admin/auth/login`
- `GET /api/admin/users` - Manage users
- `POST /api/admin/products` - Inventory management
- `POST /api/admin/categories` - Product categorization
- `GET /api/admin/orders` - Global order management

### User Routes
- `POST /api/users/auth` - Register/Login
- `GET /api/products` - Browse catalog
- `POST /api/cart` - Cart operations
- `POST /api/orders` - Checkout and order history
- `POST /api/reviews` - Product feedback
- `POST /api/address` - Manage shipping addresses

## 📄 License

This project is licensed under the [ISC License](LICENSE).
