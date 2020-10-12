'use strict';

const { english_levelDict, communityDict } = require('../constants.js');
const { getUserContextProperties } = require('../helpers.js');

module.exports = async (controller) => {
  controller.hears(new RegExp(/^me$/), ['message'], async (bot, message) => {
  // controller.on(['me'], async (bot, message) => {
    try {
      const {
        community,
        english_level,
        facebook_url,
        location,
        profession,
        profile_pic,
        ready_to_conversation,
        recent_users,
        username,
      } = await getUserContextProperties(controller, bot, message);

      const recipient = message.sender;

      const baseUrl = `${process.env.PROTO}://${process.env.APP_NAME}${process.env.NODE_ENV === "development" ? ':' + process.env.PORT : ""}`;
      const url = `${baseUrl}/api/profile?id=${recipient.id}`;

      const rUsers = [];
      if (recent_users.length) {
        recent_users.forEach(user => {
          rUsers.push(user.match(/(\d+)\/?$/)[1]);
        });
      }

      // const options = {
      //   messaging_type: 'MESSAGE_TAG',
      //   tag: 'ACCOUNT_UPDATE',
      //   recipient,
      //   include_headers: false,
      //   batch: [{
      //     // name: `test_${Date.now()}_${Math.round(Math.random() * 1e15)}`,
      //     relative_url: '/me/messages',
      //     include_headers: false,
      //     method: 'POST',
      //     body: 'recipient={ id: ' + recipient.id + ' }&' +
      //       'message={ ' +
      //         'attachment: { ' +
      //           'type: "template", ' +
      //           'payload: { ' +
      //             'image_aspect_ratio: "square", ' +
      //             'template_type: "generic", ' +
      //             'elements: [{ ' +
      //               'buttons: [{ ' +
      //                 'type: "web_url", ' +
      //                 'url: \"' + url + '\", ' +
      //                 'title: "Go to profile", ' +
      //                 'webview_height_ratio: "full"' +
      //               ' }], ' +
      //               'image_url: \"' + profile_pic + '\", ' +
      //               'title: \"' + username + '\", ' +
      //               'subtitle: \"' + recipient.id + '\"' +
      //             ' }]' +
      //           ' }' +
      //         ' }' +
      //       '}' +
      //     '}',
      //   }, {
      //     // name: `test_${Date.now()}_${Math.round(Math.random() * 1e15)}`,
      //     include_headers: false,
      //     relative_url: '/me/messages',
      //     method: 'POST',
      //     body: `recipient={ id: 4011572872217706 }&message={ text: "This is a test of broadcast message" }`,
      //   }, {
      //     // name: `test_${Date.now()}_${Math.round(Math.random() * 1e15)}`,
      //     include_headers: false,
      //     relative_url: '/me/messages',
      //     method: 'POST',
      //     body: `recipient={ id: ${recipient.id} }&message={ text: "This is a test of broadcast message" }`,
      //   }],
      // };

      //create batch messages
      const rec = `recipient=${encodeURIComponent(JSON.stringify({ "id": `${recipient.id}`, "include_headers": false }))}`; //needs to be URLEncoded
      // const typing = `recipient=${encodeURIComponent(JSON.stringify({ "sender_action": "typing_on" }))}`; //needs to be URLEncoded

      const attachment = `message=${encodeURIComponent(JSON.stringify(
        { //URLEncoded
          "include_headers": false,
          "attachment": {
            "type": "template",
            "payload": {
              "image_aspect_ratio": "square",
              "template_type": "generic",
              "elements": [{
                "buttons": [{
                  "type": "web_url",
                  "url": url,
                  "title": "Go to profile",
                  "webview_height_ratio": "full",
                }],
                "image_url": profile_pic,
                "title": username,
                "subtitle": recipient.id,
              }],
            },
          },
        }
      ))}`;

      const info = `message=${encodeURIComponent(JSON.stringify( //messages request also needs to be URLEncoded
        { "text": `
🗺 ${location}
💬 ${english_levelDict[english_level]}
👔 ${communityDict[community]}
🛠 ${profession}
📢 ${ready_to_conversation === 'ready' ? 'Ready' : 'Busy'}
${recent_users.length ? '⌛ ' + recent_users.length + '\n\nRecent user' + (recent_users.length === 1 ? '' : 's') + ':\n\n' + rUsers.join('\n') : ''}`,
        },
      ))}`;

      const text = `message=${encodeURIComponent(JSON.stringify( //messages request also needs to be URLEncoded
        { "text": `\n\nSome other text` },
      ))}`;

      //name in batched messages is used to make dependance between messages, so they to be sent sequentially
      //look at 'depends_on' parametr
      const options = {
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE',
        recipient,
        batch: JSON.stringify([ //whole request need to be stringified to attach to form
          // { "method": "POST", "name": "typing", "relative_url": "/me/messages", "body": `${rec}&${typing}` }, //to display typing on bubble :)
          { "method": "POST", "name": "attachment"/*, "depends_on": "typing"*/, "relative_url": "/me/messages", "body": `${rec}&${attachment}` },
          { "method": "POST", "name": "info", "depends_on": "attachment", "relative_url": "/me/messages", "body": `${rec}&${info}` },
          { "method": "POST", "name": "text", "depends_on": "info", "relative_url": "/me/messages", "body": `${rec}&${text}` },
      ])};
      console.log(options);

      // controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
      const batch = await bot.api.callAPI('/me/messages', 'POST', options);
      console.log(JSON.stringify(batch, null, 2));

      // controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
//       await bot.say({
//         // ...message,
//         messaging_type: 'MESSAGE_TAG',
//         tag: 'ACCOUNT_UPDATE',
//         text: `
// 🗺 ${location}
// 💬 ${english_levelDict[english_level]}
// 👔 ${communityDict[community]}
// 🛠 ${profession}
// 📢 ${ready_to_conversation === 'ready' ? 'Ready' : 'Busy'}
// ${recent_users.length ? '⌛ ' + recent_users.length + '\n\nRecent user' + (recent_users.length === 1 ? '' : 's') + ':\n\n' + rUsers.join('\n') : ''}`,
//       });
    } catch (error) {
      console.error('[me.js:77 ERROR]:', error);
    }
  });
};
