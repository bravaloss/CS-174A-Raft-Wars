import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { normalize } from 'three/src/math/MathUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera2 = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, .01, 500);
const loader = new GLTFLoader();

loader.load('./assets/raft_by_henri/scene.gltf',
    function ( gltf ) {
        scene.add( gltf.scene );
        scene.remove(raft);
        gltf.scene.position.set(-5, -0.5, 0);

        // gltf.scene.rotation.z = -Math.PI / 2;

        gltf.scene.rotation.y = Math.PI / 2; 
        // gltf.scene.rotation.x = -Math.PI / 4; // Tilt up 45 degrees

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        //swaying animation
        const originalAnimate = animate;
        animate = function() {
            let time = clock.getElapsedTime();
            gltf.scene.position.y = -0.2 + Math.sin(time * 2) * 0.1;
            originalAnimate();
        }
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( 'An error happened', error );
    }
);

//enemy raft 1 gltf  17, -0.9, 0
loader.load('./assets/jangada_de_bambu_bamboo_raft/scene.gltf',
    function ( gltf ) {
        scene.add( gltf.scene );
        scene.remove(enemyRaft1);
        gltf.scene.position.set(17, -.8, -.5);
        gltf.scene.scale.set(0.1, 0.1, 0.1);

        // gltf.scene.rotation.z = -Math.PI / 2;

        // gltf.scene.rotation.y = Math.PI / 2; 
        // gltf.scene.rotation.x = -Math.PI / 4; // Tilt up 45 degrees

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        //swaying animation
        const originalAnimate = animate;
        animate = function() {
            let time = clock.getElapsedTime();
            gltf.scene.position.y = -.8 + Math.sin(time * 2) * 0.1;
            originalAnimate();
        }
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( 'An error happened', error );
    }
);

loader.load('./assets/raft/scene.gltf',
    function ( gltf ) {
        scene.add( gltf.scene );
        scene.remove(raft);
        gltf.scene.position.set(-6, -0.9, 0)
        gltf.scene.scale(0.5,0.3,0.5);

        // Rotate the raft 90 degrees around the Y-axis and tilt it up 45 degrees
        // gltf.scene.rotation.z = -Math.PI / 2;

        gltf.scene.rotation.y = Math.PI / 2; 
        // gltf.scene.rotation.x = -Math.PI / 4; // Tilt up 45 degrees

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        // Add swaying animation in the animate function
        const originalAnimate = animate;
        animate = function() {
            let time = clock.getElapsedTime();
            gltf.scene.position.y = -0.2 + Math.sin(time * 2) * 0.1;
            originalAnimate();
        }
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( 'An error happened', error );
    }
);

camera2.position.set(0,10,0);
camera2.lookAt(0,0,-10);
camera2.name = "Minimap";

const createAxisLine = (color, start, end) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
};

const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 0, 0)); // Red
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)); // Green
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 3)); // Blue
// scene.add(xAxis);
// scene.add(yAxis);
// scene.add(zAxis);


// const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); //light blue for sky
const shootSound = new Audio('/boom.mp3');
const splashSound = new Audio('/splash.mp3');
splashSound.volume = 0.1;
shootSound.volume = 0.7;    

let isFiring = false;
let projectile;
let enemyProjectile = null;
const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
enemyProjectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
let initialVelocity = new THREE.Vector3(); //store the initial velocity of the projectile
let projectileVelocity = new THREE.Vector3();
let enemyProjectileVelocity = new THREE.Vector3();
let initialSpeed = 15; // Initial speed of the projectile
const MIN_SPEED = 5;   // Minimum speed limit
const MAX_SPEED = 25;  // Maximum speed limit
const SPEED_INCREMENT = 1; // How much speed changes per key press
const gravityVector = new THREE.Vector3(0, -9.8, 0); // Gravity as a vector
let isEnemyProjectileActive = false;

let lastTime = 0;
let attachedObject = null;
let cannonAttached = false;
let cannonPosition = new THREE.Vector3();
let defaultCameraPosition = new THREE.Vector3(-5, 0, 9);
// let defaultCameraPosition = new THREE.Vector3(18.5, 0, 9);
const enemyDefaultCameraPosition = new THREE.Vector3(18.5, 0, 9); // Enemy's default camera position
const enemyDefaultCameraRotation = new THREE.Euler(); // Clone to store initial rotation for enemy

let blendingFactor = 0.02;

let cameraResetDelay = 3.7; // econds to wait before resetting camera
let projectileRemovedTime = null; //
let isInResetDelay = false; //check if we reset camera yet
let enemyProjectileRemovedTime = null;


