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

// Helper to upload a buffer to Cloudinary, falling back to base64 on failure
const uploadImage = async (file: any): Promise<string> => {
  if (!file) return '';
  if (typeof file === 'string') {
    if (file.startsWith('data:image')) {
      try {
        const client = getCloudinary();
        const uploadRes = await client.uploader.upload(file, { folder: 'aoppp_products' });
        return uploadRes.secure_url;
      } catch (err) {
        console.warn('Cloudinary upload error for base64 product image:', err);
        return file;
      }
    }
    return file;
  }
  return new Promise((resolve) => {
    if (!file.buffer) {
      resolve('');
      return;
    }
    try {
      const client = getCloudinary();
      const uploadStream = client.uploader.upload_stream(
        {
          folder: 'aoppp_products',
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
      uploadStream.on('error', (err: any) => {
        console.warn('uploadStream stream error:', err);
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        resolve(base64Image);
      });
      uploadStream.end(file.buffer);
    } catch (err) {
      console.warn('Error initiating uploadStream:', err);
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      resolve(base64Image);
    }
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
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      imagesList = await Promise.all((req.files as any[]).map((file) => uploadImage(file)));
    } else if (req.body.images) {
      const rawList = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      imagesList = await Promise.all(rawList.map((img: any) => uploadImage(img)));
    }

    const productStatus = (req.body.status === 'blocked' || req.body.status === 'unavailable') ? 'blocked' : 'available';

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        priceInCoins: parseFloat(priceInCoins) || 0,
        category: category || 'General',
        stock: stock ? parseInt(stock, 10) : 0,
        images: imagesList,
        status: productStatus,
      },
    });

    res.status(201).json(formatProduct(product));
  } catch (error: any) {
    console.error('Error in createProduct:', error);
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
      const rawList = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      imagesList = await Promise.all(rawList.map((img: any) => uploadImage(img)));
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.priceInCoins !== undefined && { priceInCoins: parseFloat(req.body.priceInCoins) }),
        ...(req.body.category && { category: req.body.category }),
        ...(req.body.stock !== undefined && { stock: parseInt(req.body.stock, 10) }),
        ...(req.body.status && { 
          status: (req.body.status === 'blocked' || req.body.status === 'unavailable') ? 'blocked' : 'available' 
        }),
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
