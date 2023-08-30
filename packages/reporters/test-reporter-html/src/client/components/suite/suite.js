import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { Icon } from 'components';
import { TestList } from 'components/test';
import { SuiteChart, SuiteList, SuiteSummary } from 'components/suite';
import classNames from 'classnames/bind';
import styles from './suite.css';

const cx = classNames.bind(styles);

const Suite = ({ className, suite, enableChart, enableCode }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpandedState = () => {
    setExpanded(!expanded);
  };

  const {
    root,
    rootEmpty,
    suites,
    tests,
    beforeHooks,
    afterHooks,
    uuid,
    title,
    file,
    duration,
  } = suite;

  const hasSuites = !isEmpty(suites);
  const hasTests = !isEmpty(tests);
  const hasBeforeHooks = !isEmpty(beforeHooks);
  const hasAfterHooks = !isEmpty(afterHooks);

  const summaryProps = {
    duration,
    totalTests: tests?.length || 0,
    className: cx({ 'no-margin': title === '' && file === '' }),
  };

  const hideHeader = root && !hasTests && (hasBeforeHooks || hasAfterHooks);

  return (
    <li id={uuid}>
      <section className={cx('component', className, {
        'root-suite': root,
        'has-suites': hasSuites,
        'no-suites': !hasSuites,
        'has-tests': hasTests,
        'no-tests': !hasTests && !hasBeforeHooks && !hasAfterHooks,
        'chart-enabled': enableChart,
      })}>
        {!hideHeader && (
          <header className={cx('header')}>
            <button
              aria-expanded={expanded}
              type="button"
              onClick={toggleExpandedState}
              className={cx('header-btn')}
            >
              {title !== '' && (
                <h3 className={cx('title')}>
                  <span>{title}</span>
                  <Icon name={expanded ? 'expand_less' : 'expand_more'} className={cx('icon')} size={18} />
                </h3>
              )}
              {file !== '' && <h6 className={cx('filename')}>{file}</h6>}
              {hasTests && enableChart && <SuiteChart {...summaryProps} />}
              {hasTests && <SuiteSummary {...summaryProps} />}
            </button>
          </header>
        )}
        <div className={cx('body', !expanded && 'hide')}>
          {(hasTests || hasBeforeHooks || hasAfterHooks) && (
            <TestList
              uuid={uuid}
              tests={tests}
              beforeHooks={beforeHooks}
              afterHooks={afterHooks}
              enableCode={enableCode}
            />
          )}
          {hasSuites && (
            <SuiteList
              suites={suites}
              enableChart={enableChart}
              enableCode={enableCode}
            />
          )}
        </div>
      </section>
    </li>
  );
};

Suite.propTypes = {
  suite: PropTypes.object,
  className: PropTypes.string,
  enableChart: PropTypes.bool,
  enableCode: PropTypes.bool,
};

export default Suite;