const enemyFireDelay = 3.8; // 3 seconds delay
let lastEnemyFireTime = null;


let splash;
let splashStartTime = null;
const splashDuration = 1; 





function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}

function rotationMatrixX(theta) {
    return new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, Math.cos(theta), -Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

function rotationMatrixY(theta) {
    return new THREE.Matrix4().set(
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

function rotationMatrixZ(theta) {
	return new THREE.Matrix4().set(
		Math.cos(theta), -Math.sin(theta), 0, 0,
		Math.sin(theta),  Math.cos(theta), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	);
}

function playShootSound() {
    shootSound.currentTime = 0; 
    shootSound.play();          
}

function playSplashSound() {
    splashSound.currentTime = 0;
    splashSound.play();
}

//skibidi toilet
const cannonBasePosition = {
    x: -4.14,
    y: 0,
    z: 0.64
}

const enemyCannonPosition = {
    x: 16.44,
    y: -0.32,
    z: 0.64
}


function createCloud() {
    const cloudGroup = new THREE.Group();
    const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    //multiple spheres for cloud shape and group them together
    for (let i = 0; i < 5; i++) {
        const cloudPartGeometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.5, 16, 16);
        const cloudPart = new THREE.Mesh(cloudPartGeometry, cloudMaterial);
        cloudPart.position.set(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 2
        );
        cloudGroup.add(cloudPart);
    }

    return cloudGroup;
}

//put clouds in the sky
for (let i = 0; i < 5; i++) {
    const cloud = createCloud();
    //random xyz coordinates in the sky
    cloud.position.set(
        (Math.random() - 0.5) * 50,  
        Math.random() * 5 + 5,       
        -Math.random() * 50          
    );
    scene.add(cloud);
}


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let clock = new THREE.Clock(); 
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enabled = true;
controls.minDistance = 0;
controls.maxDistance = 50;


//initial cube (big bro)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xefd6a5 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

//water
const waterGeometry = new THREE.PlaneGeometry(500, 500);
const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x1ca3ec, side: THREE.DoubleSide });
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2; //makes the water horizontal
water.position.y = -1; //lowers water
scene.add(water);

// health bars
// big bro health bar
const healthBar1Geometry = new THREE.BoxGeometry( 1.8, 0.3, 0.3 ); 
const healthBar2Geometry = new THREE.BoxGeometry( 1.8, 0.3, 0.3 ); 
const healthBar3Geometry = new THREE.BoxGeometry( 1.8, 0.3, 0.3 ); 
const healthBar4Geometry = new THREE.BoxGeometry( 1.8, 0.3, 0.3 ); 
const healthBar1Material = new THREE.MeshBasicMaterial( {color: 0x228B22} ); 
const healthBar2Material = new THREE.MeshBasicMaterial( {color: 0x228B22} ); 
const healthBar3Material = new THREE.MeshBasicMaterial( {color: 0x228B22} ); 
const healthBar4Material = new THREE.MeshBasicMaterial( {color: 0x228B22} ); 

const healthBar1 = new THREE.Mesh(healthBar1Geometry, healthBar1Material); 
scene.add(healthBar1);
healthBar1.position.x = -5;
healthBar1.position.y = 1.8;

// little bro health bar
const healthBar2 = new THREE.Mesh(healthBar2Geometry, healthBar2Material); 
scene.add(healthBar2);
healthBar2.position.x = -7;
healthBar2.position.y = 1.8;

// enemy 1 health bar
const healthBar3 = new THREE.Mesh(healthBar3Geometry, healthBar3Material); 
scene.add(healthBar3);
healthBar3.position.x = 17;
healthBar3.position.y = 1.8;

// enemy 2 health bar
const healthBar4 = new THREE.Mesh(healthBar4Geometry, healthBar4Material); 
scene.add(healthBar4);
healthBar4.position.x = 20;
healthBar4.position.y = 1.8;


//first raft
const raftGeometry = new THREE.BoxGeometry(2, 0.2, 2);
const raftMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
const raft = new THREE.Mesh(raftGeometry, raftMaterial);
raft.position.y = -0.9; 
scene.add(raft);

// Lighting (optional)
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(0, 9, 0).normalize();
scene.add(light);

// camera.position.z = 5;
// camera.position.set(6, 2, 15);

//below is position for player
camera.position.set(-5, 0, 9);

//below is position for enemy
// camera.position.set(18, 0, 9);

raft.position.x = -5
cube.position.x = -5

//smaller raft
const raftGeometry2 = new THREE.BoxGeometry(1.5, 0.15, 1.5); 
const raftMaterial2 = new THREE.MeshBasicMaterial({ color: 0xffa500 });
const raft2 = new THREE.Mesh(raftGeometry2, raftMaterial2);
raft2.position.set(3, -0.9, 0); //next to big bro
scene.add(raft2);

