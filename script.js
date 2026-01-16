// Variables globales

let scene, camera, renderer, controls;
let excavadora, cabina, brazo1, brazo2, cuchara, orugas, cilindro2;
let textureLoader, fuente;
let matMetalAmarillo, matMetalNegro, matMetal;
let foco, luzDireccional;

// Variables para texturas de orugas
let texturaOruga, texturaOruga2;
let offsetOruga = 0;

// Variables para movimiento suave excavadora
let velocidad = 0;
let velocidadRotacion = 0;
let teclaPresionada = {};
const aceleracion = 0.02;
const desaceleracion = 0.93;
const velocidadMaxima = 0.2;
const velocidadRotacionMax = 0.015;

// Variables para movimiento suave de piezas
let velocidadCabina = 0;
let velocidadBrazo1 = 0;
let velocidadBrazo2 = 0;
let velocidadCuchara = 0;
const aceleracionPiezas = 0.002;
const velocidadMaxPiezas = 0.03;

// Variables para seguimiento
let focoSigueExcavadora = false;
let camaraSigueExcavadora = false;
let offsetCamara = new THREE.Vector3(15, 10, 15);


/**
 * Inicializa la escena 3D, configurando la cámara, el renderizador, los controles, la iluminación, la geometría y los detectores de eventos.
 * Prepara el entorno para el renderizado e inicia el bucle de animación.
 */
function init() {
  // Crear escena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 50, 450);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width/height;

  // Crear cámara
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 500);
  camera.position.set(15, 10, 15);
  camera.lookAt(0, 0, 0);

  // Crear renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // OrbitControls para mover la cámara
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2;

  // Cargar texturas
  textureLoader = new THREE.TextureLoader();


  //Pre-generar materiales más usados para mejor rendimiento
  matMetalAmarillo = crearMatMetalAmarillo();
  matMetalNegro = crearMatMetalNegro();
  matMetal = crearMatMetal();

  // Crear suelo
  crearSuelo();

  // Crear excavadora
  crearExcavadora();

  // Cargar fuente para texto 3D
  const fontLoader = new THREE.FontLoader();
  fontLoader.load(
      'helvetiker_bold.typeface.json',
      function(f) {
        fuente = f;
        // Crear textos una vez cargada la fuente
        crearTextosMarca();
      }
  );

  // Crear luces
  crearLuces();

  // Eventos
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('keyup', onKeyUp, false);

  // Iniciar animación
  animate();
}

/**
 * Crea y configura diferentes tipos de fuentes de luz para la escena, incluyendo luz ambiente, luz direccional,
 * punto de luz y foco de luz.
 */
function crearLuces() {
  // Luz ambiente
  const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(luzAmbiente);

  // Luz direccional (sol)
  luzDireccional = new THREE.DirectionalLight(0xffffff, 0.8);
  luzDireccional.position.set(20, 30, 20);
  luzDireccional.castShadow = true;
  luzDireccional.shadow.camera.left = -50;
  luzDireccional.shadow.camera.right = 50;
  luzDireccional.shadow.camera.top = 50;
  luzDireccional.shadow.camera.bottom = -50;
  luzDireccional.shadow.mapSize = new THREE.Vector2(2048, 2048);
  scene.add(luzDireccional);

  // Punto de luz
  const puntoLuz = new THREE.PointLight(0xffaa00, 0.5, 50);
  puntoLuz.position.set(-10, 10, -10);
  scene.add(puntoLuz);

  // Foco de luz
  foco = new THREE.SpotLight(0xffffff, 0.7);
  foco.position.set(0, 30, 0);
  foco.angle = Math.PI / 6;
  foco.penumbra = 0.2;
  foco.castShadow = true;
  scene.add(foco);
}

/**
 * Crea y añade una malla de plano que hace de suelo para la excavadora.
 * El suelo se texturiza con una textura que simula el suelo arenoso típico de una obra.

 */
function crearSuelo() {
  const texturaSuelo = textureLoader.load('img/suelo.jpg');
  texturaSuelo.wrapS = THREE.RepeatWrapping;
  texturaSuelo.wrapT = THREE.RepeatWrapping;
  texturaSuelo.repeat.set(25, 25);

  const geoSuelo = new THREE.PlaneGeometry(1000, 1000);
  const matSuelo = new THREE.MeshStandardMaterial({
    map: texturaSuelo,
    roughness: 0.8,
    metalness: 0.2
  });
  const suelo = new THREE.Mesh(geoSuelo, matSuelo);
  suelo.rotation.x = -Math.PI / 2;
  suelo.rotation.z = -Math.PI / 4;
  suelo.receiveShadow = true;
  scene.add(suelo);
}

/**
 * * Crea y devuelve un material metálico gris mediante un mapa de textura con ajustes
 * de envoltura y repetición.
 * *
 * @return {THREE.MeshStandardMaterial} Material con la textura de metal gris aplicada,
 * configurado con roughness de 0.5 y metalness de 0.7 y renderizado a doble cara.
 */

function crearMatMetal() {
  const textura = textureLoader.load('img/texturaMetalica.png');
  textura.wrapS = THREE.MirroredRepeatWrapping;
  textura.wrapT = THREE.ClampToEdgeWrapping;
  textura.repeat.set(2, 1);

  return new THREE.MeshStandardMaterial({
    map: textura,
    roughness: 0.4,
    metalness: 0.8,
    side: THREE.DoubleSide
  });
}

/**
 * Crea y devuelve un material metálico amarillo utilizando una textura asignada desde un archivo de imagen.
 * El material utiliza una configuración de malla estándar con propiedades específicas de rugosidad y metalicidad.
 *
 * @return {THREE.MeshStandardMaterial} Material con la textura de metal amarillo aplicada,
 * configurado con roughness de 0.5 y metalness de 0.7.
 */
function crearMatMetalAmarillo() {
  const textura = textureLoader.load('img/metalAmarillo.jpg');
  textura.wrapS = THREE.ClampToEdgeWrapping;
  textura.wrapT = THREE.ClampToEdgeWrapping;

  return new THREE.MeshStandardMaterial({
    map: textura,
    roughness: 0.5,
    metalness: 0.7
  });
}

/**
 * Crea y devuelve un material estándar de Three.js con textura de metal negro.
 * La textura se carga desde una imagen externa y se configura con niveles de rugosidad y metalizado.
 *
 * @return {THREE.MeshStandardMaterial} Material con la textura de metal negro aplicada,
 * configurado con roughness de 0.5 y metalness de 0.7.
 */
function crearMatMetalNegro() {
  const textura = textureLoader.load('img/metalNegro.png');
  textura.wrapS = THREE.ClampToEdgeWrapping;
  textura.wrapT = THREE.ClampToEdgeWrapping;

  return new THREE.MeshStandardMaterial({
    map: textura,
    roughness: 0.5,
    metalness: 0.7
  });
}

