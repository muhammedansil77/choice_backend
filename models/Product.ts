import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  priceInCoins: number;
  category: string;
  images: string[];
  stock: number;
  status: 'available' | 'blocked';
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  priceInCoins: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  status: { type: String, enum: ['available', 'blocked'], default: 'available' },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
