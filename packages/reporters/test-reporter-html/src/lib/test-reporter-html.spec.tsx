import { render } from '@testing-library/react';

import TestReporterHtml from './test-reporter-html';

describe('TestReporterHtml', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TestReporterHtml />);
    expect(baseElement).toBeTruthy();
  });
});
