function getPlayerCoords(bot, username) {
    const player = bot.players[username].entity;

    const playerX = player.position.x;
    const playerY = player.position.y;
    const playerZ = player.position.z;

    console.log(`${username} is at x=${playerX}, y=${playerY}, z=${playerZ}`);
    return ` ${username} is at x=${playerX}, y=${playerY}, z=${playerZ}`;
}

module.exports = { getPlayerCoords };
