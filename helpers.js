'use strict;'

const { UserState } = require('botbuilder');
const { USER_DIALOG_SESSION_EXPIRED } = require('./constants.js');

const getUserContextProperties = async (controller, bot, message) => { // [OK]
  let userState = new UserState(controller.storage);
  let context = bot.getConfig('context');

  let communityProperty = await userState.createProperty('community');
  let conversationWithProperty = await userState.createProperty('conversation_with');
  let englishLevelProperty = await userState.createProperty('english_level');
  let expiredAtProperty = await userState.createProperty('expired_at');
  let facebookURLProperty = await userState.createProperty('facebook_url');
  let locationProperty = await userState.createProperty('location');
  let professionProperty = await userState.createProperty('profession');
  let profilePicProperty = await userState.createProperty('profile_pic');
  let readyToConversationProperty = await userState.createProperty('ready_to_conversation');
  let recentUsersProperty = await userState.createProperty('recent_users');
  let userNameProperty = await userState.createProperty('username');

  let community = await communityProperty.get(context);
  let conversationWith = await conversationWithProperty.get(context);
  let englishLevel = await englishLevelProperty.get(context);
  let expiredAt = await expiredAtProperty.get(context);
  let facebookURL = await facebookURLProperty.get(context);
  let location = await locationProperty.get(context);
  let profession = await professionProperty.get(context);
  let profilePic = await profilePicProperty.get(context);
  let readyToConversation = await readyToConversationProperty.get(context);
  let recentUsers = await recentUsersProperty.get(context, []);
  let userName = await userNameProperty.get(context);

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
    profilePicProperty,
    readyToConversationProperty,
    recentUsersProperty,
    userNameProperty,

    community,
    conversationWith,
    englishLevel,
    expiredAt,
    facebookURL,
    location,
    profession,
    profilePic,
    readyToConversation,
    recentUsers,
    userName,
  };
};

const resetUserContextProperties = async (controller, bot, message) => { // [OK]
  const {
    context,
    userState,

    conversationWithProperty,
    expiredAtProperty,
    readyToConversationProperty,

    conversationWith,
  } = await getUserContextProperties(controller, bot, message);

  controller.trigger(['delete_menu'], bot, message.sender);

  await conversationWithProperty.set(context, 0);
  await expiredAtProperty.set(context, 0);
  await readyToConversationProperty.set(context, 'ready');

  /**
   * Save userState changes to storage
   */
  await userState.saveChanges(context);
  console.log('session cleared');

  /**
   * #BEGIN Bot typing
   */
  controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });

  await bot.say({ // [OK]
    recipient: message.sender,
    text: USER_DIALOG_SESSION_EXPIRED,
  });

  await bot.cancelAllDialogs();
  message.value = undefined;

  return;
};

module.exports = {
  getUserContextProperties,
  resetUserContextProperties,
};
