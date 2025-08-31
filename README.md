# Dev-Chat Backend API

A robust backend API for a real-time chat application built with Node.js, Express, and Socket.io. This API provides comprehensive user management, personal messaging, and real-time communication features.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - User registration and login
  - Password hashing with bcrypt
  - Profile picture uploads
  - User blocking/unblocking

- **Real-time Messaging**
  - Personal messaging between users
  - Real-time message delivery via Socket.io
  - Typing indicators
  - Message read receipts
  - Message deletion
  - Conversation management

- **User Management**
  - User profile management
  - Profile picture handling
  - User search and discovery
  - Online presence tracking

- **Security Features**
  - JWT token authentication
  - Password encryption
  - CORS protection
  - Input validation
  - Rate limiting ready

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt
- **File Uploads**: Multer
- **Cloud Storage**: Cloudinary
- **Validation**: Built-in Express validation
- **CORS**: cors middleware

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dev-chat-mern/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .envsample .env
   ```

   Configure your `.env` file with the following variables:
   ```env
   PORT=5000
   DATABASE_URI=mongodb://localhost:27017
   CORS_ORIGIN=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or update `DATABASE_URI` to point to your MongoDB instance.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📜 Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm run build` - Build the application (if build steps are added)
- `npm run lint` - Run Prettier code formatting
- `npm test` - Run tests (placeholder)

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /users/register
Content-Type: multipart/form-data

{
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "password": "securepassword"
}
```

#### Login User
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /users/current-user
Authorization: Bearer <access_token>
```

#### Update User Info
```http
PATCH /users/update-user-info
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fullName": "Updated Name",
  "username": "updatedusername"
}
```

#### Change Password
```http
POST /users/change-current-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "oldPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### Update Profile Picture
```http
PATCH /users/update-profile-pic
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

profilePic: <image_file>
```

### Messaging Endpoints

#### Send Personal Message
```http
POST /personal-messages/:receiverId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Hello, how are you?"
}
```

#### Get Personal Messages
```http
GET /personal-messages/:receiverId
Authorization: Bearer <access_token>
```

#### Get Last Message
```http
GET /personal-messages/:receiverId/last
Authorization: Bearer <access_token>
```

#### Delete Message
```http
DELETE /personal-messages/message/:messageId
Authorization: Bearer <access_token>
```

#### Delete Conversation
```http
DELETE /personal-messages/conversation/:receiverId
Authorization: Bearer <access_token>
```

### User Management Endpoints

#### Get All Users
```http
GET /users/all-users
Authorization: Bearer <access_token>
```

#### Find User by Username
```http
GET /users/find-by-userName?username=johndoe
Authorization: Bearer <access_token>
```

#### Get User by ID
```http
GET /users/:userId
Authorization: Bearer <access_token>
```

#### Block User
```http
POST /users/block/:userId
Authorization: Bearer <access_token>
```

#### Unblock User
```http
POST /users/unblock/:userId
Authorization: Bearer <access_token>
```

#### Get Blocked Users
```http
GET /users/blocked-users
Authorization: Bearer <access_token>
```

## 🔌 Socket.io Events

### Connection Management
- `join_room` - Join a chat room
- `disconnect` - Handle user disconnection

### Messaging Events
- `private_message` - Send a private message
- `receive_message` - Receive a message
- `message_read` - Mark message as read
- `message_read_update` - Update read status
- `delete_message` - Delete a message
- `message_deleted` - Notify message deletion

### Presence & Activity
- `user_connected` - User joined the room
- `user_disconnected` - User left the room
- `user_presence` - Update user presence status
- `typing` - User is typing
- `user_typing` - Notify typing status
- `stop_typing` - User stopped typing
- `user_stop_typing` - Notify stopped typing

### Other Events
- `update_sidebar` - Update sidebar with latest message
- `reset_unread` - Reset unread message count
- `conversation_cleared` - Clear conversation
- `user_blocked` - User blocked notification

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── index.js              # Server entry point
│   ├── constants.js          # Application constants
│   ├── socketHandlers.js     # Socket.io event handlers
│   ├── controllers/          # Route controllers
│   │   ├── user.controller.js
│   │   ├── personalMessage.controller.js
│   │   └── ...
│   ├── models/               # MongoDB models
│   │   ├── user.model.js
│   │   ├── personalMessage.model.js
│   │   └── ...
│   ├── routes/               # API routes
│   │   ├── user.routes.js
│   │   ├── personalMessage.routes.js
│   │   └── ...
│   ├── middlewares/          # Custom middlewares
│   │   ├── auth.middleware.js
│   │   ├── multer.middleware.js
│   │   └── ...
│   ├── utils/                # Utility functions
│   │   ├── apiResponse.js
│   │   ├── apiError.js
│   │   ├── asyncHandler.js
│   │   ├── cloudinary.js
│   │   └── socket.js
│   └── db/                   # Database configuration
│       └── index.js
├── public/                   # Static files
├── .env                      # Environment variables
├── .envsample               # Environment template
├── package.json
├── .gitignore
├── .prettierrc
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configured CORS policies
- **Input Validation**: Request validation middleware
- **File Upload Security**: Multer configuration for safe file uploads
- **Rate Limiting**: Ready for implementation

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

1. Set up your production environment variables
2. Configure your MongoDB production instance
3. Set up Cloudinary for file storage (if using)
4. Deploy to your preferred hosting platform (Heroku, AWS, DigitalOcean, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

For support, email support@devchat.com or join our Discord community.

## 🔄 API Version

**Current Version**: v1.0.0

---

**Note**: This API is part of the Dev-Chat MERN stack application. Make sure to also set up the frontend for the complete application experience.
