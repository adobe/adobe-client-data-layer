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
  const browserSync = require('browser-sync').create();

  const configs = {
    paths: require(`${__dirname}/../configs/paths.config.js`)
  };

  gulp.task('serve', () => {
    browserSync.init({
      server: {
        baseDir: [configs.paths.serve.examples, configs.paths.serve.base]
      }
    });
  });

  gulp.task('reload', (done) => {
    browserSync.reload();
    done();
  });

  gulp.task('watch-examples', () => {
    return gulp.watch([configs.paths.examples.html, configs.paths.examples.js], gulp.series('reload'));
  });

  gulp.task('watch-scripts', () => {
    return gulp.watch(configs.paths.src.scripts, gulp.series('scripts', 'reload'));
  });

  gulp.task('watch',
    gulp.parallel('watch-scripts', 'watch-examples', 'serve')
  );
};
