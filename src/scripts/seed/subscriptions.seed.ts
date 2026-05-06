import type pg from 'pg';

interface CompanyRecord {
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

export async function seedSubscriptions(
	client: pg.PoolClient,
	companies: CompanyRecord[],
	plans: PlanRecord[],
): Promise<{ created: number; records: { uid: string; uidCompany: string; uidPlan: string }[] }> {
	const records: { uid: string; uidCompany: string; uidPlan: string }[] = [];

	const generatedPlans = plans.slice(0, 50);
	const generatedCompanies = companies.slice(0, 50);

	for (let i = 0; i < generatedPlans.length; i++) {
		const uid = crypto.randomUUID();
		const plan = generatedPlans[i];
		const company = generatedCompanies[i % generatedCompanies.length];

		const startDate = new Date();
		const endDate = new Date();
		endDate.setFullYear(endDate.getFullYear() + 1);

		await client.query(
			`INSERT INTO subscriptions (uid, "uidCompany", "uidPlan", "startDate", "endDate", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())`,
			[
				uid,
				company.uid,
				plan.uid,
				startDate,
				endDate,
			],
		);

		records.push({ uid, uidCompany: company.uid, uidPlan: plan.uid });
	}

	return { created: records.length, records };
}