/**
 * Crea y configura un modelo de excavadora compuesto por varias partes, incluidas las ruedas orugas,
 * la cabina y un brazo articulado. El resultado se agrega directamente a la escena en curso.
 *
 * @return {THREE.Group} Un grupo que representa el modelo completo de la excavadora.
 * Este grupo incluye todas las subestructuras necesarias y sus posiciones relativas configuradas.
 */
function crearExcavadora() {
  excavadora = new THREE.Group();
  excavadora.position.set(0, 0, 0);

  //Crear ruedas Orugas
  orugas = crearOrugas();
  excavadora.add(orugas);

  //Crear cabina
  cabina = crearCabina();
  cabina.position.y = 1.5;
  excavadora.add(cabina);

  //Crear brazo articulado
  const grupoBrazo = crearBrazoArticulado();
  grupoBrazo.position.set(-1.1, 0.1, -1.4);
  cabina.add(grupoBrazo);

  scene.add(excavadora);
}

/**
 * Crea un grupo de objetos que simulan unas ruedas orugas.
 * Las orugas constan de un chasis central compuesto por barras longitudinales
 * y transversales, cilindros de unión con la cabina y prismas texturizados que representan la superficie de las orugas.
 *
 * @return {THREE.Group} Un grupo de modelos 3D que representa el conjunto completo
 *         de las orugas con su chasis y elementos visuales asociados.
 */
function crearOrugas() {
  const grupoOrugas = new THREE.Group();
  const matChasis = matMetalNegro;

  //CHASIS

  const grupoChasis = new THREE.Group();

  const geoBarraLong = new THREE.BoxGeometry(0.25, 0.25, 4.25);
  const posicionesLongitudinales = [-1.37, 0.0, 1.37];
  posicionesLongitudinales.forEach(posX => {
    const barraLong = new THREE.Mesh(geoBarraLong, matChasis);
    barraLong.position.set(posX, 0.5, 0);
    barraLong.castShadow = true;
    grupoChasis.add(barraLong);
  });

  const geoCilindro1 = new THREE.CylinderGeometry(0.6, 1, 0.3, 16, 1, true);
  const UnionCilindro1 = new THREE.Mesh(geoCilindro1, matChasis);
  UnionCilindro1.position.set(0, 0.8, 0);
  grupoChasis.add(UnionCilindro1);

  const geoCilindro2 = new THREE.CylinderGeometry(0.4, 0.65, 0.4, 16, 1, false);
  const UnionCilindro2 = new THREE.Mesh(geoCilindro2, matChasis);
  UnionCilindro2.position.set(0, 1.1, 0);
  grupoChasis.add(UnionCilindro2);

  const geoBarraTrans = new THREE.BoxGeometry(2.6, 0.25, 0.25);
  const posicionesTransversales = [-2, -0.7, 0.7, 2];
  posicionesTransversales.forEach(posZ => {
    const barraTrans = new THREE.Mesh(geoBarraTrans, matChasis);
    barraTrans.position.set(0, 0.5, posZ);
    barraTrans.castShadow = true;
    grupoChasis.add(barraTrans);
  });

  grupoOrugas.add(grupoChasis);

  //RUEDAS ORUGAS

  texturaOruga = textureLoader.load('img/ruedasOruga.jpg');
  texturaOruga.wrapS = THREE.RepeatWrapping;
  texturaOruga.wrapT = THREE.RepeatWrapping;
  texturaOruga.repeat.set(1, 2.75);

  texturaOruga2 = textureLoader.load('img/ruedasOruga.jpg')
  texturaOruga2.wrapS = THREE.RepeatWrapping;
  texturaOruga2.wrapT = THREE.RepeatWrapping;
  texturaOruga2.repeat.set(1, 1);
  texturaOruga2.rotation = Math.PI / 2;
  texturaOruga2.center.set(0.5, 0.5);

  const matTexturaOruga = new THREE.MeshStandardMaterial({
    map: texturaOruga,
    roughness: 0.9,
    metalness: 0.1
  });

  const matTexturaOruga2 = new THREE.MeshStandardMaterial({
    map: texturaOruga2,
    roughness: 0.9,
    metalness: 0.1
  });

  const materialesOruga = [
    matChasis, matChasis,
    matTexturaOruga, matTexturaOruga,
    matChasis, matChasis
  ];

  const materialesOrugaCilindro = [
    matTexturaOruga2,
    matChasis,
    matChasis
  ];

  for (let lado = -1; lado <= 1; lado += 2) {
    const geoOrugaPrisma = new THREE.BoxGeometry(0.6, 1.2, 5);
    const PrismaOruga = new THREE.Mesh(geoOrugaPrisma, materialesOruga);
    PrismaOruga.position.set(lado * 1.8, 0.6, 0);
    PrismaOruga.castShadow = true;
    grupoOrugas.add(PrismaOruga);

    const geoOrugaCilindro = new THREE.CylinderGeometry(0.6, 0.6, 0.6, 16, 1, false, Math.PI/2, Math.PI);

    const orugaCilindro1 = new THREE.Mesh(geoOrugaCilindro, materialesOrugaCilindro);
    orugaCilindro1.rotation.z = -Math.PI / 2;
    orugaCilindro1.position.set(lado * 1.8, 0.6, -2.5);
    orugaCilindro1.castShadow = true;
    grupoOrugas.add(orugaCilindro1);

    const orugaCilindro2 = new THREE.Mesh(geoOrugaCilindro, materialesOrugaCilindro);
    orugaCilindro2.rotation.set(0, Math.PI, Math.PI/2);
    orugaCilindro2.position.set(lado * 1.8, 0.6, 2.5);
    orugaCilindro2.castShadow = true;
    grupoOrugas.add(orugaCilindro2)
  }

  return grupoOrugas;
}


/**
 * Crea un grupo de objetos que representan la cabina de la excavadora con varias geometrías y materiales.
 * La cabina incluye cilindros, cajas y otros componentes diseñados para formar un modelo
 * tridimensional que se puede usar en la escena de Three.js.
 *
 * @return {THREE.Group} Un grupo que contiene las geometrías de la cabina configuradas con
 * diferentes materiales, posiciones y rotaciones. Todos los subcomponentes relevantes
 * están preconfigurados y agrupados en un único objeto `THREE.Group`.
 */
