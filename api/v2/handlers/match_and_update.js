'use strict';

const { UserState } = require('botbuilder');

const {
  english_levelDict,
  communityDict,
  MATCH_NOT_FOUND_SUITABLE_USER,
} = require('../constants.js');

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

    let payload = {
      image_url: process.env.NODE_ENV === 'development' ? profile_pic || `https://picsum.photos/300/200/?random=${Math.round(Math.random() * 1e3)}` : profile_pic,
      title: `${username}`,
    };

    const baseUrl = `${process.env.PROTO}://${process.env.APP_NAME}${process.env.NODE_ENV === "development" ? ':' + process.env.PORT : ""}`;
    const url = `${baseUrl}/api/profile?id=${user._id.match(/(\d+)\/?$/)[1]}`;

    if (!!facebook_url) {
      payload = {
        ...payload,
        buttons: [{
          type: 'web_url',
          url,
          title: 'Go to profile',
          webview_height_ratio: 'full',
        }],
      };
    } else {
      payload = {
        ...payload,
        default_action: {
          type: 'web_url',
          url: !!facebook_url ? url : profile_pic, // <DEFAULT_URL_TO_OPEN>
          // messenger_extensions: 'FALSE', // <TRUE | FALSE>
          webview_height_ratio: 'COMPACT', // <COMPACT | TALL | FULL>
        },
      };
    }

    return payload;
  };

  const botSay = async (payload) => { // [OK]
    const {
      bot,
      message,
      user,
    } = payload;

    const options = { // [OK]
      recipient: message.sender,
      messaging_type: 'MESSAGE_TAG',
      tag: 'ACCOUNT_UPDATE',
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
        ...message,
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE',
        text: `
🗺 ${user.state.location}
💬 ${english_levelDict[user.state.english_level]}
👔 ${communityDict[user.state.community]}
🛠 ${user.state.profession}`,
      });

      controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.recipient } });
      await bot.say({
        ...message,
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE',
        text: 'Do not delay communication!\n\nText your partner on Facebook. Don\'t procrastinate, it will be better if you are scheduling the meeting immediately 🙂\n\nUse https://worldtimebuddy.com for matching the time for the call (your parnter might have another timezone)',
      });
    } catch(error) {
      console.error('[match.js:106 ERROR]:', error);
    }
  };

  const findUser = async (payload) => {
    // const location = `${payload.location}`.split(',').join('|'); // [OK] v1
    const query = {
      $and: [
        {
          $or: [{ 'state.skip': { $exists: false } }, { 'state.skip': false }],
        },
        {
          $or: [
            {
              $and: [
                { 'state.conversation_with': payload.userId },
                { 'state.ready_to_conversation': 'busy' },
              ],
            },
            // {
            //   $and: [
            //     { 'state.conversation_with': { $gte: 0 } },
            //     { 'state.ready_to_conversation': 'ready' },
            //   ],
            // },
            // {
            //   $and: [
            //     { 'state.conversation_with': 0 },
            { 'state.ready_to_conversation': 'ready' },
            //   ],
            // },
            // {
            //   $and: [
            //     { 'state.conversation_with': 0 },
            //     { 'state.ready_to_conversation': 'busy' },
            //   ],
            // },
          ],
        },
        {
          $or: [
            { 'state.english_level': payload.english_level + 1 },
            { 'state.english_level': payload.english_level },
            { 'state.english_level': payload.english_level - 1 },
            { 'state.english_level': { $gte: payload.english_level } },
            { 'state.english_level': { $lte: payload.english_level } },
          ],
        },
        {
          $or: [
            { 'state.community': payload.community },
            { 'state.community': { $ne: payload.community } },
            { 'state.community': { $ne: undefined } },
          ],
        },
        {
          $and: [
            {
              _id: {
                $regex: `${payload.channelId}/users*`,
                $ne: `${payload.channelId}/users/${payload.userId}/`,
                $nin: [...payload.recent_users],
              },
            },
            { 'state.location': { $ne: payload.location } },
          ],
        },
      ],
    };

    const update = {
      /* the replacement object */
      $set: {
        'state.conversation_with': payload.userId,
        'state.ready_to_conversation': 'busy',
      },
    };

    const start = Date.now();
    // // v1 [OK][~]
    // const user = await controller.storage.Collection.findOne(query);

    // // v2 [OK]
    // const docs = await controller.storage.Collection.find(query)
    // .sort({ 'state.english_level': -1 })
    // .limit(1); // [OK]

    // const user = (await docs.toArray()).reduce((accum, { _id, state }) => {
    //   accum = { _id, state };
    //   return accum;
    // }, []);

    // v3
    const docs = await controller.storage.Collection.findOneAndUpdate(
      query,
      update,
      {
        returnOriginal: false,
        sort: { 'state.english_level': -1 },
      }
    );

    const user = docs.value;

    const finish = parseFloat((Date.now() - start) / 1e3).toFixed(3);
    console.log('search:', finish, 'sec');

    if (user.length) {
      console.log(
        `\n[${payload.userId} >>> ${user._id.match(/(\d+)\/?$/)[1]}${
          !!user.state.conversation_with &&
          user.state.conversation_with !== payload.userId
            ? ' [WRONG]: ' + user.state.conversation_with
            : ''
        }]\n`
      );
    }

    return user;
  };

  controller.on(['match_and_update'], async (bot, message) => {
    const start = Date.now();
    try {
      const userId = message.sender.id;

      const { channelId } = message.incoming_message;

      // Get User State Properties
      // let senderProperties = await getUserContextProperties(controller, bot, message);
      let senderProperties = message.senderProperties;
      const options = {
        ...senderProperties,
        channelId,
        userId,
      };

      // Getting users from DB
      const user = await findUser(options);

      if (Object.keys(user).length) {
        /**
         * Add recipient to sender recent users list
         */
        const start = Date.now();
        senderProperties.recent_users = [
          ...senderProperties.recent_users,
          user._id,
        ];

        /**
         * Save recent users to state
         */
        await message.senderProperties.recent_users_property.set(
          senderProperties.context,
          senderProperties.recent_users
        );

        // // const expired_at = Date.now() + (1000 * 60 * 60 * 24 * 2); // 2 days
        // const expired_at = Date.now() + (1000 * 60 * 30); // 30 minutes
        const id = user._id.match(/(\d+)\/?$/)[1];

        await message.senderProperties.ready_to_conversation_property.set(
          senderProperties.context,
          'busy'
        );
        await message.senderProperties.conversation_with_property.set(
          senderProperties.context,
          id
        );
        // await senderProperties.expired_at_property.set(senderProperties.context, expired_at);

        /**
         * Save senderProperties changes to storage
         */
        // await message.senderProperties.userState.saveChanges(senderProperties.context);

        // senderProperties = await getUserContextProperties(controller, bot, message);
        const senderBot = bot;
        const senderMessage = { ...message };

        /**
         * RECIPIENT
         */

        const recipientMessage = {
          ...message,
          senderProperties: null,
          channel: id,
          messaging_type: 'MESSAGE_TAG',
          recipient: { id },
          sender: { id },
          tag: 'ACCOUNT_UPDATE',
          user: id,
          value: undefined,
          reference: {
            ...message.reference,
            user: { id, name: id },
            conversation: { id },
          },
          incoming_message: {
            channelId: 'facebook',
            conversation: { id },
            from: { id, name: id },
            recipient: { id, name: id },
            channelData: {
              messaging_type: 'MESSAGE_TAG',
              tag: 'ACCOUNT_UPDATE',
              sender: { id },
            },
          },
        };

        const recipientBot = await controller.spawn(id);
        await recipientBot.startConversationWithUser(id);

        /**
         * Set recipient properties
         */
        let recipientProperties = await getUserContextProperties(
          controller,
          recipientBot,
          recipientMessage
        );

        recipientProperties.recent_users = [
          ...recipientProperties.recent_users,
          `${channelId}/users/${senderMessage.sender.id}/`,
        ];

        await recipientProperties.recent_users_property.set(
          recipientProperties.context,
          recipientProperties.recent_users
        );

        /**
         * Save recipientProperties changes to storage
         */
        await recipientProperties.userState.saveChanges(
          recipientProperties.context
        );
        const finish = parseFloat((Date.now() - start) / 1e3).toFixed(3);
        console.log('set properties:', finish, 'sec');

        // /**
        //  * Creat menu for sender
        //  */
        // let payload = {
        //   recipient: senderMessage.sender,
        //   call_to_actions: [{
        //     type: 'postback',
        //     title: '❌ End a conversation',
        //     payload: `reset`,
        //   }],
        // };

        // await controller.trigger(['create_menu'], senderBot, payload);
        // controller.trigger(['ask_for_scheduled_a_call'], senderBot, senderMessage);
        // controller.trigger(['session_check'], senderBot, senderMessage);

        controller.trigger(['sender_action_typing'], senderBot, {
          options: { recipient: senderMessage.sender },
        });
        await senderBot.say({
          ...senderMessage,
          messaging_type: 'MESSAGE_TAG',
          tag: 'ACCOUNT_UPDATE',
          text: `Hey ${senderProperties.username}! Here is you partner for this week.`,
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
          _id: user._id.replace(/(\d+)\/?$/, message.user),
          state: {
            ...senderProperties,
            english_level: senderProperties.english_level,
            facebook_url: senderProperties.facebook_url,
            username: senderProperties.username,
            profile_pic: senderProperties.profile_pic,
          },
        };

        controller.trigger(['sender_action_typing'], recipientBot, {
          options: { recipient: recipientMessage.sender },
        });
        await recipientBot.say({
          ...recipientMessage,
          messaging_type: 'MESSAGE_TAG',
          tag: 'ACCOUNT_UPDATE',
          text: `Hey ${recipientProperties.username}! Here is you partner for this week.`,
        });

        /**
         * Send reply with users info
         */
        botSay({
          bot: recipientBot,
          message: recipientMessage,
          user: matchedUser,
        });
        // controller.trigger(['get_info'], recipientBot, recipientMessage);

        // /**
        //  * Create menu for recipient
        //  */
        // payload = {
        //   ...payload,
        //   recipient: recipientMessage.sender,
        // };

        // await controller.trigger(['create_menu'], recipientBot, payload);
        // controller.trigger(['ask_for_scheduled_a_call'], recipientBot, recipientMessage);
        // controller.trigger(['session_check'], recipientBot, recipientMessage);
        // payload = null;
      } else {
        // clearTimeout(message.value);
        message.value = null;

        /**
         * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
         * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
         */
        // await bot.changeContext(message.reference);

        /**
         * #BEGIN Bot typing
         */
        controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });

        await bot.say({
          ...message,
          messaging_type: 'MESSAGE_TAG',
          tag: 'ACCOUNT_UPDATE',
          text: MATCH_NOT_FOUND_SUITABLE_USER,
        });
      }
    } catch(error) {
      console.error('[match.js:341 ERROR]:', error);
    }
    const finish = parseFloat((Date.now() - start) / 1e3).toFixed(3);
    console.log('match:', finish, 'sec');
  });
};
