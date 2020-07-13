#!/usr/bin/env bash

for f in ./data/scenarios/*.json; do
    f1="${f##*/}"
    ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s mdp &
#    ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s passive &
done
