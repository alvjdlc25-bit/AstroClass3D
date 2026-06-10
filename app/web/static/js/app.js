import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* 
   Parametros iniciales
*/
console.log("CAMBIO NUEVO 123");

let modoActual = 'seleccion';
let preguntaActual = null;
let puntos = 0;
let racha = 0;
let preguntasRespondidas = 0;
const LIMITE_PREGUNTAS = 5;


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const planetas = [];

/* 
   PREGUNTAS TRIVIA--pasar a base de datos y ampliar
 */

const preguntasTrivia = [
    {
        texto: "Haz clic en el planeta que habitamos nosotros (El planeta azul).",
        respuestaCorrecta: "3"
    },
    {
        texto: "Haz clic en el planeta rojo, famoso por sus tormentas de polvo.",
        respuestaCorrecta: "4"
    },
    {
        texto: "Busca y clica en el gigante gaseoso, el planeta más grande de todos.",
        respuestaCorrecta: "5"
    },
    {
        texto: "Haz clic en el planeta conocido por sus espectaculares y vistosos anillos.",
        respuestaCorrecta: "6"
    },
    {
        texto: "Haz clic en el planeta más cercano al Sol.",
        respuestaCorrecta: "1"
    },
    {
        texto: "Haz clic en el planeta más brillante del cielo.",
        respuestaCorrecta: "2"
    },
    {
        texto: "Haz clic en el gigante de hielo que rota de lado.",
        respuestaCorrecta: "7"
    },
    {
        texto: "Haz clic en el planeta más alejado del Sol.",
        respuestaCorrecta: "8"
    },
    
    {
        texto: "Haz clic en el planeta que tarda casi 30 años terrestres en dar una sola vuelta al Sol.",
        respuestaCorrecta: "6" 
    },
    {
        texto: "Busca y clica en el planeta que es prácticamente del mismo tamaño que la Tierra (su planeta gemelo).",
        respuestaCorrecta: "2" 
    },
    {
        texto: "Haz clic en el planeta que tiene más del doble de la masa que todos los demás planetas juntos.",
        respuestaCorrecta: "5" 
    },
    {
        texto: "Haz clic en el planeta que experimenta las variaciones de temperatura más extremas (pasa de 430°C de día a -180°C de noche).",
        respuestaCorrecta: "1" 
    },
    {
        texto: "Clica en el planeta que destaca por su intenso color azul debido al metano de su atmósfera y que está después de Urano.",
        respuestaCorrecta: "8" 
    },
    {
        texto: "Haz clic en el planeta que tiene dos pequeñas lunas llamadas Fobos y Deimos.",
        respuestaCorrecta: "4" 
    },
    {
        texto: "Haz clic en el planeta helado que cuenta con un sutil sistema de anillos verticales y 27 lunas.",
        respuestaCorrecta: "7" 
    },
    {
        texto: "Busca el planeta cuya superficie está cubierta en un 71% por agua líquida.",
        respuestaCorrecta: "3" 
    }


];
let preguntasDisponibles = [...preguntasTrivia];
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

    {name: "Mercurio",id: "1",size: 1.0,dist: 25,ecc: 0.35,speed: 0.015,angle: 2.1,tex: "mercurymap.jpg",bump: "mercurybump.jpg"},
    {name: "Venus",id: "2",size: 1.8,dist: 38,ecc: 0.12,speed: 0.011,angle: 5.4,tex: "venusmap.jpg",bump: "venusbump.jpg"},
    {name: "Tierra",id: "3",size: 2,dist: 52,ecc: 0.25,speed: 0.009,angle: 1.2,tex: "earthmap1k.jpg",bump: "earthbump1k.jpg",clouds: "earthcloudmap.jpg"},
    {name: "Marte",id: "4",size: 1.4,dist: 70,ecc: 0.30,speed: 0.007,angle: 3.9,tex: "marsmap1k.jpg",bump: "marsbump1k.jpg"},
    {name: "Júpiter",id: "5",size: 5.2,dist: 98,ecc: 0.22,speed: 0.004,angle: 0.5,tex: "jupitermap.jpg"},
    {name: "Saturno",id: "6",size: 4.2,dist: 125,ecc: 0.24,speed: 0.003,angle: 4.7,tex: "saturnmap.jpg",ring: "saturnringcolor.jpg"},
    {name: "Urano",id: "7",size: 2.8,dist: 155,ecc: 0.20,speed: 0.002,angle: 2.8,tex: "uranusmap.jpg",ring: "uranusringcolour.jpg"},
    {name: "Neptuno",id: "8",size: 2.6,dist: 185,ecc: 0.18,speed: 0.001,angle: 1.9,tex: "neptunemap.jpg"}

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

    const nubes = new THREE.Mesh(
        new THREE.SphereGeometry(tamaño * 1.015, 64, 64),
        new THREE.MeshStandardMaterial({
            map: textura(archivoTextura),
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );

    //  IMPORTANTE: evitar clicks en nubes
    nubes.raycast = () => {};

    return nubes;
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
    planeta.userData = {
        id: datos.id,
        nombre: datos.name
    };
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
        excentricidad: datos.ecc,
        id: datos.id
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

    // OCULTAR TODO primero 
    document.getElementById('pantalla-modos').style.display = 'none';
    document.getElementById('ayuda-explorar').style.display = 'none';
    document.getElementById('contenedor-trivia').style.display = 'none';
    document.getElementById('panel-informacion').style.display = 'none';

    // ahora se activa lo adecuado
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

    if (preguntasRespondidas >= LIMITE_PREGUNTAS || preguntasDisponibles.length === 0) {

        document.getElementById('pregunta').textContent = "Has completado el trivial!";
        document.getElementById('feedback').textContent = `Puntuación final: ${puntos}`;

        const btn = document.getElementById('btn-reiniciar-trivia');
        btn.style.display = "block";

        return;
    }

    // no repetir
    const index = Math.floor(Math.random() * preguntasDisponibles.length);
    preguntaActual = preguntasDisponibles.splice(index, 1)[0];

    document.getElementById('pregunta').textContent = preguntaActual.texto;
}
/* 
 RAYCASTER (CLICK EN PLANETAS)
*/

window.addEventListener('click', onClick);

function onClick(event) {

    

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(
        planetas.map(p => p.mesh)
    );

    if (!hits.length) return;

    const obj = hits[0].object;

    console.log("OBJ:", obj);
    console.log("USERDATA:", obj.userData);
    console.log("ID:", obj.userData?.id);

    // SOL
    if (obj.name === "Sol") {
        document.getElementById('info-nombre').textContent = "Sol";
        document.getElementById('panel-informacion').style.display = 'block';
        return;
    }

    // EXPLORAR
   // EXPLORAR (solo si estás en modo explorar)
if (modoActual === 'explorar') {

    fetch(`/api/planeta/${obj.userData.id}/`)
        .then(r => {
            if (!r.ok) throw new Error("Error en la API");
            return r.json();
        })
        .then(data => {

            document.getElementById('info-nombre').textContent = data.nombre;
            document.getElementById('info-gravedad').textContent = data.gravedad;
            document.getElementById('info-densidad').textContent = data.densidad;
            document.getElementById('info-masa').textContent = data.masa;
            document.getElementById('info-lunas').textContent = data.total_lunas;

            document.getElementById('panel-informacion').style.display = 'block';
        })
        .catch(err => {
            console.error("Error cargando planeta:", err);
        });

        } else {
            // 🔒 en trivia NO mostrar panel
            document.getElementById('panel-informacion').style.display = 'none';
        }

    // TRIVIA
    if (modoActual === 'trivia' && preguntaActual) {

        const feedback = document.getElementById('feedback');

        if (obj.userData.id === preguntaActual.respuestaCorrecta) {

            puntos += 10;
            racha++;

            feedback.textContent = "Correcto";
            feedback.className = "correcto";

            preguntasRespondidas++;

            preguntaActual = null;
            setTimeout(siguientePregunta, 2000);

        } else {

            racha = 0;

            feedback.textContent = "Incorrecto";
            feedback.className = "incorrecto";
            preguntasRespondidas++;
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

function reiniciarTrivia() {

    puntos = 0;
    racha = 0;
    preguntasRespondidas = 0;

    preguntasDisponibles = [...preguntasTrivia];

    preguntaActual = null;

    document.getElementById('puntos-actuales').textContent = 0;
    document.getElementById('racha-actual').textContent = 0;

    document.getElementById('feedback').textContent = "";
    document.getElementById('btn-reiniciar-trivia').style.display = "none";

    siguientePregunta();
}
document.getElementById('btn-reiniciar-trivia')
    .addEventListener('click', reiniciarTrivia);