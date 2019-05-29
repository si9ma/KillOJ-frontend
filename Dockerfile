# build stage
FROM node:lts-alpine as build-stage

RUN apk add \
            # bash for docker-entrypoint.sh
            bash \
            git

LABEL UpdateAt="2019-05-29 19:11"

RUN git clone https://github.com/si9ma/KillOJ-frontend.git /app
WORKDIR /app
RUN yarn install
RUN yarn build

# production stage
FROM nginx:stable-alpine as production-stage
ADD docker-entrypoint.sh /
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT [ "/docker-entrypoint.sh"]
CMD ["frontend"]
