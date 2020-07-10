'use strict';

const { UserState } = require('botbuilder');

const {
    englishLevelDict,
    communityDict,
    MATCH_NOT_FOUND_SUITABLE_USER,
} = require(`../constants.js`);

module.exports = async (controller) => {
    // [TODO]
    // Prepare for cache
    // const cachedUsers = {};

    // const getButtons = (id) => { // [OK]
    //     return [{
    //         type: 'postback',
    //         title: `Start`,
    //         payload: `start_dialog ${id.match(/(\d+)\/$/)[1]}`,
    //     }, {
    //         type: 'postback',
    //         title: `Next`,
    //         payload: `match`,
    //     }];
    // };

    const formatUserInfo = (user, i = 0) => { // [OK]
        // const buttons = [ ...getButtons(user._id) ];
        const {
            community,
            english_level,
            location,
            profession,
            profile_pic,
            username,
        } = user.state;

        return {
            default_action: {
                type: 'web_url',
                url: profile_pic, // <DEFAULT_URL_TO_OPEN>
                // messenger_extensions: 'FALSE', // <TRUE | FALSE>
                webview_height_ratio: 'COMPACT', // <COMPACT | TALL | FULL>
            },
            image_url: profile_pic || `https://picsum.photos/300/200/?random=${Math.round(Math.random() * 1e3)}`,
            title: `${username}`,
            subtitle: `\n🗺 ${location}\n💬 ${englishLevelDict[english_level]}\n👔 ${communityDict[community]}\n🛠 ${profession}`,
            // buttons: [ ...buttons ],
        };
    };

    const botSay = async (payload) => { // [OK]
        const elements = [];

        Object.values(payload.users).forEach((user, i = 0) => {
            elements.push({ ...formatUserInfo(payload.users[i], i) });
        });

        const options = { // [OK]
            recipient: payload.message.sender,
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        image_aspect_ratio: 'square', // <square | horizontal>
                        template_type: 'generic',
                        elements,
                    },
                },
            },
        };

        try {
            await payload.bot.api.callAPI('/me/messages', 'POST', options);
        } catch(error) {
            console.error('[match.js:77 ERROR]:', error);
        }
    };

    const chooseWithLevel = async (payload) => {
        // const location = `${payload.location}`.split(',').join('|'); // [OK] v1

        const findAllUsersQuery = {
            _id: {
                $regex: `${payload.channelId}/users*`,
                $ne: `${payload.channelId}/users/${payload.userId}/`,
                $nin: [ ...payload.recentUsers ],
            },
            // $and: [{
                'state.ready_to_conversation': { // [OK]
                    $eq: 'ready',
                },
                'state.english_level': { // [OK]
                    $gte: payload.englishLevel,
                },
                // 'state.location': { // [OK] v1
                //     $regex: `((?!${location}).)+`,
                // },
                'state.location': { // [OK][*] v2
                    $ne: payload.location,
                },
                'state.community': { // [OK][?]
                    $eq: payload.community,
                },
            // }],
        };

        // // v1 [OK]
        // const docs = await controller.storage.Collection.find(findAllUsersQuery) // [OK]
        //     .limit(1) // for first 10 documents only
        //     .sort({ "state.english_level": 1 }); // sort ascending

        // const items = (await docs.toArray()).reduce((accum, item) => { // [OK]
        //     accum[item._id] = item.state;
        //     return accum;
        // }, {});

        // Object.assign(cachedUsers, items);

        // return items;

        // v2 [OK][*]
        // const docs = await controller.storage.Collection.findOne(findAllUsersQuery, { sort: 'state.english_level' }) || []; // [OK]
        const docs = await controller.storage.Collection.findOne(findAllUsersQuery, { sort: 'state.english_level' }) || []; // [OK]
        // const docs = await controller.storage.Collection.find(findAllUsersQuery, { sort: 'state.english_level', limit: 1 }) || []; // [OK]
        // Object.assign(cachedUsers, docs);

        return docs;
    };

    // controller.hears(new RegExp(/^match$/i), ['message', 'direct_message', 'facebook_postback'], async (bot, message) => {
    controller.on(['match'], async (bot, message) => {
        try {
            // // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
            // // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
            // await bot.changeContext(message.reference);

            const userState = new UserState(controller.storage);

            const context = bot.getConfig('context');

            const userId = message.sender.id;
            const recipient = { id: userId };

            // #BEGIN Bot typing
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

            // Get User State Properties
            const { channelId } = message.incoming_message;
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

            const payload = {
                channelId,
                community,
                englishLevel,
                location,
                profession,
                readyToConversation,
                recentUsers,
                // storage,
                userId,
            };

            // Getting users from DB
            const users = await chooseWithLevel(payload) || [];

            if (Object.keys(users).length) {
                console.log('[match.js:181 users]:', users);

                // Send reply with users info
                await botSay({ bot, message, users: [users].map(user => user) });
                message.recipient.id = users['_id'].match(/(\d+)\/$/)[1];
                await controller.trigger(['start_dialog'], bot, message);

                // Set User State Properties
                const values = Object.values(users);
                if (values.length > 1) {
                    // recentUsers = [ ...recentUsers, ...[users].map(user => user._id.match(/(\d+)\/$/)[1]) ];
                    recentUsers = [ ...recentUsers, ...[users].map(user => user._id) ];
                } else {
                    if (!values.includes(users[0]._id)) {
                        recentUsers = [ ...recentUsers, users[0]._id ];
                    }
                }

                // Save recent users to state
                await recentUsersProperty.set(context, recentUsers);

                // Save userState changes to storage
                await userState.saveChanges(context);
            } else {
                clearTimeout(message.value);
                message.value = null;

                // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
                // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
                await bot.changeContext(message.reference);

                // #BEGIN Bot typing
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

                await bot.say(MATCH_NOT_FOUND_SUITABLE_USER);
            }
        } catch (error) {
            console.error('[match.js:218 ERROR]:', error);
        }
    });
};
