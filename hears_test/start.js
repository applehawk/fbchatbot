'use strict';

const { UserState } = require('botbuilder');

module.exports = async (controller) => {
  controller.hears(new RegExp(/^(start( +?\d+)?)$/, 'i'), ['message', 'direct_message'], async (bot, message) => {
    const { text } = message;
    const userId = text.replace(/([^\d]| )+/g, '');

    const storage = controller.storage;

    const context = bot.getConfig('context');

    const activity = context._activity;

    const userState = new UserState(controller.storage);

    const usernameProperty = await userState.createProperty('username');
    const username = await usernameProperty.get(context);

    // Get User State Properties
    const channelId = activity.channelId;

    const matchUser = await storage.Collection.findOne({ _id: `${channelId}/users/${userId}/` });

    const { id } = await bot.api.callAPI('/me', 'GET', { recipient: { id: userId }});

    const dialogBot = await controller.spawn(id);
    await dialogBot.startConversationWithUser(userId);
    await dialogBot.say(`Hi ${matchUser.state.username}! ${username} says hello`);
    await bot.say(`Done. Bot sent message: Hi ${matchUser.state.username}! ${username} says hello`);
    console.log(bot.getActiveDialog());
  });
};
