FROM mcr.microsoft.com/playwright:v1.22.2-focal

WORKDIR /root

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
  tzdata curl \
  && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

RUN curl -o /usr/bin/busybox https://www.busybox.net/downloads/binaries/1.31.0-defconfig-multiarch-musl/busybox-x86_64 \
  && chmod +x /usr/bin/busybox \
  && ln -s /usr/bin/busybox /usr/bin/crond \
  && ln -s /usr/bin/busybox /usr/bin/crontab \
  && mkdir -p /var/spool/cron/crontabs

COPY scripts/* playwright.cron package.json run.sh ./

RUN chmod +x run.sh

CMD /root/run.sh
