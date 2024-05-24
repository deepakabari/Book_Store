import { DataTypes } from "sequelize";
import { Table, Column, Model } from "sequelize-typescript";
import { CategoryAttributes, CategoryCreationAttributes } from "../../interfaces";

@Table({
    timestamps: true,
    paranoid: true,
})
class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    })
    name: string;
}

export default Category;
