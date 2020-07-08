'use strict';

const {
    englishLevelDict,
    communityDict,
} = require(`../constants.js`);

module.exports = async (controller) => {
  const formatUserInfo = (user) => { // [OK]
    // if (process.env.NODE_ENV === 'production') {
      const {
        community,
        english_level,
        location,
        profession,
        profile_pic,
        ready_to_conversation,
        recent_users,
        username,
      } = user.state;

      return {
        default_action: {
          type: 'web_url',
          url: profile_pic, // <DEFAULT_URL_TO_OPEN>
          // messenger_extensions: 'FALSE', // <TRUE | FALSE>
          webview_height_ratio: 'COMPACT', // <COMPACT | TALL | FULL>
        },
        image_url: profile_pic,
        title: `${username}`,
        subtitle: `
🗺 ${location}
💬 ${englishLevelDict[english_level]}
👔 ${communityDict[community]}
🛠 ${profession}`,
      };
//     } else {
//       return {
//         title: `username`,
//         subtitle: `
// 🗺 location
// 💬 english_level
// 👔 community
// 🛠 profession`,
//       };
//     }
  };

  const formatMessage = async (payload) => { // [OK]
    const elements = [];

    Object.values(payload.items).forEach((user, i = 0) => {
      elements.push({ ...formatUserInfo(payload.items[i]) });
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
    } catch(error) {
      console.error('[get_info.js:63 ERROR]', error);
    }
  };

  controller.on(['get_info'], async (bot, message) => {
    try {
      const id = message.user;
      if (!!id) {
        let users = null;
        // if (process.env.NODE_ENV === 'production') {
          users = await controller.storage.Collection.findOne({ _id: `facebook/users/${id}/` }); // [OK]
        // } else {
        //   users = [{}];
        // }
        await formatMessage({ bot, message, items: [users].map(user => user) });
      }

    } catch(error) {
      console.error('[get_info.js:91 ERROR]:', error);
    }
  });
};
