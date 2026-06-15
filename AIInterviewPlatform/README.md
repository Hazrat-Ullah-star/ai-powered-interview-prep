# AI Interview Preparation Platform (MERN Stack)

A professional, full-stack AI-powered platform designed to help users prepare for technical and HR interviews. Built using the MERN stack (MongoDB, Express, React, Node.js) and integrated with Google Gemini AI.

## 🚀 Features

- **AI-Powered Interviews**: Real-time text and voice-based interview sessions.
- **Instant AI Feedback**: Detailed analysis of your answers using Google Gemini.
- **Coding Challenges**: Integrated Monaco editor with AI code review.
- **Resume-Based Q&A**: Upload your resume to generate personalized questions.
- **Analytics Dashboard**: Performance tracking with interactive charts.
- **Admin Panel**: Manage users and platform content.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Google AI Studio](https://aistudio.google.com/app/apikey) API Key

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd AIInterviewPlatform/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
   JWT_SECRET=your_super_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

---

## ☁️ MongoDB Atlas Configuration

Follow these steps to connect your project to the cloud:

1. **Create Atlas Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create Free Cluster**: Deploy a new "Shared" cluster (free tier).
3. **Create Database User**: 
   - Go to "Database Access" -> "Add New Database User".
   - Set a username and a strong password.
   - Assign the "Read and Write to any database" role.
4. **Network Access**:
   - Go to "Network Access" -> "Add IP Address".
   - Select "Allow Access from Anywhere" (`0.0.0.0/0`) or add your current IP.
5. **Get Connection String**:
   - Go to "Deployment" -> "Database".
   - Click "Connect" -> "Drivers".
   - Copy the connection string for Node.js.
6. **Final Step**: Replace `<password>` in the connection string with your real password and paste the full URI into `server/.env` as `MONGODB_URI`.

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### General
- `GET /api/test` - Basic API health test
- `GET /api/health` - Detailed system status

---

## 📜 Deployment Notes
- Change `NODE_ENV` to `production` in your hosting environment.
- Ensure all environment variables are set in your provider's dashboard (e.g., Vercel, Render, Heroku).
- Use a strong `JWT_SECRET` for production security.

Developed by **Rifet** 🚀
