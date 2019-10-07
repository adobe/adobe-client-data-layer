/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const {gulp, src, dest, watch, series, parallel} = require('gulp');
const del = require('del');
const eslint = require('gulp-eslint');

const paths = {
  src: 'src/',
  dist: 'dist/',
  scripts: {
    src: 'src/scripts/*',
    dist: 'dist/js/'
  }
};

const clean = function(done) {
  del.sync([
    paths.dist
  ]);

  return done();
};

const lintScripts = function() {
  return src(paths.scripts.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
};

exports.build = series(
  clean,
  parallel(
    lintScripts
  )
);
