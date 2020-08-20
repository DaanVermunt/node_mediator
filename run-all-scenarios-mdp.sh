#!/usr/bin/env bash

function max8 {
   while [ `jobs | wc -l` -ge 6 ]
   do
      sleep 5
   done
}

for f in ./data/tmp/*.json; do
    f1="${f##*/}"
    for i in {1..1}; do
      max8; ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s mdp -n $i &
    done
done
wait
