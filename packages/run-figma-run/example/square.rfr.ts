import { Square } from './Square.ts';
import { Suite, rfr } from '../src/index.ts';

export const result = rfr('Square Class', (describe: Suite) => {
  describe.it('should create an instance of Square', () => {
    const square = new Square(4, 1, 1);
    if (!(square instanceof Square)) {
      fail('Expected square to be instance of Square');
    }
  });

  describe.describe('splitIntoQuarters', (subDescribe: Suite) => {
    subDescribe.it('should split a square into 4 equal squares', () => {
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

    subDescribe.it('quarters should cover the same area', () => {
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
}).catch((e) => console.error(e));

console.log(result);
