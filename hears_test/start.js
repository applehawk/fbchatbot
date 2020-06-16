'use strict';

const { UserState } = require('botbuilder');

const { communityDict, englishLevelDict } = require('../constants.js');

module.exports = async (controller) => {
    controller.hears(new RegExp(/^(start)\s+?(\d+)\s+?(.+)$/ius), ['message', 'direct_message', 'facebook_postback'], async (bot, message) => {
        try {
            const recipient = { id: message.matches[2] };

            // // #BEGIN Bot typing
            // await bot.api.callAPI('/me/messages', 'POST', {
            //     recipient,
            //     sender_action: 'typing_on',
            // });
            // await typing({ bot, options: { recipient }, mode: true });

            const text = message.matches[3].trim();
            const { storage } = controller;
            const context = bot.getConfig('context');
            // const activity = context._activity;
            const userState = new UserState(storage);

            // Get User State Properties
            // const channelId = activity.channelId;
            const { channelId } = message.incoming_message;
            const matchUser = await storage.Collection.findOne({ _id: `${channelId}/users/${recipient.id}/` });

            if (!!matchUser) {
                const personas = await bot.api.callAPI('/me/personas', 'GET'); // [OK]

                if (Object.values(personas.data).length) {
                    console.log(personas.data[0]);
                    let count = 0;
                    Object.values(personas.data).forEach(persona => {
                        setTimeout(async () => {
                            await bot.api.callAPI(persona.id, 'DELETE');
                        }, 1000);
                        count++;
                    });
                    console.log(`[PERSONAS]: ${count} deleted.`);
                }

                // let persona_id = null;

                // Create a Persona
                // if (!Object.values(personas.data).length) {
                    let { id: persona_id } = await bot.api.callAPI('/me/personas', 'POST', { // [OK]
                        recipient,
                        // dialog: recipient.id,
                        name: matchUser.state.username || 'User',
                        profile_picture_url: matchUser.state.profile_pic || 'https://picsum.photos/200/200/?random=1',
                    });
                    console.log('[persona] created:', persona_id);
                // }

                const personaOptions = {
                    recipient,
                    persona_id/*: !Object.values(personas.data).length ? persona_id : personas.data[0].id*/,
                };

                // // [OK]
                // const { id } = await bot.api.callAPI('/me', 'GET');
                // const dialogBot = await controller.spawn(id);
                // await dialogBot.startConversationWithUser(recipient.id);

                // #BEGIN Bot typing
                // await typing({ bot, options: { ...personaOptions }, mode: true });
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient }, mode: true });

                // Send text from Persona
                await bot.api.callAPI('/me/messages', 'POST', {
                    ...personaOptions,
                    message: {
                        // text,
                        dynamic_text: {
                            text,
                        },
                        // attachment: {
                        //     type: 'template',
                        //     payload: {
                        //         template_type: 'generic',
                        //         elements: [{
                        //             title: matchUser.state.username,
                        //             subtitle: `\n🗺 ${matchUser.state.location}\n💬 ${englishLevelDict[matchUser.state.english_level]}\n👔 ${communityDict[matchUser.state.community]}\n🛠 ${matchUser.state.profession}`,
                        //         }],
                        //     },
                        // },
                    },
                });

                // // v1 [OK]
                // const { id } = await bot.api.callAPI('/me', 'GET');
                // const dialogBot = await controller.spawn(id);
                // await dialogBot.startConversationWithUser(recipient.id);

                // // v2 [*]
                // const dialogBot = await controller.spawn(message.recipient.id);
                // await dialogBot.startConversationWithUser(recipient.id);

                // // [*][?]
                // await dialogBot.addQuestion({
                //     text: '???',
                //     quick_replies: [{
                //         content_type: 'text',
                //         title: 'No',
                //         payload: 'no',
                //     }, {
                //         content_type: 'text',
                //         title: 'Yes',
                //         payload: 'yes',
                //     }],
                // }, [
                //     {
                //         default: true,
                //         pattern: 'No',
                //         handler: async (answerText, convo, bot, message) => {
                //             try {
                //                 console.log(`start dialog with user: ${answerText}`);
                //             } catch(error) {
                //                 console.error(error);
                //             }
                //         },
                //     },
                //     {
                //         pattern: 'Yes',
                //         handler: async (answerText, convo, bot, message) => {
                //             try {
                //                 // await bot.beginDialog(COMMUNITY_DIALOG_ID, { ...convo.vars });
                //                 console.log(`start dialog with user: ${answerText}`);
                //             } catch(error) {
                //                 console.error(error);
                //             }
                //         },
                //     }
                // ], { key: 'message' });

                // await dialogBot.say({
                //     text,
                // // }, async (bot, message) => {
                // //     // #END Bot typing
                // //     await bot.api.callAPI('/me/messages', 'POST', {
                // //         recipient,
                // //         sender_action: 'typing_off',
                // //     });
                // });

                // // #END Bot typing
                // // await typing({ bot, options: { ...personaOptions }, mode: false });
                // await controller.trigger(['sender_action_typing'], bot, { options: { recipient }, mode: false });
            } else {
                // #BEGIN Bot typing
                // await typing({ bot, options: { recipient: message.sender }, mode: true });
                await controller.trigger(['sender_action_typing'], bot, { options: { recipient }, mode: true });

                await bot.say({
                    text: 'Sorry, but user was not found.',
                });

                // // #END Bot typing
                // await typing({ bot, options: { recipient: message.sender }, mode: false });
                // await controller.trigger(['sender_action_typing'], bot, { options: { recipient }, mode: false });
            }
        } catch(error) {
            console.error(`[ERROR]: ${error}`);
        }
    });
};
