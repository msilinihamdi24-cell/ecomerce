const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Charger les variables d’environnement
dotenv.config();

const app = express();

// =======================
// Middlewares
// =======================
app.use(cors());
app.use(express.json());

// =======================
// Routes
// =======================
const categorieRouter = require('./routes/categorie.route');
app.use('/api/categories', categorieRouter);

// =======================
// Route test
// =======================
app.get('/', (req, res) => {
  res.send('Backend ecommerce is running');
});

// =======================
// Connexion MongoDB
// =======================
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('Database successfully connected'))
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// =======================
// Server
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const scategorieRouter =require("./routes/scategorie.route")
app.use('/api/scategories', scategorieRouter);

const articleRouter =require("./routes/article.route")
app.use('/api/articles', articleRouter);

module.exports = app;
