import { Order } from "sequelize";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { Book, Category } from "../../db/models";
import { Controller } from "../../interfaces";
import { ErrorHandler } from "../../middleware/errorHandler";

/**
 * @function createCategory
 * @param req - The request object containing the category name.
 * @param res - The response object to send back the creation status.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code, message, and data of the new category.
 * @description - Creates a new category in the database if it does not already exist.
 */
export const createCategory: Controller = async (req, res, next) => {
    try {
        // Extract the name from the request body
        const { name } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({
            where: { name },
        });

        // If the category exists, pass a conflict error to errorhandler middleware
        if (existingCategory) {
            throw new ErrorHandler(httpCode.CONFLICT, messageConstant.CATEGORY_EXISTS);
        }

        // Create a new category with the provided name
        const newCategory = await Category.create({
            name,
        });

        // Return the new category data with an OK status
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CATEGORY_CREATED,
            data: newCategory,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function updateCategory
 * @param req - The request object containing the category ID and new name.
 * @param res - The response object to send back the update status.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code and message indicating the update status.
 * @description - Updates an existing category's name in the database.
 */
export const updateCategory: Controller = async (req, res, next) => {
    try {
        // Extract the ID and new name from the request
        const { id } = req.params;
        const { name } = req.body;

        // Find the category by its primary key (ID)
        const existingCategory = await Category.findByPk(id);

        // If the category does not exist, pass a NOT_FOUND error
        if (!existingCategory) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.CATEGORY_NOT_EXISTS);
        }

        // Update the category with the new name
        await Category.update({ name }, { where: { id } });

        // Return an OK status with a message indicating the update was successful
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CATEGORY_UPDATED,
        });
    } catch (error: any) {
        // If a SequelizeUniqueConstraintError occurs, send a CONFLICT response
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new ErrorHandler(httpCode.CONFLICT, messageConstant.CATEGORY_NAME_UNIQUE);
        }
        next(error);
    }
};

/**
 * @function deleteCategory
 * @param req - The request object containing the category ID.
 * @param res - The response object to send back the delete status.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code and message indicating the delete status.
 * @description - Deletes an existing category from the database.
 */
export const deleteCategory: Controller = async (req, res, next) => {
    try {
        // Getting the category ID from request parameters
        const { id } = req.params;

        // Find the category by its primary key (ID)
        const existingCategory = await Category.findByPk(id);

        // If the category does not exist, return a NOT_FOUND response
        if (!existingCategory) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.CATEGORY_NOT_EXISTS);
        }

        // Check if there are any books associated with this category
        const booksInCategory = await Book.findAll({
            where: { categoryId: id },
        });

        // If there are books in the category, prevent deletion
        if (booksInCategory.length > 0) {
            throw new ErrorHandler(httpCode.CONFLICT, messageConstant.CATEGORY_HAS_BOOKS);
        }

        // If no books are associated, proceed with deletion
        await Category.destroy({
            where: { id },
        });

        // Return a success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CATEGORY_DELETED,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @function getCategories
 * @param req - The request object containing query parameters for sorting and pagination. (optional).
 * @param res - The response object to send back the retrieved categories.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code and message and data of all categories.
 * @description - Retrieves a list of categories with pagination and sorting options.
 */
export const getCategories: Controller = async (req, res, next) => {
    try {
        // Extract query parameters
        const { sortBy, orderBy, page, pageSize } = req.query;

        // Calculate pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Define sorting order based on query parameters
        const order = sortBy && orderBy ? ([[sortBy, orderBy]] as Order) : [];

        const getCategories = await Category.findAndCountAll({
            order,
            limit,
            offset,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CATEGORY_RETRIEVED,
            data: getCategories,
        });
    } catch (error) {
        next(error);
    }
};
