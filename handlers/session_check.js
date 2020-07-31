'use strict;'

const CronJob = require('cron').CronJob;
const { UserState } = require('botbuilder');
const { USER_DIALOG_SESSION_EXPIRED } = require('../constants.js');

module.exports = async (controller) => {
  const getUserContextProperties = async (bot, message) => { // [OK]
    let userState = new UserState(controller.storage);
    let context = bot.getConfig('context');

    let communityProperty = await userState.createProperty('community');
    let conversationWithProperty = await userState.createProperty('conversation_with');
    let englishLevelProperty = await userState.createProperty('english_level');
    let expiredAtProperty = await userState.createProperty('expired_at');
    let facebookURLProperty = await userState.createProperty('facebook_url');
    let locationProperty = await userState.createProperty('location');
    let professionProperty = await userState.createProperty('profession');
    let readyToConversationProperty = await userState.createProperty('ready_to_conversation');
    let recentUsersProperty = await userState.createProperty('recent_users');

    let community = await communityProperty.get(context);
    let conversationWith = await conversationWithProperty.get(context);
    let englishLevel = await englishLevelProperty.get(context);
    let expiredAt = await expiredAtProperty.get(context);
    let facebookURL = await facebookURLProperty.get(context);
    let location = await locationProperty.get(context);
    let profession = await professionProperty.get(context);
    let readyToConversation = await readyToConversationProperty.get(context);
    let recentUsers = await recentUsersProperty.get(context, []);

    return {
      context,
      userState,

      communityProperty,
      conversationWithProperty,
      englishLevelProperty,
      expiredAtProperty,
      facebookURLProperty,
      locationProperty,
      professionProperty,
      readyToConversationProperty,
      recentUsersProperty,

      community,
      conversationWith,
      englishLevel,
      expiredAt,
      facebookURL,
      location,
      profession,
      readyToConversation,
      recentUsers,
    };
  };

  const resetUsersConvoWithProperties = async (bot, message) => { // [OK]
    const {
      context,
      userState,

      conversationWithProperty,
      expiredAtProperty,
      readyToConversationProperty,

      conversationWith,
    } = await getUserContextProperties(bot, message);

    await controller.trigger(['delete_menu'], bot, message.sender);

    await conversationWithProperty.set(context, 0);
    await expiredAtProperty.set(context, 0);
    await readyToConversationProperty.set(context, 'ready');

    /**
     * Save userState changes to storage
     */
    const result = await userState.saveChanges(context);
    console.log('session cleared');

    /**
     * #BEGIN Bot typing
     */
    await controller.trigger(['sender_action_typing'], bot, { // [OK]
      options: { recipient: message.sender },
    });

    await bot.say({ // [OK]
      recipient: message.sender,
      text: USER_DIALOG_SESSION_EXPIRED,
    });

    await bot.cancelAllDialogs();
    message.value = undefined;

    // await controller.trigger(['start_match'], bot, message);
  };

  controller.on(['session_check'], async (bot, message) => {
    const senderProperties = await getUserContextProperties(bot, message);

    if (senderProperties.conversationWith !== 0) {
      let expiredAt = new Date(senderProperties.expiredAt > Date.now() ? senderProperties.expiredAt : Date.now() + 5000);

      // const sender = senderProperties.conversationWith !== message.sender.id ? message.sender.id : message.recipient.id;
      console.log(`[SESSION]: ${message.recipient.id} > ${senderProperties.conversationWith} EXPIRED AT: ${expiredAt.toLocaleString()}`);

      const job = new CronJob(
        expiredAt,
        async () => {
          if (senderProperties.readyToConversation === 'busy') {
            await resetUsersConvoWithProperties(bot, message);
          }
          job.stop();
        },
        null,
        false,
        'Europe/Moscow'
      );
      // Use this if the 4th param is default value(false)
      job.start();
    }
  });
};
