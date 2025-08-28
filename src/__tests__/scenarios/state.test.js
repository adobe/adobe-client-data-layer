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

const DataLayerManager = require('../../dataLayerManager');
const DataLayer = { Manager: DataLayerManager };
const isEmpty = obj => [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;

let adobeDataLayer;

const clearDL = function() {
  beforeEach(() => {
    adobeDataLayer = [];
    DataLayer.Manager({ dataLayer: adobeDataLayer });
  });
};

describe('State', () => {
  clearDL();

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
