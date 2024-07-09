import { celebrate } from "celebrate";
import { authController } from "../../controllers";
import { Router } from "express";
import { AuthSchema } from "../../validations/index";
import { wrapController } from "../../middleware/wrapController";

// Create a new router object
const router: Router = Router();

// POST /login
router.post("/login", celebrate(AuthSchema.login), wrapController(authController.login));

// POST /forgotPassword
router.post("/forgotPassword", celebrate(AuthSchema.forgotPassword), wrapController(authController.forgotPassword));

// POST /resetPassword/:hash
router.post("/resetPassword/:hash", celebrate(AuthSchema.resetPassword), wrapController(authController.resetPassword));

export default router;
