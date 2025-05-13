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
const material = new THREE.MeshNormalMaterial(   );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
cube.position.z = -5;

camera.position.z = 5;
var px=0;
let py=0;

window.addEventListener( 'pointermove', onPointerMove );

function animate() {

  if(px>window.innerWidth/2)
  {
    cube.rotation.y += 0.01;
  }else{
    cube.rotation.y -= 0.01;
  }
  
  console.log("x="+px+" y="+py)

  renderer.render( scene, camera );
}

function onPointerMove (event)
{
  
  px=event.clientX
  py=event.clientY
}
