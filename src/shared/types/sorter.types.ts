export interface SortField {
  createdAt: string | Date;
  id: string;
  VIN: string;
}

export type SortAlgorithm =
  | 'bubbleSort'
  | 'mergeSort'
  | 'heapSort'
  | 'selectionSort';

export type SortOrder = 'asc' | 'desc';

export interface SortResult<T> {
  result: T[];
  time: number;
  operations: number;
}
