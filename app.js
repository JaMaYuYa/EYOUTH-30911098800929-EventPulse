require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventsRoutes');
const registrationRoutes = require('./routes/registrationsRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// 1. Create HTTP Server & Socket.io Instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

// 2. Attach Socket.io instance to Express BEFORE routes
app.set('io', io);

// 3. Core Middleware
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NoSQL Injection Sanitization (Safely strips $ operators without dropping keys)
const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key in obj) {
    if (key.startsWith('$')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitize(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
});

// 4. Socket.io Event Listeners
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Room subscription
  socket.on('join-event', (eventId) => {
    if (eventId) {
      socket.join(eventId.toString());
      console.log(`Socket ${socket.id} joined event room: ${eventId}`);
    }
  });

  socket.on('leave-event', (eventId) => {
    if (eventId) {
      socket.leave(eventId.toString());
      console.log(`Socket ${socket.id} left event room: ${eventId}`);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

// 5. Swagger OpenAPI Setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EventPulse API',
      version: '1.0.0',
      description: 'Real-time Event Management RESTful API',
    },
    servers: [
      {
        url: process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:5000',
        description: 'Current Environment Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Options to load Swagger UI CSS & JS via CDN (Fixes Vercel Blank Page Issue)
const swaggerUiOptions = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.js'
  ]
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

// 6. Health Check Endpoints (Available on both /health and /api/health)
const healthHandler = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbStatusMap[dbState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// 7. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/announcements', announcementRoutes);

// 8. 404 Catch-All Handler
app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: 'Route not found' });
});

// 9. Global Error Handler
app.use(errorHandler);

// 10. Local Server Execution & Vercel Export Setup
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  async function start() {
    try {
      await connectDB();
      console.log('Database connected successfully');

      server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error('Failed to start server:', err.message);
      process.exit(1);
    }
  }

  start();
} else {
  // Connect to DB asynchronously for Vercel/Serverless invocations
  connectDB().catch((err) => console.error('Database pre-connection warning:', err.message));
}

module.exports = app;