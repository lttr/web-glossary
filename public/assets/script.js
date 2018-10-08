const searchableNodes = [...Array.from(document.querySelectorAll('.item-heading'))]

const originalContent = new WeakMap(searchableNodes.map((node) => [node, node.innerHTML]))

const searchInput = document.getElementById('search-input')

searchInput.addEventListener('keyup', (e) => {
  const searchText = e.target.value
  if (searchText) {
    searchableNodes.forEach((searchable) => {
      searchable.innerHTML = originalContent.get(searchable)

      const text = searchable.textContent
      if (text.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) > -1) {
        searchable.innerHTML = text.replace(
          new RegExp(`(${searchText})`, 'gi'),
          '<span class="search-highlight">$1</span>'
        )
        searchable.closest('.item').hidden = false
      } else {
        searchable.closest('.item').hidden = true
      }
    })
  } else {
    searchableNodes.forEach((searchable) => {
      searchable.innerHTML = originalContent.get(searchable)
      searchable.closest('.item').hidden = false
    })
  }
})

Array.from(document.querySelectorAll('a[href^="https://www.draw.io"]')).forEach(
  (a) => (a.title = 'View and edit')
)
