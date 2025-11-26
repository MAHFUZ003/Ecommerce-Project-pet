
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const pool = require('./db/db.js'); 
const expressLayouts = require('express-ejs-layouts');

dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set("layout", "layout");

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('pages/index', { 
       title: '',
        //user: null // You can pass user data here if you have authentication
    });
});
app.get('/register/', (req, res) => {
    res.render('pages/register', { 
       title: '',
    });
});
app.get('/login/', (req, res) => {
    res.render('pages/login', { 
       title: '',
    });
});


app.use('api/v1/users'


    
)



pool.connect()
  .then(() => console.log(' Connected to PostgreSQL via pgAdmin'))
  .catch(err => console.error(' Database connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
