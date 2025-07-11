'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Users', {
			uid: {
				type: Sequelize.UUID,
				primaryKey: true,
				unique: true,
				allowNull: false,
			},
			v_e: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			ci: {
				type: Sequelize.STRING,
				unique: true,
			},
			first_name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			middle_name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			first_surname: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			last_surname: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			sex: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			phone: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			status: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
				allowNull: false,
			},
			code: {
				type: Sequelize.STRING,
			},
			activatedAccount: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
			attemptCount: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
			dataOfAttempt: {
				type: Sequelize.STRING,
				defaultValue: null,
			},
			uidRol: {
				type: Sequelize.UUID,
				references: {
					model: 'Roles',
					key: 'uid',
				},
				onUpdate: 'CASCADE',
				onDelete: 'SET NULL',
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('Users');
	},
};
