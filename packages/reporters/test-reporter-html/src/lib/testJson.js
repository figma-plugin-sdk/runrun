let json = {
    "stats": {
        "suites": 1,
        "tests": 1,
        "passes": 0,
        "pending": 0,
        "failures": 1,
        "start": "2017-06-05T12:27:21.360Z",
        "end": "2017-06-05T12:27:21.376Z",
        "duration": 22,
        "testsRegistered": 1,
        "passPercent": 0,
        "pendingPercent": 0,
        "other": 0,
        "hasOther": false,
        "skipped": 0,
        "hasSkipped": false
    },
    "results": [
        {
            "title": "",
            "suites": [
                {
                    "title": "Main Suite",
                    "suites": [],
                    "tests": [
                        {
                            "title": "should be false",
                            "fullTitle": "Main Suite should be false",
                            "timedOut": false,
                            "duration": 49,
                            "state": "failed",
                            "pass": false,
                            "fail": true,
                            "pending": false,
                            "code": "// true.should.eql(bool);\nexp.should.eql({\n  foo: true,\n  bar: true,\n  baz: 1\n});\nshouldAddContext && addContext(this, 'context');",
                            "err": {
                                "operator": "to equal",
                                "expected": "{\n  \"bar\": true\n  \"baz\": 1\n  \"foo\": true\n}",
                                "details": "at bar, A has false and B has true",
                                "showDiff": true,
                                "actual": "{\n  \"bar\": false\n  \"baz\": 1\n  \"foo\": true\n}",
                                "negate": false,
                                "assertion": {
                                    "obj": {
                                        "foo": true,
                                        "bar": false,
                                        "baz": 1
                                    },
                                    "anyOne": false,
                                    "negate": false,
                                    "params": {
                                        "operator": "to equal",
                                        "expected": {
                                            "foo": true,
                                            "bar": true,
                                            "baz": 1
                                        },
                                        "details": "at bar, A has false and B has true",
                                        "showDiff": true,
                                        "actual": {
                                            "foo": true,
                                            "bar": false,
                                            "baz": 1
                                        },
                                        "negate": false,
                                        "assertion": "[Circular ~.suites.suites.0.tests.0.err.assertion]"
                                    },
                                    "light": false
                                },
                                "_message": "expected Object { foo: true, bar: false, baz: 1 } to equal Object { foo: true, bar: true, baz: 1 } (at bar, A has false and B has true)",
                                "generatedMessage": true,
                                "estack": "AssertionError: expected Object { foo: true, bar: false, baz: 1 } to equal Object { foo: true, bar: true, baz: 1 } (at bar, A has false and B has true)\n    at Assertion.fail (node_modules/should/cjs/should.js:258:17)\n    at Assertion.value (node_modules/should/cjs/should.js:335:19)\n    at Context.<anonymous> (helpers.js:26:20)",
                                "diff": " {\n-   \"bar\": false\n+   \"bar\": true\n   \"baz\": 1\n   \"foo\": true\n }\n"
                            },
                            "uuid": "65ef9d51-2e7b-4155-9d46-af6ad7d0e2d4",
                            "parentUUID": "37685726-1c47-4e1f-a7d4-6c88ebf842f9",
                            "isHook": false,
                            "skipped": false
                        }
                    ],
                    "pending": [],
                    "root": false,
                    "_timeout": 2000,
                    "file": "/cases/test.js",
                    "uuid": "37685726-1c47-4e1f-a7d4-6c88ebf842f9",
                    "beforeHooks": [],
                    "afterHooks": [],
                    "fullFile": "/Users/adamgruber/Sites/ma-test/cases/test.js",
                    "passes": [],
                    "failures": [
                        "65ef9d51-2e7b-4155-9d46-af6ad7d0e2d4"
                    ],
                    "skipped": [],
                    "duration": 4,
                    "rootEmpty": false
                }
            ],
            "tests": [],
            "pending": [],
            "root": true,
            "_timeout": 2000,
            "uuid": "005cc237-6ddd-4da6-8b5c-e82c1ee5cfdc",
            "beforeHooks": [],
            "afterHooks": [],
            "fullFile": "",
            "file": "",
            "passes": [],
            "failures": [],
            "skipped": [],
            "duration": 0,
            "rootEmpty": true
        }
    ]
}
module.exports = json;
