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

const testData = require('../testData');
const DataLayerManager = require('../../dataLayerManager');
const DataLayer = { Manager: DataLayerManager };
let adobeDataLayer;

const createEventListener = function(dl, callback, options) {
  dl.addEventListener('adobeDataLayer:event', function(eventData) {
    expect(eventData, 'data layer object as an argument of callback').toEqual(testData.carousel1click);
    callback();
  }, options);
};

describe('Initialization', () => {
  describe('arguments', () => {
    test('empty array', () => {
      adobeDataLayer = [];
      DataLayer.Manager({ dataLayer: adobeDataLayer });

      expect(adobeDataLayer.getState()).toEqual({});
    });

    test('array with data', () => {
      adobeDataLayer = [testData.carousel1];
      DataLayer.Manager({ dataLayer: adobeDataLayer });

      expect(adobeDataLayer.getState()).toEqual(testData.carousel1);
    });

    test('wrong type', () => {
      adobeDataLayer = DataLayer.Manager({ dataLayer: {} });

      expect(adobeDataLayer.getState()).toEqual({});
    });

    test('null', () => {
      adobeDataLayer = DataLayer.Manager(null);

      expect(adobeDataLayer.getState()).toEqual({});
    });
  });

  describe('events', () => {
    beforeEach(() => {
      adobeDataLayer = [];
    });

    test('scope past with early initialization', () => {
      const mockCallback = jest.fn();
      DataLayer.Manager({ dataLayer: adobeDataLayer });
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback, { scope: 'past' }); });
      adobeDataLayer.push(testData.carousel1click);

      expect(mockCallback.mock.calls.length, 'callback not triggered').toBe(0);
    });

    test('scope past with late initialization', () => {
      const mockCallback = jest.fn();
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback, { scope: 'past' }); });
      adobeDataLayer.push(testData.carousel1click);
      DataLayer.Manager({ dataLayer: adobeDataLayer });

      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(0);
    });

    test('scope future with early initialization', () => {
      const mockCallback = jest.fn();
      DataLayer.Manager({ dataLayer: adobeDataLayer });
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback, { scope: 'future' }); });
      adobeDataLayer.push(testData.carousel1click);

      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);
    });

    test('scope future with late initialization', () => {
      const mockCallback = jest.fn();
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback, { scope: 'future' }); });
      adobeDataLayer.push(testData.carousel1click);
      DataLayer.Manager({ dataLayer: adobeDataLayer });

      expect(mockCallback.mock.calls.length, 'callback not triggered').toBe(1);
    });
  });

  describe('order', () => {
    beforeEach(() => {
      adobeDataLayer = [];
    });

    test('listener > event > initialization', () => {
      const mockCallback = jest.fn();
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback); });
      adobeDataLayer.push(testData.carousel1click);
      DataLayer.Manager({ dataLayer: adobeDataLayer });

      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);
    });

    test('event > listener > initialization', () => {
      const mockCallback = jest.fn();
      adobeDataLayer.push(testData.carousel1click);
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback); });
      DataLayer.Manager({ dataLayer: adobeDataLayer });

      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);
    });

    test('listener > initialization > event', () => {
      const mockCallback = jest.fn();
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback); });
      DataLayer.Manager({ dataLayer: adobeDataLayer });
      adobeDataLayer.push(testData.carousel1click);

      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);
    });

    test('event > initialization > listener', () => {
      const mockCallback = jest.fn();
      adobeDataLayer.push(testData.carousel1click);
      DataLayer.Manager({ dataLayer: adobeDataLayer });
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback); });

      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);
    });

    test('initialization > event > listener', () => {
      const mockCallback = jest.fn();
      DataLayer.Manager({ dataLayer: adobeDataLayer });
      adobeDataLayer.push(testData.carousel1click);
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback); });

      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);
    });

    test('initialization > listener > event', () => {
      const mockCallback = jest.fn();
      DataLayer.Manager({ dataLayer: adobeDataLayer });
      adobeDataLayer.push(function(dl) { createEventListener(dl, mockCallback); });
      adobeDataLayer.push(testData.carousel1click);

      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);
    });
  });
});
