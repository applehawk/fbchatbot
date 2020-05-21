const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');

module.exports = function(controller) {
    const userState = new UserState(controller.storage);
    let storage = controller.storage;

    controller.hears('match', ['message','direct_message'], async (bot, message) => {
        console.log(message);
        let context = bot.getConfig('context');
        //let storageKey = userState.getStorageKey(context);

        let storageKey = `facebook/users/`;
        try {
            let states = await storage.read(['BotState']);
            console.log(states);
        } catch(error) {
            console.log(error);
        }
    });
}