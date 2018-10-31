import { bind, wire } from './hyperhtml.min.js'
import { IOlazy } from './iolazy.js'

// Global variables

let firstLoad = true
let markInstance

// Local actions

const byName = (itemA, itemB) => itemA.name > itemB.name

const setLocationHashTag = (text) => (location.hash = `#${encodeURIComponent(text)}`)

const getLocationHash = () => decodeURIComponent(location.hash.substring(1))

const doSearch = (value) => {
  const searchString = value

  const itemsElement = document.querySelector('#items')
  const allItemElements = document.querySelectorAll('.item')

  if (!searchString) {
    allItemElements.forEach((item) => (item.hidden = false))
    markInstance && markInstance.unmark()
  }

  const foundItemNodes = new Set()

  markInstance = new Mark(itemsElement) // eslint-disable-line no-undef
  markInstance.mark(searchString, {
    ignoreJoiners: true,
    separateWordSearch: false,
    each: (markedElement) => foundItemNodes.add(markedElement.closest('.item')),
  })

  allItemElements.forEach((item) => (item.hidden = !foundItemNodes.has(item)))
}

// Components

const Heading = (site) => wire()`
  <h1 class="main-heading">
    ${site.heading}
  </h1>
`

const SearchBox = (value) => {
  const search = (e) => {
    setLocationHashTag(value)
    doSearch(e.target.value)
  }
  return wire()`
    <div id="search-box" class="search-box">
      <input 
        value="${value}"
        type="search" 
        id="search-input" 
        name="search-input" 
        class="search-input" 
        placeholder="Search term or #tag" 
        aria-label="Search through terms"
        onkeyup="${search}"
        onsearch="${search}"
      > 
    </div>
  `
}

const Terms = (items) => {
  const selectTag = (e) => {
    const tag = e.target.textContent
    setLocationHashTag(tag)
    document.querySelector('html').scrollIntoView()
    document.getElementById('search-input').value = tag
    doSearch(`#${tag}`)
  }
  items.sort(byName)
  const wiredTerms = wire(document)`
    <div id="items" class="items">
      ${items.map((item) => {
        let content = item.html
        if (firstLoad) {
          content = content.replace(/<p>\s*<img/gm, '<p class="image-wrapper"><img')
          content = content.replace(/<img src="([^"]*)"/g, '<img class="lazyload" data-src="$1"')
        }

        const resources = () => wire(item.resources)`
          <p>
            ${item.resources.map((resource) => {
              return wire()`<a class="resource" href="${resource}">${resource}</a>`
            })}
          </p>
        `

        const tags = () => wire(item.tags)`
          <p>
            ${item.tags.map((tag) => {
              return wire()`<span class="tag" onclick="${selectTag}">${{
                html: tag,
              }}</span>`
            })}
          </p>
        `

        const alternative = () => wire({ alt: item.alternative })`
          <p><em>${{ html: item.alternative }}</em></p>
        `

        const updated = () => wire({ updated: item.updated })`
          <p class="date">${new Date(item.updated).toISOString().split('T')[0]}</p>
        `
        return wire(item)`
            <article class="item" hidden=${item.hidden}>
              <h2 class="item-heading">${{ html: item.name }}</h2>
              ${item.alternative ? alternative() : null}
              <div class="item-content">
                  ${{ html: content }}
              </div>
              ${item.resources ? resources() : null}
              <div class="side-by-side">
                ${item.tags ? tags() : null}
                ${item.updated ? updated() : null}
              </div>
            </article>
        `
      })}
    </div>
  `
  return wiredTerms
}

const App = (model) => {
  const render = bind(document.querySelector('main'))
  const locationHashValue = getLocationHash()
  if (locationHashValue) {
    doSearch(locationHashValue)
  }
  render`
    <div class="main-content">
      ${Heading(model.site)}
      ${SearchBox(locationHashValue)}
      ${Terms(model.items)}
    </div>
  `
}

// Global actions

const addDrawIoTitles = () => {
  document
    .querySelectorAll('a[href^="https://www.draw.io"]')
    .forEach((a) => (a.title = 'View and edit'))
}

const listenToHashChange = () => {
  window.addEventListener('hashchange', () => {
    const locationHash = getLocationHash()
    if (locationHash) {
      doSearch(locationHash)
    }
  })
}

// Fetch data and run

fetch('data.json')
  .then((response) => {
    return response.json()
  })
  .then((data) => {
    App(data)
  })
  .then(() => {
    new IOlazy()
    addDrawIoTitles()
    listenToHashChange()
    firstLoad = false
  })