function crearCabina() {
  const grupoCabina = new THREE.Group();

  //Pieza de unión con las ruedas
  const geoUnion = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16);
  const union = new THREE.Mesh(geoUnion, matMetalNegro);
  union.position.set(0, 0, 0);
  grupoCabina.add(union);

  const geoCabina1 = new THREE.BoxGeometry(4, 1, 5.5);
  const cuerpoCabina1 = new THREE.Mesh(geoCabina1, matMetalAmarillo);
  cuerpoCabina1.position.set(0, 0.7, -1.5);
  cuerpoCabina1.castShadow = true;
  grupoCabina.add(cuerpoCabina1);

  const geoCabina2 = new THREE.BoxGeometry(4, 1, 3);
  const cuerpoCabina2 = new THREE.Mesh(geoCabina2, matMetalAmarillo);
  cuerpoCabina2.position.set(0, 1.7, -2.75);
  cuerpoCabina2.castShadow = true;
  grupoCabina.add(cuerpoCabina2);

  const geoCabina3 = new THREE.BoxGeometry(1.8, 1, 1);
  const cuerpoCabina3 = new THREE.Mesh(geoCabina3, matMetalAmarillo);
  cuerpoCabina3.position.set(-1.1, 1.7, -0.75);
  cuerpoCabina3.castShadow = true;
  grupoCabina.add(cuerpoCabina3);

  //PARTE TRASERA

  const geoCabina4 = new THREE.CylinderGeometry(1, 1, 3, 32, 1, false, Math.PI/2, Math.PI);
  const cuerpoCabina4 = new THREE.Mesh(geoCabina4, matMetalAmarillo);
  cuerpoCabina4.position.set(0, 1.2, -3.75);
  cuerpoCabina4.rotation.z = Math.PI / 2;
  cuerpoCabina4.castShadow = true;
  grupoCabina.add(cuerpoCabina4);

  //Material rojo para simular reflectantes rojos
  const matRojo = new THREE.MeshStandardMaterial({
    color: 0xc61110,
    roughness: 0.1,
    metalness: 0.3
  });

  //Reflectantes rojos
  const geoCabina5 = new THREE.CylinderGeometry(1, 1, 0.49, 32, 1, false, Math.PI/2, Math.PI);
  for(let lado = -1; lado <= 1; lado += 2) {
    const cuerpoCabina5 = new THREE.Mesh(geoCabina5, matRojo);
    cuerpoCabina5.position.set(1.75 * lado, 1.2, -3.75);
    cuerpoCabina5.rotation.z = Math.PI / 2;
    cuerpoCabina5.castShadow = true;
    grupoCabina.add(cuerpoCabina5);
  }


  //Detalle decorativo negro
  const geoPiezaNegra1 = new THREE.BoxGeometry(2, 0.25, 2);
  const piezaNegra1 = new THREE.Mesh(geoPiezaNegra1, matMetalNegro);
  piezaNegra1.position.set(0, 2.33, -2.75);
  piezaNegra1.castShadow = true;
  grupoCabina.add(piezaNegra1);

  //Cabina donde del conductor con ventanas
  let ventanas = crearGrupoVentanas();
  ventanas.position.set(0.9, 1.25, 0);
  grupoCabina.add(ventanas);

  return grupoCabina;
}

/**
 * Crea un grupo de ventanas representado como una instancia de `THREE.Group`.
 * El grupo incluye componentes como tapas, barras, ventanas laterales, frontales
 * y un techo, todos con materiales y posiciones predefinidos.
 * Para las ventanas se utiliza un material con un tono azul claro y trasparente para simular el cristal.
 *
 * @return {THREE.Group} Un grupo de objetos 3D que representa toda la estructura de las ventanas.
 */
