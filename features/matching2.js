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
    // [TODO]
    // Prepare for cache
    const cachedUsers = {};

    const botSay = (bot, obj) => {
        let message = '';
        if (Object.keys(obj).length > 1) {
            Object.values(obj).forEach(user => {
                if (!Object.values(user).includes('')) {
                    message = `Name: ${user.username}
City: ${user.location}
Community: ${communityDict[communityDict.indexOf(user.community)]}
Profession: ${user.profession}
English Level: ${englishLevelDict[user.english_level]}`
                }
            });
        } else {
            const user = obj[0];
            message = `Name: ${user.username}
City: ${user.location}
Community: ${communityDict[communityDict.indexOf(user.community)]}
Profession: ${user.profession}
English Level: ${englishLevelDict[user.english_level]}`
        }
        bot.say(message);
    };

    const userState = new UserState(controller.storage);
    let storage = controller.storage;

    const chooseWithLevel = async (payload) => {
        const location = `${payload.location}`.split(',').join('|'); // [OK]

        const allUsersQuery = {
            _id: { // [OK]
                $regex: `${payload.channelId}/users*`,
                $ne: `${payload.channelId}/users/${payload.userId}/`,
            },
            $and: [{
                'state.ready_to_conversation': { // [OK]
                    $eq: 'ready',
                },
                'state.english_level': { // [OK]
                    $gte: payload.englishLevel || 0,
                },
                'state.location': { // [OK]
                    $regex: `((?!${location}).)+`,
                },
            }],
            $and: [{
                _id: { // [OK][*][?]
                    $nin: Object.values(payload.recentUsers),
                },
            }],
        };

        // const docs = await storage.Collection.find(allUsersQuery) // [OK]
        //     .limit(1) // for first 10 documents only
        //     .sort({ "state.english_level": 1 }); // sort ascending

        // const items = (await docs.toArray()).reduce((accum, item) => { // [OK]
        //     accum[item._id] = item.state;
        //     return accum;
        // }, {});

        // Object.assign(cachedUsers, items);

        // return items;

        const docs = await storage.Collection.findOne(allUsersQuery) || []; // [OK]
        Object.assign(cachedUsers, docs);

        return docs;
    };

    controller.hears('match', ['message', 'direct_message'], async (bot, message) => {
        // console.log(message);
        try {
            let context = bot.getConfig('context');
            let storageKey = userState.getStorageKey(context);

            const activity = context._activity;

            const channelId = activity.channelId;
            const communityProperty = await userState.createProperty('community');
            const community = await communityProperty.get(context);
            const englishLevelProperty = await userState.createProperty('english_level');
            const englishLevel = await englishLevelProperty.get(context);
            const locationProperty = await userState.createProperty('location');
            const location = await locationProperty.get(context);
            const professionProperty = await userState.createProperty('profession');
            const profession = await professionProperty.get(context);
            const readyToConversationProperty = await userState.createProperty('ready_to_conversation');
            const readyToConversation = await readyToConversationProperty.get(context);
            const recentUsersProperty = await userState.createProperty('recent_users');
            let recentUsers = await recentUsersProperty.get(context, []); // [*][?]
            const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

            //let storageKey = `facebook/users/`;
            const payload = {
                channelId,
                community,
                englishLevel,
                location,
                profession,
                readyToConversation,
                recentUsers,
                storage,
                userId,
            };

            const storeItems = await chooseWithLevel(payload) || [];
            if (Object.keys(storeItems).length) {
                botSay(bot, [storeItems].map(item => item.state));

                // Set User State Properties
                const values = Object.values(storeItems);
                if (values.length > 1) {
                    recentUsers = [ ...recentUsers, ...[storeItems].map(item => item._id) ];
                } else {
                    if (!values.includes(item._id)) {
                        recentUsers = [ ...recentUsers, storeItems[0]._id ];
                    }
                }
                // recentUsers = [];
                await recentUsersProperty.set(context, recentUsers);

                // // Save UserState changes to MondogD
                await userState.saveChanges(context);
            } else {
                bot.say('Sorry, but at the moment we have not found a single suitable user.\nPlease try again later.');
            }

        } catch (error) {
            console.log(error);
        }
    });

    controller.hears('rand', ['message','direct_message'], async(bot,message) => {
        const locations = ['Nizhnepavlovka','Ufa','Moscow','Khanty','Tyumen', 'Russian', 'Russia', 'Singapour', 'Australian', 'Turkey'];
        const professions = ['IT-Programmer', 'IT-Manager', 'Financist', 'Saler', 'Marketer', 'Translator','Politic','Developer','Web Designer','Web Developer','Junior Frontend Developer','Middle Frontend Developer','Backend Developer'];
        const names = ['Nunc', 'Risus', 'Enim', 'Laoreet in', 'Suscipit', 'Eu Facilisis', 'A Nibh'];
        const users = [];
        for (let i = 0; i < 1; i++) {
            const randUserId = uuid();

            const user = {
                _id: `/facebook/users/${randUserId}/`,
                dt: new Date(Date.now() - Math.round(Math.random() * 1e9)),
                state: {
                    community: communityDict[Math.round(Math.random() * (communityDict.length - 1))],
                    location: locations[Math.round(Math.random() * (locations.length - 1))],
                    english_level: Math.round(Math.random() * (englishLevelDict.length - 1)),
                    profession: professions[Math.round(Math.random() * (professions.length - 1))],
                    ready_to_conversation: 'ready',
                    username: names[Math.round(Math.random() * (names.length - 1))],
                },
            };

            users.push(user);
        }
        try {
            const result = await storage.Collection.insertMany([...users]);
            botSayWithState(bot, users)
            console.log(JSON.stringify(result, null, 2));
        } catch (error) {
            console.log(error);
        }
    });
};
