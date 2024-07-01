"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Book", "quantity", {
            type: Sequelize.INTEGER,
            allowNull: false,
            after: "categoryId"
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("Book", "quantity");
    },
};
