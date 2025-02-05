const mineflayer = require('mineflayer');
const OpenAI = require('openai');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
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

// Function to send chat input to OpenAI and return a response
async function getAIResponse(input) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: "You are a helpful Minecraft bot. Be concise with your responses: 150 words or less."},
                       { role: 'user', content: input}
            ],
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        return 'I had trouble thinking, try again!';
    }
}

// Handle in-game chat
bot.on('chat', async (username, message) => {
    if (username === bot.username) return; // Ignore bot's own messages

    console.log(`${username} said: ${message}`);

        // Check if the message is "goodbye bot" (case insensitive)
    if (message.toLowerCase() === "goodbye bot") {
        bot.chat("Goodbye, see you next time!"); // Send a farewell message
        setTimeout(() => bot.end(), 1000); // Wait 1 second before disconnecting
        return;
    }

    // If the message is a command to move to a specific location
    if (message.startsWith("go to")) {
        const coordinates = message.split(' ').slice(2); // Example: "go to 100 64 -100"
        const x = parseInt(coordinates[0]);
        const y = parseInt(coordinates[1]);
        const z = parseInt(coordinates[2]);

        // Move the bot to the coordinates
        const targetPosition = new goals.GoalBlock(x, y, z);
        bot.pathfinder.setMovements(new Movements(bot, bot.registry));
        bot.pathfinder.goto(targetPosition)
            .catch(err => bot.chat("Failed to find a path!"));
    } else {
        // Send message to OpenAI for response
        const response = await getAIResponse(`${message}`);
        // Send response back in chat
        bot.chat(response);
    }
});

// Handle basic events
bot.on('spawn', () => console.log('Bot has spawned!'));
bot.on('kicked', (reason) => console.log(`Kicked: ${reason}`));
bot.on('error', (err) => console.error(`Error: ${err}`));
