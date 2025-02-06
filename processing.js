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

function getBotCoords(bot) {
    const x = bot.entity.position.x;
    const y = bot.entity.position.y;
    const z = bot.entity.position.z;
    return { x, y, z };
}

function getSingleParameter(command) {
    const str = command.split(' ');
    const param = parseInt(str[1]);
    return param;
}

module.exports = { parseMovementCommand, getPlayerCoords, getBotCoords, getSingleParameter };