import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getGPUTier } from 'detect-gpu';
import './style.css';

const container = document.getElementById('app');
let camera, renderer, scene;
const mixers = [];
const clock = new THREE.Clock();
const gpu = getGPUTier();
let timeline;

function init() {
    setupScene();
    createCamera();
    createLights();
    createRenderer();
    loadModels();
    animate();

    setupScrollTrigger();
}

function setupScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("skyblue");
}

function createCamera() {
  const fov = 75;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.5;
  const far = 400;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(3.1118979947186505, 203.3443032074982, 18.73685711010565);
  camera.rotation.set(-2.7674097051953916, 0.13166883152219006, 3.0900833814855555);
}

function createLights() {
  const mainLight = new THREE.DirectionalLight(0xffffff, 5);
  mainLight.position.set(-35, 84, -35);
  mainLight.rotateY(3.5);
  scene.add(mainLight);

  const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 10);
  scene.add(hemisphereLight);
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  container.appendChild(renderer.domElement);
}

function loadModels() {
    const loader = new GLTFLoader();

    loader.load('assets/Parrot.glb', (gltf) => onLoad(gltf, new THREE.Vector3(0, 200, 40)));
    loader.load('assets/Flamingo.glb', (gltf) => onLoad(gltf, new THREE.Vector3(5, 204, 30)));
    loader.load('assets/Stork.glb', (gltf) => onLoad(gltf, new THREE.Vector3(10, 198, 50)));

    loader.load('assets/MainScene.glb', (gltf) => onLoad(gltf, new THREE.Vector3(0, 0, 0)));
}

function onLoad(gltf, position) {
  const model = gltf.scene;
  model.position.copy(position);
  model.scale.set(0.05, 0.05, 0.05);

  const mixer = new THREE.AnimationMixer(model);
  const animations = gltf.animations;
  if (animations && animations.length > 0) {
      const action = mixer.clipAction(animations[0]);
      action.play();
  }

  mixers.push(mixer);
  scene.add(model);
}

function animate() {
    renderer.setAnimationLoop(() => {
        update();
        render();
    });
}

function update() {
    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta));
}

function render() {
    renderer.render(scene, camera);
}

function setupScrollTrigger() {
  gsap.registerPlugin(ScrollTrigger);
  
  timeline = gsap.timeline({ onUpdate: updateCameraLookAt });

  // Define camera positions and rotations
  timeline.to(camera.position, { x: -57.107254020681374, y: 8.274332354787813, z: -20.297409110893618, duration: 1 });
  timeline.to(camera.rotation, { x: -3.04602951884379, y: -0.9305971251084648, z: -3.06486997939833, duration: 1 }, 0);
  
  timeline.to(camera.position, { x: 13.48097266007278, y: 5.387304279919668, z: 52.76364050918752, duration: 1 });
  timeline.to(camera.rotation, { x: 0.007336059469284603, y: -0.03634135440187486, z: 0.00026654843299389727, duration: 1 }, 1);
  
  timeline.to(camera.position, { x: -4.336851126967199, y: 6.27717610625403, z: -13.273825945679029, duration: 1 });
  timeline.to(camera.rotation, { x: -3.131494504798053, y: -0.5208847421845741, z: -3.136567204154933, duration: 1 }, 2);
  
  timeline.to(camera.position, { x: 12.5912158584227, y: 5.681856785128295, z: 2.1053184874, duration: 1 });
  timeline.to(camera.rotation, { x: -2.8059970071164173, y: 0.946195940999368, z: 2.8658629110522686, duration: 1 }, 3);
  
  timeline.to(camera.position, { x: 8.45308520659809, y: 5.163919466394349, z: 13.66343250707847, duration: 1 });
  timeline.to(camera.rotation, { x: -0.16762693407281756, y: -0.4107256693080156, z: -0.06746068222792981, duration: 1 }, 4);
  
  timeline.to(camera.position, { x: 18.250126645438755, y: 5.3860849150838535, z: 5.880834221265962, duration: 1 });
  timeline.to(camera.rotation, { x: -0.9309195616778742, y: 1.4494504720739347, z: 0.9273807651034073, duration: 1 }, 5);

  ScrollTrigger.create({
      trigger: ".page",
      start: "top top",
      end: "bottom bottom",
      animation: timeline,
      scrub: true
  });
}

function updateCameraLookAt() {
    // Update camera's lookAt based on its current position
    const { x, y, z } = camera.position;
    if (x === -57.107 && y === 8.274 && z === -20.297) {
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    } else if (x === 13.481 && y === 5.387 && z === 52.764) {
        camera.lookAt(new THREE.Vector3(15, 0, 0));
    } else if (x === -4.337 && y === 6.277 && z === -13.274) {
        camera.lookAt(new THREE.Vector3(10, 5, 15));
    } else if (x === 12.591 && y === 5.682 && z === 2.105) {
        camera.lookAt(new THREE.Vector3(10, 5, 15));
    } else if (x === 8.453 && y === 5.164 && z === 13.663) {
        camera.lookAt(new THREE.Vector3(10, 5, 5));
    } else if (x === 18.250 && y === 5.386 && z === 5.881) {
        camera.lookAt(new THREE.Vector3(-20, 5, 6)); // Monitor
    }
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

init();
