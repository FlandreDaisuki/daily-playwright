#!/bin/bash

cd /root || exit

env | cat - playwright.cron > /etc/cron.d/playwright.cron

chmod 0644 /etc/cron.d/playwright.cron
crontab /etc/cron.d/playwright.cron

touch /root/cron.log

npm install
