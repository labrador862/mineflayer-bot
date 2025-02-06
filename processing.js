function parseMovementCommand(command) {
    const coordinates = command.split(' ').slice(2);
    const x = parseInt(coordinates[0]);
    const y = parseInt(coordinates[1]);
    const z = parseInt(coordinates[2]);
    return { x, y, z};
}

function getPlayerCoords(bot, username) {
    const player = bot.players[username].entity;

    const x = player.position.x;
    const y = player.position.y;
    const z = player.position.z;

    console.log(`${username} is at x=${x}, y=${y}, z=${z}`);
    return { x, y, z };
}

module.exports = { parseMovementCommand, getPlayerCoords };