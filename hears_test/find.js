'use strict';

const {
    englishLevelDict,
    communityDict,
} = require(`../constants.js`);

module.exports = async (controller) => {
  const formatUserInfo = (user) => { // [OK]
    const {
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
      image_url: profile_pic,
      title: `${username}`,
    };
  };

  const botSay = async (payload) => { // [OK]
    const elements = [];

    Object.values(payload.items).forEach((user, i = 0) => {
      elements.push({ ...formatUserInfo(payload.items[i]) });
    });

    const recipient = payload.message.sender;

    const options = { // [OK]
      recipient,
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

      const {
        community,
        english_level,
        facebook_url,
        location,
        profession,
        ready_to_conversation,
        recent_users,
      } = payload.items[0].state;

      await payload.bot.api.callAPI('/me/messages', 'POST', {
        recipient,
        message: {
          text: `
🔗 ${!!facebook_url ? facebook_url : 'no link'}
🗺 ${location}
💬 ${englishLevelDict[english_level]}
👔 ${communityDict[community]}
🛠 ${profession}
📢 ${ready_to_conversation === 'ready' ? 'Ready' : 'Busy'}
${recent_users.length ? '⌛ ' + recent_users.length : ''}`,
        },
      });
    } catch(error) {
      console.error(error);
    }
  };

  controller.hears(new RegExp(/^(find)(\s+?(\d+?))?$/i), ['message'], async (bot, message) => {
    try {
      const id = message.matches[3];
      if (!!id) {
        const users = await controller.storage.Collection.findOne({ _id: `facebook/users/${id}/` }); // [OK]
        if (!!users) {
          await botSay({ bot, message, items: [users].map(user => user) });
        } else {
          await bot.say('Sorry, but user not found.');
        }
      // } else {
      //   const users = await controller.storage.Collection.find(); // [OK]
      //   const items = await users.toArray();
      //   return;

        // const locations = items.map(user => user.state.location).sort();
        // const communities = items.map(user => communityDict[user.state.community]).sort();
        // const levels = items.map(user => englishLevelDict[user.state.english_level]).sort();

        // const stats = ['locations', 'communities', 'levels'];

        // items.forEach((user, i) => {
        //   !stats['locations'][user.state.location] ? stats['locations'][user.state.location] = 1 : stats['locations'][user.state.location]++;
        //   !stats['communities'][communityDict[user.state.community]] ? stats['communities'][communityDict[user.state.community]] = 1 : stats['communities'][communityDict[user.state.community]]++;
        //   !stats['levels'][englishLevelDict[user.state.english_level]] ? stats['levels'][englishLevelDict[user.state.english_level]] = 1 : stats['levels'][englishLevelDict[user.state.english_level]]++;
        // });

        // console.log(locations, communities, levels, stats, items.length);
        // if (!!users) {
        //   await botSay({ bot, message, items: [users].map(user => user) });
        // }
      }

    } catch(error) {
      console.error('[find.js:96 ERROR]:', error);
    }
  });
};
