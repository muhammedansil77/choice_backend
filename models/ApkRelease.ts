import mongoose, { Document, Schema } from 'mongoose';

export interface IApkRelease extends Document {
  appName: string;
  versionName: string;
  versionCode: number;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  releaseNotes?: string;
  releaseDate: Date;
  minimumAndroidVersion: string;
  isLatest: boolean;
  downloadsCount: number;
}

const ApkReleaseSchema: Schema = new Schema(
  {
    appName: {
      type: String,
      default: 'CHOICE Electricals POS',
      required: true,
    },
    versionName: {
      type: String,
      required: true,
    },
    versionCode: {
      type: Number,
      default: 1,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    releaseNotes: {
      type: String,
      default: 'General bug fixes, performance improvements, and brand updates.',
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    minimumAndroidVersion: {
      type: String,
      default: 'Android 5.0 (Lollipop)+',
    },
    isLatest: {
      type: Boolean,
      default: true,
    },
    downloadsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IApkRelease>('ApkRelease', ApkReleaseSchema);
