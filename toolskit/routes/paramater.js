const express = require('express');
const router = express.Router();
const parameters = require('../controllers/parameters');
router.post('/add',parameters.create);
router.get('/list',parameters.read);
router.get('/param/:fullname',parameters.getparameter);
router.patch('/update',parameters.update);
router.delete('/delete/:fullname',parameters.deleteparameter);
module.exports = router;