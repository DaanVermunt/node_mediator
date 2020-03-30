#!/usr/bin/env bash


for f in ./data/scenarios/*.json; do
    f1="${f##*/}";
    echo "${f1%.json}";
done

