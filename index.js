const { join } = require('path')
const { writeFile } = require('fs')
const request = require('request-promise')
const $ = require('cheerio')
const phrasesContent = require('./phrases')

const _pagination = process.env.URL_PAG || ''
const _baseUrl = 'https://www.pensador.com'
const _path = process.env.URL_PATH || `/frases_de_motivacao`
const _pathWithPagination = `${_path}/${_pagination}`
const _fullUrl = `${_baseUrl}${_pathWithPagination}`
const _filePhrases = join(__dirname, 'phrases.js')

const Pensador = async () => {
  console.log(`Aguarde... Pegando frases da página: ${_fullUrl}`)

  const _getSingleObject = html => {
    let phrase = {}
    const quote = $('.pensaFrase > .fr', html).text()
    const author = $('.pensaFrase > .autor > a', html).text()
    if (quote !== '' && author !== '' && quote !== null && author !== null) {
      phrase = {
        quote, author
      }
    }

    return phrase
  }

  const _requestPhrase = url =>
    request(url)
      .then(html => _getSingleObject(html))
      .catch(err => console.error(err))

  const _jsonToContent = content =>
    `module.exports = ${JSON.stringify(content)};\n`

  const _cleanPhrases = phrases =>
    phrases.filter(item => Object.keys(item).length > 0)

  const _getPageLinks = html => {
    const pages = []

    for (let i = 0; i < 20; i++) {
      let linkNode = $('.linkDetailImage', html)[i]

      if (typeof linkNode === 'object') {
        pages.push(linkNode.attribs.href)
      }
    }

    return pages
  }

  const _writeFile = (file, content) =>
    writeFile(file, content, err => {
      if (err) throw err
      console.info(`O arquivo ${file} foi atualizado!`)
    })

  return request(_fullUrl)
    .then(html => _getPageLinks(html))
    .then(pageLinks => Promise.all(pageLinks.map(path => _requestPhrase(`${_baseUrl}${path}`))))
    .then(phrases => _cleanPhrases(phrases))
    .then(phrases => _jsonToContent([...phrases, ...phrasesContent]))
    .then(fileContent => _writeFile(_filePhrases, fileContent))
    .catch(err => console.error(err))
}

Pensador()
