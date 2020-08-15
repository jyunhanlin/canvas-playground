// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');
require('three/examples/js/loaders/GLTFLoader');

const canvasSketch = require('canvas-sketch');

const assetPath = '';
const fileName = '';

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });

  // WebGL background color
  renderer.setClearColor('#000', 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 3);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  const loader = new THREE.GLTFLoader();
  let car = null;
  loader.setPath(assetPath);
  loader.load(fileName, function (object) {
    object.scene.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(object.scene.children[1]);
    car = new THREE.Object3D();
    scene.add(car);
    car.add(object.scene.children[0]);
  });

  const ambient = new THREE.HemisphereLight(0xffffff, 0x080820, 0.5);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.near = 1;
  light.shadow.far = 100;
  const shadowSize = 5;
  light.shadow.left = -shadowSize;
  light.shadow.right = shadowSize;
  light.shadow.top = shadowSize;
  light.shadow.bottom = -shadowSize;
  light.position.set(-1, 10, 6);
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render() {
      controls.update();
      renderer.render(scene, camera);
      if (car) {
        car.rotation.y -= 0.01;
      }
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
