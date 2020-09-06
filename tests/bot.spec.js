'use strict;'

const { test } = require('ava');
const bot = require('../bot.js');
const { BotkitTestClient } = require('botkit');

const ONBOARDING_ID = 'ONBOARDING_ID'; //?

const client = new BotkitTestClient('test', bot, ONBOARDING_ID);

console.log(client); //?

// const reply = await client.sendActivity('first message');

// assert.strictEqual(reply.text, 'first reply', 'reply failed');
