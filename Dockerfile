FROM node:lts-alpine

RUN apk add \
            # bash for docker-entrypoint.sh
            bash \
            git

RUN yarn global add http-server

RUN git clone https://github.com/si9ma/KillOJ-frontend.git /app

WORKDIR /app

RUN yarn install
RUN yarn build

EXPOSE 80
CMD [ "/docker-entrypoint.sh", "frontend" ]