//second cube
const whiteCubeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8); // Reduced size
const whiteCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xefddbb });
const whiteCube = new THREE.Mesh(whiteCubeGeometry, whiteCubeMaterial);
whiteCube.position.set(3, -0.5, 0); //above smaller raft
scene.add(whiteCube);

raft2.position.x = -6.8
whiteCube.position.x = -6.8

const islandGeometry = new THREE.CylinderGeometry(5, 7, 1, 32);
const islandMaterial = new THREE.MeshBasicMaterial({ color: 0xC2B280 }); // Sandy color
const island = new THREE.Mesh(islandGeometry, islandMaterial);
island.position.set(0, -0.5, -40); // Position it in the background
scene.add(island);

//ENEMIES!!!

//enemy1 raft
const enemyRaftGeometry1 = new THREE.BoxGeometry(1.8, 0.18, 1.8);
const enemyRaftMaterial1 = new THREE.MeshBasicMaterial({ color: 0x8B0000 }); // Dark red color
const enemyRaft1 = new THREE.Mesh(enemyRaftGeometry1, enemyRaftMaterial1);
enemyRaft1.position.set(17, -0.9, 0);
scene.add(enemyRaft1);

const enemyCubeGeometry1 = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const enemyCubeMaterial1 = new THREE.MeshBasicMaterial({ color: 0x2F4F4F }); // Dark slate gray color
const enemyCube1 = new THREE.Mesh(enemyCubeGeometry1, enemyCubeMaterial1);
enemyCube1.position.set(17, -0.5, 0);
scene.add(enemyCube1);

//enemy2 raft
const enemyRaftGeometry2 = new THREE.BoxGeometry(1.8, 0.18, 1.8);
const enemyRaftMaterial2 = new THREE.MeshBasicMaterial({ color: 0xFF4500 }); // Orange-red color
const enemyRaft2 = new THREE.Mesh(enemyRaftGeometry2, enemyRaftMaterial2);
enemyRaft2.position.set(20, -0.9, 0);
scene.add(enemyRaft2);

const enemyCubeGeometry2 = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const enemyCubeMaterial2 = new THREE.MeshBasicMaterial({ color: 0x4B0082 }); // Indigo color
const enemyCube2 = new THREE.Mesh(enemyCubeGeometry2, enemyCubeMaterial2);
enemyCube2.position.set(20, -0.5, 0);
scene.add(enemyCube2);

// bounding boxes for collision

// bounding box bro to enemy
let enemyCube1_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
enemyCube1_bb.setFromObject(enemyCube1);

let enemyCube2_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
enemyCube2_bb.setFromObject(enemyCube2);

let cannonball_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

// bounding box enemy to bro
let cube_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube_bb.setFromObject(cube);

let whiteCube_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
whiteCube_bb.setFromObject(whiteCube); // Initialize with whiteCube object

let enemyCannonball_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
enemyCannonball_bb.setFromObject(enemyProjectile);




function createPalmFrond() {
    const frondGroup = new THREE.Group();
    
    const stemGeometry = new THREE.CylinderGeometry(0.1, 0.05, 8, 8);
    const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5a27 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.rotation.x = Math.PI / 2.5;
    frondGroup.add(stem);
    
    const leafletCount = 20;
    const leafletGeometry = new THREE.PlaneGeometry(0.8, 2.5);
    const leafletMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x41e811,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
    });
    
    for (let i = 0; i < leafletCount; i++) {
        for (let side = -1; side <= 1; side += 2) {
            const leaflet = new THREE.Mesh(leafletGeometry, leafletMaterial);
            const progress = i / leafletCount;
            leaflet.position.y = progress * 7 - 3.5;
            leaflet.position.x = side * 0.2;
            leaflet.rotation.z = side * (Math.PI / 4 + progress * Math.PI / 6);
            leaflet.rotation.y = side * Math.PI / 6;
            leaflet.rotation.x = -progress * Math.PI / 8;
            stem.add(leaflet);
        }
    }
    
    return frondGroup;
}


function createPalmTree(trunkHeight = 10, frondsCount = 8) {
    const treeGroup = new THREE.Group();
    
    //trunk 
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0xb59842});
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    treeGroup.add(trunk);
    
    //circular pattern
    for (let i = 0; i < frondsCount; i++) {
        const frond = createPalmFrond();
        frond.position.y = trunkHeight / 2;
        const angle = (i / frondsCount) * Math.PI * 2;
        frond.rotation.y = angle;
        frond.rotation.x += (Math.random() - 0.5) * 0.2;
        frond.rotation.z += (Math.random() - 0.5) * 0.2;
        treeGroup.add(frond);
    }
    
    return treeGroup;
}


