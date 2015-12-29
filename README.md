melody
======
[![Build Status](https://img.shields.io/travis/martindale/melody.svg?branch=master&style=flat-square)](https://travis-ci.org/martindale/melody)
[![Coverage Status](https://img.shields.io/coveralls/martindale/melody.svg?style=flat-square)](https://coveralls.io/r/martindale/melody)
[![Community](https://chat.maki.io/badge.svg)](https://chat.maki.io/)

simple, self-hosted publishing platform.

## Quick Start
After running `npm install`, simply type `npm start`.  If it's your first time,
melody will automatically create an admin user and generate a random password.

Extra config values, such as character limit and allowing public registrations,
are available in `config/index.js` for your convenience.

## Hosting
We strongly recommend using `pm2` to manage melody in production.
