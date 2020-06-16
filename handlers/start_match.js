'use strict';

module.exports = async (controller) => {
  const delay = 10000;
  const timer = async (bot, message) => { // [OK]
    // Running a timer if the user doesn't have an active dialog or message.value is empty
    if (!bot.hasActiveDialog() && message.value === undefined) {
      clearTimeout(message.value);
      message.value = setTimeout(async () => { // [OK]
        // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
        // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
        await bot.changeContext(message.reference);

        await controller.trigger(['match'], bot, message);
        setTimeout(async () => { // [OK]
          await bot.changeContext(message.reference);
          clearTimeout(message.value);
          timer(bot, message);
        }, 5000);
      }, delay);
    }
  };

  controller.on(['start_match'], async (bot, message) => {
    if (!bot.hasActiveDialog() || !message.value) {
      await timer(bot, message);
    }
  });
};
