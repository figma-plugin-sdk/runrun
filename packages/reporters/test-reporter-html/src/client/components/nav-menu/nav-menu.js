import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { format } from 'date-fns';
import find from 'lodash/find';
import { Icon, ToggleSwitch, DropdownSelector } from 'components';
import { NavMenuItem } from 'components/nav-menu';
import classNames from 'classnames/bind';
import styles from './nav-menu.css';

const cx = classNames.bind(styles);

const NavMenu = inject('reportStore')(observer(({ reportStore }) => {
  const {
    results,
    closeSideNav,
    reportTitle,
    setShowHooks,
    showFailed,
    showHooks,
    showHooksOptions,
    showPassed,
    showPending,
    showSkipped,
    sideNavOpen,
    stats,
    toggleFilter,
  } = reportStore;

  const navItemProps = { showPassed, showFailed, showPending, showSkipped };

  const overlay = useRef(null);
  const closeBtn = useRef(null);

  useEffect(() => {
    const onKeydown = (e) => {
      if (e.key === 'Escape') {
        closeSideNav();
      }
    };

    const onOpenChange = (isOpen) => {
      if (isOpen && closeBtn.current) {
        closeBtn.current.focus();
      }
    };

    const disposer = reaction(
      () => reportStore.sideNavOpen,
      onOpenChange,
      { delay: 100 }
    );

    document.addEventListener('keydown', onKeydown);
    overlay.current.addEventListener('click', closeSideNav);

    return () => {
      document.removeEventListener('keydown', onKeydown);
      overlay.current.removeEventListener('click', closeSideNav);
      disposer();
    };
  }, [reportStore]);

  const showHooksOpts = showHooksOptions.map(opt => ({
    title: `${opt.charAt(0).toUpperCase()}${opt.slice(1)}`,
    value: opt,
  }));

  const showHooksSelected = find(showHooksOpts, { value: showHooks });

  return (
    <div className={cx('wrap', { open: sideNavOpen })}>
      <div className={cx('overlay')} ref={overlay} />
      <nav className={cx('menu')}>
        <button
          type="button"
          onClick={closeSideNav}
          className={cx('close-btn')}
          ref={closeBtn}>
          <Icon name="close" />
        </button>
        <div className={cx('section')}>
          <h3 className={cx('title')}>{reportTitle}</h3>
          <h6 className={cx('date')}>
            {format(stats.end, 'dddd, MMMM D, YYYY h:mma')}
          </h6>
        </div>
        <div className={cx('section')}>
          <ToggleSwitch
            className={cx('control')}
            label="Show Passed"
            labelClassName={cx('control-label')}
            icon="check"
            iconClassName={cx('toggle-icon-passed')}
            id="passed-toggle"
            active={showPassed}
            disabled={stats.passes === 0}
            toggleFn={() => toggleFilter('showPassed')}
          />
          {/* ... (other ToggleSwitch components) */}
          <DropdownSelector
            className={cx('control')}
            label="Show Hooks"
            labelClassName={cx('control-label')}
            selected={showHooksSelected}
            selections={showHooksOpts}
            onSelect={item => setShowHooks(item.value)}
          />
        </div>
        <div className={cx('section')}>
          {!!results &&
            results.map(suite => (
              <ul
                key={suite.uuid}
                className={cx('list', 'main', {
                  'no-tests': !suite.tests || suite.tests.length === 0,
                })}>
                {!!suite.suites &&
                  suite.suites.map(subSuite => (
                    <NavMenuItem
                      key={subSuite.uuid}
                      suite={subSuite}
                      {...navItemProps}
                    />
                  ))}
              </ul>
            ))}
        </div>
      </nav>
    </div>
  );
}));

NavMenu.propTypes = {
  reportStore: PropTypes.object,
};

export default NavMenu;
