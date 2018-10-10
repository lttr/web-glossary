import { bind, wire } from './hyperhtml.min.js'
import { IOlazy } from './iolazy.js'

// Constants

const searchableKeys = ['name', 'alternative']
const highlightString = '<span class="search-highlight">$1</span>'
const hash = '#'

// Global variables

let originalItems

// Local actions

// const byUpdatedDateDesc = (itemA, itemB) => itemA.updated < itemB.updated

const byName = (itemA, itemB) => itemA.name > itemB.name

const contains = (sourceString, searchString) =>
  sourceString.toLocaleLowerCase().includes(searchString.toLocaleLowerCase())

const setLocationHashTag = (text) => (location.hash = `#/${encodeURIComponent(text)}`)

const getLocationHash = () => decodeURIComponent(location.hash.substring(2))

const doSearch = (items, value) => {
  const searchString = value.trim()
  const newItems = items.map((item) => {
    const newItem = Object.assign({}, item)
    let found = false

    if (searchString.startsWith(hash)) {
      const searchTokenNoFlag = searchString.substring(1)
      const regexp = new RegExp(`(${searchTokenNoFlag})`, 'gi')
      newItem.tags = item.tags.map((tag) => {
        if (contains(tag, searchTokenNoFlag)) {
          found = true
          return tag.replace(regexp, highlightString)
        }
        return tag
      })
    } else {
      const regexp = new RegExp(`(${searchString})`, 'gi')
      searchableKeys.forEach((key) => {
        if (item[key] && contains(item[key], searchString)) {
          found = true
          newItem[key] = item[key].replace(regexp, highlightString)
        }
      })
    }

    newItem.hidden = !found
    return newItem
  })

  Terms(newItems)
}

const doSelectSearch = (tag) => {
  document.querySelector('html').scrollIntoView()
  document.getElementById('search-input').value = tag
  doSearch(originalItems, tag)
  setLocationHashTag(tag)
}

// Components

const Heading = (site) => wire()`
  <h1 class="main-heading">
    ${site.heading}
  </h1>
`

const SearchBox = (items, value) => {
  if (value) {
    doSearch(items, value)
  }
  const search = (e) => {
    setLocationHashTag(e.target.value)
    doSearch(items, e.target.value)
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
    doSelectSearch(`#${e.target.textContent}`)
  }
  items.sort(byName)
  const wiredTerms = wire(document)`
    <div id="items" class="items">
      ${items.map((item) => {
        const content = item.html.replace(
          /<img src="([^"]*)"/g,
          '<img class="lazyload" data-src="$1"'
        )

        const resources = wire(item.resources)`
          <p>
            ${item.resources.map((resource) => {
              return wire()`<a class="resource" href="${resource}">${resource}</a>`
            })}
          </p>
        `

        const tags = wire(item.tags)`
          <p>
            ${item.tags.map((tag) => {
              return wire()`<span class="tag" onclick="${selectTag}">${{
                html: tag,
              }}</span>`
            })}
          </p>
        `

        const alternative = wire({ alt: item.alternative })`
          <p><em>${{ html: item.alternative }}</em></p>
        `

        return wire(item)`
            <article class="item" hidden=${item.hidden}>
              <h2 class="item-heading">${{ html: item.name }}</h2>
              ${item.alternative ? alternative : null}
              <div class="item-content">
                  ${{ html: content }}
              </div>
              ${item.resources ? resources : null}
              <div class="side-by-side">
                ${item.tags ? tags : null}
                <p class="date">${new Date(item.updated).toISOString().split('T')[0]}</p>
              </div>
            </article>
        `
      })}
    </div>
  `
  new IOlazy()
  return wiredTerms
}

const App = (model) => {
  const render = bind(document.querySelector('main'))
  const locationHashValue = getLocationHash()
  render`
    <div class="main-content">
      ${Heading(model.site)}
      ${SearchBox(model.items, locationHashValue)}
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
      doSelectSearch(locationHash)
    }
  })
}

// Fetch data and run

fetch('data.json')
  .then((response) => {
    return response.json()
  })
  .then((data) => {
    originalItems = data.items
    App(data)
  })
  .then(() => {
    new IOlazy()
    addDrawIoTitles()
    listenToHashChange()
  })
