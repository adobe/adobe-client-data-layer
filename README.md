## Adobe Client Data Layer

The Adobe Client Data Layer aims to reduce the effort to instrument websites by providing a standardized method to expose and access any kind of data for any script.

## Documentation

* [Introduction](https://github.com/adobe/adobe-client-data-layer/wiki#introduction)
* [Setup](https://github.com/adobe/adobe-client-data-layer/wiki#setup)
* [API](https://github.com/adobe/adobe-client-data-layer/wiki#methods)

## Building / Testing

First run the following commands:
```
npm install -g gulp-cli
npm install
```   
 
Then choose from the following gulp tasks:
* `gulp` - run the tests, generates the build in the `./dist` folder and runs a development server on `localhost:3000`.
* `gulp build` - run the tests and generates the build in the `./dist` folder.
* `gulp test` - run the unit tests

## Releasing

> Please only release this package if you have access to the Adobe npm organization and are a project committer.

First run the following commands:
```
git checkout master
rm -rf node_modules && npm install
```

Then run:
* `gulp release` - prompts for a new version, with patch, minor or major versions allowed, see [NPM Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).
  Following selection, the task will increase, commit and push the version, create and push the Git release tag, and publish the npm package.

## Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
