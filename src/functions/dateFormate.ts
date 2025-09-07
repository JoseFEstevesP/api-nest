import { format } from '@formkit/tempo';

export const dateFormate = (date: string | Date, formate?: string) => {
	const dateFormate = formate ? formate : 'DD/MM/YYYY';
	return format(date, dateFormate);
};