function crearGrupoVentanas() {
  const grupoVentanas = new THREE.Group();

  //Material para simular el cristal de las ventanas
  const matVentana = new THREE.MeshStandardMaterial({
    color: 0x40E0D0,
    transparent: true,
    opacity: 0.4,
    roughness: 0.3,
    metalness: 0.8,
    side: THREE.DoubleSide
  });

  //ESTRUCTURA DE LAS VENTANAS

  const geoTapa = new THREE.BoxGeometry(2.2, 0.1, 2.5);
  const tapaInferior = new THREE.Mesh(geoTapa, matMetalNegro);
  tapaInferior.position.set(0, 0, 0);
  tapaInferior.castShadow = true;
  grupoVentanas.add(tapaInferior);

  const tapaSuperior = new THREE.Mesh(geoTapa, matMetalNegro);
  tapaSuperior.position.set(0, 3, 0);
  tapaSuperior.castShadow = true;
  grupoVentanas.add(tapaSuperior);

  const geoBarraHorizontal = new THREE.BoxGeometry(2.2, 0.1, 0.1);
  const barraHorizontalFrontal = new THREE.Mesh(geoBarraHorizontal, matMetalNegro);
  barraHorizontalFrontal.position.set(0, 1, 1.2);
  barraHorizontalFrontal.castShadow = true;
  grupoVentanas.add(barraHorizontalFrontal);

  const barraHorizontalTrasera = new THREE.Mesh(geoBarraHorizontal, matMetalNegro);
  barraHorizontalTrasera.position.set(0, 1, -1.2);
  barraHorizontalTrasera.castShadow = true;
  grupoVentanas.add(barraHorizontalTrasera);

  const geoBarraHorizLateral = new THREE.BoxGeometry(0.1, 0.1, 2.5);
  const barraHorizLateral = new THREE.Mesh(geoBarraHorizLateral, matMetalNegro);
  barraHorizLateral.position.set(1.05, 1, 0);
  barraHorizLateral.castShadow = true;
  grupoVentanas.add(barraHorizLateral);

  const barraHorizLateral2 = new THREE.Mesh(geoBarraHorizLateral, matMetalNegro);
  barraHorizLateral2.position.set(-1.05, 1, 0);
  barraHorizLateral2.castShadow = true;
  grupoVentanas.add(barraHorizLateral2);

  const geoBarraVerticalLat = new THREE.BoxGeometry(0.1, 1.9, 0.1);
  const barraVerticalTraseraLat = new THREE.Mesh(geoBarraVerticalLat, matMetalNegro);
  barraVerticalTraseraLat.position.set(1.05, 2, -0.3);
  barraVerticalTraseraLat.castShadow = true;
  grupoVentanas.add(barraVerticalTraseraLat);

  const geoTapaLatDer = new THREE.BoxGeometry(0.1, 0.9, 0.9);
  const tapaLatDer = new THREE.Mesh(geoTapaLatDer, matMetalNegro);
  tapaLatDer.position.set(1.05, 0.5, -0.7);
  tapaLatDer.castShadow = true;
  grupoVentanas.add(tapaLatDer);

  const geoTapaLatIzq = new THREE.BoxGeometry(0.1, 0.9, 2.3);
  const tapaLatIzq = new THREE.Mesh(geoTapaLatIzq, matMetalNegro);
  tapaLatIzq.position.set(-1.05, 0.5, 0);
  tapaLatIzq.castShadow = true;
  grupoVentanas.add(tapaLatIzq);

  //CRISTALES DE LAS VENTANAS

  const geoVentanaFrontal = new THREE.PlaneGeometry(2.2, 3);
  const ventanaFrontal = new THREE.Mesh(geoVentanaFrontal, matVentana);
  ventanaFrontal.position.set(0, 1.55, 1.2);
  grupoVentanas.add(ventanaFrontal);

  const geoVentanaTrasera = new THREE.PlaneGeometry(2.2, 2);
  const ventanaTrasera = new THREE.Mesh(geoVentanaTrasera, matVentana);
  ventanaTrasera.position.set(0, 2.05, -1.2);
  grupoVentanas.add(ventanaTrasera);

  const geoVentanaLateralDerecha = new THREE.PlaneGeometry(2.5, 3);
  const ventanaLateralDerecha = new THREE.Mesh(geoVentanaLateralDerecha, matVentana);
  ventanaLateralDerecha.rotation.y = Math.PI / 2;
  ventanaLateralDerecha.position.set(1.05, 1.55, 0);
  grupoVentanas.add(ventanaLateralDerecha);

  const geoVentanaLateralIzquierdo = new THREE.PlaneGeometry(2.5, 2);
  const ventanaLateralIzquierdo = new THREE.Mesh(geoVentanaLateralIzquierdo, matVentana);
  ventanaLateralIzquierdo.rotation.y = Math.PI / 2;
  ventanaLateralIzquierdo.position.set(-1.05, 2.05, 0);
  grupoVentanas.add(ventanaLateralIzquierdo);

  const geoBarraVertical = new THREE.BoxGeometry(0.1, 3, 0.1);
  for(let z = -1.2; z <= 1.2; z += 2.4) {
    for(let x = -1.05; x <= 1.05; x += 2.1) {
      const barraVerticalTrasera = new THREE.Mesh(geoBarraVertical, matMetalNegro);
      barraVerticalTrasera.position.set(x, 1.55, z);
      barraVerticalTrasera.castShadow = true;
      grupoVentanas.add(barraVerticalTrasera);
    }
  }

  //TECHO

  const geoTecho = new THREE.BoxGeometry(2.4, 0.25, 2.7);
  const techo = new THREE.Mesh(geoTecho, matMetalAmarillo);
  techo.position.y = 3.183;
  techo.castShadow = true;
  grupoVentanas.add(techo);

  //FAROS

  const grupoFaro = new THREE.Group();const
  geoFaro = new THREE.BoxGeometry(0.45, 0.15, 0.05);
  const matFaro = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.0,
    metalness: 0.0,
  });

  const faro = new THREE.Mesh(geoFaro, matFaro);
  faro.castShadow = true;
  grupoFaro.add(faro);

  const geoMarcoFaro = new THREE.BoxGeometry(0.52, 0.22, 0.08);
  const MarcoFaro = new THREE.Mesh(geoMarcoFaro, matMetalNegro);
  MarcoFaro.position.z = -0.02;
  MarcoFaro.castShadow = true;
  grupoFaro.add(MarcoFaro);

  for(let lado = -1; lado <= 1; lado += 2) {
    const faro = grupoFaro.clone();
    faro.position.set(0.7*lado, 3.183, 1.35);
    grupoVentanas.add(faro);
  }


  return grupoVentanas;
}


/**
 * Crea un modelo de un brazo articulado utilizando objetos de Three.js.
 * El brazo cuenta con 2 segmentos, 2 articulaciones y una cuchara al final
 * (con una articulación para que se pueda mover independientemente del brazo).
 * Además, se incluyen una seria de cilindros para simular los cilíndros hidraulicos
 * que suelen tener las excavadoras reales.
 *
 *
 * @return {THREE.Group} Un objeto `THREE.Group` que representa el brazo articulado completo
 * con todos sus componentes integrados.
 */
