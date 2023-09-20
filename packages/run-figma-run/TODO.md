# TO DO

1. Create error function or classes. Example from Mocha 
   code at https://github.com/mochajs/mocha/blob/master/lib/errors.js#L267

       /**
        * Creates an error object to be thrown when an argument did not use the supported type
        *
        * @public
        * @static
        * @param {string} message - Error message to be displayed.
        * @param {string} argument - Argument name.
        * @param {string} expected - Expected argument datatype.
        * @returns {Error} instance detailing the error condition
        */
       function createInvalidArgumentTypeError(message, argument, expected) {
         var err = new TypeError(message);
         err.code = constants.INVALID_ARG_TYPE;
         err.argument = argument;
         err.expected = expected;
         err.actual = typeof argument;
         return err;
       }