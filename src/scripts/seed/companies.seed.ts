import type pg from 'pg';

interface UserRecord {
	uid: string;
	email: string;
	uidRol: string;
}

interface CompanyRecord {
	uid: string;
	uidUser: string;
}

const COMPANY_TYPES = [
	'C.A.',
	'C.A.',
	'Corp',
	'Group',
	'Solutions',
	'Services',
	'Industries',
	'Technologies',
	'Consulting',
	'Associates',
];

const COMPANY_WORDS = [
	'Tech',
	'Data',
	'Cloud',
	'Digital',
	'Innovate',
	'Smart',
	'Global',
	'Prime',
	'Elite',
	'Apex',
];

function generateRIF(index: number): string {
	const num = String(index).padStart(8, '0');
	return `J-${num}-${String(index % 10)}`;
}

export async function seedCompanies(
	client: pg.PoolClient,
	users: UserRecord[],
): Promise<{ created: number; records: CompanyRecord[] }> {
	const records: CompanyRecord[] = [];

	const generatedUsers = users.slice(3);

	for (let i = 0; i < generatedUsers.length; i++) {
		const uid = crypto.randomUUID();
		const user = generatedUsers[i];
		const word1 = COMPANY_WORDS[i % COMPANY_WORDS.length];
		const word2 = COMPANY_TYPES[i % COMPANY_TYPES.length];
		const rif = generateRIF(i + 1);

		await client.query(
			`INSERT INTO companies (uid, rif, name, "razonSocial", direccion, telefono, email, contacto, "telefonoContacto", status, "uidUser", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, NOW(), NOW())`,
			[
				uid,
				rif,
				`${word1} ${word2}`,
				`${word1} ${word2} C.A.`,
				`Av. Principal ${i + 1}`,
				`0212${String(1000000 + i).padStart(7, '0')}`,
				`contacto@${word1.toLowerCase()}${word2.toLowerCase()}.com`,
				`Contacto ${i + 1}`,
				`0414${String(1000000 + i).padStart(7, '0')}`,
				user.uid,
			],
		);

		records.push({ uid, uidUser: user.uid });
	}

	return { created: records.length, records };
}