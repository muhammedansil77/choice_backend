import mongoose, { Schema, Document } from 'mongoose';

export interface IVariant {
    color: string;
    sizeOrName: string;
    stock: number;
}

export interface IProduct extends Document {
    name: string;
    description: string;
    images: string[];
    priceInCoins: number;
    variants: IVariant[];
}

const VariantSchema: Schema = new Schema({
    color: { type: String, required: true },
    sizeOrName: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
});

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    priceInCoins: { type: Number, required: true },
    variants: [VariantSchema],
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
