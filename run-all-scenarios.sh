#!/usr/bin/env bash

function max8 {
   while [ `jobs | wc -l` -ge 8 ]
   do
      sleep 5
   done
}

for f in ./data/scenarios/*.json; do
    f1="${f##*/}"
    for i in {1..10}; do
      max8; ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s mdp -n $i &
      max8; ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s heuristic -n $i &
    done
#    ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s passive &
done
wait
