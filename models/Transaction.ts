import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    senderId: mongoose.Types.ObjectId | string;
    receiverId: mongoose.Types.ObjectId | string;
    amount: number;
    transactionType: 'mint' | 'distribution' | 'purchase' | 'reclaim';
    note: string;
    createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
    senderId: { type: Schema.Types.Mixed, required: true }, // Can be 'ADMIN' or User ID
    receiverId: { type: Schema.Types.Mixed, required: true }, // Can be 'ADMIN' or User ID
    amount: { type: Number, required: true },
    transactionType: { 
        type: String, 
        enum: ['mint', 'distribution', 'purchase', 'reclaim'], 
        required: true 
    },
    note: { type: String },
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
