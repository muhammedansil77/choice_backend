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
const uploadImage = async (file: any): Promise<string> => {
  return new Promise((resolve) => {
    if (!file || !file.buffer) {
      resolve('');
      return;
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'aoppp_products',
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

const formatProduct = (p: any) => ({
  _id: p.id,
  id: p.id,
  name: p.name,
  description: p.description,
  priceInCoins: p.priceInCoins,
  category: p.category,
  images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []),
  stock: p.stock,
  status: p.status,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const whereCondition = req.query.all === 'true' ? {} : { status: 'available' as const };
    const products = await prisma.product.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });
    res.json(products.map(formatProduct));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (product) {
      res.json(formatProduct(product));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, priceInCoins, category, stock } = req.body;

    let imagesList: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      imagesList = await Promise.all((req.files as any[]).map((file) => uploadImage(file)));
    } else if (req.body.images) {
      imagesList = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        priceInCoins: parseFloat(priceInCoins) || 0,
        category: category || 'General',
        stock: stock ? parseInt(stock, 10) : 0,
        images: imagesList,
        status: 'available',
      },
    });

    res.status(201).json(formatProduct(product));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    let imagesList: string[] | undefined;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      imagesList = await Promise.all((req.files as any[]).map((file) => uploadImage(file)));
    } else if (req.body.images) {
      imagesList = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.priceInCoins !== undefined && { priceInCoins: parseFloat(req.body.priceInCoins) }),
        ...(req.body.category && { category: req.body.category }),
        ...(req.body.stock !== undefined && { stock: parseInt(req.body.stock, 10) }),
        ...(imagesList && { images: imagesList }),
      },
    });

    res.json(formatProduct(updated));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (existing) {
      await prisma.product.delete({
        where: { id },
      });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const blockProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updated = await prisma.product.update({
      where: { id },
      data: { status: 'blocked' },
    });
    res.json({ message: 'Product blocked', product: formatProduct(updated) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const unblockProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updated = await prisma.product.update({
      where: { id },
      data: { status: 'available' },
    });
    res.json({ message: 'Product unblocked', product: formatProduct(updated) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
