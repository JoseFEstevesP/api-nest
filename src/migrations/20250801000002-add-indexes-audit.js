/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		await queryInterface.addIndex('Audit', ['uidUser'], {
			name: 'Audit_uidUser_index',
		});
		await queryInterface.addIndex('Audit', ['createdAt'], {
			name: 'Audit_createdAt_index',
		});
		await queryInterface.addIndex('Audit', ['uidUser', 'createdAt'], {
			name: 'Audit_uidUser_createdAt_index',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeIndex('Audit', 'Audit_uidUser_index');
		await queryInterface.removeIndex('Audit', 'Audit_createdAt_index');
		await queryInterface.removeIndex('Audit', 'Audit_uidUser_createdAt_index');
	},
};
