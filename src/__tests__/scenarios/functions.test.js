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

const clearDL = function() {
  beforeEach(() => {
    adobeDataLayer = [];
    DataLayer.Manager({ dataLayer: adobeDataLayer });
  });
};

const createEventListener = function(dl, eventName, callback, eventData) {
  dl.addEventListener(eventName, function(eventData) {
    expect(eventData, 'data layer object as an argument of callback').toEqual(eventData);
    callback();
  });
};

describe('Functions', () => {
  describe('simple', () => {
    clearDL();

    test('push simple function', () => {
      const mockCallback = jest.fn();
      adobeDataLayer.push(mockCallback);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('function adds event listener for adobeDataLayer:change', () => {
      const mockCallback = jest.fn();
      const addEventListener = function(adl) {
        adl.addEventListener('adobeDataLayer:change', mockCallback);
      };

      adobeDataLayer.push(testData.carousel1);
      adobeDataLayer.push(addEventListener);
      adobeDataLayer.push(testData.carousel2);

      expect(mockCallback.mock.calls.length, 'event triggered twice').toBe(2);
    });

    test('function updates component in data layer state', () => {
      const updateCarousel = function(adl) {
        adl.push(testData.carousel1new);
      };

      adobeDataLayer.push(testData.carousel1);
      expect(adobeDataLayer.getState(), 'carousel set to carousel1').toEqual(testData.carousel1);

      adobeDataLayer.push(updateCarousel);
      expect(adobeDataLayer.getState(), 'carousel set to carousel1new').toEqual(testData.carousel1new);
    });
  });

  test('nested anonymous functions', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    const mockCallback3 = jest.fn();

    adobeDataLayer.addEventListener('adobeDataLayer:event', function(eventData) {
      mockCallback1();
    });

    adobeDataLayer.push(testData.carousel1click);

    adobeDataLayer.push(function(dl) {
      createEventListener(dl, 'carousel clicked', mockCallback2, testData.carousel1click);

      dl.push(function(dl2) {
        createEventListener(dl2, 'viewed', mockCallback3, testData.carousel1viewed);

        dl2.push(function(dl3) {
          dl3.push(testData.carousel1click);
        });
      });

      adobeDataLayer.push(testData.carousel1viewed);
    });

    DataLayer.Manager({ dataLayer: adobeDataLayer });

    expect(mockCallback1.mock.calls.length, 'callback triggered 3 times').toBe(3);
    expect(mockCallback2.mock.calls.length, 'callback triggered 2 times').toBe(2);
    expect(mockCallback3.mock.calls.length, 'callback triggered 1 times').toBe(1);
  });
});
