import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";

const router: Router = Router();

// route /auth
router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;
