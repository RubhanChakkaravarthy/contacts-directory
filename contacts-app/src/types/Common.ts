export interface PaginatedDto<T> {
  items: T[];
  paginationInfo: PaginationInfo;
  sortInfo?: SortInfo
}
  
export interface ResponseDto<T> {
  success: boolean,
  data: T,
  errors: {
    field: string,
    message: string
  }[]
  statusCode: number
}

export interface SortInfo {
  sortBy: string;
  sortOrder: 0 | 1; // 0 for ascending, 1 for descending
}
  
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalRecords?: number;
  totalPages?: number;
}

  // Define types for objects
export interface JsonObject {
  [key: string]: any;
}

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace';
  path: string;
  value?: any;
}