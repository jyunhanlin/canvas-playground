const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const colorPalettes = require('nice-color-palettes/1000.json');

const GRID_COUNT = 20;
const GRID_MARGIN_RATIO = 0.9;
const COLORS = random.pick(random.shuffle(colorPalettes));

const settings = {
  dimensions: [2048, 2048],
};

const createGrid = () => {
  const points = [];
  for (let x = 0; x < GRID_COUNT; x += 1) {
    for (let y = 0; y < GRID_COUNT; y += 1) {
      const u = GRID_COUNT < 2 ? 0.5 : x / (GRID_COUNT - 1);
      const v = GRID_COUNT < 2 ? 0.5 : y / (GRID_COUNT - 1);

      points.push({
        color: random.pick(COLORS),
        position: [u, v],
        angle: Math.PI * (random.noise2D(u, v) + 2),
        sideLength: Math.abs(random.noise2D(u, v) * 200),
      });
    }
  }

  return points;
};

const sketch = () => {
  const points = createGrid(); // .filter(() => Math.random() > 0.55);

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    points.forEach((data) => {
      const {
        position: [u, v],
        color,
        angle,
        sideLength
      } = data;
      const x = lerp(width * GRID_MARGIN_RATIO, width - width * GRID_MARGIN_RATIO, u);
      const y = lerp(height * GRID_MARGIN_RATIO, height - height * GRID_MARGIN_RATIO, v);

      const triangle = {
        x1: x,
        y1: y,

        x2: x + sideLength,
        y2: y,

        x3: x + sideLength * Math.cos(angle),
        y3: y + sideLength * Math.sin(angle),
      };

      context.beginPath();
      // context.arc(x, y, 40, 0, Math.PI * 2);

      context.moveTo(triangle.x1, triangle.y1);
      context.lineTo(triangle.x2, triangle.y2);
      context.lineTo(triangle.x3, triangle.y3);
      context.globalAlpha = 0.7;

      // context.fillStyle = color;
      // context.fill();


      context.closePath();
      context.strokeStyle = color;
      context.lineWidth = 5;
      context.stroke();
    });
  };
};

canvasSketch(sketch, settings);