const palmTree = createPalmTree(12, 10);
palmTree.position.set(0, 1.5, -40);

scene.add(palmTree);

//create cannon ( to shoot )
const cannonGeomtry = new THREE.BoxGeometry(1.5, 0.25, .25); // Reduced size
const cannonMaterial = new THREE.MeshBasicMaterial({ color: 0xe3300d});
const cannon = new THREE.Mesh(cannonGeomtry, cannonMaterial);
scene.add(cannon);

const enemyCannon = new THREE.Mesh(cannonGeomtry,  new THREE.MeshBasicMaterial({ color: 0x000000}));

scene.add(enemyCannon);

enemyCannon.position.z += .73;
enemyCannon.position.x += 16.44;
enemyCannon.position.y -= 0.32;
cannon.position.z += .64;
cannon.position.x -= 4.34;

let cannonAngle = 0;
let enemyCannonAngle = Math.PI; //pointing the opposite direction
// let enemyCannonAngle = 0;
//function which has the enemy shoot a projectile at a calculated angle based on the distance between the player and the enemy, with a randomized element


function fireEnemyProjectile(cannonAngle) {
    
    if (enemyProjectile) {
        scene.remove(enemyProjectile);
    }

    //create enmy projectile
    const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    enemyProjectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

    const cannonLength = 0.75;
    const cannonEndPosition = new THREE.Vector3(
        enemyCannonPosition.x + Math.cos(cannonAngle) * cannonLength,
        enemyCannonPosition.y + Math.sin(cannonAngle) * cannonLength,
        enemyCannonPosition.z
    );

    // Initial position of the enemy projectile
    enemyProjectile.position.copy(cannonEndPosition);
    enemyProjectile.position.y += 0.16;
    enemyProjectile.position.z -= 0.5;

    const speed = 10000000000;

    //
    enemyProjectileVelocity.set(
        Math.cos(cannonAngle) * initialSpeed,
        Math.sin(cannonAngle) * initialSpeed,
        0
    );


    scene.add(enemyProjectile);
}


function fireProjectile(cannonAngle) {
    
    //remove existing projectile if one is already firing
    if (isFiring && projectile) {
        scene.remove(projectile);
    }

    //make projectile
    const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);


    const cannonLength = 0.75;
    const cannonEndPosition = new THREE.Vector3(
        cannonBasePosition.x + Math.cos(cannonAngle) * cannonLength,
        cannonBasePosition.y + Math.sin(cannonAngle) * cannonLength,
        cannonBasePosition.z
    );
    projectile.position.copy(cannonEndPosition);
    projectile.position.y += 0.16;
    projectile.position.z -= 1;
    
    //set initial velocity
    projectileVelocity.set(
        Math.cos(cannonAngle) * initialSpeed,
        Math.sin(cannonAngle) * initialSpeed,
        0
    );

    scene.add(projectile);
    isFiring = true;
    lastTime = clock.getElapsedTime();
}

//function that calculates radians from degree  
function deg2rad(degrees) {
    return degrees * Math.PI / 180;
}

//function that calculates the angle the enemy cannon should shoot at
function calculateEnemyCannonAngle() {
    const deltaX = cannon.position.x - enemyCannon.position.x;
    const deltaY = cannon.position.y - enemyCannon.position.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const g = 9.8;
    const vSquared = initialSpeed * initialSpeed;
    const sin2Theta = (g * distance) / vSquared;

    const clampedSin2Theta = Math.max(-1, Math.min(1, sin2Theta));
    const baseAngle = Math.asin(clampedSin2Theta) / 2;

    const randomOffset = (Math.random() - 0.5) * deg2rad(15); //random +- 15 degrees offset
    return Math.PI - Math.max(0, Math.min(Math.PI / 2, baseAngle + randomOffset));
}


let isEnemyPreparingToShoot = false; 
let enemyShootStartTime = null; 

let isEnemyRotating = false; 
let enemyTargetAngle = null; //target angle for rotation

// Handle key down events

const powerDisplay = document.getElementById('powerDisplay');

function updatePowerDisplay(power) {
    powerDisplay.textContent = `Power: ${power}`;
}


