import type pg from 'pg';

interface PaymentMethodRecord {
	uid: string;
	name: string;
}

const PAYMENT_METHODS = [
	{ name: 'card', description: 'Tarjeta de crédito/débito' },
	{ name: 'transfer', description: 'Transferencia bancaria' },
	{ name: 'paypal', description: 'PayPal' },
	{ name: 'crypto', description: 'Criptomonedas' },
];

export async function seedPaymentMethods(
	client: pg.PoolClient,
): Promise<{ created: number; records: PaymentMethodRecord[] }> {
	const records: PaymentMethodRecord[] = [];

	for (const method of PAYMENT_METHODS) {
		// Verificar si ya existe
		const existing = await client.query(
			'SELECT uid FROM payment_methods WHERE name = $1',
			[method.name],
		);

		if (existing.rows.length > 0) {
			records.push({ uid: existing.rows[0].uid, name: method.name });
			continue;
		}

		const uid = crypto.randomUUID();

		await client.query(
			`INSERT INTO payment_methods (uid, name, description, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, true, NOW(), NOW())`,
			[uid, method.name, method.description],
		);

		records.push({ uid, name: method.name });
	}

	return { created: records.length, records };
}
