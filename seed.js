import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Product from "./models/Product.js";

const products = [
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with adjustable DPI",
    brand: "LogiTech",
    category: "Electronics",
    price: 24.99,
    discountPercentage: 5,
    stock: 60,
    images: ["https://via.placeholder.com/300?text=Mouse"],
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with blue switches",
    brand: "KeyForge",
    category: "Electronics",
    price: 59.99,
    discountPercentage: 10,
    stock: 35,
    images: ["https://via.placeholder.com/300?text=Keyboard"],
  },
  {
    name: "27-inch Monitor",
    description: "QHD IPS monitor with 144Hz refresh rate",
    brand: "ViewMax",
    category: "Electronics",
    price: 229.99,
    discountPercentage: 8,
    stock: 18,
    images: ["https://via.placeholder.com/300?text=Monitor"],
  },
  {
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI and card reader",
    brand: "ConnectPro",
    category: "Electronics",
    price: 34.99,
    discountPercentage: 0,
    stock: 50,
    images: ["https://via.placeholder.com/300?text=USB+Hub"],
  },
  {
    name: "Portable SSD 1TB",
    description: "High-speed external SSD, USB 3.2",
    brand: "DataFlash",
    category: "Electronics",
    price: 89.99,
    discountPercentage: 12,
    stock: 40,
    images: ["https://via.placeholder.com/300?text=SSD"],
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable waterproof speaker with 12-hour battery",
    brand: "SoundPro",
    category: "Electronics",
    price: 39.99,
    discountPercentage: 15,
    stock: 55,
    images: ["https://via.placeholder.com/300?text=Speaker"],
  },
  {
    name: "Smartwatch",
    description: "Fitness tracking smartwatch with heart-rate monitor",
    brand: "FitTrack",
    category: "Wearables",
    price: 129.99,
    discountPercentage: 10,
    stock: 25,
    images: ["https://via.placeholder.com/300?text=Smartwatch"],
  },
  {
    name: "Noise-Cancelling Earbuds",
    description: "True wireless earbuds with active noise cancellation",
    brand: "SoundPro",
    category: "Electronics",
    price: 79.99,
    discountPercentage: 20,
    stock: 45,
    images: ["https://via.placeholder.com/300?text=Earbuds"],
  },
  {
    name: "Webcam 1080p",
    description: "Full HD webcam with autofocus and built-in mic",
    brand: "ClearView",
    category: "Electronics",
    price: 29.99,
    discountPercentage: 0,
    stock: 38,
    images: ["https://via.placeholder.com/300?text=Webcam"],
  },
  {
    name: "Gaming Chair",
    description: "Ergonomic gaming chair with lumbar support",
    brand: "ComfortZone",
    category: "Furniture",
    price: 189.99,
    discountPercentage: 15,
    stock: 12,
    images: ["https://via.placeholder.com/300?text=Chair"],
  },
  {
    name: "Standing Desk",
    description: "Electric height-adjustable standing desk",
    brand: "ErgoLift",
    category: "Furniture",
    price: 299.99,
    discountPercentage: 10,
    stock: 8,
    images: ["https://via.placeholder.com/300?text=Desk"],
  },
  {
    name: "Desk Lamp LED",
    description: "Adjustable LED desk lamp with USB charging port",
    brand: "BrightWorks",
    category: "Furniture",
    price: 22.99,
    discountPercentage: 0,
    stock: 65,
    images: ["https://via.placeholder.com/300?text=Lamp"],
  },
  {
    name: "Office Chair Mat",
    description: "Clear PVC chair mat for hardwood floors",
    brand: "FloorGuard",
    category: "Furniture",
    price: 34.99,
    discountPercentage: 5,
    stock: 30,
    images: ["https://via.placeholder.com/300?text=Chair+Mat"],
  },
  {
    name: "Backpack 25L",
    description: "Water-resistant laptop backpack with USB port",
    brand: "TrailPack",
    category: "Accessories",
    price: 44.99,
    discountPercentage: 10,
    stock: 42,
    images: ["https://via.placeholder.com/300?text=Backpack"],
  },
  {
    name: "Water Bottle 1L",
    description: "Insulated stainless steel water bottle",
    brand: "HydroLife",
    category: "Accessories",
    price: 19.99,
    discountPercentage: 0,
    stock: 80,
    images: ["https://via.placeholder.com/300?text=Bottle"],
  },
  {
    name: "Sunglasses Polarized",
    description: "UV400 polarized sunglasses, unisex",
    brand: "SunShade",
    category: "Accessories",
    price: 24.99,
    discountPercentage: 20,
    stock: 50,
    images: ["https://via.placeholder.com/300?text=Sunglasses"],
  },
  {
    name: "Leather Wallet",
    description: "Slim genuine leather bifold wallet",
    brand: "UrbanEdge",
    category: "Accessories",
    price: 29.99,
    discountPercentage: 0,
    stock: 60,
    images: ["https://via.placeholder.com/300?text=Wallet"],
  },
  {
    name: "Running Shoes",
    description: "Lightweight breathable running shoes",
    brand: "SprintFlex",
    category: "Footwear",
    price: 69.99,
    discountPercentage: 15,
    stock: 33,
    images: ["https://via.placeholder.com/300?text=Shoes"],
  },
  {
    name: "Hiking Boots",
    description: "Waterproof hiking boots with ankle support",
    brand: "TrailMaster",
    category: "Footwear",
    price: 94.99,
    discountPercentage: 10,
    stock: 20,
    images: ["https://via.placeholder.com/300?text=Boots"],
  },
  {
    name: "Casual Sneakers",
    description: "Classic canvas sneakers, unisex",
    brand: "UrbanStep",
    category: "Footwear",
    price: 49.99,
    discountPercentage: 5,
    stock: 47,
    images: ["https://via.placeholder.com/300?text=Sneakers"],
  },
  {
    name: "Cotton T-Shirt",
    description: "100% organic cotton crew-neck t-shirt",
    brand: "BasicWear",
    category: "Clothing",
    price: 14.99,
    discountPercentage: 0,
    stock: 100,
    images: ["https://via.placeholder.com/300?text=T-Shirt"],
  },
  {
    name: "Denim Jacket",
    description: "Classic fit denim jacket",
    brand: "UrbanEdge",
    category: "Clothing",
    price: 54.99,
    discountPercentage: 10,
    stock: 28,
    images: ["https://via.placeholder.com/300?text=Jacket"],
  },
  {
    name: "Hooded Sweatshirt",
    description: "Fleece-lined pullover hoodie",
    brand: "ComfortWear",
    category: "Clothing",
    price: 34.99,
    discountPercentage: 0,
    stock: 55,
    images: ["https://via.placeholder.com/300?text=Hoodie"],
  },
  {
    name: "Yoga Mat",
    description: "Non-slip eco-friendly yoga mat, 6mm thick",
    brand: "ZenFit",
    category: "Sports",
    price: 27.99,
    discountPercentage: 5,
    stock: 40,
    images: ["https://via.placeholder.com/300?text=Yoga+Mat"],
  },
  {
    name: "Adjustable Dumbbells",
    description: "5-25 lb adjustable dumbbell set, pair",
    brand: "IronCore",
    category: "Sports",
    price: 149.99,
    discountPercentage: 10,
    stock: 10,
    images: ["https://via.placeholder.com/300?text=Dumbbells"],
  },
  {
    name: "Resistance Bands Set",
    description: "5-piece resistance band set with carrying bag",
    brand: "FlexFit",
    category: "Sports",
    price: 19.99,
    discountPercentage: 0,
    stock: 70,
    images: ["https://via.placeholder.com/300?text=Bands"],
  },
  {
    name: "French Press Coffee Maker",
    description: "34oz stainless steel French press",
    brand: "BrewCraft",
    category: "Home",
    price: 27.99,
    discountPercentage: 5,
    stock: 32,
    images: ["https://via.placeholder.com/300?text=French+Press"],
  },
  {
    name: "Ceramic Dinner Set",
    description: "16-piece ceramic dinnerware set, service for 4",
    brand: "HomeStyle",
    category: "Home",
    price: 64.99,
    discountPercentage: 15,
    stock: 15,
    images: ["https://via.placeholder.com/300?text=Dinner+Set"],
  },
  {
    name: "Throw Blanket",
    description: "Soft fleece throw blanket, 50x60 inches",
    brand: "CozyHome",
    category: "Home",
    price: 22.99,
    discountPercentage: 0,
    stock: 48,
    images: ["https://via.placeholder.com/300?text=Blanket"],
  },
  {
    name: "Scented Candle Set",
    description: "3-pack soy wax scented candles",
    brand: "PureGlow",
    category: "Home",
    price: 18.99,
    discountPercentage: 10,
    stock: 60,
    images: ["https://via.placeholder.com/300?text=Candles"],
  },
];

const seed = async () => {
  try {
    await connectDB();

    const existingNames = new Set(
      (await Product.find({}, "name")).map((p) => p.name),
    );
    const newProducts = products.filter((p) => !existingNames.has(p.name));
    const skipped = products.length - newProducts.length;

    if (newProducts.length > 0) {
      const result = await Product.insertMany(newProducts);
      console.log(`Inserted ${result.length} new products.`);
    } else {
      console.log("No new products to insert.");
    }
    if (skipped > 0) {
      console.log(
        `Skipped ${skipped} product(s) already in the database (matched by name).`,
      );
    }
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
