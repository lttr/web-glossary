module.exports = (render, model) => render`
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css">
    <title>
      ${model.site.title}
    </title>
  </head>

  <body>
    <main class="main">
      <div class="main-content">
        <h1 class="main-heading">
          ${model.site.heading}
        </h1>

        <div class="search">
          <input 
            type="search" 
            id="search-input" 
            class="search-input" 
            placeholder="Search term" 
            aria-label="Search through terms"> 
        </div>

        <div class="items">
          ${model.items.map((item) => {
            return render`
              <article class="item">
                <h2 class="item-heading">${item.props.name}</h2>
                <p><em>${item.props.alternative}</em></p>
                <div class="item-content">
                    ${{ html: item.html }}
                </div>
                <p>
                  ${item.props.resources.map((resource) => {
                    return render`<a class="resource" href="${resource}">${resource}</a>`
                  })}
                </p>
                <p>
                  ${item.props.tags.map((tag) => {
                    return render`<span class="tag">${tag}</span>`
                  })}
                </p>
              </article>
            `
          })}
        </div>

      </div>
    </main>
    <script src="assets/script.js"></script>
  </body>

  </html>
`
