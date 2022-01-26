# SW Auth Handler

## Description

Demo application. Implementing authorization logic (storing access token, inserting authorization header) in service worker.

## How to run
```
docker build -t swauthhandler .
docker run --rm -p 3000:80 swauthhandler
```
Open in browser: http://localhost:3000/