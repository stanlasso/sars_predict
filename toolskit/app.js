const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const uploadDataRoutes = require('./routes/upload');
const condaRoutes = require('./routes/conda');
const sequenceRoutes =require('./routes/managerData');
const parameterRoutes= require('./routes/paramater');
const referenceRoutes= require('./routes/reference');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/*mongoose.connect('mongodb+srv://abouchou:123!!Akop@cluster0.wpsow.mongodb.net/Cluster0?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));
*/

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/user', userRoutes);
app.use('/api/data', uploadDataRoutes);
app.use('/api/sequence',sequenceRoutes);
app.use('/api/parameter',parameterRoutes);
app.use('/api/reference',referenceRoutes);
app.use("/api/conda", condaRoutes);

module.exports = app;