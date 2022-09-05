# Build step #1: build the React front end
FROM node:16-alpine as build-step
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./client/package.json ./
COPY ./client/src ./src
COPY ./client/public ./public
RUN yarn install
RUN yarn build

# Build step #2: build the API with the client as static files
FROM python:3.9
WORKDIR /app
COPY --from=build-step /app/build/ ./static

RUN mkdir ./server
COPY ./server/requirements.txt ./server/api.py ./server/.flaskenv ./server/
RUN pip install -r ./server/requirements.txt
ENV FLASK_ENV production

EXPOSE 3000
WORKDIR /app/server
CMD ["gunicorn", "-b", ":3000", "api:app"]