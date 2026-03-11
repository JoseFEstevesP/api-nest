import { format } from '@formkit/tempo';

export const dateFormate = (date: string | Date, formate?: string) => {
	const dateFormate = formate ? formate : 'DD/MM/YYYY';
	// Normalize potential non-breaking spaces or locale-specific quirks in the output
	const raw = format(date, dateFormate);
	return raw
		.replace(/\u00A0/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
};
