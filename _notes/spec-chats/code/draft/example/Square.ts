export class Square {
  constructor(public size: number, public x: number, public y: number) {}

  /**
   * Splits the square into 4 equal squares covering the same area.
   * @returns An array of 4 new Square instances.
   */
  splitIntoQuarters(): Square[] {
    const halfSize = this.size / 2;
    return [
      new Square(halfSize, this.x, this.y),
      new Square(halfSize, this.x + halfSize, this.y),
      new Square(halfSize, this.x, this.y + halfSize),
      new Square(halfSize, this.x + halfSize, this.y + halfSize),
    ];
  }
}
