'use strict';

const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');

module.exports = async (controller) => {
  const clearState = async (context, state, field) => {
    const targetProperty = await state.createProperty(field);
    await targetProperty.set(context, []);
    return context;
  };

  controller.hears(new RegExp(/^reset ?(.*?)$/i), ['message', 'direct_message'], async (bot, message) => {
    const command = message.matches;

    try {
      const userState = new UserState(controller.storage);
      const context = bot.getConfig('context');
      let cleaned = context;

      if (command[1].length) {
        console.log(command[0], command[1]);
        if (command[1] === 'users') {
          cleaned = await clearState(context, userState, 'recent_users');
        }
        if (command[1] === 'state') {
          // [SO] https://stackoverflow.com/questions/59560604/how-to-clear-state-in-botkit-4-conversation
          const userId = `facebook/conversations/${message.user}-${message.user}/`;
          const before = await bot.controller.storage.read([userId]);
          await bot.controller.storage.delete([userId]);
          const after = await bot.controller.storage.read([userId]);
          console.log('before:', before, 'after:', after);
        }
        // if (command[1] === 'all') {
        //   const cleaned = await clearState(context, userState, 'recent_users');
        //   // await bot.delete(context);
        // }
      } else {
        // Reset recent_users by default
        cleaned = await clearState(context, userState, 'recent_users');
      }

      // Save userState changes to storage
      await userState.saveChanges(cleaned);

      await bot.say(`[${command[1].length > 1 ? command[0] : message.text}] ${command[1].length ? command[1] : 'users'} empty.`);
    } catch (error) {
      console.log(error);
    }
  });
};
