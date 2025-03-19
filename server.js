const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let bullets = [];
let enemies = [];

let spawnRate = 5000; // Initial spawn rate (5 seconds)
let minSpawnRate = 1000; // Minimum spawn rate (1 second)
let spawnDecay = 200; // How much to decrease per interval

function spawnEnemy() {
    io.emit("spawnEnemy", { x: Math.random() * 20 - 10, z: Math.random() * 20 - 10 });

    // Decrease spawn rate over time
    spawnRate = Math.max(minSpawnRate, spawnRate - spawnDecay);

    // Schedule next spawn with updated rate
    setTimeout(spawnEnemy, spawnRate);
}

// Start spawning
spawnEnemy();

io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    socket.emit("currentEnemies", enemies); // Send current enemies to new player

    socket.on("updatePosition", (data) => {
        players[socket.id] = data;
        io.emit("playersUpdate", players);
    });

    socket.on("shoot", (data) => {
        bullets.push({ x: data.x, y: data.y, z: data.z });
        io.emit("spawnBullet", data);
    });

    socket.on("enemyHit", (data) => {
        if (enemies[data.enemyIndex]) {
            enemies.splice(data.enemyIndex, 1);
            io.emit("updateEnemies", enemies);
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("playersUpdate", players);
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
