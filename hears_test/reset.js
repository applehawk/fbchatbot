'use strict';

const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');

module.exports = (controller) => {
  controller.hears(new RegExp(/^(reset( ?)(.+)?)$/, 'i'), ['message', 'direct_message'], async (bot, message) => {
    const { text } = message;
    const command = text.split(' ')[1];

    // const userState = new UserState(controller.storage);
    // const storage = controller.storage;

    try {
      // let context = bot.getConfig('context');

      // const recentUsersProperty = await userState.createProperty('recent_users');
      // let recentUsers = await recentUsersProperty.get(context, []);

      // await recentUsersProperty.set(context, recentUsers);

      // // // Save userState changes to storage
      // await userState.saveChanges(context);

      // const result = await recentUsersProperty.get(context);
      // console.log(message, result);
      await bot.say(`[${text}] ${command}`);
    } catch (error) {
      console.log(error);
    }
  });
};
