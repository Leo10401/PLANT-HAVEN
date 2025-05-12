# Nursery E-commerce Platform

A full-stack e-commerce application for a plant nursery business with separate interfaces for customers, sellers, and administrators.

## Project Overview

This nursery e-commerce platform allows users to browse, purchase plants and gardening supplies. It includes features like user authentication, product management, cart functionality, order processing, seller dashboards, and administrative controls.

## Tech Stack

### Backend
- **Node.js** with **Express** - Server framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Nodemailer** - Email notifications

### Frontend
- **Next.js 15** - React framework with server-side rendering
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Formik & Yup** - Form handling and validation
- **Axios** - API requests
- **React Hot Toast** - Notifications

## Project Structure

### Backend
- `models/` - Database schemas (User, Product, Cart, Order, Review, Seller)
- `routes/` - API endpoints
- `middleware/` - Authentication and request processing
- `utils/` - Helper functions

### Frontend
- `src/app/` - Next.js pages and layouts
  - `(main)/` - Main customer interface
  - `user/` - User dashboard
  - `seller/` - Seller dashboard
  - `admin/` - Admin panel
- `src/components/` - Reusable UI components
- `src/context/` - React context for state management
- `src/services/` - API service functions
- `src/utils/` - Helper utilities

## Setup and Installation

### Prerequisites
- Node.js (v16 or later)
- MongoDB

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   CORS_ORIGIN=http://localhost:3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Key Features

- User authentication and authorization
- Product browsing and searching
- Shopping cart functionality
- Secure checkout process
- Order tracking
- User reviews and ratings
- Seller dashboard for product management
- Admin panel for site management
- Responsive design for mobile and desktop

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 