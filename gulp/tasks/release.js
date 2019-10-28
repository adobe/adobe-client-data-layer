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
  const argv = require('minimist')(process.argv.slice(2));
  const bump = require('gulp-bump');
  const fs = require('fs');
  const git = require('gulp-git');
  const inquirer = require('inquirer');
  const semver = require('semver');
  const spawn = require('child_process').spawn;
  const PluginError = require('plugin-error');
  const CWD = process.cwd();

  function getPackageJson() {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  }

  let releaseVersion;

  gulp.task('perform-version-bump', (done) => {
    const doBump = () => {
      gulp.src([`${CWD}/package.json`, `${CWD}/package-lock.json`])
        .pipe(bump({version: releaseVersion}))
        .pipe(gulp.dest('./'))
        .on('end', () => {
          done();
        });
    };

    const currentVersion = getPackageJson().version;
    const potentialVersions = {
      patch: semver.inc(currentVersion, 'patch'),
      minor: semver.inc(currentVersion, 'minor'),
      major: semver.inc(currentVersion, 'major'),
      pre: {
        self: semver.inc(currentVersion, 'prerelease', 'beta'),
        patch: semver.inc(currentVersion, 'prepatch', 'beta'),
        minor: semver.inc(currentVersion, 'preminor', 'beta'),
        major: semver.inc(currentVersion, 'premajor', 'beta')
      }
    };
    let choices = [];

    if (currentVersion.match('-beta')) {
      choices = choices.concat([
        {
          name: 'prerelease - ' + potentialVersions.pre.self,
          value: potentialVersions.pre.self
        }
      ]);
    }

    if (potentialVersions.patch === potentialVersions.major) {
      // beta version - provide only the major version
      choices = choices.concat([
        {
          name: 'major - ' + potentialVersions.patch,
          value: potentialVersions.patch
        }
      ]);
    } else {
      // not a beta version - provide all version levels
      choices = choices.concat([
        {
          name: 'patch - ' + potentialVersions.patch,
          value: potentialVersions.patch
        },
        {
          name: 'minor - ' + potentialVersions.minor,
          value: potentialVersions.minor
        },
        {
          name: 'major - ' + potentialVersions.major,
          value: potentialVersions.major
        }
      ]);
    }

    choices = choices.concat([
      {
        name: 'prepatch - ' + potentialVersions.pre.patch,
        value: potentialVersions.pre.patch
      },
      {
        name: 'preminor - ' + potentialVersions.pre.minor,
        value: potentialVersions.pre.minor
      },
      {
        name: 'premajor - ' + potentialVersions.pre.major,
        value: potentialVersions.pre.major
      },
      {
        name: 'custom',
        value: 'custom'
      }
    ]);

    inquirer.prompt([{
      type: 'list',
      name: 'version',
      message: `Select a version to release. The current version is ${currentVersion}.`,
      choices: choices
    }])
    .then(function(res) {
      if (res.version === 'custom') {
        inquirer.prompt([{
          type: 'input',
          name: 'version',
          message: 'Enter a release version:'
        }])
        .then(function(res) {
          releaseVersion = res.version;
          doBump();
        });
      }
      else {
        releaseVersion = res.version;
        doBump();
      }
    });
  });

  gulp.task('commit-version-bump', () => {
    return gulp.src('.')
      .pipe(git.add())
      .pipe(git.commit(`@releng - prepare release ${releaseVersion}`))
  });

  gulp.task('bump-version',
    gulp.series(
      'perform-version-bump',
      'commit-version-bump'
    )
  );

  gulp.task('push-changes', (done) => {
    git.push('origin', 'master', function(err) {
      if (err) {
        done(new PluginError('release', err.message));
      }

      done();
    });
  });

  gulp.task('create-push-release-tag', (done) => {
    const releaseVersion = getPackageJson().version;
    const releaseMessage = `@releng - release ${releaseVersion}`;

    git.tag(releaseVersion, releaseMessage, function(err) {
      if (err) {
        done(new PluginError('release', err.message));
      }

      git.push('origin', releaseVersion, function(err) {
        if (err) {
          done(new PluginError('release', err.message));
        }

        done();
      });
    });
  });

  gulp.task('perform-release', (done) => {
    let tag;
    const currentVersion = getPackageJson().version;
    if (currentVersion.match('-beta')) {
      tag = `--tag beta`;
    }
    const npmRelease = `npm release --access public ${tag}`;

    const release = () => {
      spawn(`
        gulp build &&
        gulp push-changes &&
        gulp create-push-release-tag &&
        ${npmRelease}
      `, [], {shell: true, stdio: 'inherit'});

      done();
    };

    if (argv.confirm) {
      release();
    }
    else {
      inquirer.prompt({
        type: 'confirm',
        name: 'confirmed',
        message: `Release ${releaseVersion} ?`
      })
      .then(function(res) {
        if (res.confirmed) {
          release();
        }
      });
    }
  });

  gulp.task('release',
    gulp.series(
      'bump-version',
      'perform-release'
    )
  );
};
