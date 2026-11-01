import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// nested under /api/products/:productId/reviews
router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', protect, createReview);

// standalone review routes
router.put('/reviews/:id', protect, updateReview);
router.delete('/reviews/:id', protect, deleteReview);

export default router;