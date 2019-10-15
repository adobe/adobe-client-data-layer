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
    const browserify = require('browserify');
    const source = require('vinyl-source-stream');
    const buffer = require('vinyl-buffer');
    const babel = require('gulp-babel');
    const uglify = require('gulp-uglify');
    const sourcemaps = require('gulp-sourcemaps');
    const log = require('gulplog');

    const config = {
        paths: require(`${__dirname}/../configs/paths.conf.js`)
    };

    gulp.task('scripts', () => {
        const b = browserify({
            entries: './src/scripts/DataLayer.js',
            debug: true
        });

        return b.bundle()
            .pipe(source('datalayer.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe((babel({
                presets: ['@babel/env']
            })))
            .pipe(uglify())
            .on('error', log.error)
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist/'));
    });
};
