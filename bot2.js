
controller.on('event', async(bot, message) => {
    await bot.reply(message,'I received an event of type ' + message.type);
});

controller.on('facebook_postback', async(bot, message) => {
    await bot.reply(message, 'postback!!!! (' + message.payload + ')');
    await bot.beginDialog(DIALOG_ONBOARDING);
});

// ask a question, store the response in 'name'
convo.ask('What is your name?', async(answer, convo, bot) => {
    console.log(`user name is ${ answer }`);
    // do something?
}, 'name');


let facebookApi = new FacebookAPI(
    process.env.FACEBOOK_VERIFY_TOKEN, 
    process.env.FACEBOOK_APP_SECRET,
);


let api = adapter.getAPI({})

(async () => {
    await api.callAPI('/me/messenger_profile','POST',{"get_started":
    {"payload":
    {"type":"legacy_reply_to_message_action", "message": "Get Started 3"}
    }
    });
})



/*
var attachment = {
    'type':'template',
    'payload':{
        'template_type':'generic',
        'elements':[
            {
                'title':'Chocolate Cookie',
                'image_url':'http://cookies.com/cookie.png',
                'subtitle':'A delicious chocolate cookie',
                'buttons':[
                    {
                    'type':'postback',
                    'title':'Eat Cookie',
                    'payload':'chocolate'
                    }
                ]
            },
        ]
    }
};*/
/*
 [
    {
        pattern: 'yes',
        default: true,
        handler: async(response, convo, bot) => {
            await convo.gotoThread('yes_tacos');
        }
    },
    {
        pattern: 'no',
        handler: async(response, convo, bot) => {
            await convo.gotoThread('no_tacos');
        }
    }
], 'wants_taco'
*/