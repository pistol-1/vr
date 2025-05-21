import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 1000);

const spriteLoader = new THREE.TextureLoader();
    
let despX = -0.34;
let despY = -1.135;
let despZ = 0.21

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType( 'local' );
document.body.appendChild( VRButton.createButton( renderer ) );;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const loader = new GLTFLoader();

const geometry = new THREE.BoxGeometry( 1,1,1 ); 
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
const cube = new THREE.Mesh( geometry, material ); 
scene.add( cube );
cube.position.set(despX,despY,20)
cube.visible=false;

camera.lookAt(cube.position)

				
const path = 'cubemap/';
const format = '.png';
const urls = [
	path + 'px' + format, path + 'nx' + format,
	path + 'py' + format, path + 'ny' + format,
	path + 'pz' + format, path + 'nz' + format
  ];

const reflectionCube = new THREE.CubeTextureLoader().load( urls );
scene.background = reflectionCube;
   



let e30Model;
loader.load('source/e30.glb', gltf => {
  e30Model = gltf.scene;
  scene.add(e30Model);
  e30Model.position.set(despX,despY,despZ)
});

let road;
loader.load('source/road.glb', gltf => {
  road = gltf.scene;
  scene.add(road);
  road.position.set(despX,despY,despZ)
});

spriteLoader.load('sprays/911.png', texture => {
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);

  // Optional: scale and position
  sprite.scale.set(1.66,1.66,1.66);     // size in world units
  sprite.position.set(-0.5, 0, 15); // position in 3D space

  scene.add(sprite);
});


function animate() {
  renderer.render(scene, camera);
}
