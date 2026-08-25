# EventPulse API 🚀

> Real-time Event Management RESTful API built with Node.js, Express, MongoDB, and Socket.io.

EventPulse is a full-featured backend API for managing public and private events, processing registrations, broadcasting real-time announcements, and handling secure user authentication.

---

## 🛠️ Tech Stack

* **Runtime & Framework:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose ODM
* **Real-Time Layer:** Socket.io (WebSockets)
* **Authentication:** JSON Web Tokens (JWT), Bcrypt.js
* **Documentation:** OpenAPI 3.0 / Swagger UI, Postman
* **Testing:** Jest, Supertest
* **Deployment & Hosting:** Vercel (Serverless Node.js platform)

---

## ⚙️ Local Installation & Setup

### Prerequisites
* Node.js (v18 or later)
* MongoDB local instance or MongoDB Atlas account

### Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/JaMaYuYa/EYOUTH-30911098800929-EventPulse.git
   cd EYOUTH-30911098800929-EventPulse
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.XXXXX.mongodb.net/eventpulse?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Seed the Database:**
   ```bash
   npm run seed
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   * **API Base URL:** `http://localhost:3000`

---

## 📋 API Endpoint Summary

| Method | Endpoint Path | Description | Access |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | Service health & system status check | Public |
| **POST** | `/api/auth/register` | Register a new user account | Public |
| **POST** | `/api/auth/login` | Authenticate user and issue JWT | Public |
| **GET** | `/api/auth/me` | Get currently logged-in user profile | Authenticated User |
| **GET** | `/api/events` | List all upcoming events (Paginated/Filtered) | Public |
| **POST** | `/api/events` | Create a new event | Admin / Organizer |
| **GET** | `/api/events/:id` | Fetch specific event details | Public |
| **PATCH** | `/api/events/:id` | Update event information | Admin / Organizer |
| **DELETE** | `/api/events/:id` | Delete an event | Admin / Organizer |
| **POST** | `/api/registrations` | Register user for an event | Authenticated User |
| **GET** | `/api/registrations/my-registrations` | View user's event registrations | Authenticated User |
| **POST** | `/api/announcements` | Broadcast real-time announcement (Socket.io) | Admin / Organizer |
| **GET** | `/api/announcements` | Get all announcements | Public / Organizer |
| **DELETE** | `/api/announcements/:id` | Delete an announcement | Admin / Organizer |

---

## 🌐 Live Deployment & Interactive Docs

* **Live API Health Check:** https://eyouth-30911098800929-event-pulse-y.vercel.app/health
* **Interactive Swagger Documentation:** https://eyouth-30911098800929-event-pulse-y.vercel.app/api-docs/
