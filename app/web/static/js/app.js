import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* 
   Parametros iniciales
*/

let modoActual = 'seleccion';
let preguntaActual = null;
let puntos = 0;
let racha = 0;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const planetas = [];

/* 
   PREGUNTAS TRIVIA--pasar a base de datos y ampliar
 */

const preguntasTrivia = [
    {
        texto: "Haz clic en el planeta que habitamos nosotros (El planeta azul).",
        respuestaCorrecta: "earth"
    },
    {
        texto: "Haz clic en el planeta rojo, famoso por sus tormentas de polvo.",
        respuestaCorrecta: "mars"
    },
    {
        texto: "Busca y clica en el gigante gaseoso, el planeta más grande de todos.",
        respuestaCorrecta: "jupiter"
    },
    {
        texto: "Haz clic en el planeta conocido por sus espectaculares y vistosos anillos.",
        respuestaCorrecta: "saturn"
    },
    {
        texto: "Haz clic en el planeta más cercano al Sol.",
        respuestaCorrecta: "mercury"
    },
    {
        texto: "Haz clic en el planeta más brillante del cielo.",
        respuestaCorrecta: "venus"
    },
    {
        texto: "Haz clic en el gigante de hielo que rota de lado.",
        respuestaCorrecta: "uranus"
    },
    {
        texto: "Haz clic en el planeta más alejado del Sol.",
        respuestaCorrecta: "neptune"
    }
];

/*
   ESCENA THREE.JS
*/

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(0, 150, 250);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);

///
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

/* 
   Controles camara
 */

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 12;
controls.maxDistance = 800;

/* 
   luz
*/

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const  LuzSolar= new THREE.PointLight(0xffffee, 6, 900);

LuzSolar.castShadow = true;
LuzSolar.shadow.mapSize.set(1024, 1024);

scene.add(LuzSolar);

/* 
   Texturas planetas
*/

const textureLoader = new THREE.TextureLoader();

const TEX_BASE =
    "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/";

function textura(archivo) {
    const textura = textureLoader.load(TEX_BASE + archivo);
    textura.colorSpace = THREE.SRGBColorSpace;
    return textura;
}

/* ==========================================
   FUNCIONES AUXILIARES
========================================== */

function posicionOrbital(distancia, excentricidad, angulo) {

    const r =
        (distancia * (1 - excentricidad * excentricidad)) /
        (1 + excentricidad * Math.cos(angulo));

    return new THREE.Vector3(
        Math.cos(angulo) * r,
        0,
        Math.sin(angulo) * r
    );
}
/* 
   SOL
*/

const Sol = new THREE.Mesh(
    new THREE.SphereGeometry(10, 64, 64),
    new THREE.MeshBasicMaterial({
        map: textura('sunmap.jpg')
    })
);

Sol.name = "Sol";

scene.add(Sol);

