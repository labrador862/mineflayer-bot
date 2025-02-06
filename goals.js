const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

async function moveToCoordinates(bot, x, y, z) {
    bot.chat("I'm on my way!");
    const targetPosition = new goals.GoalBlock(x, y, z);
    bot.pathfinder.setMovements(new Movements(bot, bot.registry));

    try {
        await bot.pathfinder.goto(targetPosition);
        
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

module.exports = { moveToCoordinates };
