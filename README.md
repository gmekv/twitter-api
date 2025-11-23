# Twitter API

A RESTful API built with Node.js, Express, and MongoDB that provides Twitter-like functionality including user management, tweets, and notifications.

## Features

- **User Management**: User registration, authentication, and profile management
- **Tweets**: Create, read, update, and delete tweets
- **Notifications**: Real-time notification system for user interactions
- **Authentication**: JWT-based authentication middleware
- **File Upload**: Support for image uploads using Multer and Sharp

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Sharp** - Image processing

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/twitter-api.git
cd twitter-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
PORT=3000
MONGODB_URL=mongodb://127.0.0.1:27017/twitter-api
JWT_SECRET=your_jwt_secret_key
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Users
- `POST /users` - Register a new user
- `POST /users/login` - User login
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `DELETE /users/me` - Delete user account

### Tweets
- `POST /tweets` - Create a new tweet
- `GET /tweets` - Get all tweets
- `GET /tweets/:id` - Get a specific tweet
- `PATCH /tweets/:id` - Update a tweet
- `DELETE /tweets/:id` - Delete a tweet

### Notifications
- `POST /notification` - Create a notification
- `GET /notification` - Get all notifications
- `GET /notification/:id` - Get notifications for a specific user

## Project Structure

```
twitter-api/
├── src/
│   ├── Models/          # Mongoose models
│   ├── routers/         # Express route handlers
│   ├── middleware/      # Custom middleware (auth, etc.)
│   └── index.js         # Application entry point
├── db/                  # Database configuration
├── package.json
└── README.md
```

## License

ISC
