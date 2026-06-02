import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import Product from '../models/Product';

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

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const filter = req.query.all === 'true' ? {} : { status: 'available' };
        const products = await Product.find(filter).sort('-createdAt');
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
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
            imagesList = await Promise.all((req.files as any[]).map(file => uploadImage(file)));
        } else if (req.body.images) {
            imagesList = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        const product = new Product({
            name,
            description,
            priceInCoins,
            category,
            stock: stock || 0,
            images: imagesList
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = req.body.name || product.name;
            product.description = req.body.description || product.description;
            product.priceInCoins = req.body.priceInCoins || product.priceInCoins;
            product.category = req.body.category || product.category;
            product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
            
            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                product.images = await Promise.all((req.files as any[]).map(file => uploadImage(file)));
            } else if (req.body.images) {
                product.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
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
        const product = await Product.findById(req.params.id);
        if (product) {
            product.status = 'blocked';
            await product.save();
            res.json({ message: 'Product blocked', product });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const unblockProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.status = 'available';
            await product.save();
            res.json({ message: 'Product unblocked', product });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
