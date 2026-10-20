import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * 1. Admin creates a new credit entry for a user
 */
export const createCreditEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      userId,
      invoiceNumber,
      date,
      category = 'electronic',
      billAmount = 0,
      receivedAmount = 0,
      returnAmount = 0,
      narration = '',
    } = req.body;

    if (!userId || !invoiceNumber) {
      res.status(400).json({ message: 'User ID and Invoice Number are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const bill = parseFloat(billAmount) || 0;
    const received = parseFloat(receivedAmount) || 0;
    const returned = parseFloat(returnAmount) || 0;
    const balance = Math.max(0, bill - received - returned);

    let status: 'unpaid' | 'partial' | 'settled' = 'unpaid';
    if (balance <= 0 && bill > 0) {
      status = 'settled';
    } else if (received > 0 || returned > 0) {
      status = 'partial';
    } else if (bill === 0 && received === 0 && returned === 0) {
      status = 'settled';
    }

    const cat = category.toString().toLowerCase() === 'hardware' ? 'hardware' : 'electronic';
    const cleanInvoice = invoiceNumber.toString().trim();
    const withoutInv = cleanInvoice.replace(/^INV-?/i, '');
    const withInv = `INV-${withoutInv}`;

    // Check if an entry with this invoice number already exists
    const existing = await prisma.creditEntry.findFirst({
      where: {
        OR: [
          { invoiceNumber: cleanInvoice },
          { invoiceNumber: withInv },
          { invoiceNumber: withoutInv },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    if (existing) {
      res.status(400).json({
        message: `Invoice #${existing.invoiceNumber} already exists for customer ${existing.user?.name || 'Customer'}. Cannot create a duplicate bill.`,
        existing,
      });
      return;
    }

    const entry = await prisma.creditEntry.create({
      data: {
        userId,
        invoiceNumber: invoiceNumber.toString().trim(),
        date: date ? new Date(date) : new Date(),
        category: cat,
        billAmount: bill,
        receivedAmount: received,
        returnAmount: returned,
        balanceAmount: balance,
        narration: narration ? narration.toString().trim() : null,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create credit entry' });
  }
};

/**
 * 2. Admin retrieves credit entries with search, filters & global summary
 */
export const getCreditEntriesByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, category, status, search } = req.query;

    const where: any = {};

    if (userId && typeof userId === 'string' && userId.trim() !== '' && userId !== 'all') {
      where.userId = userId.trim();
    }

    if (category && typeof category === 'string' && category.trim() !== '' && category !== 'all') {
      where.category = category.trim().toLowerCase() === 'hardware' ? 'hardware' : 'electronic';
    }

    if (status && typeof status === 'string' && status.trim() !== '' && status !== 'all') {
      where.status = status.trim().toLowerCase();
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { invoiceNumber: { contains: q } },
        { narration: { contains: q } },
        { user: { name: { contains: q } } },
        { user: { phoneNumber: { contains: q } } },
      ];
    }

    const [entries, allEntries] = await Promise.all([
      prisma.creditEntry.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      // Fetch for metrics based on filtered subset
      prisma.creditEntry.findMany({
        where,
        select: {
          billAmount: true,
          receivedAmount: true,
          returnAmount: true,
          balanceAmount: true,
        },
      }),
    ]);

    const totalBilled = allEntries.reduce((sum, e) => sum + (e.billAmount || 0), 0);
    const totalReceived = allEntries.reduce((sum, e) => sum + (e.receivedAmount || 0), 0);
    const totalReturned = allEntries.reduce((sum, e) => sum + (e.returnAmount || 0), 0);
    const totalOutstanding = allEntries.reduce((sum, e) => sum + (e.balanceAmount || 0), 0);

    res.json({
      summary: {
        totalBilled,
        totalReceived,
        totalReturned,
        totalOutstanding,
        totalCount: entries.length,
      },
      entries,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch credit entries' });
  }
};

/**
 * 3. Admin gets credit ledger summary for a specific user
 */
export const getUserCreditSummaryByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phoneNumber: true, email: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const entries = await prisma.creditEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const totalBilled = entries.reduce((sum, e) => sum + (e.billAmount || 0), 0);
    const totalReceived = entries.reduce((sum, e) => sum + (e.receivedAmount || 0), 0);
    const totalReturned = entries.reduce((sum, e) => sum + (e.returnAmount || 0), 0);
    const totalOutstanding = entries.reduce((sum, e) => sum + (e.balanceAmount || 0), 0);

    res.json({
      user,
      summary: {
        totalBilled,
        totalReceived,
        totalReturned,
        totalOutstanding,
        totalInvoices: entries.length,
      },
      entries,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch user credit summary' });
  }
};

/**
 * 4. Flutter App User views their own credit ledger statement
 */
export const getMyCreditLedger = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const userId = req.user.id;
    const { category, status } = req.query;

    const where: any = { userId };

    if (category && typeof category === 'string' && category.trim() !== '' && category.toLowerCase() !== 'all') {
      where.category = category.trim().toLowerCase() === 'hardware' ? 'hardware' : 'electronic';
    }

    if (status && typeof status === 'string' && status.trim() !== '' && status.toLowerCase() !== 'all') {
      where.status = status.trim().toLowerCase();
    }

    const entries = await prisma.creditEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Also get all un-filtered entries for accurate global totals
    const allUserEntries = await prisma.creditEntry.findMany({
      where: { userId },
      select: {
        billAmount: true,
        receivedAmount: true,
        returnAmount: true,
        balanceAmount: true,
      },
    });

    const totalBilled = allUserEntries.reduce((sum, e) => sum + (e.billAmount || 0), 0);
    const totalReceived = allUserEntries.reduce((sum, e) => sum + (e.receivedAmount || 0), 0);
    const totalReturned = allUserEntries.reduce((sum, e) => sum + (e.returnAmount || 0), 0);
    const totalOutstanding = allUserEntries.reduce((sum, e) => sum + (e.balanceAmount || 0), 0);

    res.json({
      summary: {
        totalBilled,
        totalReceived,
        totalReturned,
        totalOutstanding,
        totalInvoices: entries.length,
      },
      entries,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch personal credit ledger' });
  }
};

/**
 * 5. Admin updates an existing credit entry
 */
export const updateCreditEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const {
      invoiceNumber,
      date,
      category,
      billAmount,
      receivedAmount,
      returnAmount,
      narration,
    } = req.body;

    const existing = await prisma.creditEntry.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Credit entry not found' });
      return;
    }

    const bill = billAmount !== undefined ? parseFloat(billAmount) : existing.billAmount;
    const received = receivedAmount !== undefined ? parseFloat(receivedAmount) : existing.receivedAmount;
    const returned = returnAmount !== undefined ? parseFloat(returnAmount) : existing.returnAmount;
    const balance = Math.max(0, bill - received - returned);

    let status: 'unpaid' | 'partial' | 'settled' = 'unpaid';
    if (balance <= 0 && bill > 0) {
      status = 'settled';
    } else if (received > 0 || returned > 0) {
      status = 'partial';
    } else if (bill === 0 && received === 0 && returned === 0) {
      status = 'settled';
    }

    const updated = await prisma.creditEntry.update({
      where: { id },
      data: {
        ...(invoiceNumber ? { invoiceNumber: invoiceNumber.toString().trim() } : {}),
        ...(date ? { date: new Date(date) } : {}),
        ...(category ? { category: category.toString().toLowerCase() === 'hardware' ? 'hardware' : 'electronic' } : {}),
        billAmount: bill,
        receivedAmount: received,
        returnAmount: returned,
        balanceAmount: balance,
        narration: narration !== undefined ? (narration ? narration.toString().trim() : null) : existing.narration,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update credit entry' });
  }
};

/**
 * 6. Admin deletes a credit entry
 */
export const deleteCreditEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.creditEntry.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Credit entry not found' });
      return;
    }

    await prisma.creditEntry.delete({ where: { id } });

    res.json({ message: 'Credit entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete credit entry' });
  }
};

/**
 * 7. Admin fetches existing invoice details by invoice number
 */
export const getInvoiceByNumber = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoiceNumber = String(req.params.invoiceNumber || '').trim();
    if (!invoiceNumber) {
      res.status(400).json({ message: 'Invoice number is required' });
      return;
    }

    const clean = invoiceNumber.trim();
    const withoutInv = clean.replace(/^INV-?/i, '');
    const withInv = `INV-${withoutInv}`;

    const entry = await prisma.creditEntry.findFirst({
      where: {
        OR: [
          { invoiceNumber: clean },
          { invoiceNumber: withInv },
          { invoiceNumber: withoutInv },
          { invoiceNumber: { contains: clean } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!entry) {
      res.status(404).json({ message: `Invoice #${invoiceNumber} not found` });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch invoice' });
  }
};

