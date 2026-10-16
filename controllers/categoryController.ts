import { Request, Response } from 'express';
const cloudinary = require('cloudinary').v2;
import path from 'path';
import dotenv from 'dotenv';
import prisma from '../prisma';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfpey4ga9',
    api_key: process.env.CLOUDINARY_API_KEY || '615992456414723',
    api_secret: process.env.CLOUDINARY_API_SECRET || '2HNYqNo1KMlx9FbmVcaIQ9uxkCU',
  });
  return cloudinary;
};

const uploadBase64ToCloudinary = async (base64Str: string, folder: string): Promise<string> => {
  if (!base64Str || typeof base64Str !== 'string') return '';
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) return base64Str;
  try {
    const client = getCloudinary();
    const uploadRes = await client.uploader.upload(base64Str, { folder });
    return uploadRes.secure_url;
  } catch (err) {
    console.warn('Cloudinary base64 upload error:', err);
    return base64Str;
  }
};

// Helper to upload a buffer or base64 to Cloudinary, falling back to base64 on failure
const uploadCategoryImage = async (file: any): Promise<string> => {
  if (typeof file === 'string') {
    return uploadBase64ToCloudinary(file, 'aoppp_categories');
  }
  return new Promise((resolve) => {
    if (!file || !file.buffer) {
      resolve('');
      return;
    }
    const client = getCloudinary();
    const uploadStream = client.uploader.upload_stream(
      {
        folder: 'aoppp_categories',
      },
      (error: any, result: any) => {
        if (error || !result) {
          console.warn('Cloudinary upload failed, falling back to Base64:', error);
          const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          resolve(base64Image);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    const formatted = categories.map((c) => ({
      _id: c.id,
      id: c.id,
      name: c.name,
      icon: c.icon,
      image: (c as any).image || '',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon } = req.body;
    let image = req.body.image || '';

    if (req.file) {
      image = await uploadCategoryImage(req.file);
    } else if (image) {
      image = await uploadCategoryImage(image);
    }

    let finalIcon = icon || 'category';
    if (finalIcon && finalIcon.startsWith('data:image')) {
      finalIcon = await uploadCategoryImage(finalIcon);
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon: finalIcon,
        image: image || null,
      },
    });

    res.status(201).json({
      _id: category.id,
      id: category.id,
      name: category.name,
      icon: category.icon,
      image: (category as any).image || '',
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.category.delete({
      where: { id },
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, icon } = req.body;
    let image: string | undefined = undefined;

    if (req.file) {
      image = await uploadCategoryImage(req.file);
    } else if (req.body.image !== undefined) {
      image = await uploadCategoryImage(req.body.image);
    }

    let finalIcon: string | undefined = undefined;
    if (icon !== undefined) {
      finalIcon = icon && icon.startsWith('data:image') ? await uploadCategoryImage(icon) : icon;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(finalIcon && { icon: finalIcon }),
        ...(image !== undefined && { image }),
      },
    });

    res.json({
      _id: category.id,
      id: category.id,
      name: category.name,
      icon: category.icon,
      image: (category as any).image || '',
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
