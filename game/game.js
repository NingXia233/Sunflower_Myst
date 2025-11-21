import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Configuration ---
const CONFIG = {
    wallSize: 10,
    blockSize: 1,
    sunflowerChance: 0.1, // Initial chance to spawn
    gravity: 0.05,
    tearLife: 100,
};

// --- Globals ---
let scene, camera, renderer, controls;
let raycaster, mouse;
let wallsGroup;
let sunflowers = [];
let tears = [];
let blocks = []; // Array to store block meshes for collision

init();
animate();

function init() {
    // 1. Setup Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 10, 15);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // 4. Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 30;
    controls.minDistance = 5;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft white light
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // 6. Generate World
    generateRuins();

    // 7. Interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
}

function generateRuins() {
    wallsGroup = new THREE.Group();
    scene.add(wallsGroup);

    const geometry = new THREE.BoxGeometry(CONFIG.blockSize, CONFIG.blockSize, CONFIG.blockSize);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x888888, 
        roughness: 0.9,
        flatShading: true
    });

    // Create a random 3D structure
    for (let x = -CONFIG.wallSize/2; x < CONFIG.wallSize/2; x++) {
        for (let y = -CONFIG.wallSize/2; y < CONFIG.wallSize/2; y++) {
            for (let z = -2; z < 2; z++) {
                // Randomly place blocks to create "ruins"
                // More blocks at the bottom, fewer at top
                const heightFactor = 1 - ((y + CONFIG.wallSize/2) / CONFIG.wallSize);
                if (Math.random() < heightFactor * 0.6) {
                    const block = new THREE.Mesh(geometry, material);
                    block.position.set(x, y, z);
                    block.castShadow = true;
                    block.receiveShadow = true;
                    block.userData = { isBlock: true, hasFlower: false };
                    
                    wallsGroup.add(block);
                    blocks.push(block);

                    // Chance to spawn initial sunflower
                    if (Math.random() < CONFIG.sunflowerChance) {
                        spawnSunflower(block);
                    }
                }
            }
        }
    }
}

function spawnSunflower(block) {
    if (block.userData.hasFlower) return;

    const flowerGroup = new THREE.Group();
    
    // Stem (small connection)
    const stemGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.2);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.rotation.x = Math.PI / 2;
    stem.position.z = 0.5; // Stick out of the block
    flowerGroup.add(stem);

    // Petals
    const petalGeo = new THREE.CircleGeometry(0.3, 8);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, side: THREE.DoubleSide });
    const petals = new THREE.Mesh(petalGeo, petalMat);
    petals.position.z = 0.6;
    flowerGroup.add(petals);

    // Center
    const centerGeo = new THREE.CircleGeometry(0.1, 8);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.position.z = 0.61;
    flowerGroup.add(center);

    // Position relative to block
    flowerGroup.position.copy(block.position);
    // Random rotation for variety
    flowerGroup.rotation.z = Math.random() * Math.PI;
    
    // Add to scene
    scene.add(flowerGroup);
    
    // Store reference
    const sunflowerData = {
        mesh: flowerGroup,
        hostBlock: block,
        isCrying: false,
        cryTimer: 0
    };
    
    block.userData.hasFlower = true;
    // Add userData to meshes for raycasting
    petals.userData = { parentFlower: sunflowerData };
    center.userData = { parentFlower: sunflowerData };
    
    sunflowers.push(sunflowerData);
}

function makeSunflowerCry(flowerData) {
    flowerData.isCrying = true;
    flowerData.cryTimer = 60; // Cry for 60 frames
}

function spawnTear(sourcePos) {
    const geometry = new THREE.SphereGeometry(0.05, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0x00BFFF });
    const tear = new THREE.Mesh(geometry, material);
    
    // Start slightly in front of the flower
    tear.position.copy(sourcePos);
    tear.position.z += 0.6; 
    tear.position.y -= 0.2;

    scene.add(tear);
    
    tears.push({
        mesh: tear,
        velocity: new THREE.Vector3(0, 0, 0)
    });
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check intersections with sunflowers
    // We need to check children of the scene that are parts of sunflowers
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object;
        if (obj.userData && obj.userData.parentFlower) {
            makeSunflowerCry(obj.userData.parentFlower);
            break; // Only click one
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    // Update Sunflowers (Crying logic)
    sunflowers.forEach(flower => {
        if (flower.isCrying) {
            flower.cryTimer--;
            if (flower.cryTimer % 10 === 0) { // Spawn tear every 10 frames
                spawnTear(flower.mesh.position);
            }
            if (flower.cryTimer <= 0) {
                flower.isCrying = false;
            }
        }
    });

    // Update Tears (Physics & Growth)
    for (let i = tears.length - 1; i >= 0; i--) {
        const tear = tears[i];
        
        // Gravity
        tear.velocity.y -= CONFIG.gravity * 0.1;
        tear.mesh.position.add(tear.velocity);

        // Collision with blocks
        // Simple check: is the tear inside a block?
        // We can check distance to all blocks (expensive) or just check if it hits y-threshold of a block below
        
        // Optimization: Only check blocks that are roughly in the same x/z column
        // For this demo, we'll do a simple distance check against blocks that don't have flowers
        
        let hit = false;
        
        // Remove if too low
        if (tear.mesh.position.y < -20) {
            scene.remove(tear.mesh);
            tears.splice(i, 1);
            continue;
        }

        // Check collision with potential growth spots
        for (let block of blocks) {
            if (!block.userData.hasFlower) {
                // Check if tear is close to the "face" of the block
                // We assume flowers grow on the Z+ face for simplicity in this generated world
                const dx = Math.abs(tear.mesh.position.x - block.position.x);
                const dy = Math.abs(tear.mesh.position.y - block.position.y);
                const dz = Math.abs(tear.mesh.position.z - (block.position.z + 0.5)); // Front face

                if (dx < 0.5 && dy < 0.5 && dz < 0.2) {
                    // Hit!
                    spawnSunflower(block);
                    hit = true;
                    break;
                }
            }
        }

        if (hit) {
            scene.remove(tear.mesh);
            tears.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}
