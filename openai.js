const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// uses provided context to format a command
async function getAIFormattedCommand(input) {
    try {
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

// uses provided context to respond with its thoughts
async function getAIInterpretation(input) {
    try {
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

// uses provided context to respond with its thoughts
async function getAIResponse(input) {
    try {
        const context = await fs.promises.readFile('default.txt', 'utf-8');
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

module.exports = { getAIFormattedCommand, getAIInterpretation, getAIResponse };