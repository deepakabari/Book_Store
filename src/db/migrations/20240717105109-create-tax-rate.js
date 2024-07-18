"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("TaxRate", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            stripeTaxRateId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            displayName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            jurisdiction: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            percentage: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            inclusive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("TaxRate");
    },
};
