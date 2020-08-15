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
  const senderBot = await controller.spawn(message.sender.id);
  await senderBot.startConversationWithUser(message.sender.id);
  let senderProperties = await getUserContextProperties(controller, senderBot, message);
  if (!!senderProperties.conversationWith) {
    await senderBot.cancelAllDialogs();

    const conversationWith = senderProperties.conversationWith;

    await controller.trigger(['delete_menu'], senderBot, message.sender);

    await senderProperties.conversationWithProperty.set(senderProperties.context, 0);
    await senderProperties.expiredAtProperty.set(senderProperties.context, 0);
    await senderProperties.readyToConversationProperty.set(senderProperties.context, 'ready');


    /**
     * Save userState changes to storage
     */
    await senderProperties.userState.saveChanges(senderProperties.context);
    console.log(`[helpers.js:81 reset]: ${message.sender.id} >>> session cleared`);

    console.log(message.sender.id, 'conversationWith:', conversationWith);
    /**
     * #BEGIN Bot typing
     */
    controller.trigger(['sender_action_typing'], senderBot, { options: { recipient: message.sender } });

    await senderBot.say({ // [OK]
      recipient: message.sender,
      text: USER_DIALOG_SESSION_EXPIRED,
      messaging_type: 'MESSAGE_TAG',
      tag: 'ACCOUNT_UPDATE',
    });

    if (!!conversationWith) {
      const recipientBot = await controller.spawn(conversationWith);
      await recipientBot.startConversationWithUser(conversationWith);
      const messageRef = {
        ...message,
        channel: conversationWith,
        messaging_type: 'MESSAGE_TAG',
        recipient: { id: conversationWith },
        sender: { id: conversationWith },
        tag: 'ACCOUNT_UPDATE',
        user: conversationWith,
        value: undefined,
        reference: {
          ...message.reference,
          user: { id: conversationWith, name: conversationWith },
          conversation: { id: conversationWith },
        },
        incoming_message: {
          channelId: 'facebook',
          conversation: { id: conversationWith },
          from: { id: conversationWith, name: conversationWith },
          recipient: { id: conversationWith, name: conversationWith },
          channelData: {
            messaging_type: 'MESSAGE_TAG',
            tag: 'ACCOUNT_UPDATE',
            sender: { id: conversationWith },
          },
        },
      };
      await resetUserContextProperties(controller, recipientBot, messageRef);
    }

    message.value = undefined;
  }

  return;
};

module.exports = {
  getUserContextProperties,
  resetUserContextProperties,
};
