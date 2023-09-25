import React from 'react';
import { createRoot } from 'react-dom/client';

import { MochawesomeReport } from 'components';
import hljs from 'highlight.js';
import ReportStore from './reportStore';

document.addEventListener('ReportDataChanged', event => {
  console.log('ReportDataChanged', event);
  // const data = body.getAttribute("data-raw")
  // console.log("i listen the event", data)
  //  ReportTemplate(event.detail);

  // Register hljs languages
  hljs.registerLanguage(
    'javascript',
    require('highlight.js/lib/languages/javascript')
  );
  hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'));

  const store = new ReportStore(event.detail);

  // Add global reference to the store
  window.marge = store;

  const container = document.getElementById('report');

  const root = createRoot(container);

  root.render(<MochawesomeReport store={store} />);
});
console.log('event Define');
