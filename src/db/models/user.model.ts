import { DataTypes } from "sequelize";
import { Table, Column, Model, HasMany, HasOne } from "sequelize-typescript";
import { UserAttributes, UserCreationAttributes } from "../../interfaces/index";
import { Card, Cart, Order, Payment } from "./index";

@Table({
    timestamps: true,
    paranoid: true,
})
class User extends Model<UserAttributes, UserCreationAttributes> {
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
    })
    email: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    password: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    firstName: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    lastName: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    status: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    phoneNumber: string;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    roleId: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    role: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    stripeCustomerId?: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    cardHolderId?: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    cardId?: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    resetToken: string;

    @Column({
        type: DataTypes.DATE,
        allowNull: true,
    })
    expireToken: string;

    @HasMany(() => Cart, {
        foreignKey: "userId",
    })
    carts: Cart[];

    @HasMany(() => Order, {
        foreignKey: "userId",
    })
    userOrders: Order[];

    @HasMany(() => Card, {
        foreignKey: "userId",
    })
    userCards: Card[];

    @HasOne(() => Payment, {
        foreignKey: "userId",
    })
    payment: Payment;
}

export default User;
