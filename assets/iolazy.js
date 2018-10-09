// from https://github.com/cdowdy/io-lazyload/blob/master/src/js/iolazy.js
export class IOlazy {
  constructor({ image = '.lazyload', threshold = 0.006, rootMargin = '0px' } = {}) {
    this.threshold = threshold
    this.rootMargin = rootMargin
    this.image = document.querySelectorAll(image)
    this.observer = new IntersectionObserver(this.handleChange.bind(this), {
      threshold: [this.threshold],
      rootMargin: this.rootMargin,
    })

    this.lazyLoad()
  }

  handleChange(changes) {
    changes.forEach((change) => {
      if (change.isIntersecting) {
        change.target.classList.add('visible')

        if (change.target.getAttribute('data-srcset')) {
          change.target.srcset = change.target.getAttribute('data-srcset')
        }

        if (change.target.getAttribute('data-src')) {
          change.target.src = change.target.getAttribute('data-src')
        }

        this.observer.unobserve(change.target)
      }
    })
  }

  lazyLoad() {
    this.image.forEach((img) => {
      this.observer.observe(img)
    })
  }
}
