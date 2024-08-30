export interface PagedSearch<T> {
    currentPage: number;
    pageSize: number;
    totalResults: number;
    sortDirections: string;
    list: T[];
}
