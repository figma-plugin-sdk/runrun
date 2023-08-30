import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const FilterStyles = ({ filtered }) => {
  const node = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // console.log(node.current);
  }, []);

  return (
    <style ref={node}>
      {filtered.map(filter => `#${filter} {display: none;}`).join(' ')}
    </style>
  );
};

FilterStyles.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default FilterStyles;
