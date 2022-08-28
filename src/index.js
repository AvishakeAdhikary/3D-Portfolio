import "./styles.css";

import {
  Math,
  Scene,
  Color,
  PerspectiveCamera,
  BoxBufferGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
  WebGLRenderer,
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
  TextureLoader,
  sRGBEncoding,
  Vector3,
  Geometry,
  Clock,
  PlaneGeometry,
  MeshPhongMaterial,
  AnimationMixer
} from "three";

import GLTFLoader from "three-gltf-loader";

import gsap, { TimelineMax } from "gsap";

import { GUI } from "dat.gui";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import { CameraHelper, DirectionalLightHelper, GridHelper } from "three";

import OrbitControls from "three-orbitcontrols";
import { getGPUTier } from "detect-gpu";

const gpu = getGPUTier();
console.log(gpu);

let container;
let camera;
let renderer;
let scene;
let mesh;
let controls;

const mixers = [];
const clock = new Clock();
let timeline;

gsap.registerPlugin(ScrollTrigger);

function init() {
  container = document.querySelector("#app");

  // Creating the scene
  scene = new Scene();
  scene.background = new Color("skyblue");

  createCamera();
  createLights();
  createMeshes();
  // createControls();
  createRenderer();
  // inithelpers();
  // createAnimation();
  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

function onTransitionEnd(event) {
  event.target.remove();
}

function inithelpers() {
  // const camera = new PerspectiveCamera(
  //   75,
  //   window.innerWidth / window.innerHeight,
  //   0.1,
  //   1000
  // );
  const helper = new CameraHelper(camera);
  scene.add(helper);

  const size = 1000;
  const divisions = 1000;

  const gridHelper = new GridHelper(size, divisions);
  scene.add(gridHelper);
}

function sayHello() {
  console.log("Hello");
}

function createCamera() {
  const fov = 75;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.5;
  const far = 400;
  camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(3.1118979947186505, 203.3443032074982, 18.73685711010565);
  // camera.rotation.set(-2.7674097051953916, 0.13166883152219006, 3.0900833814855555);

  // const gui = new GUI();
  // const cameraFolder = gui.addFolder("Camera");
  // cameraFolder.add(camera.position, "x", -200, 200);
  // cameraFolder.add(camera.position, "y", -200, 200);
  // cameraFolder.add(camera.position, "z", -200, 200);
  // cameraFolder.add(camera.rotation, "x", 0, 5, Math.PI * 2);
  // cameraFolder.open();
}

function createLights() {
  const mainLight = new DirectionalLight(0xffffff, 5);
  mainLight.position.set(-35, 84, -35);
  mainLight.rotateY(3.5);
  scene.add(mainLight);

  const hemisphereLight = new HemisphereLight(0xddeeff, 0x202020, 10);
  scene.add(mainLight, hemisphereLight);

  // const gui = new GUI();
  // const lightFolder = gui.addFolder("Directional Light");
  // lightFolder.add(mainLight.position, "x", -200, 200);
  // lightFolder.add(mainLight.position, "y", -200, 200);
  // lightFolder.add(mainLight.position, "z", -200, 200);
  // lightFolder.add(mainLight.rotation, "x", 0, 5, Math.PI * 2);
  // lightFolder.add(mainLight.rotation, "y", 0, 5, Math.PI * 2);
  // lightFolder.add(mainLight.rotation, "z", 0, 5, Math.PI * 2);
  // lightFolder.open();
}

function createRenderer() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.gammaFactor = 2.2;
  //renderer.gammaOutput = true;
  renderer.outputEncoding = sRGBEncoding;
  renderer.physicallyCorrectLights = true;

  container.appendChild(renderer.domElement);
}

function createMeshes() {
  createScene();
}

function createScene() {
  // addWalls();
  // addPhotoFrame();

  //colors : https://www.creators3d.com/online-viewer

  loadBirds(new Vector3(0, 200, 40));
  loadHouse(new Vector3(0, 0, 0));
}

