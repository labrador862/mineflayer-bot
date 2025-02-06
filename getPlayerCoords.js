function getPlayerCoords(bot, username) {
    const player = bot.players[username].entity;

    const x = player.position.x;
    const y = player.position.y;
    const z = player.position.z;

    console.log(`${username} is at x=${x}, y=${y}, z=${z}`);
    return { x, y, z };
}

module.exports = { getPlayerCoords };
