import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  icon: string; // Material Icon name or image URL
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, default: 'category' },
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);