function handleKeyDown(event) 
{
    const rotationSpeed = Math.PI / 180; 

    //arrow keys to aim cannon
    if (event.key === 'ArrowUp') {
        cannonAngle = Math.min(cannonAngle + rotationSpeed, Math.PI / 2);
        // enemyCannonAngle = Math.PI -   cannonAngle;
    } 
    else if (event.key === 'ArrowDown') 
    {
        cannonAngle = Math.max(cannonAngle - rotationSpeed, 0);
        // enemyCannonAngle = Math.PI - cannonAngle;
    } 
    //space bar to shoot
    else if (event.key === ' ') { 
        fireProjectile(cannonAngle);
        playShootSound();
        cannonPosition.copy(cannon.position);
        cannonAttached = true;
    
        lastEnemyFireTime = clock.getElapsedTime();
        isEnemyPreparingToShoot = true; // Enemy starts preparing
        enemyShootStartTime = clock.getElapsedTime();
    
        // Set the target angle for the enemy cannon and start rotation
        enemyTargetAngle = calculateEnemyCannonAngle();
        // isEnemyRotating = true;
    }
    //arrow keys to set power
    else if (event.key === 'ArrowRight') {
        //increase initial speed unless beyond max speed
        initialSpeed = Math.min(initialSpeed + SPEED_INCREMENT, MAX_SPEED);
        console.log(`Projectile Speed: ${initialSpeed}`);
        updatePowerDisplay(initialSpeed);

    }
    else if (event.key === 'ArrowLeft') {
        initialSpeed = Math.max(initialSpeed - SPEED_INCREMENT, MIN_SPEED);
        console.log(`Projectile Speed: ${initialSpeed}`);
        updatePowerDisplay(initialSpeed);

    }
    
    //reset cannon position and apply transformations for pivot rotation
    cannon.position.set(cannonBasePosition.x, cannonBasePosition.y, cannonBasePosition.z);
    enemyCannon.position.set(enemyCannonPosition.x, enemyCannonPosition.y, enemyCannonPosition.z);
    const pivotX = -0.75;
    const pivotZ = -0.125;

    const toOrigin = translationMatrix(-pivotX, 0, -pivotZ);
    const rotation = rotationMatrixZ(cannonAngle);
    const fromOrigin = translationMatrix(pivotX, 0, pivotZ);
    const toPosition = translationMatrix(cannonBasePosition.x, cannonBasePosition.y, cannonBasePosition.z);

    const finalMatrix = new THREE.Matrix4()
        .multiply(toPosition)
        .multiply(fromOrigin)
        .multiply(rotation)
        .multiply(toOrigin);

    const enemyPivotX = 0.75;  // Positive to flip the pivot point
    const enemyToOrigin = translationMatrix(-enemyPivotX, 0, -pivotZ);
    const enemyRotation = new THREE.Matrix4().multiply(
        rotationMatrixZ(enemyCannonAngle)
    ).multiply(
        rotationMatrixY(Math.PI)  // Rotate 180 around Y axis to face the opposite direction
    );
    const enemyFromOrigin = translationMatrix(enemyPivotX, 0, pivotZ);
    const enemyToPosition = translationMatrix(enemyCannonPosition.x, enemyCannonPosition.y, enemyCannonPosition.z);

    const enemyFinalMatrix = new THREE.Matrix4()
        .multiply(enemyToPosition)
        .multiply(enemyFromOrigin)
        .multiply(enemyRotation)
        .multiply(enemyToOrigin);


    cannon.matrix.copy(finalMatrix);
    cannon.matrixAutoUpdate = false;
    // enemyCannon.matrix.copy(finalMatrix);
    // enemyCannon.matrixAutoUpdate = false;

    enemyCannon.matrix.copy(enemyFinalMatrix);
    enemyCannon.matrixAutoUpdate = false;
}

cannon.position.set(cannonBasePosition.x, cannonBasePosition.y, cannonBasePosition.z);



//projectile equations:
// x = xi + vx*t
// y = yi +vy*t+ 1/2 g * t^2


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    insetWidth = window.innerHeight / 4;
    insetHeight = window.innerWidth / 4;

    camera2.aspect = insetWidth / insetHeight;
    camera2.updateProjectionMatrix();

}

// const defaultCameraPosition = new THREE.Vector3(-5, 0, 9);
const defaultCameraRotation = camera.rotation.clone(); // Clone to store initial rotation

