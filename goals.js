const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

async function moveToCoordinates(bot, x, y, z) {
    const targetCoordinates = new goals.GoalBlock(x, y, z);
    bot.pathfinder.setMovements(new Movements(bot, bot.registry));

    try {
        await bot.pathfinder.goto(targetCoordinates);

        // look at the player once arrived
        bot.once('move', ()=>{ 
            let friend = bot.nearestEntity(); 
            if (friend) { 
                bot.lookAt(friend.position.offset(0, friend.height, 0))
            }})
    } catch (err) {
        bot.chat("Failed to find a path!");
    }
}

async function digDown(bot, numBlocks) {
    for (let i = 0; i < numBlocks; i++) {
        await new Promise(resolve => setTimeout(resolve, 250));
        let blockPosition = bot.entity.position.offset(0, -1 * (i + 1), 0);
        let block = bot.blockAt(blockPosition);

        if (block.name != 'air') {
            await bot.dig(block);
        }
    }
    bot.chat(`Successfully mined ${numBlocks} blocks.`);
}

module.exports = { moveToCoordinates, digDown };
