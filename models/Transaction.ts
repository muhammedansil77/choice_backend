import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    user: mongoose.Types.ObjectId;
    amount: number;
    type: 'added' | 'deducted' | 'purchase';
    description: string;
}

const TransactionSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit', 'purchase', 'added', 'deducted'], required: true },
    description: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
