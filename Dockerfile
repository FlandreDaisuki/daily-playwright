FROM mcr.microsoft.com/playwright:v1.9.2-bionic

WORKDIR /root

RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y \
  tzdata cron \
  && curl -fsSL https://deb.nodesource.com/setup_14.x | bash - \
  && apt install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

COPY scripts/* playwright.cron package.json ./

RUN mv playwright.cron /etc/cron.d/playwright.cron \
  && chmod +x /etc/cron.d/playwright.cron \
  && crontab /etc/cron.d/playwright.cron \
  && touch /root/cron.log \
  && npm install

CMD cron && tail -f /root/cron.log
