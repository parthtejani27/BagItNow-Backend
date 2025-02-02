# BagItNow Backend API

A robust Node.js backend for the BagItNow grocery shopping platform, built with Express and MongoDB.

## Features

- 🔐 JWT Authentication
- 📱 OTP Verification
- 💳 Stripe Payment Integration
- 📦 Order Management
- 📍 Delivery Tracking
- 🕒 Time Slot Management
- 🚫 Rate Limiting
- 📝 Request Validation
- 🔄 Error Handling

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for Authentication
- Stripe API
- Nodemailer
- Express Validator

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- Stripe Account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/parthtejani27/BagItNow-Backend.git
cd bagit-now-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file:

```env
# Application
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.rrru7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Authentication
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

4. Start the development server:

```bash
npm run dev
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middlewares/    # Custom middlewares
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── validators/     # Request validators
```

## Error Handling

The API uses a centralized error handling system:

## Acknowledgments

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Stripe API Documentation](https://stripe.com/docs/api)
