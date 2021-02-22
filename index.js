const Discord = require('discord.js');
const bot = new Discord.Client();
let authStuff = require('./auth/creds.json');
const TOKEN = authStuff.token
const FREDTOKEN = authStuff.fredKey
let config = require('./config.json')
const fetch = require('node-fetch');

let fredEndStr = "&api_key="+ FREDTOKEN +"&file_type=json"

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if (msg.content === '!help') {
    msg.channel.send('Here are a list of commands: \n * `!money printer`\n * `!help`\n * `!what`\n * `!get-categories`');
  }
  else if (msg.content === '!money printer') {
    msg.channel.send('BRRRRRRR');
  }
  else if (msg.content === '!what') {
    msg.channel.send('I am a bot that grabs data from the Federal Reserve Economic Data from St Louis!');
  }
  else if (msg.content === '!get-categories') {
    fetch( config.fred_url + 'category/children?' + "category_id=0" + fredEndStr, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    }).then(response => response.json()).then((responseJson) => {
      console.log(responseJson);
      let outStr = ""
      for (var i = 0; i < responseJson.categories.length; i++) {
        outStr += "id: " + responseJson.categories[i].id + "\n" + "name: " + responseJson.categories[i].name + "\n\n"
      }
      msg.channel.send(outStr);
    })
  }
});
