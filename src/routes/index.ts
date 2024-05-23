import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";
import bookRoutes from "./book/book.route";

const router: Router = Router();

// route /auth
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/book", bookRoutes);

export default router;
