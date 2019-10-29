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
  'use strict';

  require('./tasks/clean.js')(gulp);
  require('./tasks/lint.js')(gulp);
  require('./tasks/release.js')(gulp);
  require('./tasks/scripts.js')(gulp);
  require('./tasks/watch.js')(gulp);
  require('./tasks/test.js')(gulp);

  gulp.task('build',
    gulp.series(
      gulp.parallel('clean', 'lint', 'test'),
      'scripts'
    )
  );

  gulp.task('default',
    gulp.series(
      'build',
      'watch'
    )
  );
};
