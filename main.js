import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { normalize } from 'three/src/math/MathUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera2 = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, .01, 500);
const loader = new GLTFLoader();
const fontLoader = new FontLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let textMesh;
let gameStarted = false; 
let inMenu = true; // Start in the menu
const powerDisplay = document.getElementById('powerDisplay');
const windDisplay = document.getElementById('windDisplay');
const windDirections = ['W', 'E']; 
let isPlayerMovingBack = false;
let isEnemy1MovingBack = false;
let isEnemy2MovingBack = false;
let isEnemy3MovingBack = false;
let isLilBroMovingBack = false;
let windDirection = 1; //1 for East, -1 for West
let windStrength = 0.5; 
let enemyProjectileInitialSpeed = 20;
let bambooRaft; 
let isEnemy4Flying = false;
let enemy4Velocity = new THREE.Vector3();
const KNOCKBACK_FORCE = 2; 
const ENEMY4_GRAVITY = -9.8;
const GRAVITY = -9.8;
let isEnemy1Flying = false;
let isEnemy2Flying = false;
let isEnemy3Flying = false;
let isLilBroFlying = false;
let isPlayerFlying = false;
let pirateModel;
let enemy1Velocity = new THREE.Vector3();
let enemy2Velocity = new THREE.Vector3();
let lilBroVelocity = new THREE.Vector3();
let playerVelocity = new THREE.Vector3();
let enemy3Velocity = new THREE.Vector3();


let currentLevel = 1;
let pirateShip, log; // Store references to level 2 assets
let hasCreatedNextLevelText = false;


updatePowerDisplayVisibility();

const name_font = fontLoader.load(
	// resource URL
	'./fonts/Luckiest Guy_Regular.json',

	// onLoad callback
    
    function (font) {
        // Create text geometry and mesh
        const textGeometry = new TextGeometry('Raft Wars', {
            font: font,
            size: 5, // Adjust size for better visibility in the sky
            depth: 1,
        });

        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xad4000 });
        textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position text in the sky
        textMesh.position.set(-1, 31.3, 0); // Sky position
        textMesh.castShadow = true;

        scene.add(textMesh);

        
    },

	// onProgress callback
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( 'An error happened' );
	}
    
);

const font = fontLoader.load(
	// resource URL
	'./fonts/Luckiest Guy_Regular.json',

	// onLoad callback
    
    function (font) {
        // Create text geometry and mesh
        const textGeometry = new TextGeometry('Play', {
            font: font,
            size: 5, // Adjust size for better visibility in the sky
            depth: 1,
        });

        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xad4000 });
        textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position text in the sky
        textMesh.position.set(8, 25, 0); // Sky position
        textMesh.castShadow = true;

        scene.add(textMesh);

        // Add click event for raycasting
        window.addEventListener('mousemove', (event) => {
            // Ensure textMesh exists before raycasting
            if (!textMesh) return;

            // Convert mouse position to normalized device coordinates (-1 to +1)
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Perform raycasting
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(textMesh);
            
            if (intersects.length > 0) {
                textMesh.material.color.set(0xFFD700); // Change to yellow on hover
            } else {
                textMesh.material.color.set(0xFFFF00); // Reset to original yellow color
            }
        });
        window.addEventListener('mousedown', (event) => {
            if (inMenu) {
                // Convert mouse position to normalized device coordinates (-1 to +1)
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
                // Update raycaster with camera and mouse position
                raycaster.setFromCamera(mouse, camera);
        
                const intersects = raycaster.intersectObject(textMesh);
                if (intersects.length > 0) {
                    // Lerp camera to the game position
                    const targetPosition = defaultCameraPosition.clone();
                    const targetRotation = defaultCameraRotation.clone();
                    const animationDuration = 2; // Duration in seconds
                    const startTime = clock.getElapsedTime();
        
                    function animateCameraLerp() {
                        const elapsedTime = clock.getElapsedTime() - startTime;
                        const t = Math.min(elapsedTime / animationDuration, 1);
        
                        camera.position.lerp(targetPosition, t);
                        camera.rotation.x += (targetRotation.x - camera.rotation.x) * t;
                        camera.rotation.y += (targetRotation.y - camera.rotation.y) * t;
                        camera.rotation.z += (targetRotation.z - camera.rotation.z) * t;
        
                        if (t < 1) {
                            requestAnimationFrame(animateCameraLerp);
                        } else {
                            inMenu = false; // Switch to game state
                            gameStarted = true; // Start the game logic
                            controls.enabled = true; // Re-enable OrbitControls
                            updatePowerDisplayVisibility();
                        }
                    }
        
                    controls.enabled = false; // Disable OrbitControls during animation
                    animateCameraLerp();
                }
            }
        });
        
    },

	// onProgress callback
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( 'An error happened' );
	}
    
);

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
        bambooRaft = gltf.scene; 

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

