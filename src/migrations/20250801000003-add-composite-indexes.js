module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addIndex('Users', ['status', 'uidRol'], {
			name: 'idx_user_status_rol',
		});
		await queryInterface.addIndex('Users', ['status', 'activatedAccount'], {
			name: 'idx_user_status_active',
		});
		await queryInterface.addIndex('Audit', ['uidUser', 'createdAt'], {
			name: 'idx_audit_user_created',
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeIndex('Users', 'idx_user_status_rol');
		await queryInterface.removeIndex('Users', 'idx_user_status_active');
		await queryInterface.removeIndex('Audit', 'idx_audit_user_created');
	},
};
