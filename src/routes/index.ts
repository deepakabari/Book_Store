import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";
import bookRoutes from "./book/book.route";
import categoryRoutes from "./category/category.route";

const router: Router = Router();

// route /auth
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/book", bookRoutes);
router.use("/category", categoryRoutes);

export default router;
