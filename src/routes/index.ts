import { Router } from "express";
import authRoutes from "./auth/auth.routes";

const router: Router = Router();

// route /auth
router.use("/auth", authRoutes);

export default router;
