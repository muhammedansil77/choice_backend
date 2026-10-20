"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.route('/profile').put(authMiddleware_1.protect, userController_1.updateUserProfile);
router.route('/register').post(userController_1.registerUser);
router.route('/summary').get(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.getDashboardSummary);
router.route('/')
    .post(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.createUser)
    .get(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.getUsers);
router.route('/:id/block').put(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.blockUser);
router.route('/:id/unblock').put(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.unblockUser);
router.route('/:id/coins').put(authMiddleware_1.protect, authMiddleware_1.admin, userController_1.addCoins);
exports.default = router;
