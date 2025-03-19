import { socket } from "./socketHandler.js";
import { scene, camera } from "./world.js"

export const bullets = [];

window.addEventListener("click", () => {
    let bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );

    bullet.position.copy(camera.position);
    bullet.velocity = new THREE.Vector3(
        -Math.sin(camera.rotation.y),
        0,
        -Math.cos(camera.rotation.y)
    ).multiplyScalar(2);

    bullets.push(bullet);
    scene.add(bullet);

    socket.emit("shootBullet", {
        x: bullet.position.x,
        y: bullet.position.y,
        z: bullet.position.z,
        vx: bullet.velocity.x,
        vy: bullet.velocity.y,
        vz: bullet.velocity.z
    });
});

// Update bullet positions
export function updateBullets() {
    for (let bullet of bullets) {
        bullet.position.add(bullet.velocity);
    }
}
