export default class Peekable<T> {
  iterator: Iterator<T, undefined, undefined>;
  peekedItem: IteratorResult<T, undefined> | null = null;
  peeked = false;

  constructor(iterator: Iterable<T>) {
    this.iterator = iterator[Symbol.iterator]();
  }

  next() {
    const next = this.peeked ? this.peekedItem : this.iterator.next();

    this.peekedItem = null;
    this.peeked = false;

    return next;
  }

  peek() {
    if (!this.peeked) {
      this.peekedItem = this.iterator.next();
      this.peeked = true;
    }

    return this.peekedItem;
  }
}
