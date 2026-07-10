import { App } from './components/App.js';

/* global React, ReactDOM, htm */
const html = htm.bind(React.createElement);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
