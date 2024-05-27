import { DataTypes } from "sequelize";
import { Table, Column, Model, BelongsTo } from "sequelize-typescript";
import { BookAttributes, BookCreationAttributes } from "../../interfaces/";
import User from "./user.model";

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

    @BelongsTo(() => User, {
        foreignKey: "userId",
    })
    user: User;
}

export default Book;
