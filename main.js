import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

const user = new THREE.Group();
scene.add(user);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
camera.position.set(0, 0, 0);
user.add(camera);

user.position.set(0.34, 1.135, -0.21);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local');
renderer.setAnimationLoop(animate);

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0.2747, 1.102, 10);
camera.lookAt(cube.position);

const loader = new GLTFLoader();

let e30Model;
loader.load('source/e30.glb', gltf => {
  e30Model = gltf.scene;
  scene.add(e30Model);
});

let helmetModel;
loader.load('source/helmet.glb', gltf => {
  helmetModel = gltf.scene;
  helmetModel.position.set(0.34, 1.102, -0.275);
  scene.add(helmetModel);
});

function animate() {
  renderer.render(scene, camera);
}

