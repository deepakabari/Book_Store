'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcrypt');
module.exports = {
    async up(queryInterface) {
        const users = [
            {
                email: 'admin123@yopmail.com',
                password: 'Password@123',
                firstName: 'admin1',
                lastName: 'test1',
                status: 'Active',
                phoneNumber: '919876543210',
                roleId: 1,
                role: 'Admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'admin456@yopmail.com',
                password: 'Password@123',
                firstName: 'admin2',
                lastName: 'test2',
                status: 'Active',
                phoneNumber: '919638527410',
                roleId: 1,
                role: 'Admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
        const hashedUsers = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 12);
                return { ...user, password: hashedPassword };
            }),
        );
        return await queryInterface.bulkInsert('User', hashedUsers, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('User', null, {});
    },
};
