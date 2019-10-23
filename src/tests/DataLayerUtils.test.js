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
const DataLayer = require('../scripts/DataLayer');

describe('DataLayerUtils', () => {
  describe('deepMerge()', () => {
    test('source and target objects are deep merged', () => {
      let target = {
        a: {
          aa: 12
        }
      };
      let source = {
        a: {
          aa: 13,
          ab: {
            aba: 141
          }
        },
        b: 2
      };
      let expected = {
        a: {
          aa: 13,
          ab: {
            aba: 141
          }
        },
        b: 2
      };
      DataLayer.utils.deepMerge(target, source);
      expect(target).toMatchObject(expected);
    });
    test('undefined keys are removed', () => {
      let target = {
        a: 12
      };
      let source = {
        a: undefined
      };
      let expected = {};
      DataLayer.utils.deepMerge(target, source);
      expect(target).toMatchObject(expected);
    });
  });

  describe('isObject()', () => {
    test('Object argument is an object', () => {
      expect(DataLayer.utils.isObject({ foo: 'bar' })).toBe(true);
    });
    test('Array argument is not an object', () => {
      expect(DataLayer.utils.isObject(['foo', 'bar'])).toBe(false);
    });
  });
});