function crearBrazoArticulado() {
  const grupoBrazo = new THREE.Group();

  //PRIMER SEGMENTO
  brazo1 = new THREE.Group();
  const brazo1_1 = new THREE.Group();

  const geoCilinUnion = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 25, 1, false, Math.PI/2, Math.PI);
  const union = new THREE.Mesh(geoCilinUnion, matMetalAmarillo);
  union.position.set(0, 0, -0.85);
  union.rotation.set(0, 0, -Math.PI / 2);
  union.castShadow = true;
  brazo1_1.add(union);

  const geoRect1_1 = new THREE.BoxGeometry(0.4, 0.8, 2.1);
  const rect1_1 = new THREE.Mesh(geoRect1_1, matMetalAmarillo);
  rect1_1.position.z = 0.2
  rect1_1.castShadow = true;
  brazo1_1.add(rect1_1);

  const geoCilin1_1 = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 16, 1, false, 3*Math.PI/2, Math.PI/3);
  const cilin1_1 = new THREE.Mesh(geoCilin1_1, matMetalAmarillo);
  cilin1_1.position.set(0, -0.4, 1.25);
  cilin1_1.rotation.set(0, 0, -Math.PI / 2);
  cilin1_1.castShadow = true;
  brazo1_1.add(cilin1_1);

  brazo1_1.position.set(0, 0.5, 0.9);
  brazo1_1.rotation.x = -Math.PI / 6;
  brazo1.add(brazo1_1);

  const geoBrazo1_2 = new THREE.BoxGeometry(0.4, 0.8, 4);
  const brazo1_2 = new THREE.Mesh(geoBrazo1_2, matMetalAmarillo);
  brazo1_2.position.set(0, 1.18, 4.18);
  brazo1_2.castShadow = true;
  brazo1.add(brazo1_2);

  //PRIMERA ARTICULACIÓN
  const articulacion1 = new THREE.Group();
  const geoArt1_1 = new THREE.BoxGeometry(0.2, 0.3, 1.5);
  const geoArt1_2 = new THREE.CylinderGeometry(0.75, 0.75, 0.2, 16);

  for(let lado = -1; lado <= 1; lado += 2) {
    const art1_1 = new THREE.Mesh(geoArt1_1, matMetalNegro);
    art1_1.position.x = 0.5*lado;
    art1_1.castShadow = true;
    articulacion1.add(art1_1);

    const art1_2 = new THREE.Mesh(geoArt1_2, matMetalNegro);
    art1_2.rotation.z = Math.PI / 2;
    art1_2.position.set(0.5*lado, 0.2, 0);
    art1_2.castShadow = true;
    articulacion1.add(art1_2);

    const cilindro1 = crearCilindro();
    cilindro1.position.set(0.4*lado, 0.4, 1);
    cilindro1.rotation.set(Math.PI/3, 0, Math.PI/20*lado);
    brazo1.add(cilindro1);
  }

  const geoCilinEjeArt1 = new THREE.CylinderGeometry(0.1, 0.1, 1.3, 16);
  const ejeArt1 = new THREE.Mesh(geoCilinEjeArt1, matMetal);
  ejeArt1.position.set(0, 0.2, -0.1);
  ejeArt1.rotation.set(0, 0, -Math.PI / 2);
  ejeArt1.castShadow = true;
  articulacion1.add(ejeArt1);

  articulacion1.position.set(0, 1.25, 1.9);
  grupoBrazo.add(articulacion1);

  //SEGUNDA ARTICULACIÓN
  const union2 = new THREE.Mesh(geoCilinUnion, matMetalAmarillo);
  union2.position.set(0, 1.18, 6.18);
  union2.rotation.set(Math.PI, 0, Math.PI /2);
  union2.castShadow = true;
  brazo1.add(union2);

  const geoCilinEjeArt2 = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 16);
  const ejeArt2 = new THREE.Mesh(geoCilinEjeArt2, matMetal);
  ejeArt2.position.set(0, 1.18, 6.18);
  ejeArt2.rotation.z = Math.PI/2;
  ejeArt2.castShadow = true;
  brazo1.add(ejeArt2);

  brazo1.position.set(0, 1.5, 1.8);
  brazo1.rotation.x = -Math.PI / 6;
  grupoBrazo.add(brazo1);

  //SEGUNDO SEGMENTO

  brazo2 = new THREE.Group();
  const geoBrazo2 = new THREE.BoxGeometry(0.4, 0.8, 4.2);
  const meshBrazo2 = new THREE.Mesh(geoBrazo2, matMetalAmarillo);
  meshBrazo2.position.z = 1;
  meshBrazo2.castShadow = true;
  brazo2.add(meshBrazo2);

  const union3 = new THREE.Mesh(geoCilinUnion, matMetalAmarillo);
  union3.position.z = -1.1;
  union3.rotation.z = -Math.PI /2;
  union3.castShadow = true;
  brazo2.add(union3);

  cilindro2 = crearCilindro();
  cilindro2.scale.set(1.2, 1.4, 1.2);
  cilindro2.position.set(0, -2.3, -1.7);
  cilindro2.rotation.x = Math.PI / 12;
  cilindro2.castShadow = true;
  brazo2.add(cilindro2);

  const union4 = new THREE.Mesh(geoCilinUnion, matMetalAmarillo);
  union4.position.z = 3.1;
  union4.rotation.set(Math.PI, 0, Math.PI /2);
  union4.castShadow = true;
  brazo2.add(union4);

  brazo2.position.set(0, 1.18, 6.5);
  brazo2.rotation.x = Math.PI/3;
  brazo1.add(brazo2);

  //CUCHARA

  cuchara = crearCuchara();
  cuchara.position.z = 3.1;
  brazo2.add(cuchara);

  return grupoBrazo;
}

/**
 * Crea un objeto 3D que representa un cilindro compuesto.
 * El cilindro incluye una parte amarilla metálica y otra gris metálica
 * con el objetivo de simular un cilindro hidraulico.
 *
 * @return {THREE.Group} Un grupo de objetos 3D que contiene el cilindro hidraulico.
 */
function crearCilindro() {
  const cilindro = new THREE.Group();

  const CilindroAma = new THREE.CylinderGeometry(0.15, 0.15, 1.3, 16);
  const cil1 = new THREE.Mesh(CilindroAma, matMetalAmarillo);
  cil1.castShadow = true;
  cilindro.add(cil1);

  const CilindroGris = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 16);
  const cil2 = new THREE.Mesh(CilindroGris, matMetal);
  cil2.position.y = 1.2;
  cil2.castShadow = true;
  cilindro.add(cil2);
  return cilindro;
}

/**
 * Calcula la posición del cilindro hidraulico de la segunda articulación del brazo
 * basada en un ángulo dado, utilizando una interpolación lineal entre puntos definidos en una tabla de referencias
 * (cuyos datos han sido conseguidos experimentalmente haciendo pruebas).
 *
 * @param {number} angulo - El ángulo en radianes con el que se calcula la posición del cilindro.
 * @return {Object} Un objeto que contiene:
 *                  - `anguloCil` {number}: El ángulo del cilindro interpolado o seleccionado.
 *                  - `y` {number}: La coordenada Y interpolada o seleccionada.
 *                  - `z` {number}: La coordenada Z interpolada o seleccionada.
 */
function calcularPosicionCilindro(angulo) {
  //Tabla de referencias
  const tabla = [
    { angulo: Math.PI/1.5, anguloCil: -Math.PI/4, y: -2.1, z: 0.7 },
    { angulo: Math.PI/3,   anguloCil: Math.PI/12, y: -2.3, z: -1.7 },
    { angulo: 0,           anguloCil: Math.PI/2,  y: 0.2,    z: -3.6 }
  ];

  if (angulo >= Math.PI/1.5) {
    return { anguloCil: tabla[0].anguloCil, y: tabla[0].y, z: tabla[0].z };
  }
  if (angulo <= 0) {
    return { anguloCil: tabla[2].anguloCil, y: tabla[2].y, z: tabla[2].z };
  }

  let puntoInferior, puntoSuperior;

  if (angulo > Math.PI/3) {
    puntoSuperior = tabla[0];
    puntoInferior = tabla[1];
  } else {
    puntoSuperior = tabla[1];
    puntoInferior = tabla[2];
  }

  const factor = (angulo - puntoInferior.angulo) / (puntoSuperior.angulo - puntoInferior.angulo);

  const anguloCil = puntoInferior.anguloCil + factor * (puntoSuperior.anguloCil - puntoInferior.anguloCil);
  const y = puntoInferior.y + factor * (puntoSuperior.y - puntoInferior.y);
  const z = puntoInferior.z + factor * (puntoSuperior.z - puntoInferior.z);

  return {anguloCil, y, z};
}


/**
 * Crea y devuelve un modelo 3D de una cuchara utilizando geometría y materiales de Three.js.
 *
 * El modelo incluye un eje articulado, una parte cóncava que representa la cuchara y varios dientes.
 * Todas las partes están agrupadas dentro de un objeto `THREE.Group` para facilitar la manipulación en conjunto.
 *
 * @return {THREE.Group} Un objeto `THREE.Group` que contiene las geometrías y materiales que forman la cuchara.
 */
