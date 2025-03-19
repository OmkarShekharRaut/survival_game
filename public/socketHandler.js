export const socket = io("http://localhost:3000");

let players = {};
let enemies = [];

socket.on("currentPlayers", (data) => {
    players = data;
});

socket.on("currentEnemies", (data) => {
    enemies = data;
});

socket.on("playersUpdate", (data) => {
    players = data;
});

socket.on("updateEnemies", (data) => {
    enemies = data;
});

// Collect Items
window.addEventListener("keydown", (event) => {
    if (event.key === "e") {
        socket.emit("collectItem", "wood");
    }
});

socket.on("updateInventory", (data) => {
    if (data.id === socket.id) {
        console.log("Inventory:", data.inventory);
    }
});
