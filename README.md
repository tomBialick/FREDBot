# FREDBot

Discord bot that will grab FRED data
https://fred.stlouisfed.org/docs/api/fred/


soon to come: command list

### Setup  
After cloning:  
* Run `npm install` inside the project directory
* Make a new directory in the project directory called `auth`  
* Inside `auth`, make a file called `creds.json` with the following inside:  
```json
{
  "secret":"<your discord bot secret>",
  "token":"<your discord bot token>",
  "fredKey":"<your FRED api key>",
  "finnhubKey":"<your Finnhub api key>",
  "redditUser":"<your Reddit username>",
  "redditPass":"<your Reddit password>",
  "redditID":"<your Reddit id>",
  "redditSecret":"<your Reddit secret key>"
}
```  

### Running  
In the project directory, run `node index.js`
