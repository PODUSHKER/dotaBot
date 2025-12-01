// imports and project settings
const botApi = require('node-telegram-bot-api');
const { JSDOM } = require('jsdom')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config();


// options
const url = 'https://dota2.ru/news/updates/';
const bot = new botApi(process.env.TOKEN, { polling: true })
const ms = 10000

// for bot working
let lastPostUrl = '';
let flag = false;


function init() {
    bot.addListener('text', (msg) => {
        if (msg.text === '/start' && !flag) {
            timeoutChecker(msg.chat.id);
            bot.deleteMessage(msg.chat.id, msg.message_id)
            bot.sendMessage(msg.chat.id, 'Бот запущен!');
            flag = true;
        }
        if (msg.text === '/stop') {
            flag = false;
            bot.sendMessage(msg.chat.id, 'Бот отключен!');
        }

    })

    async function parse(url) {
        const response = await axios.get(url);
        const jsdom = new JSDOM(response.data)
        const document = jsdom.window.document;

        const postUrl = 'https://dota2.ru' + document.querySelector('.index__news-link').href
        const name = document.querySelector('.index__news-name').innerHTML.trim();

        return { name, postUrl }
    }

    async function timeoutChecker(chatId) {
        const timeout = setTimeout(async function wrapper() {
            if (flag) {
                const { name, postUrl } = await parse(url);
                if (lastPostUrl !== postUrl) {
                    lastPostUrl = postUrl;
                    const messageText = ['🔔', name, '⬇️⬇️⬇️', postUrl].join('\n');
                    bot.sendMessage(chatId, messageText)
                }
                else { console.log('nothing') }
                setTimeout(wrapper, ms);
            }
        }, ms)
    }
}

init();

process.on('uncaughtException', (err) => {
    console.log(err);
})