function updateCameraPosition(deltaTime) {
    const currentTime = clock.getElapsedTime();

    if (isFiring && projectile) {
        const fixedZPosition = defaultCameraPosition.z; //keep z-position constant
        const yOffset = 2;        
        const cameraPosition = new THREE.Vector3(
            projectile.position.x + 10,             //follows parallel to projectile
            projectile.position.y + yOffset - 1.5,   
            fixedZPosition                  
        );

        //camera towards the new position without changing its rotation
        camera.position.lerp(cameraPosition, blendingFactor);

        
        camera.rotation.copy(defaultCameraRotation);

        
        controls.enabled = false;
        isInResetDelay = false;
    }
    else if (enemyProjectile) {
        const fixedZPosition = defaultCameraPosition.z; 
        const yOffset = 2;        
        const cameraPosition = new THREE.Vector3(
            enemyProjectile.position.x,            
            enemyProjectile.position.y + yOffset,  
            fixedZPosition                         
        );

        camera.position.lerp(cameraPosition, blendingFactor);

        //
        camera.rotation.copy(defaultCameraRotation);

        
        controls.enabled = false;
        isInResetDelay = false;
    }
    else if (projectileRemovedTime && currentTime - projectileRemovedTime < cameraResetDelay) {
        //lerp the camera to the enemy's position
        camera.position.lerp(enemyDefaultCameraPosition, blendingFactor);
        camera.rotation.copy(enemyDefaultCameraRotation);
        controls.enabled = false;
        isInResetDelay = true;
    } 
    else {
        camera.position.lerp(defaultCameraPosition, blendingFactor);
        camera.rotation.copy(defaultCameraRotation);
        controls.enabled = true;
        isInResetDelay = false;
    }
}
// Handle window resize
window.addEventListener('resize', onWindowResize, false);



//create splash effect at impact position
function createSplash(position) {

    if (splash) {
        scene.remove(splash);
        splash = null;
    }

    //small sphere a splash
    const splashGeometry = new THREE.SphereGeometry(0.3, 16, 16); 
    const splashMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1 });
    splash = new THREE.Mesh(splashGeometry, splashMaterial);
    
    //set splash's position to where the cannon hit the water
    splash.position.copy(position);
    splash.position.y = water.position.y + 0.1; //slightly above water surface
    scene.add(splash);

    splashStartTime = clock.getElapsedTime();
}

// Function to update the splash effect (growing and fading over time)
function updateSplash() {

    if (splash) 
    {
        const elapsed = clock.getElapsedTime() - splashStartTime;

        //grow it -> fade over time
        splash.scale.set(1 + elapsed, 1 + elapsed, 1 + elapsed); //increase scale over time
        splash.material.opacity = 1 - (elapsed / splashDuration); //fade out over time

        //remove splash after time elapsed
        if (elapsed >= splashDuration) {
            scene.remove(splash);
            splash = null;
            splashStartTime = null;
        }
    }
}

// Function to create collision between cannon ball and enemy
let health_val = 0.3; // health value for big bro
let maxWidth1 = 1.8; // Maximum width of the big bro health bar
let maxWidth2 = 1.8;
let maxWidth3 = 1.8;
let maxWidth4 = 1.8;

function collision() {

    if (projectile) {
        cannonball_bb.setFromObject(projectile);
    }
    if (enemyProjectile) {
        enemyCannonball_bb.setFromObject(enemyProjectile);
    }
    cube_bb.setFromObject(cube);

    // intersect test
    if (projectile && cannonball_bb.intersectsBox(enemyCube2_bb)) {
        enemyCube2.position.x += 1;
        healthBar4.position.x += 1;

        maxWidth4 -= health_val;
        healthBar4.scale.set(maxWidth4, 1, 1);

        if (maxWidth4 > 0.1) {
            if (maxWidth4 <= 0.7 && maxWidth4 > 0.3) {
                healthBar4.material.color.set(0xFF6600);
            }
            else if (maxWidth4 <= 0.3 && maxWidth4 >= 0.1) {
                healthBar4.material.color.set(0xFF0000);
            }
        }
        else if (maxWidth4 <= 0.1) {
            enemyCube2.visible = false;
            healthBar4.visible = false;
        }

        enemyCube2_bb.setFromObject(enemyCube2);
    } 

    else if (projectile && cannonball_bb.intersectsBox(enemyCube1_bb)) {
        enemyCube1.position.x += 1;
        healthBar3.position.x += 1;
        enemyCannon.position.x += 1;

        maxWidth3 -= health_val;
        healthBar3.scale.set(maxWidth3, 1, 1);

        if (maxWidth3 > 0.1) {
            if (maxWidth3 <= 0.7 && maxWidth3 > 0.3) {
                healthBar3.material.color.set(0xFF6600);
            }
            else if (maxWidth3 <= 0.3 && maxWidth3 >= 0.1) {
                healthBar3.material.color.set(0xFF0000);
            }
        }
        else if (maxWidth3 <= 0.1) {
            enemyCube1.visible = false;
            healthBar3.visible = false;
        }

        enemyCube1_bb.setFromObject(enemyCube1);

        // after moving the enemyCube1, check for collision with the enemyCube2
        if (enemyCube1_bb.intersectsBox(enemyCube2_bb)) {
            console.log("Big cube collided with the second cube!");

            enemyCube2.position.x -= 1;
            healthBar4.position.x -= 1;

            maxWidth4 -= health_val;
            healthBar4.scale.set(maxWidth4, 1, 1);

            if (maxWidth4 > 0.1) {
                if (maxWidth4 <= 0.7 && maxWidth4 > 0.3) {
                    healthBar4.material.color.set(0xFF6600);
                }
                else if (maxWidth4 <= 0.3 && maxWidth4 >= 0.1) {
                    healthBar4.material.color.set(0xFF0000);
                }
            }
            else if (maxWidth4 <= 0.1) {
                enemyCube2.visible = false;
                healthBar4.visible = false;
            }

            //update the enemyCube2 bounding box
            enemyCube2_bb.setFromObject(enemyCube2);
        }
    }
}

