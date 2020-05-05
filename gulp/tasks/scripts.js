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
module.exports = function(gulp) {
  const babel = require('gulp-babel');
  const browserify = require('browserify');
  const buffer = require('vinyl-buffer');
  const log = require('gulplog');
  const rename = require('gulp-rename');
  const source = require('vinyl-source-stream');
  const sourcemaps = require('gulp-sourcemaps');
  const uglify = require('gulp-uglify');

  gulp.task('scripts', () => {
    const b = browserify({
      entries: './src/index.js',
      debug: true
    });

    return b.bundle()
      .pipe(source('adobe-client-data-layer.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe((babel({
        presets: ['@babel/env']
      })))
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .on('error', log.error)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/'));
  });
};
