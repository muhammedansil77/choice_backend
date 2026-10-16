import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import prisma from '../prisma';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload a buffer to Cloudinary, falling back to base64 on failure
const uploadCategoryImage = async (file: any): Promise<string> => {
  return new Promise((resolve) => {
    if (!file || !file.buffer) {
      resolve('');
      return;
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'aoppp_categories',
      },
      (error, result) => {
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
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || 'category',
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
      image = req.body.image;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(icon && { icon }),
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
