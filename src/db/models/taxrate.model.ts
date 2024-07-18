import { DataTypes } from "sequelize";
import { Table, Column, Model } from "sequelize-typescript";
import { TaxRateAttributes, TaxRateCreationAttributes } from "../../interfaces";

@Table({
    timestamps: true,
    paranoid: true,
})
class TaxRate extends Model<TaxRateAttributes, TaxRateCreationAttributes> {
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
    stripeTaxRateId: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    displayName: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    description: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    jurisdiction: string;

    @Column({
        type: DataTypes.FLOAT,
        allowNull: false,
    })
    percentage: number;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
    })
    inclusive: boolean;
}

export default TaxRate;
