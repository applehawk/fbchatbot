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

    console.log(command[0], command[1]);

    try {
      const userState = new UserState(controller.storage);
      const context = bot.getConfig('context');

      if (command.length > 1 ? command[1].match('users') : text === 'reset') {
        await clearState(userState, context, 'recent_users');
      }
      // if (command[1].match('state')) {
      //   await bot.delete(context);
      // }
      // if (command[1].match('all')) {
      //   // clearState(userState, context, 'recent_users');
      //   // await bot.delete(context);
      // }

      // Save userState changes to storage
      await userState.saveChanges(context);

      await bot.say(`[${command.length > 1 ? command[0] : text}] ${command.length > 1 ? command[1] : 'users'} empty.`);
    } catch (error) {
      console.log(error);
    }
  });
};
