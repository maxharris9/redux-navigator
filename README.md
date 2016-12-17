## why

`npm.im/redux-little-router` is based on ideas that seem sound to me (and very much in line with this project), but there were a few things that didn't work the way I needed them to.

`npm.im/react-router` imposes an inflexible structure on your application. you can't pass your own props down into your top-level components without wrapping them. and putting route info into the view components leaves you without an easy way to write unit tests for your routing state!

## getting started

npm install history --save-dev

...

<TODO: write instructions on how to create `address-bar-read.js` and `address-bar-write.js`>

...

const history = require('history').createBrowserHistory()
const addressBarRead = require('./address-bar-read')
const addressBarWrite = require('./address-bar-write')
const { initRouter, routerMiddleware } = require('./router')

...

const initialState = {
  navigation: {
    page: 'ApplicationsList',
    previousPage: 'ApplicationsList'
  },
  ...
}

...

const store = createStore(
  combineReducers({
    // all your reducers here
  }),
  initialState,
  composeEnhancers(
    applyMiddleware(routerMiddleware)
  )
)

...


const initialUrl = (typeof window !== 'undefined') ? window.location.href : ''
const initialAction = goHome()
initRouter(dispatch, history, addressBarRead, addressBarWrite, initialUrl, initialAction)

...

now you can key in on `store.getState().navigation.page` in your main container and render the current view
