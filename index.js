const Discord = require('discord.js');
const bot = new Discord.Client();
let authStuff = require('./auth/creds.json');
const TOKEN = authStuff.token
const FREDTOKEN = authStuff.fredKey
const FINNHUBTOKEN = authStuff.finnhubKey
let config = require('./config.json')
const fetch = require('node-fetch');
let prefix = "!"
var fs = require('fs');
var JSDOM = require('jsdom').JSDOM;
var im = require('imagemagick');

let fredEndStr = "&api_key="+ FREDTOKEN +"&file_type=json"
let finnhubEndStr = "&token=" + FINNHUBTOKEN

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    message.channel.send('Here are a list of commands: \n * `!money-printer`\n * `!help`\n * `!what`\n * `!categories`\n * `!subcategories [id]`\n ' +
    '* `!related-categories [id]`\n * `!category [id]`\n * `!sample-chart`\n * `!gnpc-observations [start YYYY-MM-DD]`\n * `!get [ticker]`' +
    '\n * `!news-score [ticker]`');
  }
  else if (command === 'money-printer') {
    message.channel.send('BRRRRRRR');
  }
  else if (command === 'what') {
    message.channel.send('I am a bot that grabs data from the Federal Reserve Economic Data from St Louis!');
  }
  else if (command === 'categories') {
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
  else if (command === 'subcategories') {
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
  else if (command === 'related-categories') {
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
  else if (command === 'category') {
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
      chart.title("Real Gross National Product")
      chart.xAxis.title("Billions of Dollars")
      chart.container('container');
      chart.draw();

      // generate pdf, convert to a png, and save it to a file
      anychartExport.exportTo(chart, 'pdf').then(function(image) {
        fs.writeFile('./outFolder/chart.pdf', image, function(fsWriteError) {
          if (fsWriteError) {
            console.log(fsWriteError);
          } else {
            im.convert(['./outFolder/chart.pdf', './outFolder/chart.png'], function(err, stdout){
              if (err) {
                console.log('Error:', err);
                throw err;
              }
              else {
                message.channel.send("Hey! Here is the chart:", { files: [{attachment: './outFolder/chart.png',name: 'chart.png'}]})
                .then(() => {
                  fs.unlink('./outFolder/chart.png', (err) => {
                    if (err) {
                      throw err
                    }
                    else {
                      fs.unlink('./outFolder/chart.pdf', (err) => {
                        if (err) throw err;
                      });
                    }
                  });
                })
                .catch(err => {
                  console.log(err);
                });
              }
            });
          }
        });
      }, function(generationError) {
        console.log(generationError);
      });
    })
  }
  else if (command === 'gnpc-observations') {
    fetch( config.fred_url + 'series/observations?' + "series_id=GNPCA&observation_start=" + args[0] + fredEndStr, {
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
      chart.title("Real Gross National Product Since " + args[0])
      chart.yAxis.title("Billions of Dollars")
      chart.container('container');
      chart.draw();

      // generate pdf, convert to a png, and save it to a file
      anychartExport.exportTo(chart, 'pdf').then(function(image) {
        fs.writeFile('./outFolder/chart.pdf', image, function(fsWriteError) {
          if (fsWriteError) {
            console.log(fsWriteError);
          } else {
            im.convert(['./outFolder/chart.pdf', './outFolder/chart.png'], function(err, stdout){
              if (err) {
                console.log('Error:', err);
                throw err;
              }
              else {
                message.channel.send("Hey! Here is the chart:", { files: [{attachment: './outFolder/chart.png',name: 'chart.png'}]})
                .then(() => {
                  fs.unlink('./outFolder/chart.png', (err) => {
                    if (err) {
                      throw err
                    }
                    else {
                      fs.unlink('./outFolder/chart.pdf', (err) => {
                        if (err) throw err;
                      });
                    }
                  });
                })
                .catch(err => {
                  console.log(err);
                });
              }
            });
          }
        });
      }, function(generationError) {
        console.log(generationError);
      });
    })
  }
  else if (command === 'get') {
    fetch( config.finnhub_url + 'quote?' + "symbol=" + args[0].toUpperCase() + finnhubEndStr, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    }).then(response => response.json()).then((responseJson) => {
      console.log(responseJson);
      let outStr = "Current Quote for: " + args[0].toUpperCase()
      outStr += "\nCurrent Price: $" + responseJson.c.toFixed(2)
      outStr += "\nDaily High: $" + responseJson.h.toFixed(2)
      outStr += "\nDaily Low: $" + responseJson.l.toFixed(2)
      outStr += "\nToday's Open: $" + responseJson.o.toFixed(2)
      outStr += "\nYesterday's Close: $" + responseJson.pc.toFixed(2)
      outStr += "\n\nToday's Gain/Loss: $" + (responseJson.c - responseJson.pc).toFixed(2)
      outStr += "\nToday's Gain/Loss: " + (((responseJson.c - responseJson.pc)/responseJson.pc) * 100).toFixed(3) + "%"
      message.channel.send(outStr);
    });
  }
  else if (command === 'news-score') {
    fetch( config.finnhub_url + 'news-sentiment?' + "symbol=" + args[0].toUpperCase() + finnhubEndStr, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    }).then(response => response.json()).then((responseJson) => {
      console.log(responseJson);
      let outStr = "News Sentiment of the past week for: " + args[0].toUpperCase()
      outStr += "\nBuzz"
      outStr += "\nNumber of Articles: " + responseJson.buzz.articlesInLastWeek
      outStr += "\nBuzz Score: " + responseJson.buzz.buzz
      outStr += "\nWeekly Average: " + responseJson.buzz.weeklyAverage
      outStr += "\n\nCompany News Score: " + responseJson.companyNewsScore
      outStr += "\nSector Average Bullish Percent: " + responseJson.sectorAverageBullishPercent
      outStr += "\nSector Average News Score: " + responseJson.sectorAverageNewsScore
      outStr += "\n\nSentiment"
      outStr += "\nBullish Percent: " + responseJson.sentiment.bullishPercent
      outStr += "\nBearish Percent: " + responseJson.sentiment.bearishPercent
      message.channel.send(outStr);
    });
  }
});
