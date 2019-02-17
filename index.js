'use strict'

const rp = require('request-promise')
const $ = require('cheerio')

const baseUrl = 'https://www.pensador.com'
const path = '/frases_de_motivacao/6/'

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
      return false
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
  .then(phrases => console.log(JSON.stringify(phrases)))
  .catch(err => console.error(err))
