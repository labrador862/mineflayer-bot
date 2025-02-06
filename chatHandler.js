const { getAIFormattedCommand, getAIInterpretation, getAIResponse } = require('./openai');
const { moveToCoordinates } = require('./goals');
const { getPlayerCoords, parseMovementCommand } = require('./processing');

async function handleChat(bot, username, message) {
    if (username === bot.username) return; // ignore bot's own messages
    
    console.log(`${username}: ${message}`);
    
    // message to make bot disconnect
    if (message.toLowerCase() === "goodbye bot") {
        bot.chat("Goodbye, see you next time!");
        setTimeout(() => bot.end(), 1000); // wait 1 second before disconnecting
        return;
    }
    
    // GPT interprets the player's message and reasons for it
    let interpreted = await getAIInterpretation(message);
    console.log(`Initial interpretation: ${interpreted}\n`);
    bot.chat(`/msg ${username} ${interpreted}`);

    if (interpreted.toLowerCase().includes("command requested")) {
        // interprets the reasoned response and writes a command
        let formattedCommand = await getAIFormattedCommand(interpreted);
        console.log(`Formatted command: ${formattedCommand}\n`);
        bot.chat(`/msg ${username} ${formattedCommand}`);

        if (formattedCommand === "getPlayerCoords") {
            let coords = getPlayerCoords(bot, username);
            moveToCoordinates(bot, coords.x, coords.y, coords.z);
        } else if (formattedCommand.toLowerCase().startsWith("go to")) {
            let coords = parseMovementCommand(formattedCommand);
            moveToCoordinates(bot, coords.x, coords.y, coords.z);
        } else {
            bot.chat("Unknown command. No action taking place."); 
        }
    } else {
        let response = await getAIResponse(message);
        console.log(`GPT-4o-mini: ${response}\n`);
        bot.chat(response);
    }
}

module.exports = { handleChat };
