import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";
import bookRoutes from "./book/book.route";
import categoryRoutes from "./category/category.route";
import commonRoutes from "./common/common.route";
import cartRoutes from "./cart/cart.route";
import orderRoutes from "./order/order.route";

const router: Router = Router();

// route /auth
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/book", bookRoutes);
router.use("/category", categoryRoutes);
router.use("/common", commonRoutes);
router.use("/cart", cartRoutes);
router.use("/order", orderRoutes);

export default router;
