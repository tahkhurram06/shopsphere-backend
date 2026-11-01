import Review from '../models/Review.js';
import Product from '../models/Product.js';

// recalculates and saves a product's rating/numReviews from its reviews
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating =
    numReviews === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
};

// @desc   Get all reviews for a product
// @route  GET /api/products/:productId/reviews
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create a review for a product (logged-in users)
// @route  POST /api/products/:productId/reviews
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId,
    });
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: 'You already reviewed this product' });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    await updateProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update your own review
// @route  PUT /api/reviews/:id
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    await updateProductRating(review.product);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete your own review (or admin)
// @route  DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};