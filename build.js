const { promisify } = require('util')

const frontMatter = require('front-matter')
const fse = require('fs-extra')
const glob = promisify(require('glob'))
const marked = require('marked')
const path = require('path')
const viperHTML = require('viperhtml')

const templatesPath = path.join(__dirname, 'templates')
const assetsDir = path.join(__dirname, 'assets')
const distPath = path.join(process.cwd(), 'public')
const contentDir = path.join(process.cwd(), 'content')
const glossaryConfig = require(path.join(process.cwd(), 'glossary.config.json'))

console.log(`Using sources from ${templatesPath}, and ${assetsDir}`)
console.log(`Using content directory: ${contentDir}`)
console.log(`Writing to destination direcotry: ${distPath}`)

const build = async () => {
  // clear destination folder
  await fse.emptyDir(distPath)

  // copy assets to dist folder
  await fse.copy(assetsDir, `${distPath}`)

  // copy content assets to dist folder (images, etc.)
  await fse.copy(contentDir, distPath, {
    filter: (src) => !src.endsWith('.md'),
  })

  // load content markdown files
  const contentFiles = await glob('**/*.md', {
    cwd: contentDir,
  })

  const items = []
  contentFiles.forEach((file) => {
    const markdownText = fse.readFileSync(`${contentDir}/${file}`, 'utf-8')
    const metadata = frontMatter(markdownText)
    const html = marked(metadata.body)
    items.push({
      ...metadata.attributes,
      html,
    })
  })

  const data = { site: glossaryConfig, items }
  const layout = renderIndexHtml(data)
  const serializedData = JSON.stringify(data)

  await fse.mkdirs(distPath)
  await fse.writeFile(`${distPath}/index.html`, layout)
  await fse.writeFile(`${distPath}/data.json`, serializedData)

  console.log('Glossary was built')
}

const template = require(`${templatesPath}/index.js`)
const renderIndexHtml = (data) => template(viperHTML.wire(), data)

build()

// const exampleItem = {
//   name: 'Example term',
//   alternative: 'ET, Test term',
//   created: '2018-09-25T00:00:00.000Z',
//   edited: '2018-09-25T00:00:00.000Z',
//   tags: 'example, test',
//   resources: ['https://example.com/', 'https://example.org/'],
//   html: '...',
// }
