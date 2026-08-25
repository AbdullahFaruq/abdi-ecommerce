/**
 * Optional demo data: `npm run seed`
 * Uses Unsplash URLs, which are allow-listed in next.config.ts.
 */
import "dotenv/config";
import mongoose from "mongoose";

import { Product } from "../src/models/product";
import { Slide } from "../src/models/slide";

const slides = [
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=2400&q=80",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=2400&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=2400&q=80",
];

const products = [
  { name: "Cotton crew tee, white", price: 38, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80", inStock: true },
  { name: "Chambray shirt, indigo dot", price: 72, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200&q=80", inStock: true },
  { name: "Bomber jacket, rust", price: 148, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80", inStock: true },
  { name: "Fringe knit poncho", price: 96, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&q=80", inStock: false },
  { name: "Crew tee, six-pack", price: 84, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=80", inStock: true },
  { name: "Graphic tee, skeleton print", price: 42, image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80", inStock: false },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing.");

  await mongoose.connect(uri);
  await Promise.all([Product.deleteMany({}), Slide.deleteMany({})]);
  await Slide.insertMany(slides.map((image) => ({ image })));
  await Product.insertMany(products);

  console.log(`Seeded ${products.length} products and ${slides.length} slides.`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
