import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { normalize } from 'three/src/math/MathUtils.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); //light blue for sky
const shootSound = new Audio('./public/boom.mp3');
const splashSound = new Audio('./public/splash.mp3');
splashSound.volume = 0.1;
shootSound.volume = 0.7;    

let isFiring = false;
let projectile;
const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
let initialVelocity = new THREE.Vector3(); //store the initial velocity of the projectile
let projectileVelocity = new THREE.Vector3();
const initialSpeed = 15; // Adjust this to change how fast the projectile launches
const gravityVector = new THREE.Vector3(0, -9.8, 0); // Gravity as a vector


let lastTime = 0;
let attachedObject = null;
let cannonAttached = false;
let cannonPosition = new THREE.Vector3();
let defaultCameraPosition = new THREE.Vector3(0, 2, 15);
let blendingFactor = 0.02;

let cameraResetDelay = 2; // econds to wait before resetting camera
let projectileRemovedTime = null; //
let isInResetDelay = false; //check if we reset camera yet




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

//ENEMIES!!!

//enemy1 raft
const enemyRaftGeometry1 = new THREE.BoxGeometry(1.8, 0.18, 1.8);
const enemyRaftMaterial1 = new THREE.MeshBasicMaterial({ color: 0x8B0000 }); // Dark red color
const enemyRaft1 = new THREE.Mesh(enemyRaftGeometry1, enemyRaftMaterial1);
enemyRaft1.position.set(12, -0.9, 0);
scene.add(enemyRaft1);

const enemyCubeGeometry1 = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const enemyCubeMaterial1 = new THREE.MeshBasicMaterial({ color: 0x2F4F4F }); // Dark slate gray color
const enemyCube1 = new THREE.Mesh(enemyCubeGeometry1, enemyCubeMaterial1);
enemyCube1.position.set(12, -0.5, 0);
scene.add(enemyCube1);

//enemy2 raft
const enemyRaftGeometry2 = new THREE.BoxGeometry(1.8, 0.18, 1.8);
const enemyRaftMaterial2 = new THREE.MeshBasicMaterial({ color: 0xFF4500 }); // Orange-red color
const enemyRaft2 = new THREE.Mesh(enemyRaftGeometry2, enemyRaftMaterial2);
enemyRaft2.position.set(15, -0.9, 0);
scene.add(enemyRaft2);

const enemyCubeGeometry2 = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const enemyCubeMaterial2 = new THREE.MeshBasicMaterial({ color: 0x4B0082 }); // Indigo color
const enemyCube2 = new THREE.Mesh(enemyCubeGeometry2, enemyCubeMaterial2);
enemyCube2.position.set(15, -0.5, 0);
scene.add(enemyCube2);

// bounding boxes and spheres for collision


let enemyCube1_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
enemyCube1_bb.setFromObject(enemyCube1);

let enemyCube2_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
enemyCube2_bb.setFromObject(enemyCube2);

let cannonball_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

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

cannon.position.z += .64;
cannon.position.x -= 4.34;

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




function handleKeyDown(event) 
{
    const rotationSpeed = Math.PI / 180; 

    //arrow keys to aim cannon
    if (event.key === 'ArrowUp') {
        cannonAngle = Math.min(cannonAngle + rotationSpeed, Math.PI / 2);
    } 
    else if (event.key === 'ArrowDown') 
    {
        cannonAngle = Math.max(cannonAngle - rotationSpeed, 0);
    } 
    //space bar to shoot
    else if (event.key === ' ') 
    { 
        fireProjectile(cannonAngle);
        playShootSound();
        cannonPosition.copy(cannon.position); //store cannon position
        cannonAttached = true;
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

window.addEventListener('keydown', handleKeyDown);

//projectile equations:
// x = xi + vx*t
// y = yi +vy*t+ 1/2 g * t^2


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateCameraPosition(deltaTime) {
    const currentTime = clock.getElapsedTime();

    if (isFiring && projectile) {
        
        let cameraPosition = new THREE.Vector3(
            projectile.position.x,
            projectile.position.y + 2,
            projectile.position.z + 10
        );

        camera.position.lerp(cameraPosition, blendingFactor);
        camera.lookAt(projectile.position);
        controls.enabled = false;
        isInResetDelay = false; //reset delay flag
    } else if (projectileRemovedTime && currentTime - projectileRemovedTime < cameraResetDelay) {
        //keep camera in last position during delay until we reset view
        controls.enabled = false;
        isInResetDelay = true;
    } else {
        //only reset camera if we're not in the delay period
        if (isInResetDelay) {
            camera.position.lerp(defaultCameraPosition, blendingFactor);
            camera.lookAt(0, 0, 0);
            controls.enabled = true;
            
        
            if (camera.position.distanceTo(defaultCameraPosition) < 0.1) {
                isInResetDelay = false;
                projectileRemovedTime = null;
            }
        }
    }
}
// Handle window resize
window.addEventListener('resize', onWindowResize, false);


let splash;
let splashStartTime = null;
const splashDuration = 1; 

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
function collision() {

    cannonball_bb.setFromObject(projectile);
    // intersect test
    if (cannonball_bb.intersectsBox(enemyCube2_bb)) {
        enemyCube2.position.x += 1;

        enemyCube2_bb.setFromObject(enemyCube2);
    } 

    else if (cannonball_bb.intersectsBox(enemyCube1_bb)) {
        enemyCube1.position.x += 1;

        enemyCube1_bb.setFromObject(enemyCube1);
    }

    else if (enemyCube1_bb.intersectsBox(enemyCube2_bb)) {
        enemyCube1.position.x += 1;
        enemyCube2.position.x += 4;

        enemyCube1_bb.setFromObject(enemyCube1);
        enemyCube2_bb.setFromObject(enemyCube2);
    }

}





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
        // if (projectile.position.y <= water.position.y -4|| 
        //     projectile.position.x > 50 || 
        //     projectile.position.x < -50) {
        //     isFiring = false;
        //     scene.remove(projectile);
        // }

        if (projectile.position.y <= water.position.y) {
            createSplash(projectile.position.clone());
            playSplashSound();
            isFiring = false;
            scene.remove(projectile);
            projectileRemovedTime = clock.getElapsedTime(); // Store the time when projectile is removed
        } else if (projectile.position.x > 50 || projectile.position.x < -50) {
            isFiring = false;
            scene.remove(projectile);
            projectileRemovedTime = clock.getElapsedTime(); // Store the time when projectile is removed
        } 
        
        collision();

    }


    updateSplash();

    updateCameraPosition(deltaTime);

    let time = clock.getElapsedTime();
    raft.position.y = -0.9 + Math.sin(time * 2) * 0.1;
    raft2.position.y = -0.9 + Math.sin(time * 6) * 0.1;

    renderer.render(scene, camera);
}

animate(); 