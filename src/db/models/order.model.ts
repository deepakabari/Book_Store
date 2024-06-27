import { DataTypes } from "sequelize";
import { Table, Column, Model, BelongsTo } from "sequelize-typescript";
import { OrderAttributes, OrderCreationAttributes } from "../../interfaces";
import { User } from "./index";

@Table({
    timestamps: true,
    paranoid: true,
})
class Order extends Model<OrderAttributes, OrderCreationAttributes> {
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
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    cartId: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    })
    totalAmount?: number;

    @BelongsTo(() => User, {
        foreignKey: "userId",
    })
    user: User;
}

export default Order;
