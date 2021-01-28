## Adobe Client Data Layer

[![NPM version](https://badgen.net/npm/v/@adobe/adobe-client-data-layer)](https://www.npmjs.com/package/@adobe/adobe-client-data-layer)
[![BundlePhobia](https://badgen.net/bundlephobia/minzip/@adobe/adobe-client-data-layer)](https://bundlephobia.com/result?p=@adobe/adobe-client-data-layer)
[![LGTM](https://badgen.net/lgtm/grade/g/adobe/adobe-client-data-layer)](https://lgtm.com/projects/g/adobe/adobe-client-data-layer)
[![CircleCI](https://badgen.net/circleci/github/adobe/adobe-client-data-layer)](https://app.circleci.com/pipelines/github/adobe/adobe-client-data-layer)
[![Codecov](https://badgen.net/codecov/c/github/adobe/adobe-client-data-layer)](https://codecov.io/gh/adobe/adobe-client-data-layer)

The Adobe Client Data Layer aims to reduce the effort to instrument websites by providing a standardized method to expose and access any kind of data for any script.

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

> **Note** - you can directly access the [minified version](https://unpkg.com/browse/@adobe/adobe-client-data-layer@1.0.0/dist/adobe-client-data-layer.min.js) of the data layer without downloading the sources and compiling them.

## Building / Testing

First run the following commands:
```
npm install
```   
 
Then choose from the following npm scripts:
* `npm run dev` - run the tests, generates the build in the `./dist` folder and runs a development server on `localhost:3000`.
* `npm run build` - run the tests and generates the build in the `./dist` folder.
* `npm run test` - run the unit tests

> **Note** - you can [get some stats](https://bundlephobia.com/result?p=@adobe/adobe-client-data-layer@1.0.0) (bundle size, download time) about the released version.

## Releasing

Release can be triggered only as a Github action. There is no way to release package manually using npm scripts anymore.

To release using Github action:
1. Go to [Github action](https://github.com/adobe/adobe-client-data-layer/actions/new).
2. Select "Release and publish to npm" and click "Run workflow".
3. Provide a new version. Patch, minor or major versions allowed, see [NPM Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

Release and publish Github action will:
* increase the ACDL version accordingly,
* commit release and push to Github repository,
* create and push the Git release tag,
* publish the npm package.

## Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
