const THREE = require('three');

const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

const palette = random.pick(palettes);
const CHUNKS = 50;

const settings = {
  animate: true,
  context: 'webgl',
  dimensions: [1024, 1280],
  attributes: { antialias: true },
};

const randomizeMesh = (mesh) => {
  const point = new THREE.Vector3(
    random.value() * 2 - 1,
    random.value() * 2 - 1,
    random.value() * 2 - 1
  );

  point.multiplyScalar(0.5);
  mesh.position.copy(point);
  mesh.originalPosition = mesh.position.clone();

  mesh.scale.set(random.gaussian(), random.gaussian(), random.gaussian());

  if (random.chance(0.5)) mesh.scale.x *= random.gaussian();
  if (random.chance(0.5)) mesh.scale.y *= random.gaussian();
  if (random.chance(0.5)) mesh.scale.z *= random.gaussian();

  mesh.scale.multiplyScalar(random.gaussian() * 0.25);

  mesh.originalScale = mesh.scale.clone();
  mesh.time = 0;
  mesh.duration = random.range(1, 4);
};

const sketch = ({ context }) => {
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });
  renderer.setClearColor('#fff', 1);

  const camera = new THREE.OrthographicCamera();

  const groups = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const meshes = Array.from(new Array(CHUNKS)).map(() => {
    const material = new THREE.MeshStandardMaterial({
      metalness: 0,
      roughness: 1,
      color: random.pick(palette),
    });

    const mesh = new THREE.Mesh(geometry, material);

    randomizeMesh(mesh);

    mesh.time = random.range(0, mesh.duration);
    return mesh;
  });

  meshes.forEach((mesh) => {
    groups.add(mesh);
  });

  const scene = new THREE.Scene();
  scene.add(groups);

  const light = new THREE.DirectionalLight('white', 1);
  light.position.set(2, 1, 2);
  scene.add(light);

  scene.add(new THREE.AmbientLight('#000'));

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);

      const aspect = viewportWidth / viewportHeight;
      const zoom = 1.85;
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;
      camera.near = -100;
      camera.far = 100;
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time, deltaTime }) {
      meshes.forEach((mesh) => {
        // Each mesh has its own time that increases each frame
        mesh.time += deltaTime;

        // If it hits the end of its life, reset it
        if (mesh.time > mesh.duration) {
          randomizeMesh(mesh);
        }

        // Scale meshes in and out
        mesh.scale.copy(mesh.originalScale);
        mesh.scale.multiplyScalar(Math.sin((mesh.time / mesh.duration) * Math.PI));

        // Move meshes up
        // mesh.position.x += deltaTime * 0.5;
        mesh.position.y += deltaTime * 0.5;

        // Add slight movement
        const f = 0.5;
        mesh.scale.y =
          mesh.originalScale.y +
          0.25 *
            random.noise3D(
              mesh.originalPosition.x * f,
              mesh.originalPosition.y * f,
              mesh.originalPosition.z * f,
              time * 0.25
            );
      });
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
