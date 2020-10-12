'use strict';

const { UserState } = require('botbuilder');
const { USER_DIALOG_SESSION_EXPIRED } = require('./constants');

const getUserContextProperties = async (controller, bot, message) => { // [OK]
  let userState = new UserState(controller.storage);

  let context = bot.getConfig('context');

  // /**
  //  * Get user info
  //  */
  // let info = await userState.load(context); // [OK]

  let about_yourself_property = await userState.createProperty('about_yourself');
  let community_property = await userState.createProperty('community');
  let conversation_with_property = await userState.createProperty('conversation_with');
  let english_level_property = await userState.createProperty('english_level');
  let expired_at_property = await userState.createProperty('expired_at');
  let facebook_url_property = await userState.createProperty('facebook_url');
  let location_property = await userState.createProperty('location');
  let new_user_property = await userState.createProperty('new_user');
  let profession_property = await userState.createProperty('profession');
  let profile_pic_property = await userState.createProperty('profile_pic');
  let ready_to_conversation_property = await userState.createProperty('ready_to_conversation');
  let recent_users_property = await userState.createProperty('recent_users');
  let skip_property = await userState.createProperty('skip');
  let username_property = await userState.createProperty('username');

  let about_yourself = await about_yourself_property.get(context);
  let community = await community_property.get(context);
  let conversation_with = await conversation_with_property.get(context);
  let english_level = await english_level_property.get(context);
  let expired_at = await expired_at_property.get(context);
  let facebook_url = await facebook_url_property.get(context);
  let location = await location_property.get(context);
  let new_user = await new_user_property.get(context);
  let profession = await profession_property.get(context);
  let profile_pic = await profile_pic_property.get(context);
  let ready_to_conversation = await ready_to_conversation_property.get(context);
  let recent_users = await recent_users_property.get(context, []);
  let skip = await skip_property.get(context);
  let username = await username_property.get(context);

  return {
    context,
    userState,

    about_yourself_property,
    community_property,
    conversation_with_property,
    english_level_property,
    expired_at_property,
    facebook_url_property,
    location_property,
    new_user_property,
    profession_property,
    profile_pic_property,
    ready_to_conversation_property,
    recent_users_property,
    skip_property,
    username_property,

    about_yourself,
    community,
    conversation_with,
    english_level,
    expired_at,
    facebook_url,
    location,
    new_user,
    profession,
    profile_pic,
    ready_to_conversation,
    recent_users,
    skip,
    username,
  };

  // const properties = [
  //   'about_yourself',
  //   'community',
  //   'conversation_with',
  //   'english_level',
  //   'expired_at',
  //   'facebook_url',
  //   'location',
  //   'new_user',
  //   'profession',
  //   'profile_pic',
  //   'ready_to_conversation',
  //   'recent_users',
  //   'skip',
  //   'username'
  // ];

  // const data = [ context, userState ];

  // for (const value of properties) {
  //   const property = `${value}_property`;
  //   data[property] = await userState.createProperty(`${value}`);
  //   data[value] = await data[property].get(context);
  // }

  // return data;
};

const resetUserContextProperties = async (controller, bot, message) => { // [OK]
  // const senderBot = await controller.spawn(message.sender.id);
  // const userId = `facebook/conversations/${message.sender.id}-${message.sender.id}/`;
  // await controller.storage.delete([userId]);
  // await senderBot.cancelAllDialogs();
  // await senderBot.startConversationWithUser(message.sender.id);

  // await controller.trigger(['delete_menu'], senderBot, message.sender);

  // let senderProperties = await getUserContextProperties(controller, senderBot, message);
  // const senderBot = await controller.spawn(message.sender.id);
  const userId = `facebook/conversations/${message.sender.id}-${message.sender.id}/`;
  await controller.storage.delete([userId]);
  await bot.cancelAllDialogs();
  await bot.startConversationWithUser(message.sender.id);

  await controller.trigger(['delete_menu'], bot, message.sender);

  let senderProperties = await getUserContextProperties(controller, bot, message);

  // if (!!senderProperties.conversation_with) {
    const conversation_with = senderProperties.conversation_with;

    await senderProperties.conversation_with_property.set(senderProperties.context, 0);
    await senderProperties.expired_at_property.set(senderProperties.context, 0);
    await senderProperties.ready_to_conversation_property.set(senderProperties.context, 'ready');
    await senderProperties.skip_property.delete(senderProperties.context);

    /**
     * Save userState changes to storage
     */
    await senderProperties.userState.saveChanges(senderProperties.context);

    console.log(`[helpers.js:142 reset]: ${message.sender.id} >>> ${conversation_with} session cleared`);

    // /**
    //  * #BEGIN Bot typing
    //  */
    // controller.trigger(['sender_action_typing'], senderBot, { options: { recipient: message.sender } });

    // await senderBot.say({ // [OK]
    //   recipient: message.sender,
    //   text: USER_DIALOG_SESSION_EXPIRED,
    //   messaging_type: 'MESSAGE_TAG',
    //   tag: 'ACCOUNT_UPDATE',
    // });

    if (!!conversation_with) {
      const recipientBot = await controller.spawn(conversation_with);
      await recipientBot.startConversationWithUser(conversation_with);
      const messageRef = {
        ...message,
        channel: conversation_with,
        messaging_type: 'MESSAGE_TAG',
        recipient: { id: conversation_with },
        sender: { id: conversation_with },
        tag: 'ACCOUNT_UPDATE',
        user: conversation_with,
        value: undefined,
        reference: {
          ...message.reference,
          user: { id: conversation_with, name: conversation_with },
          conversation: { id: conversation_with },
        },
        incoming_message: {
          channelId: 'facebook',
          conversation: { id: conversation_with },
          from: { id: conversation_with, name: conversation_with },
          recipient: { id: conversation_with, name: conversation_with },
          channelData: {
            messaging_type: 'MESSAGE_TAG',
            tag: 'ACCOUNT_UPDATE',
            sender: { id: conversation_with },
          },
        },
      };
      await resetUserContextProperties(controller, recipientBot, messageRef);
    }

    message.value = undefined;
  // }

  senderProperties = null;

  return;
};

module.exports = {
  getUserContextProperties,
  resetUserContextProperties,
};
