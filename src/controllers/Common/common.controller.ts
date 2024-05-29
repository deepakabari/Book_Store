import fs from "fs";
import path from "path";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import axios from "axios";
import json2xls from "json2xls";
import { Controller } from "../../interfaces";
import { ErrorHandler } from "../../middleware/errorHandler";
import archiver from "archiver";

/**
 * @function viewFile
 * @param req - The request object containing the file name.
 * @param res - The response object used to send back the file.
 * @param next - The next middleware function in the application’s request-response cycle.
 * @description Streams a file to the client if it exists, otherwise throws an error.
 */
export const viewFile: Controller = async (req, res, next) => {
    try {
        // Extract file name from request parameters
        const { fileName } = req.params;

        // Construct file path
        const filePath = path.join(__dirname, "..", "..", "public", "images", fileName);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            // If file doesn't exist, pass bad request to next error handler
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.FILE_NOT_FOUND);
        } else {
            // If file exists, set response content type based on file extension
            res.type(path.extname(fileName));

            // Stream the file to the response
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        // Pass any errors to the error-handling middleware
        next(error);
    }
};

/**
 * @function downloadFile
 * @param req - The request object containing the file name.
 * @param res - The response object used to send the file for download.
 * @param next - The next middleware function in the application’s request-response cycle.
 * @description Sends a file for the client to download if it exists, otherwise throws an error.
 */
export const downloadFile: Controller = async (req, res, next) => {
    try {
        // Extract the file name from the request parameters
        const { fileName } = req.params;

        // Construct the file path relative to the current directory
        const filePath = path.join(__dirname, "..", "..", "public", "images", fileName);

        if (!fs.existsSync(filePath)) {
            // If file doesn't exist, pass bad request to next error handler
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.FILE_NOT_FOUND);
        } else {
            // Send the file for download to the client
            res.download(filePath, fileName, (err) => {
                if (err) {
                    throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.ERROR_DOWNLOAD_FILE);
                }
            });
        }
    } catch (error) {
        // Pass any errors to the error-handling middleware
        next(error);
    }
};

/**
 * @function downloadFiles
 * @param req - The request object containing the file names to download.
 * @param res - The response object used to send back the file download.
 * @param next - The next middleware function in the application's request-response cycle.
 * @description This controller handles the creation of a ZIP archive containing the requested files and initiates the download process. It validates the input array of file names, creates a ZIP archive, and streams the archive to the client. If any file is not found, it sends an appropriate error response.
 */
export const downloadFiles: Controller = async (req, res, next) => {
    try {
        // Extract file name from request parameters
        const { fileNames } = req.body;

        // Validate fileNames array
        if (!Array.isArray(fileNames) || !fileNames.length) {
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.NO_FILE_SELECTED);
        }

        // Create a zip archive
        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        // Set response attachment as downloaded-files.zip
        res.attachment("downloaded-files.zip");

        // Pipe the archive to the response
        archive.pipe(res);

        // Iterate through each file name
        for (const fileName of fileNames) {
            const filePath = path.join(__dirname, "..", "..", "public", "images", fileName);

            if (fs.existsSync(filePath)) {
                // Append file to the archive
                archive.append(fs.createReadStream(filePath), {
                    name: fileName,
                });
            } else {
                return res.status(httpCode.BAD_REQUEST).json({
                    status: httpCode.BAD_REQUEST,
                    message: messageConstant.FILE_NOT_FOUND,
                });
            }
        }

        // Finalize the archive
        await archive.finalize();
    } catch (error) {
        next(error);
    }
};

/**
 * @function exportBooks
 * @param req - The request object containing the authorization token.
 * @param res - The response object used to send the Excel file for download.
 * @param next - The next middleware function in the application’s request-response cycle.
 * @description Fetches book data from an API, converts it to an Excel format, and sends it for the client to download.
 */
export const exportBooks: Controller = async (req, res, next) => {
    try {
        // Retrieve the authorization token from the request headers
        const token = req.headers.authorization as string;

        // Initialize variables for pagination and data storage
        let allData: any = [],
            page = 1,
            pageSize = 10,
            totalPages = 0;

        // Loop through all pages of book data
        do {
            // Fetch a page of book data from the API
            const response = await axios.get(
                `http://localhost:4000/book/getAllBooks?page=${page}&pageSize=${pageSize}`,
                {
                    headers: {
                        Authorization: token,
                    },
                },
            );
            // Parse the JSON response
            const jsonData = response.data;

            // Calculate the total number of pages based on the count and page size
            totalPages = Math.ceil(jsonData.data.count / pageSize);

            // Concatenate the current page of data to the allData array
            allData = allData.concat(jsonData.data.rows);

            // Increment the page number for the next iteration
            page++;
        } while (page <= totalPages);

        // Convert the collected book data to an Excel format
        const xls = json2xls(allData);

        // Create a filename with a timestamp
        const filename = `All_Books_${Date.now()}.xlsx`;

        // Write the Excel data to a file
        fs.writeFileSync(filename, xls, "binary");

        // Send the Excel file for download to the client
        res.download(filename, filename, () => {
            // After the file is sent, delete it from the server
            fs.unlinkSync(filename);
        });
    } catch (error) {
        // Pass any errors to the error-handling middleware
        next(error);
    }
};
