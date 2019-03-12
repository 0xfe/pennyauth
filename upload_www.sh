#!/bin/sh

BUCKET=gs://pennyauth.com
URL=${BUCKET}

echo Uploading website...
gsutil -h "Cache-control:public,max-age=600" -m cp -a public-read -z html,css,js www/* ${URL}
