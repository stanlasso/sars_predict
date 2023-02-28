const express = require('express');
const router = express.Router();
const references = require('../controllers/references');
router.post('/add',references.create);
router.get('/list',references.read);
router.patch('/update/:username',references.update);
router.delete('/delete/:username',references.deletereference);
module.exports = router;