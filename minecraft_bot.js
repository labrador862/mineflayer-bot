const mineflayer = require('mineflayer');
const OpenAI = require('openai');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const fs = require('fs');
require('dotenv').config();

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create a bot instance
const bot = mineflayer.createBot({
    host: 'localhost',  // Change to your server's IP
    port: 25565,        // Default Minecraft Java Edition port
    username: 'GPT-4o-mini', // Change this to your bot's username
});

// Set up pathfinding
bot.loadPlugin(pathfinder);

// Configure the bot's movement abilities
bot.on('spawn', () => {
    // Set movement settings
    const movements = new Movements(bot, bot.registry);
    movements.allow1by1towers = true; // Enable the ability to build 1x1 towers
    movements.canDig = true; // enable ability to break blocks
    movements.allowFreeMotion = true; // enable ability to walk in a straight path to target location
    bot.pathfinder.setMovements(movements);
});

// Function to send chat input to OpenAI and return a response
async function getAIResponse(input) {
    try {
        //read file context.txt
        const context = await fs.promises.readFile('context.txt', 'utf-8');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: context},
                       { role: 'user', content: input}
            ],
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        return 'I had trouble thinking, try again!';
    }
}

function getPlayerCoords(username) {
    const player = bot.players[username].entity;
    const playerX = player.position.x;
    const playerY = player.position.y;
    const playerZ = player.position.z;

    console.log(`${username} is at x=${playerX}, y=${playerY}, z=${playerZ}`);
    return `${username} is at x=${playerX}, y=${playerY}, z=${playerZ}`;
}

// Handle in-game chat
bot.on('chat', async (username, message) => {
    if (username === bot.username) return; // Ignore bot's own messages

    console.log(`${username} said: ${message}`);

    // message to make bot leave (used for restarting)
    if (message.toLowerCase() === "goodbye bot") {
        bot.chat("Goodbye, see you next time!"); // Send a farewell message
        setTimeout(() => bot.end(), 1000); // Wait 1 second before disconnecting
        return;
    }

    // reformat player's message
    let reformat = await getAIResponse(message);
    console.log(`Initial reformated response: ${reformat}\n`);

    // used to grab player's coordinates
    if (reformat.toLowerCase().includes("coordinates")) {
        reformat += getPlayerCoords(username);
    }

    // Send message to OpenAI for rephrasing and response
    const response = await getAIResponse(reformat);
    console.log(`Rephrased response: ${response}\n`);

    // Check if the rephrased response includes with "go to"
    if (response.toLowerCase().includes("go to")) {
        bot.chat(`/msg ${username} Rephrased command: ${response}`);
        // Parse the coordinates from the response
        const coordinates = response.split(' ').slice(2); // Example: "go to 100 64 -100"
        const x = parseInt(coordinates[0]);
        const y = parseInt(coordinates[1]);
        const z = parseInt(coordinates[2]);

        // Move the bot to the coordinates
        bot.chat('I\'m on my way!');
        const targetPosition = new goals.GoalBlock(x, y, z);
        bot.pathfinder.setMovements(new Movements(bot, bot.registry));
        bot.pathfinder.goto(targetPosition)
            .catch(err => bot.chat("Failed to find a path!"));
    } else {
        // Otherwise, send the rephrased response back in chat
        bot.chat(response);
    }
});

// Handle basic events
bot.on('spawn', () => console.log('Bot has spawned!'));
bot.on('kicked', (reason) => console.log(`Kicked: ${reason}`));
bot.on('error', (err) => console.error(`Error: ${err}`));
