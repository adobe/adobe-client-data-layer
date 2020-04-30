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

const testData = require('./testData');
const isEqual = require('lodash/isequal');
const isEmpty = require('lodash/isempty');
const merge = require('lodash/merge');
let adobeDataLayer;

beforeEach(() => {
  adobeDataLayer = [];
  new DataLayer.Manager({ dataLayer: adobeDataLayer });
});

// -----------------------------------------------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------------------------------------------

describe('State', () => {
  test('getState()', () => {
    const carousel1 = {
      id: '/content/mysite/en/home/jcr:content/root/carousel1',
      items: {}
    };
    const data = {
      component: {
        carousel: {
          carousel1: carousel1
        }
      }
    };
    adobeDataLayer.push(data);
    expect(adobeDataLayer.getState()).toEqual(data);
    expect(adobeDataLayer.getState("component.carousel.carousel1")).toEqual(carousel1);
    expect(isEmpty(adobeDataLayer.getState("undefined-path")));
  });
});

// -----------------------------------------------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------------------------------------------

describe('Data', () => {
  test('push page', () => {
    adobeDataLayer.push(testData.page1);
    expect(adobeDataLayer.getState(), 'page is in data layer after push').toStrictEqual(testData.page1);
  });

  test('push components and override', () => {
    const twoCarousels = merge({}, testData.carousel1, testData.carousel2);
    const carousel1empty = merge({}, testData.carousel1empty, testData.carousel2);
    const carousel2empty = merge({}, testData.carousel1, testData.carousel2empty);
    const twoCarouselsEmpty = merge({}, testData.carousel1empty, testData.carousel2empty);

    adobeDataLayer.push(twoCarousels);
    expect(adobeDataLayer.getState(), 'carousel 1 with data, carousel 2 with data').toStrictEqual(twoCarousels);

    adobeDataLayer.push(testData.carousel1empty);
    expect(adobeDataLayer.getState(), 'carousel 1 empty, carousel 2 with data').toStrictEqual(carousel1empty);

    adobeDataLayer.push(testData.carousel2empty);
    expect(adobeDataLayer.getState(), 'carousel 1 empty, carousel 2 empty').toStrictEqual(twoCarouselsEmpty);

    adobeDataLayer.push(testData.carousel1);
    expect(adobeDataLayer.getState(), 'carousel 1 with data, carousel 2 empty').toStrictEqual(carousel2empty);
  });
});

// -----------------------------------------------------------------------------------------------------------------
// Events
// -----------------------------------------------------------------------------------------------------------------

describe('Events', () => {
  test('push simple event', () => {
    adobeDataLayer.push(testData.carousel1click);
    expect(adobeDataLayer.getState()).toStrictEqual(testData.carousel1);
  });
});

// -----------------------------------------------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------------------------------------------

