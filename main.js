import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const escena = new THREE.Scene();
const camara = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 500);

const contenedor = new THREE.Group();
contenedor.add(camara);
escena.add(contenedor);

const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.xr.enabled = true;
renderizador.xr.setReferenceSpaceType('local');
document.body.appendChild(renderizador.domElement);
document.body.appendChild(VRButton.createButton(renderizador));
renderizador.setAnimationLoop(animar);

const luzDireccional = new THREE.DirectionalLight(0x8ed4ff, 0.1);
luzDireccional.position.set(.2,0,0);
escena.add(luzDireccional, new THREE.AmbientLight(0xf5dcca));

const rutasCubemap = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(dir => `cubemap/${dir}.png`);
escena.background = new THREE.CubeTextureLoader().load(rutasCubemap);

const despX = -0.34, despY = -1.135, despZ = 0.21;

const cargadorGLTF = new GLTFLoader();
const cargadorTexturas = new THREE.TextureLoader();

const cubo = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
cubo.position.set(despX, despY, 20);
cubo.visible = false;
escena.add(cubo);
camara.lookAt(cubo.position);

let e30Modelo, volante;
const carreteras = [], autosTrafico = [], señalesTrafico = [];

cargadorGLTF.load('source/e30.glb', gltf => {
    e30Modelo = gltf.scene;
    contenedor.add(e30Modelo);
    e30Modelo.position.set(despX, despY, despZ);
});

cargadorGLTF.load('source/e30Steering.glb', gltf => {
    volante = gltf.scene;
    contenedor.add(volante);
    volante.position.set(-0.025, -0.31, 0.52);
});

for (let i = 0; i < 3; i++) {
    cargadorGLTF.load('source/road.glb', gltf => {
        const carretera = gltf.scene;
        carretera.position.set(despX, despY, despZ + i * 110);
        escena.add(carretera);
        carreteras.push(carretera);
    });
}

class SpritePlano {
    constructor(escena, texturaRuta, ancho, alto, x, y, z, rotY = 0) {
        cargadorTexturas.load(texturaRuta, textura => {
            const material = new THREE.MeshBasicMaterial({ map: textura, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
            const plano = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), material);
            plano.position.set(x, y, z);
            plano.rotation.y = rotY;
            escena.add(plano);
            this.malla = plano;
        });
    }

    moverZ(dz) {
        if (this.malla) this.malla.position.z += dz;
    }
}

class AutoTrafico extends SpritePlano {
    constructor(escena, x, ruta) {
        super(escena, ruta, 2.5, 2.5, x, 0, 100, Math.PI);
    }
}

class SeñalTrafico extends SpritePlano {
    constructor(escena, x, z, ruta) {
        super(escena, ruta, 3, 3, x, -1, z, Math.PI);
    }
}

const spritesAutos = [
    'sprite/911.png', 'sprite/bmw.png', 'sprite/bus.png', 'sprite/corolla.png',
    'sprite/lambo.png', 'sprite/lexus.png', 'sprite/police.png', 'sprite/tata.png', 'sprite/taxi.png'
];

const spritesSeñales = [
    'sprite/info1.png', 'sprite/info2.png', 'sprite/info3.png',
    'sprite/limit1.png', 'sprite/limit2.png', 'sprite/streetsign1.png', 'sprite/streetsign2.png'
];

function generarAuto() {
    if (Math.random() < 0.6) {
        const x = Math.random() < 0.5 ? -0.25 : 2.3;
        autosTrafico.push(new AutoTrafico(escena, x, spritesAutos[Math.floor(Math.random() * spritesAutos.length)]));
    }
}

function generarSeñal(z) {
    const x = Math.random() < 0.5 ? -3.3 : 6.3;
    señalesTrafico.push(new SeñalTrafico(escena, x, z, spritesSeñales[Math.floor(Math.random() * spritesSeñales.length)]));
}

generarAuto();

let juegoActivo = true;
let velocidad = -1;
let objetivoX = 0;
const velocidadMovimiento = 0.1;
const raycaster = new THREE.Raycaster();
const distanciaColision = 1.5;

function verificarColisiones() {
    if (!e30Modelo || !juegoActivo) return;

    const posCarro = new THREE.Vector3();
    e30Modelo.getWorldPosition(posCarro);

    const direcciones = [
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(-0.5, 0, -1),
        new THREE.Vector3(0.5, 0, -1)
    ];

    for (const auto of autosTrafico) {
        if (!auto.malla || posCarro.distanceTo(auto.malla.position) > 10) continue;

        for (const dir of direcciones) {
            raycaster.set(posCarro, dir);
            const colisiones = raycaster.intersectObject(auto.malla);
            if (colisiones.length && colisiones[0].distance < distanciaColision) return manejarColision();
        }
    }
}

function manejarColision() {
    juegoActivo = false;
    velocidad = 0;
    const flash = new THREE.AmbientLight(0xff0000, 1);
    escena.add(flash);
    setTimeout(() => escena.remove(flash), 300);
    console.log("¡Colisión detectada! Juego detenido.");
}

const posicionesObjetivo = { izquierda: 2.3, derecha: 0 };

document.addEventListener('keydown', e => {
    if (!juegoActivo) return;
    if (e.key === 'ArrowLeft') objetivoX = posicionesObjetivo.izquierda;
    else if (e.key === 'ArrowRight') objetivoX = posicionesObjetivo.derecha;
});

function animar() {
    if (!juegoActivo) return renderizador.render(escena, camara);

    contenedor.position.x += (objetivoX - contenedor.position.x) * velocidadMovimiento;

    verificarColisiones();

    carreteras.forEach(carretera => {
        carretera.position.z += velocidad;
        if (carretera.position.z < -130) {
            const maxZ = Math.max(...carreteras.map(c => c.position.z));
            carretera.position.z = maxZ + 109;
            generarSeñal(carretera.position.z);
            generarAuto();
        }
    });

    señalesTrafico.forEach(s => s.moverZ(velocidad));
    autosTrafico.forEach(a => a.moverZ(velocidad * 0.2));

    renderizador.render(escena, camara);
}
