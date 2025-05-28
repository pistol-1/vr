// === Importaciones ===
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// === Escena y cámara ===
const escena = new THREE.Scene();
const camara = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 500);

const contenedor = new THREE.Group();
contenedor.add(camara);
escena.add(contenedor);

// === Renderizador ===
const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.xr.enabled = true;
renderizador.xr.setReferenceSpaceType('local');
document.body.appendChild(renderizador.domElement);
document.body.appendChild(VRButton.createButton(renderizador));
renderizador.setAnimationLoop(animar);

// === Iluminación ===
const luzDireccional = new THREE.DirectionalLight(0xffffff, 1);
luzDireccional.position.set(5, 10, 7);
escena.add(luzDireccional);
escena.add(new THREE.AmbientLight(0x3d3d3d));

// === Textura de fondo (cubemap) ===
const rutas = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(dir => `cubemap/${dir}.png`);
const cuboReflejo = new THREE.CubeTextureLoader().load(rutas);
escena.background = cuboReflejo;

// === Variables de desplazamiento ===
let despX = -0.34;
let despY = -1.135;
let despZ = 0.21;

// === Recursos ===
const cargador = new GLTFLoader();
const cargadorTexturas = new THREE.TextureLoader();

// === Elemento invisible de referencia ===
const cubo = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
cubo.position.set(despX, despY, 20);
cubo.visible = false;
escena.add(cubo);

camara.lookAt(cubo.position); // no modificar

// === Modelos y carreteras ===
let e30Modelo, volante;
const carreteras = [];
const autosTrafico = [];
const señalesTrafico = [];

cargador.load('source/e30.glb', gltf => {
    e30Modelo = gltf.scene;
    contenedor.add(e30Modelo);
    e30Modelo.position.set(despX, despY, despZ);
});

cargador.load('source/e30Steering.glb', gltf => {
    volante = gltf.scene;
    contenedor.add(volante);
    volante.position.set(-0.025, -0.31, 0.52);
});

for (let i = 0; i < 3; i++) {
    cargador.load('source/road.glb', gltf => {
        const carretera = gltf.scene;
        carretera.position.set(despX, despY, despZ + i * 110); // corregido
        escena.add(carretera);
        carreteras.push(carretera);
    });
}


// === Clases ===
class AutoTrafico {
    constructor(escena, posX, ruta) {
        cargadorTexturas.load(ruta, textura => {
            const auto = new THREE.Mesh(
                new THREE.PlaneGeometry(2.5, 2.5),
                new THREE.MeshBasicMaterial({
                    map: textura,
                    transparent: true,
                    alphaTest: 0.5,
                    side: THREE.DoubleSide
                })
            );
            auto.position.set(posX, 0, 100);
            auto.rotation.y = Math.PI;
            escena.add(auto);
            this.malla = auto;
        });
    }

    moverZ(dz) {
        if (this.malla) this.malla.position.z += dz;
    }
}

class SeñalTrafico {
    constructor(escena, x, z, ruta) {
        cargadorTexturas.load(ruta, textura => {
            const señal = new THREE.Mesh(
                new THREE.PlaneGeometry(3, 3),
                new THREE.MeshBasicMaterial({
                    map: textura,
                    transparent: true,
                    alphaTest: 0.5,
                    side: THREE.DoubleSide
                })
            );
            señal.position.set(x, -1, z);
            señal.rotation.y = Math.PI;
            escena.add(señal);
            this.malla = señal;
        });
    }

    moverZ(dz) {
        if (this.malla) this.malla.position.z += dz;
    }
}

// === Generación de tráfico ===
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
        const ruta = spritesAutos[Math.floor(Math.random() * spritesAutos.length)];
        const auto = new AutoTrafico(escena, x, ruta);
        autosTrafico.push(auto);
    }
}

function generarSeñal(z) {
    const x = Math.random() < 0.5 ? -3.3 : 6.3;
    const ruta = spritesSeñales[Math.floor(Math.random() * spritesSeñales.length)];
    const señal = new SeñalTrafico(escena, x, z, ruta);
    señalesTrafico.push(señal);
}

generarAuto();

// === Control del juego ===
let juegoActivo = true;
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

            if (colisiones.length > 0 && colisiones[0].distance < distanciaColision) {
                manejarColision();
                return;
            }
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

// === Movimiento ===
let velocidad = -1;
let objetivoX = 0;
const velocidadMovimiento = 0.1;

const posicionesObjetivo = {
    izquierda: 2.3,
    derecha: 0
};

document.addEventListener('keydown', e => {
    if (!juegoActivo) return;
    if (e.key === 'ArrowLeft') objetivoX = posicionesObjetivo.izquierda;
    else if (e.key === 'ArrowRight') objetivoX = posicionesObjetivo.derecha;
});

function animar() {
    if (!juegoActivo) {
        renderizador.render(escena, camara);
        return;
    }

    contenedor.position.x += (objetivoX - contenedor.position.x) * velocidadMovimiento;

    verificarColisiones();

    carreteras.forEach(carretera => {
        carretera.position.z += velocidad;

        if (carretera.position.z < -130) {
    const maxZ = Math.max(...carreteras.map(c => c.position.z));
    carretera.position.z = maxZ + 109; // corregido
    generarSeñal(carretera.position.z);
    generarAuto();
}

    });

    señalesTrafico.forEach(s => s.moverZ(velocidad));
    autosTrafico.forEach(a => a.moverZ(velocidad * 0.2));

    renderizador.render(escena, camara);
}