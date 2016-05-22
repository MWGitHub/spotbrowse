#!/usr/bin/env bash

rm static/js/app.js
cat prefix.js > static/js/app.js
cat src/*.js >> static/js/app.js
cat suffix.js >> static/js/app.js

rm static/css/main.css
cat style/*.css > static/css/main.css
