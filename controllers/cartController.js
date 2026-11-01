import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc   Get logged-in user's cart
// @route  GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock",
    );
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Add item to cart (or increase qty if already there)
// @route  POST /api/cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive whole number" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product", "name price images stock");
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update quantity of a cart item
// @route  PUT /api/cart/:productId
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (
      quantity !== undefined &&
      (!Number.isInteger(quantity) || quantity < 0)
    ) {
      return res
        .status(400)
        .json({ message: "Quantity must be a whole number (0 or greater)" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === req.params.productId,
    );
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== req.params.productId,
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate("items.product", "name price images stock");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Remove item from cart
// @route  DELETE /api/cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId,
    );

    await cart.save();
    await cart.populate("items.product", "name price images stock");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Clear entire cart
// @route  DELETE /api/cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
