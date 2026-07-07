const express = require('express');
const {
  signup,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  signupValidators,
  loginValidators,
  forgotValidators,
  resetValidators,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signupValidators, signup);
router.post('/login', loginValidators, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.post('/forgot-password', forgotValidators, forgotPassword);
router.post('/reset-password', resetValidators, resetPassword);

module.exports = router;
