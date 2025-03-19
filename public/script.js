import { updatePlayer } from "./player.js";
import { updateBullets } from "./shooting.js";
import { updateEnemies, checkBulletCollisions } from "./enemy.js";
import { renderer, scene, camera } from "./world.js";

window.onload = function () {
    console.log("Game Loaded");

    function update() {
        updatePlayer();
        updateBullets();
        updateEnemies();
        checkBulletCollisions();

        requestAnimationFrame(update);
        renderer.render(scene, camera);
    }

    update(); // Start game loop
};
