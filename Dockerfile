FROM node:lts-alpine

ENV BGMDB_SAVE_PATH='/path/to/save_bangumi' \
    BGMDB_ARIA2_HOST='aria2.xxx.com' \
    BGMDB_ARIA2_PORT=6800 \
    BGMDB_ARIA2_SECRET='' \
    BGMDB_SESSION_PATH='/home/bgmdb/data/bgmdb.session'

WORKDIR /home/bgmdb
RUN echo "*/5 * * * * /home/bgmdb/etc/cronjobs.sh" >> /var/spool/cron/crontabs/root
RUN mkdir /home/bgmdb/etc
COPY docker-etc /home/bgmdb/etc
VOLUME /home/bgmdb/data
CMD \
    npm i -g bgmdb \
    && crond -f
