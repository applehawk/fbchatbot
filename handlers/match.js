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
      await bot.api.callAPI('/me/messages', 'POST', options);

      await bot.api.callAPI('/me/messages', 'POST', {
        recipient: message.sender,
        message: {
          text: `
🗺 ${user.state.location}
💬 ${englishLevelDict[user.state.english_level]}
👔 ${communityDict[user.state.community]}
🛠 ${user.state.profession}`,
        },
      });
    } catch(error) {
      console.error('[match.js:72 ERROR]:', error);
    }
  };

  const chooseWithLevel = async (payload) => {
    const location = `${payload.location}`.split(',').join('|'); // [OK] v1

    const findAllUsersQuery = {
      _id: {
        "$regex": `${payload.channelId}/users*`,
        "$ne": `${payload.channelId}/users/${payload.userId}/`,
        "$nin": [ ...payload.recentUsers ],
      },
      // 'state.ready_to_conversation': { // [OK]
      //   "$eq": 'ready',
      // },
      'state.location': { // [OK] v1
        "$regex": `((?!${location}).)+`,
      },
      // 'state.location': { // [OK][*] v2
      //   "$ne": payload.location,
      // },
      'state.community': { // [OK]
        "$eq": payload.community,
      },
      "$or" : [
        { "state.english_level": payload.englishLevel + 1 },
        { "state.english_level": payload.englishLevel },
        { "state.english_level": payload.englishLevel - 1 },
        { "state.english_level": { "$gte": payload.englishLevel } },
        { "state.english_level": { "$lte": payload.englishLevel } },
      ]
    };

    // v2 [OK]
    const docs = await controller.storage.Collection.find(findAllUsersQuery)
      .sort({ 'state.english_level': -1 })
      .limit(1); // [OK]

    const user = (await docs.toArray()).reduce((accum, { _id, state }) => {
      accum.push({ _id, state });
      return accum;
    });

    return user;
  };

  // controller.hears(new RegExp(/^match$/i), ['message'], async (bot, message) => {
  controller.on(['match'], async (bot, message) => {
    try {
      const userId = message.sender.id;
      const recipient = message.sender;

      const { channelId } = message.incoming_message;

      // Get User State Properties
      const senderProperties = await getUserContextProperties(controller, bot, message);

      const payload = {
        ...senderProperties,
        channelId,
        userId,
      };

      // Getting users from DB
      const user = await chooseWithLevel(payload) || [];

      if (!!user) {
        console.log(user);
        /**
         * Add recipient to sender recent users list
         */
        senderProperties.recentUsers = [ ...senderProperties.recentUsers, user._id ];

        /**
         * Save recent users to state
         */
        await senderProperties.recentUsersProperty.set(senderProperties.context, senderProperties.recentUsers);

        /**
         * #BEGIN Bot typing
         */
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
        await bot.say({
          recipient: message.sender,
          sender: message.sender,
          text: `Hey ${senderProperties.userName}! Here is you partner for this week.`,
        });

        /**
         * #BEGIN Bot typing
         */
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

        /**
         * Send reply with users info
         */
        await botSay({ bot, message, user });

        message.text = 'Do not delay communication!\n\nText your partner on Facebook. Don\'t procrastinate, it will be better if you are scheduling the meeting immediately 🙂\n\nUse https://worldtimebuddy.com for matching the time for the call (your parnter might have another timezone)';

        await bot.say({
          recipient: message.sender,
          sender: message.sender,
          text: message.text,
        });

        /**
         * Creat menu for sender
         */
        let payload = {
          recipient: message.sender,
          call_to_actions: [{
          type: 'postback',
          title: '❌ End a conversation',
          payload: `reset`,
          }],
        };

        // // const expiredAt = Date.now() + (1000 * 60 * 60 * 24 * 2); // 2 days
        // const expiredAt = Date.now() + (1000 * 60 * 30); // 30 minutes

        await senderProperties.readyToConversationProperty.set(senderProperties.context, 'busy');
        await senderProperties.conversationWithProperty.set(senderProperties.context, message.recipient.id);
        // await senderProperties.expiredAtProperty.set(senderProperties.context, expiredAt);

        /**
         * Save senderProperties changes to storage
         */
        await senderProperties.userState.saveChanges(senderProperties.context);

        await controller.trigger(['create_menu'], bot, payload);
        await controller.trigger(['ask_for_scheduled_a_call'], bot, message);

        message.recipient.id = user._id.match(/(\d+)\/$/)[1];

        const dialogBot = await controller.spawn(message.sender.id);
        await dialogBot.startConversationWithUser(message.recipient.id);

        /**
         * Set recipient properties
         */
        const recipientProperties = await getUserContextProperties(controller, dialogBot, message);
        await recipientProperties.readyToConversationProperty.set(recipientProperties.context, 'busy');
        await recipientProperties.conversationWithProperty.set(recipientProperties.context, message.sender.id);
        // await recipientProperties.expiredAtProperty.set(recipientProperties.context, expiredAt);

        /**
         * Save recipientProperties changes to storage
         */
        await recipientProperties.userState.saveChanges(recipientProperties.context);

        /**
         * Create menu for recipient
         */
        payload = {
          recipient: message.recipient,
          call_to_actions: [{
          type: 'postback',
          title: '❌ End a conversation',
          payload: `reset`,
          }],
        };

        await controller.trigger(['create_menu'], dialogBot, payload);
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
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

        await bot.say(MATCH_NOT_FOUND_SUITABLE_USER);
      }
    } catch(error) {
      console.error('[match.js:256 ERROR]:', error);
    }
  });
};
