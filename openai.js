const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to send chat input to OpenAI and return a response
async function getAIFormattedCommand(input) {
    try {
        //read file context.txt
        const context = await fs.promises.readFile('formatCommand.txt', 'utf-8');
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: context},
                       { role: 'user', content: input}],
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        return 'I had trouble thinking, try again!';
    }
}

async function getAIInterpretation(input) {
    try {
        //read file context.txt
        const context = await fs.promises.readFile('interpret.txt', 'utf-8');
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: context},
                       { role: 'user', content: input}],
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        return 'I had trouble thinking, try again!';
    }
}

module.exports = { getAIFormattedCommand, getAIInterpretation };