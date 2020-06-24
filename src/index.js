const puppeteer = require('puppeteer')
const cron = require('node-cron')
const express = require('express')
const fs = require('fs');

const app = express()

app.listen(4000)

const getDataFromPuppeteer = async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://pathofexile.gamepedia.com/Divination_card')

    await page.screenshot({
      path: 'src/images/screenshot.png'
    })

    await page.pdf({
      path: 'src/pdfs/website.pdf'
    })

    const table = await page.evaluate(() => Array.from (document.querySelectorAll('.wikitable:first-child span.c-item-hoverbox__activator a'), element => element.href))

    let regExpre = /\/{1}((\w|%)+\.\w{3})\?{1}/
    const useTable = [...table].slice(1, 2)
    for (let i = 0; i < useTable.length; i ++) {
      try {
        console.log('goTo:: ', useTable[i])
        await page.goto(useTable[i], { waitUntil: 'load' })
        const img = await page.evaluate(() => document.querySelector('.divicard-art img').src)
        console.log('img:: ', img)
        const name = img.match(regExpre)[0].substring(1).slice(0, -1).toLowerCase()
        console.log('name:: ', name)

        var viewSource = await page.goto(img, { waitUntil: 'load' })
        fs.writeFile(`src/images/${name}`, await viewSource.buffer(), function (err) {
          if (err) return console.log(err);
        })
      } catch (error) {
        console.log('useTable:: ', error)
      }
  }

    console.log('table[0] ::', table)

    console.log('Puppeteer ha terminado')
    await browser.close()

  } catch (error) {
    console.log('error ::', error)
  }
}

cron.schedule("* * * * *", function() {
  getDataFromPuppeteer()
  console.log("running a task every minute");
});