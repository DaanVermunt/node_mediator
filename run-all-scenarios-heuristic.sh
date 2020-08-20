#!/usr/bin/env bash

function max8 {
   while [ `jobs | wc -l` -ge 4 ]
   do
      sleep 5
   done
}

for f in ./data/extra_scenarios/*.json; do
    f1="${f##*/}"
    for i in {1..10}; do
      max8; ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s heuristic_max_automation -n $i &
      max8; ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s heuristic_min_automation -n $i &
      max8; ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s heuristic_min_transitions -n $i &
      max8; ts-node ./src/main.ts -i "$f" -o "${f1%.json}" -s heuristic_optimal_driver -n $i &
    done
done
wait
