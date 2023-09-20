import { describe, it, fail } from '@cva/run-figma-run'; // Replace with the correct path to types
import { Square } from './square';
import assert = require('assert');

describe('Square class', () => {
  it('constructor initializes properties correctly', (context) => {
    const square = new Square(10, 5, 5);
    assert.equal(square.size, 10);
    assert.equal(square.x, 5);
    assert.equal(square.y, 5);
  });

  describe('splitIntoQuarters method', () => {
    it('splits the square into 4 equal parts', (context) => {
      const square = new Square(10, 5, 5);
      const quarters = square.splitIntoQuarters();

      quarters.forEach((quarter) => {
        assert.equal(quarter.size, 5);
      });
    });

    it('maintains the same total area', (context) => {
      const square = new Square(10, 5, 5);
      const quarters = square.splitIntoQuarters();
      const totalArea = quarters.reduce(
        (sum, quarter) => sum + quarter.size * quarter.size,
        0
      );

      assert.equal(totalArea, square.size * square.size);
    });
  });
});

describe('Square Class', () => {
  it('should create an instance of Square', () => {
    const square = new Square(4, 1, 1);
    if (!(square instanceof Square)) {
      fail('Expected square to be instance of Square');
    }
  });

  describe('splitIntoQuarters', () => {
    it('should split a square into 4 equal squares', () => {
      const square = new Square(4, 2, 2);
      const quarters = square.splitIntoQuarters();

      if (quarters.length !== 4) {
        fail(`Expected 4 quarters but got ${quarters.length}`);
      }

      quarters.forEach((quarter) => {
        if (quarter.size !== 2) {
          fail(`Expected quarter size to be 2 but got ${quarter.size}`);
        }
      });
    });

    it('quarters should cover the same area', () => {
      const square = new Square(4, 2, 2);
      const quarters = square.splitIntoQuarters();

      const expectedQuarters = [
        new Square(2, 2, 2),
        new Square(2, 4, 2),
        new Square(2, 2, 4),
        new Square(2, 4, 4),
      ];

      expectedQuarters.forEach((expected, i) => {
        const actual = quarters[i];
        if (
            actual.x !== expected.x ||
            actual.y !== expected.y ||
            actual.size !== expected.size
        ) {
          fail(`Expected quarter to be at (x, y) = (${expected.x}, ${expected.y}) with size = ${expected.size},
                 but got (x, y) = (${actual.x}, ${actual.y}) with size = ${actual.size}`);
        }
      });
    });
  });
});