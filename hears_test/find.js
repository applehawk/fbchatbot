'use strict';

const {
    englishLevelDict,
    communityDict,
} = require(`../constants.js`);

module.exports = async (controller) => {
  const formatUserInfo = (user) => { // [OK]
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
      image_url: profile_pic || `https://picsum.photos/300/200/?random=${Math.round(Math.random() * 1e3)}`,
      title: `${username}`,
      subtitle: `
🗺 ${location}
💬 ${englishLevelDict[english_level]}
👔 ${communityDict[community]}
🛠 ${profession}
${ready_to_conversation === 'ready' ? '✔ Ready' : '❗ On Air'}
⌛ ${recent_users.length}`,
      // buttons: [ ...buttons ],
    };
  };

  const botSay = async (payload) => { // [OK]
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
            template_type: 'generic',
            elements,
          }
        }
      }
    };

    try {
      await payload.bot.api.callAPI('/me/messages', 'POST', options);
    } catch(error) {
      console.error(error);
    }
  };

  controller.hears(new RegExp(/^(find)(\s+?(\d+?))?$/i), ['message'], async (bot, message) => {
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
  });
};
