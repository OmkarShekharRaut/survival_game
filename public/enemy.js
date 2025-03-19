import { player, loseLife, playerLives } from "./player.js";
import { scene, renderer, camera } from "./world.js";
import { socket } from "./socketHandler.js";
import { updateBullets, bullets } from "./shooting.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let score = 0;

function updateScoreUI() {
    document.getElementById("score").innerHTML = "Score: " + score;
}

export let enemies = [];
const loader = new GLTFLoader();

const enemySpeed = 0.05;
const enemyScale = 1.5;
const rotationSpeed = 0.05;

// Load Enemy Model
function loadEnemyModel(callback) {
    loader.load("../models/enemy.glb", (gltf) => {
        const enemyModel = gltf.scene;
        enemyModel.scale.set(enemyScale, enemyScale, enemyScale);
        callback(enemyModel);
    }, undefined, (error) => {
        console.error("Error loading enemy:", error);
    });
}

// Spawn Enemy
function spawnEnemy(x, z) {
    loadEnemyModel((enemy) => {
        enemy.position.set(x, 0, z);
        scene.add(enemy);
        enemies.push(enemy);
    });
}

// Update Enemy Movement & Check Collision
export function updateEnemies() {
    enemies.forEach((enemy) => {
        if (!enemy || !player || playerLives <= 0) return;

        const direction = new THREE.Vector3();
        direction.subVectors(player.position, enemy.position);
        direction.y = 0;
        direction.normalize();

        enemy.position.addScaledVector(direction, enemySpeed);

        const targetRotation = Math.atan2(direction.x, direction.z);
        enemy.rotation.y += (targetRotation - enemy.rotation.y) * rotationSpeed;

        checkPlayerCollision(enemy);
    });

    checkBulletCollisions();
}

// Check if enemy touches player
function checkPlayerCollision(enemy) {
    const distance = player.position.distanceTo(enemy.position);
    if (distance < 2) { // Adjust this for accurate collision
        console.log("Player hit!");
        loseLife();
        enemy.position.set(100, 100, 100); // Move enemy away
    }
}

// Check for Bullet Collision with Enemies
export function checkBulletCollisions() {
    if (!enemies.length || !bullets.length) return;

    let bulletsToRemove = new Set();
    let enemiesToRemove = new Set();

    enemies.forEach((enemy, enemyIndex) => {
        if (!enemy || !enemy.position) return;

        bullets.forEach((bullet, bulletIndex) => {
            if (!bullet || !bullet.position) return;

            if (Math.sqrt(
                Math.pow(bullet.position.x - enemy.position.x, 2) +
                Math.pow(bullet.position.z - enemy.position.z, 2)
            ) < 1) { // Adjust based on enemy size
                console.log("Enemy hit!");
                enemiesToRemove.add(enemyIndex);
                bulletsToRemove.add(bulletIndex);

                score++;
                updateScoreUI();
            }
        });
    });

    // Remove enemies and bullets from scene and array in reverse order
    [...enemiesToRemove].sort((a, b) => b - a).forEach(index => {
        scene.remove(enemies[index]);
        enemies.splice(index, 1);
    });

    [...bulletsToRemove].sort((a, b) => b - a).forEach(index => {
        scene.remove(bullets[index]);
        bullets.splice(index, 1);
    });
}

// Listen for enemy spawn
socket.on("spawnEnemy", (data) => {
    spawnEnemy(data.x, data.z);
});
