const { getAIResponse } = require('./openai');
const { getPlayerCoords } = require('./getPlayerCoords');
const { pathfinder, goals, Movements } = require('mineflayer-pathfinder');

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

                // tries to add realism?
                // ex: ask the bot to come to you so they can view the awesome view of the ocean
                // expected: wow, this view really is nice!
                const currentPosition = bot.entity.position;
                if (Math.abs(currentPosition.x - x) <= 3 && Math.abs(currentPosition.z - z) <= 3) {
                    let successfulMovement = await getAIResponse(`Assume the position of someone who has reached the location successfully. React appropriately according to the previous message: ${message}`);
                    bot.chat(successfulMovement);
                    console.log(`alleged message: ${message}`);
                    console.log(`successfulMovement response: ${successfulMovement}`);
                }
            }
        } else {
            console.log(`GPT-4o-mini: ${interpreted}\n`);
            bot.chat(interpreted);
        }
    }

module.exports = { handleChat };
