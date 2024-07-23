import fs from "fs";
import path from "path";
import { Controller } from "../../interfaces";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { Book, Cart, Category } from "../../db/models";
import { Order } from "sequelize";
import { logger } from "../../utils/logger";
import { ErrorHandler } from "../../middleware/errorHandler";
import { Op } from "sequelize";
import { sendEmail } from "../../utils/email";
import linkConstant from "../../constants/link.constant";
import { compileEmailTemplate } from "../../utils/hbsCompiler";
import { sendSuccessResponse } from "../../middleware/responseHandler";

/**
 * @function getAllBooks
 * @param req - The request object containing query parameters for sorting and pagination.
 * @param res - The response object to send back the retrieved books.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code, message, and data of all books.
 * @description - Retrieves a list of books with pagination and sorting options.
 */
export const getAllBooks: Controller = async (req, res, next) => {
    // Extract query parameters
    const { sortBy, orderBy, page, pageSize, keyword } = req.query;

    // Calculate pagination parameters
    const pageNumber = parseInt(page as string, 10) || 1;
    const limit = parseInt(pageSize as string, 10) || 10;
    const offset = (pageNumber - 1) * limit;

    // Define sorting order based on query parameters
    const order = sortBy && orderBy ? ([[sortBy, orderBy]] as Order) : [];

    // Query the database to get all books with optional keyword search
    const getAllBooks = await Book.findAndCountAll({
        order,
        limit,
        offset,
        where: {
            ...(keyword
                ? {
                      [Op.or]: [
                          { name: { [Op.like]: `%${keyword}%` } },
                          { description: { [Op.like]: `%${keyword}%` } },
                      ],
                  }
                : {}),
        },
    });

    if (!getAllBooks.rows) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND));
    }

    // Return response with block history data
    return sendSuccessResponse(res, messageConstant.BOOK_RETRIEVED, getAllBooks);
};

/**
 * @function getBookById
 * @param req - The request object containing the book ID as a parameter.
 * @param res - The response object to send back the retrieved book.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code, message, and data of the requested book.
 * @description - Retrieves a single book by its unique identifier.
 */
export const getBookById: Controller = async (req, res, next) => {
    const { id } = req.params;

    // Checking if the book already exists in the database
    const existingBook = await Book.findByPk(id);

    // If book exists, send a BAD_REQUEST error
    if (!existingBook) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND));
    }

    return sendSuccessResponse(res, messageConstant.BOOK_RETRIEVED, existingBook);
};

/**
 * @function getBooks
 * @param req - The request object containing the user's ID to retrieve their books.
 * @param res - The response object to send back the retrieved books.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code, message, and data of the user's books.
 * @description - Retrieves all books associated with the requesting user's ID.
 */
export const getBooks: Controller = async (req, res, next) => {
    const { page, pageSize, keyword } = req.query;
    const userId = req.user.id;

    // Calculate pagination parameters
    const pageNumber = parseInt(page as string, 10) || 1;
    const limit = parseInt(pageSize as string, 10) || 10;
    const offset = (pageNumber - 1) * limit;

    // Query the database to get all books with optional keyword search
    const getBooks = await Book.findAndCountAll({
        where: {
            userId,
            ...(keyword
                ? {
                      [Op.or]: [
                          { name: { [Op.like]: `%${keyword}%` } },
                          { description: { [Op.like]: `%${keyword}%` } },
                      ],
                  }
                : {}),
        },
        limit,
        offset,
    });

    if (!getBooks.rows) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND));
    }

    return sendSuccessResponse(res, messageConstant.BOOK_RETRIEVED, getBooks);
};

/**
 * @function createBook
 * @param req - The request object containing the new book's details and the uploaded file.
 * @param res - The response object to send back the status of the book creation.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code, message, and data of the newly created book.
 * @description - Creates a new book entry in the database with the provided details.
 */
