import { suite, test } from 'rfr'; // Replace with the correct path to types
import { Square } from './square';

suite('Square class', () => {
  test('constructor initializes properties correctly', (context) => {
    const square = new Square(10, 5, 5);
    context.failUnlessEqual(square.size, 10);
    context.failUnlessEqual(square.x, 5);
    context.failUnlessEqual(square.y, 5);
  });

  suite('splitIntoQuarters method', () => {
    test('splits the square into 4 equal parts', (context) => {
      const square = new Square(10, 5, 5);
      const quarters = square.splitIntoQuarters();

      quarters.forEach((quarter) => {
        context.failUnlessEqual(quarter.size, 5);
      });
    });

    test('maintains the same total area', (context) => {
      const square = new Square(10, 5, 5);
      const quarters = square.splitIntoQuarters();
      const totalArea = quarters.reduce(
        (sum, quarter) => sum + quarter.size * quarter.size,
        0
      );

      context.failUnlessEqual(totalArea, square.size * square.size);
    });
  });
});
