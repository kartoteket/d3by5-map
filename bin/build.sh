#!/bin/bash

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo 'Version is -'$PACKAGE_VERSION'-'


# build line chart script
buildDist()
{
    mkdir -p dist && (
      browserify src/js/d3by5-map.js > dist/d3by5.map.js &&
      uglifyjs dist/d3by5.map.js -m -c > dist/d3by5.map.min.js
    )
}


# build demo
buildDemo()
{

  mkdir -p demo && (

    # css
    node-sass --output-style expanded src/scss -o src/css &
    postcss -u autoprefixer -o demo/css/main.css src/css/main.css &

    # js
    browserify src/js/main.js -o demo/js/main.js;

    # copy assets
    cp src/index.html demo/ &
    # mkdir -p demo/js/vendor  && cp -a src/js/vendor/. demo/js/vendor/ &
    # mkdir -p demo/css/vendor && cp -a src/css/vendor/. demo/css/vendor/ &
    mkdir -p demo/data && cp -a src/data/. demo/data/
  )
}

buildDist
buildExample