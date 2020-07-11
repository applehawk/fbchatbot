'use strict';

const { UserState } = require('botbuilder');

module.exports = async (controller) => {
  const getUserContextProperties = async (bot, message) => { // [OK]
    let userState = new UserState(controller.storage);
    let context = bot.getConfig('context');
    let communityProperty = await userState.createProperty('community');
    let community = await communityProperty.get(context);
    let conversationWithProperty = await userState.createProperty('conversation_with');
    let conversationWith = await conversationWithProperty.get(context);
    let englishLevelProperty = await userState.createProperty('english_level');
    let englishLevel = await englishLevelProperty.get(context);
    let expiredAtProperty = await userState.createProperty('expired_at');
    let expiredAt = await expiredAtProperty.get(context);
    let locationProperty = await userState.createProperty('location');
    let location = await locationProperty.get(context);
    let professionProperty = await userState.createProperty('profession');
    let profession = await professionProperty.get(context);
    let readyToConversationProperty = await userState.createProperty('ready_to_conversation');
    let readyToConversation = await readyToConversationProperty.get(context);
    let recentUsersProperty = await userState.createProperty('recent_users');
    let recentUsers = await recentUsersProperty.get(context, []);

    return {
      userState,
      context,
      communityProperty,
      community,
      conversationWithProperty,
      conversationWith,
      expiredAtProperty,
      expiredAt,
      englishLevelProperty,
      englishLevel,
      locationProperty,
      location,
      professionProperty,
      profession,
      readyToConversationProperty,
      readyToConversation,
      recentUsersProperty,
      recentUsers,
    };
  };

  controller.on([
    'direct_message',
    'facebook_postback',
    'legacy_reply_to_message_action',
    'message',
    'messaging_postback'
  ], async (bot, message) => {
    const recipient = {
      id: message.sender.id,
    };

    if (message.text === 'getstarted_payload') {
      await controller.trigger(['start'], bot, message);
      return;
    }

    await controller.trigger(['ANALYTICS_EVENT'], bot, message);
    const senderProperties = await getUserContextProperties(bot, message);
    if (senderProperties.readyToConversation === 'ready') {
      await controller.trigger(['start_match'], bot, message);
    }
    // }
  });
};
