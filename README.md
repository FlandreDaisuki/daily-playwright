# Daily Playwright

## Installation

```shell
$ cd daily-playwright

# Build image
$ docker-compose build

# Up container
$ docker-compose up -d
```

## Usage

1. Write a script & put it in scripts
2. Put sensitive data (password or cookie) in `.env` & `docker-compose.yml`
3. Add cron of your job into `playwright.cron`
