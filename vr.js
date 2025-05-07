import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType( 'local' );
document.body.appendChild( VRButton.createButton( renderer ) );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
cube.position.z = -5;

camera.position.z = 5;

// Cargar la textura 
const textureLoader = new THREE.TextureLoader();
const buildingTexture1 = textureLoader.load('texturas/tierra.jpg'); // Cambia esta ruta por la ubicación de tu imagen
const geometry1 = new THREE.SphereGeometry( 1, 32, 16 );  //cambiamos  el 15 por 1 para ambiar la escala y aparezca en la escena
const material1 = new THREE.MeshBasicMaterial({map: buildingTexture1});
const tierra = new THREE.Mesh( geometry1, material1);
scene.add( tierra );  
tierra.position.z = -5;


var t=0;



// Cargar la textura 
const textureLoader2 = new THREE.TextureLoader();
const buildingTexture2 = textureLoader2.load('texturas/124867239-material-de-diseño-textura-del-sol-en-el-centro-del-universo-del-sistema-solar-no-renderizado-en.jpg'); // Cambia esta ruta por la ubicación de tu imagen
const geometry2 = new THREE.SphereGeometry( 2, 32, 16 );  
const material2 = new THREE.MeshBasicMaterial( { map:buildingTexture2 } );
const sol = new THREE.Mesh( geometry2, material2 );
scene.add( sol );  //añades la esfera a la escena
sol.position.z = -5;


// Cargar la textura 
const textureLoader3 = new THREE.TextureLoader();
const buildingTexture3 = textureLoader3.load('texturas/luna.jpg')
const geometry3 = new THREE.SphereGeometry( 0.5, 32, 16 );  
const material3 = new THREE.MeshBasicMaterial( {map:buildingTexture3} );
const luna = new THREE.Mesh( geometry3, material3 );
scene.add( luna );  
luna.position.z = -5;


function animate() {

  cube.rotation.y += 0.01;
  
  t +=0.001;
  //cube.rotation.x += 0.01; cube.rotation.y += 0.01; console.log(cube.position); /// indica la posicion del cubo, es importante el console.log para ver errores

 tierra.position.x = Math.cos(t)*6;
 tierra.position.y= Math.sin(t)*6;
 tierra.rotation.z += 0.01;
 renderer.render( scene, camera ); //rederizar la escena y la camara
 sol.rotation.z += 0.001;
 luna.position.x = tierra.position.x+2.5*Math.sin(t*1);
 luna.position.y = tierra.position.y+2.5*Math.cos(t*1);

  renderer.render( scene, camera );
}
