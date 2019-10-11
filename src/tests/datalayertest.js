/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing pefrmissions and limitations under the License.
*/
/* eslint strict: ["error", "global"] */
'use strict';
const DataLayer = require('../scripts/datalayer');
let dataLayer;

beforeEach(() => {
    dataLayer = [];
    new DataLayer.Manager({ dataLayer: dataLayer });
});

test('simple state check after pushing data', () => {
    const data = {
        'page': {
            'id': '/content/mysite/en/products/crossfit',
            'siteLanguage': 'en-us',
            'siteCountry': 'US',
            'pageType': 'product detail',
            'pageName': 'pdp - crossfit zoom',
            'pageCategory': 'womens > shoes > athletic'
        }
    };
    dataLayer.push({ data: data });
    expect(dataLayer.getState()).toMatchObject(data);
});

test('check dataLayer change event was executed', () => {
    const mockCallback = jest.fn();
    const argOn = {
        'on': 'datalayer:change',
        'handler': mockCallback
    };
    dataLayer.push(argOn);
    dataLayer.push({
        data: {
            'page': {
                'id': '/content/mysite/en/products/crossfit'
            }
        }
    });
    expect(mockCallback.mock.calls.length).toBe(1);
    const argOff = {
        'off': 'datalayer:change'
    };
    dataLayer.push(argOff);
    dataLayer.push({
        data: {
            'page': {
                'id': '/content/mysite/en/products/running'
            }
        }
    });
    expect(mockCallback.mock.calls.length).toBe(1);
});


/**
 * Tests for DataLayer.utils functions
 */
test('deep merge of target and source object', () => {
    let target = {
        a: {
            ab: 12
        }
    };
    DataLayer.utils.deepMerge(target, { a: { ab: undefined, ac: 13, ad: { ada: 141 } }, b: 2 });
    expect(target).toMatchObject({ a: { ac: 13, ad: { ada: 141 } }, b: 2 });
});

test('argument to be an object', () => {
    expect(DataLayer.utils.isObject({ foo: 'bar' })).toBe(true);
    expect(DataLayer.utils.isObject(['foo', 'bar'])).toBe(false);
});
