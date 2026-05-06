import type pg from 'pg';

interface UserRecord {
	uid: string;
	email: string;
	uidRol: string;
}

interface SystemRecord {
	uid: string;
	uidUser: string;
}

const SYSTEM_NAMES = [
	'Sistema de Gestión',
	'Plataforma Central',
	'Dashboard Principal',
	'Portal de Usuario',
	'Sistema de Reportes',
	'Panel de Control',
	'Centro de Datos',
	'Sistema de Monitoreo',
	'Plataforma de Análisis',
	'Sistema de Notifications',
];

export async function seedSystems(
	client: pg.PoolClient,
	users: UserRecord[],
): Promise<{ created: number; records: SystemRecord[] }> {
	const records: SystemRecord[] = [];

	const generatedUsers = users.slice(3);

	for (let i = 0; i < generatedUsers.length; i++) {
		const uid = crypto.randomUUID();
		const user = generatedUsers[i];
		const name = `${SYSTEM_NAMES[i % SYSTEM_NAMES.length]} ${i + 1}`;

		await client.query(
			`INSERT INTO systems (uid, name, description, status, "uidUser", "createdAt", "updatedAt") VALUES ($1, $2, $3, true, $4, NOW(), NOW())`,
			[uid, name, `Sistema generado automáticamente #${i + 1}`, user.uid],
		);

		records.push({ uid, uidUser: user.uid });
	}

	return { created: records.length, records };
}