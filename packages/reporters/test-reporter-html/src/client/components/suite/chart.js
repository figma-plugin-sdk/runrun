import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import Chartist from 'chartist';
import classNames from 'classnames/bind';
import styles from './suite.css';

const cx = classNames.bind(styles);

const SuiteChart = ({
  totalPasses,
  totalFailures,
  totalPending,
  totalSkipped,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    renderChart();
  }, [totalPasses, totalFailures, totalPending, totalSkipped]);

  const renderChart = () => {
    new Chartist.Pie(
      chartRef.current,
      {
        series: [totalPasses, totalFailures, totalPending, totalSkipped],
      },
      {
        classNames: {
          sliceDonutSolid: cx('chart-slice'),
        },
        chartPadding: 0,
        donut: true,
        donutSolid: true,
        donutWidth: 9,
        ignoreEmptyValues: true,
        showLabel: false,
        startAngle: 180,
      }
    );
  };

  return (
    <div
      className={cx('chart-wrap', 'ct-chart')}
      ref={chartRef}
    />
  );
};

SuiteChart.displayName = 'SuiteChart';

SuiteChart.propTypes = {
  totalPasses: PropTypes.number,
  totalFailures: PropTypes.number,
  totalPending: PropTypes.number,
  totalSkipped: PropTypes.number,
};

export default SuiteChart;