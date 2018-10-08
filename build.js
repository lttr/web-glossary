const fse = require('fs-extra')
const { promisify } = require('util')
const glob = promisify(require('glob'))
const siteConfig = require('./site.config')
const frontMatter = require('front-matter')
const marked = require('marked')

const viperHTML = require('viperhtml')

const distPath = './public'
const templatesPath = './templates'
const assetsDir = 'assets'
const contentDir = 'content'

const process = async () => {
  // clear destination folder
  await fse.emptyDir(distPath)

  // copy assets folder
  await fse.copy(assetsDir, `${distPath}/${assetsDir}`)

  await fse.copy(contentDir, distPath)

  const contentFiles = await glob('**/*.md', {
    cwd: contentDir,
  })

  const items = []
  contentFiles.forEach((file) => {
    const markdownText = fse.readFileSync(`${contentDir}/${file}`, 'utf-8')
    const metadata = frontMatter(markdownText)
    const html = marked(metadata.body)
    items.push({
      props: metadata.attributes,
      html,
    })
  })

  const data = { site: siteConfig, items }
  const layout = renderIndexHtml(data)

  await fse.mkdirs(distPath)
  await fse.writeFile(`${distPath}/index.html`, layout)
}

const template = require(`${templatesPath}/index.js`)
const renderIndexHtml = (data) => template(viperHTML.wire(), data)

process()

// const exampleItem = {
//   props: {
//     name: 'Example term',
//     alternative: 'ET, Test term',
//     created: '2018-09-25T00:00:00.000Z',
//     edited: '2018-09-25T00:00:00.000Z',
//     tags: 'example, test',
//     resources: ['https://example.com/', 'https://example.org/'],
//   },
//   html: '...',
// }
