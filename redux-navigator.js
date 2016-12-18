'use strict';

var qs = require('qs');
var url = require('url');

var _matcher = void 0;
var _history = void 0;
var _addressBarWrite = void 0;

// if you ever want to kill this router listener,
// hang onto the function it returns and then call it like this:
// const unlisten = initRouter(dispatch, history, addressBarRead, addressBarWrite)
// ... code flows, time elapses
// unlisten()
var initRouter = function initRouter(dispatch, history, addressBarRead, addressBarWrite, inputUrl, inputAction) {
  _history = history;
  _matcher = addressBarRead(dispatch);
  _addressBarWrite = addressBarWrite;

  listener(inputUrl);
  return _history.listen(function (location, action) {
    if (!location || action !== 'POP') {
      return;
    }

    if (location.state) {
      dispatch(Object.assign({}, location.state.action, { invisibleToMiddleware: true }));
    } else {
      dispatch(inputAction);
    }
  });
};

var routerMiddleware = function routerMiddleware(store) {
  return function (next) {
    return function (action) {
      if (!action.invisibleToMiddleware) {
        _addressBarWrite(_history, action);
      }

      return next(action);
    };
  };
};

// qs leaves us with output that looks like:
// { thresholdSettings: 'true', license: 'false' }
// but what we really want is something like:
// { thresholdSettings: true, license: false }
var sanitizeQuery = function sanitizeQuery(parsedQuery) {
  var newQuery = {};
  Object.keys(parsedQuery).forEach(function (key) {
    switch (parsedQuery[key].toLowerCase()) {
      case 'yes': // fall through intentionally
      case 'true':
        newQuery[key] = true;
        break;
      case 'no': // fall through intentionally
      case 'undefined': // fall through intentionally
      case 'null': // fall through intentionally
      case 'false':
        newQuery[key] = false;
        break;
      default:
        newQuery[key] = parsedQuery[key];
        break;
    }
  });
  return newQuery;
};

var listener = function listener(inputUrl) {
  var parsedUrl = url.parse(inputUrl);
  var match = _matcher.match(parsedUrl.pathname);
  var parsedQuery = qs.parse(parsedUrl.query);
  if (match) {
    match.fn(null, null, match, sanitizeQuery(parsedQuery));
  }
};

var mockHistory = {
  push: function push(url, action) {
    return Object.assign({}, { url: url }, action);
  }
};

exports.initRouter = initRouter;
exports.routerMiddleware = routerMiddleware;
exports.mockHistory = mockHistory;
exports.sanitizeQuery = sanitizeQuery;
