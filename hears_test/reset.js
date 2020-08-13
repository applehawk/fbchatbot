'use strict';

const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');

module.exports = async (controller) => {
  const clearState = async (context, state, field) => {
    const targetProperty = await state.createProperty(field);
    await targetProperty.set(context, []);
    return context;
  };

  controller.hears(new RegExp(/^reset ?(.*?)$/i), ['message'], async (bot, message) => {
  // controller.on(['reset'], async (bot, message) => {
    try {
      const userState = new UserState(controller.storage);
      const context = bot.getConfig('context');
      let cleaned = context;

      // [SO] https://stackoverflow.com/questions/59560604/how-to-clear-state-in-botkit-4-conversation
      const userId = `facebook/conversations/${message.user}-${message.user}/`;
      await bot.controller.storage.delete([userId]);
      cleaned = await clearState(context, userState, 'recent_users');

      // Save userState changes to storage
      await userState.saveChanges(cleaned);
      console.log('users empty');
    } catch (error) {
      console.log('[reset.js:29 ERROR]:', error);
    }
  });
};
