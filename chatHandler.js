const { getAIResponse } = require('./openai');
const { getPlayerCoords } = require('./getPlayerCoords');
const { moveToCoordinates } = require('./goals');
const { parseMovementCommand } = require('./processing');

async function handleChat(bot, username, message) {
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
            interpreted += getPlayerCoords(bot, username);
            console.log(`Initial rephrased response: ${interpreted}`);
    
            // send that message back to the API so it can reformat the 
            // message to include the exact coordinates
            const reformattedCommand = await getAIResponse(interpreted);
            console.log(`Reformatted response: ${reformattedCommand}\n`);
    
            // check if reformattedCommand starts with "go to"
            if (reformattedCommand.toLowerCase().startsWith("go to")) {
                bot.chat(`/msg ${username} executed command: ${reformattedCommand}`);
                // parse coordinates from the message
                const coordinates = parseMovementCommand(reformattedCommand);

                // move the bot to the coordinates
                moveToCoordinates(bot, coordinates.x, coordinates.y, coordinates.z);
            } else {
                bot.chat(`Invalid coordinates!`);
            }
        } else {
            console.log(`GPT-4o-mini: ${interpreted}\n`);
            bot.chat(interpreted);
        }
    }

module.exports = { handleChat };
