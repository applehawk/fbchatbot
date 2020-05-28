'use strict';

const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');

module.exports = (controller) => {
  const userState = new UserState(controller.storage);
  const storage = controller.storage;

  controller.hears(new RegExp(/^(me)$/), ['message', 'direct_message'], async (bot, message) => {
    const { text } = message;
    try {
      let context = bot.getConfig('context');
      // let storageKey = userState.getStorageKey(context);

      const activity = context._activity;

      // Get User State Properties
      const channelId = activity.channelId;
      const communityProperty = await userState.createProperty('community');
      const community = await communityProperty.get(context);
      const englishLevelProperty = await userState.createProperty('english_level');
      const englishLevel = await englishLevelProperty.get(context);
      const locationProperty = await userState.createProperty('location');
      const location = await locationProperty.get(context);
      const professionProperty = await userState.createProperty('profession');
      const profession = await professionProperty.get(context);
      const readyToConversationProperty = await userState.createProperty('ready_to_conversation');
      const readyToConversation = await readyToConversationProperty.get(context);
      const recentUsersProperty = await userState.createProperty('recent_users');
      let recentUsers = await recentUsersProperty.get(context, []);
      const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

      const payload = {
        channelId,
        community,
        englishLevel,
        location,
        profession,
        readyToConversation,
        recentUsers,
        userId,
      };

      console.log(message, JSON.stringify(payload, null, 2));
      await bot.say(`[${text}]\n${JSON.stringify(payload, null, 2)}`);
    } catch (error) {
      console.log(error);
    }
  });
};
