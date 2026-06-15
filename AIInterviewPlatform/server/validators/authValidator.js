const { check, validationResult } = require('express-validator');

/**
 * Validator for User Registration
 */
const validateRegister = [
  check('fullName')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  check('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  check('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  }
];

/**
 * Validator for User Login
 */
const validateLogin = [
  check('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  check('password')
    .notEmpty().withMessage('Password is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  }
];

module.exports = {
  validateRegister,
  validateLogin
};