function loadBirds(birdPosition) {
  const loader = new GLTFLoader();

  const onLoad = (result, position) => {
    const model = result.scene.children[0];
    model.position.copy(position);
    model.scale.set(0.05, 0.05, 0.05);

    const mixer = new AnimationMixer(model);
    mixers.push(mixer);

    const animation = result.animations[0];
    const action = mixer.clipAction(animation);
    action.play();
    model.rotateY(4.71);
    scene.add(model);
  };
  const onProgress = (progress) => {};
  loader.load(
    "src/assets/Parrot.glb",
    (gltf) => onLoad(gltf, birdPosition),
    onProgress
  );

  const flamingoPosition = new Vector3(
    birdPosition.x + 5,
    birdPosition.y + 4,
    birdPosition.z - 10
  );
  loader.load(
    "/src/assets/Flamingo.glb",
    (gltf) => onLoad(gltf, flamingoPosition),
    onProgress
  );

  const storkPosition = new Vector3(
    birdPosition.x + 10,
    birdPosition.y - 2.5,
    birdPosition.z + 10
  );
  loader.load(
    "/src/assets/Stork.glb",
    (gltf) => onLoad(gltf, storkPosition),
    onProgress
  );
}

function loadHouse(housePosition) {
  const loader = new GLTFLoader();

  const onLoad = (result, position) => {
    // console.log(result);
    const house = result.scene;
    //house.scale.set(0.5, 0.5, 0.5);
    house.position.set(position.x, position.y, position.z);
    house.rotateY(3.14);
    scene.add(house);
    timeline = new TimelineMax({
      scrollTrigger: {
        trigger: ".app",
        start: "top top", //animation start at this point
        end: "bottom bottom ", //animation end at this point
        // markers: true, //comment out
        scrub: true,
        pin: true
      }
    });
    //updateCameraPosition();
    ScrollTrigger.matchMedia({
      "(prefers-reduced-motion: no-preference)": updateCameraPosition
    });
  };

  const onProgress = (progress) => {};

  loader.load(
    "src/assets/MainScene.glb",
    (gltf) => onLoad(gltf, housePosition),
    onProgress
  );
}

/*
function addPhotoFrame() {
  const textureLoader = new TextureLoader();
  const texture = textureLoader.load("./src/images/AvishakeDP.jpg");
  texture.encoding = sRGBEncoding;
  texture.anisotropy = 16;

  const width = 2;
  const height = 2;
  const depth = 0.2;

  const x = 1;
  const y = 3;
  const z = 5;

  const rotate = 1.57;

  var geometry;
  var material;

  geometry = new BoxBufferGeometry(width, height, depth);
  material = new MeshStandardMaterial({ color: "#100720" });
  mesh = new Mesh(geometry, material);
  mesh.translateZ(-z);
  mesh.translateY(y);
  scene.add(mesh);
  geometry = new BoxBufferGeometry(width / 10, height, depth + 0.1);
  material = new MeshStandardMaterial({ color: "#100720" });
  mesh = new Mesh(geometry, material);
  mesh.translateZ(-z);
  mesh.translateX(x);
  mesh.translateY(y);
  scene.add(mesh);
  geometry = new BoxBufferGeometry(width / 10, height, depth + 0.1);
  material = new MeshStandardMaterial({ color: "#100720" });
  mesh = new Mesh(geometry, material);
  mesh.translateZ(-z);
  mesh.translateX(-x);
  mesh.translateY(y);
  scene.add(mesh);
  geometry = new BoxBufferGeometry(width / 10, height, depth + 0.1);
  material = new MeshStandardMaterial({ color: "#100720" });
  mesh = new Mesh(geometry, material);
  mesh.translateZ(-z);
  mesh.translateX(x - 1);
  mesh.translateY(y - 1);
  mesh.rotateZ(rotate);
  scene.add(mesh);
  geometry = new BoxBufferGeometry(width / 10, height, depth + 0.1);
  material = new MeshStandardMaterial({ color: "#100720" });
  mesh = new Mesh(geometry, material);
  mesh.translateZ(-z);
  mesh.translateX(x - 1);
  mesh.translateY(y + 1);
  mesh.rotateZ(rotate);
  scene.add(mesh);
  //geometry = new PlaneBufferGeometry(width, height, depth);
  geometry = new PlaneGeometry(width, height);
  material = new MeshStandardMaterial({ map: texture });
  mesh = new Mesh(geometry, material);
  mesh.translateZ(z - 2 * 4.94);
  mesh.translateY(y);
  scene.add(mesh);
}
*/

