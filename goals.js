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
    // center bot on the block (so it mines the block it is standing directly on)
    let x = bot.entity.position.x;
    let y = Math.round(bot.entity.position.y * 2) / 2;
    let z = bot.entity.position.z;
    moveToCoordinates(bot, x, y, z);

    for (let i = 0; i < numBlocks; i++) {
        // wait 250ms before mining next block, ensures bot has fallen to the next y level
        await new Promise(resolve => setTimeout(resolve, 250));
        let blockPosition = bot.entity.position.offset(0, -1, 0);
        let block = bot.blockAt(blockPosition);

        if (block.name != 'air') {
            await bot.dig(block);
        }
    }
    bot.chat(`Successfully mined ${numBlocks} blocks.`);
}

module.exports = { moveToCoordinates, digDown };
