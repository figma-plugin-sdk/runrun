import {
  extendObservable,
  makeAutoObservable,
  observable,
  action,
  runInAction
} from 'mobx';

const transduce = (items, mapper, reducer, initial) =>
  items.reduce(
    (acc, item, index) => reducer(acc, mapper(item, index), index),
    initial
  );

class ReportStore {
  constructor(data = {}) {
    Object.assign(this, {
      filters: ['showPassed', 'showFailed', 'showPending', 'showSkipped'],
      initialLoadTimeout: 300,
      initialFilterState: null,
      reportTitle: 'Mochawesome Report',
      results: data.results || [],
      showHooksOptions: ['failed', 'always', 'never', 'context'],
      stats: data.stats || {},
      VERSION: '__VERSION__'
    });
    makeAutoObservable(this, {}, { autoBind: true });
    extendObservable(
      this,
      {
        filteredSuites: [],
        isLoading: true,
        showFailed: true,
        showHooks: this._getShowHooks(),
        showPassed: true,
        showPending: true,
        showSkipped: false,
        singleFilter: null,
        sideNavOpen: false
      },
      {
        filteredSuites: observable.shallow
      }
    );

    this.initialize();
  }

  initialize() {
    // Save initial filter state so we can restore after quick filtering
    this.initialFilterState = this.filters.reduce(
      (acc, filter) => ({
        ...acc,
        [filter]: this[filter]
      }),
      {}
    );
  }

  @action.bound
  openSideNav() {
    this.sideNavOpen = true;
  }

  @action.bound
  closeSideNav() {
    this.sideNavOpen = false;
  }

  @action.bound
  toggleFilter(prop) {
    this.toggleIsLoading(true);
    // Clear single filter prop
    this.singleFilter = null;
    this[prop] = !this[prop];
  }

  @action.bound
  toggleSingleFilter(prop) {
    console.log('change filter', this);
    // Not in single filter mode or changing single filter
    if (this.singleFilter !== prop) {
      // Set filters to false
      this.filters
        .filter(filter => filter !== prop)
        .forEach(filter => {
          this[filter] = false;
        });

      // Set single filter to true
      this[prop] = true;

      // Update single filter prop
      this.singleFilter = prop;
    } else {
      // Restore filters
      this._restoreInitialFilterState();

      // Clear single filter prop
      this.singleFilter = 'showPending';
    }
  }

  @action.bound
  setShowHooks(prop) {
    if (this._isValidShowHookOption(prop)) {
      this.toggleIsLoading(true);
      this.showHooks = prop;
    }
  }

  @action
  toggleIsLoading(isLoading) {
    runInAction(() => {
      this.isLoading = isLoading !== undefined ? isLoading : !this.isLoading;
    });
  }

  _mapHook = hook =>
    (this.showHooks === 'always' ||
      (this.showHooks === 'failed' && hook.fail) ||
      (this.showHooks === 'context' && hook.context)) &&
    hook;

  _mapTest = test =>
    ((this.showPassed && test.pass) ||
      (this.showFailed && test.fail) ||
      (this.showPending && test.pending) ||
      (this.showSkipped && test.skipped)) &&
    test;

  _mapSuite = suite => {
    const suites = suite.suites.length
      ? this._getFilteredTests(suite.suites)
      : [];
    const tests = transduce(suite.tests, this._mapTest, this._reduceItem, []);
    const beforeHooks = transduce(
      suite.beforeHooks,
      this._mapHook,
      this._reduceItem,
      []
    );
    const afterHooks = transduce(
      suite.afterHooks,
      this._mapHook,
      this._reduceItem,
      []
    );

    return beforeHooks.length ||
      afterHooks.length ||
      tests.length ||
      suites.length
      ? Object.assign({}, suite, { suites, beforeHooks, afterHooks, tests })
      : null;
  };

  _reduceItem = (acc, item) => {
    if (item) {
      acc.push(item);
    }
    return acc;
  };

  _getFilteredTests = suite =>
    transduce(suite, this._mapSuite, this._reduceItem, []);

  _isValidOption = (property, options, selection) => {
    const isValid = options.indexOf(selection) >= 0;
    if (!isValid) {
      console.error(
        `Warning: '${selection}' is not a valid option for property: '${property}'. Valid options are: ${options.join(
          ', '
        )}`
      ); // eslint-disable-line
    }
    return isValid;
  };

  _isValidShowHookOption = option =>
    this._isValidOption('showHooks', this.showHooksOptions, option);

  _getShowHooks = () => {
    const showHooksDefault = 'failed';

    return showHooksDefault;
  };

  _restoreInitialFilterState = () => {
    this.filters.forEach(filter => {
      this[filter] = this.initialFilterState[filter];
    });
  };

  updateFilteredSuites(timeout = this.initialLoadTimeout) {
    setTimeout(() => {
      this.toggleIsLoading(false);

      runInAction(() => {
        this.filteredSuites = this._getFilteredTests(this.results);
      });
    }, timeout);
  }
}

export default ReportStore;
