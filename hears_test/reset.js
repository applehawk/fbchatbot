'use strict';

const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');

module.exports = (controller) => {
  const clearState = async (state, context, field) => {
    const targetProperty = await state.createProperty(field);
    let target = await targetProperty.get(context, []);
    target = [];
    await targetProperty.set(context, target);
    console.log(target);
  };

  controller.hears(new RegExp(/^(reset( ?)(.+)?)$/, 'i'), ['message', 'direct_message'], async (bot, message) => {
    const { text } = message;
    const command = text.split(' ');

    try {
      const userState = new UserState(controller.storage);
      const context = bot.getConfig('context');

      if (command.length > 1) {
        console.log(command[0], command[1]);
        if (command[1].match('users')) {
          await clearState(userState, context, 'recent_users');
        }
        if (command[1].match('state')) {
          const userId = `facebook/conversations/${message.user}-${message.user}/`;
          const before = await bot.controller.storage.read([userId]);
          await bot.controller.storage.delete([userId]);
          const after = await bot.controller.storage.read([userId]);
          console.log('before:', before, 'after:', after);
        }
        // if (command[1].match('all')) {
        //   // clearState(userState, context, 'recent_users');
        //   // await bot.delete(context);
        // }
      } else {
        // Reset recent_users by default
        await clearState(userState, context, 'recent_users');
      }

      // Save userState changes to storage
      await userState.saveChanges(context);

      await bot.say(`[${command.length > 1 ? command[0] : text}] ${command.length > 1 ? command[1] : 'users'} empty.`);
    } catch (error) {
      console.log(error);
    }
  });
};
