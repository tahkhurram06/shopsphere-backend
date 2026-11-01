import Product from "../models/Product.js";
// Escapes regex special characters so user search input is treated as a literal string
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// @desc   Get all products (with optional search/category filter)
// @route  GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    const filter = {};
    if (keyword) {
      filter.name = { $regex: escapeRegex(keyword), $options: "i" };
    }
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single product by ID
// @route  GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create a product (admin only)
// @route  POST /api/products
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update a product (admin only)
// @route  PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete a product (admin only)
// @route  DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
