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

interface SubscriptionRecord {
	uid: string;
	uidCompany: string;
	uidPlan: string;
}

interface PaymentMethodRecord {
	uid: string;
	name: string;
}

interface CompanyRecord {
	uid: string;
	uidUser: string;
}

interface PaymentRecord {
	uid: string;
	uidUser: string;
	uidSubscription: string;
	uidPaymentMethod: string;
	uidCompany: string;
}

const STATUSES = ['completed', 'completed', 'completed', 'pending', 'failed'];

function generateReference(index: number, method: string): string {
	const prefixes: Record<string, string> = {
		card: 'CARD',
		transfer: 'TRF',
		paypal: 'PPL',
		crypto: 'CRY',
	};
	return `${prefixes[method]}-${String(index).padStart(8, '0')}`;
}

export async function seedPayments(
	client: pg.PoolClient,
	users: UserRecord[],
	systems: SystemRecord[],
	subscriptions: SubscriptionRecord[],
	paymentMethods: PaymentMethodRecord[],
	companies: CompanyRecord[],
): Promise<{ created: number; records: PaymentRecord[] }> {
	const records: PaymentRecord[] = [];

	const generatedSubscriptions = subscriptions.slice(0, 50);
	const generatedCompanies = companies.slice(0, 50);
	const generatedUsers = users.slice(0, 50);

	for (let i = 0; i < generatedSubscriptions.length; i++) {
		const uid = crypto.randomUUID();
		const subscription = generatedSubscriptions[i];
		const paymentStatus = STATUSES[i % STATUSES.length];
		const method = paymentMethods[i % paymentMethods.length];
		const reference = generateReference(i + 1, method.name);

		const paymentDate = new Date();
		paymentDate.setMonth(
			paymentDate.getMonth() - Math.floor(Math.random() * 3),
		);

		const dueDate = new Date(paymentDate);
		dueDate.setMonth(dueDate.getMonth() + 1);

		const isCompleted = paymentStatus === 'completed';
		const paidAt = isCompleted ? new Date() : null;
		const amount = (Math.random() * 140 + 9.99).toFixed(2);

		const company = generatedCompanies[i % generatedCompanies.length];
		const user = generatedUsers[i % generatedUsers.length];

		await client.query(
			`INSERT INTO payments (uid, amount, currency, "paymentDate", "dueDate", "paidAt", "uidPaymentMethod", reference, "paymentStatus", status, description, "uidUser", "uidSubscription", "uidCompany", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
			[
				uid,
				amount,
				'USD',
				paymentDate,
				dueDate,
				paidAt,
				method.uid,
				isCompleted ? reference : null,
				paymentStatus,
				true,
				`Pago #${i + 1} - ${subscription.uidCompany}`,
				user.uid,
				subscription.uid,
				company.uid,
			],
		);

		records.push({
			uid,
			uidUser: subscription.uidCompany,
			uidSubscription: subscription.uid,
			uidPaymentMethod: method.uid,
			uidCompany: company.uid,
		});
	}

	return { created: records.length, records };
}
