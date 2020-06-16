'use strict';

module.exports = async (controller) => {
  const delay = 300000;
  const timer = (bot, message) => { // [OK]
    clearTimeout(message.value);
    message.value = setTimeout(async () => { // [OK]
      // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
      // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
      const botRef = await bot.changeContext(message.reference);

      if (!botRef.hasActiveDialog() || !message.value) {
        await controller.trigger(['match'], botRef, message);
        setTimeout(() => { // [OK]
          clearTimeout(message.value);
          timer(botRef, message);
        }, 5000);
      }
    }, delay);
  };

  controller.on(['start_match'], async (bot, message) => {
    // [Tip] https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
    // [Tip] https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
    const botRef = await bot.changeContext(message.reference);
    // Running a timer if the user doesn't have an active dialog or message.value is empty
    if (!botRef.hasActiveDialog() || !message.value) {
      clearTimeout(message.value);
      message.value = null;
      timer(botRef, message);
    }
  });
};
