import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc   Create order from logged-in user's cart
// @route  POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate stock before creating the order
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ message: "A product in your cart no longer exists" });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${item.product.name}". Only ${item.product.stock} left.`,
        });
      }
    }

    const orderItems = cart.items.map((item) => {
      const discount = item.product.discountPercentage || 0;
      const finalPrice = item.product.price * (1 - discount / 100);
      return {
        product: item.product._id,
        name: item.product.name,
        price: Number(finalPrice.toFixed(2)),
        quantity: item.quantity,
      };
    });

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice,
    });

    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // clear cart after order is placed
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get logged-in user's orders
// @route  GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single order by ID (owner or admin)
// @route  GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const ownerId = order.user?._id?.toString();

    if (ownerId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all orders (admin only)
// @route  GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email").sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update order status (admin only)
// @route  PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    if (status === "delivered") {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create a Stripe Checkout session for an order
// @route  POST /api/orders/:id/create-checkout-session
export const createCheckoutSession = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: "Order already paid" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: { orderId: order._id.toString() },
      success_url: `${process.env.CLIENT_URL}/orders/${order._id}?paid=true`,
      cancel_url: `${process.env.CLIENT_URL}/orders/${order._id}?paid=false`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Stripe webhook — confirms payment and marks order paid
// @route  POST /api/orders/webhook
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    const order = await Order.findById(orderId);
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = "processing";
      await order.save();
    }
  }

  res.json({ received: true });
};
// @desc   Cancel your own order (only if still pending)
// @route  PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};