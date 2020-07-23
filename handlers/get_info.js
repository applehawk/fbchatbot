'use strict';

const {
    englishLevelDict,
    communityDict,
} = require(`../constants.js`);

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
  } = user.state;

  return {
    default_action: {
      type: 'web_url',
      url: facebook_url, // <DEFAULT_URL_TO_OPEN>
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
      console.error('[get_info.js:73 ERROR]', error);
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
