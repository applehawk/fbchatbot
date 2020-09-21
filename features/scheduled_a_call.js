'use strict';

module.exports = async (controller) => {
  const SCHEDULED_A_CALL_ID = 'SCHEDULED_A_CALL_ID';
  const dialog = controller.dialogSet.dialogs[SCHEDULED_A_CALL_ID];

  await dialog.addQuestion(
    {
      text: 'Have you already schedule a call?',
      quick_replies: [
        {
          title: 'Yes',
          payload: 'Yes',
        },
        {
          title: 'Partner don’t answer',
          payload: 'Partner don’t answer',
        },
        {
          title: 'I haven’t written yet',
          payload: 'I haven’t written yet',
        },
      ],
    },
    [
      {
        default: false,
        pattern: 'Yes',
        handler: async (response, convo, bot, message) => {
          if (
            response === 'getstarted_payload' ||
            message.text === 'getstarted_payload'
          ) {
            Object.assign(convo.vars, message);
            await convo.stop();
          } else {
            /**
             * @TODO Ping to partner
             */
            controller
              .trigger(['sender_action_typing'], bot, {
                options: { recipient: message.recipient },
              })
              .then(async () => {
                await bot.say({
                  text: 'Great! Have a good conversation!',
                });
              });
            /**
             * @TODO Scheduled a call after 12 hours
             */
            Object.assign(convo.vars, message);
            await convo.stop();
          }
        },
      },
      {
        default: false,
        pattern: 'Partner don’t answer',
        handler: async (response, convo, bot, message) => {
          if (
            response === 'getstarted_payload' ||
            message.text === 'getstarted_payload'
          ) {
            Object.assign(convo.vars, message);
            await convo.stop();
          } else {
            /**
             * @TODO Ping to partner
             */
            controller
              .trigger(['sender_action_typing'], bot, {
                options: { recipient: message.recipient },
              })
              .then(async () => {
                controller.trigger(['repeat_match'], bot, message);
                await bot.say({
                  text: 'Don’t worry! We will send you another partner today!',
                });
              });
            Object.assign(convo.vars, message);
            await convo.stop();
          }
        },
      },
      {
        default: false,
        pattern: 'I haven’t written',
        handler: async (response, convo, bot, message) => {
          if (
            response === 'getstarted_payload' ||
            message.text === 'getstarted_payload'
          ) {
            Object.assign(convo.vars, message);
            await convo.stop();
          } else {
            /**
             * @TODO Ping to partner
             */
            controller
              .trigger(['sender_action_typing'], bot, {
                options: { recipient: message.recipient },
              })
              .then(async () => {
                await bot.say({
                  text: 'Don’t wait! Your partner is waiting for you!',
                });
              });
            /**
             * @TODO Scheduled a call after 12 hours
             */
            Object.assign(convo.vars, message);
            await convo.stop();
          }
        },
      },
      {
        default: true,
        handler: async (response, convo, bot, message) => {
          controller
            .trigger(['sender_action_typing'], bot, {
              options: { recipient: message.recipient },
            })
            .then(async () => {
              await convo.repeat();
            });
        },
      },
    ],
    { key: 'already_scheduled_a_call' }
  );

  await dialog.after(async (results, bot) => {
    try {
      if (results.text === 'getstarted_payload') {
        await controller.trigger(['start'], bot, results);
        return;
      }
    } catch (error) {
      console.error('[dialog_scheduled_a_call.js:142 ERROR]:', error);
    }
  });

  // const buttons = [
  //   'I have not written to the partner yet',
  //   'Got contacted, but haven\'t yet agreed the time for the call',
  //   'Everything OK. We had scheduled to the call',
  //   'I have already talked',
  //   'The Parnter doesn\'t answer / I want to change the Partner'
  // ];
  const buttons = [
    'Yes I do',
    'No'
  ];

  const appreciateDialogue = ['1', '2', '3', '4', '5'];

  const problemWithPartner = [
    'He didn\'t answer',
    'Not interesting for me',
    'We have already known each other'
  ];

  const getItems = (dict) => {
    const items = [];
    Object.keys(dict).forEach((key, i) => {
      items.push({
        // payload: i + 1,
        // title: i + 1,
        // type: 'postback', // [dev]
        payload: i + 1,
        title: dict[key],
      });
    });
    return items;
  };

  const formatButtons = (dict) => {
    const result = [];
    Object.values(dict).forEach((item, i) => {
      result.push(`${i + 1}. ${item}`);
    });
    return result.join('\n');
  };

  // await dialog.addQuestion({
  //   // text: `Hi! 👋\nHow are you? Have you scheduled a call?\n\n${formatButtons(buttons)}`,
  //   text: `Hi! 👋\nHow are you? Have you already had a call with your partner?`,
  //   quick_replies: [ ...getItems(buttons) ],
  //   // // text: `Hi! 👋\nHow are you? Have you scheduled a call?`,
  //   // recipient: { id: '{{{message.sender}}}' },
  //   // attachment: {
  //   //   type: 'template',
  //   //   payload:{
  //   //     template_type: 'generic',
  //   //     elements: [{
  //   //       title: `Hi! 👋\nHow are you? Have you scheduled a call?`,
  //   //       // image_url: `https://picsum.photos/300/200/?random=${i + 10}`,
  //   //       // subtitle: 'We have the right hat for everyone.',
  //   //       buttons: [ ...getItems(buttons) ],
  //   //     }],
  //   //   }
  //   // }
  // }, [
  //   {
  //     default: true,
  //     handler: async (response, convo, bot, message) => {
  //       controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //       await convo.repeat();
  //     },
  //   },
  //   {
  //     default: false,
  //     // pattern: '1',
  //     pattern: 'No',
  //     handler: async (response, convo, bot, message) => {
  //       if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
  //         Object.assign(convo.vars, message);
  //         await convo.stop();
  //       } else {
  //         // Object.assign(convo.vars, message); // [*]
  //         // // const regexp = new RegExp(/^(https?):\/\/(www\.)?(facebook\.com)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i);
  //         // if (!!buttons[response - 1]) {
  //           message.text = response;
  //           message.value = 'Scheduled a call';
  //           await controller.trigger(['ANALYTICS_EVENT'], bot, message);

  //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });

  //         //   // [PING DIALOG]
  //         //   await dialog.ask({
  //         //     text: 'Hey, what\'s happened? 🙂 Let\'s do it right now!\n\nClick the button below and I will send notification to your partner that you want to schedule a call.',
  //         //     quick_replies: [{
  //         //       title: 'Ping to Partner',
  //         //       payload: 'ping',
  //         //     }],
  //         //   }, async (response, convo, bot, message) => {
  //         //       console.log('ping to partner');
  //         //       if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
  //         //         Object.assign(convo.vars, message);
  //         //         await convo.stop();
  //         //       } else {
  //         //         if (!!response.match('Ping to Partner')) {
  //         //           /**
  //         //            * @TODO Ping to partner
  //         //            */
  //         //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //         //           await bot.say({
  //         //             text: 'Well, soon your partner receives a notification and contact you.'
  //         //           });
  //         //           /**
  //         //            * @TODO Scheduled a call after 12 hours
  //         //            */
  //         //           Object.assign(convo.vars, message);
  //         //           await convo.stop();
  //         //         } else {
  //         //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //         //           await convo.repeat();
  //         //         }
  //         //       }
  //         //   }, { key: 'ping' });

  //           await dialog.addQuestion(
  //             {
  //               text: 'Have you already schedule a call?',
  //               quick_replies: [
  //                 {
  //                   title: 'Yes',
  //                   payload: 'Yes',
  //                 },
  //                 {
  //                   title: 'Partner don’t answer',
  //                   payload: 'Partner don’t answer',
  //                 },
  //                 {
  //                   title: 'I haven’t written yet',
  //                   payload: 'I haven’t written yet',
  //                 },
  //               ],
  //             },
  //             [
  //               {
  //                 default: false,
  //                 pattern: 'Yes',
  //                 handler: async (response, convo, bot, message) => {
  //                   if (
  //                     response === 'getstarted_payload' ||
  //                     message.text === 'getstarted_payload'
  //                   ) {
  //                     Object.assign(convo.vars, message);
  //                     await convo.stop();
  //                   } else {
  //                     /**
  //                      * @TODO Ping to partner
  //                      */
  //                     controller.trigger(['sender_action_typing'], bot, {
  //                       options: { recipient: message.sender },
  //                     });
  //                     await bot.say({
  //                       text: 'Great! Have a good conversation!',
  //                     });
  //                     /**
  //                      * @TODO Scheduled a call after 12 hours
  //                      */
  //                     Object.assign(convo.vars, message);
  //                     await convo.stop();
  //                   }
  //                 },
  //               },
  //               {
  //                 default: false,
  //                 pattern: 'Partner don’t answer',
  //                 handler: async (response, convo, bot, message) => {
  //                   if (
  //                     response === 'getstarted_payload' ||
  //                     message.text === 'getstarted_payload'
  //                   ) {
  //                     Object.assign(convo.vars, message);
  //                     await convo.stop();
  //                   } else {
  //                     /**
  //                      * @TODO Ping to partner
  //                      */
  //                     controller.trigger(['sender_action_typing'], bot, {
  //                       options: { recipient: message.sender },
  //                     });
  //                     controller.trigger(['repeat_match'], bot, message);
  //                     await bot.say({
  //                       text: 'Don’t worry! We will send you another partner today!',
  //                     });
  //                     Object.assign(convo.vars, message);
  //                     await convo.stop();
  //                   }
  //                 },
  //               },
  //               {
  //                 default: false,
  //                 pattern: 'I haven’t written',
  //                 handler: async (response, convo, bot, message) => {
  //                   if (
  //                     response === 'getstarted_payload' ||
  //                     message.text === 'getstarted_payload'
  //                   ) {
  //                     Object.assign(convo.vars, message);
  //                     await convo.stop();
  //                   } else {
  //                     /**
  //                      * @TODO Ping to partner
  //                      */
  //                     controller.trigger(['sender_action_typing'], bot, {
  //                       options: { recipient: message.sender },
  //                     });
  //                     await bot.say({
  //                       text: 'Don’t wait! Your partner is waiting for you!',
  //                     });
  //                     /**
  //                      * @TODO Scheduled a call after 12 hours
  //                      */
  //                     Object.assign(convo.vars, message);
  //                     await convo.stop();
  //                   }
  //                 },
  //               },
  //               {
  //                 default: true,
  //                 handler: async (response, convo, bot, message) => {
  //                   controller.trigger(['sender_action_typing'], bot, {
  //                     options: { recipient: message.sender },
  //                   });
  //                   await convo.repeat();
  //                 },
  //               },
  //             ],
  //             { key: 'already_scheduled_a_call' }
  //           );

  //         // } else {
  //         //   controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //         //   await convo.repeat();
  //         // }
  //       }
  //     },
  //   },
  //   {
  //     default: false,
  //     // pattern: '2',
  //     pattern: 'Yes I do',
  //     handler: async (response, convo, bot, message) => {
  //       if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
  //         Object.assign(convo.vars, message);
  //         await convo.stop();
  //       } else {
  //         // if (!!buttons[response - 1]) {
  //         //   message.text = buttons[response - 1];
  //           message.value = 'Scheduled a call';
  //           await controller.trigger(['ANALYTICS_EVENT'], bot, message);
  //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //           // await bot.say({
  //           //   text: 'Okey dokey! Use https://worldtimebuddy.com for matching the time for the call (your parnter might have another timezone)'
  //           // });
  //           await bot.say({
  //             text: 'Great!',
  //           });
  //           Object.assign(convo.vars, message);
  //           await convo.stop();
  //         // } else {
  //         //   controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //         //   await convo.repeat();
  //         // }
  //       }
  //     },
  //   }/*,
  //   {
  //     default: false,
  //     pattern: '3',
  //     handler: async (response, convo, bot, message) => {
  //       if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
  //         Object.assign(convo.vars, message);
  //         await convo.stop();
  //       } else {
  //         if (!!buttons[response - 1]) {
  //           Object.assign(convo.vars, message);
  //           message.text = buttons[response - 1];
  //           message.value = 'Scheduled a call';
  //           await controller.trigger(['ANALYTICS_EVENT'], bot, message);
  //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //           await bot.say({
  //             text: 'OK. Have a productive conversation! 😉'
  //           });
  //           await convo.stop();
  //         } else {
  //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //           await convo.repeat();
  //         }
  //       }
  //     },
  //   },
  //   {
  //     default: false,
  //     pattern: '4',
  //     handler: async (response, convo, bot, message) => {
  //       if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
  //         Object.assign(convo.vars, message);
  //         await convo.stop();
  //       } else {
  //         if (!!buttons[response - 1]) {
  //           message.text = buttons[response - 1];
  //           message.value = 'Scheduled a call';
  //           await controller.trigger(['ANALYTICS_EVENT'], bot, message);
  //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });

  //           // [APPRECIATE DIALOG]
  //           await dialog.ask({
  //             text: 'Great! How do you appreciate your dialogue?',
  //             quick_replies: [ ...getItems(appreciateDialogue) ],
  //           }, async (response, convo, bot, message) => {
  //             if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
  //               Object.assign(convo.vars, message);
  //               await convo.stop();
  //             } else {
  //               if (Object.values(appreciateDialogue).includes(response)) {
  //                 Object.assign(convo.vars, message);
  //                 message.value = 'Appreciate your dialogue';
  //                 await controller.trigger(['ANALYTICS_EVENT'], bot, message);
  //                 await convo.stop();
  //               } else {
  //                 controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //                 await convo.repeat();
  //               }
  //             }
  //           }, { key: 'appreciate_dialog' });

  //         } else {
  //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //           await convo.repeat();
  //         }
  //       }
  //     },
  //   },
  //   {
  //     default: false,
  //     pattern: '5',
  //     handler: async (response, convo, bot, message) => {
  //       if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
  //         Object.assign(convo.vars, message);
  //         await convo.stop();
  //       } else {
  //         if (!!buttons[response - 1]) {
  //           message.text = buttons[response - 1];
  //           message.value = 'Scheduled a call';
  //           await controller.trigger(['ANALYTICS_EVENT'], bot, message);

  //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //           await bot.say({
  //             text: 'Ok. Give us some time and we will send you a new contact.',
  //           });

  //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });

  //           // [PROBLEM DIALOG]
  //           await dialog.ask({
  //             text: `What is the problem with the previous partner?\n\nPlease help improve our algorithm.\n\n${formatButtons(problemWithPartner)}\n\n(If your option is not there, send it by message)`,
  //             quick_replies: [ ...getItems(problemWithPartner) ],
  //           }, async (response, convo, bot, message) => {
  //             if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
  //               Object.assign(convo.vars, message);
  //               await convo.stop();
  //             } else {
  //               Object.assign(convo.vars, message);
  //               message.text = !!problemWithPartner[response - 1] ? problemWithPartner[response - 1] : response;
  //               message.value = 'Problem with partner';
  //               await controller.trigger(['ANALYTICS_EVENT'], bot, message);

  //               controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //               await bot.say({
  //                 text: 'Thanks. We\'ll keep it on mind',
  //               });
  //               await convo.stop();
  //             }
  //           }, { key: 'problem_with_partner' });

  //         } else {
  //           controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
  //           await convo.repeat();
  //         }
  //       }
  //     },
  //   }*/
  // ], { key: 'scheduled_a_call' });

  // await dialog.after(async (results, bot) => { // [OK]
  //   try {
  //     if (results.text === 'getstarted_payload') {
  //       await controller.trigger(['start'], bot, results);
  //       return;
  //     }
  //   } catch(error) {
  //     console.error('[scheduled_a_call.js:277 ERROR]:', error);
  //   };
  // });
};
