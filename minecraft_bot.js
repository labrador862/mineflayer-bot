const createBotInstance = require('./botCreation');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { handleChat } = require('./chatHandler');

// initialize bot instance
const bot = createBotInstance();

// Handle in-game chat messages
bot.on('chat', (username, message) => handleChat(bot, username, message));

// Handle basic events
bot.on('spawn', () => console.log('Bot has spawned!'));
bot.on('kicked', (reason) => console.log(`Kicked: ${reason}`));
bot.on('error', (err) => console.error(`Error: ${err}`));
