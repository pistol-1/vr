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

   
const trafficSigns = [];
const trafficCars = [];
let roads = [];



let e30Model;
loader.load('source/e30.glb', gltf => {
  e30Model = gltf.scene;
  scene.add(e30Model);
  e30Model.position.set(despX,despY,despZ)

});
let steeringWheel;
loader.load('source/e30Steering.glb', gltf => {
  steeringWheel = gltf.scene;
  scene.add(steeringWheel);
  steeringWheel.position.set(despX,despY,despZ)

});

for (let i = 0; i < 3; i++) {
  loader.load('source/road.glb', gltf => {
    const r = gltf.scene;
    r.position.set(despX, despY, despZ + i * 109.9); // Spaced 30 units apart
    scene.add(r);
    roads.push(r);
  });
}


class TrafficCar {
  constructor(scene, posX, path) {
    this.scene = scene;
    this.sprite = null;
    spriteLoader.load(path, texture => {
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(2.5,2.5,2.5);
      sprite.position.set(posX, 0, 100); // Spawn at z = 100

      // Lock rotation
      sprite.matrixAutoUpdate = false;
      sprite.rotation.set(0, 0, 0);
      sprite.updateMatrix();

      scene.add(sprite);
      this.sprite = sprite;
    });
  }

  moveZ(dz) {
    if (this.sprite) {
      this.sprite.position.z += dz;
      this.sprite.updateMatrix();
    }
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


class TrafficSign {
  constructor(scene, x, z, path) {
    this.scene = scene;
    this.sprite = null;
    spriteLoader.load(path, texture => {
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(3, 3, 3);
      sprite.position.set(x, -1, z);

      // Lock sprite rotation
      sprite.matrixAutoUpdate = false;
      sprite.rotation.set(0, 0, 0);
      sprite.updateMatrix();

      scene.add(sprite);
      this.sprite = sprite;
    });
  }

  moveZ(dz) {
    if (this.sprite) {
      this.sprite.position.z += dz;
      this.sprite.updateMatrix(); // Keep matrix in sync with position
    }
  }
}

function spawnTrafficSigns(zOffset) {
  const x = Math.random() < 0.5 ? -3.3 : 6.3;
  const spritePath = spriteSigns[Math.floor(Math.random() * spriteSigns.length)];
  const sign = new TrafficSign(scene, x, zOffset, spritePath);
  trafficSigns.push(sign);
}

const spriteSigns = [
  'sprite/info1.png',
  'sprite/info2.png',
  'sprite/info3.png',
  'sprite/limit1.png',
  'sprite/limit2.png',
  'sprite/policestreetsignt1.png',
  'sprite/streetsign2.png'
];

function spawnTraffic() {
  if (Math.random() < 0.4) {
    const spawnX = Math.random() < 0.5 ? -0.25 : 2.3;
    const spritePath = spriteCars[Math.floor(Math.random() * spriteCars.length)];
    const traffic = new TrafficCar(scene, spawnX, spritePath);
    trafficCars.push(traffic);
  }
}


spawnTraffic()




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


var vel = -1;


function animate() {
  roads.forEach(road => {
    road.position.z += vel;

    if (road.position.z < -109.9) {
      let maxZ = Math.max(...roads.map(r => r.position.z));
      road.position.z = maxZ + 109.9;

      spawnTrafficSigns(road.position.z);
      spawnTraffic(); // Call this here if you want cars tied to road looping
    }
  });

  trafficSigns.forEach(sign => sign.moveZ(vel));

  // Move cars at half speed
  trafficCars.forEach(car => car.moveZ(vel * 0.5));

  renderer.render(scene, camera);
}
