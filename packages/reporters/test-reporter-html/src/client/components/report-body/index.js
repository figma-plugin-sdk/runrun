import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { reaction } from 'mobx';
import cx from 'classnames';

import { Suite } from 'components/suite';

const ReportBody = inject('reportStore')(observer(({ reportStore }) => {
  useEffect(() => {
    const updateSuites = (timeout) => reportStore.updateFilteredSuites(timeout);
    updateSuites();

    const disposer = reaction(
      () => ({
        showPassed: reportStore.showPassed,
        showFailed: reportStore.showFailed,
        showPending: reportStore.showPending,
        showSkipped: reportStore.showSkipped,
        showHooks: reportStore.showHooks,
      }),
      () => updateSuites(0),
      { delay: 300 }
    );

    return () => disposer();
  }, [reportStore]);

  return (() => (
    <div id="details" className={cx('details', 'container')}>
      {reportStore.filteredSuites.map(suite => (
        <Suite
          key={suite.uuid}
          suite={suite}
          enableChart={reportStore.enableChart}
          enableCode={reportStore.enableCode}
        />
      ))}
    </div>
  ))();
}));

ReportBody.propTypes = {
  reportStore: PropTypes.object,
};

export default ReportBody;
