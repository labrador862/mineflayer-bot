function parseMovementCommand(command) {
    const coordinates = command.split(' ').slice(2);
    const x = parseInt(coordinates[0]);
    const y = parseInt(coordinates[1]);
    const z = parseInt(coordinates[2]);
    return { x, y, z};
}

module.exports = { parseMovementCommand };