function enemyCollision() {

    //bounding boxes for the enemy projectile and player's assets
    let enemyProjectile_bb = new THREE.Box3().setFromObject(enemyProjectile);
    let raft_bb = new THREE.Box3().setFromObject(raft);
    let cube_bb = new THREE.Box3().setFromObject(cube);
    let whiteCube_bb = new THREE.Box3().setFromObject(whiteCube); //second cube

    //checking collision with big cube
    if (enemyProjectile_bb.intersectsBox(cube_bb)) {
        console.log("Enemy projectile hit the big cube!");

        //move big bro back
        cube.position.x -= 1;
        healthBar1.position.x -= 1;
        cannon.position.x -= 1;

        maxWidth1 -= health_val;
        healthBar1.scale.set(maxWidth1, 1, 1);

        if (maxWidth1 > 0.1) {
            if (maxWidth1 <= 0.7 && maxWidth1 > 0.3) {
                healthBar1.material.color.set(0xFF6600);
            }
            else if (maxWidth1 <= 0.3 && maxWidth1 >= 0.1) {
                healthBar1.material.color.set(0xFF0000);
            }
        }
        else if (maxWidth1 <= 0.1) {
            cube.visible = false;
            healthBar1.visible = false;
        }

        //update the big cube's bounding box
        cube_bb.setFromObject(cube);

        
        scene.remove(enemyProjectile);
        enemyProjectile = null;

        // after moving the big cube, check for collision with the second cube
        if (cube_bb.intersectsBox(whiteCube_bb)) {
            console.log("Big cube collided with the second cube!");

            whiteCube.position.x -= 1;
            healthBar2.position.x -= 1;

            maxWidth2 -= health_val;
            healthBar2.scale.set(maxWidth2, 1, 1);

            if (maxWidth2 > 0.1) {
                if (maxWidth2 <= 0.7 && maxWidth2 > 0.3) {
                    healthBar2.material.color.set(0xFF6600);
                }
                else if (maxWidth2 <= 0.3 && maxWidth2 >= 0.1) {
                    healthBar2.material.color.set(0xFF0000);
                }
            }
            else if (maxWidth2 <= 0.1) {
                whiteCube.visible = false;
                healthBar2.visible = false;
            }

            //update the second cube's bounding box
            whiteCube_bb.setFromObject(whiteCube);
        }
    } 
    //collision with second box
    else if (enemyProjectile_bb.intersectsBox(whiteCube_bb)) {
        console.log("Enemy projectile hit the second bro!");
        whiteCube.position.x -= 1;
        healthBar2.position.x -= 1;

        maxWidth2 -= health_val;
        healthBar2.scale.set(maxWidth2, 1, 1);

        if (maxWidth2 > 0.1) {
            if (maxWidth2 <= 0.7 && maxWidth2 > 0.3) {
                healthBar2.material.color.set(0xFF6600);
            }
            else if (maxWidth2 <= 0.3 && maxWidth2 >= 0.1) {
                healthBar2.material.color.set(0xFF0000);
            }
        }
        else if (maxWidth2 <= 0.1) {
            whiteCube.visible = false;
            healthBar2.visible = false;
        }

        //update the second cube's bounding box
        whiteCube_bb.setFromObject(whiteCube);
        // scene.remove(enemyProjectile);
        // enemyProjectile = null;
    }
    // //check for collision with the raft
    // else if (enemyProjectile_bb.intersectsBox(raft_bb)) {
    //     console.log("Enemy projectile hit the raft!");

    //     //remove the enemy projectile
    //     scene.remove(enemyProjectile);
    //     enemyProjectile = null;
    // }
}


camera.add(camera2);
scene.add(camera);

// Dotted path for the projectile
const dotMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.2 });


