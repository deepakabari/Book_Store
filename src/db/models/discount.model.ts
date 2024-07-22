import { DataTypes } from "sequelize";
import { Table, Column, Model } from "sequelize-typescript";
import { DiscountAttributes, DiscountCreationAttributes } from "../../interfaces";

@Table({
    timestamps: true,
    paranoid: true,
})
class Discount extends Model<DiscountAttributes, DiscountCreationAttributes> {
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
    code: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    stripeCouponId: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    description: string;

    @Column({
        type: DataTypes.FLOAT,
        allowNull: false,
    })
    percentage: number;

    @Column({
        type: DataTypes.FLOAT,
        allowNull: false,
    })
    minPrice: number;

    @Column({
        type: DataTypes.FLOAT,
        allowNull: true,
    })
    maxPercentage: number;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
    })
    isActive: number;
}

export default Discount;
