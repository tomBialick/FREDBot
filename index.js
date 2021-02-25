const Discord = require('discord.js');
const bot = new Discord.Client();
let authStuff = require('./auth/creds.json');
const TOKEN = authStuff.token
const FREDTOKEN = authStuff.fredKey
let config = require('./config.json')
const fetch = require('node-fetch');
let prefix = "!"
var fs = require('fs');
var JSDOM = require('jsdom').JSDOM;

let fredEndStr = "&api_key="+ FREDTOKEN +"&file_type=json"

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    message.channel.send('Here are a list of commands: \n * `!money-printer`\n * `!help`\n * `!what`\n * `!get-categories`\n * `!get-subcategories [id]`\n ' +
    '* `!get-related-categories [id]`\n * `!get-category [id]` \n * `get-GNPC-observations [start YYYY-MM-DD]`');
  }
  else if (command === 'money-printer') {
    message.channel.send('BRRRRRRR');
  }
  else if (command === 'what') {
    message.channel.send('I am a bot that grabs data from the Federal Reserve Economic Data from St Louis!');
  }
  else if (command === 'get-categories') {
    fetch( config.fred_url + 'category/children?' + "category_id=0" + fredEndStr, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    }).then(response => response.json()).then((responseJson) => {
      let outStr = ""
      for (var i = 0; i < responseJson.categories.length; i++) {
        outStr += "id: " + responseJson.categories[i].id + "\n" + "name: " + responseJson.categories[i].name + "\n\n"
      }
      message.channel.send(outStr);
    })
  }
  else if (command === 'get-subcategories') {
    fetch( config.fred_url + 'category/children?' + "category_id=" + args[0] + fredEndStr, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    }).then(response => response.json()).then((responseJson) => {
      let outStr = ""
      for (var i = 0; i < responseJson.categories.length; i++) {
        outStr += "id: " + responseJson.categories[i].id + "\n" + "name: " + responseJson.categories[i].name + "\n\n"
      }
      message.channel.send(outStr);
    })
  }
  else if (command === 'get-related-categories') {
    fetch( config.fred_url + 'category/related?' + "category_id=" + args[0] + fredEndStr, {
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
      message.channel.send(outStr);
    })
  }
  else if (command === 'get-category') {
    fetch( config.fred_url + 'category?' + "category_id=" + args[0] + fredEndStr, {
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
      message.channel.send(outStr);
    })
  }
  else if (command === 'sample-chart') {
    fetch( config.fred_url + 'series/observations?' + "series_id=GNPCA" + fredEndStr, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    }).then(response => response.json()).then((responseJson) => {
      // console.log(responseJson);
      let dataSet = []

      for (var i = 0; i < responseJson.observations.length; i++) {
        let element = {
          x: responseJson.observations[i]['date'],
          value: Number(responseJson.observations[i]['value'])
        }
        // dataSet[i].date = responseJson.observations[i]['date']
        // dataSet[i].value = responseJson.observations[i]['value']
        dataSet = [...dataSet, element]
      }

      // Create instance of JSDOM.
      var jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'});
      // Get window
      var window = jsdom.window;
      // require anychart and anychart export modules
      var anychart = require('anychart')(window);
      var anychartExport = require('anychart-nodejs')(anychart);

      // create and a chart to the jsdom window.
      // chart creating should be called only right after anychart-nodejs module requiring
      var chart = anychart.line(dataSet);
      chart.bounds(0, 0, 1000, 1000);
      chart.container('container');
      chart.draw();

      // generate JPG image and save it to a file
      anychartExport.exportTo(chart, 'jpg').then(function(image) {
        fs.writeFile('./outFolder/chart.jpg', image, function(fsWriteError) {
          if (fsWriteError) {
            console.log(fsWriteError);
          } else {
            message.channel.send("Hey! Here is the chart:", { files: {attachment: './outFolder/chart.jpg',name: 'chart.jpg'}})
            .then({
              fs.unlink('./outFolder/chart.jpg', (err) => {
                if (err) throw err;
              });
            })
            .catch(console.error);
          }
        });
      }, function(generationError) {
        console.log(generationError);
      });
    })
    else if (command === 'get-GNPC-observations') {
      fetch( config.fred_url + 'series/observations?' + "series_id=GNPCA&observation_end=" + args[0] + fredEndStr, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
      }).then(response => response.json()).then((responseJson) => {
        // console.log(responseJson);
        let dataSet = []

        for (var i = 0; i < responseJson.observations.length; i++) {
          let element = {
            x: responseJson.observations[i]['date'],
            value: Number(responseJson.observations[i]['value'])
          }
          // dataSet[i].date = responseJson.observations[i]['date']
          // dataSet[i].value = responseJson.observations[i]['value']
          dataSet = [...dataSet, element]
        }

        // Create instance of JSDOM.
        var jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'});
        // Get window
        var window = jsdom.window;
        // require anychart and anychart export modules
        var anychart = require('anychart')(window);
        var anychartExport = require('anychart-nodejs')(anychart);

        // create and a chart to the jsdom window.
        // chart creating should be called only right after anychart-nodejs module requiring
        var chart = anychart.line(dataSet);
        chart.bounds(0, 0, 1000, 1000);
        chart.container('container');
        chart.draw();

        // generate JPG image and save it to a file
        anychartExport.exportTo(chart, 'jpg').then(function(image) {
          fs.writeFile('./outFolder/chart.jpg', image, function(fsWriteError) {
            if (fsWriteError) {
              console.log(fsWriteError);
            } else {
              message.channel.send("Hey! Here is the chart:", { files: {attachment: './outFolder/chart.jpg',name: 'chart.jpg'}})
              .then({
                fs.unlink('./outFolder/chart.jpg', (err) => {
                  if (err) throw err;
                });
              })
              .catch(console.error);
            }
          });
        }, function(generationError) {
          console.log(generationError);
        });
      })
  }
});
