import { scene, camera } from "./world.js";
import { socket } from "./socketHandler.js";

// Player Object
export const player = new THREE.Object3D();
player.position.set(0, 1, 0);
scene.add(player);

export let playerLives = 5;

// Define Boundaries (Rectangular Play Area)
const boundary = {
    minX: -24,
    maxX: 24,
    minZ: -27,
    maxZ: 24.5
};

// Update Hearts UI
export function updateLivesUI() {
    const livesContainer = document.getElementById("lives");
    if (!livesContainer) {
        console.error("Lives UI element not found!");
        return;
    }
    livesContainer.innerHTML = "❤️".repeat(playerLives);
}

// Reduce Lives when hit
export function loseLife() {
    if (playerLives > 0) {
        playerLives--;
        updateLivesUI();
        console.log("Lives left:", playerLives);

        if (playerLives === 0) {
            console.log("Game Over!");
            setTimeout(() => {
                window.location.href = "gameover.html"; // Redirect to Game Over screen
            }, 1000);
        }
    }
}

// Initialize Lives UI
window.onload = updateLivesUI;

let keys = {};
window.addEventListener("keydown", (event) => keys[event.key] = true);
window.addEventListener("keyup", (event) => keys[event.key] = false);

// Mouse movement
let yaw = 0;
window.addEventListener("mousemove", (event) => {
    yaw -= event.movementX * 0.002;
});

window.addEventListener("click", () => {
    document.body.requestPointerLock();
});

// FPS Movement with Boundary Restrictions
export function updatePlayer() {
    let speed = 0.1;
    if (keys["Shift"]) speed = 0.2;

    let forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
    let right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // Calculate new position before applying movement
    let newX = player.position.x;
    let newZ = player.position.z;

    if (keys["w"]) newX += forward.x * speed, newZ += forward.z * speed;
    if (keys["s"]) newX -= forward.x * speed, newZ -= forward.z * speed;
    if (keys["a"]) newX -= right.x * speed, newZ -= right.z * speed;
    if (keys["d"]) newX += right.x * speed, newZ += right.z * speed;

    // Apply boundary restrictions
    player.position.x = Math.max(boundary.minX, Math.min(boundary.maxX, newX));
    player.position.z = Math.max(boundary.minZ, Math.min(boundary.maxZ, newZ));

    // Update camera position to match player
    camera.position.copy(player.position);
    camera.rotation.set(0, yaw, 0);

    // Send updated position to server
    socket.emit("updatePosition", {
        x: player.position.x,
        y: player.position.y,
        z: player.position.z
    });
}
