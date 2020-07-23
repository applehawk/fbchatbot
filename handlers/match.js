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

    const getUserContextProperties = async (bot, message) => { // [OK]
        let userState = new UserState(controller.storage);
        let context = bot.getConfig('context');

        let communityProperty = await userState.createProperty('community');
        let conversationWithProperty = await userState.createProperty('conversation_with');
        let englishLevelProperty = await userState.createProperty('english_level');
        let expiredAtProperty = await userState.createProperty('expired_at');
        let facebookURLProperty = await userState.createProperty('facebook_url');
        let locationProperty = await userState.createProperty('location');
        let professionProperty = await userState.createProperty('profession');
        let readyToConversationProperty = await userState.createProperty('ready_to_conversation');
        let recentUsersProperty = await userState.createProperty('recent_users');

        let community = await communityProperty.get(context);
        let conversationWith = await conversationWithProperty.get(context);
        let englishLevel = await englishLevelProperty.get(context);
        let expiredAt = await expiredAtProperty.get(context);
        let facebookURL = await facebookURLProperty.get(context);
        let location = await locationProperty.get(context);
        let profession = await professionProperty.get(context);
        let readyToConversation = await readyToConversationProperty.get(context);
        let recentUsers = await recentUsersProperty.get(context, []);

        return {
          context,
          userState,

          communityProperty,
          conversationWithProperty,
          englishLevelProperty,
          expiredAtProperty,
          facebookURLProperty,
          locationProperty,
          professionProperty,
          readyToConversationProperty,
          recentUsersProperty,

          community,
          conversationWith,
          englishLevel,
          expiredAt,
          facebookURL,
          location,
          profession,
          readyToConversation,
          recentUsers,
        };
    };

    const formatUserInfo = (user, i = 0) => { // [OK]
        // const buttons = [ ...getButtons(user._id) ];
        const {
            // community,
            // english_level,
            facebook_url,
            // location,
            // profession,
            profile_pic,
            username,
        } = user.state;

        return {
            default_action: {
                type: 'web_url',
                url: !!facebook_url ? facebook_url : profile_pic, // <DEFAULT_URL_TO_OPEN>
                // messenger_extensions: 'FALSE', // <TRUE | FALSE>
                webview_height_ratio: 'COMPACT', // <COMPACT | TALL | FULL>
            },
            image_url: profile_pic || `https://picsum.photos/300/200/?random=${Math.round(Math.random() * 1e3)}`,
            title: `${username}`,
            // subtitle: `🔗 ${!!facebook_url ? facebook_url : 'no link'}`,
// 🗺 ${location}
// 💬 ${englishLevelDict[english_level]}
// 👔 ${communityDict[community]}
// 🛠 ${profession}`,
            // buttons: [ ...buttons ],
        };
    };

    const botSay = async (payload) => { // [OK]
        const elements = [];

        Object.values(payload.users).forEach((user, i = 0) => {
            elements.push({ ...formatUserInfo(payload.users[i], i) });
        });

        console.log(payload.users[0]);

        const options = { // [OK]
            recipient: payload.message.recipient,
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

            const properties = await getUserContextProperties(payload.bot, payload.message);

            await payload.bot.api.callAPI('/me/messages', 'POST', {
                recipient: payload.message.sender,
                message: {
                    // text: `🔗 ${!!properties.facebook_url ? properties.facebook_url : 'no link'}
                    text: `
🗺 ${properties.location}
💬 ${englishLevelDict[properties.englishLevel]}
👔 ${communityDict[properties.community]}
🛠 ${properties.profession}`,
                },
            });
        } catch(error) {
            console.error('[match.js:147 ERROR]:', error);
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
            const userId = message.sender.id;
            // const userId = message.recipient.id;
            const recipient = { id: userId };

            /**
             * #BEGIN Bot typing
             */
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

            const { channelId } = message.incoming_message;

            // Get User State Properties
            const senderProperties = await getUserContextProperties(bot, message);

            const payload = {
                ...senderProperties,
                channelId,
                userId,
            };

            // Getting users from DB
            const users = await chooseWithLevel(payload) || [];

            if (Object.keys(users).length) {
                // console.log('[match.js:229 users]:', users);

                /**
                 * Add recipient to sender recent users list
                 */
                const values = Object.values(users);
                if (values.length > 1) {
                    // senderProperties.recentUsers = [ ...senderProperties.recentUsers, ...[users].map(user => user._id.match(/(\d+)\/$/)[1]) ];
                    senderProperties.recentUsers = [ ...senderProperties.recentUsers, ...[users].map(user => user._id) ];
                } else {
                    if (!values.includes(users[0]._id)) {
                        senderProperties.recentUsers = [ ...senderProperties.recentUsers, users[0]._id ];
                    }
                }

                /**
                 * Save recent users to state
                 */
                await senderProperties.recentUsersProperty.set(senderProperties.context, senderProperties.recentUsers);

                /**
                 * Save senderProperties changes to storage
                 */
                await senderProperties.userState.saveChanges(senderProperties.context);

                /**
                 * Send reply with users info
                 */
                await botSay({ bot, message, users: [users].map(user => user) });

                /**
                 * Add sender to recipient's recent users list
                 */
                const id = users['_id'];
                message.recipient.id = id.match(/(\d+)\/$/)[1];

                const dialogBot = await controller.spawn(message.recipient.id);
                await dialogBot.startConversationWithUser(message.recipient.id);
                const recipientProperties = await getUserContextProperties(dialogBot, message);

                /**
                 * Set recipient properties
                 */
                recipientProperties.recentUsers.push(id.replace(message.recipient.id, message.sender.id));
                await recipientProperties.recentUsersProperty.set(recipientProperties.context, recipientProperties.recentUsers);

                /**
                 * Save recipientProperties changes to storage
                 */
                await recipientProperties.userState.saveChanges(recipientProperties.context);

                await controller.trigger(['start_dialog'], bot, message);
            } else {
                clearTimeout(message.value);
                message.value = null;

                /**
                 * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
                 * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
                 */
                await bot.changeContext(message.reference);

                /**
                 * #BEGIN Bot typing
                 */
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

                await bot.say(MATCH_NOT_FOUND_SUITABLE_USER);
            }
        } catch (error) {
            console.error('[match.js:299 ERROR]:', error);
        }
    });
};
