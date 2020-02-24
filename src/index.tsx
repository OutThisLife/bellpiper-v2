import * as React from 'react'
import { render } from 'react-dom'

import Component from './lib'

const App = () => (
  <main>
    <Component />
  </main>
)

render(<App />, document.getElementById('root'))
