'use strict';

const { BotkitConversation } = require('botkit');
const { UserState } = require('botbuilder');

const { communityDict, englishLevelDict, INVITATION_MESSAGE } = require('../constants.js');

module.exports = async (controller) => {
  controller.hears(new RegExp(/^(start2)\s+?(\d+)$/i), ['message', 'direct_message', 'facebook_postback', 'messaging_postback'], async (bot, message) => {
  // controller.on([new RegExp(/^(start2)\s+?(\d+)$/i), 'message', 'direct_message', 'facebook_postback'], async (bot, message) => {
    // [TODO] Add check user exists
    const recipient = { id: message.matches[2] };

    // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
    // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
    await bot.changeContext(message.reference);

    const userState = new UserState(controller.storage);

    let context = bot.getConfig('context');

    const readyToConversationProperty = await userState.createProperty('ready_to_conversation');
    const readyToConversation = await readyToConversationProperty.get(context);

    if (bot.hasActiveDialog() || readyToConversation === 'busy') {
      return;
    }

    try {
      // #BEGIN Bot typing
      await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

      const dialog = new BotkitConversation(recipient.id, controller);

      // [*][?]
      await dialog.addQuestion({ // [OK]
        text: 'Do you want to start a dialogue with user?',
        quick_replies: [{
          // content_type: 'text',
          title: 'No',
          payload: 'no',
        }, {
          // content_type: 'text',
          title: 'Yes',
          payload: 'yes',
        }],
      }, [
        {
          default: true,
          pattern: 'no',
          handler: async (answerText, convo, bot, message) => {
            try {
              console.log(`start a dialogue with user: ${answerText}`);
              await convo.stop();
            } catch(error) {
              console.error(error);
              await convo.stop();
            }
          },
        },
        {
          pattern: 'yes',
          handler: async (answerText, convo, bot, message) => { // [OK]
            try {
              clearTimeout(message.value);
              message.value = null;
              // #BEGIN Bot typing
              await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });

              console.log(`start a dialogue with user: ${answerText}`);

              // await dialog.ask({ // [OK]
              //   text: INVITATION_MESSAGE,
              // }, async (answerText, convo, bot, message) => {
                try {
                  const conversationWithProperty = await userState.createProperty('conversation_with');
                  const expiredAtProperty = await userState.createProperty('expired_at');

                  await readyToConversationProperty.set(context, 'busy');
                  await conversationWithProperty.set(context, recipient.id);
                  await expiredAtProperty.set(context, Date.now() + 300000); // 5 min

                  // Save userState changes to storage
                  await userState.saveChanges(context);

                  const dialogBot = await controller.spawn(message.sender.id);
                  await dialogBot.changeContext(message.reference);
                  await dialogBot.startConversationWithUser(recipient.id);

                  const text = `Hello!\n\nMy name is Dmitry and I'm a web developer.\nI would like to chat with you. Can we start a conversation?`;
                  // const { text } = message;

                  if (!!text) {
                    // #BEGIN Bot typing
                    // await controller.trigger(['sender_action_typing'], bot, { options: { recipient } });
                    await controller.trigger(['sender_action_typing'], dialogBot, { options: { recipient } });

                    // const options = {
                    //   recipient,
                    //   message: {
                    //     attachment: {
                    //       type: 'template',
                    //       payload: {
                    //         template_type: 'one_time_notif_req',
                    //         title: message.sender.id,
                    //         payload: text,
                    //       },
                    //     },
                    //   },
                    //   sender: message.sender,
                    // };

                    // // [Tip][!] You need one time notification permission for this message.
                    // // [Tip][!] To get that go to Advanced Messaging under your Page Settings to request the permission.
                    // // [Tip] https://developers.facebook.com/docs/messenger-platform/send-messages/one-time-notification
                    // const notify = await dialogBot.api.callAPI('/me/messages', 'POST', options);

                    await dialogBot.say({
                      recipient,
                      text,
                      sender: message.sender,
                    });

                  }
                  convo.stop();

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
                  console.error(error);
                  await convo.stop();
                }
              // }, { key: 'confirmation' });
            } catch(error) {
              console.error(error);
              await convo.stop();
            }
          },
        }
      ], { key: 'message' });

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
      console.error(`[ERROR]: ${error}`);
      await bot.cancelAllDialogs();
    }
  });
};
