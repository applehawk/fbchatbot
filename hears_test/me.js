'use strict';

const { UserState } = require('botbuilder');

const { english_levelDict, communityDict } = require('../constants.js');
const { getUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  controller.hears(new RegExp(/^me$/), ['message'], async (bot, message) => {
  // controller.on(['me'], async (bot, message) => {
    try {
      const {
        community,
        english_level,
        facebook_url,
        location,
        profession,
        profile_pic,
        ready_to_conversation,
        recent_users,
        username,
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
                  url: !!facebook_url ? facebook_url : profile_pic, // <DEFAULT_URL_TO_OPEN>
                  // messenger_extensions: 'FALSE', // <TRUE | FALSE>
                  webview_height_ratio: 'COMPACT', // <COMPACT | TALL | FULL>
                },
                image_url: profile_pic,
                title: `${username}`,
                subtitle: `[${recipient.id}]`,
              }],
            },
          },
        },
      };

      controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      await bot.api.callAPI('/me/messages', 'POST', options);

      const rUsers = [];
      if (recent_users.length) {
        recent_users.forEach(user => {
          rUsers.push(user.match(/(\d+)\/?$/)[1]);
        });
      }

      controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      await bot.say({
        ...message,
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE',
        text: `
🗺 ${location}
💬 ${english_levelDict[english_level]}
👔 ${communityDict[community]}
🛠 ${profession}
📢 ${ready_to_conversation === 'ready' ? 'Ready' : 'Busy'}
${recent_users.length ? '⌛ ' + recent_users.length + '\n\nRecent user' + (recent_users.length === 1 ? '' : 's') + ':\n\n' + rUsers.join('\n') : ''}`,
      });
    } catch (error) {
      console.error('[me.js:75 ERROR]:', error);
    }
  });
};
