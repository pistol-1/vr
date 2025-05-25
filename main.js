import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 100);

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
scene.add(new THREE.AmbientLight(0x3d3d3d));

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

let roads = [];
for (let i = 0; i < 3; i++) {
  loader.load('source/road.glb', gltf => {
    const r = gltf.scene;
    r.position.set(despX, despY, despZ + i * 109.9); // Spaced 30 units apart
    scene.add(r);
    roads.push(r);
  });
}


spriteLoader.load('sprite/911.png', texture => {
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);

  // Optional: scale and position 
  sprite.scale.set(1.66,1.66,1.66);     // size in world units
  sprite.position.set(3, -.2, 15); // position in 3D space

  scene.add(sprite);
  sprite.rotation.y=0
});

class TrafficCar {
  constructor(scene,pos, path ) {
    this.scene = scene;
    this.sprites = [];
    spriteLoader.load(path, texture => {
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);

      // Optional: scale and position
      sprite.scale.set(1.66,1.66,1.66);     // size in world units
      sprite.position.set(pos, -.2, 25); // position in 3D space

      scene.add(sprite);
    });
  }
}

class TrafficSign {
  constructor(scene,pos, path ) {
    this.scene = scene;
    this.sprites = [];
    spriteLoader.load(path, texture => {
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);

      // Optional: scale and position
      sprite.scale.set(3,3,3);     // size in world units
      sprite.position.set(pos, -1, 10); // position in 3D space

      scene.add(sprite);
    });
  }
}



const spriteCars = [
  'sprite/911.png',
  'sprite/bmw.png',
  'sprite/bus.png',
  'sprite/corolla.png',
  'sprite/lambo.png',
  'sprite/lexus.png',
  'sprite/police.png',
  'sprite/tata.png',
  'sprite/taxi.png'
];

const spriteSigns = [
  'sprite/exit.png',
  'sprite/info1.png',
  'sprite/info2.png',
  'sprite/info3.png',
  'sprite/limit1.png',
  'sprite/limit2.png',
  'sprite/policestreetsignt1.png',
  'sprite/streetsign2.png'
];

function spawnTraffic (){
  let t = 0.1;

  let spawnX = [Math.floor(Math.random() * 3)];
  
  const traffic = new TrafficCar(scene,spawnX,spriteCars[Math.floor(Math.random()*9)]);

}

spawnTraffic()

const sign = new TrafficSign(scene,-3,spriteSigns[3]);


// var carro1 = new TrafficCar (scene)
// carro1.loadSprites(spriteFilesCars,0)


// const spriteFilesSigns = [
//   'exit.png',
//   'info1.png',
//   'info2.png',
//   'info3.png',
//   'limit1.png',
//   'limit2.png',
//   'limit3.png',
//   'streetsign1.png',
//   'streetsign2.png',
//   'streetsign3.png'
// ];

// traffic.loadSigns('sprites', spriteFilesCars);


var vel = -0.1;


function animate() {
   roads.forEach(road => {
    road.position.z += vel;

    if (road.position.z < -109.9) {
      // Find the furthest forward road
      let maxZ = Math.max(...roads.map(r => r.position.z));
      road.position.z = maxZ + 109.9;
    }
  });


  renderer.render(scene, camera);
}
