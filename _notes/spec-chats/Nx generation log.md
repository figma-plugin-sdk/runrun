# Generation Commands Used

# test-reporter-html (React Library)

```shell
nx g @nx/react:library \
    --name=test-reporter-html \
    --unitTestRunner=vitest \
    --bundler=webpack \
    --directory=reporters \
    --compiler=babel \
    --globalCss=true \
    --importPath=@cva/test-reporter-html \
    --publishable=true \
    --simpleName=true \
    --tags=test-reporter \
    --buildable=true


nx g @nx/webpack:configuration --skipValidation
```

### Manually edit webpack paths in project.json

```json
        "main": "packages/reporters/test-reporter-html/src/client/js/mochawesome.js",
        "tsConfig": "packages/reporters/test-reporter-html/tsconfig.lib.json",
```
