const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes/1000.json');

const X_COUNT = 7;
const Y_COUNT = 4;
const CUBE_X_COUNT = 6;
const CUBE_Y_COUNT = 3;

const settings = {
  dimensions: [2048, 1024],
};

const createIrregularQuadrilateral = () => {
  const shapes = [];

  const xStep = 1 / X_COUNT;
  const yStep = 1 / Y_COUNT;

  for (let x = 0; x < X_COUNT; x += 1) {
    for (let y = 0; y < Y_COUNT; y += 1) {
      const paths = [];
      let u = 0;
      let v = 0;

      if (x === 0 && y === 0) {
        paths.push([u, v]);
        paths.push([u + xStep + random.range(0, xStep), 0]);
        paths.push([u + xStep + random.range(0, xStep), v + yStep + random.range(0, yStep)]);
        paths.push([u, v + yStep]);
      } else if (x !== 0 && y === 0) {
        const leftShape = shapes[(x - 1) * Y_COUNT];
        [u, v] = leftShape.paths[1];
        paths.push(leftShape.paths[1]);
        paths.push([u + xStep, 0]);
        paths.push([u + xStep + random.range(0, xStep), v + yStep + random.range(0, yStep)]);
        paths.push(leftShape.paths[2]);
      } else if (x === 0 && y !== 0) {
        const topShape = shapes[y - 1];
        [u, v] = topShape.paths[3];
        paths.push(topShape.paths[3]);
        paths.push(topShape.paths[2]);
        paths.push([u + xStep + random.range(0, xStep), v + yStep + random.range(0, yStep)]);
        paths.push([u, v + yStep]);
      } else {
        const currentIndex = x * Y_COUNT + y;
        const topShape = shapes[currentIndex - 1];
        const leftShape = shapes[currentIndex - Y_COUNT];
        paths.push(topShape.paths[3]);
        paths.push(topShape.paths[2]);
        paths.push([
          topShape.paths[2][0] + random.range(0, xStep),
          leftShape.paths[2][1] + random.range(0, yStep),
        ]);
        paths.push(leftShape.paths[2]);
      }

      if (paths.length) {
        shapes.push({
          color: random.pick(random.pick(palettes)),
          paths,
        });
      }
    }
  }

  return shapes;
};

const createRectangle = () => {
  const shapes = [];

  for (let x = 0; x < CUBE_X_COUNT; x += 1) {
    for (let y = 0; y < CUBE_Y_COUNT; y += 1) {
      let u = x / CUBE_X_COUNT;
      let v = y / CUBE_Y_COUNT;

      shapes.push({
        paths: [
          [u, v],
          [u + 1 / CUBE_X_COUNT, v],
          [u + 1 / CUBE_X_COUNT, v + 1 / CUBE_Y_COUNT],
          [u, v + 1 / CUBE_Y_COUNT],
        ],
      });
    }
  }

  return shapes;
};

const sketch = () => {
  const irregularQuadrilateral = createIrregularQuadrilateral();
  const rectangles = createRectangle();

  console.log(irregularQuadrilateral);
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    irregularQuadrilateral.forEach(({ paths, color }) => {
      context.beginPath();
      paths.forEach(([u, v]) => {
        const x = u * width;
        const y = v * height;
        context.lineTo(x, y);
      });

      context.fillStyle = color;
      context.fill();
    });

    rectangles.forEach(({ paths }) => {
      context.beginPath();
      paths.forEach(([u, v]) => {
        const x = u * width;
        const y = v * height;
        context.lineTo(x, y);
      });

      context.closePath();
      context.strokeStyle = 'black';
      context.lineWidth = 25;
      context.stroke();
    });
  };
};

canvasSketch(sketch, settings);
