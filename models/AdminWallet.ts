import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminWallet extends Document {
    totalCoins: number;
    distributedCoins: number;
    remainingCoins: number;
    updatedAt: Date;
}

const AdminWalletSchema: Schema = new Schema({
    totalCoins: { type: Number, default: 0 },
    distributedCoins: { type: Number, default: 0 },
    remainingCoins: { type: Number, default: 0 },
}, { timestamps: true });

// Pre-save hook to ensure remainingCoins is always calculated
AdminWalletSchema.pre<IAdminWallet>('save', function() {
    this.remainingCoins = this.totalCoins - this.distributedCoins;
});

export default mongoose.model<IAdminWallet>('AdminWallet', AdminWalletSchema);
