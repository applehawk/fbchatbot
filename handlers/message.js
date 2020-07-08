'use strict';

const { UserState } = require('botbuilder');

const { USER_DIALOG_SESSION_EXPIRED } = require('../constants.js');

module.exports = async (controller) => {
  // let sessionTimerId = 0;

  // const getUsersConvoWithProperties = async (bot, message) => { // [OK]
  //   /**
  //    * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
  //    * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
  //    */
  //   await bot.changeContext(message.reference);

  //   const userState = new UserState(controller.storage);
  //   let context = bot.getConfig('context');

  //   const conversationWithProperty = await userState.createProperty('conversation_with');
  //   const expiredAtProperty = await userState.createProperty('expired_at');
  //   const readyToConversationProperty = await userState.createProperty('ready_to_conversation');

  //   const conversationWith = await conversationWithProperty.get(context);
  //   const expiredAt = await expiredAtProperty.get(context);
  //   const readyToConversation = await readyToConversationProperty.get(context);

  //   return {
  //     context,
  //     conversationWith,
  //     conversationWithProperty,
  //     expiredAt,
  //     expiredAtProperty,
  //     readyToConversation,
  //     readyToConversationProperty,
  //     userState,
  //   };
  // };

  // const resetUsersConvoWithProperties = async (bot, message) => { // [OK]
  //   let {
  //     context,
  //     conversationWithProperty,
  //     expiredAtProperty,
  //     readyToConversationProperty,
  //     userState,
  //   } = await getUsersConvoWithProperties(bot, message);

  //   await conversationWithProperty.set(context, 0);
  //   await expiredAtProperty.set(context, 0);
  //   await readyToConversationProperty.set(context, 'ready');

  //   /**
  //    * Save userState changes to storage
  //    */
  //   const result = await userState.saveChanges(context);
  //   console.log('session cleared');

  //   if (process.env.NODE_ENV !== 'production') {
  //     // await controller.trigger(['start_match'], bot, message);
  //   }
  //   return result;
  // };

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

    // console.log(`[message.js:80 ${message.type}]:`, message);

    await controller.trigger(['ANALYTICS_EVENT'], bot, message);

    // let {
    //   context,
    //   conversationWith,
    //   conversationWithProperty,
    //   expiredAt,
    //   expiredAtProperty,
    //   readyToConversation,
    //   readyToConversationProperty,
    //   userState,
    // } = await getUsersConvoWithProperties(bot, message);

    // if (readyToConversation === 'ready' && message.sender.id !== message.user) { // [OK][?]
    //   await readyToConversationProperty.set(context, 'busy');
    //   await conversationWithProperty.set(context, message.sender.id);
    //   await expiredAtProperty.set(context, message.timestamp + ((Date.now() + 300000) - message.timestamp)); // ~5 min

    //   conversationWith = await conversationWithProperty.get(context);
    //   expiredAt = await expiredAtProperty.get(context);
    //   readyToConversation = await readyToConversationProperty.get(context);

    //   console.log('[message.js:104 expiredAt]:', new Date(expiredAt).toLocaleString());

    //   /**
    //    * Save userState changes to storage
    //    */
    //   await userState.saveChanges(context);
    // }

    // if (readyToConversation === 'busy' && conversationWith === message.sender.id && message.timestamp < expiredAt/* && bot.hasActiveDialog()*/) { // [OK]
    //   try {
    //     // clearTimeout(message.value);
    //     // message.value = null;

    //     // #BEGIN [-] Moved to bot.js
    //     // const dialogBot = await controller.spawn(message.sender.id); // [OK]
    //     // await dialogBot.changeContext(message.reference);
    //     // await dialogBot.startConversationWithUser(recipient.id);

    //     // /**
    //     //  * #BEGIN Bot typing
    //     //  */
    //     // await controller.trigger(['sender_action_typing'], dialogBot, { options: { recipient } });

    //     // await dialogBot.say({ // [OK]
    //     //   recipient,
    //     //   sender: message.user,
    //     //   text: `${message.text}\n\n[Session end at: ${new Date(expiredAt).toLocaleString()}]`,
    //     // });
    //     // #END [-] Moved to bot.js

    //     const end = expiredAt - Date.now();

    //     /**
    //      * @TODO Rewrite to async version with timers queue
    //      */
    //     const sessionTimerFunc = async () => { // [OK]
    //       clearTimeout(sessionTimerId);
    //       if (readyToConversation === 'busy' && expiredAt > Date.now()) {
    //         console.log('session started');

    //         /**
    //          * Clear matching timer
    //          */
    //         clearTimeout(message.value);

    //         sessionTimerId = setTimeout(async () => { // [OK][?]
    //           /**
    //            * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
    //            * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
    //            */
    //           await bot.changeContext(message.reference);

    //           clearTimeout(sessionTimerId);

    //           // [TODO] #BEGIN Refactoring
    //           /**
    //            * #BEGIN Bot typing
    //            */
    //           await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
    //           await bot.say(USER_DIALOG_SESSION_EXPIRED);

    //           /**
    //            * Reset conversation status
    //            */
    //           await resetUsersConvoWithProperties(bot, message);
    //         }, end);
    //       } else {
    //         console.log('session cleared');
    //         clearTimeout(sessionTimerId);
    //         await resetUsersConvoWithProperties(bot, message);
    //       }
    //     };

    //     if (sessionTimerId === 0) {
    //       sessionTimerFunc();
    //     }
    //   } catch(error) {
    //     console.error('[message.js:184 ERROR]:', error);
    //   }
    // } else {
    //   if (readyToConversation === 'busy' && expiredAt < Date.now()) { // [OK]
    //     console.log('session cleared');
    //     /**
    //      * Reset conversation status
    //      */
    //     await resetUsersConvoWithProperties(bot, message);

    //     // [TODO] #END Refactoring
    //     /**
    //      * #BEGIN Bot typing
    //      */
    //     await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
    //     await bot.say(USER_DIALOG_SESSION_EXPIRED);
    //   }
      // if (process.env.NODE_ENV === 'production') {
        await controller.trigger(['start_match'], bot, message);
      // }
    // }
  });
};