describe('Funcions', () => {
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

// -----------------------------------------------------------------------------------------------------------------
// Event listeners
// -----------------------------------------------------------------------------------------------------------------

describe('Event listeners', () => {
  describe('types', () => {
    test('adobeDataLayer:change triggered by component push', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback);
      adobeDataLayer.push(testData.carousel1);
      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);

      adobeDataLayer.removeEventListener('adobeDataLayer:change');
      adobeDataLayer.push(testData.carousel2);
      expect(mockCallback.mock.calls.length, 'callback not triggered second time').toBe(1);
    });

    test('adobeDataLayer:change triggered by event push', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback);
      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length).toBe(1);

      adobeDataLayer.removeEventListener('adobeDataLayer:change');
      adobeDataLayer.push(testData.carousel1change);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('adobeDataLayer:event triggered by event push', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.addEventListener('adobeDataLayer:event', mockCallback);
      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);

      adobeDataLayer.removeEventListener('adobeDataLayer:event');
      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback not triggered second time').toBe(1);
    });

    test('custom event triggered by event push', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.addEventListener('carousel clicked', mockCallback);
      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);

      adobeDataLayer.removeEventListener('carousel clicked');
      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback not triggered second time').toBe(1);
    });
  });

  describe('scopes', () => {
    test('past', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.push(testData.carousel1click);
      adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'past' });
      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);

      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback not triggered second time').toBe(1);
    });

    test('future', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.push(testData.carousel1click);
      adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'future' });
      expect(mockCallback.mock.calls.length, 'callback not triggered first time').toBe(0);

      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback triggered only second time').toBe(1);
    });

    test('all', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.push(testData.carousel1click);
      adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'all' });
      expect(mockCallback.mock.calls.length, 'callback triggered first time').toBe(1);

      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback triggered second time').toBe(2);
    });

    test('undefined (defaults to all)', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.push(testData.carousel1click);
      adobeDataLayer.addEventListener('carousel clicked', mockCallback);
      expect(mockCallback.mock.calls.length, 'callback triggered first time').toBe(1);

      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback triggered second time').toBe(2);
    });
  });

  describe('duplications', () => {
    test('register a handler that has already been registered', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.push(testData.carousel1click);
      adobeDataLayer.addEventListener('carousel clicked', mockCallback);
      adobeDataLayer.addEventListener('carousel clicked', mockCallback);

      // only one listener is registered

      expect(mockCallback.mock.calls.length, 'callback triggered just once').toBe(1);
      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback triggered just once (second time)').toBe(2);
    });

    test('register a handler (with a static function) that has already been registered', () => {
      const mockCallback = jest.fn();
      adobeDataLayer.addEventListener('carousel clicked', function() {
        mockCallback();
      });
      adobeDataLayer.addEventListener('carousel clicked', function() {
        mockCallback();
      });

      // both listeners are registered

      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback triggered twice').toBe(2);
    });
  });

  describe('with path', () => {
    const mockCallback = jest.fn();
    const changeEventArguments = ['adobeDataLayer:change', mockCallback, { path: 'component.image' }];

    beforeEach(() => {
      mockCallback.mockClear();
    });

    test('adobeDataLayer:change triggers on component.image', () => {
      adobeDataLayer.addEventListener.apply(adobeDataLayer, changeEventArguments);
      adobeDataLayer.push(testData.carousel1);
      expect(mockCallback.mock.calls.length).toBe(0);

      adobeDataLayer.push(testData.image1);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('adobeDataLayer:change triggers on component.image with data', () => {
      adobeDataLayer.addEventListener.apply(adobeDataLayer, changeEventArguments);
      adobeDataLayer.push(testData.carousel1change);
      expect(mockCallback.mock.calls.length).toBe(0);

      adobeDataLayer.push(testData.image1change);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('viewed event triggers on component.image', () => {
      adobeDataLayer.addEventListener('viewed', mockCallback, { path: 'component.image' });
      adobeDataLayer.push(testData.carousel1viewed);
      expect(mockCallback.mock.calls.length).toBe(0);

      adobeDataLayer.push(testData.image1viewed);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('custom event triggers on all components', () => {
      adobeDataLayer.push(testData.carousel1change);
      adobeDataLayer.push(testData.image1change);
      adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback, { path: 'component' });
      adobeDataLayer.push(testData.image1change);
      expect(mockCallback.mock.calls.length).toBe(3);
    });

    test('old / new value', () => {
      const compareOldNewValueFunction = function(event, oldState, newState) {
        if (oldState === 'old') mockCallback();
        if (newState === 'new') mockCallback();
      };

      adobeDataLayer.push(testData.carousel1oldId);
      adobeDataLayer.addEventListener('adobeDataLayer:change', compareOldNewValueFunction, {
          path: 'component.carousel.carousel1.id',
      });
      adobeDataLayer.push(testData.carousel1newId);
      expect(mockCallback.mock.calls.length).toBe(2);
    });

    test('old / new state', () => {
      const compareOldNewStateFunction = function(event, oldState, newState) {
        if (isEqual(oldState, testData.carousel1oldId)) mockCallback();
        if (isEqual(newState, testData.carousel1newId)) mockCallback();
      };

      adobeDataLayer.push(merge({ event: 'adobeDataLayer:change' }, testData.carousel1oldId));
      adobeDataLayer.addEventListener('adobeDataLayer:change', compareOldNewStateFunction);
      adobeDataLayer.push(merge({ event: 'adobeDataLayer:change' }, testData.carousel1newId));
      expect(mockCallback.mock.calls.length).toBe(2);
    });

    test('calling getState() within a handler should return the state after the event', () => {
      const compareGetStateWithNewStateFunction = function(event, oldState, newState) {
        if (isEqual(this.getState(), newState)) mockCallback();
      };

      adobeDataLayer.push(merge({ event: 'adobeDataLayer:change' }, testData.carousel1oldId ));
      adobeDataLayer.addEventListener('adobeDataLayer:change', compareGetStateWithNewStateFunction);
      adobeDataLayer.push(merge({ event: 'adobeDataLayer:change' }, testData.carousel1oldId ));
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('undefined old / new state for past events', () => {
      const isOldNewStateUndefinedFunction = function(event, oldState, newState) {
        if (isEqual(oldState, undefined) && isEqual(newState, undefined)) mockCallback();
      };

      adobeDataLayer.push(testData.carousel1change);
      adobeDataLayer.addEventListener('adobeDataLayer:change', isOldNewStateUndefinedFunction, { scope: 'past' });
      expect(mockCallback.mock.calls.length).toBe(1);
    });
  });

  describe('unregister', () => {
    test('one handler', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.push(testData.carousel1click);
      adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'all' });
      expect(mockCallback.mock.calls.length).toBe(1);

      adobeDataLayer.removeEventListener('carousel clicked', mockCallback);
      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('handler with a static function', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.addEventListener('carousel clicked', function() { mockCallback(); });
      adobeDataLayer.removeEventListener('carousel clicked', function() { mockCallback(); });

      // does not unregister the listener

      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('multiple handlers', () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();
      const userLoadedEvent = { event: 'user loaded' };

      adobeDataLayer.addEventListener('user loaded', mockCallback1);
      adobeDataLayer.addEventListener('user loaded', mockCallback2);
      adobeDataLayer.push(userLoadedEvent);

      expect(mockCallback1.mock.calls.length).toBe(1);
      expect(mockCallback2.mock.calls.length).toBe(1);

      adobeDataLayer.removeEventListener('user loaded');
      adobeDataLayer.push(userLoadedEvent);

      expect(mockCallback1.mock.calls.length).toBe(1);
      expect(mockCallback2.mock.calls.length).toBe(1);
    });
  });
});

// -----------------------------------------------------------------------------------------------------------------
// Invalid: data, event, listeners
// -----------------------------------------------------------------------------------------------------------------

describe('Invalid', () => {
  test.skip('invalid listener on', () => {
    const mockCallback = jest.fn();
    adobeDataLayer.addEventListener('carousel clicked', mockCallback, { invalid: 'invalid' });
    adobeDataLayer.push(testData.carousel1click);
    expect(mockCallback.mock.calls.length).toBe(0);
  });

  test('invalid listener on scope', () => {
    const mockCallback = jest.fn();
    adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'invalid' });
    adobeDataLayer.push(testData.carousel1click);
    expect(mockCallback.mock.calls.length).toBe(0);
  });

  test.skip('invalid listener off', () => {
    const mockCallback = jest.fn();

    adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback);
    adobeDataLayer.push(testData.page1);
    expect(mockCallback.mock.calls.length).toBe(1);

    adobeDataLayer.removeEventListener('adobeDataLayer:change', mockCallback, { invalid: 'invalid' });
    adobeDataLayer.push(testData.page2);
    expect(mockCallback.mock.calls.length).toBe(2);
  });

  test.skip('invalid item is filtered out from array', () => {
    dataLayer = [
      {
        data: {
          invalid: {}
        },
        invalid: 'invalid'
      },
      {
        event: 'clicked',
        data: {
          invalid: {}
        },
        invalid: 'invalid'
      }
    ];

    // ... to be finished
  });
});

// -----------------------------------------------------------------------------------------------------------------
// Performance
// -----------------------------------------------------------------------------------------------------------------

describe('Performance', () => {
  // high load benchmark: runs alone in 10.139s with commit: df0fef59c86635d3c29e6f698352491dcf39003c (15/oct/2019)
  test.skip('high load', () => {
    const mockCallback = jest.fn();
    const data = {};

    adobeDataLayer.addEventListener('carousel clicked', mockCallback);

    for (let i= 0; i < 1000; i++) {
      let pageId = '/content/mysite/en/products/crossfit' + i;
      let pageKey = 'page' + i;
      data[pageKey] = {
        id: pageId,
        siteLanguage: 'en-us',
        siteCountry: 'US',
        pageType: 'product detail',
        pageName: 'pdp - crossfit zoom',
        pageCategory: 'womens > shoes > athletic'
      };

      adobeDataLayer.push({
        event: 'carousel clicked',
        data: data
      });
      expect(adobeDataLayer.getState()).toStrictEqual(data);
      expect(mockCallback.mock.calls.length).toBe(i + 1);
    }

  });
});
