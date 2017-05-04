
# whatch demo page
node-sass --output-style expanded -w src/scss -o src/css  &
postcss -u autoprefixer -w -o demo/css/main.css src/css/main.css &

onchange 'src/index.html' -- cp src/index.html demo/ &
# onchange 'src/js/vendor' -v -- cp -a src/js/vendor/. demo/js/vendor/ &
# onchange 'src/css/vendor' -v -- cp -a src/css/vendor/. demo/css/vendor/ &
onchange 'src/data' -v -- cp -a src/data/. demo/data/ &

watchify src/js/main.js -o demo/js/main.js --debug --verbose &

livereload ./demo