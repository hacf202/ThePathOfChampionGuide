const fs = require('fs');
fetch('https://wiki.leagueoflegends.com/en-us/LoR:Items')
  .then(res => res.text())
  .then(text => fs.writeFileSync('page.html', text))
  .catch(err => console.error(err));
