/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Audit', {
			uid: {
				type: Sequelize.UUID,
				primaryKey: true,
				unique: true,
				allowNull: false,
				defaultValue: Sequelize.UUIDV4,
			},
			uidUser: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'Users',
					key: 'uid',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			refreshToken: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			dataToken: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: false,
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
		await queryInterface.dropTable('Audit');
	},
};