const BrilloSol = new THREE.Mesh(
    new THREE.SphereGeometry(10.8, 64, 64),
    new THREE.MeshBasicMaterial({
        color: 0xffaa33,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
);

scene.add(BrilloSol);

/* 
   DATOS DE PLANETAS
 */

const planetData = [

    {name: "Mercurio",id: "mercury",size: 1.0,dist: 25,ecc: 0.35,speed: 0.015,angle: 2.1,tex: "mercurymap.jpg",bump: "mercurybump.jpg"},
    {name: "Venus",id: "venus",size: 1.8,dist: 38,ecc: 0.12,speed: 0.011,angle: 5.4,tex: "venusmap.jpg",bump: "venusbump.jpg"},
    {name: "Tierra",id: "earth",size: 2,dist: 52,ecc: 0.25,speed: 0.009,angle: 1.2,tex: "earthmap1k.jpg",bump: "earthbump1k.jpg",clouds: "earthcloudmap.jpg"},
    {name: "Marte",id: "mars",size: 1.4,dist: 70,ecc: 0.30,speed: 0.007,angle: 3.9,tex: "marsmap1k.jpg",bump: "marsbump1k.jpg"},
    {name: "Júpiter",id: "jupiter",size: 5.2,dist: 98,ecc: 0.22,speed: 0.004,angle: 0.5,tex: "jupitermap.jpg"},
    {name: "Saturno",id: "saturn",size: 4.2,dist: 125,ecc: 0.24,speed: 0.003,angle: 4.7,tex: "saturnmap.jpg",ring: "saturnringcolor.jpg"},
    {name: "Urano",id: "uranus",size: 2.8,dist: 155,ecc: 0.20,speed: 0.002,angle: 2.8,tex: "uranusmap.jpg",ring: "uranusringcolour.jpg"},
    {name: "Neptuno",id: "neptune",size: 2.6,dist: 185,ecc: 0.18,speed: 0.001,angle: 1.9,tex: "neptunemap.jpg"}

];
/* ==========================================
   ÓRBITAS
========================================== */
function crearOrbita(distancia, excentricidad) {

    const puntos = [];

    for (let i = 0; i <= 128; i++) {

        const angulo = (i / 128) * Math.PI * 2;

        puntos.push(
            posicionOrbital(distancia, excentricidad, angulo)
        );
    }

    const geometria = new THREE.BufferGeometry()
        .setFromPoints(puntos);

    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25
    });

    return new THREE.LineLoop(geometria, material);
}

/* ==========================================
   ANILLOS
========================================== */

function crearAnillo(tamañoPlaneta, archivoTextura) {

    const geometria = new THREE.RingGeometry(
        tamañoPlaneta * 1.3,
        tamañoPlaneta * 2.3,
        128
    );

    const material = new THREE.MeshBasicMaterial({
        map: textura(archivoTextura),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });

    const anillo = new THREE.Mesh(geometria, material);

    anillo.rotation.x = Math.PI / 2;

    anillo.castShadow = true;
    anillo.receiveShadow = true;

    return anillo;
}
/* 
   Atmosfera
*/

