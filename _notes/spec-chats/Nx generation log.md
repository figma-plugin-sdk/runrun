# Generation Commands Used

# test-reporter-html (React Library)

```shell
nx g @nx/react:library \
    --name=test-reporter-html \
    --unitTestRunner=vitest \
    --bundler=vite \
    --directory=reporters \
    --compiler=swc \
    --globalCss=true \
    --importPath=@cva/test-reporter-html \
    --publishable=true \
    --simpleName=true \
    --tags=test-reporter \
    --buildable=true
```
