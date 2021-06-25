const express = require("express")
const fetch = require("node-fetch")
const { parseHTML } = require("linkedom")
const app = express()

app.get('/', (req, res) => {
  res.redirect(`https://FunctionalMetatable.github.io/blog/api`) // TODO
})

app.get('/gh/user/:user', async (req, res) => {
  // Fetch user status
  let htmlRes = await fetch(`https://github.com/${req.params.user}`)

  let { window, document } = parseHTML(await htmlRes.text())

  let status = document.querySelector("div[data-team-hovercards-enabled]").innerText.substring(1) || null

  let emoji = document.querySelector("#js-pjax-container > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.flex-shrink-0.col-12.col-md-3.mb-4.mb-md-0 > div > div.clearfix.d-flex.d-md-block.flex-items-center.mb-4.mb-md-0 > div.position-relative.d-inline-block.col-2.col-md-12.mr-3.mr-md-0.flex-shrink-0 > div > div > div > details > summary > div > div.f6.lh-condensed.user-status-header.d-inline-flex.user-status-emoji-only-header.circle > div > div > g-emoji")

  emoji = emoji ? emoji.innerText : ""

  let jsonRes = await fetch(`https://api.github.com/users/${req.params.user}`)

  let json = await jsonRes.json()

  json.status = {
    status,
    emoji
  }

  res.header("Access-Control-Allow-Origin", "*") // yay
  res.status(200).json(json)
})

app.get('/scratch/user/:user/activity', async (req, res) => {
  let resp = await fetch(`https://scratch.mit.edu/messages/ajax/user-activity/?user=${req.params.user}&max=100`)
  let { window, document } = parseHTML(await resp.text())

  let all = Array.from(document.querySelectorAll("li"))

  var objects = []

  all.forEach((el) => {
    var object = {}
    object.actor = el.querySelector(".actor").innerText
    object.actedOn = el.querySelector("a").href
    object.time = el.querySelector(".time").innerText

    // Remove all unneeded elements
    el.querySelector(".actor").remove()
    el.querySelector("a").remove()
    el.querySelector(".time").remove()

    let e = el.querySelector("a")

    if (e) {
      object.link2 = e.href
      e.remove()
    }
    
    let text = el.querySelector("div").innerText

    if (/is now following the studio/g.match(text)) {
      object.type = "follow_studio"
    } else if (/is now following/g.match(text)) {
      object.type = "follow_user"
    } else if (/loved/g.match(text)) {
      object.type = "loved_project"
    } else if (/favorited/g.match(text)) {
      object.type = "favorited_project"
    } else if (/shared the project/g.match(text)) {
      object.type = "shared_project"
    } else if (/was promoted to manager of/g.match(text)) {
      object.type = "studio_promotion"
    } else if (/became a curator of/g.match(text)) {
      object.type = "studio_membership"
    } else if (/remixed/g.match(text)) {
      object.type = "remixed_project"
      object.remixedProject = object.link2
      object.link2 = undefined
    } else if (/to the studio/g.match(text)) {
      object.type = "project_added_to_studio"
      object.project = object.actedOn
      object.actedOn = object.link2
      object.link2 = null
    }
    console.dir(object)
    objects.push(object)
  })
  res.json(objects)
})

// app.listen(2000)
module.exports = app