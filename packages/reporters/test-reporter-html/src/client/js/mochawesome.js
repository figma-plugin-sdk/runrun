import React from 'react';
import { createRoot } from 'react-dom/client';

import { MochawesomeReport } from 'components';
import hljs from 'highlight.js/lib/highlight';
import ReportStore from './reportStore';
import json from '../../lib/testJson';
import ReportTemplate from '../../lib/reportTemplate';
document.addEventListener('readystatechange', event => {
  if (event.target.readyState === 'complete') {
    ReportTemplate(json);

    // Register hljs languages
    hljs.registerLanguage(
      'javascript',
      require('highlight.js/lib/languages/javascript')
    );
    hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'));

    const store = new ReportStore(json);

    // Add global reference to the store
    window.marge = store;

    const container = document.getElementById('report');

    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    console.log('root', root);

    root.render(<MochawesomeReport store={store} />);
  }
});
