#!/bin/sh

VERSION=$1
BUCKET=gs://pennyauth.com/js

git diff-index --quiet HEAD --
DIRTY="$?"
TAG=`git describe --tags --abbrev=0`

if [ "$VERSION" == "" ]; then
  echo Usage: $0 [version]
  echo Current tagged version: $TAG
  exit 1
fi

if [ "$DIRTY" != "0" ]; then
  git status -s
  echo You have uncommitted changes. Hit return to continue or ctrl-c to break.
  read
fi

echo Last tagged version: $TAG
echo Looking for matching deployments in $BUCKET...
gsutil ls $BUCKET/pennyauth.$VERSION.* 2>/dev/null
if [ "$?" == "0" ]; then
  echo Tag $VERSION already exists. Hit enter to continue or ctrl-c to break.
  read
else
  echo " "
  echo Hit return to tag, build, and deploy $VERSION.
  read
fi

TAG_NAME=$VERSION npm run build
if [ "$?" -ne "0" ]; then
  echo Aborting deployment.
  exit 1
fi

git tag -s $VERSION -m "Release $VERSION"
if [ "$?" -ne "0" ]; then
  echo Aborting deployment.
  exit 1
fi

echo Uploading bundles...
gsutil -h "Cache-control:max-age=3600" -m cp -a public-read -z js,map dist/pennyauth.$VERSION.* $BUCKET
if [ "$?" -ne "0" ]; then
  echo Upload failed.
  exit 1
fi
