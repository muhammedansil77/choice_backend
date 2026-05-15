import express from 'express';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../controllers/categoryController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
