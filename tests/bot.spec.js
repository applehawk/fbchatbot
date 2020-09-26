'use strict';

const { test } = require('ava');

const { /*Botkit, */BotkitTestClient } = require('botkit');

// const bot = new Botkit({
//   storage,
// });

const DIALOG_ONBOARDING_ID = 'DIALOG_ONBOARDING_ID'; //?

const client = new BotkitTestClient('test', bot, DIALOG_ONBOARDING_ID);

console.log(client); //?

// const reply = await client.sendActivity('first message');

// assert.strictEqual(reply.text, 'first reply', 'reply failed');
