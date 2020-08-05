'use strict';

const {
    englishLevelDict,
    communityDict,
} = require(`../constants.js`);

const { getUserContextProperties} = require('../helpers.js');

module.exports = async (controller) => {
  const formatUserInfo = (user) => { // [OK]
    // if (process.env.NODE_ENV === 'production') {
    const {
      // community,
      // englishLevel,
      facebookUrl,
      // location,
      // profession,
      profilePic,
      userName,
    } = user;

    return {
      default_action: {
        type: 'web_url',
        url: !!facebookUrl ? facebookUrl : profilePic, // <DEFAULT_URL_TO_OPEN>
        // messenger_extensions: 'FALSE', // <TRUE | FALSE>
        webview_height_ratio: 'COMPACT', // <COMPACT | TALL | FULL>
      },
      image_url: profilePic || `https://picsum.photos/300/200/?random=${Math.round(Math.random() * 1e3)}`,
      title: `${userName}`,
    };
  };

  const formatMessage = async (payload) => { // [OK]
    const elements = [];

    Object.values(payload.user).forEach((user, i = 0) => {
      elements.push({ ...formatUserInfo(payload.user) });
    });

    const options = { // [OK]
      recipient: payload.message.recipient,
      message: {
        attachment: {
          type: 'template',
          payload: {
            image_aspect_ratio: 'square', // <square | horizontal>
            template_type: 'generic',
            elements,
          }
        }
      }
    };

    try {
      await payload.bot.api.callAPI('/me/messages', 'POST', options);

      await payload.bot.api.callAPI('/me/messages', 'POST', {
        recipient: payload.message.recipient,
        message: {
          // text: `🔗 ${!!payload.user.facebookUrl ? payload.user.facebookUrl : 'no link'}
          text: `
🗺 ${payload.user.location}
💬 ${englishLevelDict[payload.user.englishLevel]}
👔 ${communityDict[payload.user.community]}
🛠 ${payload.user.profession}`,
        },
      });
    } catch(error) {
      console.error('[get_info.js:71 ERROR]', error);
    }
  };

  controller.on(['get_info'], async (bot, message) => {
    const user = await getUserContextProperties(controller, bot, message);
    await formatMessage({ bot, message, user });
  });
};
