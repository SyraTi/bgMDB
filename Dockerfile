FROM node:lts-alpine

ENV BGMDB_SAVE_PATH='/path/to/save_bangumi' \
    BGMDB_ARIA2_HOST='aria2.xxx.com' \
    BGMDB_ARIA2_PORT=6800 \
    BGMDB_ARIA2_SECRET='' \
    BGMDB_SESSION_PATH='/root/bgmdb/bgmdb.session' \
    BGMDB_CONFIG_PATH='/root/bgmdb/bgmdb.config'

WORKDIR /root/bgmdb
RUN echo "*/5 * * * * bgmdb update" >> /var/spool/cron/crontabs/root
RUN echo "*/5 * * * * bgmdb organize" >> /var/spool/cron/crontabs/root
COPY ./package.json /root/bgmdb
COPY ./dist /root/bgmdb/dist
CMD cd /root/bgmdb && npm i && npm link && crond -f
