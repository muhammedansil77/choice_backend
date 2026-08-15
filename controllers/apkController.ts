import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../prisma';

const formatRelease = (r: any) => ({
  _id: r.id,
  id: r.id,
  appName: r.appName,
  versionName: r.versionName,
  versionCode: r.versionCode,
  fileName: r.fileName,
  originalFileName: r.originalFileName,
  filePath: r.filePath,
  fileSize: r.fileSize,
  releaseNotes: r.releaseNotes,
  minimumAndroidVersion: r.minimumAndroidVersion,
  releaseDate: r.releaseDate,
  isLatest: r.isLatest,
  downloadsCount: r.downloadsCount,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

export const getLatestApkInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    let latest = await prisma.apkRelease.findFirst({ where: { isLatest: true } });

    if (!latest) {
      latest = await prisma.apkRelease.findFirst({ orderBy: { createdAt: 'desc' } });
    }

    if (!latest) {
      res.status(404).json({ message: 'No APK release found' });
      return;
    }

    res.json(formatRelease(latest));
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const downloadLatestApkFile = async (req: Request, res: Response): Promise<void> => {
  try {
    let latest = await prisma.apkRelease.findFirst({ where: { isLatest: true } });
    if (!latest) {
      latest = await prisma.apkRelease.findFirst({ orderBy: { createdAt: 'desc' } });
    }

    if (!latest) {
      res.status(404).send('APK release record not found in database. Please upload an APK via /admin/apk');
      return;
    }

    // Resolve path safely across Windows & Linux VPS environments
    const possiblePaths = [
      latest.filePath,
      path.join(process.cwd(), 'uploads/apks', latest.fileName),
      path.join(process.cwd(), 'backend/uploads/apks', latest.fileName),
      path.join(__dirname, '../../uploads/apks', latest.fileName),
      path.join(__dirname, '../uploads/apks', latest.fileName),
      path.join(__dirname, 'uploads/apks', latest.fileName),
    ];

    const validPath = possiblePaths.find((p) => p && fs.existsSync(p));

    if (!validPath) {
      console.error('APK file missing on VPS disk. Checked paths:', possiblePaths);
      res.status(404).send('APK file not found on server storage. Please upload a new APK at https://api.anzil.online/admin/apk');
      return;
    }

    // Increment download metrics
    await prisma.apkRelease.update({
      where: { id: latest.id },
      data: { downloadsCount: { increment: 1 } },
    });

    const downloadFileName = `CHOICE-Electricals-POS-${latest.versionName}.apk`;

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.download(validPath, downloadFileName);
  } catch (error: any) {
    res.status(500).send('Error processing APK download: ' + (error.message || error));
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
    await prisma.apkRelease.updateMany({ data: { isLatest: false } });

    const newRelease = await prisma.apkRelease.create({
      data: {
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
      },
    });

    res.status(201).json({
      message: 'APK uploaded and published successfully!',
      release: formatRelease(newRelease),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error uploading APK' });
  }
};

export const getAllApkReleases = async (req: Request, res: Response): Promise<void> => {
  try {
    const releases = await prisma.apkRelease.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(releases.map(formatRelease));
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteApkRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const release = await prisma.apkRelease.findUnique({ where: { id } });

    if (!release) {
      res.status(404).json({ message: 'Release not found' });
      return;
    }

    // Delete file from disk if exists
    let targetPath = release.filePath;
    if (!fs.existsSync(targetPath)) {
      targetPath = path.join(__dirname, '../../uploads/apks', release.fileName);
    }

    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
      } catch (err) {
        console.error('Error deleting APK file:', err);
      }
    }

    const wasLatest = release.isLatest;
    await prisma.apkRelease.delete({ where: { id } });

    // If deleted release was latest, make the most recent remaining one latest
    if (wasLatest) {
      const nextLatest = await prisma.apkRelease.findFirst({ orderBy: { createdAt: 'desc' } });
      if (nextLatest) {
        await prisma.apkRelease.update({
          where: { id: nextLatest.id },
          data: { isLatest: true },
        });
      }
    }

    res.json({ message: 'APK release deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
