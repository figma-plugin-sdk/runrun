const config = {
  plugins: [
    require('postcss-import')(),
    require('postcss-nested'),
    require('postcss-url')(),
    require('postcss-extend-rule')(),
    require('postcss-preset-env')({
      stage: 0,
      browsers: ['>0.25%, not ie 11, not op_mini all, not dead']
    }),
    require('cssnano'),
    require('postcss-reporter')()
  ]
};

module.exports = config;
