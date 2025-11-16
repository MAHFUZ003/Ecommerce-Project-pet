// index.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const pool = require('./db/db.js'); // CommonJS import

dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { title: 'Welcome to My Shop' });
});

pool.connect()
  .then(() => console.log(' Connected to PostgreSQL via pgAdmin'))
  .catch(err => console.error(' Database connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
