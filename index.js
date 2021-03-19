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
const snoowrap = require('snoowrap');
const REDDITUSERNAME = authStuff.redditUser
const REDDITPASSWORD = authStuff.redditPass
const REDDITCLIENTID = authStuff.redditID
const REDDITCLIENTSECRET = authStuff.redditSecret

let fredEndStr = "&api_key="+ FREDTOKEN +"&file_type=json"
let finnhubEndStr = "&token=" + FINNHUBTOKEN

bot.login(TOKEN);

const r = new snoowrap({
  userAgent: config.user_agent,
  clientId: REDDITCLIENTID,
  clientSecret: REDDITCLIENTSECRET,
  username: REDDITUSERNAME,
  password: REDDITPASSWORD
});

//if this gets big, fs.readFile might be necessary
var memeTickerList = require("./assets/memeStocks.json")

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
    '\n * `!news-score [ticker]`\n * `!hype-score [ticker] [name] [other aliases]`\n * `!add-meme-ticker [ticker] [name]`');
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
      // console.log(responseJson);
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
      // console.log(responseJson);
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
  else if (command === 'hype-score') {
    if (args.length < 2) {
      message.channel.send("Missing Args; I need a ticker, then the company name i.e `AAPL Apple`");
    }
    else {
      message.channel.send("Hey! This may take a minute, so please don't spam me...");
      //make a deep copy
      let memeStockStatsSTR = JSON.stringify(memeTickerList)
      let memeStockStats = JSON.parse(memeStockStatsSTR)
      //add some fields for hype calculations
      //valid flairs: DD, Discussion, Charts, YOLO, Earnings Thread, Gain, Loss, News, Meme, Technical Analysis, Shitpost, null
      memeStockStats.forEach(element => {
        element.dailyThreadMention = 0
        element.megaThreadCount = 0
        element.megaThreadCommentsCount = 0
        element.ddCount = 0
        element.ddCommentsCount = 0
        element.discussionCount = 0
        element.discussionCommentsCount = 0
        element.chartCount = 0
        element.chartCommentsCount = 0
        element.yoloCount = 0
        element.yoloCommentsCount = 0
        element.gainCount = 0
        element.gainCommentsCount = 0
        element.lossCount = 0
        element.lossCommentsCount = 0
        element.memeCount = 0
        element.memeCommentsCount = 0
        element.newsCount = 0
        element.newsCommentsCount = 0
        element.technicalAnalysisCount = 0
        element.technicalAnalysisCommentsCount = 0
        element.shitpostCount = 0
        element.shitpostCommentsCount = 0
        element.unflairedCount = 0
        element.unflairedCommentsCount = 0
      });

      r.getHot('wallstreetbets', {limit: 1}).then(response => {
        // console.log(response[0].title);
        // let responseJson = JSON.stringify(response)
        let submissionID = response[0].id
        // console.log(submissionID);
        r.getSubmission(submissionID).expandReplies({limit: 250, depth: 10}).then(post => {
          let totalCommentCount = 0
          let totalCountFlag = 0
          let userSuppliedTicker = {
            ticker: args[0],
            alt_names: args.slice(1),
            dailyThreadMention: 0,
            megaThreadCount: 0,
            ddCount: 0,
            discussionCount: 0,
            chartCount: 0,
            yoloCount: 0,
            gainCount: 0,
            lossCount: 0,
            memeCount: 0,
            newsCount: 0,
            technicalAnalysisCount: 0,
            shitpostCount: 0,
            unflairedCount: 0,
            megaThreadCommentsCount: 0,
            ddCommentsCount: 0,
            discussionCommentsCount: 0,
            chartCommentsCount: 0,
            yoloCommentsCount: 0,
            gainCommentsCount: 0,
            lossCommentsCount: 0,
            memeCommentsCount: 0,
            newsCommentsCount: 0,
            technicalAnalysisCommentsCount: 0,
            shitpostCommentsCount: 0,
            unflairedCommentsCount: 0
          }
          let replyTreeSize = post.comments.length;

          function getTickerCountInReplies (ticker, comment){
            let temp = comment.body.toUpperCase()
            if (comment.replies.length > 0) {
              let count = 0
              for (let i = 0; i < comment.replies.length; i++) {
                count += getTickerCountInReplies (ticker, comment.replies[i])
              }
              if (totalCountFlag === 0) {
                totalCommentCount++
              }
              return (temp.includes(ticker.toUpperCase())? 1 + count: count)
            }
            else {
              if (totalCountFlag === 0) {
                totalCommentCount++
              }
              return (temp.includes(ticker.toUpperCase())? 1: 0)
            }
          }

          for (let i = 0; i < replyTreeSize; i++) {
            userSuppliedTicker.dailyThreadMention += getTickerCountInReplies(userSuppliedTicker.ticker, post.comments[i])
            totalCountFlag = 1
            memeStockStats.forEach((element) => {
              element.dailyThreadMention += getTickerCountInReplies(element.ticker, post.comments[i])
            });
            totalCountFlag = 0
          }

          //count stuff flaired memes, dd, discussion, mega thread
          //valid flairs: DD, Discussion, Charts, YOLO, Gain, Loss, News, Meme, Technical Analysis, Shitpost, null
          r.getHot('wallstreetbets', {limit: 100}).then(submissions => {
            for (let i = 0; i < submissions.length; i++) {
              let currTitle = submissions[i].title.toUpperCase()
              //check if it is a meme stock
              let memeStockArrayIndex = memeStockStats.findIndex((element) => (currTitle.includes(element.ticker.toUpperCase()) || currTitle.includes(element.name.toUpperCase())))
              if (memeStockArrayIndex > -1) {
                let flair = (submissions[i].link_flair_text)? submissions[i].link_flair_text.toUpperCase(): "none";
                switch (flair) {
                  case "DD":
                    memeStockStats[memeStockArrayIndex].ddCount += 1
                    memeStockStats[memeStockArrayIndex].ddCommentsCount += submissions[i].num_comments
                    break;
                  case "DISCUSSION":
                    memeStockStats[memeStockArrayIndex].discussionCount += 1
                    memeStockStats[memeStockArrayIndex].discussionCommentsCount += submissions[i].num_comments
                    break;
                  case "CHARTS":
                    memeStockStats[memeStockArrayIndex].chartCount += 1
                    memeStockStats[memeStockArrayIndex].chartCommentsCount += submissions[i].num_comments
                    break;
                  case "YOLO":
                    memeStockStats[memeStockArrayIndex].yoloCount += 1
                    memeStockStats[memeStockArrayIndex].yoloCommentsCount += submissions[i].num_comments
                    break;
                  case "GAIN":
                    memeStockStats[memeStockArrayIndex].gainCount += 1
                    memeStockStats[memeStockArrayIndex].gainCommentsCount += submissions[i].num_comments
                    break;
                  case "LOSS":
                    memeStockStats[memeStockArrayIndex].lossCount += 1
                    memeStockStats[memeStockArrayIndex].lossCommentsCount += submissions[i].num_comments
                    break;
                  case "NEWS":
                    memeStockStats[memeStockArrayIndex].newsCount += 1
                    memeStockStats[memeStockArrayIndex].newsCommentsCount += submissions[i].num_comments
                    break;
                  case "TECHNICAL ANALYSIS":
                    memeStockStats[memeStockArrayIndex].technicalAnalysisCount += 1
                    memeStockStats[memeStockArrayIndex].technicalAnalysisCommentsCount += submissions[i].num_comments
                    break;
                  case "SHITPOST":
                    memeStockStats[memeStockArrayIndex].shitpostCount += 1
                    memeStockStats[memeStockArrayIndex].shitpostCommentsCount += submissions[i].num_comments
                    break;
                  default:
                    //check if mega thread or just unflaired
                    if(currTitle.includes("MEGATHREAD")) {
                      memeStockStats[memeStockArrayIndex].megaThreadCount += 1
                      memeStockStats[memeStockArrayIndex].megaThreadCommentsCount += submissions[i].num_comments
                    }
                    else {
                      memeStockStats[memeStockArrayIndex].unflairedCount += 1
                      memeStockStats[memeStockArrayIndex].unflairedCommentsCount += submissions[i].num_comments
                    }
                  break
                }
              }
              //check if it is the user stock
              else if (currTitle.includes(userSuppliedTicker.ticker) || userSuppliedTicker.alt_names.some((element) => {currTitle.includes(element.toUpperCase())})) {
                let flair = (submissions[i].link_flair_text)? submissions[i].link_flair_text.toUpperCase(): "none";
                switch (flair) {
                  case "DD":
                    userSuppliedTicker.ddCount += 1
                    userSuppliedTicker.ddCommentsCount += submissions[i].num_comments
                    break;
                  case "DISCUSSION":
                    userSuppliedTicker.discussionCount += 1
                    userSuppliedTicker.discussionCommentsCount += submissions[i].num_comments
                    break;
                  case "CHARTS":
                    userSuppliedTicker.chartCount += 1
                    userSuppliedTicker.chartCommentsCount += submissions[i].num_comments
                    break;
                  case "YOLO":
                    userSuppliedTicker.yoloCount += 1
                    userSuppliedTicker.yoloCommentsCount += submissions[i].num_comments
                    break;
                  case "GAIN":
                    userSuppliedTicker.gainCount += 1
                    userSuppliedTicker.gainCommentsCount += submissions[i].num_comments
                    break;
                  case "LOSS":
                    userSuppliedTicker.lossCount += 1
                    userSuppliedTicker.lossCommentsCount += submissions[i].num_comments
                    break;
                  case "NEWS":
                    userSuppliedTicker.newsCount += 1
                    userSuppliedTicker.newsCommentsCount += submissions[i].num_comments
                    break;
                  case "TECHNICAL ANALYSIS":
                    userSuppliedTicker.technicalAnalysisCount += 1
                    userSuppliedTicker.technicalAnalysisCommentsCount += submissions[i].num_comments
                    break;
                  case "SHITPOST":
                    userSuppliedTicker.shitpostCount += 1
                    userSuppliedTicker.shitpostCommentsCount += submissions[i].num_comments
                    break;
                  default:
                    //check if mega thread or just unflaired
                    if(currTitle.includes("MEGATHREAD")) {
                      userSuppliedTicker.megaThreadCount += 1
                      userSuppliedTicker.megaThreadCommentsCount += submissions[i].num_comments
                    }
                    else {
                      userSuppliedTicker.unflairedCount += 1
                      userSuppliedTicker.unflairedCommentsCount += submissions[i].num_comments
                    }
                  break
                }
              }

            }

            let outStr = "wallstreetbets hype:\n"
            outStr += "\tMeme Stocks:\n"
            memeStockStats.map(element => {
              outStr += "\t\tTicker\t\t\t\t\t\t\t\t\t\t : " + element.ticker + "\n"
              outStr += "\t\tName\t\t\t\t\t\t\t\t\t\t\t : " + element.name + "\n"
              outStr += "\t\tMentions in Daily Thread\t : " + element.dailyThreadMention + "\n"
              outStr += "\t\tMegathreads\t\t\t\t\t\t\t\t: " + element.megaThreadCount + "\n"
              outStr += "\t\tMegathread Comment Count\t : " + element.megaThreadCommentsCount + "\n"
              outStr += "\t\tDD Posts\t\t\t\t\t\t\t\t\t : " + element.ddCount + "\n"
              outStr += "\t\tDD Comment Count\t\t\t\t\t : " + element.ddCommentsCount + "\n"
              outStr += "\t\tDiscussion Posts\t\t\t\t\t : " + element.discussionCount + "\n"
              outStr += "\t\tDiscussion Comment Count\t : " + element.discussionCommentsCount + "\n"
              outStr += "\t\tChart Posts\t\t\t\t\t\t\t\t: " + element.chartCount + "\n"
              outStr += "\t\tChart Comment Count\t\t\t\t: " + element.chartCommentsCount + "\n"
              outStr += "\t\tYOLO Posts\t\t\t\t\t\t\t\t : " + element.yoloCount + "\n"
              outStr += "\t\tYOLO Comment Count\t\t\t\t : " + element.yoloCommentsCount + "\n"
              outStr += "\t\tGain Posts\t\t\t\t\t\t\t\t : " + element.gainCount + "\n"
              outStr += "\t\tGain Comment Count\t\t\t\t : " + element.gainCommentsCount + "\n"
              outStr += "\t\tLoss Posts\t\t\t\t\t\t\t\t : " + element.lossCount + "\n"
              outStr += "\t\tLoss Comment Count\t\t\t\t : " + element.lossCommentsCount + "\n"
              outStr += "\t\tMeme Posts\t\t\t\t\t\t\t\t : " + element.memeCount + "\n"
              outStr += "\t\tMeme Comment Count\t\t\t\t : " + element.memeCommentsCount + "\n"
              outStr += "\t\tNews Posts\t\t\t\t\t\t\t\t : " + element.newsCount + "\n"
              outStr += "\t\tNews Comment Count\t\t\t\t : " + element.newsCommentsCount + "\n"
              outStr += "\t\tTech Analysis Posts\t\t\t\t: " + element.technicalAnalysisCount + "\n"
              outStr += "\t\tTech Analysis Comment Count: " + element.technicalAnalysisCommentsCount + "\n"
              outStr += "\t\tShitpost Posts\t\t\t\t\t\t : " + element.shitpostCount + "\n"
              outStr += "\t\tShitpost Comment Count\t\t : " + element.shitpostCommentsCount + "\n"
              outStr += "\t\tUnflaired Posts\t\t\t\t\t\t: " + element.unflairedCount + "\n"
              outStr += "\t\tUnflaired Comment Count\t\t: " + element.unflairedCommentsCount + "\n"
              outStr += "\n"
              message.channel.send(outStr);
              outStr = ""
            })
            outStr += "\tUser Supplied Stock:\n"
            outStr += "\t\tTicker\t\t\t\t\t\t\t\t\t\t : " + userSuppliedTicker.ticker + "\n"
            outStr += "\t\tName\t\t\t\t\t\t\t\t\t\t\t : " + userSuppliedTicker.alt_names + "\n"
            outStr += "\t\tMentions in Daily Thread\t : " + userSuppliedTicker.dailyThreadMention + "\n"
            outStr += "\t\tMegathreads\t\t\t\t\t\t\t\t: " + userSuppliedTicker.megaThreadCount + "\n"
            outStr += "\t\tMegathread Comment Count\t : " + userSuppliedTicker.megaThreadCommentsCount + "\n"
            outStr += "\t\tDD Posts\t\t\t\t\t\t\t\t\t : " + userSuppliedTicker.ddCount + "\n"
            outStr += "\t\tDD Comment Count\t\t\t\t\t : " + userSuppliedTicker.ddCommentsCount + "\n"
            outStr += "\t\tDiscussion Posts\t\t\t\t\t : " + userSuppliedTicker.discussionCount + "\n"
            outStr += "\t\tDiscussion Comment Count\t : " + userSuppliedTicker.discussionCommentsCount + "\n"
            outStr += "\t\tChart Posts\t\t\t\t\t\t\t\t: " + userSuppliedTicker.chartCount + "\n"
            outStr += "\t\tChart Comment Count\t\t\t\t: " + userSuppliedTicker.chartCommentsCount + "\n"
            outStr += "\t\tYOLO Posts\t\t\t\t\t\t\t\t : " + userSuppliedTicker.yoloCount + "\n"
            outStr += "\t\tYOLO Comment Count\t\t\t\t : " + userSuppliedTicker.yoloCommentsCount + "\n"
            outStr += "\t\tGain Posts\t\t\t\t\t\t\t\t : " + userSuppliedTicker.gainCount + "\n"
            outStr += "\t\tGain Comment Count\t\t\t\t : " + userSuppliedTicker.gainCommentsCount + "\n"
            outStr += "\t\tLoss Posts\t\t\t\t\t\t\t\t : " + userSuppliedTicker.lossCount + "\n"
            outStr += "\t\tLoss Comment Count\t\t\t\t : " + userSuppliedTicker.lossCommentsCount + "\n"
            outStr += "\t\tMeme Posts\t\t\t\t\t\t\t\t : " + userSuppliedTicker.memeCount + "\n"
            outStr += "\t\tMeme Comment Count\t\t\t\t : " + userSuppliedTicker.memeCommentsCount + "\n"
            outStr += "\t\tNews Posts\t\t\t\t\t\t\t\t : " + userSuppliedTicker.newsCount + "\n"
            outStr += "\t\tNews Comment Count\t\t\t\t : " + userSuppliedTicker.newsCommentsCount + "\n"
            outStr += "\t\tTech Analysis Posts\t\t\t\t: " + userSuppliedTicker.technicalAnalysisCount + "\n"
            outStr += "\t\tTech Analysis Comment Count: " + userSuppliedTicker.technicalAnalysisCommentsCount + "\n"
            outStr += "\t\tShitpost Posts\t\t\t\t\t\t : " + userSuppliedTicker.shitpostCount + "\n"
            outStr += "\t\tShitpost Comment Count\t\t : " + userSuppliedTicker.shitpostCommentsCount + "\n"
            outStr += "\t\tUnflaired Posts\t\t\t\t\t\t: " + userSuppliedTicker.unflairedCount + "\n"
            outStr += "\t\tUnflaired Comment Count\t\t: " + userSuppliedTicker.unflairedCommentsCount + "\n"
            outStr += "\n"
            message.channel.send(outStr);
            outStr = ""

            outStr += "Analysis and ratios to come; not all posts and comments on the daily thread were analyzed\n\n"
            outStr += "Daily Thread Comments Counted: " + totalCommentCount + "\n"
            outStr += "Posts Counted: " + submissions.length + "\n"
            // let memeCount = 0;
            // console.log("Percent Meme on the:     " + ((memeCount/totalCommentCount).toFixed(4) * 100) + "%");
            message.channel.send(outStr);
            // console.log(outStr);
            // message.channel.send("Check logs; built response is too big");
          }).catch(err => {
            console.log(err);
          })
        }).catch(err => {
          console.log(err);
        })
      })
    }
  }
  else if (command === 'add-meme-ticker') {
    if (args.length !== 2) {
      if (memeTickerList.some(element => element.ticker === args[0].toUpperCase())) {
        message.channel.send("Ticker is already in the meme ticker list");
      }
      else {
        memeTickerList.push({ticker: (args[0].toUpperCase()), name:args[1]})
        fs.writeFile("./assets/memeStocks.json", JSON.stringify(memeTickerList), (err) => {
          if (err) {
            console.log("ERROR: " + err);
            message.channel.send("Error adding " + args[0].toUpperCase() + "to the meme ticker list. Contact author if this persists");
          }
          else {
            message.channel.send("Added " + args[0].toUpperCase() + "to the meme ticker list successfully!");
          }
        })
      }
    }
    else {
      message.channel.send("Missing Args; I need a ticker, then the company name i.e `AAPL Apple`");
    }
  }
});
