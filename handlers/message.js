'use strict';

const { UserState } = require('botbuilder');

module.exports = async (controller) => {
  // const getUserContextProperties = async (bot, message) => { // [OK]
  //   const userState = new UserState(controller.storage);
  //   const context = bot.getConfig('context');
  //   const communityProperty = await userState.createProperty('community');
  //   const community = await communityProperty.get(context);
  //   const conversationWithProperty = await userState.createProperty('conversation_with');
  //   const conversationWith = await conversationWithProperty.get(context);
  //   const englishLevelProperty = await userState.createProperty('english_level');
  //   const englishLevel = await englishLevelProperty.get(context);
  //   const expiredAtProperty = await userState.createProperty('expired_at');
  //   const expiredAt = await expiredAtProperty.get(context);
  //   const locationProperty = await userState.createProperty('location');
  //   const location = await locationProperty.get(context);
  //   const professionProperty = await userState.createProperty('profession');
  //   const profession = await professionProperty.get(context);
  //   const readyToConversationProperty = await userState.createProperty('ready_to_conversation');
  //   const readyToConversation = await readyToConversationProperty.get(context);
  //   const recentUsersProperty = await userState.createProperty('recent_users');
  //   const recentUsers = await recentUsersProperty.get(context, []);

  //   return {
  //     userState,
  //     context,
  //     communityProperty,
  //     community,
  //     conversationWithProperty,
  //     conversationWith,
  //     expiredAtProperty,
  //     expiredAt,
  //     englishLevelProperty,
  //     englishLevel,
  //     locationProperty,
  //     location,
  //     professionProperty,
  //     profession,
  //     readyToConversationProperty,
  //     readyToConversation,
  //     recentUsersProperty,
  //     recentUsers,
  //   };
  // };

  controller.on([
    'direct_message',
    'facebook_postback',
    'legacy_reply_to_message_action',
    'message',
    'messaging_postback'
  ], async (bot, message) => {
    if (message.text === 'getstarted_payload') {
      await controller.trigger(['start'], bot, message);
      return;
    }

    await controller.trigger(['ANALYTICS_EVENT'], bot, message);
    // const senderProperties = await getUserContextProperties(bot, message);
    // if (senderProperties.readyToConversation === 'ready') {
    //   await controller.trigger(['start_match'], bot, message);
    // }
  });
};
