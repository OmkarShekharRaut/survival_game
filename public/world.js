import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft global lighting
scene.add(ambientLight);

scene.background = new THREE.Color(0x87CEEB); // Light blue sky

// Load Models
export let mapBoundingBoxes = [];
const loader = new GLTFLoader();

export function loadMap() {
    loader.load("../models/map2.glb", (gltf) => {
        const map = gltf.scene;
        map.position.set(0, 0, 0); // Adjust if needed
        scene.add(map);
        map.traverse((child) => {
            if (child.isMesh) {
                const boundingBox = new THREE.Box3().setFromObject(child);
                mapBoundingBoxes.push(boundingBox);
            }
        });
        console.log("Map loaded!");
    }, undefined, (error) => {
        console.error("Error loading map:", error);
    });
}

// Call function to load the map
loadMap();

// Resize canvas on window resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
