const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'organizer', 'vendor', 'user']).withMessage('Invalid role'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const eventValidation = [
  body('name').trim().isLength({ min: 3 }).withMessage('Event name must be at least 3 characters'),
  body('event_date').notEmpty().withMessage('Event date is required'),
  validate
];

const serviceValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Service name is required'),
  body('category').isIn(['food', 'decoration', 'venue', 'accommodation', 'transportation', 'entertainment', 'event_staff', 'equipment']).withMessage('Invalid category'),
  body('base_price').isNumeric().withMessage('Valid price is required'),
  validate
];

const vendorValidation = [
  body('business_name').trim().isLength({ min: 2 }).withMessage('Business name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  validate
];

const bookingValidation = [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('service_id').isInt().withMessage('Valid service ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
];

const paymentValidation = [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('payment_method').isIn(['credit_card', 'upi', 'wallet']).withMessage('Invalid payment method'),
  validate
];

const reviewValidation = [
  body('vendor_id').isInt().withMessage('Valid vendor ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  validate
];

const idParamValidation = [
  param('id').isInt().withMessage('Valid ID is required'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  eventValidation,
  serviceValidation,
  vendorValidation,
  bookingValidation,
  paymentValidation,
  reviewValidation,
  idParamValidation
};