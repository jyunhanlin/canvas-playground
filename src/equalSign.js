const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const palettes = require('nice-color-palettes/1000.json');
const random = require('canvas-sketch-util/random');

const GRID_COUNT = 30;

let palette = random.pick(palettes);

palette = random.shuffle(palette);
// palette = palette.slice(0, random.rangeFloor(3, palette.length + 1));

const background = palette.shift();

const settings = {
  dimensions: [2048, 2048],
};

const createGrid = () => {
  const points = [];

  for (let x = 0; x < GRID_COUNT; x += 1) {
    for (let y = 0; y < GRID_COUNT; y += 1) {
      const u = x / (GRID_COUNT - 1);
      const v = y / (GRID_COUNT - 1);

      const radius = Math.abs(random.noise2D(u, v)) * 0.15;

      points.push({
        color: random.pick(palette),
        radius,
        rotation: random.noise2D(u, v),
        position: [u, v],
      });
    }
  }

  return points;
};

const sketch = () => {
  let points = createGrid().filter(() => Math.random() > 0.5);
  points = random.shuffle(points);
  return ({ context, width, height }) => {
    const margin = width * 0.15;

    context.fillStyle = 'white'; //background;
    context.fillRect(0, 0, width, height);

    points.forEach(data => {
      const {
        position,
        radius,
        color,
        rotation
      } = data;
      const x = lerp(margin, width - margin, position[0]);
      const y = lerp(margin, height - margin, position[1]);

      // context.beginPath();
      // context.arc(x, y, radius * width, 0, Math.PI * 2);
      // context.strokeStyle = color;
      // context.lineWidth = 20;
      // context.stroke();
      context.save();
      context.fillStyle = color;
      context.font = `${radius * width}px "Helvetica"`
      context.translate(x, y);
      context.rotate(rotation * Math.PI / 2);
      context.fillText('=', 0 ,0);
      context.restore();
    });
  };
};

canvasSketch(sketch, settings);
