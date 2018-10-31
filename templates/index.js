module.exports = (render, model) => render`
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <title>
    ${model.site.title}
  </title>
</head>

<body>
  <main class="main" />

  <script src="./mark.es6.min.js"></script>
  <script type="module" src="script.js"></script>
</body>

</html>
`
