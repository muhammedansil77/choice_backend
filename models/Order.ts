import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    variant: {
        color: string;
        sizeOrName: string;
    };
    coinsSpent: number;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
}

const OrderSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: {
        color: { type: String, required: true },
        sizeOrName: { type: String, required: true },
    },
    coinsSpent: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
