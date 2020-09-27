'use strict';

const {
  english_levelDict,
  communityDict,
} = require('../constants.js');
const { getUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  controller.hears(new RegExp(/^(find)(\s+?(\d+?))?$/i), ['message'], async (bot, message) => {
    try {
      const id = message.matches[3];
      if (!!id) {
        const recipientBot = await controller.spawn(message.sender.id);
        await recipientBot.startConversationWithUser(id);
        const {
          community,
          conversation_with,
          english_level,
          facebook_url,
          location,
          profession,
          profile_pic,
          ready_to_conversation,
          recent_users,
          username,
        } = await getUserContextProperties(controller, recipientBot, message);

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
                  subtitle: `[${id}]`,
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
            rUsers.push(user.match(/(\d+)\/$/)[1]);
          });
        }

        controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
        await bot.say({
          messaging_type: 'MESSAGE_TAG',
          tag: 'ACCOUNT_UPDATE',
          text: `
🗺 ${location}
💬 ${english_levelDict[english_level]}
👔 ${communityDict[community]}
🛠 ${profession}
📢 ${ready_to_conversation === 'ready' ? 'Ready' : 'Busy (with ' + conversation_with + ')'}
Has dialog: ${recipientBot.hasActiveDialog()}
${recent_users.length ? '⌛ ' + recent_users.length + '\n\nRecent user' + (recent_users.length === 1 ? '' : 's') + ':\n\n' + rUsers.join('\n') : ''}`,
        });
      }
    } catch(error) {
      console.error('[find.js:80 ERROR]:', error);
    }
  });
};
