import 'dotenv/config';
import pg from 'pg';
import { seedCompanies } from './seed/companies.seed.js';
import { seedPaymentMethods } from './seed/payment-methods.seed.js';
import { seedPayments } from './seed/payments.seed.js';
import { seedRoles } from './seed/roles.seed.js';
import { seedPlans } from './seed/plans.seed.js';
import { seedSubscriptions } from './seed/subscriptions.seed.js';
import { seedSystems } from './seed/systems.seed.js';
import { seedUsers } from './seed/users.seed.js';

const HOST = process.env.DATABASE_HOST;
const PORT = parseInt(process.env.DATABASE_PORT || '5432');

async function seed() {
	const pool = new pg.Pool({
		host: HOST,
		port: PORT,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB,
	});

	const client = await pool.connect();

	try {
		console.log('✓ Conexión a DB establecida');
		await client.query('BEGIN');

		console.log('\n🧹 Limpiando tablas existentes...');
		await client.query('DELETE FROM payments CASCADE');
		await client.query('DELETE FROM subscriptions CASCADE');
		await client.query('DELETE FROM plans CASCADE');
		await client.query('DELETE FROM companies CASCADE');
		await client.query('DELETE FROM systems CASCADE');
		await client.query('DELETE FROM users CASCADE');
		await client.query('DELETE FROM roles CASCADE');
		console.log('✓ Datos existentes eliminados');

		console.log('\n📦 Ejecutando seeds...\n');

		const rolesResult = await seedRoles(client);
		console.log(`✓ Roles: ${rolesResult.created} creados`);

		const usersResult = await seedUsers(client, rolesResult.records);
		console.log(`✓ Usuarios: ${usersResult.created} creados`);

		const systemsResult = await seedSystems(client, usersResult.records);
		console.log(`✓ Sistemas: ${systemsResult.created} creados`);

		const companiesResult = await seedCompanies(client, usersResult.records);
		console.log(`✓ Empresas: ${companiesResult.created} creados`);

		const plansResult = await seedPlans(client, systemsResult.records);
		console.log(`✓ Planes: ${plansResult.created} creados`);

		const paymentMethodsResult = await seedPaymentMethods(client);
		console.log(
			`✓ Métodos de pago: ${paymentMethodsResult.created} creados`,
		);

		const subscriptionsResult = await seedSubscriptions(
			client,
			companiesResult.records,
			plansResult.records,
		);
		console.log(`✓ Suscripciones: ${subscriptionsResult.created} creados`);

		const paymentsResult = await seedPayments(
			client,
			usersResult.records,
			systemsResult.records,
			subscriptionsResult.records,
			paymentMethodsResult.records,
			companiesResult.records,
		);
		console.log(`✓ Pagos: ${paymentsResult.created} creados`);

		await client.query('COMMIT');

		console.log('\n========================================');
		console.log('SEED COMPLETADO EXITOSAMENTE');
		console.log('========================================');
		console.log('\nResumen:');
		console.log(`  - Roles: ${rolesResult.created} (3 base + 50 generados)`);
		console.log(`  - Usuarios: ${usersResult.created} (3 base + 50 generados)`);
		console.log(`  - Sistemas: ${systemsResult.created}`);
		console.log(`  - Empresas: ${companiesResult.created}`);
		console.log(`  - Planes: ${plansResult.created}`);
		console.log(`  - Suscripciones: ${subscriptionsResult.created}`);
		console.log(`  - Pagos: ${paymentsResult.created}`);
		console.log('\nCredenciales de prueba:');
		console.log(
			'  Email: admin@admin.com | Password: P@ssw0rd123 | Rol: Administrador',
		);
		console.log(
			'  Email: test@test.com | Password: P@ssw0rd123 | Rol: Usuario',
		);
		console.log(
			'  Email: viewer@test.com | Password: P@ssw0rd123 | Rol: Visor',
		);
		console.log('========================================\n');

		client.release();
		await pool.end();
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error durante el seed:', error);
		client.release();
		await pool.end();
		process.exit(1);
	}
}

seed();
