'use strict';

const { BotkitConversation } = require('botkit');
const { UserState } = require('botbuilder');

const { communityDict, englishLevelDict, INVITATION_MESSAGE } = require('../constants.js');

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

  controller.on(['start_dialog'], async (bot, message) => {
    /**
     * @TODO Add check user exists
     */
    const recipient = message.recipient;

    const senderProperties = await getUserContextProperties(bot, message);

    // if (bot.hasActiveDialog() || readyToConversation === 'busy') {
    //   return;
    // }

    try {
      /**
       * #BEGIN Bot typing
       */
      await controller.trigger(['sender_action_typing'], bot, { options: { recipient: { id: message.sender.id } } });

      const dialog = new BotkitConversation(recipient.id, controller);

      // await dialog.addQuestion({ // [OK]
      //   text: 'Do you want to start a dialogue with user?',
      //   quick_replies: [{
      //   //   // content_type: 'text',
      //   //   title: 'No',
      //   //   payload: 'no',
      //   // }, {
      //     // content_type: 'text',
      //     title: 'Write to partner',
      //     payload: 'yes',
      //   }],
      // }, [
      //   {
      //     default: true,
      //     // pattern: 'no',
      //     handler: async (answerText, convo, bot, message) => {
      //       try {
      //         console.log(`start a dialogue with user: ${answerText}`);
      //         await convo.stop();
      //       } catch(error) {
      //         console.error('[start_dialog.js:63 ERROR]', error);
      //         await convo.stop();
      //       }
      //     },
      //   },
      //   {
      //     pattern: 'yes',
      //     handler: async (answerText, convo, bot, message) => { // [OK]
      //       try {
      //         clearTimeout(message.value);
      //         message.value = null;
      //         /**
      //          * #BEGIN Bot typing
      //          */
      //         // await controller.trigger(['sender_action_typing'], bot, { options: { recipient: { id: message.sender.id } } });

              // console.log(`start a dialogue with user: ${answerText}`);

              await dialog.ask({ // [OK]
                text: 'Do not delay communication!\n\nText your partner on Facebook. Don\'t procrastinate, it will be better if you are scheduling the meeting immediately 🙂\n\nUse https://worldtimebuddy.com for matching the time for the call (your parnter might have another timezone)',
                quick_replies: [{
                  title: 'Write to partner',
                  payload: 'yes',
                }],
              }, async (answerText, convo, bot, message) => {
                try {
                  Object.assign(convo.vars, message);
                  if (message.text === 'Write to partner') {
                    /**
                     * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
                     * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
                     */
                    await bot.changeContext(message.reference);

                    /**
                     * Set sender properties
                     */
                    await senderProperties.readyToConversationProperty.set(senderProperties.context, 'busy');
                    await senderProperties.conversationWithProperty.set(senderProperties.context, recipient.id);
                    await senderProperties.expiredAtProperty.set(senderProperties.context, (Date.now() + (1000 * 60 * 60 * 24 * 2))); // 2 days

                    /**
                     * Save recipientProperties changes to storage
                     */
                    await senderProperties.userState.saveChanges(senderProperties.context);

                    /**
                     * Creat menu for sender
                     */
                    let payload = {
                      recipient: message.sender,
                      call_to_actions: [{
                        type: 'postback',
                        title: '❌ End a conversation',
                        payload: `reset ${recipient.id}`,
                      }],
                    };

                    await controller.trigger(['create_menu'], bot, payload);

                    const dialogBot = await controller.spawn(message.sender.id);
                    await dialogBot.startConversationWithUser(recipient.id);

                    /**
                     * Set recipient properties
                     */
                    const recipientProperties = await getUserContextProperties(dialogBot, message);

                    await recipientProperties.readyToConversationProperty.set(recipientProperties.context, 'busy');
                    await recipientProperties.conversationWithProperty.set(recipientProperties.context, message.sender.id);

                    /**
                     * Save recipientProperties changes to storage
                     */
                    await recipientProperties.userState.saveChanges(recipientProperties.context);

                    /**
                     * Create menu for recipient
                     */
                    payload = {
                      recipient: recipient,
                      call_to_actions: [{
                        type: 'postback',
                        title: '❌ End a conversation',
                        payload: `reset ${message.sender.id}`,
                      }],
                    };

                    await controller.trigger(['create_menu'], bot, payload);
                    payload = null;

                    /**
                     * #BEGIN Bot typing
                     */
                    await controller.trigger(['sender_action_typing'], dialogBot, { options: { recipient } });

                    /**
                     * Sending information about yourself to parnter
                     */
                    message.recipient = recipient;
                    await controller.trigger(['get_info'], bot, message);

                    /**
                     * #BEGIN Bot typing
                     */
                    await controller.trigger(['sender_action_typing'], dialogBot, { options: { recipient } });

                    message.text = 'Do not delay communication!\n\nText your partner on Facebook. Don\'t procrastinate, it will be better if you are scheduling the meeting immediately 🙂\n\nUse https://worldtimebuddy.com for matching the time for the call (your parnter might have another timezone)';

                    await dialogBot.say({
                      recipient,
                      text: message.text,
                      sender: message.sender,
                    });

                    await convo.stop();
                  }

                  // await bot.cancelAllDialogs();

                  // const context = dialogBot.getConfig('context');
                  // const userState = new UserState(controller.storage);

                  // // Get User State Properties
                  // const { channelId } = message.incoming_message;
                  // const matchUser = await controller.storage.Collection.findOne({ _id: `${channelId}/users/${recipient.id}/` });

                  // if (!!matchUser) {
                  //     const personas = await bot.api.callAPI('/me/personas', 'GET'); // [OK]

                  //     if (Object.values(personas.data).length) {
                  //         console.log(personas.data[0]);
                  //         let count = 0;
                  //         Object.values(personas.data).forEach(persona => {
                  //             setTimeout(async () => {
                  //                 await bot.changeContext(message.reference);
                  //                 await bot.api.callAPI(persona.id, 'DELETE');
                  //             }, 1000);
                  //             count++;
                  //         });
                  //         console.log(`[PERSONAS]: ${count} deleted.`);
                  //     }

                  //     // let persona_id = null;

                  //     // Create a Persona
                  //     // if (!Object.values(personas.data).length) {
                  //         let { id: persona_id } = await bot.api.callAPI('/me/personas', 'POST', { // [OK]
                  //             recipient,
                  //             // dialog: recipient.id,
                  //             name: matchUser.state.username || 'User',
                  //             profile_picture_url: matchUser.state.profile_pic || 'https://picsum.photos/300/200/?random=1',
                  //         });
                  //         console.log('[persona] created:', persona_id);
                  //     // }

                  //     const personaOptions = {
                  //         recipient,
                  //         persona_id/*: !Object.values(personas.data).length ? persona_id : personas.data[0].id*/,
                  //     };

                  //     // Send text from Persona
                  //     await bot.api.callAPI('/me/messages', 'POST', {
                  //         ...personaOptions,
                  //         message: {
                  //             // text,
                  //             dynamic_text: {
                  //                 text,
                  //             },
                  //             // attachment: {
                  //             //     type: 'template',
                  //             //     payload: {
                  //             //         template_type: 'generic',
                  //             //         elements: [{
                  //             //             title: matchUser.state.username,
                  //             //             subtitle: `\n🗺 ${matchUser.state.location}\n💬 ${englishLevelDict[matchUser.state.english_level]}\n👔 ${communityDict[matchUser.state.community]}\n🛠 ${matchUser.state.profession}`,
                  //             //         }],
                  //             //     },
                  //             // },
                  //         },
                  //     });

                  await convo.stop();
                } catch(error) {
                  console.error('[start_dialog.js:275 ERROR]', error);
                  await convo.stop();
                }
              }, { key: 'confirmation' });
      //       } catch(error) {
      //         console.error('[start_dialog.js:203 ERROR]', error);
      //         await convo.stop();
      //       }
      //     },
      //   }
      // ], { key: 'message' });

      await dialog.after(async (results, bot) => {
        console.log('dialog after:', results);
        /**
         * Start matching
         */
        const senderProperties = await getUserContextProperties(bot, results);

        if (senderProperties.readyToConversation === 'ready') {
          results.value = undefined;
          await controller.trigger(['start_match'], bot, results);
        }
      });

      await controller.addDialog(dialog);

      await bot.replaceDialog(recipient.id);

      // const { storage } = controller;
      // const context = bot.getConfig('context');
      // // const activity = context._activity;
      // const userState = new UserState(storage);

      // // Get User State Properties
      // // const channelId = activity.channelId;
      // const { channelId } = message.incoming_message;
      // const matchUser = await storage.Collection.findOne({ _id: `${channelId}/users/${recipient.id}/` });

      // if (!!matchUser) {
      //     const personas = await bot.api.callAPI('/me/personas', 'GET'); // [OK]

      //     if (Object.values(personas.data).length) {
      //         console.log(personas.data[0]);
      //         let count = 0;
      //         Object.values(personas.data).forEach(persona => {
      //             setTimeout(async () => {
      //                 await bot.api.callAPI(persona.id, 'DELETE');
      //             }, 1000);
      //             count++;
      //         });
      //         console.log(`[PERSONAS]: ${count} deleted.`);
      //     }

      //     // let persona_id = null;

      //     // Create a Persona
      //     // if (!Object.values(personas.data).length) {
      //         let { id: persona_id } = await bot.api.callAPI('/me/personas', 'POST', { // [OK]
      //             recipient,
      //             // dialog: recipient.id,
      //             name: matchUser.state.username || 'User',
      //             profile_picture_url: matchUser.state.profile_pic || 'https://picsum.photos/200/200/?random=1',
      //         });
      //         console.log('[persona] created:', persona_id);
      //     // }

      //     const personaOptions = {
      //         recipient,
      //         persona_id/*: !Object.values(personas.data).length ? persona_id : personas.data[0].id*/,
      //     };

      //     // #BEGIN Bot typing
      //     await typing({ bot, options: { ...personaOptions } });

      //     // Send text from Persona
      //     await bot.api.callAPI('/me/messages', 'POST', {
      //         ...personaOptions,
      //         message: {
      //             // text,
      //             dynamic_text: {
      //                 text,
      //             },
      //             // attachment: {
      //             //     type: 'template',
      //             //     payload: {
      //             //         template_type: 'generic',
      //             //         elements: [{
      //             //             title: matchUser.state.username,
      //             //             subtitle: `\n🗺 ${matchUser.state.location}\n💬 ${englishLevelDict[matchUser.state.english_level]}\n👔 ${communityDict[matchUser.state.community]}\n🛠 ${matchUser.state.profession}`,
      //             //         }],
      //             //     },
      //             // },
      //         },
      //     });

      //     // #END Bot typing
      //     await typing({ bot, options: { ...personaOptions }, mode: false });
      // } else {
      //     // #BEGIN Bot typing
      //     await typing({ bot, options: { recipient: message.sender } });

      //     await bot.say('Sorry, but user not found.');

      //     // #END Bot typing
      //     await typing({ bot, options: { recipient: message.sender }, mode: false });
      // }
    } catch(error) {
      console.error('[start_dialog.js:383 ERROR]', error);
      await bot.cancelAllDialogs();
    }
  });
};
