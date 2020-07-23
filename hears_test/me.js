'use strict';

const { UserState } = require('botbuilder');

const { englishLevelDict, communityDict } = require('../constants.js');

module.exports = async (controller) => {
  controller.hears(new RegExp(/^me$/), ['message', 'direct_message', 'facebook_postback', 'messaging_postback'], async (bot, message) => {
    try {
      const { text } = message;

      // Get User State Properties
      let context = bot.getConfig('context');
      const userState = new UserState(controller.storage);
      const { channelId } = message.incoming_message;

      const communityProperty = await userState.createProperty('community');
      const englishLevelProperty = await userState.createProperty('english_level');
      const facebookURLProperty = await userState.createProperty('facebook_url');
      const locationProperty = await userState.createProperty('location');
      const professionProperty = await userState.createProperty('profession');
      const profilePicProperty = await userState.createProperty('profile_pic');
      const readyToConversationProperty = await userState.createProperty('ready_to_conversation');
      const recentUsersProperty = await userState.createProperty('recent_users');
      const usernameProperty = await userState.createProperty('username');

      const community = await communityProperty.get(context);
      const englishLevel = await englishLevelProperty.get(context);
      const facebookURL = await facebookURLProperty.get(context);
      const location = await locationProperty.get(context);
      const profession = await professionProperty.get(context);
      const profilePic = await profilePicProperty.get(context);
      const readyToConversation = await readyToConversationProperty.get(context);
      const username = await usernameProperty.get(context);
      let recentUsers = await recentUsersProperty.get(context, []);

      const userId = message.sender.id;

      const payload = {
        channelId,
        community,
        englishLevel,
        facebookURL,
        location,
        profession,
        profilePic,
        readyToConversation,
        recentUsers,
        userId,
        username,
      };

      // console.log(message, JSON.stringify(payload, null, 2));

      const recipient = {
          id: userId,
      };

      const options = {
        recipient,
        message: {
          attachment: {
            type: 'template',
            payload: {
              image_aspect_ratio: 'square', // <square | horizontal>
              template_type: 'generic',
              elements: [{
                default_action: {
                  type: 'web_url',
                  url: profilePic, // <DEFAULT_URL_TO_OPEN>
                  // messenger_extensions: 'FALSE', // <TRUE | FALSE>
                  webview_height_ratio: 'COMPACT', // <COMPACT | TALL | FULL>
                },
                image_url: profilePic,
                title: `${username}`,
                subtitle: `[${userId}]`,
              }],
            },
          },
        },
      };

      await bot.api.callAPI('/me/messages', 'POST', options);

      const rUsers = [];
      if (recentUsers.length) {
        recentUsers.forEach(user => {
          rUsers.push(user.match(/(\d+)\/$/)[1]);
        });
      }

      await bot.api.callAPI('/me/messages', 'POST', {
        recipient,
        message: {
          text: `
🔗 ${!!facebookURL ? facebookURL : 'no link'}
🗺 ${location}
💬 ${englishLevelDict[englishLevel]}
👔 ${communityDict[community]}
🛠 ${profession}
📢 ${readyToConversation === 'ready' ? 'Ready' : 'Busy'}
${recentUsers.length ? '⌛ ' + recentUsers.length + '\n\nRecent user' + (recentUsers.length === 1 ? '' : 's') + ':\n\n' + rUsers.join('\n') : ''}`,
        },
      });
    } catch (error) {
      console.error(error);
    }
  });
};