export const createBook: Controller = async (req, res, next) => {
    // Destructuring the request body to get book details
    const { name, description, price, categoryId, quantity } = req.body;

    // Checking if the book already exists in the database
    const existingBook = await Book.findOne({ where: { name } });

    // If book exists, send a BAD_REQUEST error
    if (existingBook) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.BOOK_ALREADY_EXISTS));
    }

    // Checking if the category exists in the database
    const category = await Category.findOne({ where: { id: categoryId } });

    // If category not exists, pass a NOT_FOUND error
    if (!category) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.CATEGORY_NOT_EXISTS));
    }

    // If no file is uploaded, send a NOT_FOUND error
    if (!req.file) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.FILE_NOT_UPLOADED));
    }

    // Creating a new book entry with the provided details
    const newBook = await Book.create({
        userId: req.user.id,
        name,
        image: req.file.filename,
        description,
        price,
        categoryId,
        quantity,
    });

    // If book creation fails, send a BAD_REQUEST error
    if (!newBook) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.BOOK_CREATION_FAILED));
    }

    // If book is created successfully, send an OK response with the new book data
    return sendSuccessResponse(res, messageConstant.BOOK_CREATED, newBook);
};

/**
 * @function updateBook
 * @param req - The request object containing the book ID and updated details.
 * @param res - The response object to send back the status of the book update.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code and message indicating the update status.
 * @description - Updates an existing book's details in the database.
 */
export const updateBook: Controller = async (req, res, next) => {
    // Getting the book ID from request parameters
    const { id } = req.params;

    // Destructuring the request body to get updated book details
    const { name, description, price, categoryId, quantity } = req.body;

    // Finding the book by its primary key (id)
    const existingBook = await Book.findByPk(id);

    // If book is not found, send a BAD_REQUEST response
    if (!existingBook) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND));
    }

    if (existingBook.userId !== req.user.id) {
        return next(new ErrorHandler(httpCode.UNAUTHORIZED, messageConstant.ACCESS_DENIED));
    }

    // Checking if the category exists in the database
    if (categoryId) {
        const category = await Category.findOne({ where: { id: categoryId } });

        // If category not exists, pass a NOT_FOUND error
        if (!category) {
            return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.CATEGORY_NOT_EXISTS));
        }
    }

    if (req.file && req.file?.filename !== existingBook.image) {
        clearImage(existingBook.image);
    }

    // Updating the book with new details
    await Book.update(
        {
            name,
            image: req.file?.path,
            description,
            price,
            categoryId,
            quantity,
        },
        { where: { id } },
    );

    // If update is successful, send an OK response
    return sendSuccessResponse(res, messageConstant.BOOK_UPDATED);
};

/**
 * @function deleteBook
 * @param req - The request object containing the book ID to be deleted.
 * @param res - The response object to send back the status of the book deletion.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code and message indicating the deletion status.
 * @description - Deletes a book from the database based on its unique identifier.
 */
export const deleteBook: Controller = async (req, res, next) => {
    const { id } = req.params;

    // Finding the book by its primary key (id)
    const existingBook = await Book.findByPk(id);

    // If book is not found, send a BAD_REQUEST response
    if (!existingBook) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND));
    }

    if (existingBook.userId !== req.user.id) {
        return next(new ErrorHandler(httpCode.UNAUTHORIZED, messageConstant.NOT_AUTHORIZED));
    }

    const bookInCart = await Cart.findOne({ where: { bookId: id } });
    if (bookInCart) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.BOOK_IN_CART));
    }

    clearImage(existingBook.image);

    await Book.destroy({
        where: { id },
    });

    return sendSuccessResponse(res, messageConstant.BOOK_DELETED);
};

export const sendEmailToSeller = async (email: string, book: Book, isOutOfStock: boolean) => {
    const addBookLink = `${linkConstant.BOOK_URL}/${book.id}`;
    const deleteBookLink = `${linkConstant.BOOK_URL}/${book.id}`;
    let subject: string;
    let html: string;

    const reminderTemplate = {
        book: book.name,
        addBookLink,
        deleteBookLink,
    };

    const lowTemplate = {
        book: book.name,
        addBookLink,
    };

    if (isOutOfStock) {
        subject = "Book out of stock";
        html = await compileEmailTemplate("reminder-seller", reminderTemplate);
    } else {
        subject = "Reminder to add book quantity";
        html = await compileEmailTemplate("low-seller", lowTemplate);
    }

    sendEmail({ to: email, subject, html });
};

const clearImage = (image: string) => {
    image = path.join(__dirname, "..", "..", "public", "images", image);
    fs.unlink(image, (err) => {
        logger.error(err);
    });
};
