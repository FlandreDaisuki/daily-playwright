#!/bin/bash

cd /root || exit

npm install

crontab playwright.cron

crond -l 2 -f
