#!/bin/sh

# This script promotes a specific version to production by
# copying the versioned bundle to the public one.

BUCKET=gs://js.pennyauth.com
VERSION=$1

TAG=`git describe --tags --abbrev=0`

if [ "$VERSION" == "" ]; then
  echo Current tag: $TAG
  echo Looking for matching versions...
  gsutil ls $BUCKET/pennyauth.$TAG.* 2>/dev/null
  echo " "
  echo "Usage: $0 [VERSION]"
  exit -1
fi


echo "Looking for matching versions..."
gsutil ls $BUCKET/pennyauth.$VERSION.* 2>/dev/null

if [ "$?" != "0" ]; then
  echo "Could not find matching version."
  exit -1
fi

echo "\nHit enter to promote $VERSION."
read

echo Promoting...
gsutil  -h "Cache-control:public,max-age=120" cp -a public-read -z js $BUCKET/pennyauth.$VERSION.js $BUCKET/v1.js
gsutil  -h "Cache-control:public,max-age=120" cp -a public-read -z map $BUCKET/pennyauth.$VERSION.js.map $BUCKET/v1.js.map
