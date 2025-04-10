const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/api/users', authController.protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: [],
    },
  });
});

module.exports = router;