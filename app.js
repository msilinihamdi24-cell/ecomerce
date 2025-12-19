const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();

// =======================
// Config
// =======================
dotenv.config();

// =======================
// Middlewares
// =======================
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/'));

// =======================
// MongoDB
// =======================
mongoose
  .connect(process.env.DATABASECLOUD)
  .then(() => console.log('Database Successfully Connected'))
  .catch((err) => {
    console.error('Unable to connect to database', err);
    process.exit(1);
  });

// =======================
// Routes
// =======================
app.get('/', (req, res) => {
  res.send('Bonjour 👋 Backend is running');
});

app.use('/api/categories', require('./routes/categorie.route'));
app.use('/api/scategories', require('./routes/scategorie.route'));
app.use('/api/articles', require('./routes/article.route'));
app.use('/api/users', require('./routes/user.route'));

// =======================
// Server
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
