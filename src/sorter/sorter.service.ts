import { Injectable } from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { BinaryHeap } from 'src/shared/data-structures/binary-heap';
import type {
  SortOrder,
  Algorithm,
  SortResult,
} from 'src/shared/types/sorter.types';

interface SortOptions<T> {
  algorithm: Algorithm;
  order: SortOrder;
  sortBy: keyof T;
}

interface AlgorithmOptions<T> {
  sortBy: keyof T;
  order: SortOrder;
}

@Injectable()
export class SorterService {
  sort<T extends Ticket>(items: T[], options: SortOptions<T>) {
    const { algorithm, order, sortBy } = options;

    switch (algorithm) {
      case 'bubbleSort':
        return this.bubbleSort(items, { order, sortBy });
      case 'mergeSort':
        return this.mergeSort(items, { order, sortBy });
      case 'heapSort':
        return this.heapSort(items, { order, sortBy });
      case 'selectionSort':
        return this.selectionSort(items, { order, sortBy });
      default:
        return { result: items, time: 0, operations: 0 };
    }
  }

  private bubbleSort<T extends Ticket>(
    items: T[],
    options: AlgorithmOptions<T>,
  ): SortResult<T> {
    const arr = [...items];
    let operations = 0;

    const compare = (a: T, b: T) => {
      operations++;
      return this.compare(a, b, options.order, options.sortBy);
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
      time: Number((end - start).toFixed(2)),
      operations,
    };
  }

  private selectionSort<T extends Ticket>(
    items: T[],
    options: AlgorithmOptions<T>,
  ): SortResult<T> {
    const arr = [...items];
    let operations = 0;

    const start = performance.now();

    for (let i = 0; i < arr.length - 1; i++) {
      let minIndex = i;

      for (let j = i + 1; j < arr.length; j++) {
        operations++;
        if (
          this.compare(arr[j], arr[minIndex], options.order, options.sortBy) < 0
        ) {
          minIndex = j;
        }
      }

      if (minIndex !== i) {
        operations++;
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      }
    }

    const end = performance.now();

    return {
      result: arr,
      time: Number((end - start).toFixed(2)),
      operations,
    };
  }

  private mergeSort<T extends Ticket>(
    items: T[],
    options: AlgorithmOptions<T>,
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
          this.compare(left[0], right[0], options.order, options.sortBy) <= 0
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
      time: Number((end - start).toFixed(2)),
      operations,
    };
  }

  private heapSort<T extends Ticket>(
    items: T[],
    options: AlgorithmOptions<T>,
  ): SortResult<T> {
    let operations = 0;

    const compare = (a: T, b: T) => {
      operations++;
      return this.compare(a, b, options.order, options.sortBy);
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
      time: Number((end - start).toFixed(2)),
      operations,
    };
  }

  private compare<T extends Ticket>(
    a: T,
    b: T,
    order: SortOrder,
    sortBy: keyof T,
  ): number {
    const valA = a[sortBy];
    const valB = b[sortBy];

    let diff = 0;

    if (valA instanceof Date && valB instanceof Date) {
      diff = valA.getTime() - valB.getTime();
    } else if (typeof valA === 'number' && typeof valB === 'number') {
      diff = valA - valB;
    } else if (typeof valA === 'string' && typeof valB === 'string') {
      diff = valA.localeCompare(valB);
    } else {
      diff = String(valA).localeCompare(String(valB));
    }

    return order === 'asc' ? diff : -diff;
  }
}
