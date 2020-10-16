const parseDomain = require("parse-domain"); // In einer späteren Version hat sich etwas geändert?
const cheerio = require("cheerio");
const fetch = require('node-fetch')
// const axios = require('axios').default

const urlHelper = 'http://alloworigin.com/get?url='


const domains = {
  alexandracooks: require("./modules/alexandracooks"),
  allrecipes: require("./modules/allrecipes"),
  //use puppeteer ambitiouskitchen: require("./modules/ambitiouskitchen"),
  archanaskitchen: require("./modules/archanaskitchen"),
  budgetbytes: require("./modules/budgetbytes"),
  centraltexasfoodbank: require("./modules/centraltexasfoodbank"),
  //use puppeteer closetcooking: require("./modules/closetcooking"),
  cookieandkate: require("./modules/cookieandkate"),
  //use puppeteer copykat: require("./modules/copykat"),
  //use puppeteer damndelicious: require("./modules/damndelicious"),
  eatingwell: require("./modules/eatingwell"),
  epicurious: require("./modules/epicurious"),
  foodandwine: require("./modules/foodandwine"),
  foodnetwork: require("./modules/foodnetwork"),
  gimmesomeoven: require("./modules/gimmesomeoven"),
  maangchi: require("./modules/maangchi"),
  minimalistbaker: require("./modules/minimalistbaker"),
  myrecipes: require("./modules/myrecipes"),
  nigella: require("./modules/nigella"),
  //use puppeteer nomnompaleo: require("./modules/nomnompaleo"),
  omnivorescookbook: require("./modules/omnivorescookbook"),
  saveur: require("./modules/saveur"),
  smittenkitchen: require("./modules/smittenkitchen"),
  tastecooking: require("./modules/tastecooking"),
  //use puppeteer therealfoodrds: require("./modules/therealfoodrds"),
  thespruceeats: require("./modules/thespruceeats"),
  thewoksoflife: require("./modules/thewoksoflife"),
  vegrecipesofindia: require("./modules/vegrecipesofindia"),
  whatsgabycooking: require("./modules/whatsgabycooking"),
  woolworths: require("./modules/woolworths"),
  //use puppeteer yummly: require("./modules/yummly"),
  //"sallys-blog": require("./sallys-blog") //TODO: Scraper schreiben
};

const fallback = require("./modules/fallback")

/*
 * 1. Seite Parsen
 * 2. JSON-LD vorhanden?
 *   2.1 JA -->Weiter zu 3
 *   2.2 NEIN --> Prüfen, ob bereits ein Scrapper für die Seite existiert
 *   2.2.1 Ja --> JSON aus der Seite zusammenbauen
 *   2.2.2 Nein --> Default Scrapper probieren
 * 3. JSON an API übergeben
 */

const recipeScraper = url => {
  return new Promise((resolve, reject) => {

      getJson(url, parseRecipe, resolve, reject)

  })
}

function checkStatus(response) {
  if (response.ok) {
    // res.status >= 200 && res.status < 300
    console.log('Server Response: ' + response.status)
    return response;
  } else {
    console.log(myUrl + "Server Reponse: " + response.status)
    reject(new Error("No recipe found on page"))
  }
}

function getJson(myUrl, callback, resolve, reject) {

  //Hint: axios need res.data instead of res.text() for fetch
  // https://cors-anywhere.herokuapp.com
  //axios(`https://api.allorigins.win/get?url=${encodeURIComponent(myUrl)}`)
  // axios(urlHelper + myUrl)
  //fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(myUrl)}`)
  //https://api.allorigins.win/raw?url=https://example.org/
  fetch(myUrl) 
    .then(
      checkStatus)
    .then(res => res.text())
    .then(html => {

      const $ = cheerio.load(html)
      var json_ld_elements = $("script[type='application/ld+json']")

      for (var i in json_ld_elements) {
        for (var j in json_ld_elements[i].children) {
          var data = json_ld_elements[i].children[j].data
          if (data === undefined) {
            continue
          }

          try {
            // Some recipes have newlines inside quotes, which is invalid JSON. Fix this before continuing.
            // Old PHP: preg_replace('/\s+/', ' ', $string);
            data.replace('/\s+/', ' ')

            var json_ld_obj = JSON.parse(data)

            // Look through @graph field for recipe
            if (json_ld_obj && '@graph' in json_ld_obj && Array.isArray(json_ld_obj['@graph'])) {
              json_ld_obj['@graph'].forEach(graph => {
                if ('@type' in graph && graph["@type"] === "Recipe") {
                  if (!"@Context" in graph) {
                    graph["@Context"] = "http:\/\/schema.org"
                  }

                  if ('@type' in graph && graph["@type"] === "Recipe") {
                    //TODO: Check all Props, maybe some are missing eg. url

                    //console.log(JSON.stringify(json_ld_obj, undefined, 2))
                    //console.log(myUrl + " JSON: True")
                    return resolve(graph)
                  }
                }
              });
            }

          } catch (error) {
            // Es werden auch Elemente gedunfen die nicht konvertiert werden können
            continue
          }

          if ('@type' in json_ld_obj && json_ld_obj["@type"] === "Recipe") {

            //TODO: Check for missing Prop like url
            //console.log(JSON.stringify(json_ld_obj, undefined, 2))
            //console.log(myUrl + " JSON: True")
            return resolve(json_ld_obj)
          }
        }
      }
      return callback(myUrl, html, resolve, reject)
    })
    .catch(err => {
      console.log('NO ld+json found.')
      reject(new Error(err))
    })
}

function parseRecipe(myUrl, html, resolve, reject) {
  let parse = parseDomain(myUrl)

  console.log('SCRAPER')

  if (parse) {
    let domain = parse.domain;
    if (domains[domain] !== undefined) {
      resolve(domains[domain](myUrl, html))

    } else {
      resolve(fallback(myUrl, html))
    }
  } else {
    reject(new Error("Failed to parse domain"))
  }
}

//TODO: Recipe-XML to JSON
const xmlToJson = () => {
  return new Promise((resolve, reject) => {

  })
}


module.exports = recipeScraper
//module.exports = xmlToJson