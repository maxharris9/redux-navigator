const qs = require('qs')
const url = require('url')

let _matcher
let _history
let _addressBarWrite

// if you ever want to kill this router listener,
// hang onto the function it returns and then call it like this:
// const unlisten = initRouter(dispatch, history, addressBarRead, addressBarWrite)
// ... code flows, time elapses
// unlisten()
const initRouter = (dispatch, history, addressBarRead, addressBarWrite, inputUrl, inputAction) => {
  _history = history
  _matcher = addressBarRead(dispatch)
  _addressBarWrite = addressBarWrite

  listener(inputUrl)
  return _history.listen((location, action) => {
    if (!location || action !== 'POP') {
      return
    }

    if (location.state) {
      dispatch(Object.assign({}, location.state.action, { invisibleToMiddleware: true }))
    } else {
      dispatch(inputAction)
    }
  })
}

const routerMiddleware = store => next => action => {
  if (!action.invisibleToMiddleware) {
    _addressBarWrite(_history, action)
  }

  return next(action)
}

// qs leaves us with output that looks like:
// { thresholdSettings: 'true', license: 'false' }
// but what we really want is something like:
// { thresholdSettings: true, license: false }
const sanitizeQuery = (parsedQuery) => {
  let newQuery = {}
  Object.keys(parsedQuery).forEach(key => {
    switch (parsedQuery[key].toLowerCase()) {
      case 'yes': // fall through intentionally
      case 'true':
        newQuery[key] = true
        break
      case 'no': // fall through intentionally
      case 'undefined': // fall through intentionally
      case 'null': // fall through intentionally
      case 'false':
        newQuery[key] = false
        break
      default:
        newQuery[key] = parsedQuery[key]
        break
    }
  })
  return newQuery
}

const listener = (inputUrl) => {
  const parsedUrl = url.parse(inputUrl)
  const match = _matcher.match(parsedUrl.pathname)
  const parsedQuery = qs.parse(parsedUrl.query)
  if (match) {
    match.fn(null, null, match, sanitizeQuery(parsedQuery))
  }
}

const mockHistory = {
  push: (url, action) => {
    return Object.assign({}, { url }, action)
  }
}

exports.initRouter = initRouter
exports.routerMiddleware = routerMiddleware
exports.mockHistory = mockHistory
exports.sanitizeQuery = sanitizeQuery
