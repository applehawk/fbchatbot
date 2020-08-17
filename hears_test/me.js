'use strict';

const { UserState } = require('botbuilder');

const { englishLevelDict, communityDict } = require('../constants.js');
const { getUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  controller.hears(new RegExp(/^me$/), ['message'], async (bot, message) => {
  // controller.on(['me'], async (bot, message) => {
    try {
      const {
        community,
        englishLevel,
        facebookURL,
        location,
        profession,
        profilePic,
        readyToConversation,
        recentUsers,
        userName,
      } = await getUserContextProperties(controller, bot, message);

      const recipient = message.sender;

      const options = {
        recipient,
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE',
        message: {
          attachment: {
            type: 'template',
            payload: {
              image_aspect_ratio: 'square', // <square | horizontal>
              template_type: 'generic',
              elements: [{
                default_action: {
                  type: 'web_url',
                  url: !!facebookURL ? facebookURL : profilePic, // <DEFAULT_URL_TO_OPEN>
                  // messenger_extensions: 'FALSE', // <TRUE | FALSE>
                  webview_height_ratio: 'COMPACT', // <COMPACT | TALL | FULL>
                },
                image_url: profilePic,
                title: `${userName}`,
                subtitle: `[${recipient.id}]`,
              }],
            },
          },
        },
      };

      controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      await bot.api.callAPI('/me/messages', 'POST', options);

      const rUsers = [];
      if (recentUsers.length) {
        recentUsers.forEach(user => {
          rUsers.push(user.match(/(\d+)\/?$/)[1]);
        });
      }

      controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      await bot.say({
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE',
        text: `
🗺 ${location}
💬 ${englishLevelDict[englishLevel]}
👔 ${communityDict[community]}
🛠 ${profession}
📢 ${readyToConversation === 'ready' ? 'Ready' : 'Busy'}
${recentUsers.length ? '⌛ ' + recentUsers.length + '\n\nRecent user' + (recentUsers.length === 1 ? '' : 's') + ':\n\n' + rUsers.join('\n') : ''}`,
      });
    } catch (error) {
      console.error('[me.js:75 ERROR]:', error);
    }
  });
};