function crearCuchara() {
  const grupoCuchara = new THREE.Group();

  const geoCilinEjeArt1 = new THREE.CylinderGeometry(0.1, 0.1, 1.55, 16);
  const ejeArt1 = new THREE.Mesh(geoCilinEjeArt1, matMetalNegro);
  ejeArt1.position.set(0, 0.0, 0.0);
  ejeArt1.rotation.set(0, 0, -Math.PI / 2);
  ejeArt1.castShadow = true;
  grupoCuchara.add(ejeArt1);

  const geoCuchara = new THREE.CylinderGeometry(1, 1, 1.5, 16, 1, false, -Math.PI/6, Math.PI*10/9);
  const cuerpoCuchara = new THREE.Mesh(geoCuchara, matMetal);
  cuerpoCuchara.position.set(0, -0.7, 0.5);
  cuerpoCuchara.rotation.z = Math.PI/2;
  cuerpoCuchara.castShadow = true;
  grupoCuchara.add(cuerpoCuchara);

  const geoDiente = new THREE.CylinderGeometry(0.15, 0, 0.8, 3);

  for (let i = -2; i <= 2; i++) {
    const diente = new THREE.Mesh(geoDiente, matMetal);
    diente.position.set(i * 0.3, -1.4, 1.23);
    diente.rotation.set(Math.PI / 8, Math.PI, 0);
    diente.castShadow = true;
    grupoCuchara.add(diente);
  }

  grupoCuchara.rotation.x = -Math.PI / 4;
  return grupoCuchara;
}

/**
 * Crea diversos textos y cuadros (uno negro y otro rojo) asociados utilizando materiales y geometrías de Three.js.
 * Los textos y elementos generados son añadidos a diferentes partes del objeto `cabina` y `brazo1`.
 * Estos textos simulan pegatinas/serigrafías con la marca ficticia de la excavadora (PAG).
 */
function crearTextosMarca() {
  if (!fuente) return; // Si no hay fuente cargada, salir

  const matTexto = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.3
  });

  const matCuadroNegro = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.3,
    metalness: 0.3
  });
  const matCuadroRojo = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.3,
    metalness: 0.3
  });

  // Configuración del texto
  const textOptions = {
    font: fuente,
    size: 0.6,
    height: 0.01,
    curveSegments: 12,
    bevelEnabled: false,
  };

  const grupoTexto = new THREE.Group();

  //Texto en blanco
  const geoTexto1 = new THREE.TextGeometry('PAG', textOptions);
  const texto1 = new THREE.Mesh(geoTexto1, matTexto);
  grupoTexto.add(texto1);

  //Cuadro negro
  const geoCuadroNegro = new THREE.BoxGeometry(2, 1, 0.01);
  const cuadroNegro = new THREE.Mesh(geoCuadroNegro, matCuadroNegro)
  cuadroNegro.position.set(0.85, 0.3, 0);
  grupoTexto.add(cuadroNegro);

  //Cuadro rojo
  const geoCuadroRojo = new THREE.BoxGeometry(2.1, 1, 0.01);
  const cuadroRojo = new THREE.Mesh(geoCuadroRojo, matCuadroRojo)
  cuadroRojo.position.set(0.95, 0.2, -0.01);
  grupoTexto.add(cuadroRojo);


  // TEXTO 1: En la cabina (lateral derecho)
  const textoLat1 = grupoTexto.clone();
  textoLat1.position.set(-2.01, 1.2, -2.8);
  textoLat1.rotation.y = -Math.PI / 2; // Rotar para que mire hacia afuera
  cabina.add(textoLat1);

  // TEXTO 2: En la cabina (lateral izquierdo)
  const textoLat2 = grupoTexto.clone();
  textoLat2.position.set(2.01, 1.2, -1.8);
  textoLat2.rotation.y = Math.PI / 2; // Rotar para que mire hacia afuera
  cabina.add(textoLat2);


  // TEXTO 3: En la cabina (frontal)
  const textoFront = grupoTexto.clone();
  textoFront.scale.set(0.7, 0.7, 0.7);
  textoFront.position.set(0, 0.5, 1.27);
  cabina.add(textoFront);


  // TEXTO 4: En el brazo (lateral derecho)
  const textoBrazo1 = grupoTexto.clone();
  textoBrazo1.scale.set(0.5, 0.5, 0.5);
  textoBrazo1.position.set(0.21, 1.05, 4.5);
  textoBrazo1.rotation.y = Math.PI / 2;
  brazo1.add(textoBrazo1);

  // TEXTO 5: En el brazo (lateral izquierdo)
  const textoBrazo2 = grupoTexto.clone();
  textoBrazo2.scale.set(0.5, 0.5, 0.5);
  textoBrazo2.position.set(-0.21, 1.05, 3.5);
  textoBrazo2.rotation.y = -Math.PI / 2;
  brazo1.add(textoBrazo2);


}

// FUNCIONES DE CONTROL DE MOVIMIENTO:

/**
 * Inicia la rotación de la cabina estableciendo su dirección.
 *
 * @param {string} direccion - Dirección en la que se debe rotar la cabina.
 */
function iniciarRotacionCabina(direccion) {
  teclaPresionada.cabinaDir = direccion;
}

/**
 * Detiene la rotación de la cabina estableciendo su dirección a cero.
 * Al invocar este método, se anula cualquier rotación activa de la cabina.
 */
function detenerRotacionCabina() {
  teclaPresionada.cabinaDir = 0;
}

/**
 * Inicia el movimiento del brazo 1 estableciendo la dirección proporcionada.
 *
 * @param {string} direccion - La dirección en la que se debe mover el brazo 1.
 */
function iniciarMovimientoBrazo1(direccion) {
  teclaPresionada.brazo1Dir = direccion;
}

/**
 * Detiene el movimiento del brazo 1 configurando su dirección a 0.
 */
function detenerMovimientoBrazo1() {
  teclaPresionada.brazo1Dir = 0;
}

/**
 * Inicia el movimiento del brazo 2 en la dirección especificada.
 *
 * @param {string} direccion - Dirección en la que se moverá el brazo 2.
 */
function iniciarMovimientoBrazo2(direccion) {
  teclaPresionada.brazo2Dir = direccion;
}

/**
 * Detiene el movimiento del brazo 2 estableciendo su dirección en 0.
 */
function detenerMovimientoBrazo2() {
  teclaPresionada.brazo2Dir = 0;
}

/**
 * Inicia el movimiento de la cuchara en la dirección especificada.
 *
 * @param {string} direccion - Dirección en la que se debe mover la cuchara. Puede ser un valor como "izquierda" o "derecha".
 */
function iniciarMovimientoCuchara(direccion) {
  teclaPresionada.cucharaDir = direccion;
}

/**
 * Detiene el movimiento de la cuchara estableciendo su dirección a 0.
 */
function detenerMovimientoCuchara() {
  teclaPresionada.cucharaDir = 0;
}


