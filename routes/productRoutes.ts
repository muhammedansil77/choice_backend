import express from 'express';
import { createProduct, updateProduct, deleteProduct, getProducts, getProductById } from '../controllers/productController';
import { protect, admin } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, admin, upload.array('images', 5), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, upload.array('images', 5), updateProduct)
    .delete(protect, admin, deleteProduct);

export default router;