function crearNubes(tamaño, archivoTextura) {

    return new THREE.Mesh(
        new THREE.SphereGeometry(tamaño * 1.015, 64, 64),
        new THREE.MeshStandardMaterial({
            map: textura(archivoTextura),
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
}

/* ==========================================
   CREAR PLANETA
========================================== */
function crearPlaneta(datos) {

    const opcionesMaterial = {
        map: textura(datos.tex),
        roughness: 0.7,
        metalness: 0
    };

    if (datos.bump) {
        opcionesMaterial.bumpMap = textura(datos.bump);
        opcionesMaterial.bumpScale = 0.05;
    }

    const planeta = new THREE.Mesh(
        new THREE.SphereGeometry(datos.size, 64, 64),
        new THREE.MeshStandardMaterial(opcionesMaterial)
    );

    planeta.name = datos.id;

    planeta.castShadow = true;
    planeta.receiveShadow = true;

    planeta.rotation.z = Math.random() * 0.4;

    planeta.position.copy(
        posicionOrbital(datos.dist, datos.ecc, datos.angle)
    );

    scene.add(planeta);

    let nubes = null;

    if (datos.clouds) {
        nubes = crearNubes(datos.size, datos.clouds);
        planeta.add(nubes);
    }

    if (datos.ring) {
        planeta.add(crearAnillo(datos.size, datos.ring));
    }

    scene.add(crearOrbita(datos.dist, datos.ecc));

    planetas.push({
        mesh: planeta,
        nubes: nubes,
        angulo: datos.angle,
        velocidad: datos.speed,
        distancia: datos.dist,
        excentricidad: datos.ecc
    });
}
/* ==========================================
   CREAR TODOS LOS PLANETAS
========================================== */

planetData.forEach(crearPlaneta);

/* ==========================================
   FONDO GALÁCTICO
========================================== */

const background = new THREE.Mesh(
    new THREE.SphereGeometry(1000, 64, 64),
    new THREE.MeshBasicMaterial({
        map: textura('galaxy_starfield.png'),
        side: THREE.BackSide,
        color: 0x888888
    })
);

scene.add(background);

/* ==========================================
   ESTRELLAS
========================================== */

function crearEstrellas(cantidad = 1000) {

    const posiciones = [];

    for (let i = 0; i < cantidad; i++) {

        posiciones.push(
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000
        );
    }

    const geometria = new THREE.BufferGeometry();

    geometria.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(posiciones, 3)
    );

    const material = new THREE.PointsMaterial({
        size: 1,
        color: 0xffffff
    });

    return new THREE.Points(geometria, material);
}
scene.add(crearEstrellas());

/* ==========================================
   TRIVIA / MODOS
========================================== */
window.cambiarModo = function (modo) {

    modoActual = modo;

    document.getElementById('pantalla-modos').style.display = 'none';

    if (modo === 'explorar') {
        document.getElementById('ayuda-explorar').style.display = 'block';
    }

    if (modo === 'trivia') {
        document.getElementById('contenedor-trivia').style.display = 'block';
        siguientePregunta();
    }
};

function siguientePregunta() {

    let feedback = document.getElementById('feedback');

    if (feedback) {
        feedback.textContent = "";
        feedback.className = "";
    }

    preguntaActual = preguntasTrivia[
        Math.floor(Math.random() * preguntasTrivia.length)
    ];

    document.getElementById('pregunta').textContent = preguntaActual.texto;
}
/* 
 RAYCASTER (CLICK EN PLANETAS)
*/

window.addEventListener('click', onClick);

function onClick(event) {

    if (modoActual === 'seleccion') return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(
        planetas.map(p => p.mesh)
    );

    if (!hits.length) return;

    const obj = hits[0].object;

    // SOL
    if (obj.name === "Sol") {
        document.getElementById('info-nombre').textContent = "Sol";
        document.getElementById('panel-informacion').style.display = 'block';
        return;
    }

    // EXPLORAR
    if (modoActual === 'explorar') {

        fetch(`/api/planeta/${obj.name}/`)
            .then(r => r.json())
            .then(data => {

                document.getElementById('info-nombre').textContent = data.nombre;
                document.getElementById('info-gravedad').textContent = data.gravedad;
                document.getElementById('info-densidad').textContent = data.densidad;
                document.getElementById('info-masa').textContent = data.masa;
                document.getElementById('info-lunas').textContent = data.total_lunas;

                document.getElementById('panel-informacion').style.display = 'block';
            });

        return;
    }

    // TRIVIA
    if (modoActual === 'trivia' && preguntaActual) {

        const feedback = document.getElementById('feedback');

        if (obj.name === preguntaActual.respuestaCorrecta) {

            puntos += 10;
            racha++;

            feedback.textContent = "Correcto";
            feedback.className = "correcto";

            preguntaActual = null;
            setTimeout(siguientePregunta, 2000);

        } else {

            racha = 0;

            feedback.textContent = "Incorrecto";
            feedback.className = "incorrecto";
        }

        document.getElementById('puntos-actuales').textContent = puntos;
        document.getElementById('racha-actual').textContent = racha;
    }
}
/* 
   RESIZE youtube
*/

window.addEventListener('resize', () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

/* 
   ANIMACIÓN 
*/

const clock = new THREE.Clock();

function animar() {

    requestAnimationFrame(animar);

    const delta = clock.getDelta();

    Sol.rotation.y += 0.002;
    background.rotation.y -= 0.0002;

    planetas.forEach(p => {

        p.angulo += delta * p.velocidad * 10;

        p.mesh.position.copy(
            posicionOrbital(p.distancia, p.excentricidad, p.angulo)
        );

        p.mesh.rotation.y += 0.01;

        if (p.nubes)
            p.nubes.rotation.y += 0.002;
    });

    controls.update();
    renderer.render(scene, camera);
}

animar();
