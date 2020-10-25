# Custom HTTP Server
![GitHub package.json version](https://img.shields.io/github/package-json/v/hniklass/magserv-js)
![GitHub](https://img.shields.io/github/license/hniklass/magserv-js)

**MagservJS** is a custom HTTP server made using Node's TCP sockets bindings.

Part of a DIY project for [TPH](https://theprogrammershangout.com/).

**[Documentation](https://hniklass.github.io/magserv-js/)**

## Changelog
* 2020/10/25 - v.1.0.0
  * First release (TPH chapter 14 completed).
  * HTTP GET fully supported.
  * Bad paths and trailing slashes are now handled properly.
  * Added security methods to stop clients from reading outside the public folder.
  * `index.html` files are now served by default if no file is requested.
* 2020/10/19 - v.0.1.0-alpha.7
  * Rewrote test suite and implemented proper functional tests.
  * Implemented configuration files.
* 2020/10/18 - v.0.1.0-alpha.6
  * HTTP GET requests are now supported by the server.
  * Appropriate headers are now sent with the response.
* 2020/10/14 - v0.1.0-alpha.5
  * Implemented parser for HTTP requests.
* 2020/10/06 - v0.1.0-alpha.4
  * Configured JSDoc to keep code documented.
* 2020/10/04 - v0.1.0-alpha.3
  * Implemented proper unit testing.
  * Implemented nyc to get code coverage for tests.
* 2020/09/30 - v0.1.0-alpha.2
  * Implemented basic socket functionality.
  * Server can now process commands.
* 2020/09/28 - v0.1.0-alpha.1
  * Initial commit.

## Setting it up
1. Clone repo.
2. Run `npm install`.
3. Run `npm start`.