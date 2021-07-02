FROM nginx:1.21.0-alpine

RUN apk add --update npm git
RUN npm install -g npm@7.19.1
COPY ./default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
WORKDIR /web

CMD ["nginx", "-g", "daemon off;"]
