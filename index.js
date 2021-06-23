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

  let status = document.querySelector("div[data-team-hovercards-enabled]")?.innerText.substring(1) || null

  let emoji = document.querySelector("#js-pjax-container > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.flex-shrink-0.col-12.col-md-3.mb-4.mb-md-0 > div > div.clearfix.d-flex.d-md-block.flex-items-center.mb-4.mb-md-0 > div.position-relative.d-inline-block.col-2.col-md-12.mr-3.mr-md-0.flex-shrink-0 > div > div > div > details > summary > div > div.f6.lh-condensed.user-status-header.d-inline-flex.user-status-emoji-only-header.circle > div > div > g-emoji")?.innerText

  let jsonRes = await fetch(`https://api.github.com/users/${req.params.user}`)

  let json = await jsonRes.json()

  json.status = {
    status,
    emoji
  }

  res.json(json)
})

export default app