const dotGeometry = new THREE.BufferGeometry();
const dotPath = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dotPath);

function calculateCondensedPath(startPosition, angle, speed, numDots = 5) {
    const points = [];
    const gravity = -9.8; 
    const timeStep = 0.1;//time step for each dot
  

    let t = 0;
    for (let i = 0; i < numDots; i++) {
        t += timeStep; //increment time for each dot
        const x = startPosition.x + speed * Math.cos(angle) * t;
        const y = startPosition.y + speed * Math.sin(angle) * t + 0.5 * gravity * t * t;
        const z = startPosition.z; 

        if (y > water.position.y) {
            points.push(new THREE.Vector3(x, y, z));
        }
    }

    return points;
}

function updateDottedPath() {
    const startPosition = new THREE.Vector3(
        cannonBasePosition.x + Math.cos(cannonAngle) * 0.75,
        cannonBasePosition.y + Math.sin(cannonAngle) * 0.75,
        cannonBasePosition.z
    );

    const points = calculateCondensedPath(startPosition, cannonAngle, initialSpeed);
    dotGeometry.setFromPoints(points);
}



window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        updateDottedPath();
    }
});

updateDottedPath();

window.addEventListener('keydown', handleKeyDown);

function animate() {
    requestAnimationFrame(animate);

    const currentTime = clock.getElapsedTime();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    // Handle enemy cannon rotation

    if (!isEnemyRotating && isEnemyPreparingToShoot && currentTime - enemyShootStartTime >= 2.3) {
        isEnemyRotating = true;
    }
    
    if (isEnemyRotating) {
        const rotationSpeed = 0.05; // Rotation speed in radians per frame
        const angleDifference = enemyTargetAngle - enemyCannonAngle;

        if (Math.abs(angleDifference) > 0.01) { // Rotate towards target angle
            enemyCannonAngle += angleDifference * rotationSpeed;

            // Apply the rotation matrix to the enemy cannon
            const pivotX = 0.75;
            const pivotZ = -0.125;

            const enemyToOrigin = translationMatrix(-pivotX, 0, -pivotZ);
            const enemyRotation = new THREE.Matrix4().multiply(
                rotationMatrixZ(enemyCannonAngle)
            ).multiply(
                rotationMatrixY(Math.PI) // Rotate 180 around Y axis to face the opposite direction
            );
            const enemyFromOrigin = translationMatrix(pivotX, 0, pivotZ);
            const enemyToPosition = translationMatrix(enemyCannonPosition.x, enemyCannonPosition.y, enemyCannonPosition.z);

            const enemyFinalMatrix = new THREE.Matrix4()
                .multiply(enemyToPosition)
                .multiply(enemyFromOrigin)
                .multiply(enemyRotation)
                .multiply(enemyToOrigin);

            enemyCannon.matrix.copy(enemyFinalMatrix);
            enemyCannon.matrixAutoUpdate = false;
        } else {
            // Rotation complete
            isEnemyRotating = false;
        }
    }

    // Update enemy shooting logic
    if (!isEnemyRotating && isEnemyPreparingToShoot && currentTime - enemyShootStartTime >= enemyFireDelay) {
        fireEnemyProjectile(enemyCannonAngle); // Fire the projectile
        playShootSound();
        isEnemyPreparingToShoot = false; 
    }

    
    // Update player projectile
    if (isFiring && projectile) {
        projectileVelocity.add(gravityVector.clone().multiplyScalar(deltaTime));
        projectile.position.add(projectileVelocity.clone().multiplyScalar(deltaTime));

        if (projectile.position.y <= water.position.y) {
            createSplash(projectile.position.clone());
            playSplashSound();
            isFiring = false;
            scene.remove(projectile);
            projectileRemovedTime = clock.getElapsedTime();
        }

        collision();
        
    }

    // Update enemy projectile
    if (enemyProjectile) {
        enemyCollision();
        enemyProjectileVelocity.add(gravityVector.clone().multiplyScalar(deltaTime));
        enemyProjectile.position.add(enemyProjectileVelocity.clone().multiplyScalar(deltaTime));

        if (enemyProjectile.position.y <= water.position.y) {
            createSplash(enemyProjectile.position.clone());
            playSplashSound();
            scene.remove(enemyProjectile);
            enemyProjectile = null;
            enemyProjectileRemovedTime = clock.getElapsedTime();
        }
    }

    updateSplash();

    let time = clock.getElapsedTime();
    raft.position.y = -0.9 + Math.sin(time * 2) * 0.1;
    raft2.position.y = -0.9 + Math.sin(time * 6) * 0.1;
    updateCameraPosition(deltaTime);

    renderer.render(scene, camera);
}

animate();