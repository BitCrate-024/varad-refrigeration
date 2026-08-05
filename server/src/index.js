require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Ping route for UptimeRobot (Keep-Alive)
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/payments', require('./routes/payments'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
