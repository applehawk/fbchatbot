const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');
const { Activity } = require('botframework-schema');
// #BEGIN DEV
const { uuid } = require('uuidv4');
const {
    englishLevelDict,
    communityDict,
} = require(`../constants.js`);
// #END DEV

module.exports = function (controller) {
    const botSay = (bot, obj) => {
       Object.values(obj).forEach((user) => {
           bot.say(
               `Name: ${user.username}\nCity: ${user.country_city}\nProfession: ${user.profession}\nEnglish Level: ${user.english_level}`
           );
       });
    };

    const cachedUsers = {};
    const userState = new UserState(controller.storage);
    let storage = controller.storage;

    const chooseWithLevel = async (payload) => {
        // const countryCity = payload.countryCity.split(',').join('|'); // v1 [OK][*]

        // v2 [?]
        let countryCity = '';
        if (payload.countryCity.indexOf(',') !== -1) {
            countryCity = payload.countryCity.replace(/ /gi, ',').split(',').join('|');
        } else {
            countryCity = payload.countryCity;
        }
        const regexp = new RegExp(`((?!${countryCity}).)+`, 'giu');

        const allUsersQuery = {
            _id: { // [OK]
                $regex: `${payload.channelId}/users*`,
                $ne: `${payload.channelId}/users/${payload.userId}/`
            },
            'state.ready_to_conversation': {
                $eq: 'ready'
            },
            'state.english_level': { // [OK]
                $gte: payload.englishLevel || 0
            },
            // 'state.country_city': { // v1 [OK]
            //     $regex: `^((?!${countryCity}).)+$`,
            // },
            'state.country_city': { // v2 [*][?]
                $regex: `${regexp}`
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

        Object.assign(cachedUsers, items);

        return items;
    };

    controller.hears('match', ['message', 'direct_message'], async (bot, message) => {
        // console.log(message);
        let context = bot.getConfig('context');
        let storageKey = userState.getStorageKey(context);

        const activity = context._activity;
        console.log(activity, context.activity);

        const channelId = activity.channelId;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
        const englishLevel = await userState.createProperty('english_level').get(context);
        const countryCity = await userState.createProperty('country_city').get(context);
        const community = await userState.createProperty('community').get(context);
        const profession = await userState.createProperty('profession').get(context);

        // [TODO]
        const recentUsers = await userState.createProperty('recent_users').get(context, {});

        const readyToConversation = await userState.createProperty('ready_to_conversation').get(context);
        //let storageKey = `facebook/users/`;
        try {
            const payload = {
                channelId,
                countryCity,
                englishLevel,
                // readyToConversation,
                storage,
                userId,
            };

            // if (Object.keys(cachedUsers).length) {
            //     console.log('cachedUsers:', cachedUsers);
            //     // botSay(bot, cachedUsers);
            if (Object.keys(recentUsers).length) {
                console.log('recentUsers:', recentUsers);
                // botSay(bot, recentUsers);
            } else {
                const storeItems = await chooseWithLevel(payload);
                console.log('storeItems:', storeItems);
                botSay(bot, storeItems);

                // // [TODO]
                // // Set User State Properties
                // Object.assign(recentUsers, storeItems);
                // await recentUsers.set(context, recentUsers);

                // // Save UserState changes to MondogD
                // await userState.saveChanges(context);

                // //Set Conversation State property
                // await conversationProperty.set(context, conversation);
                // //Save Conversation State to MongoDb
                // await conversationState.saveChanges(context);
            }

        } catch (error) {
            console.log(error);
        }
    });

    controller.hears('rand', ['message','direct_message'], async(bot,message) => {
        const cities = ['Nizhnepavlovka','Ufa','Moscow','Khanty','Tyumen'];
        const professions = ['IT-Programmer', 'IT-Manager', 'Financist', 'Saler', 'Marketer', 'Translator','Politic'];
        const users = [];
        for (let i = 0; i <= 1; i++) {
            const randUserId = uuid();

            const user = {
                _id: `/facebook/users/${randUserId}/`,
                dt: new Date(Date.now() - Math.round(Math.random() * 1e9)),
                state: {
                    community: Object.values(communityDict)[Math.round(Math.random() * Object.keys(communityDict).length - 1)],
                    country_city: cities[Math.round(Math.random() * cities.length - 1)],
                    english_level: Math.round(Math.random() * Object.keys(englishLevelDict).length - 1),
                    eTag: '',
                    profession: Object.values(professions)[Math.round(Math.random() * Object.keys(professions).length - 1)],
                    ready_to_conversation: Math.random() > 0.50 ? 'ready' : 'busy',
                    username: `user${i}`,
                },
            };

            users.push(user);
        }
        try {
            const result = await storage.Collection.insertMany([...users]);
            console.log(JSON.stringify(result, null, 2));
        } catch (error) {
            console.log(error);
        }
    });
};
