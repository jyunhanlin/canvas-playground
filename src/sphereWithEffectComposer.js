// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');
require('three/examples/js/postprocessing/EffectComposer');
require('three/examples/js/shaders/CopyShader');
require('three/examples/js/shaders/FilmShader');
require('three/examples/js/shaders/DigitalGlitch');
require('three/examples/js/shaders/DotScreenShader');
require('three/examples/js/postprocessing/RenderPass');
require('three/examples/js/postprocessing/ShaderPass');
require('three/examples/js/postprocessing/GlitchPass');
require('three/examples/js/postprocessing/FilmPass');
require('three/examples/js/postprocessing/DotScreenPass');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const dat = require('dat.gui');
const gui = new dat.GUI();

const canvasSketch = require('canvas-sketch');

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

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 0, 400);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  const object = new THREE.Object3D();

  const geometry = new THREE.SphereBufferGeometry(1, 5, 5);

  for (let i = 0; i < 100; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff * Math.random(),
      flatShading: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    mesh.position.multiplyScalar(Math.random() * 400);
    mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
    object.add(mesh);
  }

  scene.add(object);

  scene.add(new THREE.AmbientLight(0x222222));

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1);
  scene.add(light);

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  const passType = 2; //0-Glitch, 1-Film, 2-Dot

  let glslPass;

  switch (passType) {
    case 0:
      glslPass = new THREE.GlitchPass();
      glslPass.renderToScreen = true;
      composer.addPass(glslPass);
      folder = gui.addFolder('GlitchPass');
      folder.add(glslPass.uniforms.amount, 'value', 0, 1).name('amount').listen();
      folder.open();
      break;
    case 1:
      glslPass = new THREE.FilmPass();
      glslPass.renderToScreen = true;
      composer.addPass(glslPass);
      folder = gui.addFolder('FilmPass');
      folder.add(glslPass.uniforms.grayscale, 'value', 0, 1, 1).name('grayscale');
      folder.add(glslPass.uniforms.nIntensity, 'value', 0, 1).name('noise intensity');
      folder.add(glslPass.uniforms.sIntensity, 'value', 0, 1).name('scanline intensity');
      folder.add(glslPass.uniforms.sCount, 'value', 0, 1000).name('scanline count');
      folder.open();
      break;
    case 2:
      glslPass = new THREE.DotScreenPass();
      composer.addPass(glslPass);
      glslPass.renderToScreen = true;
      folder = gui.addFolder('DotScreenPass');
      folder.add(glslPass.uniforms.scale, 'value', 0.1, 3.0).name('scale');
      folder.open();
      break;
  }

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
    render({ time }) {
      controls.update();

      object.rotation.x += 0.005;
      object.rotation.y += 0.01;
      // renderer.render(scene, camera);
      composer.render();
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
