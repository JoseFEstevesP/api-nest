import type pg from 'pg';

interface SystemRecord {
	uid: string;
	uidUser: string;
}

interface PlanRecord {
	uid: string;
	uidSystem: string;
	name: string;
	amount: number;
	currency: string;
	billingCycle: string;
}

const PLANS = [
	{ name: 'Plan Starter', amount: 9.99, currency: 'USD', cycle: 'monthly' },
	{ name: 'Plan Basic', amount: 19.99, currency: 'USD', cycle: 'monthly' },
	{ name: 'Plan Professional', amount: 49.99, currency: 'USD', cycle: 'monthly' },
	{ name: 'Plan Enterprise', amount: 99.99, currency: 'USD', cycle: 'monthly' },
	{ name: 'Plan Premium', amount: 149.99, currency: 'USD', cycle: 'monthly' },
];

export async function seedPlans(
	client: pg.PoolClient,
	systems: SystemRecord[],
): Promise<{ created: number; records: PlanRecord[] }> {
	const records: PlanRecord[] = [];

	const generatedSystems = systems.slice(0, 50);

	for (let i = 0; i < generatedSystems.length; i++) {
		const uid = crypto.randomUUID();
		const system = generatedSystems[i];
		const plan = PLANS[i % PLANS.length];

		await client.query(
			`INSERT INTO plans (uid, "uidSystem", name, amount, currency, "billingCycle", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`,
			[
				uid,
				system.uid,
				plan.name,
				plan.amount,
				plan.currency,
				plan.cycle,
			],
		);

		records.push({ uid, uidSystem: system.uid, name: plan.name, amount: plan.amount, currency: plan.currency, billingCycle: plan.cycle });
	}

	return { created: records.length, records };
}
