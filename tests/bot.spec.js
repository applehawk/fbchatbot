'use strict';

// const { test } = require('ava');

const { Botkit, BotkitTestClient } = require('botkit');

import storage from './fixtures/storage';

const bot = new Botkit({
  storage,
});

const DIALOG_ONBOARDING_ID = 'DIALOG_ONBOARDING_ID';

const client = new BotkitTestClient('test', bot, DIALOG_ONBOARDING_ID);

const send = await client.send('test message');

const result = await send.assertReply(reply.text, 'done'); //?
