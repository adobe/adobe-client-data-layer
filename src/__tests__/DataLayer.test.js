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
const isEqual = require('lodash/isEqual');
const isEmpty = require('lodash/isEmpty');
const merge = require('lodash/merge');

const testData = require('./testData');
const ITEM_CONSTRAINTS = require('../itemConstraints');
const DataLayer = require('../');
let adobeDataLayer;

const ancestorRemoved = require('../utils/ancestorRemoved');
const customMerge = require('../utils/customMerge');
const dataMatchesContraints = require('../utils/dataMatchesContraints');
const indexOfListener = require('../utils/indexOfListener');
const listenerMatch = require('../utils/listenerMatch');

beforeEach(() => {
  adobeDataLayer = [];
  DataLayer.Manager({ dataLayer: adobeDataLayer });
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
    expect(adobeDataLayer.getState('component.carousel.carousel1')).toEqual(carousel1);
    expect(isEmpty(adobeDataLayer.getState('undefined-path')));
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

describe('Functions', () => {
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

      // edge case: unregister when no listener had been registered
      adobeDataLayer.removeEventListener('adobeDataLayer:change');

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

    test('adobeDataLayer:change not triggered by event push', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback);
      adobeDataLayer.push({
        event: 'page loaded'
      });
      expect(mockCallback.mock.calls.length, 'callback not triggered').toBe(0);
      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length, 'callback triggered once').toBe(1);
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

    test('invalid', () => {
      const mockCallback = jest.fn();
      adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'invalid' });
      adobeDataLayer.push(testData.carousel1click);
      expect(mockCallback.mock.calls.length).toBe(0);
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

    test('event triggers when the ancestor is removed with null', () => {
      adobeDataLayer.addEventListener.apply(adobeDataLayer, changeEventArguments);
      adobeDataLayer.push(testData.componentNull);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('event triggers when the ancestor is removed with undefined', () => {
      adobeDataLayer.addEventListener.apply(adobeDataLayer, changeEventArguments);
      adobeDataLayer.push(testData.componentUndefined);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('event does not trigger when the ancestor does not exist', () => {
      const changeEventArguments1 = ['adobeDataLayer:change', mockCallback, { path: 'component1.image' }];
      adobeDataLayer.addEventListener.apply(adobeDataLayer, changeEventArguments1);
      adobeDataLayer.push(testData.componentUndefined);
      expect(mockCallback.mock.calls.length).toBe(0);
    });

    test('viewed event triggers on component.image', () => {
      adobeDataLayer.addEventListener('viewed', mockCallback, { path: 'component.image' });
      adobeDataLayer.push(testData.carousel1viewed);
      expect(mockCallback.mock.calls.length).toBe(0);

      adobeDataLayer.push(testData.image1viewed);
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('viewed event does not trigger on a non existing object', () => {
      adobeDataLayer.addEventListener('viewed', mockCallback, { path: 'component.image.undefined' });
      adobeDataLayer.push(testData.image1viewed);
      expect(mockCallback.mock.calls.length).toBe(0);
    });

    test('custom event triggers on all components', () => {
      adobeDataLayer.push(testData.carousel1change);
      adobeDataLayer.push(testData.image1change);
      adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback, { path: 'component' });
      adobeDataLayer.push(testData.image1change);
      expect(mockCallback.mock.calls.length).toBe(3);
    });

    test('old / new value', () => {
      const compareOldNewValueFunction = function(event, oldValue, newValue) {
        if (oldValue === 'old') mockCallback();
        if (newValue === 'new') mockCallback();
      };

      adobeDataLayer.push(testData.carousel1oldId);
      adobeDataLayer.addEventListener('adobeDataLayer:change', compareOldNewValueFunction, {
        path: 'component.carousel.carousel1.id'
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

      adobeDataLayer.push(merge({ event: 'adobeDataLayer:change' }, testData.carousel1oldId));
      adobeDataLayer.addEventListener('adobeDataLayer:change', compareGetStateWithNewStateFunction);
      adobeDataLayer.push(merge({ event: 'adobeDataLayer:change' }, testData.carousel1oldId));
      expect(mockCallback.mock.calls.length).toBe(1);
    });

    test('undefined old / new state for past events', () => {
      // this behaviour is explained at: https://github.com/adobe/adobe-client-data-layer/issues/33
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

    test('handler with an anonymous function', () => {
      const mockCallback = jest.fn();

      adobeDataLayer.addEventListener('carousel clicked', function() { mockCallback(); });
      adobeDataLayer.removeEventListener('carousel clicked', function() { mockCallback(); });

      // an anonymous handler cannot be unregistered (similar to EventTarget.addEventListener())

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
// Performance
// -----------------------------------------------------------------------------------------------------------------

describe('Performance', () => {
  // high load benchmark: runs alone in 10.139s with commit: df0fef59c86635d3c29e6f698352491dcf39003c (15/oct/2019)
  test.skip('high load', () => {
    const mockCallback = jest.fn();
    const data = {};

    adobeDataLayer.addEventListener('carousel clicked', mockCallback);

    for (let i = 0; i < 1000; i++) {
      const pageId = '/content/mysite/en/products/crossfit' + i;
      const pageKey = 'page' + i;
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

// -----------------------------------------------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------------------------------------------

describe('Utils', () => {
  describe('ancestorRemoved', () => {
    test('removed', () => {
      expect(ancestorRemoved(testData.componentNull, 'component.carousel')).toBeTruthy();
      expect(ancestorRemoved(testData.componentNull, 'component.carousel.carousel1')).toBeTruthy();
    });
    test('not removed', () => {
      expect(ancestorRemoved(testData.carousel1, 'component.carousel')).toBeFalsy();
      expect(ancestorRemoved(testData.carousel1, 'component.carousel.carousel1')).toBeFalsy();
    });
  });

  describe('customMerge', () => {
    test('merges object', () => {
      const objectInitial = { prop1: 'foo' };
      const objectSource = { prop2: 'bar' };
      const objectFinal = { prop1: 'foo', prop2: 'bar' };
      customMerge(objectInitial, objectSource);
      expect(objectInitial).toEqual(objectFinal);
    });
    test('overrides with null and undefined', () => {
      const objectInitial = { prop1: 'foo', prop2: 'bar' };
      const objectSource = { prop1: null, prop2: undefined };
      const objectFinal = { prop1: null, prop2: null };
      customMerge(objectInitial, objectSource);
      expect(objectInitial).toEqual(objectFinal);
    });
  });

  describe('dataMatchesContraints', () => {
    test('event', () => {
      expect(dataMatchesContraints(testData.carousel1click, ITEM_CONSTRAINTS.event)).toBeTruthy();
    });
    test('listenerOn', () => {
      const listenerOn = {
        on: 'event',
        handler: () => {},
        scope: 'future',
        path: 'component.carousel1'
      };
      expect(dataMatchesContraints(listenerOn, ITEM_CONSTRAINTS.listenerOn)).toBeTruthy();
    });
    test('listenerOn with wrong scope (optional)', () => {
      const listenerOn = {
        on: 'event',
        handler: () => {},
        scope: 'wrong',
        path: 'component.carousel1'
      };
      expect(dataMatchesContraints(listenerOn, ITEM_CONSTRAINTS.listenerOn)).toBeFalsy();
    });
    test('listenerOn with wrong scope (not optional)', () => {
      const constraints = {
        scope: {
          type: 'string',
          values: ['past', 'future', 'all']
        }
      };
      const listenerOn = {
        on: 'event',
        handler: () => {},
        scope: 'past'
      };
      expect(dataMatchesContraints(listenerOn, constraints)).toBeTruthy();
    });
    test('listenerOff', () => {
      const listenerOff = {
        off: 'event',
        handler: () => {},
        scope: 'future',
        path: 'component.carousel1'
      };
      expect(dataMatchesContraints(listenerOff, ITEM_CONSTRAINTS.listenerOff)).toBeTruthy();
    });
  });

  describe('indexOfListener', () => {
    test('indexOfListener', () => {
      const fct1 = jest.fn();
      const fct2 = jest.fn();
      const listener1 = {
        event: 'click',
        handler: fct1
      };
      const listener2 = {
        event: 'click',
        handler: fct2
      };
      const listener3 = {
        event: 'load',
        handler: fct1
      };
      const listeners = {
        click: [listener1, listener2]
      };
      expect(indexOfListener(listeners, listener2)).toBe(1);
      expect(indexOfListener(listeners, listener3)).toBe(-1);
    });
  });

  describe('listenerMatch', () => {
    test('event type', () => {
      const listener = {
        event: 'user loaded',
        handler: () => {},
        scope: 'all',
        path: null
      };
      const item = {
        config: { event: 'user loaded' },
        type: 'event'
      };
      expect(listenerMatch(listener, item)).toBeTruthy();
    });
    test('with correct path', () => {
      const listener = {
        event: 'viewed',
        handler: () => {},
        scope: 'all',
        path: 'component.image.image1'
      };
      const item = {
        config: testData.image1viewed,
        type: 'event',
        data: testData.image1
      };
      expect(listenerMatch(listener, item)).toBeTruthy();
    });
    test('with incorrect path', () => {
      const listener = {
        event: 'viewed',
        handler: () => {},
        scope: 'all',
        path: 'component.carousel'
      };
      const item = {
        config: testData.image1viewed,
        type: 'event',
        data: testData.image1
      };
      expect(listenerMatch(listener, item)).toBeFalsy();
    });
    test('wrong item type', () => {
      const listener = {
        event: 'user loaded',
        handler: () => {},
        scope: 'all',
        path: null
      };
      const item = {
        config: { event: 'user loaded' },
        type: 'wrong'
      };
      expect(listenerMatch(listener, item)).toBeFalsy();
    });
    test('item type == data', () => {
      const listener = {
        event: 'user loaded',
        handler: () => {}
      };
      const item = {
        type: 'data'
      };
      expect(listenerMatch(listener, item)).toBeFalsy();
    });
  });
});
