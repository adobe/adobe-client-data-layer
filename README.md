## Adobe Client Data Layer

The Adobe Client Data Layer aims to reduce the effort to instrument websites by providing a standardized method to expose and access any kind of data for any script.

> **Tech Preview** - this is currently a tech preview, there may be API changes and it therefore shouldn't be used in production. If you have any feedback please comment on the [AEM Core Components Developer Google Group](https://groups.google.com/forum/#!forum/aem-core-components-dev).

## Documentation

* [Adobe Client Data Layer](https://github.com/adobe/adobe-client-data-layer/wiki)

## Consuming

The best way to try out the Adobe Client Data Layer is to install the distributed npm package in your project build, by running:
```
npm install @adobe/adobe-client-data-layer
```

Locate the `/dist` folder in the installed package, which contains the built and minified javascript.

This script can then be included in your page head, as follows:

```html
<script src="adobe-client-data-layer.min.js" async defer></script>
```

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

> **Note** - only release this package if you have access to the Adobe npm organization and are a project committer.

First run the following commands:
```
git checkout master
git pull
rm -rf node_modules && npm install
```

Then run:
* `gulp release` - prompts for a new version, with patch, minor or major versions allowed, see [NPM Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).
  Following selection, the task will increase, commit and push the version, create and push the Git release tag, and publish the npm package.

## Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
