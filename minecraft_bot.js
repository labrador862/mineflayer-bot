const mineflayer = require('mineflayer');
const OpenAI = require('openai');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const fs = require('fs');
require('dotenv').config();

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let bot; 

function createBotInstance(){
    // create a bot instance
    bot = mineflayer.createBot( {
        host: 'localhost',  // Change to your server's IP
        port: 25565,        // Default Minecraft Java Edition port
        username: 'GPT-4o-mini', // Change this to your bot's username
    } );
}

createBotInstance();

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
    return ` ${username} is at x=${playerX}, y=${playerY}, z=${playerZ}`;
}

// Handle in-game chat
bot.on('chat', async (username, message) => {
    if (username === bot.username) return; // ignore bot's own messages

    console.log(`${username}: ${message}`);

    // message to make bot disconnect
    if (message.toLowerCase() === "goodbye bot") {
        bot.chat("Goodbye, see you next time!");
        setTimeout(() => bot.end(), 1000); // wait 1 second before disconnecting
        return;
    }

    // the API interprets the player's message 
    // if necessary, uses context.txt to rephrase the output
    // which is important for parsing information 
    let interpreted = await getAIResponse(message);

    // if the rephrased message includes the word coordinates,
    // get the player's coordinates and add it to the message
    if (interpreted.toLowerCase().includes("coordinates")) {
        interpreted += getPlayerCoords(username);
        console.log(`Initial rephrased response: ${interpreted}`);

        // send that message back to the API so it can reformat the 
        // message to include the exact coordinates
        const reformattedCommand = await getAIResponse(interpreted);
        console.log(`Reformatted response: ${reformattedCommand}\n`);

        // check if reformattedCommand starts with "go to"
        if (reformattedCommand.toLowerCase().startsWith("go to")) {
            bot.chat(`/msg ${username} reformatted command: ${reformattedCommand}`);
            // parse coordinates from the message
            const coordinates = reformattedCommand.split(' ').slice(2); // ex: "go to 100 64 -100"
            const x = parseInt(coordinates[0]);
            const y = parseInt(coordinates[1]);
            const z = parseInt(coordinates[2]);

            // move the bot to the coordinates
            bot.chat('I\'m on my way!');
            const targetPosition = new goals.GoalBlock(x, y, z);
            bot.pathfinder.setMovements(new Movements(bot, bot.registry));
            bot.pathfinder.goto(targetPosition)
                .catch(err => bot.chat("Failed to find a path!"));   
        }
    } else {
        console.log(`GPT-4o-mini: ${interpreted}\n`);
        bot.chat(interpreted);
    }
});

// Handle basic events
bot.on('spawn', () => console.log('Bot has spawned!'));
bot.on('kicked', (reason) => console.log(`Kicked: ${reason}`));
bot.on('error', (err) => console.error(`Error: ${err}`));
