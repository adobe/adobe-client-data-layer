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
const isEqual = require('lodash/isEqual');
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

describe('Event listeners', () => {
  clearDL();

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
