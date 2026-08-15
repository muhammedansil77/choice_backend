import { Request, Response } from 'express';
import prisma from '../prisma';

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
    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || 'category',
      },
    });
    res.status(201).json({
      _id: category.id,
      id: category.id,
      name: category.name,
      icon: category.icon,
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
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(icon && { icon }),
      },
    });
    res.json({
      _id: category.id,
      id: category.id,
      name: category.name,
      icon: category.icon,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
