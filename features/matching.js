const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');
const { Activity } = require('botframework-schema');

module.exports = function (controller) {
    const userState = new UserState(controller.storage);
    let storage = controller.storage;

    const chooseWithLevel = async (payload) => {
        const users = {};
        const allUsersQuery = {
            _id: { // [OK]
                $regex: `${payload.channelId}/users*`,
                $ne: `${payload.channelId}/users/${payload.userId}/`,
            },
            //     // 'state.ready_to_conversation': {
            //     //     $eq: 'ready'
            //     // },
            'state.english_level': { // [OK]
                $gte: payload.englishLevel || 0
            },
            'state.country_city': { // [OK]
                $regex: `^((?!${payload.countryCity.split(',').join('|').toString()}).)+$`,
            },
        };

        // const docs = await storage.Collection.findOne(singleUserQuery); // [OK]

        const docs = await storage.Collection.find(allUsersQuery) // [OK]
            .limit(10) // for first 10 documents only
            .sort({ "state.english_level": 1 }); // sort ascending

        const items = (await docs.toArray()).reduce((accum, item) => { // [OK]
            accum[item._id] = item.state;
            return accum;
        }, {});

        Object.assign(users, items);

        return users;
    };

    controller.hears('match', ['message','direct_message'], async (bot, message) => {
        console.log(message);
        let context = bot.getConfig('context');
        let storageKey = userState.getStorageKey(context);

        const activity = context._activity;

        const channelId = activity.channelId;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
        const englishLevel = await userState.createProperty('english_level').get(context);
        const countryCity = await userState.createProperty('country_city').get(context);
        //let storageKey = `facebook/users/`;
        try {
            const payload = {
                channelId,
                countryCity,
                englishLevel,
                storage,
                userId,
            };
            const storeItems = await chooseWithLevel(payload);

            console.log('storeItems:',storeItems);
        } catch(error) {
            console.log(error);
        }
    });
}
