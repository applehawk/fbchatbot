'use strict';

const { UserState } = require('botbuilder');

const { USER_DIALOG_SESSION_EXPIRED } = require('../constants.js');

module.exports = async (controller) => {
  let sessionTimerId = 0;

  const getUsersConvoWithProperties = async (bot, message) => { // [OK]
    // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
    // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
    await bot.changeContext(message.reference);

    const userState = new UserState(controller.storage);
    let context = bot.getConfig('context');

    const conversationWithProperty = await userState.createProperty('conversation_with');
    const expiredAtProperty = await userState.createProperty('expired_at');
    const readyToConversationProperty = await userState.createProperty('ready_to_conversation');

    const conversationWith = await conversationWithProperty.get(context);
    const expiredAt = await expiredAtProperty.get(context);
    const readyToConversation = await readyToConversationProperty.get(context);

    return {
      context,
      conversationWith,
      conversationWithProperty,
      expiredAt,
      expiredAtProperty,
      readyToConversation,
      readyToConversationProperty,
      userState,
    };
  };

  const resetUsersConvoWithProperties = async (bot, message) => { // [OK]
    let {
      context,
      conversationWithProperty,
      expiredAtProperty,
      readyToConversationProperty,
      userState,
    } = await getUsersConvoWithProperties(bot, message);

    await conversationWithProperty.set(context, 0);
    await expiredAtProperty.set(context, 0);
    await readyToConversationProperty.set(context, 'ready');

    // Save userState changes to storage
    const result = await userState.saveChanges(context);
    await controller.trigger(['start_match'], bot, message);
    return result;
  };

  controller.on(['message', 'facebook_postback', 'direct_message', 'messaging_postback'], async (bot, message) => {
    const recipient = {
      id: message.sender.id,
    };

    console.log(`[${message.type}]:`, message);

    // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
    // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
    await bot.changeContext(message.reference);
    await controller.trigger(['ANALYTICS_EVENT'], bot, message);

    await bot.api.callAPI('/me/messages', 'POST', {
      recipient,
      sender_action: 'mark_seen',
    });

    let {
      context,
      conversationWith,
      conversationWithProperty,
      expiredAt,
      expiredAtProperty,
      readyToConversation,
      readyToConversationProperty,
      userState,
    } = await getUsersConvoWithProperties(bot, message);

    if (readyToConversation === 'ready' && message.sender.id !== message.user) { // [OK][?]
    // if (message.sender.id !== message.reference.bot) { // [OK][SELF]
    // if (readyToConversation === 'ready') { // [OK][*]
      await readyToConversationProperty.set(context, 'busy');
      await conversationWithProperty.set(context, message.sender.id);
      await expiredAtProperty.set(context, message.timestamp + ((Date.now() + 300000) - message.timestamp)); // ~5 min

      conversationWith = await conversationWithProperty.get(context);
      expiredAt = await expiredAtProperty.get(context);
      readyToConversation = await readyToConversationProperty.get(context);

      console.log('[message.js:94 expiredAt]:', new Date(expiredAt).toLocaleString());

      // Save userState changes to storage
      await userState.saveChanges(context);
    }

    if (readyToConversation === 'busy' && conversationWith === message.sender.id && message.timestamp < expiredAt/* && bot.hasActiveDialog()*/) { // [OK]
      clearTimeout(message.value);
      message.value = null;

      const bot = await controller.spawn(message.sender.id); // [OK]
      await bot.changeContext(message.reference);
      await bot.startConversationWithUser(recipient.id/*3006475179445768*/);

      // #BEGIN Bot typing
      await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
      await bot.say({ // [OK]
        // channel: message.channel,
        // is_echo: true,
        text: `${message.text}\n\n[Session end at: ${new Date(expiredAt).toLocaleString()}]`,
      });
      // // #END Bot typing
      // await controller.trigger(['sender_action_typing'], bot, { options: { recipient }, mode: false });

      const end = expiredAt - Date.now();

      const sessionTimerFunc = async () => { // [OK]
        clearTimeout(sessionTimerId);
        sessionTimerId = null;
        if (readyToConversation === 'busy' && expiredAt > Date.now()) {
          console.log('session started');

          // Clear matching timer
          clearTimeout(message.value);
          message.value = null;

          sessionTimerId = setTimeout(async () => { // [OK][?]
            // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
            // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
            await bot.changeContext(message.reference);

            clearTimeout(sessionTimerId);
            sessionTimerId = null;

            // [TODO] Refactoring
            // #BEGIN Bot typing
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
            await bot.say(USER_DIALOG_SESSION_EXPIRED);
            // // #END Bot typing
            // await controller.trigger(['sender_action_typing'], bot, { options: { recipient }, mode: false });

            // Reset conversation status
            await resetUsersConvoWithProperties(bot, message);
          }, end);
        } else {
          console.log('session cleared');
          clearTimeout(sessionTimerId);
          sessionTimerId = null;
          await resetUsersConvoWithProperties(bot, message);
        }
      };

      if (sessionTimerId === 0) {
        sessionTimerFunc();
      }
    } else {
      if (readyToConversation === 'busy' && expiredAt < Date.now()) { // [OK]
        console.log('session cleared');
        // Reset conversation status
        await resetUsersConvoWithProperties(bot, message);

        // [TODO] Refactoring
        // #BEGIN Bot typing
        await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
        await bot.say(USER_DIALOG_SESSION_EXPIRED);
        // // #END Bot typing
        // await controller.trigger(['sender_action_typing'], bot, { options: { recipient }, mode: false });
      }
      await controller.trigger(['start_match'], bot, message);
    }
  });
};
