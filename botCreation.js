const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

function createBotInstance() {
    const bot = mineflayer.createBot({
        host: 'localhost',  // server IP
        port: 25565,        // default Minecraft Java Edition port
        username: 'GPT-4o-mini', // bot's username in game
    });

    bot.loadPlugin(pathfinder);

    // configure movement on spawn
    bot.on('spawn', () => {
        const movements = new Movements(bot, bot.registry);
        movements.allow1by1towers = true;
        movements.canDig = true;
        movements.allowFreeMotion = true;
        bot.pathfinder.setMovements(movements);
    });

    return bot;
}

module.exports = createBotInstance;
