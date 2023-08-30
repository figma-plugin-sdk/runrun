import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import classNames from 'classnames/bind';
import styles from './loader.css';

const cx = classNames.bind(styles);

const Loader = inject('reportStore')(observer(({ reportStore }) => {
  const { isLoading } = reportStore;
  return (
    isLoading && (
      <div className={cx('component')}>
        <div className={cx('wrap')}>
          <div className={cx('spinner')} />
          <h4 className={cx('text')}>Generating Report</h4>
        </div>
      </div>
    )
  );
}));

Loader.propTypes = {
  reportStore: PropTypes.object,
};

export default Loader;
