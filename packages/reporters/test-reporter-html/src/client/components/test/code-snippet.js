import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import isArray from 'lodash/isArray';
import hljs from 'highlight.js';
import classNames from 'classnames/bind';
import styles from './test.css';

const cx = classNames.bind(styles);

const CodeSnippet = ({
  className,
  code,
  lang,
  highlight,
  label,
  showLabel,
}) => {
  const codeRef = useRef(null);

  useEffect(() => {
    highlightCode();
  }, [code, lang, highlight]);

  const shouldHighlight = () => {
    if (lang === 'diff' && isArray(code)) {
      return false;
    }
    return code && highlight;
  };

  const highlightCode = () => {
    if (shouldHighlight()) {
      hljs.highlightElement(codeRef.current);
    }
  };

  const isDiff = lang === 'diff';
  const isInlineDiff = isDiff && isArray(code);
  const cxName = cx(className, {
    [lang]: shouldHighlight(),
    hljs: !shouldHighlight(),
    'code-diff': isDiff,
    'inline-diff': isInlineDiff,
  });

  const renderLegendLeft = () =>
    isInlineDiff ? (
      <span className={cx('code-diff-actual')}>actual</span>
    ) : (
      <span className={cx('code-diff-expected')}>+ expected</span>
    );

  const renderLegendRight = () =>
    isInlineDiff ? (
      <span className={cx('code-diff-expected')}>{'expected'}</span>
    ) : (
      <span className={cx('code-diff-actual')}>{'- actual'}</span>
    );

  const mapInlineDiffCode = ({ added, removed, value }, i) => {
    if (added) {
      return (
        <span key={i} className={cx('code-diff-expected')}>
          {value}
        </span>
      );
    }

    if (removed) {
      return (
        <span key={i} className={cx('code-diff-actual')}>
          {value}
        </span>
      );
    }

    return value;
  };

  return (
    !!code && (
      <pre
        className={cxName}
        ref={codeRef}
      >
        <code>
          {isDiff && renderLegendLeft()}
          {isDiff && renderLegendRight()}
          {isInlineDiff ? code.map(mapInlineDiffCode) : code}
        </code>
        {!!label &&
          showLabel && <span className={cx('code-label')}>{label}</span>}
      </pre>
    )
  );
};

CodeSnippet.propTypes = {
  className: PropTypes.string,
  code: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  lang: PropTypes.string,
  highlight: PropTypes.bool,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
};

CodeSnippet.defaultProps = {
  lang: 'javascript',
  highlight: true,
  showLabel: false,
};

export default CodeSnippet;