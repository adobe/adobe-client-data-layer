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
  const rename = require('gulp-rename');
  const terser = require('gulp-terser');

  const config = {
    paths: require(`${__dirname}/../configs/paths.conf.js`)
  };

  gulp.task('scripts', () => {
    return gulp.src(config.paths.src.scripts)
      .pipe(gulp.dest(config.paths.dist))
      .pipe(terser())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(config.paths.dist));
  });
};
