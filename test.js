const router = require('./router')
const tape = require('tape')

const Router = require('routes')
const qs = require('qs')

tape('default', (t) => {
  // setup
  const sampleActionCreator = () => { type: 'SAMPLE_ACTION' }

  const addressBarRead = (dispatch) => {
    const router = new Router()
    router.addRoute('/welcome/provider', (req, res, match, query) => {
      t.deepEquals(match.params, {}, 'params')
      t.deepEquals(match.splats, [], 'splats')
      t.equals(match.route, '/welcome/provider', 'route')
      t.equals(typeof match.next, 'function', 'match.next is a function')
      t.equals(typeof match.fn, 'function', 'match.fn is a function')
      t.deepEquals(query, { 'upgrade-true': '' }, 'query')
      dispatch(sampleActionCreator())
    })

    return router
  }

  const testAction = { type: 'TEST_ACTION' }

  const addressBarWrite = (history, action) => {
    switch (action.type) {
      default:
        t.deepEquals(action, testAction, 'fired action')
        break
    }
  }

  const dispatch = () => {}
  const listen = (cb) => {
    cb({ state: 'foo' }, 'POP')
    return function unlisten () {
      t.ok('unlisten')
    }
  }
  const history = Object.assign({}, { listen })
  const initialUrlWithBustedQuery = 'http://localhost:1338/welcome/provider/?upgrade-true'
  const unlisten = router.initRouter(dispatch, history, addressBarRead, addressBarWrite, initialUrlWithBustedQuery, testAction)

  t.equals(typeof unlisten, 'function', 'unlisten')

  const url = 'http://localhost:1338/welcome/provider/?upgrade=true'
  const actual = router.mockHistory.push(url, testAction)
  t.deepEquals(actual, { url, type: testAction.type }, 'mockHistory')

  const next = () => {}
  const routerMiddleware = router.routerMiddleware()
  const tmp = routerMiddleware(next)
  tmp(testAction)
  tmp(Object.assign({}, testAction, { invisibleToMiddleware: true }))

  unlisten()

  t.end()
})

tape('initial action', (t) => {
  // setup
  t.plan(10)

  const sampleActionCreator = () => { type: 'SAMPLE_ACTION' }

  const addressBarRead = (dispatch) => {
    const router = new Router()
    router.addRoute('/welcome/provider', (req, res, match, query) => {
      t.deepEquals(match.params, {}, 'params')
      t.deepEquals(match.splats, [], 'splats')
      t.equals(match.route, '/welcome/provider', 'route')
      t.equals(typeof match.next, 'function', 'match.next is a function')
      t.equals(typeof match.fn, 'function', 'match.fn is a function')
      t.deepEquals(query, { 'upgrade-true': '' }, 'query')
      dispatch(sampleActionCreator())
    })

    return router
  }

  const testAction = { type: 'TEST_ACTION' }
  const addressBarWrite = (history, action) => { }

  let dispatchCounter = 0
  const dispatch = (action) => {
    switch (dispatchCounter) {
      case 0:
        t.equals(action, undefined, 'initial action')
        break
      case 1:
        t.deepEquals(action, { type: 'TEST_ACTION' }, 'test action')
        break
      /* istanbul ignore next */
      default:
        t.fail()
        break
    }
    dispatchCounter++
  }
  const listen = (cb) => {
    cb({}, 'POP')
    return function unlisten () {
      t.ok('unlisten')
    }
  }
  const history = Object.assign({}, { listen })
  const initialUrlWithBustedQuery = 'http://localhost:1338/welcome/provider/?upgrade-true'
  const unlisten = router.initRouter(dispatch, history, addressBarRead, addressBarWrite, initialUrlWithBustedQuery, testAction)

  t.equals(typeof unlisten, 'function', 'unlisten')
  unlisten()

  t.end()
})

tape('invalid initial URL', (t) => {
  // setup
  const addressBarRead = (dispatch) => new Router()
  const addressBarWrite = (history, action) => {}

  const listen = (cb) => {
    cb({ state: 'foo' }, 'NOT-POP')
    return function unlisten () {}
  }
  const history = Object.assign({}, { listen })
  const dispatch = () => {}
  const unlisten = router.initRouter(dispatch, history, addressBarRead, addressBarWrite, 'http://localhost:1338/invalid')
  t.equals(typeof unlisten, 'function', 'unlisten')
  unlisten()

  t.end()
})

tape('sanitize query', (t) => {
  const testCases = [
    {
      input: { thresholdSettings: 'yes', license: 'no' },
      expected: { thresholdSettings: true, license: false }
    },
    {
      input: { thresholdSettings: 'true', license: 'undefined' },
      expected: { thresholdSettings: true, license: false }
    },
    {
      input: { thresholdSettings: 'yes', license: 'null' },
      expected: { thresholdSettings: true, license: false }
    },
    {
      input: { thresholdSettings: 'true', license: 'false' },
      expected: { thresholdSettings: true, license: false }
    },
    {
      input: { },
      expected: { }
    }
  ]

  testCases.forEach(testCase => {
    const actual = router.sanitizeQuery(testCase.input)
    t.deepEquals(actual, testCase.expected, 'sanitized query')
  })

  t.end()
})
