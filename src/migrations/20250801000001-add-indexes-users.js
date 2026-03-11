/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		await queryInterface.addIndex('Users', ['email'], {
			unique: true,
			name: 'Users_email_unique',
		});
		await queryInterface.addIndex('Users', ['phone'], {
			unique: true,
			name: 'Users_phone_unique',
		});
		await queryInterface.addIndex('Users', ['uidRol'], {
			name: 'Users_uidRol_index',
		});
		await queryInterface.addIndex('Users', ['status'], {
			name: 'Users_status_index',
		});
		await queryInterface.addIndex('Users', ['activatedAccount'], {
			name: 'Users_activatedAccount_index',
		});
		await queryInterface.addIndex('Users', ['email', 'status'], {
			name: 'Users_email_status_index',
		});
		await queryInterface.addIndex('Users', ['phone', 'status'], {
			name: 'Users_phone_status_index',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeIndex('Users', 'Users_email_unique');
		await queryInterface.removeIndex('Users', 'Users_phone_unique');
		await queryInterface.removeIndex('Users', 'Users_uidRol_index');
		await queryInterface.removeIndex('Users', 'Users_status_index');
		await queryInterface.removeIndex('Users', 'Users_activatedAccount_index');
		await queryInterface.removeIndex('Users', 'Users_email_status_index');
		await queryInterface.removeIndex('Users', 'Users_phone_status_index');
	},
};
