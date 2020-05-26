'use strict';

const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');
const { Activity } = require('botframework-schema'); // [?]
const { FacebookAPI } = require('botbuilder-adapter-facebook');

const api = new FacebookAPI(
    process.env.FACEBOOK_ACCESS_TOKEN,
    process.env.FACEBOOK_APP_SECRET);

// #BEGIN DEV
const {
    englishLevelDict,
    communityDict,
} = require(`../constants.js`);
// #END DEV

module.exports = (controller) => {
    // [TODO]
    // Prepare for cache
    // const cachedUsers = {};

    const getButtons = () => {
        const buttons = [];
        for (let i = 0; i < 3; i++) {
            buttons.push({
                type: 'postback',
                title: `Button ${i}`,
                payload: i,
            });
        }
        return buttons;
    };

    const getElement = (user, i = 0) => {
        const buttons = [ ...getButtons() ];
        return {
            title: user.username,
            image_url: `https://picsum.photos/200/200/?random=${Math.round(Math.random() * 1e2 + i)}`,
            subtitle: `🗺 ${user.location}\nEnglish level: ${englishLevelDict[user.english_level]}\nCommunity: ${communityDict[user.community]}\nProfession: ${user.profession}`,
            buttons: [buttons[0], buttons[1], buttons[2]],
        };
    };

    const botSay = async (payload) => {
        let context = payload.bot.getConfig('context');
        // let storageKey = payload.userState.getStorageKey(context);

        const activity = context._activity;

        const channelId = activity.channelId;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

        const elements = [];

        if (Object.keys(payload.items).length > 1) {
            Object.values(payload.items).forEach((user, i) => {
                if (!Object.values(user).includes('')) {
                    elements.push({ ...getElement(user, i) });
                }
            });
        } else {
            elements.push({ ...getElement(payload.items[0]) });
        }

        const options = {
            recipient: {
                id: userId,
            },
            message: {
                attachment: {
                    type: 'template',
                    payload:{
                        template_type: 'generic',
                        elements: elements,
                    }
                }
            }
        };

        try {
            await api.callAPI('/me/messages', 'POST', options);
        } catch(error) {
            console.log(error);
        }
    };

    const chooseWithLevel = async (payload) => {
        const location = `${payload.location}`.split(',').join('|'); // [OK]

        const findAllUsersQuery = {
            _id: { // [OK]
                $regex: `${payload.channelId}/users*`,
                $ne: `${payload.channelId}/users/${payload.userId}/`,
                $nin: Object.values(payload.recentUsers),
            },
            $and: [{
                'state.ready_to_conversation': { // [OK]
                    $eq: 'ready',
                },
                'state.english_level': { // [OK]
                    $gte: payload.englishLevel,
                },
                'state.location': { // [OK]
                    $regex: `((?!${location}).)+`,
                },
                'state.community': { // [OK][?]
                    $eq: payload.community,
                },
            }],
        };

        // // v1 [OK]
        // const docs = await payload.storage.Collection.find(findAllUsersQuery) // [OK]
        //     .limit(1) // for first 10 documents only
        //     .sort({ "state.english_level": 1 }); // sort ascending

        // const items = (await docs.toArray()).reduce((accum, item) => { // [OK]
        //     accum[item._id] = item.state;
        //     return accum;
        // }, {});

        // Object.assign(cachedUsers, items);

        // return items;

        // v2 [OK][*]
        const docs = await payload.storage.Collection.findOne(findAllUsersQuery, { sort: 'state.english_level' }) || []; // [OK]
        // const docs = await payload.storage.Collection.find(findAllUsersQuery, { sort: 'state.english_level', limit: 1 }) || []; // [OK]
        // Object.assign(cachedUsers, docs);

        return docs;
    };

    controller.hears('match', ['message', 'direct_message'], async (bot, message) => {
        const userState = new UserState(controller.storage);
        const storage = controller.storage;

        try {
            let context = bot.getConfig('context');
            // let storageKey = userState.getStorageKey(context);

            const activity = context._activity;

            // Get User State Properties
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
            let recentUsers = await recentUsersProperty.get(context, []);
            const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

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

            // Getting users from DB
            const storeItems = await chooseWithLevel(payload) || [];

            if (Object.keys(storeItems).length) {
                // Send reply with users info
                botSay({ bot, items: [storeItems].map(item => item.state) });

                console.log(storeItems);

                // Set User State Properties
                const values = Object.values(storeItems);
                if (values.length > 1) {
                    recentUsers = [ ...recentUsers, ...[storeItems].map(item => item._id) ];
                } else {
                    if (!values.includes(item._id)) {
                        recentUsers = [ ...recentUsers, storeItems[0]._id ];
                    }
                }

                await recentUsersProperty.set(context, recentUsers);
                // Save userState changes to storage
                await userState.saveChanges(context);
            } else {
                // await bot.say('Sorry, but at the moment we have not found a single suitable user.\nPlease try again later.');
                await bot.say('Sorry, but at the moment we have not found a suitable user for you.\nPlease try again later.');
            }

        } catch (error) {
            console.log(error);
        }
    });
};
