'use strict'

const fs = require('fs')
const rp = require('request-promise')
const $ = require('cheerio')

const pagination = process.env.PAG || 1
const baseUrl = 'https://www.pensador.com'
const path = `/frases_de_motivacao/${pagination}/`

const _parse = url =>
  rp(url)
    .then(html => {
      const quote = $('.pensaFrase > .fr', html).text()
      const author = $('.pensaFrase > .autor > a', html).text()
      if (quote !== '' && author !== '' && quote !== null && author !== null) {
        return {
          quote, author
        }
      }
    })
    .catch(err => console.error(err))

rp(`${baseUrl}${path}`)
  .then(html => {
    const pages = []
    for (let i = 0; i < 20; i++) {
      let linkNode = $('.linkDetailImage', html)[i]
      if (typeof linkNode === 'object') {
        pages.push(linkNode.attribs.href)
      }
    }
    return Promise.all(pages.map(url => _parse(`${baseUrl}${url}`)))
  })
  .then(phrases => {
    const file = 'phrases.js'
    const content = `\nconst PAG${pagination} = ${JSON.stringify(phrases)}`

    fs.appendFile(file, content, err => {
      if (err) throw err
      console.log(`the ${file} file has been updated!`)
    })
  })
  .catch(err => console.error(err))
