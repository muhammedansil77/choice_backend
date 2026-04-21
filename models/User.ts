import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  coinBalance: number;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  coinBalance: { type: Number, default: 0 },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
