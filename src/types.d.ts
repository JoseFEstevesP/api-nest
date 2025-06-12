export interface ErrorsAll {
	[key: string]: {
		message: any;
	};
}

export interface PaginationResult<T> {
	rows: T[];
	count: number;
	currentPage: number;
	nextPage: number | null;
	previousPage: number | null;
	limit: number;
	pages: number;
}
