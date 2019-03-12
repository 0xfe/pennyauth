#!/bin/sh

# This script promotes a specific version to production by
# copying the versioned bundle to the public one.

BUCKET=gs://pennyauth.com/js
VERSION=$1

if [ "$VERSION" == "" ]; then
  echo "Usage: promote VERSION"
  exit -1
fi


echo "Matching versions:"
gsutil ls $BUCKET/pennyauth.$VERSION.*

if [ "$?" != "0" ]; then
  echo "Could not find matching version."
  exit -1
fi

echo "\nHit enter to promote $VERSION."
read

echo Promoting...
gsutil  -h "Cache-control:public,max-age=120" cp -a public-read -z js $BUCKET/pennyauth.$VERSION.js $BUCKET/client.js
gsutil  -h "Cache-control:public,max-age=120" cp -a public-read -z map $BUCKET/pennyauth.$VERSION.js.map $BUCKET/client.js.map
