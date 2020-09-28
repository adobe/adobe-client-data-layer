/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const merge = require('lodash/merge');

const testData = require('../testData');
const DataLayerManager = require('../../dataLayerManager');
const DataLayer = { Manager: DataLayerManager };
let adobeDataLayer;

const clearDL = function() {
  beforeEach(() => {
    adobeDataLayer = [];
    DataLayer.Manager({ dataLayer: adobeDataLayer });
  });
};

describe('Data', () => {
  clearDL();

  test('push page', () => {
    adobeDataLayer.push(testData.page1);
    expect(adobeDataLayer.getState(), 'page is in data layer after push').toStrictEqual(testData.page1);
  });

  test('push data, override and remove', () => {
    adobeDataLayer.push({ test: 'foo' });
    expect(adobeDataLayer.getState(), 'data pushed').toStrictEqual({ test: 'foo' });

    adobeDataLayer.push({ test: 'bar' });
    expect(adobeDataLayer.getState(), 'data overriden').toStrictEqual({ test: 'bar' });

    adobeDataLayer.push({ test: null });
    expect(adobeDataLayer.getState(), 'data removed').toStrictEqual({});
  });

  test('push components and override', () => {
    const twoCarousels = merge({}, testData.carousel1, testData.carousel2);
    const carousel1empty = merge({}, testData.carousel1empty, testData.carousel2);
    const carousel2empty = merge({}, testData.carousel1, testData.carousel2empty);
    const twoCarouselsEmpty = merge({}, testData.carousel1empty, testData.carousel2empty);

    adobeDataLayer.push(testData.carousel1);
    adobeDataLayer.push(testData.carousel1withNullAndUndefinedArrayItems);
    expect(adobeDataLayer.getState(), 'carousel 1 with removed items').toStrictEqual(testData.carousel1withRemovedArrayItems);

    adobeDataLayer.push(twoCarousels);
    expect(adobeDataLayer.getState(), 'carousel 1 with data, carousel 2 with data').toStrictEqual(twoCarousels);

    adobeDataLayer.push(testData.carousel1withUndefined);
    expect(adobeDataLayer.getState(), 'carousel 1 empty, carousel 2 with data').toStrictEqual(carousel1empty);

    adobeDataLayer.push(testData.carousel2withUndefined);
    expect(adobeDataLayer.getState(), 'carousel 1 empty, carousel 2 empty').toStrictEqual(twoCarouselsEmpty);

    adobeDataLayer.push(testData.carousel1);
    expect(adobeDataLayer.getState(), 'carousel 1 with data, carousel 2 empty').toStrictEqual(carousel2empty);

    adobeDataLayer.push(testData.carousel1withNull);
    expect(adobeDataLayer.getState(), 'carousel 1 empty, carousel 2 empty').toStrictEqual(twoCarouselsEmpty);

    adobeDataLayer.push(testData.carousel1);
    expect(adobeDataLayer.getState(), 'carousel 1 with data, carousel 2 empty').toStrictEqual(carousel2empty);
  });

  test('push eventInfo without event', () => {
    adobeDataLayer.push({ eventInfo: 'test' });

    expect(adobeDataLayer.getState(), 'no event info added').toStrictEqual({});
  });

  test('push invalid data type - string', () => {
    adobeDataLayer.push('test');

    expect(adobeDataLayer.getState(), 'string is invalid data type and is not part of the state').toStrictEqual({});
  });

  test('push invalid data type - array of strings', () => {
    adobeDataLayer.push(['test1', 'test2']);

    expect(adobeDataLayer.getState(), 'string is invalid data type and is not part of the state').toStrictEqual({});
  });

  test('push initial data provided before data layer initialization', () => {
    adobeDataLayer = [testData.carousel1, testData.carousel2];
    DataLayer.Manager({ dataLayer: adobeDataLayer });

    expect(adobeDataLayer.getState(), 'all items are pushed to data layer state').toStrictEqual(merge({}, testData.carousel1, testData.carousel2));
  });

  test('invalid initial data triggers error', () => {
    // Catches console.error function which should be triggered by data layer during this test
    var consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    adobeDataLayer = ['test'];
    DataLayer.Manager({ dataLayer: adobeDataLayer });

    expect(adobeDataLayer.getState(), 'initialization').toStrictEqual({});
    expect(consoleSpy).toHaveBeenCalled();
    // Restores console.error to default behaviour
    consoleSpy.mockRestore();
  });

  test('push on / off listeners is not allowed', () => {
    adobeDataLayer.push({
      on: 'click',
      handler: jest.fn()
    });
    adobeDataLayer.push({
      off: 'click',
      handler: jest.fn()
    });
    expect(adobeDataLayer.getState()).toStrictEqual({});
  });
});
