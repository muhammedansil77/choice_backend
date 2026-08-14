import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import ApkRelease from '../models/ApkRelease';

export const getLatestApkInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    let latest = await ApkRelease.findOne({ isLatest: true });

    if (!latest) {
      latest = await ApkRelease.findOne().sort({ createdAt: -1 });
    }

    if (!latest) {
      res.status(404).json({ message: 'No APK release found' });
      return;
    }

    res.json(latest);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const downloadLatestApkFile = async (req: Request, res: Response): Promise<void> => {
  try {
    let latest = await ApkRelease.findOne({ isLatest: true });
    if (!latest) {
      latest = await ApkRelease.findOne().sort({ createdAt: -1 });
    }

    if (!latest || !fs.existsSync(latest.filePath)) {
      res.status(404).send('APK file not found on server');
      return;
    }

    // Increment download metrics
    latest.downloadsCount += 1;
    await latest.save();

    const downloadFileName = `CHOICE-Electricals-POS-${latest.versionName}.apk`;
    
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.download(latest.filePath, downloadFileName);
  } catch (error: any) {
    res.status(500).send('Error processing APK download');
  }
};

export const uploadNewApk = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Please attach an .apk file' });
      return;
    }

    const {
      appName,
      versionName,
      versionCode,
      releaseNotes,
      minimumAndroidVersion,
    } = req.body;

    if (!versionName) {
      res.status(400).json({ message: 'Version name is required' });
      return;
    }

    // Mark all existing releases as non-latest
    await ApkRelease.updateMany({}, { isLatest: false });

    const newRelease = new ApkRelease({
      appName: appName || 'CHOICE Electricals POS',
      versionName,
      versionCode: versionCode ? parseInt(versionCode, 10) : 1,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      releaseNotes: releaseNotes || 'General bug fixes, performance improvements, and brand updates.',
      minimumAndroidVersion: minimumAndroidVersion || 'Android 5.0 (Lollipop)+',
      releaseDate: new Date(),
      isLatest: true,
      downloadsCount: 0,
    });

    await newRelease.save();

    res.status(201).json({
      message: 'APK uploaded and published successfully!',
      release: newRelease,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error uploading APK' });
  }
};

export const getAllApkReleases = async (req: Request, res: Response): Promise<void> => {
  try {
    const releases = await ApkRelease.find().sort({ createdAt: -1 });
    res.json(releases);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteApkRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const release = await ApkRelease.findById(id);

    if (!release) {
      res.status(404).json({ message: 'Release not found' });
      return;
    }

    // Delete file from disk if exists
    if (fs.existsSync(release.filePath)) {
      try {
        fs.unlinkSync(release.filePath);
      } catch (err) {
        console.error('Error deleting APK file:', err);
      }
    }

    const wasLatest = release.isLatest;
    await ApkRelease.findByIdAndDelete(id);

    // If deleted release was latest, make the most recent remaining one latest
    if (wasLatest) {
      const nextLatest = await ApkRelease.findOne().sort({ createdAt: -1 });
      if (nextLatest) {
        nextLatest.isLatest = true;
        await nextLatest.save();
      }
    }

    res.json({ message: 'APK release deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
