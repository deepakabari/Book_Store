import { Router } from "express";
import { paymentController } from "../../controllers";
import isAuth from "../../middleware/in-auth";

const router: Router = Router();

router.use(isAuth);

router.post("/createCustomer/:userId", paymentController.createCustomer);

router.get("/payment-form/:email", paymentController.openPaymentForm);

router.post("/sendPaymentLink", paymentController.sendPaymentLink);

router.post("/addCardHolder/:userId", paymentController.addCardHolder);

router.post("/addCard/:userId", paymentController.addCard);

router.post("/createPaymentMethod/:email", paymentController.createPaymentMethod);

router.post("/authorize/:userId", paymentController.authorization);

router.post("/capture/:authId", paymentController.capture);

export default router;