/**
 * Actualiza las rotaciones y posiciones de las piezas de un mecanismo basado en las interacciones del usuario.
 * La función controla el movimiento de diversas partes como la cabina, brazo 1, brazo 2, y cuchara,
 * aplicando límites y aceleraciones a cada uno de ellos.
 */
function actualizarMovimientoPiezas() {
  // CABINA
  if (teclaPresionada.cabinaIzq || teclaPresionada.cabinaDir === -1) {
    velocidadCabina -= aceleracionPiezas;
    if (velocidadCabina < -velocidadMaxPiezas) {
      velocidadCabina = -velocidadMaxPiezas;
    }
  } else if (teclaPresionada.cabinaDer || teclaPresionada.cabinaDir === 1) {
    velocidadCabina += aceleracionPiezas;
    if (velocidadCabina > velocidadMaxPiezas) {
      velocidadCabina = velocidadMaxPiezas;
    }
  } else {
    velocidadCabina = 0;
  }
  cabina.rotation.y += velocidadCabina;

  // BRAZO 1
  if (teclaPresionada.brazo1Subir || teclaPresionada.brazo1Dir === -1) {
    velocidadBrazo1 -= aceleracionPiezas;
    if (velocidadBrazo1 < -velocidadMaxPiezas) {
      velocidadBrazo1 = -velocidadMaxPiezas;
    }
  } else if (teclaPresionada.brazo1Bajar || teclaPresionada.brazo1Dir === 1) {
    velocidadBrazo1 += aceleracionPiezas;
    if (velocidadBrazo1 > velocidadMaxPiezas) {
      velocidadBrazo1 = velocidadMaxPiezas;
    }
  } else {
    velocidadBrazo1 = 0;

  }

  const nuevoBrazo1 = brazo1.rotation.x + velocidadBrazo1;
  brazo1.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 22, nuevoBrazo1));

  // BRAZO 2
  if (teclaPresionada.brazo2Extender || teclaPresionada.brazo2Dir === -1) {
    velocidadBrazo2 -= aceleracionPiezas;
    if (velocidadBrazo2 < -velocidadMaxPiezas) {
      velocidadBrazo2 = -velocidadMaxPiezas;
    }
  } else if (teclaPresionada.brazo2Contraer || teclaPresionada.brazo2Dir === 1) {
    velocidadBrazo2 += aceleracionPiezas;
    if (velocidadBrazo2 > velocidadMaxPiezas) {
      velocidadBrazo2 = velocidadMaxPiezas;
    }
  } else {
    velocidadBrazo2 = 0;
  }

  const nuevoBrazo2 = brazo2.rotation.x + velocidadBrazo2;
  brazo2.rotation.x = Math.max(0, Math.min(Math.PI/1.5, nuevoBrazo2));

  const posCilindro2 = calcularPosicionCilindro(brazo2.rotation.x);
  cilindro2.rotation.x = posCilindro2.anguloCil;
  cilindro2.position.y = posCilindro2.y;
  cilindro2.position.z = posCilindro2.z;

  // CUCHARA
  if (teclaPresionada.cucharaAbrir || teclaPresionada.cucharaDir === -1) {
    velocidadCuchara -= aceleracionPiezas;
    if (velocidadCuchara < -velocidadMaxPiezas) {
      velocidadCuchara = -velocidadMaxPiezas;
    }
  } else if (teclaPresionada.cucharaCerrar || teclaPresionada.cucharaDir === 1) {
    velocidadCuchara += aceleracionPiezas;
    if (velocidadCuchara > velocidadMaxPiezas) {
      velocidadCuchara = velocidadMaxPiezas;
    }
  } else {
    velocidadCuchara =0;

  }

  const nuevaCuchara = cuchara.rotation.x + velocidadCuchara;
  cuchara.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 4, nuevaCuchara));
}

/**
 * Actualiza el movimiento y la rotación de la excavadora, así como el desplazamiento de las texturas de la ruedas.
 * Este método ajusta la velocidad de movimiento y rotación en función de las teclas presionadas, y aplica una
 * desaceleración cuando no hay entrada de usuario. También calcula nuevos valores de posición y actualiza
 * propiedades relacionadas con las texturas animadas en base al estado del objeto.
 */
function actualizarMovimiento() {
  if (teclaPresionada.izquierda) {
    velocidadRotacion += aceleracion * 2;
    if (velocidadRotacion > velocidadRotacionMax) {
      velocidadRotacion = velocidadRotacionMax;
    }
  } else if (teclaPresionada.derecha) {
    velocidadRotacion -= aceleracion * 2;
    if (velocidadRotacion < -velocidadRotacionMax) {
      velocidadRotacion = -velocidadRotacionMax;
    }
  } else {
    velocidadRotacion *= desaceleracion;
    if (Math.abs(velocidadRotacion) < 0.0001) {
      velocidadRotacion = 0;
    }
  }

  excavadora.rotation.y += velocidadRotacion;

  if (teclaPresionada.arriba) {
    velocidad += aceleracion;
    if (velocidad > velocidadMaxima) {
      velocidad = velocidadMaxima;
    }
  } else if (teclaPresionada.abajo) {
    velocidad -= aceleracion;
    if (velocidad < -velocidadMaxima) {
      velocidad = -velocidadMaxima;
    }
  } else {
    velocidad *= desaceleracion;
    if (Math.abs(velocidad) < 0.0001) {
      velocidad = 0;
    }
  }

  if (velocidad !== 0) {
    excavadora.position.x += Math.sin(excavadora.rotation.y) * velocidad;
    excavadora.position.z += Math.cos(excavadora.rotation.y) * velocidad;

    // Animar textura de orugas
    // La velocidad de desplazamiento de la textura es proporcional a la velocidad de la excavadora
    offsetOruga += velocidad * 0.5; // Factor de escala para ajustar la velocidad visual
    texturaOruga.offset.y = offsetOruga;
    texturaOruga2.offset.y = offsetOruga;
  }

  if (velocidadRotacion !== 0 && velocidad !== 0) {
    const factorLateral = 0.3;
    excavadora.position.x += Math.cos(excavadora.rotation.y) * velocidadRotacion * factorLateral * 10;
    excavadora.position.z -= Math.sin(excavadora.rotation.y) * velocidadRotacion * factorLateral * 10;
  }
}

/**
 * Maneja el evento de presionar una tecla, actualizando el estado de las teclas asociadas
 * en la variable `teclaPresionada` en función del código de la tecla presionada.
 *
 * @param {KeyboardEvent} event - Evento de teclado que contiene información sobre la tecla presionada.
 */
