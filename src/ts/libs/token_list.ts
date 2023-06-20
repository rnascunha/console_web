export class TokenList<T> {
  private readonly _value: Set<T>;
  constructor(values?: Iterable<T>) {
    this._value = new Set<T>(values);
  }

  contains(value: T): boolean {
    return this._value.has(value);
  }

  add(...args: T[]): boolean {
    let added: boolean = false;
    args.forEach(v => {
      if (!this.contains(v)) {
        this._value.add(v);
        added = true;
      }
    });
    return added;
  }

  remove(...args: T[]): boolean {
    let removed: boolean = false;
    args.forEach(v => {
      if (this._value.delete(v)) removed = true;
    });
    return removed;
  }

  toggle(value: T): void {
    if (this.contains(value)) this.remove(value);
    else this.add(value);
  }
}
