FROM node:8-alpine as builder

LABEL maintainer="me@reinergerecke.de" \
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
RUN yarn build-binary

FROM debian:stable-slim
COPY --from=builder /code/gitlab-ci-status /
CMD ["./gitlab-ci-status"]

EXPOSE 4000