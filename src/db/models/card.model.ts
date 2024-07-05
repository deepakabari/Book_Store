import { DataTypes } from "sequelize";
import { Table, Column, Model, BelongsTo } from "sequelize-typescript";
import { CardAttributes, CardCreationAttributes } from "../../interfaces";
import { User } from "./index";

@Table({
    timestamps: true,
    paranoid: true,
})
class Card extends Model<CardAttributes, CardCreationAttributes> {
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
        allowNull: true,
    })
    cardId: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    cardBrand: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    cardHolderName: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    cardNumber: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    cardLastFour: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    tokenId: string;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    expMonth: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    expYear: number;

    @BelongsTo(() => User, {
        foreignKey: "userId",
    })
    user: User;
}

export default Card;
