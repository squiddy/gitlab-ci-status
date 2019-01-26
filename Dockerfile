FROM node:8-alpine

LABEL maintainer="me@reinergereckede" \
      io.openshift.tags=nodejs \
      io.openshift.non-scalable=true \
      io.openshift.expose-services=4000:http \
      io.k8s.description="A webservice to show the current status of gitlab CI pipelines."

RUN mkdir -p /code/client && \
    mkdir -p /code/server
WORKDIR /code

ADD package.json .
ADD client/package.json ./client
ADD server/package.json ./server
RUN yarn

ADD . ./
RUN cd client && yarn build
RUN cd server && yarn build

CMD ["node", "server/lib/index.js"]

EXPOSE 4000