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
      const community = await communityProperty.get(context);
      const englishLevelProperty = await userState.createProperty('english_level');
      const englishLevel = await englishLevelProperty.get(context);
      const locationProperty = await userState.createProperty('location');
      const location = await locationProperty.get(context);
      const professionProperty = await userState.createProperty('profession');
      const profession = await professionProperty.get(context);
      const profilePicProperty = await userState.createProperty('profile_pic');
      const profilePic = await profilePicProperty.get(context);
      const readyToConversationProperty = await userState.createProperty('ready_to_conversation');
      const readyToConversation = await readyToConversationProperty.get(context);
      const recentUsersProperty = await userState.createProperty('recent_users');
      let recentUsers = await recentUsersProperty.get(context, []);

      const userId = message.sender.id;

      const usernameProperty = await userState.createProperty('username');
      const username = await usernameProperty.get(context);

      const payload = {
        channelId,
        community,
        englishLevel,
        location,
        profession,
        profilePic,
        readyToConversation,
        recentUsers,
        userId,
        username,
      };

      console.log(message, JSON.stringify(payload, null, 2));

      const recipient = {
          id: userId,
      };

      const options = {
        recipient,
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: [{
                image_url: profilePic || `https://picsum.photos/300/200/?random=${Math.round(Math.random() * 1e3)}`,
                title: `${username} [id: ${userId}]`,
                subtitle: `
🗺 ${location}
💬 ${englishLevelDict[englishLevel]}
👔 ${communityDict[community]}
🛠 ${profession}
${readyToConversation === 'ready' ? '✔ Ready' : '❗ On Air'}
⌛ ${recentUsers.length}`,
              }],
            },
          },
        },
      };

      await bot.api.callAPI('/me/messages', 'POST', options);

      if (recentUsers.length) {
        const rUsers = [];
        recentUsers.forEach(user => {
          rUsers.push(user.match(/(\d+)\/$/)[1]);
        });

        await bot.api.callAPI('/me/messages', 'POST', {
          recipient,
          message: {
            text: `Recent user${recentUsers.length === 1 ? '' : 's'}:\n\n${rUsers.join('\n')}`,
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  });
};
