/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		await queryInterface.addIndex('Roles', ['name'], {
			unique: true,
			name: 'Roles_name_unique',
		});
		await queryInterface.addIndex('Roles', ['typeRol'], {
			name: 'Roles_typeRol_index',
		});
		await queryInterface.addIndex('Roles', ['status'], {
			name: 'Roles_status_index',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeIndex('Roles', 'Roles_name_unique');
		await queryInterface.removeIndex('Roles', 'Roles_typeRol_index');
		await queryInterface.removeIndex('Roles', 'Roles_status_index');
	},
};
