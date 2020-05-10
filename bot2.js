
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
const DIALOG_ONBOARDING = "TestDialog1"
let convo = new BotkitConversation(DIALOG_ONBOARDING, controller);
// send a greeting
convo.say('Hi! 👋\
\
We are the (not)Random English an international online platform for training business English skills through a friendly networking format.\
\
Every Monday and Thursday we will offer you for conversation an interesting person, selected following your interests among other participants.\
\
We establish a simple system, first of all, you should share with us some information about yourself, your needs and your knowledge that might be useful for our community. It allows other people before the call to know what topics it will be interesting to discuss with you.\
\
Let me ask you some questions and we will create your profile that will be available to other participants'
);

convo.ask({
    attachment: {
        'type': 'template',
        'payload': {
            'template_type': 'button',
            'text': 'Here we go?',
            'buttons': [
                {
                    'type': 'postback',
                    'title': 'Go!',
                    'payload': 'Go!',
                },
            ]  
        }
    }
}, [async(response_text, convo, bot, full_message) => {
    await convo.say('Let\' go');
    //convo.say('Awesome. Here '+response.text);
    }]
);

// use add action to switch to a different thread, defined below...
//convo.addAction('username_ask');
// ask a question, store the response in 'name'
convo.ask('What is your name?', async(res, convo, bot) => {}, {key: 'name'});
// ask a question, store the response in 'name'
convo.ask('What is your Facebook URL?', async(res, convo, bot) => {}, {key: 'facebook_url'});

//convo.say('Hello {{vars.name}}, you have facebookPage {{vars.facebook_url}}')

/*

// define a profile collection dialog
let convo = new BotkitConversation('PROFILE_DIALOG', controller);
convo.ask('What is your name?', [], 'name');
convo.ask('What is your age?', [], 'age');
convo.ask('What is your favorite color?', [], 'color');
convo.after(async(results, bot) => {
    await convo.say('You have {{results.name}} {{results.age}} and {{results.color}}');
     // handle results.name, results.age, results.color
});
controller.addDialog(convo);
*/
/*
controller.on("event,facebook_postback", async(bot, message) => {
    await bot.beginDialog(PROFILE_DIALOG);
});
*/


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





/// NEXT CODE

/*


*/



// Log every message received
/*
controller.middleware.receive.use(function(bot, message, next) {
    // log it
    console.log('RECEIVED: ', message);
    // modify the message
    message.logged = true;
    // continue processing the message
    next();
  });

*/