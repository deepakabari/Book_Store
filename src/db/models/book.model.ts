import { DataTypes } from "sequelize";
import { Table, Column, Model, BelongsTo, HasMany, AfterUpdate } from "sequelize-typescript";
import { BookAttributes, BookCreationAttributes } from "../../interfaces";
import { User, Cart } from "./index";
import { sendEmailToSeller } from "../../controllers/Book/book.controller";

@Table({
    timestamps: true,
    paranoid: true,
})
class Book extends Model<BookAttributes, BookCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    userId: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    })
    name: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    image: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    description: string;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    price: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    categoryId: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    quantity: number;

    @BelongsTo(() => User, {
        foreignKey: "userId",
    })
    user: User;

    @HasMany(() => Cart, {
        foreignKey: "bookId",
    })
    bookCarts: Cart[];

    @AfterUpdate
    static async sendEmailNotification(book: Book) {
        if (book.previous("quantity") !== book.quantity) {
            if (book.quantity === 5 || book.quantity === 0) {
                const user = await book.$get("user");
                if (user) {
                    await sendEmailToSeller(user.email, book, book.quantity === 0);
                }
            }
        }
    }
}

export default Book;
