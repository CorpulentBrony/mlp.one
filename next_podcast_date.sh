#!/bin/bash
echo -n `TZ="America/New_York" date -d "this Friday 22:00" "+%Y-%m-%dT%T.%N%:z"` > /var/www/html/mlp.one/next_podcast_date.txt

