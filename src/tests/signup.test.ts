import request from "supertest";
import { app } from "../app";

describe("Sign Up Controller", () => {
    const signupUrl = "/user/createUser";

    const newUser = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "Password@123",
        confirmPassword: "Password@123",
        userRoleId: 3,
        phoneNumber: "1234567890",
    };

    test("Should return 400 if user already exists", async () => {
        const res = await request(app).post(signupUrl).send({ ...newUser, email: "test@stripe.com" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("User already exist. Please login!");
    });

    test("Should return 400 if passwords do not match", async () => {
        const res = await request(app)
            .post(signupUrl)
            .send({ ...newUser, confirmPassword: "WrongPassword" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Validation failed");
    });

    test("should return 200 and create a new user if data is valid", async () => {
        const res = await request(app).post(signupUrl).send(newUser);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("User created successfully");
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data).toHaveProperty("email", newUser.email);
    });

    test("should return 400 if user creation fails", async () => {
        const res = await request(app).post(signupUrl).send(newUser);

        expect(res.status).toBe(400);
    });
});
