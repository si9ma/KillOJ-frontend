# build stage
FROM node:lts-alpine as build-stage

RUN apk add \
            # bash for docker-entrypoint.sh
            bash \
            git

LABEL UpdatedAt="2019-05-30 20:26"
RUN git clone https://github.com/si9ma/KillOJ-frontend.git /app
WORKDIR /app
RUN yarn install
RUN yarn build

# production stage
FROM nginx:stable-alpine as production-stage
RUN apk add bash
COPY --from=build-stage /app/dist /usr/share/nginx/html
ADD docker-entrypoint.sh /
ADD default.conf /etc/nginx/conf.d
ADD nginx.conf /etc/nginx

EXPOSE 80
ENTRYPOINT [ "/docker-entrypoint.sh"]
CMD ["frontend"]
