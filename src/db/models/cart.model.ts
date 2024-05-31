import { BelongsTo, Column, Model, Table } from "sequelize-typescript";
import { CartAttributes, CartCreationAttributes } from "../../interfaces";
import { DataTypes } from "sequelize";
import { Book, User } from "./index";

@Table({
    timestamps: true,
    paranoid: true,
})
class Cart extends Model<CartAttributes, CartCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    bookId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    userId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    quantity: number;

    @Column({ type: DataTypes.BOOLEAN, allowNull: true })
    isPlaced: boolean;

    @BelongsTo(() => User, {
        foreignKey: "userId",
    })
    user: User;

    @BelongsTo(() => Book, {
        foreignKey: "bookId",
    })
    book: Book;
}

export default Cart;
