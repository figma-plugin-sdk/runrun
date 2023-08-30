import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { NavMenuItem } from 'components/nav-menu';
import classNames from 'classnames/bind';
import styles from './nav-menu.css';
const cx = classNames.bind(styles);

const NavMenuList = ({
  suites,
  showPassed,
  showFailed,
  showPending,
  showSkipped,
}) => {
  const shouldComponentUpdate = useMemo(() => {
    return (nextProps) => !isEqual(this.props, nextProps);
  }, []);

  const navItemProps = { showPassed, showFailed, showPending, showSkipped };

  return (
    !!suites && (
      <div>
        {suites.map((subSuite) => (
          <ul key={subSuite.uuid} className={cx('list', 'sub')}>
            <NavMenuItem suite={subSuite} {...navItemProps} />
          </ul>
        ))}
      </div>
    )
  );
};

NavMenuList.propTypes = {
  suites: PropTypes.array,
  showPassed: PropTypes.bool,
  showFailed: PropTypes.bool,
  showPending: PropTypes.bool,
  showSkipped: PropTypes.bool,
};

export default NavMenuList;