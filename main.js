import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); //light blue for sky
const shootSound = new Audio('./public/boom.mp3');

let isFiring = false;
let projectile;
let initialVelocity = new THREE.Vector3(); // Will store the initial velocity of the projectile
let gravity = -9.8; // Simulated gravity
let launchTime; // The time when the projectile was launched
let projectileVelocity = new THREE.Vector3();
const initialSpeed = 15; // Adjust this to change how fast the projectile launches
const gravityVector = new THREE.Vector3(0, -9.8, 0); // Gravity as a vector
let lastTime = 0;


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
    shootSound.currentTime = 0; // Reset the sound to the beginning
    shootSound.play();          // Play the sound
}

//skibidi toilet
const cannonBasePosition = {
    x: -4.14,
    y: 0,
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
    cloud.position.set(
        (Math.random() - 0.5) * 50,  // Random X position in the sky
        Math.random() * 5 + 5,       // Random Y height above the water
        -Math.random() * 50          // Random Z depth
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
const waterGeometry = new THREE.PlaneGeometry(100, 100);
const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x1ca3ec, side: THREE.DoubleSide });
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2; //makes the water horizontal
water.position.y = -1; //lowers water
scene.add(water);

//first raft
const raftGeometry = new THREE.BoxGeometry(2, 0.2, 2);
const raftMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
const raft = new THREE.Mesh(raftGeometry, raftMaterial);
raft.position.y = -0.9; 
scene.add(raft);

// Lighting (optional)
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(5, 10, 2);
scene.add(light);

// camera.position.z = 5;
camera.position.set(0, 2, 15);

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


// const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 4, 16); // Tall, narrow cylinder for the trunk
// const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color for trunk
// const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
// trunk.position.set(0, 1.5, -40); // Position it on the island
// scene.add(trunk);

// const leafGeometry = new THREE.ConeGeometry(1.5, 2, 8);
// const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });

// for (let i = 0; i < 4; i++) {
//     const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
//     leaf.position.set(0, 3, -40); // Position at the top of the trunk
//     leaf.rotation.z = (i * Math.PI) / 2; // Rotate each leaf to spread around the trunk
//     leaf.rotation.x = Math.PI / 4; // Tilt the leaves slightly downward
//     scene.add(leaf);
// }

function createPalmFrond() {
    const frondGroup = new THREE.Group();
    
    // Create the main stem of the frond
    const stemGeometry = new THREE.CylinderGeometry(0.1, 0.05, 8, 8);
    const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5a27 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.rotation.x = Math.PI / 2.5;
    frondGroup.add(stem);
    
    // Create individual leaflets along the stem
    const leafletCount = 20;
    const leafletGeometry = new THREE.PlaneGeometry(0.8, 2.5);
    const leafletMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x3a8335,
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

// Create multiple fronds around the trunk
function createPalmTree(trunkHeight = 10, frondsCount = 8) {
    const treeGroup = new THREE.Group();
    
    //trunk 
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x995c06});
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
palmTree.position.set(0, 1.5, -40); // Positioned as requested

scene.add(palmTree);

//create cannon ( to shoot )
const cannonGeomtry = new THREE.BoxGeometry(1.5, 0.25, .25); // Reduced size
const cannonMaterial = new THREE.MeshBasicMaterial({ color: 0xe3300d});
const cannon = new THREE.Mesh(cannonGeomtry, cannonMaterial);
scene.add(cannon);

cannon.position.z += .64
cannon.position.x -= 4.34

let cannonAngle = 0;

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
    projectile.position.y += 0.16
    
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




function handleKeyDown(event) 
{
    const rotationSpeed = Math.PI / 180; 

    //arrow keys to aim cannon
    if (event.key === 'ArrowUp') {
        cannonAngle = Math.min(cannonAngle + rotationSpeed, Math.PI / 2);
    } else if (event.key === 'ArrowDown') {
        cannonAngle = Math.max(cannonAngle - rotationSpeed, 0);
    } else if (event.key === ' ') { //space bar to shoot
        fireProjectile(cannonAngle);
        playShootSound();
    }

    //reset cannon position and apply transformations for pivot rotation
    cannon.position.set(cannonBasePosition.x, cannonBasePosition.y, cannonBasePosition.z);
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

    cannon.matrix.copy(finalMatrix);
    cannon.matrixAutoUpdate = false;
}

cannon.position.set(cannonBasePosition.x, cannonBasePosition.y, cannonBasePosition.z);


window.addEventListener('mousemove', (event) => {
    mouseY = event.clientY;
});

window.addEventListener('keydown', handleKeyDown);

//projectile equations:
// x = xi + vx*t
// y = yi +vy*t+ 1/2 g * t^2


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle window resize
window.addEventListener('resize', onWindowResize, false);



function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = clock.getElapsedTime();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (isFiring && projectile) {
        //velocity (v = v0 + at)
        projectileVelocity.add(gravityVector.clone().multiplyScalar(deltaTime));
        
        // 
        projectile.position.add(projectileVelocity.clone().multiplyScalar(deltaTime));

        //if it hits water or goes too far
        if (projectile.position.y <= water.position.y || 
            projectile.position.x > 50 || 
            projectile.position.x < -50) {
            isFiring = false;
            scene.remove(projectile);
        }
    }

    let time = clock.getElapsedTime();
    raft.position.y = -0.9 + Math.sin(time * 2) * 0.1;
    raft2.position.y = -0.9 + Math.sin(time * 6) * 0.1;

    renderer.render(scene, camera);
}

animate(); 
