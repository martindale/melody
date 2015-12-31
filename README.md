melody
======
[![Build Status](https://img.shields.io/travis/martindale/melody.svg?branch=master&style=flat-square)](https://travis-ci.org/martindale/melody)
[![Coverage Status](https://img.shields.io/coveralls/martindale/melody.svg?style=flat-square)](https://coveralls.io/r/martindale/melody)
[![Community](https://chat.maki.io/badge.svg)](https://chat.maki.io/)

simple, self-hosted publishing platform.  [#melody on Slack](https://maki-dev.slack.com/messages/melody/).

## Quick Start
After running `npm install`, simply type `npm start`.  If it's your first time,
melody will automatically create an admin user and generate a random password.

Extra config values, such as character limit and allowing public registrations,
are available in `config/index.js` for your convenience.

## API
melody has a fully functional REST API, including an events API that is provided
over WebSockets.  To see documentation, visit your melody instance's API URL:

http://localhost:3000/api

This API is automatically provided by [Maki][maki], the web framework used to
build melody.

## Hosting
We strongly recommend using `pm2` to manage melody in production.  You can use
the included `melody.js` to keep your instance named clearly.  To run melody
using `pm2`, simply:

`pm2 start melody.js`

Which will produce the following output:

```
┌──────────┬────┬──────┬───────┬────────┬─────────┬────────┬─────────────┬──────────┐
│ App name │ id │ mode │ pid   │ status │ restart │ uptime │ memory      │ watching │
├──────────┼────┼──────┼───────┼────────┼─────────┼────────┼─────────────┼──────────┤
│ melody   │ 0  │ fork │ 25957 │ online │ 0       │ 0s     │ 10.906 MB   │ disabled │
└──────────┴────┴──────┴───────┴────────┴─────────┴────────┴─────────────┴──────────┘
```

See `pm2 help` for other instructions, such as startup scripts and monitoring.

## Using as a Library
melody was built with [Maki][maki], so it can also be used as a library:

```js
var melody = require('melody');
```

[maki]: https://maki.io