//LEVEL 2: Pirate Ship / Log Creation
loader.load('./assets/pirate_ship/scene.gltf',
    function ( gltf ) {
        pirateShip = gltf.scene; // Store reference
        pirateShip.position.set(20, .3, -.5);
        pirateShip.rotation.y = Math.PI / 3;
        pirateShip.visible = false; // Initially hidden
        scene.add(pirateShip);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const originalAnimate = animate;
        animate = function() {
            let time = clock.getElapsedTime();
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

// Modify the loader section for the log
loader.load('./assets/log/scene.gltf',
    function ( gltf ) {
        log = gltf.scene; // Store reference
        log.position.set(15, -.8, -.5);
        log.scale.set(0.005, 0.01, 0.005);
        log.rotation.y = Math.PI / 2;
        log.position.z = .05;
        log.visible = false; // Initially hidden
        scene.add(gltf.scene);

        const originalAnimate = animate;
        animate = function() {
            let time = clock.getElapsedTime();
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


let rocketLauncher; // Variable for the rocket launcher
const rocketLauncherPosition = new THREE.Vector3(-4, -0.8, 4); // Adjust position as needed
loader.load('./assets/pixel_rocket_launcher/scene.gltf',

    
    function ( gltf ) {

        rocketLauncher = gltf.scene;
        rocketLauncher.scale.set(0.1, 0.1, 0.1); // Adjust size
        rocketLauncher.rotation.y = Math.PI / 2;
        rocketLauncher.position.set(-4, -0.8, 1);
        rocketLauncher.visible = false; // Initially hidden
        scene.add(rocketLauncher);
        
 
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
const waterShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x1ca3ec) }, // Base water color
        uWaveSpeed: { value: 1.0 }, // Speed of the wave
        uWaveHeight: { value: 0.25 }, // Height of the wave
        uWaveFrequency: { value: 0.7 }, // Frequency of the wave
        uReflectivity: { value: 0.1 }, // Reflectivity intensity
        uSkyColor: { value: new THREE.Color(0x87CEEB) } // Sky color for reflection
    },
    vertexShader: `
        uniform float uTime;
        uniform float uWaveHeight;
        uniform float uWaveFrequency;

        varying vec2 vUv;
        varying float vWave;
        varying vec3 vWorldPosition;

        void main() {
            vUv = uv;
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

            // Get the vertex position in world space
            vec3 pos = position;
            
            //first wave layer
            pos.z += sin(pos.x * uWaveFrequency + uTime) * uWaveHeight;
            
            //second wave layer with different frequency and direction
            pos.z += cos(pos.y * (uWaveFrequency * 1.5) + uTime * 0.7) * (uWaveHeight * 0.5);
            
            //wave layer with different frequency and direction
            pos.z += sin((pos.x + pos.y) * (uWaveFrequency * 0.8) + uTime * 1.2) * (uWaveHeight * 0.25);

            vWave = pos.z;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        uniform float uReflectivity;
        uniform vec3 uSkyColor;

        varying vec2 vUv;
        varying float vWave;
        varying vec3 vWorldPosition;

        void main() {
            //default water color
            vec3 waterColor = uColor;

            //wave-based color variation
            float waveIntensity = vWave * 2.0 + 0.5;
            waterColor *= waveIntensity;

            //simulate reflection
            vec3 reflectionColor = mix(waterColor, uSkyColor, uReflectivity);
            
            //specular reflection
            float specular = pow(max(0.0, vWave), 5.0) * 0.5;
            reflectionColor += vec3(specular);

            //transparency
            float alpha = 0.8 + vWave * 0.2;

            gl_FragColor = vec4(reflectionColor, alpha);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide
});



// const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); //light blue for sky
const shootSound = new Audio('/boom.mp3');
const splashSound = new Audio('/splash.mp3');
const scream = new Audio('/wilhelm.mp3');
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


function scalingMatrix(sx, sy, sz) {
    return new THREE.Matrix4().set(
        sx, 0, 0, 0, 
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1,
    );
}


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

function playScreamSound() {
    scream.currentTime = 0;
    // scream.play();
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

const enemy2CannonPosition = {
    x: 19.44, // Adjusted for enemy2's position
    y: -0.32,
    z: 0.64
};

const enemy3CannonPosition = {
    x: 14,     
    y: -0.32,  
    z: 0.64    
};

const enemy4CannonPosition = {
    x: 19.45,
    y: 4.67,
    z: 0.64
};
function showGameOverText(message, color) {
    fontLoader.load(
        './fonts/Luckiest Guy_Regular.json',
        function (font) {
            const textGeometry = new TextGeometry(message, {
                font: font,
                size: 5,
                depth: 1,
            });

            const textMaterial = new THREE.MeshPhongMaterial({ color: color });
            const gameOverText = new THREE.Mesh(textGeometry, textMaterial);

            textGeometry.computeBoundingBox();
            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            

            gameOverText.position.set(-5 - textWidth/2, 5, -10);

            scene.add(gameOverText);

            // Disable controls
            controls.enabled = false;
            // window.removeEventListener('keydown', handleKeyDown);
        }
    );
}

function createCloud() {
    const cloudGroup = new THREE.Group();
    const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    //multiple spheres for cloud shape and group them together
    for (let i = 0; i < 8; i++) {
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

const clouds = []; // Keep track of all clouds

//put clouds in the sky
for (let i = 0; i < 15; i++) {
    const cloud = createCloud();
    //random xyz coordinates in the sky
    cloud.position.set(
        (Math.random() - 0.5) * 50,  
        Math.random() * 5 + 5,       
        -Math.random() * 50          
    );

    cloud.userData.speed = Math.random() * 0.01 + 0.002; // Assign a random speed to the cloud
    clouds.push(cloud); // Add to the array for tracking
    scene.add(cloud);
}


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let clock = new THREE.Clock(); 
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enabled = false;
controls.minDistance = 0;
controls.maxDistance = 50;


//initial cube (big bro)
const geometry = new THREE.BoxGeometry(0, 0, 0);
const material = new THREE.MeshBasicMaterial({ color: 0xefd6a5 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
loader.load('/assets/bear.gltf',
    function ( gltf ) {
        let bear = gltf.scene;
        scene.add( bear );
        // scene.remove(cube);
        gltf.scene.position.set(0, -0.6, 0);
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.rotation.y = Math.PI / 2.5;

        cube.add(bear);
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( 'An error happened', error );
    }
);
//water
const waterGeometry = new THREE.PlaneGeometry(500, 500, 100, 100);
const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x1ca3ec, side: THREE.DoubleSide });
const water = new THREE.Mesh(waterGeometry, waterShaderMaterial);
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

function removeAllTextObjects() {
    const objectsToRemove = [];
    scene.traverse((object) => {
        if (object.isMesh && object.geometry.type === 'TextGeometry') {
            objectsToRemove.push(object);
        }
    });
    objectsToRemove.forEach((object) => scene.remove(object));
}


// outlining the health bar
const edges1 = new THREE.EdgesGeometry(healthBar1Geometry);
const edges2 = new THREE.EdgesGeometry(healthBar2Geometry);
const edges3 = new THREE.EdgesGeometry(healthBar3Geometry);
const edges4 = new THREE.EdgesGeometry(healthBar4Geometry);

const line1 = new THREE.LineSegments(edges1, new THREE.LineBasicMaterial( {color: 0x000000}));
line1.position.copy(healthBar1.position);
scene.add(line1);
const line2 = new THREE.LineSegments(edges2, new THREE.LineBasicMaterial( {color: 0x000000}));
line2.position.copy(healthBar2.position);
scene.add(line2);
const line3 = new THREE.LineSegments(edges3, new THREE.LineBasicMaterial( {color: 0x000000}));
line3.position.copy(healthBar3.position);
scene.add(line3);
const line4 = new THREE.LineSegments(edges4, new THREE.LineBasicMaterial( {color: 0x000000}));
line4.position.copy(healthBar4.position);
scene.add(line4);

// Enemy 3
const enemyCubeGeometry3 = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const enemyCubeMaterial3 = new THREE.MeshBasicMaterial({ color: 0x800080, visible: false}); // Purple color
const enemyCube3 = new THREE.Mesh(enemyCubeGeometry3, enemyCubeMaterial3);
// enemyCube3.position.set(14, -0.1, 0);
scene.add(enemyCube3);

loader.load('/assets/pirate/scene.gltf',
    function (gltf) {
        pirateModel = gltf.scene;
        scene.add(pirateModel);
        
        // Set initial scale
        pirateModel.scale.set(1, 1, 1);
        pirateModel.position.set(14, -0.6, 0);
        pirateModel.rotation.y = deg2rad(270); // Rotate 90 degrees
        
        // Initially hide the model
        pirateModel.visible = false;

        // Update the enemyCube3 reference to include the model
        enemyCube3.add(pirateModel);
        
        // Make sure the model moves with enemyCube3
        pirateModel.position.set(0, 0, 0);
        
        // Add scale maintenance function
        function maintainPirateScale() {
            if (pirateModel && pirateModel.parent) {
                pirateModel.scale.set(1, 1, 1);
                enemyCube3.scale.set(1, 1, 1);
            }
        }
        
        // Add this to the animation loop
        const originalAnimate = animate;
        animate = function() {
            maintainPirateScale();
            originalAnimate();
        }
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened loading pirate model:', error);
    }
);
// Enemy 3 health bar
const healthBar5Geometry = new THREE.BoxGeometry(1.8, 0.3, 0.3);
const healthBar5Material = new THREE.MeshBasicMaterial({ color: 0x228B22 });
const healthBar5 = new THREE.Mesh(healthBar5Geometry, healthBar5Material);
scene.add(healthBar5);
healthBar5.position.set(14, 1.2, 0);

const edges5 = new THREE.EdgesGeometry(healthBar5Geometry);
const line5 = new THREE.LineSegments(edges5, new THREE.LineBasicMaterial({ color: 0x000000 }));
line5.position.copy(healthBar5.position);
scene.add(line5);


enemyCube3.position.set(1000, 1000, 0); // Move it far away initially
healthBar5.position.set(1000, 1002, 0); // Health bar follows
line5.position.set(1000, 1002, 0); // Outline follows

const enemyCubeGeometry4 = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const enemyCubeMaterial4 = new THREE.MeshBasicMaterial({ color: 0x008000 }); // Green color
const enemyCube4 = new THREE.Mesh(enemyCubeGeometry4, enemyCubeMaterial4);
enemyCube4.position.set(19.45, 4.67, 0);
scene.add(enemyCube4);


let enemyCube3_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
enemyCube3_bb.setFromObject(enemyCube3);

let enemyCube4_bb = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
enemyCube4_bb.setFromObject(enemyCube4);

// Enemy 4 health bar
const healthBar6Geometry = new THREE.BoxGeometry(1.8, 0.3, 0.3);
const healthBar6Material = new THREE.MeshBasicMaterial({ color: 0x228B22 });
const healthBar6 = new THREE.Mesh(healthBar6Geometry, healthBar6Material);
scene.add(healthBar6);
healthBar6.position.set(19.45, 6.47, 0);

const edges6 = new THREE.EdgesGeometry(healthBar6Geometry);
const line6 = new THREE.LineSegments(edges6, new THREE.LineBasicMaterial({ color: 0x000000 }));
line6.position.copy(healthBar6.position);
scene.add(line6);

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
const whiteCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xefddbb, visible: false,});
const lilbro = new THREE.Mesh(whiteCubeGeometry, whiteCubeMaterial);
lilbro.position.set(3, -0.5, 0); //above smaller raft
scene.add(lilbro);
loader.load('/assets/duck.gltf',
    function ( gltf ) {
        let duck = gltf.scene;
        scene.add( duck );
        gltf.scene.position.set(-0.1, -0.2, 1.1);
        gltf.scene.scale.set(0.65, 0.65, 0.65);
        gltf.scene.rotation.y = Math.PI / 2.5;
        lilbro.add(duck);
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( 'An error happened', error );
    }
);


raft2.position.x = -6.8
lilbro.position.x = -6.8

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
whiteCube_bb.setFromObject(lilbro); // Initialize with whiteCube object

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


const palmTree = createPalmTree(8, 10);
palmTree.position.set(0, 3.5, -40);

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

    const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    enemyProjectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

    // Get the appropriate cannon position based on current level
    const currentCannonPosition = currentLevel === 2 ? enemy3CannonPosition : enemyCannonPosition;

    const cannonLength = 0.75;
    const cannonEndPosition = new THREE.Vector3(
        currentCannonPosition.x + Math.cos(cannonAngle) * cannonLength,
        currentCannonPosition.y + Math.sin(cannonAngle) * cannonLength,
        currentCannonPosition.z
    );

    enemyProjectile.position.copy(cannonEndPosition);
    enemyProjectile.position.y += 0.16;
    enemyProjectile.position.z -= 0.5;

    enemyProjectileVelocity.set(
        Math.cos(cannonAngle) * enemyProjectileInitialSpeed,
        Math.sin(cannonAngle) * enemyProjectileInitialSpeed,
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

function updateWind() {
    // Randomly set wind direction
    windDirection = Math.random() < 0.5 ? -1 : 1;
    
    windStrength = 0.8 + Math.random() * 1.2;
    
    const direction = windDirection === 1 ? 'E' : 'W';
    const speed = (windStrength * 10).toFixed(1); 
    windDisplay.textContent = `Wind: ${direction} ${speed}`;
}

//function that calculates radians from degree  
function deg2rad(degrees) {
    return degrees * Math.PI / 180;
}

//function that calculates the angle the enemy cannon should shoot at
function calculateEnemyCannonAngle() {
    //random value between 14 and 25
    const enemyInitialSpeed = Math.random() * (25 - 14) + 14;
    
    const deltaX = cannon.position.x - enemyCannon.position.x;
    const deltaY = cannon.position.y - enemyCannon.position.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const g = 9.8;
    const vSquared = enemyInitialSpeed * enemyInitialSpeed;
    const sin2Theta = (g * distance) / vSquared;

    const clampedSin2Theta = Math.max(-1, Math.min(1, sin2Theta));
    const baseAngle = Math.asin(clampedSin2Theta) / 2;

    const randomOffset = (Math.random() - 0.5) * deg2rad(15); //random +- 15 degrees offset
    
    // Store the random speed to be used when firing
    enemyProjectileInitialSpeed = enemyInitialSpeed;
    
    return Math.PI - Math.max(0, Math.min(Math.PI / 2, baseAngle + randomOffset));
}

let isEnemyPreparingToShoot = false; 
let enemyShootStartTime = null; 

let isEnemyRotating = false; 
let enemyTargetAngle = null; //target angle for rotation

// Handle key down events


function updatePowerDisplayVisibility() {
    if (inMenu) {
        powerDisplay.style.display = 'none';
    } else {
        powerDisplay.style.display = 'block';
    }
}

function updatePowerDisplay(power) {
    powerDisplay.textContent = `Power: ${power}`;
}

function goToMenu() {
    inMenu = true; 
    gameStarted = false;

    // Move the camera back to the menu view
    camera.position.set(15, 25, 25);
    camera.lookAt(15, 25, -50);

    controls.enabled = false; 
    updatePowerDisplayVisibility();
}

let currentWeapon = 'cannon';
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

    else if (event.key === '1') {
        if (currentWeapon !== 'rocketLauncher') {
            // Switch to Rocket Launcher
            currentWeapon = 'rocketLauncher';
            cannon.visible = false;
            rocketLauncher.visible = true;

            // Set position of rocket launcher
            rocketLauncher.position.set(-4, -0.8, 1)
        }
    }   
    else if (event.key === 'x') {
        removeEnemies(); // Call the function when 'x' is pressed
    }

    else if (event.key === '2') {
        currentWeapon = 'cannon';
        cannon.visible = true;
        if (rocketLauncher) {
            rocketLauncher.visible = false;
        }
    }

    if (event.key === 'Escape') {
        if (!inMenu) {
            goToMenu(); // Return to the menu if in the game
        }
    }
    

    if (currentWeapon === 'rocketLauncher' && rocketLauncher) {
        rocketLauncher.position.set(rocketLauncherPosition.x, rocketLauncherPosition.y, rocketLauncherPosition.z);
        enemyCannon.position.set(enemyCannonPosition.x, enemyCannonPosition.y, enemyCannonPosition.z);
        const pivotX = -0.75;
        const pivotZ = -0.125;
    
        const toOrigin = translationMatrix(-pivotX, 0, -pivotZ);
        const rotation = rotationMatrixZ(cannonAngle);
        const rotation2 = rotationMatrixY(Math.PI / 2);
        const scaling = scalingMatrix(0.1, 0.1, 0.1)
        const fromOrigin = translationMatrix(pivotX, 0, pivotZ);
        const toPosition = translationMatrix(rocketLauncherPosition.x, rocketLauncherPosition.y, rocketLauncherPosition.z);
    
        const finalMatrix = new THREE.Matrix4()
            .multiply(toPosition)
            .multiply(fromOrigin)
            .multiply(rotation)
            .multiply(rotation2)
            .multiply(toOrigin)
            .multiply(scaling);
    
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
    
    
        rocketLauncher.matrix.copy(finalMatrix);
        rocketLauncher.matrixAutoUpdate = false;
    
        enemyCannon.matrix.copy(enemyFinalMatrix);
        enemyCannon.matrixAutoUpdate = false;
    }
    else if (currentWeapon === 'cannon' && cannon) {
        //reset cannon position and apply transformations for pivot rotation
        cannon.position.set(cannonBasePosition.x, cannonBasePosition.y, cannonBasePosition.z);
        enemyCannon.position.set(enemyCannonPosition.x, enemyCannonPosition.y, enemyCannonPosition.z);
        const pivotX = -0.85;
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
    if (!gameStarted || inMenu) return;

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
    else if (!isEnemyPreparingToShoot) {  // Only return to default if enemy is not preparing
        camera.position.lerp(defaultCameraPosition, blendingFactor);
        camera.rotation.copy(defaultCameraRotation);
        controls.enabled = true;
        isInResetDelay = false;
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
function createSplash(position, isEnemy4 = false) {
    if (splash) {
        scene.remove(splash);
        splash = null;
    }

    // Bigger splash size for Enemy 4
    const splashSize = isEnemy4 ? 1.2 : 0.3;  // 4x bigger for Enemy 4
    const splashGeometry = new THREE.SphereGeometry(splashSize, 16, 16); 
    const splashMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1 });
    splash = new THREE.Mesh(splashGeometry, splashMaterial);
    
    splash.position.copy(position);
    splash.position.y = water.position.y + 0.1;
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
let maxWidth3 = .1;
let maxWidth4 = .1;
let maxWidth5 = 100000; // For Enemy 3 (purple cube)
let maxWidth6 = 100000000; // For Enemy 4 (green cube) - BRO IS THANOS (HE KEEPS GETTING ONE SHOT SO I UPPED HIS HEALTH LOLOL)

const originalPositions = {
    player: new THREE.Vector3(cube.position.x, cube.position.y, cube.position.z),
    lilBro: new THREE.Vector3(lilbro.position.x, lilbro.position.y, lilbro.position.z),
    enemy1: new THREE.Vector3(enemyCube1.position.x, enemyCube1.position.y, enemyCube1.position.z),
    enemy2: new THREE.Vector3(enemyCube2.position.x, enemyCube2.position.y, enemyCube2.position.z),
    healthBar1: new THREE.Vector3(healthBar1.position.x, healthBar1.position.y, healthBar1.position.z),
    healthBarLilBro: new THREE.Vector3(healthBar2.position.x, healthBar2.position.y, healthBar2.position.z), 
    healthBar3: new THREE.Vector3(healthBar3.position.x, healthBar3.position.y, healthBar3.position.z),
    healthBar4: new THREE.Vector3(healthBar4.position.x, healthBar4.position.y, healthBar4.position.z),
    line1: new THREE.Vector3(line1.position.x, line1.position.y, line1.position.z),
    lineLilBro: new THREE.Vector3(line2.position.x, line2.position.y, line2.position.z), 
    line3: new THREE.Vector3(line3.position.x, line3.position.y, line3.position.z),
    line4: new THREE.Vector3(line4.position.x, line4.position.y, line4.position.z),
    enemy3: new THREE.Vector3(enemyCube3.position.x, enemyCube3.position.y, enemyCube3.position.z),
    healthBar5: new THREE.Vector3(healthBar5.position.x, healthBar5.position.y, healthBar5.position.z),
    line5: new THREE.Vector3(line5.position.x, line5.position.y, line5.position.z),
};


function startLevel2() {
    currentLevel = 2;
    removeEnemies();
    // Show level 2 assets
    if (pirateShip) pirateShip.visible = true;
    if (log) log.visible = true;
    
    // Position and show enemy3 (pirate)
    enemyCube3.position.set(14, -0.6, 0);
    enemyCube3.visible = true;
    if (pirateModel) pirateModel.visible = true;
    
    // Update health bar positions
    healthBar5.position.set(14, 1.2, 0);
    line5.position.copy(healthBar5.position);
    
    // Store original positions for return movement
    originalPositions.enemy3 = new THREE.Vector3(14, -0.6, 0);
    originalPositions.healthBar5 = new THREE.Vector3(14, 1.2, 0);
    originalPositions.line5 = new THREE.Vector3(14, 1.2, 0);
    
    // Update enemy cannon position
    enemyCannon.visible = true;
    enemyCannon.position.set(enemy3CannonPosition.x, enemy3CannonPosition.y, enemy3CannonPosition.z);
    
    // Show health bars and collision boxes
    healthBar5.visible = true;
    line5.visible = true;
    enemyCube4.visible = true;
    healthBar6.visible = true;
    line6.visible = true;
    
    // Reset health bars
    maxWidth5 = 20; //THIS LSOER KEEPS GETTING 1 SHOT HOW
    maxWidth6 = 100000;
    maxWidth3 = 1.8;
    healthBar5.scale.set(1.8, 1, 1);
    healthBar6.scale.set(1.8, 1, 1);
    line5.scale.set(1.8, 1, 1);
    line6.scale.set(1.8, 1, 1);
    
    // Reset health bar colors
    healthBar5.material.color.set(0x228B22);
    healthBar6.material.color.set(0x228B22);
    
    // Remove existing text objects
    removeAllTextObjects();
    
    // Start camera transition
    const enemyViewPosition = new THREE.Vector3(25, 0, 9);
    const transitionDuration = 2;
    const startTime = clock.getElapsedTime();
    
    function transitionCamera() {
        const currentTime = clock.getElapsedTime();
        const elapsed = currentTime - startTime;
        
        if (elapsed < transitionDuration) {
            camera.position.lerp(enemyViewPosition, 0.05);
            requestAnimationFrame(transitionCamera);
        } else if (elapsed < transitionDuration * 2) {
            camera.position.lerp(defaultCameraPosition, 0.05);
            requestAnimationFrame(transitionCamera);
        } else {
            camera.position.copy(defaultCameraPosition);
            camera.rotation.copy(defaultCameraRotation);
            controls.enabled = true;
        }
    }
    
    controls.enabled = false;
    transitionCamera();
}
function createNextLevelText() {
    fontLoader.load(
        './fonts/Luckiest Guy_Regular.json',
        function (font) {
            const nextLevelGeometry = new TextGeometry('Next Level >>', {
                font: font,
                size: 3,
                depth: 0.5,
            });

            const nextLevelMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffd700,  // Gold color
                emissive: 0x332200 // Slight glow effect
            });
            const nextLevelText = new THREE.Mesh(nextLevelGeometry, nextLevelMaterial);

            // Position below the victory text
            nextLevelGeometry.computeBoundingBox();
            const textWidth = nextLevelGeometry.boundingBox.max.x - nextLevelGeometry.boundingBox.min.x;
            nextLevelText.position.set(-5 - textWidth/2, 0, -10);

            // Add hover effect
            nextLevelText.userData.isInteractive = true;
            nextLevelText.userData.originalColor = nextLevelMaterial.color.clone();
            
            // Add click handler for level transition
            nextLevelText.userData.onClick = function() {
                console.log("Next Level clicked!");
                removeAllTextObjects();
                startLevel2();
            };

            scene.add(nextLevelText);
            maxWidth3 = 1.8;
            maxWidth4 = 1.8;

            // Add hover effect handler
            window.addEventListener('mousemove', (event) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObject(nextLevelText);
                
                if (intersects.length > 0) {
                    nextLevelMaterial.color.setHex(0xff0000); // Red on hover
                    document.body.style.cursor = 'pointer';
                } else {
                    nextLevelMaterial.color.copy(nextLevelText.userData.originalColor);
                    document.body.style.cursor = 'default';
                }
            });

            // Add click handler
            window.addEventListener('click', (event) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObject(nextLevelText);
                
                if (intersects.length > 0 && nextLevelText.userData.onClick) {
                    nextLevelText.userData.onClick();
                }
            });
        },
        undefined,
        function (error) {
            console.error('An error happened loading the font:', error);
        }
    );
}

function checkGameState() {
    //check for defeat (player and lil bro are both defeated)
    if (maxWidth1 <= 0.1 && maxWidth2 <= 0.1) {
        showGameOverText('Game Over!', 0xff0000);
        return 'defeat';
    }
    
    if (currentLevel === 1) {
        //win level 1
        if (maxWidth3 <= 0.1 && maxWidth4 <= 0.1) {
            showGameOverText('Victory!', 0x00ff00);
            
            if (!hasCreatedNextLevelText) {
                createNextLevelText();
                hasCreatedNextLevelText = true;
            }
            return 'victory';
        }
    } else if (currentLevel === 2) {
        //level 2 victory condition
        if (maxWidth5 <= 0.1 && maxWidth6 <= 0.1) {
            showGameOverText('You Beat The Game!', 0x00ff00);
            return 'victory';
        }
    }
    
    return 'playing';
}

function handleEnemy4Collision() {
    // Create bounding box for enemy4
    let enemy4_bb = new THREE.Box3().setFromObject(enemyCube4);
    
    if (projectile && cannonball_bb.intersectsBox(enemy4_bb)) {
        //hit direction and velocity
        let hitDirection = new THREE.Vector3();
        hitDirection.subVectors(enemyCube4.position, projectile.position).normalize();
        
        //set initial velocity based on projectile's direction and speed
        enemy4Velocity.set(
            projectileVelocity.x * 0.5, 
            KNOCKBACK_FORCE,           
            0                               
        );
        
       
        maxWidth6 -= health_val;
        healthBar6.scale.set(1.8, 1, 1);
        line6.scale.set(1.8, 1, 1);
        
        
        if (maxWidth6 > 0.1) {
            if (maxWidth6 <= 0.7 && maxWidth6 > 0.3) {
                healthBar6.material.color.set(0xFF6600);
            } else if (maxWidth6 <= 0.3) {
                healthBar6.material.color.set(0xFF0000);
            }
        } else if (maxWidth6 <= 0.1) {
            enemyCube4.visible = false;
            healthBar6.visible = false;
            line6.visible = false;
        }
        
        
        isEnemy4Flying = true;
        
        // scene.remove(projectile);
        // projectile = null;
        // isFiring = false;
    }
}

function updateEnemy4Physics(deltaTime) {
    if (isEnemy4Flying) {
        //gravity to vertical velocity
        enemy4Velocity.y += ENEMY4_GRAVITY * deltaTime;
        
        //update position based on velocity
        enemyCube4.position.x += enemy4Velocity.x * deltaTime;
        enemyCube4.position.y += enemy4Velocity.y * deltaTime;
        
        //update health bar and outline position to follow the enemy
        healthBar6.position.x = enemyCube4.position.x;
        healthBar6.position.y = enemyCube4.position.y + 1.8; //health bar stays above enemy
        line6.position.copy(healthBar6.position);
        
        //remove if enemy hits water
        if (enemyCube4.position.y <= water.position.y) {
            isEnemy4Flying = false;
            enemyCube4.position.y = water.position.y;
            createSplash(enemyCube4.position.clone(), true);
            playScreamSound();
            playSplashSound();
            
            
            
            enemyCube4.visible = false;
            healthBar6.visible = false;
            line6.visible = false;
        }
    }
}

function updateHealthBarColor(healthBar, width) {
    if (width <= 0.1) {
        healthBar.visible = false;
    } else if (width <= 0.3) {
        healthBar.material.color.set(0xFF0000);
    } else if (width <= 0.7) {
        healthBar.material.color.set(0xFF6600);
    }
}

function collision() {
    if (projectile) {
        cannonball_bb.setFromObject(projectile);
    }
    if (enemyProjectile) {
        enemyCannonball_bb.setFromObject(enemyProjectile);
    }
    cube_bb.setFromObject(cube);

    // Check collision with Enemy 3 (Purple Cube)
    if (projectile && cannonball_bb.intersectsBox(enemyCube3_bb)) {
        enemy3Velocity.set(
            projectileVelocity.x * 0.2,
            KNOCKBACK_FORCE,
            0
        );

        maxWidth5 -= health_val;
        healthBar5.scale.set(1.8, 1, 1);
        line5.scale.set(1.8, 1, 1);

        enemyCube3.scale.set(1, 1, 1);  


        if (maxWidth5 > 0.1) {
            if (maxWidth5 <= 0.7 && maxWidth5 > 0.3) {
                healthBar5.material.color.set(0xFF6600);
            } else if (maxWidth5 <= 0.3 && maxWidth5 >= 0.1) {
                healthBar5.material.color.set(0xFF0000);
            }
        } else if (maxWidth5 <= 0.1) {
            enemyCube3.visible = false;
            healthBar5.visible = false;
            line5.visible = false;
        }

        isEnemy3Flying = true;
    }
    // Check collision with enemyCube2
    else if (projectile && cannonball_bb.intersectsBox(enemyCube2_bb)) {
        enemy2Velocity.set(
            projectileVelocity.x * 0.2,
            KNOCKBACK_FORCE,
            0
        );

        maxWidth4 -= health_val;
        healthBar4.scale.set(maxWidth4, 1, 1);
        line4.scale.set(maxWidth4, 1, 1);

        if (maxWidth4 > 0.1) {
            if (maxWidth4 <= 0.7 && maxWidth4 > 0.3) {
                healthBar4.material.color.set(0xFF6600);
            } else if (maxWidth4 <= 0.3 && maxWidth4 >= 0.1) {
                healthBar4.material.color.set(0xFF0000);
            }
        } else if (maxWidth4 <= 0.1) {
            enemyCube2.visible = false;
            healthBar4.visible = false;
            line4.visible = false;
        }

        isEnemy2Flying = true;
    }
    // Check collision with enemyCube1
    else if (projectile && cannonball_bb.intersectsBox(enemyCube1_bb)) {
        enemy1Velocity.set(
            projectileVelocity.x * 0.2,
            KNOCKBACK_FORCE,
            0
        );

        maxWidth3 -= health_val;
        healthBar3.scale.set(maxWidth3, 1, 1);
        line3.scale.set(maxWidth3, 1, 1);

        if (maxWidth3 > 0.1) {
            if (maxWidth3 <= 0.7 && maxWidth3 > 0.3) {
                healthBar3.material.color.set(0xFF6600);
            } else if (maxWidth3 <= 0.3 && maxWidth3 >= 0.1) {
                healthBar3.material.color.set(0xFF0000);
            }
        } else if (maxWidth3 <= 0.1) {
            enemyCube1.visible = false;
            healthBar3.visible = false;
            line3.visible = false;
        }

        isEnemy1Flying = true;

        // Check for collision chain with enemyCube2
        if (enemyCube1_bb.intersectsBox(enemyCube2_bb)) {
            enemy2Velocity.set(
                projectileVelocity.x * 0.2,
                KNOCKBACK_FORCE,
                0
            );

            maxWidth4 -= health_val;
            healthBar4.scale.set(maxWidth4, 1, 1);
            line4.scale.set(maxWidth4, 1, 1);

            if (maxWidth4 > 0.1) {
                if (maxWidth4 <= 0.7 && maxWidth4 > 0.3) {
                    healthBar4.material.color.set(0xFF6600);
                } else if (maxWidth4 <= 0.3 && maxWidth4 >= 0.1) {
                    healthBar4.material.color.set(0xFF0000);
                }
            } else if (maxWidth4 <= 0.1) {
                enemyCube2.visible = false;
                healthBar4.visible = false;
                line4.visible = false;
            }

            isEnemy2Flying = true;
        }
    }

    handleEnemy4Collision();
    checkGameState();
}


enemyCube3.visible = false;
healthBar5.visible = false;
line5.visible = false;
enemyCube4.visible = false;
healthBar6.visible = false;
line6.visible = false;

function enemyCollision() {
    let enemyProjectile_bb = new THREE.Box3().setFromObject(enemyProjectile);
    let cube_bb = new THREE.Box3().setFromObject(cube);
    let whiteCube_bb = new THREE.Box3().setFromObject(lilbro);

    // Check collision between enemy projectile and player
    if (enemyProjectile_bb.intersectsBox(cube_bb)) {
        playerVelocity.set(
            enemyProjectileVelocity.x * 0.2,
            KNOCKBACK_FORCE,
            0
        );

        maxWidth1 -= health_val;
        healthBar1.scale.set(maxWidth1, 1, 1);
        line1.scale.set(maxWidth1, 1, 1);

        if (maxWidth1 > 0.1) {
            if (maxWidth1 <= 0.7 && maxWidth1 > 0.3) {
                healthBar1.material.color.set(0xFF6600);
            } else if (maxWidth1 <= 0.3 && maxWidth1 >= 0.1) {
                healthBar1.material.color.set(0xFF0000);
            }
        } else if (maxWidth1 <= 0.1) {
            cube.visible = false;
            healthBar1.visible = false;
            line1.visible = false;
        }

        isPlayerFlying = true;
        scene.remove(enemyProjectile);
        enemyProjectile = null;

        // Check if the player also collides with lil bro
        if (cube_bb.intersectsBox(whiteCube_bb)) {
            lilBroVelocity.set(
                enemyProjectileVelocity.x * 0.2,
                KNOCKBACK_FORCE,
                0
            );

            maxWidth2 -= health_val;
            healthBar2.scale.set(maxWidth2, 1, 1);
            line2.scale.set(maxWidth2, 1, 1);

            if (maxWidth2 > 0.1) {
                if (maxWidth2 <= 0.7 && maxWidth2 > 0.3) {
                    healthBar2.material.color.set(0xFF6600);
                } else if (maxWidth2 <= 0.3 && maxWidth2 >= 0.1) {
                    healthBar2.material.color.set(0xFF0000);
                }
            } else if (maxWidth2 <= 0.1) {
                lilbro.visible = false;
                healthBar2.visible = false;
                line2.visible = false;
            }

            isLilBroFlying = true;
        }
    }
    // Check collision between enemy projectile and lil bro directly
    else if (enemyProjectile_bb.intersectsBox(whiteCube_bb)) {
        lilBroVelocity.set(
            enemyProjectileVelocity.x * 0.2,
            KNOCKBACK_FORCE,
            0
        );

        maxWidth2 -= health_val;
        healthBar2.scale.set(maxWidth2, 1, 1);
        line2.scale.set(maxWidth2, 1, 1);

        if (maxWidth2 > 0.1) {
            if (maxWidth2 <= 0.7 && maxWidth2 > 0.3) {
                healthBar2.material.color.set(0xFF6600);
            } else if (maxWidth2 <= 0.3 && maxWidth2 >= 0.1) {
                healthBar2.material.color.set(0xFF0000);
            }
        } else if (maxWidth2 <= 0.1) {
            lilbro.visible = false;
            healthBar2.visible = false;
            line2.visible = false;
        }

        isLilBroFlying = true;
        scene.remove(enemyProjectile);
        enemyProjectile = null;
    }
}

function updatePhysics(deltaTime) {
    if (isEnemy1Flying) {
        enemy1Velocity.y += ENEMY4_GRAVITY * deltaTime;
        enemyCube1.position.x += enemy1Velocity.x * deltaTime;
        enemyCube1.position.y += enemy1Velocity.y * deltaTime;
        
        healthBar3.position.x = enemyCube1.position.x;
        healthBar3.position.y = enemyCube1.position.y + 1.8;
        line3.position.copy(healthBar3.position);
        enemyCannon.position.x = enemyCube1.position.x;
        enemyCannon.position.y = enemyCube1.position.y;

        if (enemyCube1.position.y <= -.5) {
            isEnemy1Flying = false;
            enemyCube1.position.y = -0.5;
            createSplash(enemyCube1.position.clone());
            playSplashSound();
            playScreamSound();
            
            if (maxWidth3 <= 0.1) {
                enemyCube1.visible = false;
                healthBar3.visible = false;
                line3.visible = false;
            } else {
                isEnemy1MovingBack = true;
            }
        }
    }

    if (isEnemy2Flying) {
        enemy2Velocity.y += ENEMY4_GRAVITY * deltaTime;
        enemyCube2.position.x += enemy2Velocity.x * deltaTime;
        enemyCube2.position.y += enemy2Velocity.y * deltaTime;
        
        healthBar4.position.x = enemyCube2.position.x;
        healthBar4.position.y = enemyCube2.position.y + 1.8;
        line4.position.copy(healthBar4.position);

        if (enemyCube2.position.y <= -.5) {
            isEnemy2Flying = false;
            enemyCube2.position.y = -0.5;
            createSplash(enemyCube2.position.clone());
            playSplashSound();
            playScreamSound();
            
            if (maxWidth4 <= 0.1) {
                enemyCube2.visible = false;
                healthBar4.visible = false;
                line4.visible = false;
            } else {
                isEnemy2MovingBack = true;
            }
        }
    }

    if (isEnemy3Flying) {
        enemy3Velocity.y += ENEMY4_GRAVITY * deltaTime;
        
        if (enemyCube3.position.y <= -0.58 && enemyCube3.position.x <= 16) {
            const friction = 0.65;
            enemy3Velocity.x *= friction;
        }
        
        enemyCube3.position.x += enemy3Velocity.x * deltaTime;
        enemyCube3.position.y += enemy3Velocity.y * deltaTime;
        
        healthBar5.position.x = enemyCube3.position.x;
        healthBar5.position.y = enemyCube3.position.y + 1.8;
        line5.position.copy(healthBar5.position);
    
        if (enemyCube3.position.y <= -0.58 && enemyCube3.position.x <= 17) {
            enemy3Velocity.y = Math.abs(enemy3Velocity.y) * 0.5;
            enemyCube3.position.y = -0.58;
    
            if (Math.abs(enemy3Velocity.x) < 0.1 && Math.abs(enemy3Velocity.y) < 0.1) {
                isEnemy3Flying = false;
                enemy3Velocity.set(0, 0, 0);
                isEnemy3MovingBack = true;
                
                if (maxWidth5 <= 0.1) {
                    enemyCube3.visible = false;
                    healthBar5.visible = false;
                    line5.visible = false;
                }
            }
        }
    
        if (enemyCube3.position.y <= water.position.y) {
            isEnemy3Flying = false;
            createSplash(enemyCube3.position.clone());
            playSplashSound();
            playScreamSound();
            enemyCube3.visible = false;
            healthBar5.visible = false;
            line5.visible = false;
        }
    }
    if (isPlayerFlying) {
        playerVelocity.y += ENEMY4_GRAVITY * deltaTime;
        cube.position.x += playerVelocity.x * deltaTime;
        cube.position.y += playerVelocity.y * deltaTime;
        
        healthBar1.position.x = cube.position.x;
        healthBar1.position.y = cube.position.y + 1.8;
        line1.position.copy(healthBar1.position);
        cannon.position.x = cube.position.x;
        cannon.position.y = cube.position.y;

        if (cube.position.y <= -.25) {
            isPlayerFlying = false;
            cube.position.y = -0.5;
            createSplash(cube.position.clone());
            playSplashSound();
            playScreamSound();
            
            if (maxWidth1 <= 0.1) {
                cube.visible = false;
                healthBar1.visible = false;
                line1.visible = false;
            } else {
                isPlayerMovingBack = true;
            }
        }
    }

    if (isLilBroFlying) {
        lilBroVelocity.y += ENEMY4_GRAVITY * deltaTime;
        lilbro.position.x += lilBroVelocity.x * deltaTime;
        lilbro.position.y += lilBroVelocity.y * deltaTime;
        
        healthBar2.position.x = lilbro.position.x;
        healthBar2.position.y = lilbro.position.y + 1.8;
        line2.position.copy(healthBar2.position);

        if (lilbro.position.y <= -.43) {
            isLilBroFlying = false;
            lilbro.position.y = -0.5;
            createSplash(lilbro.position.clone());
            playSplashSound();
            playScreamSound();
            
            if (maxWidth2 <= 0.1) {
                lilbro.visible = false;
                healthBar2.visible = false;
                line2.visible = false;
            } else {
                isLilBroMovingBack = true;
            }
        }
    }
}


window.addEventListener('click', (event) => {
    // Get the mouse position in normalized device coordinates (-1 to +1)
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Raycast from the camera to the mouse position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); 
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);

  
    console.log(`World coordinates: x = ${intersectionPoint.x}, y = ${intersectionPoint.y}, z = ${intersectionPoint.z}`);
});
function removeEnemies() {
    
    if (bambooRaft) scene.remove(bambooRaft);
    scene.remove(enemyRaft1);
    scene.remove(enemyCube1);
    scene.remove(healthBar3);
    scene.remove(line3);

    
    scene.remove(enemyRaft2);
    scene.remove(enemyCube2);
    scene.remove(healthBar4);
    scene.remove(line4);

    if (enemyCannon) {
        scene.remove(enemyCannon);
        enemyCannon.visible = false;
    }


    if (enemyRaft1) enemyRaft1.visible = false;
    if (enemyCube1) enemyCube1.visible = false;
    if (healthBar3) healthBar3.visible = false;
    if (line3) line3.visible = false;

    if (enemyRaft2) enemyRaft2.visible = false;
    if (enemyCube2) enemyCube2.visible = false;
    if (healthBar4) healthBar4.visible = false;
    if (line4) line4.visible = false;

    enemyCube1_bb.makeEmpty();
    enemyCube2_bb.makeEmpty();

    console.log('Enemies removed from the scene');
}

camera.add(camera2);
scene.add(camera);

camera.position.set(15, 25, 25); // Position near the text
camera.lookAt(15, 25, -50); // Look at the text position
// controls.enabled = false;
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
water.receiveShadow = true;
window.addEventListener('keydown', handleKeyDown);


function animate() {
    requestAnimationFrame(animate);

    const currentTime = clock.getElapsedTime();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (projectile) cannonball_bb.setFromObject(projectile);
    if (enemyProjectile) enemyCannonball_bb.setFromObject(enemyProjectile);
    cube_bb.setFromObject(cube);
    whiteCube_bb.setFromObject(lilbro);
    enemyCube1_bb.setFromObject(enemyCube1);
    enemyCube2_bb.setFromObject(enemyCube2);
    enemyCube3_bb.setFromObject(enemyCube3);
    
    const movementSpeed = 0.004;
    const playerMovementSpeed = 0.02;  // 5x faster than enemy movement

    const currentGameState = checkGameState();

    if (isPlayerMovingBack) {
        cube.position.lerp(originalPositions.player, playerMovementSpeed);
        healthBar1.position.lerp(originalPositions.healthBar1, playerMovementSpeed);
        line1.position.lerp(originalPositions.line1, playerMovementSpeed);
    
        if (cube.position.distanceTo(originalPositions.player) < 0.01) {
            isPlayerMovingBack = false;
        }
    }
    
    updatePhysics(deltaTime);
    if (isEnemy1MovingBack) {
        enemyCube1.position.lerp(originalPositions.enemy1, movementSpeed);
        healthBar3.position.lerp(originalPositions.healthBar3, movementSpeed);
        line3.position.lerp(originalPositions.line3, movementSpeed);
    
        if (enemyCube1.position.distanceTo(originalPositions.enemy1) < 0.01) {
            isEnemy1MovingBack = false;
        }
    }
    
    if (isEnemy2MovingBack) {
        enemyCube2.position.lerp(originalPositions.enemy2, movementSpeed);
        healthBar4.position.lerp(originalPositions.healthBar4, movementSpeed);
        line4.position.lerp(originalPositions.line4, movementSpeed);
    
        if (enemyCube2.position.distanceTo(originalPositions.enemy2) < 0.01) {
            isEnemy2MovingBack = false;
        }
    }

    if (isEnemy3MovingBack) {
        enemyCube3.position.lerp(originalPositions.enemy3, movementSpeed);
        healthBar5.position.lerp(originalPositions.healthBar5, movementSpeed);
        line5.position.lerp(originalPositions.line5, movementSpeed);
    
        if (enemyCube3.position.distanceTo(originalPositions.enemy3) < 0.01) {
            isEnemy3MovingBack = false;
        }
    }

    if (isLilBroMovingBack) {
        lilbro.position.lerp(originalPositions.lilBro, movementSpeed);
        healthBar2.position.lerp(originalPositions.healthBarLilBro, movementSpeed);
        line2.position.lerp(originalPositions.lineLilBro, movementSpeed);

        if (lilbro.position.distanceTo(originalPositions.lilBro) < 0.01) {
            isLilBroMovingBack = false;
        }
    }

    updateEnemy4Physics(deltaTime);

    let time = 0;
    time += 0.01;

    clouds.forEach((cloud) => {
        cloud.position.x += windDirection * windStrength * 0.01;
        
        if (windDirection === 1) {
            if (cloud.position.x > 70) {
                cloud.position.x = -70;
            }
        } else {
            if (cloud.position.x < -40) {
                cloud.position.x = 40;
            }
        }
    });

    // Enemy cannon logic
    if (currentGameState === 'playing') {
        if (!isEnemyRotating && isEnemyPreparingToShoot && currentTime - enemyShootStartTime >= 2.3) {
            enemyCannon.visible = true;
            isEnemyRotating = true;
            
            // Update enemy cannon position based on level and visible enemies
            if (currentLevel === 2) {
                if (enemyCube3.visible) {
                    enemyCannon.position.set(enemy3CannonPosition.x, enemy3CannonPosition.y, enemy3CannonPosition.z);
                    enemyCannon.visible = true;
                } else if (enemyCube4.visible) {
                    enemyCannon.visible = false;
                }
            } else {
                if (enemyCube1.visible) {
                    enemyCannon.position.set(enemyCannonPosition.x, enemyCannonPosition.y, enemyCannonPosition.z);
                    enemyCannon.visible = true;
                } else {
                    enemyCannon.visible = false;
                }
            }
        }
        
        if (isEnemyRotating) {
            const rotationSpeed = 0.05;
            const angleDifference = enemyTargetAngle - enemyCannonAngle;

            if (Math.abs(angleDifference) > 0.01) {
                enemyCannonAngle += angleDifference * rotationSpeed;

                const pivotX = 0.75;
                const pivotZ = -0.125;
                
                // Get current cannon position based on level
                let currentCannonPosition;
                if (currentLevel === 2 && enemyCube3.visible) {
                    currentCannonPosition = enemy3CannonPosition;
                } else if (currentLevel === 1 && enemyCube1.visible) {
                    currentCannonPosition = enemyCannonPosition;
                } else {
                    // If no valid enemy is visible, don't show the cannon
                    enemyCannon.visible = false;
                    isEnemyRotating = false;
                    return;
                }

                const enemyToOrigin = translationMatrix(-pivotX, 0, -pivotZ);
                const enemyRotation = new THREE.Matrix4().multiply(
                    rotationMatrixZ(enemyCannonAngle)
                ).multiply(
                    rotationMatrixY(Math.PI)
                );
                const enemyFromOrigin = translationMatrix(pivotX, 0, pivotZ);
                const enemyToPosition = translationMatrix(
                    currentCannonPosition.x, 
                    currentCannonPosition.y, 
                    currentCannonPosition.z
                );

                const enemyFinalMatrix = new THREE.Matrix4()
                    .multiply(enemyToPosition)
                    .multiply(enemyFromOrigin)
                    .multiply(enemyRotation)
                    .multiply(enemyToOrigin);

                enemyCannon.matrix.copy(enemyFinalMatrix);
                enemyCannon.matrixAutoUpdate = false;
            } else {
                isEnemyRotating = false;
            }
        }

        if (!isEnemyRotating && isEnemyPreparingToShoot && currentTime - enemyShootStartTime >= enemyFireDelay) {
            fireEnemyProjectile(enemyCannonAngle);
            playShootSound();
            enemyCannon.visible = false;
            isEnemyPreparingToShoot = false;
            projectileRemovedTime = null;
        }
    } else if (currentGameState === 'victory') {
        // If game is won, hide enemy cannon and stop all enemy firing states
        enemyCannon.visible = false;
        isEnemyPreparingToShoot = false;
        isEnemyRotating = false;
    }
    
    if (isFiring && projectile) {
        projectileVelocity.x += windDirection * windStrength * deltaTime;
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

    if (enemyProjectile) {
        enemyCollision();
        enemyProjectileVelocity.x += windDirection * windStrength * deltaTime;
        enemyProjectileVelocity.add(gravityVector.clone().multiplyScalar(deltaTime));
        enemyProjectile.position.add(enemyProjectileVelocity.clone().multiplyScalar(deltaTime));

        if (enemyProjectile.position.y <= water.position.y) {
            createSplash(enemyProjectile.position.clone());
            playSplashSound();
            scene.remove(enemyProjectile);
            enemyProjectile = null;
            updateWind();
        }
    }

    updateSplash();

    time = clock.getElapsedTime();
    raft.position.y = -0.9 + Math.sin(time * 2) * 0.1;
    raft2.position.y = -0.9 + Math.sin(time * 6) * 0.1;
    updateCameraPosition(deltaTime);
    waterShaderMaterial.uniforms.uTime.value = currentTime;

    renderer.render(scene, camera);
}
animate();