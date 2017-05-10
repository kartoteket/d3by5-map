

#     "dev": "node-sass --output-style expanded -w src/scss -o docs/css & postcss -u autoprefixer  < docs/css/main.css | postcss --use cssnano > docs/css/main.min.css & budo src/js/main.js:docs/js/main.js --open --live",
node-sass --output-style expanded -w docs/scss -o docs/css &
postcss -u autoprefixer  < docs/css/main.css | postcss --use cssnano > docs/css/main.min.css &
budo docs/js/main.js:docs/build.js --open --live



# whatch demo page
#node-sass --output-style expanded -w src/scss -o src/css  &
#postcss -u autoprefixer -w -o demo/css/main.css src/css/main.css &

#onchange 'src/index.html' -- cp src/index.html demo/ &
# onchange 'src/js/vendor' -v -- cp -a src/js/vendor/. demo/js/vendor/ &
# onchange 'src/css/vendor' -v -- cp -a src/css/vendor/. demo/css/vendor/ &
#onchange 'src/data' -v -- cp -a src/data/. demo/data/ &

#watchify src/js/main.js -o demo/js/main.js --debug --verbose &

#livereload ./demo