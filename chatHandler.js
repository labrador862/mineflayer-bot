const { formatMessageHistory, getAIFormattedCommand, getAIInterpretation, getAIResponse } = require('./openai');
const goals = require('./goals');
const { getPlayerCoords, parseMovementCommand, getSingleParameter } = require('./processing');

const messageHistory = [];

function addHistory(username, message) {
    messageHistory.push({ username, message });

    // remove message from 11 messages ago
    if (messageHistory.length > 10) {
        messageHistory.splice(0, messageHistory.length - 10);
    }
}

async function handleChat(bot, username, message) {
    // add the player's and the bot's messages to the history
    addHistory(username, message);  
    if (username === bot.username) return; // ignore bot's own messages
    
    console.log(`${username}: ${message}`);
    
    // message to make bot disconnect
    if (message.toLowerCase() === "goodbye bot") {
        bot.chat("Goodbye, see you next time!");
        setTimeout(() => bot.end(), 1000); // wait 1 second before disconnecting
        return;
    }
    
    // take existing message history (array) and convert to string
    const formattedHistory = formatMessageHistory(messageHistory);

    // GPT interprets the player's message and reasons for it
    let interpreted = await getAIInterpretation(formattedHistory);
    console.log(`Initial interpretation: ${interpreted}\n`);
    bot.chat(`/msg ${username} ${interpreted}`);

    if (interpreted.toLowerCase().includes("command requested")) {
        // interprets the reasoned response and writes a command
        let formattedCommand = await getAIFormattedCommand(interpreted);
        console.log(`Formatted command: ${formattedCommand}\n`);
        bot.chat(`/msg ${username} ${formattedCommand}`);

        if (formattedCommand === "getPlayerCoords") {
            let coords = getPlayerCoords(bot, username);
            goals.moveToCoordinates(bot, coords.x, coords.y, coords.z);
            let response = await getAIResponse(formattedHistory);
            console.log(`GPT: ${response}\n`);
            bot.chat(response);
        } else if (formattedCommand.toLowerCase().startsWith("go to")) {
            let coords = parseMovementCommand(formattedCommand);
            goals.moveToCoordinates(bot, coords.x, coords.y, coords.z);
            let response = await getAIResponse(formattedHistory);
            console.log(`GPT: ${response}\n`);
            bot.chat(response);
        } else if (formattedCommand.startsWith("digDown")) {
            let param = getSingleParameter(formattedCommand);
            console.log(`param: ${param}`);
            goals.digDown(bot, param);
        } else {
            bot.chat("Unknown command. No action taking place."); 
        }
    } else {
        let response = await getAIResponse(formattedHistory);
        console.log(`GPT: ${response}\n`);
        bot.chat(response);
    }
}

module.exports = { handleChat };
