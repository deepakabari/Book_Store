import { Router } from "express";
import { bookController } from "../../controllers";
import { celebrate } from "celebrate";
import { BookSchema } from "../../validations/book.valid";
import { upload } from "../../utils/multerConfig";
import isAuth from "../../middleware/in-auth";

const router: Router = Router();

router.use(isAuth);

router.get("/getAllBooks", bookController.getAllBooks);

router.get("/getBookById/:id", bookController.getBookById);

router.get("/getBooks", bookController.getBooks);

// POST /createBook
router.post("/createBook", upload.single("image"), celebrate(BookSchema.createBook), bookController.createBook);

// PATCH /updateBook/:id
router.patch("/book/:id", upload.single("image"), bookController.updateBook);

router.delete("/book/:id", bookController.deleteBook);

export default router;
