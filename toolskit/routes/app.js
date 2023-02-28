const express = require('express');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user');
const uploadDataRoutes = require('./routes/managerData');
const condaRoutes = require('./routes/conda');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/stuff', stuffRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/data', uploadDataRoutes);
app.use('/api/conda', condaRoutes);

module.exports = app;