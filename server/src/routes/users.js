const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', authController.protect, authController.restrictTo('admin'), (req, res) => {
  console.log("users route")
  res.status(200).json({
    status: 'success',
    data: {
      users: [],
    },
  });
});

module.exports = router;