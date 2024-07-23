import { billingController, SubscriptionController, testClocKController } from "../../controllers";
import { Router } from "express";
import isAuth from "../../middleware/in-auth";
import { wrapController } from "../../middleware/wrapController";
import { celebrate } from "celebrate";
import { SubscriptionSchema } from "../../validations/subscription.valid";

// Create a new router object
const router: Router = Router();

router.use(isAuth);

router.get("/retrievePlan/:planId", wrapController(SubscriptionController.retrievePlan));

router.post("/createPlan", celebrate(SubscriptionSchema.createPlan), wrapController(SubscriptionController.createPlan));

router.post(
    "/create",
    celebrate(SubscriptionSchema.createSubscription),
    wrapController(SubscriptionController.createSubscription),
);

router.get("/retrieveSubscription/:userId", wrapController(SubscriptionController.retrieveSubscription));

router.patch(
    "/auto-renew",
    celebrate(SubscriptionSchema.cancelSubscription),
    wrapController(SubscriptionController.cancelSubscription),
);

router.post(
    "/resumeSubscription",
    celebrate(SubscriptionSchema.cancelSubscription),
    wrapController(SubscriptionController.resumeSubscription),
);

router.post("/createTestClock", wrapController(testClocKController.CreateTestClock));

router.post("/advanceTestClock", wrapController(testClocKController.advanceTestClock));

router.post("/billing/:userId", wrapController(billingController.createBillingSession));

router.post("/checkoutSub", celebrate(SubscriptionSchema.checkoutSub), wrapController(billingController.checkoutSub));

router.post(
    "/cancelSub",
    celebrate(SubscriptionSchema.cancelSubscription),
    wrapController(SubscriptionController.cancelDirect),
);

router.post(
    "/pauseSubscription",
    celebrate(SubscriptionSchema.cancelSubscription),
    wrapController(SubscriptionController.pauseCollection),
);

export default router;
