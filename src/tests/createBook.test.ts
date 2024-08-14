import request from "supertest";
import { app } from "../app";

describe("Create Book Controller", () => {
    const createBookUrl = "/book/createBook";
    const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJsaW5pcjcxMDAzQGRvdmlub3UuY29tIiwiZmlyc3ROYW1lIjoiTGluIiwibGFzdE5hbWUiOiJNYWphIiwicGhvbmVOdW1iZXIiOiI5OTA5ODEyMTIxIiwicm9sZUlkIjoyLCJpYXQiOjE3MjE3MzQ3MjEsImV4cCI6MTcyMTgyMTEyMX0.JBcJWHYLFYuDtsujYy1Rk64_UASnLQyvdTr74M4Ca5U";

    let bookNameCounter = 0;

    beforeEach(() => {
        bookNameCounter++;
    });

    const newBookDetails = () => ({
        name: `New Book${bookNameCounter}`,
        description: "A description of the new book",
        price: 19.99,
        categoryId: 1,
        quantity: 10,
    });

    // Test case: Book already exists
    it("should return 400 if book already exists", async () => {
        const bookDetails = newBookDetails();
        const res = await request(app)
            .post(createBookUrl)
            .set("Authorization", `Bearer ${token}`)
            .attach("image", Buffer.from("fake image content"), "test.jpg")
            .field(bookDetails);

        expect(res.body.message).toBe("Book with same name already exist. Please choose a different name!");
    });

    // Test case: Category not found
    it("should return 404 if category does not exist", async () => {
        const res = await request(app)
            .post(createBookUrl)
            .set("Authorization", `Bearer ${token}`)
            .attach("image", Buffer.from("fake image content"), "test.jpg")
            .field({ ...newBookDetails(), categoryId: 999 });

        expect(res.body.message).toBe("Category not exists.");
    });

    // Test case: File not uploaded
    it("should return 404 if file not uploaded", async () => {
        const res = await request(app)
            .post(createBookUrl)
            .set("Authorization", `Bearer ${token}`)
            .field(newBookDetails());

        expect(res.body.message).toBe("Please Upload the file with valid extension(.png, .jpg, .jpeg)");
    });

    // Test case: Successful book creation
    it("should return 200 and create a new book if data is valid", async () => {
        const res = await request(app)
            .post(createBookUrl)
            .set("Authorization", `Bearer ${token}`)
            .attach("image", Buffer.from("fake image content"), "test.jpg")
            .field(newBookDetails());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Book created successfully");
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data).toHaveProperty("name", newBookDetails.name);
    });

    // Test case: Book creation fails
    it("should return 404 if book creation fails", async () => {
        const res = await request(app)
            .post(createBookUrl)
            .set("Authorization", `Bearer ${token}`)
            .attach("image", Buffer.from("fake image content"), "test.jpg")
            .field(newBookDetails());

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Book creation failed");
    });
});
