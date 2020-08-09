'use strict';

const { UserState } = require('botbuilder');

const {
  englishLevelDict,
  communityDict,
  MATCH_NOT_FOUND_SUITABLE_USER,
} = require(`../constants.js`);

const { getUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  // [TODO]
  // Prepare for cache
  // const cachedUsers = {};

  const formatUserInfo = (user, i = 0) => { // [OK]
    const {
      facebook_url,
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
    };
  };

  const botSay = async (payload) => { // [OK]
    const {
      bot,
      message,
      user,
    } = payload;

    const options = { // [OK]
      recipient: message.sender,
      message: {
        attachment: {
          type: 'template',
          payload: {
            image_aspect_ratio: 'square', // <square | horizontal>
            template_type: 'generic',
            elements: [{ ...formatUserInfo(user, 0) }],
          },
        },
      },
    };

    try {
      controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.recipient } });
      await bot.api.callAPI('/me/messages', 'POST', options);

      controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.recipient } });
      await bot.say({
        text: `
🗺 ${user.state.location}
💬 ${englishLevelDict[user.state.english_level]}
👔 ${communityDict[user.state.community]}
🛠 ${user.state.profession}`,
        // },
      });

      controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.recipient } });
      await bot.say({
        text: 'Do not delay communication!\n\nText your partner on Facebook. Don\'t procrastinate, it will be better if you are scheduling the meeting immediately 🙂\n\nUse https://worldtimebuddy.com for matching the time for the call (your parnter might have another timezone)',
      });
    } catch(error) {
      console.error('[match.js:77 ERROR]:', error);
    }
  };

  const chooseWithLevel = async (payload) => {
    // const location = `${payload.location}`.split(',').join('|'); // [OK] v1

    const findAllUsersQuery = {
      // _id: {
      //   "$regex": `${payload.channelId}/users*`,
      //   "$ne": `${payload.channelId}/users/${payload.userId}/`,
      //   "$nin": [ ...payload.recentUsers ],
      // },
      // // "state.location": { // [OK] v1
      // //   "$regex": `((?!${location}).)+`,
      // // },
      // "state.location": { "$ne": payload.location },
      // "state.community": payload.community,
      // "state.ready_to_conversation": "ready",
      "$and": [{
        "$or": [
          { "state.conversation_with": payload.userId },
          // { "state.conversation_with": 0 }
          { "state.ready_to_conversation": "ready" }
        ]}, {
        "$or": [
          { "state.english_level": payload.englishLevel + 1 },
          { "state.english_level": payload.englishLevel },
          { "state.english_level": payload.englishLevel - 1 },
          { "state.english_level": { "$gte": payload.englishLevel } },
          { "state.english_level": { "$lte": payload.englishLevel } }
        ]}, {
        "$or": [
          { "state.community": payload.community },
          { "state.community": { "$ne": payload.community } }
        ]}, {
        "$and": [
          { "_id": {
              "$regex": `${payload.channelId}/users*`,
              "$ne": `${payload.channelId}/users/${payload.userId}/`,
              "$nin": [ ...payload.recentUsers ],
            }},
          { "state.location": { "$ne": payload.location } }
        ],
      }]
    };

    const start = Date.now();
    // // v1 [OK][~]
    // const user = await controller.storage.Collection.findOne(findAllUsersQuery);

    // v2 [OK]
    const docs = await controller.storage.Collection.find(findAllUsersQuery)
      .sort({ 'state.english_level': -1 })
      .limit(1); // [OK]

    const user = (await docs.toArray()).reduce((accum, { _id, state }) => {
      accum = { _id, state };
      return accum;
    }, []);

    const finish = Date.now() - start;
    console.log(`search: ${finish}ms`);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[${payload.userId} >>> ${user._id.match(/(\d+)\/$/)[1]}${!!user.state.conversation_with ? ' [WRONG]: ' + user.state.conversation_with : ''}]\n`);
    }

    return user;
  };

  // controller.hears(new RegExp(/^match$/i), ['message'], async (bot, message) => {
  controller.on(['match'], async (bot, message) => {
    // Get User State Properties
    const start = Date.now();
    try {
      const userId = message.sender.id;
      const recipient = message.sender;

      const { channelId } = message.incoming_message;

      let senderProperties = await getUserContextProperties(controller, bot, message);
      const payload = {
        ...senderProperties,
        channelId,
        userId,
      };

      // Getting users from DB
      const user = await chooseWithLevel(payload);
      // return;

      if (Object.keys(user).length) {
        /**
         * Add recipient to sender recent users list
         */
        const start = Date.now();
        senderProperties.recentUsers = [ ...senderProperties.recentUsers, user._id ];

        /**
         * Save recent users to state
         */
        await senderProperties.recentUsersProperty.set(senderProperties.context, senderProperties.recentUsers);

        // // const expiredAt = Date.now() + (1000 * 60 * 60 * 24 * 2); // 2 days
        // const expiredAt = Date.now() + (1000 * 60 * 30); // 30 minutes
        const id = user._id.match(/(\d+)\/$/)[1];

        await senderProperties.readyToConversationProperty.set(senderProperties.context, 'busy');
        await senderProperties.conversationWithProperty.set(senderProperties.context, id);
        // await senderProperties.expiredAtProperty.set(senderProperties.context, expiredAt);

        /**
         * Save senderProperties changes to storage
         */
        await senderProperties.userState.saveChanges(senderProperties.context);

        message.channelData = {
          ...message.incoming_message.channelData,
          messaging_type: 'MESSAGE_TAG',
          tag: 'ACCOUNT_UPDATE',
        };

        const senderBot = bot;
        const senderMessage = Object.assign({}, { ...message });
        const recipientMessage = Object.assign({}, { ...message });

        /**
         * RECIPIENT
         */

        recipientMessage.recipient.id = id;
        const recipientBot = await controller.spawn(recipientMessage.recipient.id);
        await recipientBot.startConversationWithUser(recipientMessage.recipient.id);

        /**
         * Set recipient properties
         */
        let recipientProperties = await getUserContextProperties(controller, recipientBot, recipientMessage);
        await recipientProperties.readyToConversationProperty.set(recipientProperties.context, 'busy');
        await recipientProperties.conversationWithProperty.set(recipientProperties.context, senderMessage.sender.id);
        // await recipientProperties.expiredAtProperty.set(recipientProperties.context, expiredAt);

        /**
         * Save recipientProperties changes to storage
         */
        await recipientProperties.userState.saveChanges(recipientProperties.context);
        const finish = Date.now() - start;
        console.log(`set properties: ${finish}ms`);

        /**
         * Creat menu for sender
         */
        let payload = {
          recipient: senderMessage.sender,
          call_to_actions: [{
            type: 'postback',
            title: '❌ End a conversation',
            payload: `reset`,
          }],
        };

        await controller.trigger(['create_menu'], senderBot, payload);
        controller.trigger(['ask_for_scheduled_a_call'], senderBot, senderMessage);

        controller.trigger(['sender_action_typing'], senderBot, { options: { recipient } });
        await senderBot.say({
          text: `Hey ${senderProperties.userName}! Here is you partner for this week.`,
        });

        /**
         * Send reply with users info
         */
        botSay({ bot: senderBot, message: senderMessage, user });
        // controller.trigger(['get_info'], senderBot, senderMessage);

        /**
         * SEND INFO TO RECIPIENT
         */

        const matchedUser = {
          state: {
            ...senderProperties,
            english_level: senderProperties.englishLevel,
            facebook_url: senderProperties.facebookURL,
            username: senderProperties.userName,
            profile_pic: senderProperties.profilePic,
          },
        };

        recipientMessage.sender.id = recipientMessage.recipient.id;

        controller.trigger(['sender_action_typing'], recipientBot, { options: { recipient: recipientMessage.recipient } });
        await recipientBot.say({
          text: `Hey ${recipientProperties.userName}! Here is you partner for this week.`,
        });

        /**
         * Send reply with users info
         */
        botSay({ bot: recipientBot, message: recipientMessage, user: matchedUser });
        // controller.trigger(['get_info'], recipientBot, recipientMessage);

        /**
         * Create menu for recipient
         */
        payload = {
          recipient: recipientMessage.recipient,
          call_to_actions: [{
            type: 'postback',
            title: '❌ End a conversation',
            payload: `reset`,
          }],
        };

        await controller.trigger(['create_menu'], recipientBot, payload);
        controller.trigger(['ask_for_scheduled_a_call'], recipientBot, recipientMessage);
        payload = null;
      } else {
        clearTimeout(message.value);
        message.value = null;

        /**
         * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
         * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
         */
        // await bot.changeContext(message.reference);

        /**
         * #BEGIN Bot typing
         */
        controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

        await bot.say(MATCH_NOT_FOUND_SUITABLE_USER);
      }
    } catch(error) {
      console.error('[match.js:310 ERROR]:', error);
    }
    const finish = Date.now() - start;
    console.log(`match: ${finish}ms`);
  });
};
