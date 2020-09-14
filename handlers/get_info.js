'use strict';

const {
    english_levelDict,
    communityDict,
} = require(`../constants.js`);

const { getUserContextProperties} = require('../helpers.js');

module.exports = async (controller) => {
  const formatUserInfo = (user) => { // [OK]
    // if (process.env.NODE_ENV === 'production') {
    const {
      // community,
      // english_level,
      facebook_url,
      // location,
      // profession,
      profile_pic,
      username,
    } = user;

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

  const formatMessage = async (payload) => { // [OK]
    const options = { // [OK]
      recipient: payload.message.recipient,
      message: {
        attachment: {
          type: 'template',
          payload: {
            image_aspect_ratio: 'square', // <square | horizontal>
            template_type: 'generic',
            elements: [{ ...formatUserInfo(payload.user) }],
          }
        }
      }
    };

    try {
      // await controller.trigger(['sender_action_typing'], payload.bot, { options: { recipient: payload.message.recipient } });
      await payload.bot.api.callAPI('/me/messages', 'POST', options);

      // await controller.trigger(['sender_action_typing'], payload.bot, { options: { recipient: payload.message.recipient } });
      await payload.bot.say({
        recipient: payload.message.recipient,
        text: `
🗺 ${payload.user.location}
💬 ${english_levelDict[payload.user.english_level]}
👔 ${communityDict[payload.user.community]}
🛠 ${payload.user.profession}`,
      });
      // await controller.trigger(['sender_action_typing'], payload.bot, { options: { recipient: payload.message.recipient } });
      // await payload.bot.say({
      //   text: 'Do not delay communication!\n\nText your partner on Facebook. Don\'t procrastinate, it will be better if you are scheduling the meeting immediately 🙂\n\nUse https://worldtimebuddy.com for matching the time for the call (your parnter might have another timezone)',
      // });
    } catch(error) {
      console.error('[get_info.js:64 ERROR]', error);
    }
  };

  controller.on(['get_info'], async (bot, message) => {
    const user = await getUserContextProperties(controller, bot, message);
    await formatMessage({ bot, message, user });
  });
};
