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
var audioPlaying = false

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    message.channel.send('Here are a list of commands: \n * `!help`\n * `!money-printer`\n * `!what`' +
    '\n * `!sample-chart`\n * `!gnpc-graph [start YYYY-MM-DD]`\n * `!get [ticker]`' +
    '\n * `!news-score [ticker]`\n * `!hype-score [ticker] [name] [other aliases]`' +
    '\n * `!social-score [ticker]`\n * `!add-meme-ticker [ticker] [name]`' +
    '\n * `!m2-velocity-graph [start YYYY-MM-DD]`\n * `!m2-stock-graph [start YYYY-MM-DD]`' +
    '\n * `!bitcoin-graph [start YYYY-MM-DD]`\n * `!total-corporate-debt-graph [start YYYY-MM-DD]`');//\n * `!gold-graph [start YYYY-MM-DD]`
  }
  else if (command === 'money-printer') {
    message.channel.send('BRRRRRRR');
  }
  else if (command === 'what') {
    message.channel.send('I am a bot that grabs data from the Federal Reserve Economic Data from St Louis!');
  }
  else if (command === 'sounds') {
    message.channel.send('Commands to play sounds in the voice channel you are in:' +
    '\n * `!grunt` or `!1`\n * `!win` or `!2`\n * `!loser` or `!3`\n * `!metal-gear` or `!4`' +
    '\n * `!wah` or `!5`\n * `!error` or `!6`\n * `!finish-him` or `!7`\n * `!roger-roger` or `!8`' +
    '\n * `!airhorn` or `!9`\n * `!seinfeld` or `!10`\n * `!boot` or `!11`\n * `!x-files` or `!12`' +
    '\n * `!money` or `!13`\n * `!thx` or `!14`');
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
      chart.yAxis().title("Billions of Dollars")
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
  else if (command === 'gnpc-graph') {
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
      chart.yAxis().title("Billions of Dollars")
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

            let outStr = ""

            // outStr = "wallstreetbets hype:\n"
            // outStr += "\tMeme Stocks:\n"
            // message.channel.send(outStr);
            // outStr = ""
            // memeStockStats.map(element => {
            //   outStr += "`Ticker                        : " + element.ticker + "`\n"
            //   outStr += "`Name                          : " + element.name + "`\n"
            //   outStr += "`Mentions in Daily Thread      : " + element.dailyThreadMention + "`\n"
            //   outStr += "`Megathreads                   : " + element.megaThreadCount + "`\n"
            //   outStr += "`Megathread Comment Count      : " + element.megaThreadCommentsCount + "`\n"
            //   outStr += "`DD Posts                      : " + element.ddCount + "`\n"
            //   outStr += "`DD Comment Count              : " + element.ddCommentsCount + "`\n"
            //   outStr += "`Discussion Posts              : " + element.discussionCount + "`\n"
            //   outStr += "`Discussion Comment Count      : " + element.discussionCommentsCount + "`\n"
            //   outStr += "`Chart Posts                   : " + element.chartCount + "`\n"
            //   outStr += "`Chart Comment Count           : " + element.chartCommentsCount + "`\n"
            //   outStr += "`YOLO Posts                    : " + element.yoloCount + "`\n"
            //   outStr += "`YOLO Comment Count            : " + element.yoloCommentsCount + "`\n"
            //   outStr += "`Gain Posts                    : " + element.gainCount + "`\n"
            //   outStr += "`Gain Comment Count            : " + element.gainCommentsCount + "`\n"
            //   outStr += "`Loss Posts                    : " + element.lossCount + "`\n"
            //   outStr += "`Loss Comment Count            : " + element.lossCommentsCount + "`\n"
            //   outStr += "`Meme Posts                    : " + element.memeCount + "`\n"
            //   outStr += "`Meme Comment Count            : " + element.memeCommentsCount + "`\n"
            //   outStr += "`News Posts                    : " + element.newsCount + "`\n"
            //   outStr += "`News Comment Count            : " + element.newsCommentsCount + "`\n"
            //   outStr += "`Tech Analysis Posts           : " + element.technicalAnalysisCount + "`\n"
            //   outStr += "`Tech Analysis Comment Count   : " + element.technicalAnalysisCommentsCount + "`\n"
            //   outStr += "`Shitpost Posts                : " + element.shitpostCount + "`\n"
            //   outStr += "`Shitpost Comment Count        : " + element.shitpostCommentsCount + "`\n"
            //   outStr += "`Unflaired Posts               : " + element.unflairedCount + "`\n"
            //   outStr += "`Unflaired Comment Count       : " + element.unflairedCommentsCount + "`\n"
            //   outStr += "\n"
            //   message.channel.send(outStr);
            //   outStr = ""
            // })
            let memeStockStatsTotal = {
              name: "Meme Stock Average",
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
            memeStockStats.map(element => {
              memeStockStatsTotal.dailyThreadMention += element.dailyThreadMention
              memeStockStatsTotal.megaThreadCount += element.megaThreadCount
              memeStockStatsTotal.megaThreadCommentsCount += element.megaThreadCommentsCount
              memeStockStatsTotal.ddCount += element.ddCount
              memeStockStatsTotal.ddCommentsCount += element.ddCommentsCount
              memeStockStatsTotal.discussionCount += element.discussionCount
              memeStockStatsTotal.discussionCommentsCount += element.discussionCommentsCount
              memeStockStatsTotal.chartCount += element.chartCount
              memeStockStatsTotal.chartCommentsCount += element.chartCommentsCount
              memeStockStatsTotal.yoloCount += element.yoloCount
              memeStockStatsTotal.yoloCommentsCount += element.yoloCommentsCount
              memeStockStatsTotal.gainCount += element.gainCount
              memeStockStatsTotal.gainCommentsCount += element.gainCommentsCount
              memeStockStatsTotal.lossCount += element.lossCount
              memeStockStatsTotal.lossCommentsCount += element.lossCommentsCount
              memeStockStatsTotal.memeCount += element.memeCount
              memeStockStatsTotal.memeCommentsCount += element.memeCommentsCount
              memeStockStatsTotal.newsCount += element.newsCount
              memeStockStatsTotal.newsCommentsCount += element.newsCommentsCount
              memeStockStatsTotal.technicalAnalysisCount += element.technicalAnalysisCount
              memeStockStatsTotal.technicalAnalysisCommentsCount += element.technicalAnalysisCommentsCount
              memeStockStatsTotal.shitpostCount += element.shitpostCount
              memeStockStatsTotal.shitpostCommentsCount += element.shitpostCommentsCount
              memeStockStatsTotal.unflairedCount += element.unflairedCount
              memeStockStatsTotal.unflairedCommentsCount += element.unflairedCommentsCount
            })

            memeStockStatsTotal.dailyThreadMention = Math.ceil(memeStockStatsTotal.dailyThreadMention/memeStockStats.length)
            memeStockStatsTotal.megaThreadCount = Math.ceil(memeStockStatsTotal.megaThreadCoun/memeStockStats.length)
            memeStockStatsTotal.megaThreadCommentsCount = Math.ceil(memeStockStatsTotal.megaThreadCommentsCount/memeStockStats.length)
            memeStockStatsTotal.ddCount = Math.ceil(memeStockStatsTotal.ddCount/memeStockStats.length)
            memeStockStatsTotal.ddCommentsCount = Math.ceil(memeStockStatsTotal.ddCommentsCount/memeStockStats.length)
            memeStockStatsTotal.discussionCount = Math.ceil(memeStockStatsTotal.discussionCount/memeStockStats.length)
            memeStockStatsTotal.discussionCommentsCount = Math.ceil(memeStockStatsTotal.discussionCommentsCount/memeStockStats.length)
            memeStockStatsTotal.chartCount = Math.ceil(memeStockStatsTotal.chartCount/memeStockStats.length)
            memeStockStatsTotal.chartCommentsCount = Math.ceil(memeStockStatsTotal.chartCommentsCount/memeStockStats.length)
            memeStockStatsTotal.yoloCount = Math.ceil(memeStockStatsTotal.yoloCount/memeStockStats.length)
            memeStockStatsTotal.yoloComments = Math.ceil(memeStockStatsTotal.yoloComments/memeStockStats.length)
            memeStockStatsTotal.gainCount = Math.ceil(memeStockStatsTotal.gainCount/memeStockStats.length)
            memeStockStatsTotal.gainComments = Math.ceil(memeStockStatsTotal.gainComments/memeStockStats.length)
            memeStockStatsTotal.lossCount = Math.ceil(memeStockStatsTotal.lossCount/memeStockStats.length)
            memeStockStatsTotal.lossComments = Math.ceil(memeStockStatsTotal.lossComment/memeStockStats.length)
            memeStockStatsTotal.memeCount = Math.ceil(memeStockStatsTotal.memeCount/memeStockStats.length)
            memeStockStatsTotal.memeComments = Math.ceil(memeStockStatsTotal.memeComments/memeStockStats.length)
            memeStockStatsTotal.newsCount = Math.ceil(memeStockStatsTotal.newsCount/memeStockStats.length)
            memeStockStatsTotal.newsCommentsCount = Math.ceil(memeStockStatsTotal.newsCommentsCount/memeStockStats.length)
            memeStockStatsTotal.technicalAnalysisCount = Math.ceil(memeStockStatsTotal.technicalAnalysisCount/memeStockStats.length)
            memeStockStatsTotal.technicalAnalysisCommentsCount = Math.ceil(memeStockStatsTotal.technicalAnalysisCommentsCount/memeStockStats.length)
            memeStockStatsTotal.shitpostCount = Math.ceil(memeStockStatsTotal.shitpostCount/memeStockStats.length)
            memeStockStatsTotal.shitpostCommentsCount = Math.ceil(memeStockStatsTotal.shitpostCommentsCount/memeStockStats.length)
            memeStockStatsTotal.unflairedCount = Math.ceil(memeStockStatsTotal.unflairedCount/memeStockStats.length)
            memeStockStatsTotal.unflairedCommentsCount = Math.ceil(memeStockStatsTotal.unflairedCommentsCount/memeStockStats.length)

            outStr += "Hypescore for " + userSuppliedTicker.ticker + " with alt names: " + userSuppliedTicker.alt_names + "\n"
            outStr += (userSuppliedTicker.dailyThreadMention)? "`User Stock Mentions in Daily Thread       : " + userSuppliedTicker.dailyThreadMention + "`\n`Avg Meme Stock Mentions in Daily Thread   : " + memeStockStatsTotal.dailyThreadMention + "`\n": "";
            outStr += (userSuppliedTicker.megaThreadCount)? "`User Stock Megathreads                    : " + userSuppliedTicker.megaThreadCount + "`\n`Avg Meme Stock Megathreads                : " + memeStockStatsTotal.megaThreadCount + "`\n": "";
            outStr += (userSuppliedTicker.megaThreadCommentsCount)? "`User Stock Megathread Comment Count       : " + userSuppliedTicker.megaThreadCommentsCount + "`\n`Avg Meme Stock Megathread Comment Count   : " + memeStockStatsTotal.megaThreadCommentsCount + "`\n": "";
            outStr += (userSuppliedTicker.ddCount)? "`User Stock DD Posts                       : " + userSuppliedTicker.ddCount + "`\n`Avg Meme Stock DD Posts                   : " + memeStockStatsTotal.ddCount + "`\n": "";
            outStr += (userSuppliedTicker.ddCommentsCount)? "`User Stock DD Comment Count               : " + userSuppliedTicker.ddCommentsCount + "`\n`Avg Meme Stock DD Comment Count           : " + memeStockStatsTotal.ddCommentsCount + "`\n": "";
            outStr += (userSuppliedTicker.discussionCount)? "`User Stock Discussion Posts               : " + userSuppliedTicker.discussionCount + "`\n`Avg Meme Stock Discussion Posts           : " + memeStockStatsTotal.discussionCount + "`\n": "";
            outStr += (userSuppliedTicker.discussionCommentsCount)? "`User Stock Discussion Comment Count       : " + userSuppliedTicker.discussionCommentsCount + "`\n`Avg Meme Stock Discussion Comment Count   : `" + memeStockStatsTotal.discussionCommentsCount + "`\n": "";
            outStr += (userSuppliedTicker.chartCount)? "`User Stock Chart Posts                    : " + userSuppliedTicker.chartCount + "`\n`Avg Meme Stock Chart Posts                : " + memeStockStatsTotal.chartCount + "`\n": "";
            outStr += (userSuppliedTicker.chartCommentsCount)? "`User Stock Chart Comment Count            : " + userSuppliedTicker.chartCommentsCount + "`\n`Avg Meme Stock Chart Comment Count: `" + memeStockStatsTotal.chartCommentsCount + "`\n": "";
            outStr += (userSuppliedTicker.yoloCount)? "`User Stock YOLO Posts                     : " + userSuppliedTicker.yoloCount + "`\n`Avg Meme Stock YOLO Posts                 : " + memeStockStatsTotal.yoloCount + "`\n": "";
            outStr += (userSuppliedTicker.yoloCommentsCount)? "`User Stock YOLO Comment Count             : " + userSuppliedTicker.yoloCommentsCount + "`\n`Avg Meme Stock YOLO Comment Count         : `" + memeStockStatsTotal.yoloComments + "`\n": "";
            outStr += (userSuppliedTicker.gainCount)? "`User Stock Gain Posts                     : " + userSuppliedTicker.gainCount + "`\n`Avg Meme Stock Gain Posts                 : " + memeStockStatsTotal.gainCount + "`\n": "";
            outStr += (userSuppliedTicker.gainCommentsCount)? "`User Stock Gain Comment Count             : " + userSuppliedTicker.gainCommentsCount + "`\n`Avg Meme Stock Gain Comment Count         : `" + memeStockStatsTotal.gainComments + "`\n": "";
            outStr += (userSuppliedTicker.lossCount)? "`User Stock Loss Posts                     : " +userSuppliedTicker.lossCoun  + "`\n`Avg Meme Stock Loss Posts                 : " + memeStockStatsTotal.lossCount + "`\n": "";
            outStr += (userSuppliedTicker.lossCommentsCount)? "`User Stock Loss Comment Count             : " + userSuppliedTicker.lossCommentsCount + "`\n`Avg Meme Stock Loss Comment Count         : `" + memeStockStatsTotal.lossComments + "`\n": "";
            outStr += (userSuppliedTicker.memeCount)? "`User Stock Meme Posts                     : " + userSuppliedTicker.memeCount + "`\n`Avg Meme Stock Meme Posts                 : " + memeStockStatsTotal.memeCount + "`\n": "";
            outStr += (userSuppliedTicker.memeCommentsCount)? "`User Stock Meme Comment Count             : " + userSuppliedTicker.memeCommentsCount + "`\n`Avg Meme Stock Meme Comment Count         : `" + memeStockStatsTotal.memeComments + "`\n": "";
            outStr += (userSuppliedTicker.newsCount)? "`User Stock News Posts                     : " + userSuppliedTicker.newsCount + "`\n`Avg Meme Stock News Posts                 : " + memeStockStatsTotal.newsCount + "`\n": "";
            outStr += (userSuppliedTicker.newsCommentsCount)? "`User Stock News Comment Count             : " + userSuppliedTicker.newsCommentsCount + "`\n`Avg Meme Stock News Comment Count         : " + memeStockStatsTotal.newsCommentsCount + "`\n": "";
            outStr += (userSuppliedTicker.technicalAnalysisCount)? "`User Stock Tech Analysis Posts            : " + userSuppliedTicker.technicalAnalysisCount + "`\n`Avg Meme Stock Tech Analysis Posts        : " + memeStockStatsTotal.technicalAnalysisCount + "`\n": "";
            outStr += (userSuppliedTicker.technicalAnalysisCommentsCount)? "`User Stock Tech Analysis Comment Count    : " + userSuppliedTicker.technicalAnalysisCommentsCount + "`\n`Avg Meme Stock Tech Analysis Comment Count: " + memeStockStatsTotal.technicalAnalysisCommentsCount + "`\n": "";
            outStr += (userSuppliedTicker.shitpostCount)? "`User Stock Shitpost Posts                 : " + userSuppliedTicker.shitpostCount + "`\n`Avg Meme Stock Shitpost Posts             : " + memeStockStatsTotal.shitpostCount + "`\n": "";
            outStr += (userSuppliedTicker.shitpostCommentsCount)? "`User Stock Shitpost Comment Count         : " + userSuppliedTicker.shitpostCommentsCount + "`\n`Avg Meme Stock Shitpost Comment Count     : " + memeStockStatsTotal.shitpostCommentsCount + "`\n": "";
            outStr += (userSuppliedTicker.unflairedCount)? "`User Stock Unflaired Posts                : " + userSuppliedTicker.unflairedCount + "`\n`Avg Meme Stock Unflaired Posts            : " + memeStockStatsTotal.unflairedCount + "`\n": "";
            outStr += (userSuppliedTicker.unflairedCommentsCount)? "`User Stock Unflaired Comment Count        : " + userSuppliedTicker.unflairedCommentsCount + "`\n`Avg Meme Stock Unflaired Comment Count    : " + memeStockStatsTotal.unflairedCommentsCount + "`\n": "";

            // outStr += "\tUser Supplied Stock:\n"
            // outStr += "`Ticker                        : " + userSuppliedTicker.ticker + "`\n"
            // outStr += "`Name(s)                       : " + userSuppliedTicker.alt_names + "`\n"
            // outStr += "`Mentions in Daily Thread      : " + userSuppliedTicker.dailyThreadMention + "`\n"
            // outStr += "`Megathreads                   : " + userSuppliedTicker.megaThreadCount + "`\n"
            // outStr += "`Megathread Comment Count      : " + userSuppliedTicker.megaThreadCommentsCount + "`\n"
            // outStr += "`DD Posts                      : " + userSuppliedTicker.ddCount + "`\n"
            // outStr += "`DD Comment Count              : " + userSuppliedTicker.ddCommentsCount + "`\n"
            // outStr += "`Discussion Posts              : " + userSuppliedTicker.discussionCount + "`\n"
            // outStr += "`Discussion Comment Count      : " + userSuppliedTicker.discussionCommentsCount + "`\n"
            // outStr += "`Chart Posts                   : " + userSuppliedTicker.chartCount + "`\n"
            // outStr += "`Chart Comment Count           : " + userSuppliedTicker.chartCommentsCount + "`\n"
            // outStr += "`YOLO Posts                    : " + userSuppliedTicker.yoloCount + "`\n"
            // outStr += "`YOLO Comment Count            : " + userSuppliedTicker.yoloCommentsCount + "`\n"
            // outStr += "`Gain Posts                    : " + userSuppliedTicker.gainCount + "`\n"
            // outStr += "`Gain Comment Count            : " + userSuppliedTicker.gainCommentsCount + "`\n"
            // outStr += "`Loss Posts                    : " + userSuppliedTicker.lossCount + "`\n"
            // outStr += "`Loss Comment Count            : " + userSuppliedTicker.lossCommentsCount + "`\n"
            // outStr += "`Meme Posts                    : " + userSuppliedTicker.memeCount + "`\n"
            // outStr += "`Meme Comment Count            : " + userSuppliedTicker.memeCommentsCount + "`\n"
            // outStr += "`News Posts                    : " + userSuppliedTicker.newsCount + "`\n"
            // outStr += "`News Comment Count            : " + userSuppliedTicker.newsCommentsCount + "`\n"
            // outStr += "`Tech Analysis Posts           : " + userSuppliedTicker.technicalAnalysisCount + "`\n"
            // outStr += "`Tech Analysis Comment Count   : " + userSuppliedTicker.technicalAnalysisCommentsCount + "`\n"
            // outStr += "`Shitpost Posts                : " + userSuppliedTicker.shitpostCount + "`\n"
            // outStr += "`Shitpost Comment Count        : " + userSuppliedTicker.shitpostCommentsCount + "`\n"
            // outStr += "`Unflaired Posts               : " + userSuppliedTicker.unflairedCount + "`\n"
            // outStr += "`Unflaired Comment Count       : " + userSuppliedTicker.unflairedCommentsCount + "`\n"
            // outStr += "\n"
            message.channel.send(outStr);
            outStr = ""

            outStr += "Analysis and ratios to come; not all posts and comments on the daily thread were analyzed\n\n"
            outStr += "`Daily Thread Comments Counted : " + totalCommentCount + "`\n"
            outStr += "`Posts Counted                 : " + submissions.length + "`\n"
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
  else if (command === 'social-score') {
    fetch( config.finnhub_url + 'social-sentiment?' + "symbol=" + args[0].toUpperCase() + finnhubEndStr, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      }
    }).then(response => response.json()).then((responseJson) => {
      // console.log(responseJson);
      let outStr = "Social Sentiment for: " + args[0].toUpperCase()
      outStr += "\nReddit"
      outStr += "\nPosts/Mentions: " + responseJson.reddit[0].mention
      outStr += "\nPositive Score: " + responseJson.reddit[0].positiveScore
      outStr += "\nNegative Score: " + responseJson.reddit[0].negativeScore
      outStr += "\nPositive Mentions: " + responseJson.reddit[0].positiveMention
      outStr += "\nNegative Mentions: " + responseJson.reddit[0].negativeMention
      outStr += "\nScore: " + responseJson.reddit[0].score
      outStr += "\n\nTwitter"
      outStr += "\nPosts/Mentions: " + responseJson.reddit[0].mention
      outStr += "\nPositive Score: " + responseJson.reddit[0].positiveScore
      outStr += "\nNegative Score: " + responseJson.reddit[0].negativeScore
      outStr += "\nPositive Mentions: " + responseJson.reddit[0].positiveMention
      outStr += "\nNegative Mentions: " + responseJson.reddit[0].negativeMention
      outStr += "\nScore: " + responseJson.reddit[0].score
      message.channel.send(outStr);
    });
  }
  else if (command === 'add-meme-ticker') {
    if (args.length === 2) {
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
  else if (command === 'm2-velocity-graph') {
    fetch( config.fred_url + 'series/observations?' + "series_id=M2V&observation_start=" + args[0] + fredEndStr, {
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
      chart.title("Velocity of M2 Money Stock Since " + args[0])
      chart.yAxis().title("Ratio")
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
  else if (command === 'm2-stock-graph') {
    fetch( config.fred_url + 'series/observations?' + "series_id=M2SL&observation_start=" + args[0] + fredEndStr, {
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
      chart.title("M2 Money Stock Since " + args[0])
      chart.yAxis().title("Billions of Dollars")
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
  else if (command === 'bitcoin-graph') {
    fetch( config.fred_url + 'series/observations?' + "series_id=CBBTCUSD&observation_start=" + args[0] + fredEndStr, {
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
      chart.title("Bitcoin Price Since " + args[0])
      chart.yAxis().title("Dollars")
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
  // else if (command === 'gold-graph') {
  //   fetch( config.fred_url + 'series/observations?' + "series_id=GOLDAMGBD228NLBM&observation_start=" + args[0] + fredEndStr, {
  //     method: 'GET',
  //     headers: {
  //         'Content-Type': 'application/json',
  //     }
  //   }).then(response => response.json()).then((responseJson) => {
  //     // console.log(responseJson);
  //     let dataSet = []
  //
  //     for (var i = 0; i < responseJson.observations.length; i++) {
  //       let element = {
  //         x: responseJson.observations[i]['date'],
  //         value: Number(responseJson.observations[i]['value'])
  //       }
  //       // dataSet[i].date = responseJson.observations[i]['date']
  //       // dataSet[i].value = responseJson.observations[i]['value']
  //       dataSet = [...dataSet, element]
  //     }
  //
  //     // Create instance of JSDOM.
  //     var jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'});
  //     // Get window
  //     var window = jsdom.window;
  //     // require anychart and anychart export modules
  //     var anychart = require('anychart')(window);
  //     var anychartExport = require('anychart-nodejs')(anychart);
  //
  //     // create and a chart to the jsdom window.
  //     // chart creating should be called only right after anychart-nodejs module requiring
  //     var chart = anychart.line(dataSet);
  //     chart.bounds(0, 0, 1000, 1000);
  //     chart.title("Price of Gold in London Bullion Market Since " + args[0])
  //     chart.yAxis().title("Dollars per Troy Ounce")
  //     chart.container('container');
  //     chart.draw();
  //
  //     // generate pdf, convert to a png, and save it to a file
  //     anychartExport.exportTo(chart, 'pdf').then(function(image) {
  //       fs.writeFile('./outFolder/chart.pdf', image, function(fsWriteError) {
  //         if (fsWriteError) {
  //           console.log(fsWriteError);
  //         } else {
  //           im.convert(['./outFolder/chart.pdf', './outFolder/chart.png'], function(err, stdout){
  //             if (err) {
  //               console.log('Error:', err);
  //               throw err;
  //             }
  //             else {
  //               message.channel.send("Hey! Here is the chart:", { files: [{attachment: './outFolder/chart.png',name: 'chart.png'}]})
  //               .then(() => {
  //                 fs.unlink('./outFolder/chart.png', (err) => {
  //                   if (err) {
  //                     throw err
  //                   }
  //                   else {
  //                     fs.unlink('./outFolder/chart.pdf', (err) => {
  //                       if (err) throw err;
  //                     });
  //                   }
  //                 });
  //               })
  //               .catch(err => {
  //                 console.log(err);
  //               });
  //             }
  //           });
  //         }
  //       });
  //     }, function(generationError) {
  //       console.log(generationError);
  //     });
  //   })
  // }
  else if (command === 'total-corporate-debt-graph') {
    fetch( config.fred_url + 'series/observations?' + "series_id=BOGZ1FL894104005A&observation_start=" + args[0] + fredEndStr, {
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
      chart.title("All Corporate Debt Securities and Loans Since " + args[0])
      chart.yAxis().title("Millions of Dollars")
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
  else if (command === 'boot' || command === '11') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/PS1.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'grunt' || command === '1') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/timallen.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'finish-him' || command === '7') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/finishhim.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'metal-gear' || command === '4') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/metalgear.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'wah' || command === '5') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/wah.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'win' || command === '2') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/win.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'roger-roger' || command === '8') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/rogerx2.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'loser' || command === '3') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/loser.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'money' || command === '13') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/money.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'x-files' || command === '12') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/x-files.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'error' || command === '6') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/error.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'airhorn' || command === '9') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/airhorn.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'seinfeld' || command === '10') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/seinfeld.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
  else if (command === 'thx' || command === '14') {
    if (!audioPlaying && message.member.voice.channel) {
      message.member.voice.channel.join().then(VoiceConnection => {
        audioPlaying = true //TODO do this better
        VoiceConnection.play("./assets/thx.mp3").on("finish", () => {
          audioPlaying = false
          VoiceConnection.disconnect()
        });
      }).catch(e => {
        audioPlaying = false
        console.log(e)
      })
    }
  }
});
