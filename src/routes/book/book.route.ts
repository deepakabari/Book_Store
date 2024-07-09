import { Router } from "express";
import { bookController } from "../../controllers";
import { celebrate } from "celebrate";
import { BookSchema } from "../../validations/book.valid";
import { upload } from "../../utils/multerConfig";
import isAuth from "../../middleware/in-auth";
import { wrapController } from "../../middleware/wrapController";

const router: Router = Router();

router.use(isAuth);

router.get("/getAllBooks", wrapController(bookController.getAllBooks));

router.get("/getBookById/:id", wrapController(bookController.getBookById));

router.get("/getBooks", wrapController(bookController.getBooks));

router.post(
    "/createBook",
    upload.single("image"),
    celebrate(BookSchema.createBook),
    wrapController(bookController.createBook),
);

router.patch("/book/:id", upload.single("image"), wrapController(bookController.updateBook));

router.delete("/book/:id", wrapController(bookController.deleteBook));

export default router;
