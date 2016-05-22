#!/usr/bin/env bash

prev=""
while true; do
  current=$(ls -l src suffix.js prefix.js style)
  if [ "$prev" != "$current" ]; then
    date
    echo Files changed
    ./build.sh
    echo Finished building
  fi
  prev=$current
  sleep 1
done
