const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();

const app = express();

// Security headers
app.use(helmet());

// ✅ CORS setup for separate deployment
app.use(cors({
  origin: process.env.FRONTEND_URL, // <-- your frontend domain
  credentials: true, // Required to send cookies across origins
}));

// Request logger
app.use((req, res, next) => {
  console.log(`App: Request received: ${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());
console.log('process.env.MONGODB_URI:', process.env.MONGODB_URI);
// MongoDB session store
// const store = new MongoDBStore({
//   uri: 'mongodb+srv://harsh:Asdf%401234@cluster0.hsnb1na.mongodb.net/super_key_sessions?retryWrites=true&w=majority&appName=Cluster0',
//   collection: 'sessions'
// });
app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: true,
}));
// store.on('error', (error) => {
//   console.error('MongoDB Session Store Error:', error);
// });
// store.on('connected', () => console.log('MongoDB Session Store Connected!'));
// store.on('disconnected', () => console.warn('MongoDB Session Store Disconnected!'));


// ✅ Session setup with cross-origin cookies
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: process.env.NODE_ENV === 'production', // Set to true on HTTPS
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' // Allow cross-site in prod
  }
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/users', require('./routes/users').router);
app.use('/api/endusers', require('./routes/endUsers').router);
app.use('/api/keys', require('./routes/keys').router);
app.use('/api/emi', require('./routes/emi').router);
app.use('/api/support', require('./routes/support').router);
app.use('/setup', require('./routes/setup').router);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

module.exports = app;
