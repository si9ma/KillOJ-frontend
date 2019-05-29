FROM node:lts-alpine

RUN yarn global add http-server

RUN apk add \
            # bash for docker-entrypoint.sh
            bash \
            git

LABEL UpdateAt="2019-05-29 17:36"

RUN git clone https://github.com/si9ma/KillOJ-frontend.git /app

WORKDIR /app

RUN yarn install
RUN yarn build
ADD docker-entrypoint.sh /

EXPOSE 80
ENTRYPOINT [ "/docker-entrypoint.sh"]
CMD ["frontend"]
