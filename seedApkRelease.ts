import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';
import ApkRelease from './models/ApkRelease';

dotenv.config();

const seedApk = async () => {
  try {
    await connectDB();

    const flutterApkPath = path.join(__dirname, '../frontend_flutter/build/app/outputs/flutter-apk/app-release.apk');
    const uploadDir = path.join(__dirname, 'uploads/apks');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const targetFileName = 'choice-electricals-pos-v1.0.0.apk';
    const targetFilePath = path.join(uploadDir, targetFileName);

    let fileSize = 52633600; // ~50.2 MB fallback

    if (fs.existsSync(flutterApkPath)) {
      fs.copyFileSync(flutterApkPath, targetFilePath);
      const stats = fs.statSync(targetFilePath);
      fileSize = stats.size;
      console.log(`Copied compiled APK from Flutter build to ${targetFilePath} (${(fileSize / (1024 * 1024)).toFixed(1)} MB)`);
    } else {
      console.log(`Using target file path ${targetFilePath}`);
    }

    // Mark previous releases as non-latest
    await ApkRelease.updateMany({}, { isLatest: false });

    // Upsert initial release
    let release = await ApkRelease.findOne({ versionName: '1.0.0' });
    if (!release) {
      release = new ApkRelease({
        appName: 'CHOICE Electricals POS',
        versionName: '1.0.0',
        versionCode: 6,
        fileName: targetFileName,
        originalFileName: 'CHOICE-Electricals-POS-v1.0.0.apk',
        filePath: targetFilePath,
        fileSize: fileSize,
        releaseNotes: 'Official initial production release featuring complete POS management, Nodemailer OTP verification, 2026 UI redesign, and adaptive launcher branding.',
        minimumAndroidVersion: 'Android 5.0 (Lollipop)+',
        isLatest: true,
        releaseDate: new Date(),
        downloadsCount: 0,
      });
      await release.save();
      console.log('Seeded initial APK release v1.0.0 successfully!');
    } else {
      release.filePath = targetFilePath;
      release.fileSize = fileSize;
      release.isLatest = true;
      await release.save();
      console.log('Updated existing APK release v1.0.0!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding APK release:', error);
    process.exit(1);
  }
};

seedApk();
