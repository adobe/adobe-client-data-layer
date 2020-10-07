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
const ITEM_CONSTRAINTS = require('../../itemConstraints');
const DataLayerManager = require('../../dataLayerManager');
const DataLayer = { Manager: DataLayerManager };
let adobeDataLayer;

const ancestorRemoved = require('../../utils/ancestorRemoved');
const customMerge = require('../../utils/customMerge');
const dataMatchesContraints = require('../../utils/dataMatchesContraints');
const indexOfListener = require('../../utils/indexOfListener');
const listenerMatch = require('../../utils/listenerMatch');

const clearDL = function() {
  beforeEach(() => {
    adobeDataLayer = [];
    DataLayer.Manager({ dataLayer: adobeDataLayer });
  });
};

describe('Utils', () => {
  clearDL();

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
