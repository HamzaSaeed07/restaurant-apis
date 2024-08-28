const express = require('express');
const mongoose = require('mongoose');
const customersRoutes = require('./routes/customers.routes');
const ordersRoutes = require('./routes/orders.routes');
const menuRoutes = require('./routes/menu.routes');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = ['http://localhost:5000', 'https://restaurant-apis.vercel.app'];
app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
app.use(express.json());

app.use('/api/customers', customersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/menus', menuRoutes);
app.get('/', (req, res) =>{
    res.send('Restaurant API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  require('dotenv').config();
  connectDB();
