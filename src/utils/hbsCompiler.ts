import fs from "fs";
import path from "path";
import * as exphbs from "express-handlebars";

const compileEmailTemplate = async (templateName: string, data: object) => {
    try {
        const hbsFile = await fs.promises.readFile(
            path.join(__dirname, "..", "public", "templates", `${templateName}.hbs`),
            "utf8",
        );
        const hbs = exphbs.create({
            extname: ".hbs",
            defaultLayout: false,
        }).handlebars;
        const template = hbs.compile(hbsFile, {});
        return template(data);
    } catch (err) {
        console.error(err);
        throw new Error("Failed to compile email template");
    }
};

export { compileEmailTemplate };
