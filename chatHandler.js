const { formatMessageHistory, getAIFormattedCommand, getAIInterpretation, getAIResponse } = require('./openai');
const goals = require('./goals');
const fs = require('fs');
const { getPlayerCoords, parseMovementCommand, getSingleParameter } = require('./processing');

const filePath = 'history.txt';
const MAX_LINES = 50;

function addHistory(username, message) {
    message = `${username}: ${message}\n`

    fs.appendFile(filePath, message, (err) => {
        if (err) {
            console.error('Error appending to file:', err);
        } else {
            console.log('Text successfully appended!');
            checkFileTrim();
        }
    });

function checkFileTrim() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        let lines = data.split('\n').filter(line => line.trim() !== "");

        if (lines.length >= MAX_LINES) {
            console.log(`Trimming file: Keeping last ${MAX_LINES - 10} lines`);
            lines = lines.slice(-(MAX_LINES - 20));
            fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8'); // Overwrite file
        }
    } catch (err) {
        console.error('Error reading or writing file:', err);
    }

    }
}

async function handleChat(bot, username, message) { 
    if (username === bot.username) return; // ignore bot's own messages
    addHistory(username, message); 
    
    console.log(`${username}: ${message}`);
    
    // message to make bot disconnect
    if (message.toLowerCase() === "goodbye bot") {
        let farewell = "Goodbye, see you next time!";
        bot.chat(farewell);
        addHistory("GPT", farewell);
        setTimeout(() => bot.end(), 1000); // wait 1 second before disconnecting
        return;
    }
    
    // take existing message history and convert to string
    const formattedHistory = await fs.promises.readFile('history.txt', 'utf-8');

    // GPT interprets the player's message and reasons for it
    let interpreted = await getAIInterpretation(formattedHistory);
    console.log(`Initial interpretation: ${interpreted}\n`);
    bot.chat(`/msg ${username} Thinking... ${interpreted}`);
    addHistory("GPT", interpreted); 

    if (interpreted.toLowerCase().includes("command requested")) {
        // interprets the reasoned response and writes a command
        let formattedCommand = await getAIFormattedCommand(interpreted);
        console.log(`Formatted command: ${formattedCommand}\n`);
        bot.chat(`/msg ${username} ${formattedCommand}`);
        addHistory("GPT", formattedCommand); 

        if (formattedCommand === "getPlayerCoords") {
            let coords = getPlayerCoords(bot, username);
            goals.moveToCoordinates(bot, coords.x, coords.y, coords.z);
            let response = await getAIResponse(formattedHistory);
            console.log(`GPT: ${response}\n`);
            bot.chat(response);
            addHistory("GPT", response); 
        } else if (formattedCommand.toLowerCase().startsWith("go to")) {
            let coords = parseMovementCommand(formattedCommand);
            goals.moveToCoordinates(bot, coords.x, coords.y, coords.z);
            let response = await getAIResponse(formattedHistory);
            console.log(`GPT: ${response}\n`);
            bot.chat(response);
            addHistory("GPT", response); 
        } else if (formattedCommand.startsWith("digDown")) {
            let param = getSingleParameter(formattedCommand);
            goals.digDown(bot, param);
            let response = await getAIResponse(formattedHistory);
            addHistory("GPT", response); 
        } else {
            bot.chat("Unknown command. No action taking place."); 
        }
    } else {
        let response = await getAIResponse(formattedHistory);
        console.log(`GPT: ${response}\n`);
        bot.chat(response);
        addHistory("GPT", response); 
    }


}

module.exports = { handleChat };
