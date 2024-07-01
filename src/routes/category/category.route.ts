import { Router } from "express";
import { categoryController } from "../../controllers";
import isAuth from "../../middleware/in-auth";
import { celebrate } from "celebrate";
import { CategorySchema } from "../../validations/category.valid";

const router: Router = Router();

router.use(isAuth);

router.get("/getCategories", categoryController.getCategories);

router.get("/categoryById/:categoryId", categoryController.categoryById);

router.post("/createCategory", celebrate(CategorySchema.createCategory), categoryController.createCategory);

router.patch("/category/:id", celebrate(CategorySchema.createCategory), categoryController.updateCategory);

router.delete("/category/:id", categoryController.deleteCategory);

export default router;
