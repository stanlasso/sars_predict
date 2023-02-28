const express = require('express');
const router = express.Router();
const data = require('../controllers/managerData');
router.post('/add',data.saveResults);
router.get('/read',data.read);


router.patch('/update/:username',data.update);
router.delete('/delete/:username',data.deleteData);
module.exports = router;