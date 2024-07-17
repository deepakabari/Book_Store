import messageConstant from "../../../constants/message.constant";
import httpCode from "../../../constants/http.constant";
import stripe from "../../../db/config/stripe";
import { Controller } from "../../../interfaces";

const TEST_CLOCK_ID = process.env.TEST_CLOCK as string;

// Controller to create a new test clock in Stripe
export const CreateTestClock: Controller = async (req, res, next) => {
    // Get the current Unix time (seconds since epoch)
    const unixTime = Math.floor(Date.now() / 1000);

    // Create a new test clock with the current frozen time
    const testClock = await stripe.testHelpers.testClocks.create({
        name: "Monthly Renewal",
        frozen_time: unixTime,
    });

    // Return the created test clock in the response
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.TEST_CLOCK_CREATED,
        data: testClock,
    });
};

// Controller to advance an existing test clock to a new date
export const advanceTestClock: Controller = async (req, res, next) => {
    // Extract the new date from the request body
    const { date } = req.body;

    // Convert the new date to a JavaScript Date object
    const newDate = new Date(date);

    // Get the Unix time (seconds since epoch) of the new date
    const unixTime = Math.floor(newDate.getTime() / 1000);

    // Advance the test clock to the new frozen time
    const testClock = await stripe.testHelpers.testClocks.advance(TEST_CLOCK_ID, {
        frozen_time: unixTime,
    });

    // Return the advanced test clock in the response
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.TEST_CLOCK_CREATED,
        data: testClock,
    });
};
