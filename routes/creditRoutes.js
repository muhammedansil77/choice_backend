"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const creditController_1 = require("../controllers/creditController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Flutter Mobile App User: View own credit ledger
router.get('/my-ledger', authMiddleware_1.protect, creditController_1.getMyCreditLedger);
// Admin: View specific user credit summary
router.get('/user/:userId', authMiddleware_1.protect, authMiddleware_1.admin, creditController_1.getUserCreditSummaryByAdmin);
// Admin: Lookup existing invoice by invoice number (for auto-fetch)
router.get('/invoice/:invoiceNumber', authMiddleware_1.protect, authMiddleware_1.admin, creditController_1.getInvoiceByNumber);
// Admin: CRUD operations for credit entries
router.get('/', authMiddleware_1.protect, authMiddleware_1.admin, creditController_1.getCreditEntriesByAdmin);
router.post('/', authMiddleware_1.protect, authMiddleware_1.admin, creditController_1.createCreditEntry);
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.admin, creditController_1.updateCreditEntry);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.admin, creditController_1.deleteCreditEntry);
exports.default = router;
