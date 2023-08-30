import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import classNames from 'classnames/bind';
import styles from './dropdown.css';
import DropdownInnerMenu from './menu';

const cx = classNames.bind(styles);

const Dropdown = ({
  className,
  iconOnly,
  itemClassName,
  list,
  linkClassName,
  menuClassName,
  menuAlign,
  menuStyle,
  selected,
  selectedClassName,
  showSelected,
  toggleClassName,
  onItemSelected,
  onToggle,
  itemRenderFn,
  toggleIcon,
  itemTitleProp = 'title'
}) => {
  const [open, setOpen] = useState(null);
  const node = useRef(null);

  useEffect(() => {
    const documentClickHandler = event => {
      if (
        node.current &&
        event.target !== node.current &&
        !node.current.contains(event.target) &&
        open
      ) {
        closeMenu();
      }
    };

    document.addEventListener('click', documentClickHandler);
    return () => {
      document.removeEventListener('click', documentClickHandler);
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    if (onToggle) {
      onToggle(false);
    }
  };

  const toggleListDisplay = () => {
    setOpen(!open);
    if (onToggle) {
      onToggle(!open);
    }
  };

  const getItemText = item => get(item, itemTitleProp);

  const select = item => {
    closeMenu();
    onItemSelected(item);
  };

  const displayItem = selected || { title: 'Please select' };
  const compClass = cx('component', className);
  const toggleClass = cx('toggle', toggleClassName);

  return (
    <div ref={node} className={compClass}>
      <button type="button" className={toggleClass} onClick={toggleListDisplay}>
        {!iconOnly && getItemText(displayItem)}
        {!!toggleIcon && toggleIcon}
      </button>
      <DropdownInnerMenu
        className={menuClassName}
        menuAlign={menuAlign}
        open={open}
        style={menuStyle}
        list={list}
        selected={selected}
        showSelected={showSelected}
        selectedClassName={selectedClassName}
        linkClassName={linkClassName}
        itemClassName={itemClassName}
        itemTitleProp={itemTitleProp}
        itemRenderFn={itemRenderFn}
        itemClickFn={itemRenderFn ? closeMenu : select}
      />
    </div>
  );
};

Dropdown.propTypes = {
  className: PropTypes.any,
  iconOnly: PropTypes.bool,
  itemClassName: PropTypes.string,
  list: PropTypes.array,
  linkClassName: PropTypes.string,
  menuClassName: PropTypes.string,
  menuAlign: PropTypes.oneOf(['left', 'right']),
  menuStyle: PropTypes.object,
  selected: PropTypes.object,
  selectedClassName: PropTypes.string,
  showSelected: PropTypes.bool,
  toggleClassName: PropTypes.string,
  onItemSelected: PropTypes.func,
  onToggle: PropTypes.func,
  itemRenderFn: PropTypes.func,
  toggleIcon: PropTypes.element,
  itemTitleProp: PropTypes.string
};

Dropdown.defaultProps = {
  iconOnly: false,
  itemTitleProp: 'title'
};

Dropdown.displayName = 'Dropdown';

export default Dropdown;
