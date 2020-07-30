'use strict';

module.exports = async (controller) => {
  const SCHEDULED_A_CALL_ID = 'SCHEDULED_A_CALL_ID';
  const dialog = controller.dialogSet.dialogs[SCHEDULED_A_CALL_ID];

  const buttons = [
    'I have not written to the partner yet',
    'Got contacted, but haven\'t yet agreed the time for the call',
    'Everything OK. We had scheduled to the call',
    'I have already talked',
    'The Parnter doesn\'t answer / I want to change the Partner'
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
        payload: i + 1,
        title: i + 1,
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

  /**
   * #BEGIN Scheduling Automation
   */
  const storage = controller._config.storage;

  await dialog.addQuestion({
    text: `Hi! 👋\nHow are you? Have you scheduled a call?\n\n${formatButtons(buttons)}`,
    quick_replies: [ ...getItems(buttons) ],
  }, [
    {
      default: true,
      handler: async (response, convo, bot, message) => {
        await convo.repeat();
      },
    },
    {
      default: false,
      pattern: '1',
      handler: async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
          Object.assign(convo.vars, message);
          await convo.stop();
        } else {
          // const regexp = new RegExp(/^(https?):\/\/(www\.)?(facebook\.com)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i);
          if (!!buttons[response - 1]) {
            message.text = buttons[response - 1];
            message.value = 'Scheduled a call';
            await controller.trigger(['ANALYTICS_EVENT'], bot, message);

            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });

            // [PING DIALOG]
            await dialog.ask({
              text: 'Hey, what\'s happened? 🙂 Let\'s do it right now!\n\nClick the button below and I will send notification to your partner that you want to schedule a call.',
              quick_replies: [{
                title: 'Ping to Partner',
                payload: 'ping',
              }],
            }, async (response, convo, bot, message) => {
                console.log('ping to partner');
                await controller.trigger(['mark_seen'], bot, message);
                if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
                  Object.assign(convo.vars, message);
                  await convo.stop();
                } else {
                  if (!!response.match('Ping to Partner')) {
                    Object.assign(convo.vars, message);
                    /**
                     * @TODO Ping to partner
                     */
                    await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                    await bot.say({
                      recipient: message.sender,
                      text: 'Well, soon your partner receives a notification and contact you.'
                    });
                    /**
                     * @TODO Scheduled a call after 12 hours
                     */
                    await convo.stop();
                  } else {
                    await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                    await convo.repeat();
                  }
                }
            }, { key: 'ping' });

          } else {
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await convo.repeat();
          }
        }
      },
    },
    {
      default: false,
      pattern: '2',
      handler: async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
          Object.assign(convo.vars, message);
          await convo.stop();
        } else {
          if (!!buttons[response - 1]) {
            Object.assign(convo.vars, message);
            message.text = buttons[response - 1];
            message.value = 'Scheduled a call';
            await controller.trigger(['ANALYTICS_EVENT'], bot, message);
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await bot.say({
              recipient: message.sender,
              text: 'Okey dokey! Use https://worldtimebuddy.com for matching the time for the call (your parnter might have another timezone)'
            });
            await convo.stop();
          } else {
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await convo.repeat();
          }
        }
      },
    },
    {
      default: false,
      pattern: '3',
      handler: async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
          Object.assign(convo.vars, message);
          await convo.stop();
        } else {
          if (!!buttons[response - 1]) {
            Object.assign(convo.vars, message);
            message.text = buttons[response - 1];
            message.value = 'Scheduled a call';
            await controller.trigger(['ANALYTICS_EVENT'], bot, message);
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await bot.say({
              recipient: message.sender,
              text: 'OK. Have a productive conversation! 😉'
            });
            await convo.stop();
          } else {
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await convo.repeat();
          }
        }
      },
    },
    {
      default: false,
      pattern: '4',
      handler: async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
          Object.assign(convo.vars, message);
          await convo.stop();
        } else {
          if (!!buttons[response - 1]) {
            message.text = buttons[response - 1];
            message.value = 'Scheduled a call';
            await controller.trigger(['ANALYTICS_EVENT'], bot, message);
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });

            // [APPRECIATE DIALOG]
            await dialog.ask({
              text: 'Great! How do you appreciate your dialogue?',
              quick_replies: [ ...getItems(appreciateDialogue) ],
            }, async (response, convo, bot, message) => {
              await controller.trigger(['mark_seen'], bot, message);
              if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
                Object.assign(convo.vars, message);
                await convo.stop();
              } else {
                if (Object.values(appreciateDialogue).includes(response)) {
                  Object.assign(convo.vars, message);
                  message.value = 'Appreciate your dialogue';
                  await controller.trigger(['ANALYTICS_EVENT'], bot, message);
                  await convo.stop();
                } else {
                  await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                  await convo.repeat();
                }
              }
            }, { key: 'appreciate_dialog' });

          } else {
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await convo.repeat();
          }
        }
      },
    },
    {
      default: false,
      pattern: '5',
      handler: async (response, convo, bot, message) => {
        await controller.trigger(['mark_seen'], bot, message);
        if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
          Object.assign(convo.vars, message);
          await convo.stop();
        } else {
          if (!!buttons[response - 1]) {
            message.text = buttons[response - 1];
            message.value = 'Scheduled a call';
            await controller.trigger(['ANALYTICS_EVENT'], bot, message);

            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await bot.say({
              recipient: message.sender,
              text: 'Ok. Give us some time and we will send you a new contact.',
            });

            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });

            // [PROBLEM DIALOG]
            await dialog.ask({
              text: `What is the problem with the previous partner?\n\nPlease help improve our algorithm.\n\n${formatButtons(problemWithPartner)}\n\n(If your option is not there, send it by message)`,
              quick_replies: [ ...getItems(problemWithPartner) ],
            }, async (response, convo, bot, message) => {
              if (response === 'getstarted_payload' || message.text === 'getstarted_payload') {
                Object.assign(convo.vars, message);
                await convo.stop();
              } else {
                Object.assign(convo.vars, message);
                message.text = !!problemWithPartner[response - 1] ? problemWithPartner[response - 1] : response;
                message.value = 'Problem with partner';
                await controller.trigger(['ANALYTICS_EVENT'], bot, message);

                await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
                await bot.say({
                  recipient: message.sender,
                  text: 'Thanks. We\'ll keep it on mind',
                });
                await convo.stop();
              }
            }, { key: 'problem_with_partner' });

          } else {
            await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
            await convo.repeat();
          }
        }
      },
    }
  ], { key: 'scheduled_a_call' });

  await dialog.after(async (results, bot) => { // [OK]
    await controller.trigger(['mark_seen'], bot, results);
    try {
      if (results.text === 'getstarted_payload') {
        await controller.trigger(['start'], bot, results);
        return;
      }
    } catch(error) {
      console.error('[scheduled_a_call.js:277 ERROR]:', error);
    };
  });
};
