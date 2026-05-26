export type HeapType = 'MinHeap' | 'MaxHeap';

export class BinaryHeap<T> {
  private heap: T[] = [];
  private readonly compare: (a: T, b: T) => number;
  private readonly type: HeapType;

  constructor(compareFn: (a: T, b: T) => number, type: HeapType = 'MaxHeap') {
    this.compare = compareFn;
    this.type = type;
  }

  push(value: T) {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);

    return root;
  }

  size() {
    return this.heap.length;
  }

  toDto() {
    return {
      __type: this.type,
      size: this.size(),
      state: {
        heap: this.heap,
      },
    };
  }

  private heapifyUp(index: number) {
    let parent = Math.floor((index - 1) / 2);

    while (index > 0 && this.compare(this.heap[index], this.heap[parent]) > 0) {
      this.swap(index, parent);
      index = parent;
      parent = Math.floor((index - 1) / 2);
    }
  }

  private heapifyDown(index: number) {
    const length = this.heap.length;

    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let largest = index;

      if (
        left < length &&
        this.compare(this.heap[left], this.heap[largest]) > 0
      ) {
        largest = left;
      }

      if (
        right < length &&
        this.compare(this.heap[right], this.heap[largest]) > 0
      ) {
        largest = right;
      }

      if (largest === index) break;

      this.swap(index, largest);
      index = largest;
    }
  }

  private swap(a: number, b: number) {
    [this.heap[a], this.heap[b]] = [this.heap[b], this.heap[a]];
  }
}
