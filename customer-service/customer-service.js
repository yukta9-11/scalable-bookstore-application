// customer-service/app.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

// Import routes
const customerRoutes = require('./routes/customerRoutes');
const statusRoutes = require('./routes/statusRoutes');


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', customerRoutes);
app.use('/', statusRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error'
  });
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;