function onKeyDown(event) {
  switch(event.keyCode) {
    case 37: teclaPresionada.izquierda = true; event.preventDefault(); break;
    case 38: teclaPresionada.arriba = true; event.preventDefault(); break;
    case 39: teclaPresionada.derecha = true; event.preventDefault(); break;
    case 40: teclaPresionada.abajo = true; event.preventDefault(); break;
    case 65: teclaPresionada.cabinaIzq = true; break;
    case 68: teclaPresionada.cabinaDer = true; break;
    case 87: teclaPresionada.brazo1Subir = true; break;
    case 83: teclaPresionada.brazo1Bajar = true; break;
    case 69: teclaPresionada.brazo2Extender = true; break;
    case 82: teclaPresionada.brazo2Contraer = true; break;
    case 70: teclaPresionada.cucharaAbrir = true; break;
    case 67: teclaPresionada.cucharaCerrar = true; break;
  }
}

/**
 * Gestiona el evento de pulsación de tecla y actualiza el estado de las teclas pulsadas según corresponda.
 *
 *  @param {KeyboardEvent} event - El evento de teclado que se activa al soltar una tecla.
 */
function onKeyUp(event) {
  switch(event.keyCode) {
    case 37: teclaPresionada.izquierda = false; break;
    case 38: teclaPresionada.arriba = false; break;
    case 39: teclaPresionada.derecha = false; break;
    case 40: teclaPresionada.abajo = false; break;
    case 65: teclaPresionada.cabinaIzq = false; break;
    case 68: teclaPresionada.cabinaDer = false; break;
    case 87: teclaPresionada.brazo1Subir = false; break;
    case 83: teclaPresionada.brazo1Bajar = false; break;
    case 69: teclaPresionada.brazo2Extender = false; break;
    case 82: teclaPresionada.brazo2Contraer = false; break;
    case 70: teclaPresionada.cucharaAbrir = false; break;
    case 67: teclaPresionada.cucharaCerrar = false; break;
  }
}


// FUNCIONES DE SEGUIMIENTO

/**
 * Alterna el comportamiento del foco entre seguir la excavadora o mantenerse fijo
 * en la posición actual de la excavadora (en función del botón correspondiente).
 * Actualiza los estilos visuales y los eventos asociados al botón y el texto de estado.
 */
function toggleFocoSeguimiento() {
  focoSigueExcavadora = !focoSigueExcavadora;
  const estadoTexto = document.getElementById('estadoFoco');
  const botonFoco = document.getElementById('botonFoco');

  if (focoSigueExcavadora) {
    foco.target = excavadora;
    estadoTexto.textContent = 'Siguiendo';
    estadoTexto.style.color = '#003300';
    botonFoco.style.backgroundColor = '#90EE90';
    botonFoco.style.color = 'black';
    botonFoco.addEventListener('mouseover', () => {
      botonFoco.style.backgroundColor = '#3CB371';
    });

    botonFoco.addEventListener('mouseout', () => {
      botonFoco.style.backgroundColor = '#90EE90';
    });

  } else {
    // Crear un objetivo estático en la posición actual de la excavadora
    const objetivoEstatico = new THREE.Object3D();
    objetivoEstatico.position.copy(excavadora.position);
    scene.add(objetivoEstatico);
    console.log(objetivoEstatico);
    foco.target = objetivoEstatico;
    estadoTexto.textContent = 'Fijo';
    estadoTexto.style.color = 'white';
    botonFoco.style.backgroundColor = '#228B22';
    botonFoco.style.color = 'white';
    botonFoco.addEventListener('mouseover', () => {
      botonFoco.style.backgroundColor = '#3CB371';
    });

    botonFoco.addEventListener('mouseout', () => {
      botonFoco.style.backgroundColor = '#228B22';
    });
  }
}

/**
 * Alterna el estado de seguimiento de la cámara respecto a la excavadora (en función del botón correspondiente).
 * Cambia entre un modo de cámara fija y un modo donde la cámara sigue a la excavadora,
 * ajustando las propiedades visuales de los controles y elementos relacionados en la interfaz.
 */
function toggleCamaraSeguimiento() {
  camaraSigueExcavadora = !camaraSigueExcavadora;
  const estadoTexto = document.getElementById('estadoCamara');

  const botonCamara = document.getElementById('botonCamara');

  if (camaraSigueExcavadora) {
    controls.enable = false;
    offsetCamara.copy(camera.position).sub(excavadora.position);
    camera.target = excavadora;
    estadoTexto.textContent = 'Siguiendo';
    estadoTexto.style.color = '#003300';
    botonCamara.style.backgroundColor = '#90EE90';
    botonCamara.style.color = 'black';
    botonCamara.addEventListener('mouseover', () => {
      botonCamara.style.backgroundColor = '#3CB371';
    });

    botonCamara.addEventListener('mouseout', () => {
      botonCamara.style.backgroundColor = '#90EE90';
    });

  } else {
    controls.enable = true;
    // Crear un objetivo estático en la posición actual de la excavadora

    controls.target.copy(excavadora.position);
    estadoTexto.textContent = 'Fijo';
    estadoTexto.style.color = 'white';
    botonCamara.style.backgroundColor = '#228B22';
    botonCamara.style.color = 'white';
    botonCamara.addEventListener('mouseover', () => {
      botonCamara.style.backgroundColor = '#3CB371';
    });

    botonCamara.addEventListener('mouseout', () => {
      botonCamara.style.backgroundColor = '#228B22';
    });
  }
}

/**
 * Maneja el evento de cambio de tamaño de la ventana actualizando la relación de aspecto
 * de la cámara y la matriz de proyección, y redimensionando el renderizador para que
 * coincida con las nuevas dimensiones de la ventana.
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Administra el ciclo de animación principal de la escena.
 * Renderiza la escena, actualiza movimientos de los objetos y ajusta
 * las posiciones de la luz, la cámara y otros elementos dinámicos según sea necesario.
 */
function animate() {
  requestAnimationFrame(animate);
  actualizarMovimiento();
  actualizarMovimientoPiezas();

  // Hacer que la luz direccional siga a la excavadora (para que no desaparezca la sombra a cierta distancia)
  luzDireccional.position.set(
      excavadora.position.x + 20,
      30,
      excavadora.position.z + 20
  );
  luzDireccional.target.position.copy(excavadora.position);
  luzDireccional.target.updateMatrixWorld();

  // Actualizar seguimiento del foco
  if (focoSigueExcavadora)
    foco.position.set(excavadora.position.x, 30, excavadora.position.z);


  // Actualizar seguimiento de cámara
  if (camaraSigueExcavadora) {
    camera.position.copy(excavadora.position).add(offsetCamara);
    camera.lookAt(excavadora.position);

  }else{
    controls.update();
  }

  renderer.render(scene, camera);
}

init();