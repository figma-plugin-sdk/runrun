const escapeHtml = require('escape-html');

function e(str) {
  return escapeHtml(str).replace(/&#39/g, '&#x27');
}

export function ReportTemplate(reportData) {
  const bodyEl = document.querySelector('body');
  bodyEl
  const data = e(JSON.stringify(reportData));

  bodyEl.setAttribute('data-raw', data);

  return data;
}

export default ReportTemplate;
