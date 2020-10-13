const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")
const puppeteerFetch = require("../helpers/puppeteerFetch")

const ambitiousKitchen = url => {
  return new Promise(async (resolve, reject) => {
    if (!url.includes("ambitiouskitchen.com")) {
      reject(new Error("url provided must include 'ambitiouskitchen.com'"))
    } else {
      try {
        const html = await puppeteerFetch(url)
        const Recipe = new RecipeSchema()
        const $ = cheerio.load(html)

        Recipe.url = url
        Recipe.imageUrl = $("meta[property='og:image']").attr("content")
        Recipe.name = $(".wprm-recipe-name").text()

        $(".wprm-recipe-ingredient").each((i, el) => {
          let amount = $(el)
            .find(".wprm-recipe-ingredient-amount")
            .text()
          let unit = $(el)
            .find(".wprm-recipe-ingredient-unit")
            .text()
          let name = $(el)
            .find(".wprm-recipe-ingredient-name")
            .text()
          let ingredient = `${amount} ${unit} ${name}`
            .replace(/\s\s+/g, " ")
            .trim()
          Recipe.recipeIngredient.push(ingredient)
        })

        $(".wprm-recipe-instruction").each((i, el) => {
          Recipe.recipeInstructions.push(
            $(el)
              .text()
              .replace(/\s\s+/g, "")
          )
        })

        Recipe.prepTime =
          $(".wprm-recipe-prep_time").text() +
            " " +
            $(".wprm-recipe-prep_time-unit").text() || ""
        Recipe.cookTime =
          $(".wprm-recipe-cook_time").text() +
            " " +
            $(".wprm-recipe-cook_time-unit").text() || ""
        Recipe.totalTime =
          $(".wprm-recipe-total_time").text() +
            " " +
            $(".wprm-recipe-total_time-unit").text() || ""
        Recipe.recipeYield = $(".wprm-recipe-servings").text() || ""

        if (
          !Recipe.name ||
          !Recipe.recipeIngredient.length ||
          !Recipe.recipeInstructions.length
        ) {
          reject(new Error("No recipe found on page"))
        } else {
          var json_ld_obj = Recipe
            
            if ("@Context" in json_ld_obj === false) {
              json_ld_obj["@Context"] = "http:\/\/schema.org"
            }

            if (!"@type" in json_ld_obj === false) {
              json_ld_obj["@type"] = "Recipe"
            }

            resolve(json_ld_obj)
        }
      } catch (error) {
        reject(new Error("No recipe found on page"))
      }
    }
  })
}

module.exports = ambitiousKitchen
