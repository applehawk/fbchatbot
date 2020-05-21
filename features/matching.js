const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');
const { Activity } = require('botframework-schema');

module.exports = function(controller) {
    const userState = new UserState(controller.storage);
    let storage = controller.storage;

    async function chooseWithLevel(storage, englishLevel, channelId, userId) {
        var allUsersQuery = { 
            _id: { 
                $regex: `${channelId}/users*`, 
                $ne: `${channelId}/users/${userId}/`,
            },
            $or: [{
                'state.english_level': {
                    $eq : englishLevel,
                }},
                {'state.english_level': {
                    $eq: (englishLevel+1)%(4),
                }},
                {'state.english_level': {
                    $eq: (englishLevel-1)%(4),
                }},
                {'state.english_level': {
                    $eq: (englishLevel+2)%4,
                }}
            ]
        };
        const docs = await storage.Collection.find(allUsersQuery);
        const storeItems = (await docs.toArray()).reduce((accum, item) => {
            accum[item._id] = item.state;
            return accum;
        }, {});
        return storeItems;
    }

    controller.hears('match', ['message','direct_message'], async (bot, message) => {
        console.log(message);
        let context = bot.getConfig('context');
        let storageKey = userState.getStorageKey(context);

        const activity = context.activity;
        const channelId = activity.channelId;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
        const englishLevelUser = await userState.createProperty('english_level').get(context);
        //let storageKey = `facebook/users/`;
        try {
            const storeItems = await chooseWithLevel(storage, englishLevelUser, channelId, userId);
            
            console.log(storeItems);
        } catch(error) {
            console.log(error);
        }
    });
}