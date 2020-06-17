'use strict';

module.exports = async (controller) => {
  controller.on(['ANALYTICS_EVENT'], async (bot, message) => {

    // let _eventName = '';

    // /*if (message.text === 'getstarted_payload') {
    //   _eventName = 'Get Started';
    // } else if (message.text === 'All right. Let’s go!') {
    //   _eventName = 'Finish';
    // } else */if (message.value !== undefined) {
    //   _eventName = message.value;
    // } else {
    //   _eventName = message.type;
    // }

    // // if (message.postback !== undefined && message.postback.title !== undefined) {
    // //   _eventName = message.postback.title;
    // // } else {
    // // }

    //   // message?.postback?.title === 'Get Started' ? 'Get Started' : message.type;
    // console.log(!!message.value ? message.value : message.type, !!message.value, message.value);
    // return;

    const options = {
      event: 'CUSTOM_APP_EVENTS',
      custom_events: JSON.stringify([{
        _eventName: !!message.value ? message.value : message.type,
        _user_id: message.sender.id,
        _time: message.timestamp,
        text: message.text,
      }]),
      advertiser_tracking_enabled: 1,
      application_tracking_enabled: 1,
      // extinfo: JSON.stringify(['mb1']),
      page_id: message.recipient.id,
      page_scoped_user_id: message.sender.id,
    };
    const status = await bot.api.callAPI(`/${process.env.FACEBOOK_APPID}/activities`, 'POST', options);

    console.log(status);
    return status;
  });
};
