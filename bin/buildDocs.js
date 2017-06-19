const marked    = require('marked');
const replace   = require('replace-in-file');
const fs        = require('fs');

const readMe = fs.readFileSync('README.md', 'utf-8');
const markdownReadMe = marked(readMe);

const options = {
  files: 'docs/index.html',
  from: /<!--startoptions-->(.|\n)*?<!--endoptions-->/g,
  to: '<!--startoptions-->' + markdownReadMe + '<!--endoptions-->',
};

replace(options)
  .then(changedFiles => {
    console.log('Modified files:', changedFiles.join(', '));
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });

// fs.writeFileSync('./site/README.html', markdownReadMe);


