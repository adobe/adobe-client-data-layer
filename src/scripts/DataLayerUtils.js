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
/* eslint no-console: "off" */
/* eslint no-unused-vars: "off" */
'use strict';

var DataLayer = {};

/**
 * Data Layer utilities.
 *
 * @type {Object}
 */
DataLayer.utils = {};

/**
 * Deep merges a source and target object.
 *
 * @param {Object} target The target object.
 * @param {Object} source The source object.
 * @static
 */
DataLayer.utils.deepMerge = function(target, source) {
    var tmpSource = {};
    var that = this;
    if (that.isObject(target) && that.isObject(source)) {
        Object.keys(source).forEach(function(key) {
            if (that.isObject(source[key])) {
                if (!target[key]) {
                    tmpSource[key] = {};
                    Object.assign(target, tmpSource);
                }
                that.deepMerge(target[key], source[key]);
            } else {
                if (source[key] === undefined) {
                    delete target[key];
                } else {
                    tmpSource[key] = source[key];
                    Object.assign(target, tmpSource);
                }
            }
        });
    }
};

/**
 * Checks whether the passed object is an object.
 *
 * @param {Object} obj The object that will be checked.
 * @returns {Boolean} true if it is an object, false otherwise.
 * @static
 */
DataLayer.utils.isObject = function(obj) {
    return (obj && typeof obj === 'object' && !Array.isArray(obj));
};

module.exports = DataLayer.utils;
