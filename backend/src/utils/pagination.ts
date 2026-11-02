// Pagination helpers: the page shape returned by list endpoints and the row offset of a page.
// The shape of every paginated answer: the items of one page plus the total count, so the UI can build its pager.
export type Page<T> = {
	items: T[];
	total: number;
	page: number;
	limit: number;
};

export function toPage<T>(items: T[], total: number, page: number, limit: number): Page<T> {
	return { items, total, page, limit };
}

// Pages start at 1, but the database counts rows to skip from 0. Page 3 with 10 per page skips 20 rows.
export function pageToSkip(page: number, limit: number): number {
	return (page - 1) * limit;
}
