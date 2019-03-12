# Pennyauth

Pennyauth is a captcha replacement that uses micropayments. Try the demo on https://pennyauth.com.

Also see the [pennyauth-server](https://github.com/0xfe/pennyauth-server) repository.

## Hacking

Start a development server:

```
npm i
npm start
```

## Building

```
npm run clean
npm run build
```

## Deploy to js.pennyauth.com

Deployed bundles are available at `https://js.pennyauth.com/pennyauth.v0.X.Y.js`. The promoted bundle is at `https://js.pennyauth.com/v1.js`.

```
# Build, tag, and release a new version.
./deploy.sh v0.3.3

# Promote the deployment to production.
./promote.sh v0.3.3
```

## Deploying website

The https://pennywall.com website is `www/`. To push updates:

```
./upload_website.sh
```
