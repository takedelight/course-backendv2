import { Injectable } from '@nestjs/common';
import { BinaryHeap } from 'src/shared/data/binary-heap';

export interface SortableItem {
  createdAt: string | Date;
}

export type SortAlgorithm = 'bubbleSort' | 'mergeSort' | 'heapSort';
export type SortOrder = 'asc' | 'desc';

export interface SortResult<T> {
  result: T[];
  time: string;
  operations: number;
}

@Injectable()
export class SorterService {
  sort<T extends SortableItem>(
    items: T[],
    algorithm: string,
    order: SortOrder = 'asc',
  ): SortResult<T> {
    switch (algorithm) {
      case 'bubbleSort':
        return this.bubbleSort(items, order);
      case 'mergeSort':
        return this.mergeSort(items, order);
      case 'heapSort':
        return this.heapSort(items, order);
      default:
        return { result: items, time: '0ms', operations: 0 };
    }
  }

  private bubbleSort<T extends SortableItem>(
    items: T[],
    order: SortOrder,
  ): SortResult<T> {
    const arr = [...items];
    let operations = 0;

    const compare = (a: T, b: T) => {
      operations++;
      return this.compareDates(a.createdAt, b.createdAt, order);
    };

    const start = performance.now();

    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (compare(arr[j], arr[j + 1]) > 0) {
          operations++;
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }

    const end = performance.now();

    return {
      result: arr,
      time: `${(end - start).toFixed(2)}ms`,
      operations,
    };
  }

  private mergeSort<T extends SortableItem>(
    items: T[],
    order: SortOrder,
  ): SortResult<T> {
    let operations = 0;
    const start = performance.now();

    const mergeSortRecursive = (array: T[]): T[] => {
      if (array.length <= 1) return array;

      const mid = Math.floor(array.length / 2);
      const left = mergeSortRecursive(array.slice(0, mid));
      const right = mergeSortRecursive(array.slice(mid));

      return merge(left, right);
    };

    const merge = (left: T[], right: T[]): T[] => {
      const result: T[] = [];

      while (left.length && right.length) {
        operations++;
        if (
          this.compareDates(left[0].createdAt, right[0].createdAt, order) <= 0
        ) {
          result.push(left.shift()!);
        } else {
          result.push(right.shift()!);
        }
      }

      return [...result, ...left, ...right];
    };

    const sorted = mergeSortRecursive(items);
    const end = performance.now();

    return {
      result: sorted,
      time: `${(end - start).toFixed(2)}ms`,
      operations,
    };
  }

  private heapSort<T extends SortableItem>(
    items: T[],
    order: SortOrder,
  ): SortResult<T> {
    let operations = 0;

    const compare = (a: T, b: T) => {
      operations++;
      return this.compareDates(a.createdAt, b.createdAt, order);
    };

    const start = performance.now();
    const heap = new BinaryHeap(compare);

    for (const item of items) {
      operations++;
      heap.push(item);
    }

    const result: T[] = [];

    while (heap.size() > 0) {
      operations++;
      result.push(heap.pop()!);
    }

    const end = performance.now();

    return {
      result,
      time: `${(end - start).toFixed(2)}ms`,
      operations,
    };
  }

  private compareDates(
    a: string | Date,
    b: string | Date,
    order: SortOrder,
  ): number {
    const timeA = a instanceof Date ? a.getTime() : new Date(a).getTime();
    const timeB = b instanceof Date ? b.getTime() : new Date(b).getTime();
    const diff = timeA - timeB;
    return order === 'asc' ? diff : -diff;
  }
}
