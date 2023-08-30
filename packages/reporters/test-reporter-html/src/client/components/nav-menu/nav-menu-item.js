import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { Icon } from 'components';
import { NavMenuList } from 'components/nav-menu';
import classNames from 'classnames/bind';
import styles from './nav-menu.css';

const cx = classNames.bind(styles);

const NavMenuItem = ({
  suite,
  showPassed,
  showFailed,
  showPending,
  showSkipped,
}) => {
  const { suites, uuid, title } = suite;
  const navItemProps = { showPassed, showFailed, showPending, showSkipped };

  const hasTests = !isEmpty(suite.tests);
  const hasPasses = !isEmpty(suite.passes);
  const hasFailures = !isEmpty(suite.failures);
  const hasPending = !isEmpty(suite.pending);
  const hasSkipped = !isEmpty(suite.skipped);

  const fail = hasTests && hasFailures;
  const pend = hasTests && hasPending && !hasFailures;
  const skip = hasTests && hasSkipped && !hasFailures && !hasPending;
  const pass =
    hasTests && hasPasses && !hasFailures && !hasPending && !hasSkipped;

  const shouldBeDisabled = useMemo(() => {
    let count = 0;
    if (!hasTests && suites) count += 1;
    if (hasPasses) count += 1;
    if (hasFailures) count += 1;
    if (hasPending) count += 1;
    if (hasSkipped) count += 1;

    if (!showSkipped && hasSkipped) count -= 1;
    if (!showPending && hasPending) count -= 1;
    if (!showFailed && hasFailures) count -= 1;
    if (!showPassed && hasPasses) count -= 1;
    if (
      !showSkipped &&
      !showPending &&
      !showFailed &&
      !showPassed &&
      !hasTests
    )
      count -= 1;

    return count <= 0;
  }, [hasTests, hasPasses, hasFailures, hasPending, hasSkipped, suites, showSkipped, showPending, showFailed, showPassed]);

  const scrollToSuite = (e, suiteId) => {
    e.preventDefault();
    const suiteEl = document.getElementById(suiteId);
    const { top } = suiteEl.getBoundingClientRect();
    const detailsCnt = document.getElementById('details');
    let topPad = window
      .getComputedStyle(detailsCnt)
      .getPropertyValue('padding-top');
    topPad = parseInt(topPad, 10);
    const scrollY = document.body.scrollTop + top - (topPad + 4);
    window.scrollTo(0, scrollY);
  };

  return (
    <li className={cx('item', { 'has-tests': hasTests })}>
      <a
        href={`#${uuid}`}
        className={cx('link', { disabled: shouldBeDisabled })}
        onClick={e => scrollToSuite(e, uuid)}
        tabIndex={shouldBeDisabled ? -1 : 0}>
        <Icon
          name={
            fail
              ? 'close'
              : pend
              ? 'pause'
              : skip
              ? 'stop'
              : pass
              ? 'check'
              : ''
          }
          className={cx('link-icon', {
            pass,
            skipped: skip,
            pending: pend,
            fail,
          })}
          size={18}
        />
        <span>{title === '' ? uuid : title}</span>
      </a>
      {suites && !!suites.length && <NavMenuList suites={suites} {...navItemProps} />}
    </li>
  );
};

NavMenuItem.propTypes = {
  suite: PropTypes.object,
  showPassed: PropTypes.bool,
  showFailed: PropTypes.bool,
  showPending: PropTypes.bool,
  showSkipped: PropTypes.bool,
};

export default React.memo(NavMenuItem, (prevProps, nextProps) => isEqual(prevProps, nextProps));