function createControls() {
  controls = new OrbitControls(camera, container);
  //console.log(controls);
  controls.addEventListener("change", (event) => {
    //console.log( controls.object.position );
    document.getElementById("pos").innerHTML =
      "X: " +
      controls.object.position.x +
      " Y: " +
      controls.object.position.y +
      " Z: " +
      controls.object.position.z +
      "<br /> Rotation X: " +
      controls.object.rotation.x +
      " Y: " +
      controls.object.rotation.y +
      " Z: " +
      controls.object.rotation.z;
  });
}

const updateCameraPosition = () => {
  let section = 0;
  // camera.lookAt(0, 200, 40);
  timeline.to(
    camera.position,
    {
      x: -57.107254020681374,
      y: 8.274332354787813,
      z: -20.297409110893618,
      onUpdate: function () {
        camera.lookAt(0, 0, 0);
      }
    },
    section
  );
  section += 1;
  //camera.lookAt(0, 0, 0);
  timeline.to(
    camera.position,
    {
      x: -57.107254020681374,
      y: 8.274332354787813,
      z: -20.297409110893618,
      onUpdate: function () {
        camera.lookAt(0, 0, 0);
      }
    },
    section
  );
  section += 1;
  timeline.to(
    camera.position,
    {
      x: 13.48097266007278,
      y: 5.387304279919668,
      z: 52.76364050918752,
      onUpdate: function () {
        camera.lookAt(15, 0, 0);
      }
    },
    section
  );
  section += 1;
  timeline.to(
    camera.position,
    {
      x: -4.336851126967199,
      y: 6.27717610625403,
      z: -13.273825945679029,
      onUpdate: function () {
        camera.lookAt(10, 5, 15);
      }
    },
    section
  );
  section += 1;
  timeline.to(
    camera.position,
    {
      x: 12.5912158584227,
      y: 5.681856785128295,
      z: 2.1053184874,
      onUpdate: function () {
        camera.lookAt(10, 5, 15);
      }
    },
    section
  );
  section += 1;
  timeline.to(
    camera.position,
    {
      x: 8.45308520659809,
      y: 5.163919466394349,
      z: 13.66343250707847,
      onUpdate: function () {
        camera.lookAt(10, 5, 5);
      }
    },
    section
  );
  section += 1;
  timeline.to(
    camera.position,
    {
      x: 18.250126645438755,
      y: 5.3860849150838535,
      z: 5.880834221265962,
      onUpdate: function () {
        camera.lookAt(-20, 5, 6); //monitor
      }
    },
    section
  );
};

/*
Update Locations
Bird
X: 3.1118979947186505 Y: 203.3443032074982 Z: 18.73685711010565
Rotation X: -2.7674097051953916 Y: 0.13166883152219006 Z: 3.0900833814855555
House
X: -57.107254020681374 Y: 8.274332354787813 Z: -20.297409110893618 
Rotation X: -3.04602951884379 Y: -0.9305971251084648 Z: -3.06486997939833
Car
X: 13.48097266007278 Y: 5.387304279919668 Z: 52.76364050918752
Rotation X: 0.007336059469284603 Y:-0.03634135440187486 Z: 0.00026654843299389727
Interior Angle 1
X: -4.336851126967199 Y: 6.277176106254034 Z: -13.273825945679029
Rotation X: -3.131494504798053 Y:-0.5208847421845741 Z: -3.136567204154933
Interior Angle 2
X: 17.5912158584227 Y: 5.681856785128295 Z 21053184874 
Rotation X: -2.8059970071164173 Y: 0.946195940999368 Z: 2.8658629110522686
Office Angle 1
X:8.45308520659809 Y: 5.163919466394349 Z: 13.66343250707847
Rotation X: -0.16762693407281756 Y: -0.4107256693080156 Z: -0.06746068222792981
Office Angle 2
X: 18.250126645438755 Y: 5.3860849150838535 Z: 5.880834221265962
Rotation X: -0.9309195616778742 Y: 1.4494504720739347 Z: 0.9273807651034073
*/

function update() {
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
  // mesh.rotation.z += 0.01;

  const delta = clock.getDelta();
  mixers.forEach((mixer) => mixer.update(delta));
}

function render() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;

  // Update camera frustum
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener("resize", onWindowResize, false);

init();
