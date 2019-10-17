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
'use strict';
const DataLayer = require('../scripts/DataLayer');
let dataLayer;

beforeEach(() => {
  dataLayer = [];
  new DataLayer.Manager({ dataLayer: dataLayer });
});

test('add data', () => {
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

test('remove data', () => {
  const data = {
    'component': {
      'carousel': {
        'carousel1': {
          'id': '/content/mysite/en/home/jcr:content/root/carousel1',
          'items': {}
        }
      }
    }
  };
  dataLayer.push({ data: data });
  expect(dataLayer.getState()).toMatchObject(data);
  dataLayer.push({
    'data': {
      'component': {
        'carousel': {
          'carousel1': undefined
        }
      }
    }
  });
  const updatedData = {
    'component': {
      'carousel': {}
    }
  };
  expect(dataLayer.getState()).toMatchObject(updatedData);
});

test('add event', () => {
  const data = {
    'component': {
      'carousel': {
        'carousel3': {
          'id': '/content/mysite/en/home/jcr:content/root/carousel3',
          'items': {}
        }
      }
    }
  };
  dataLayer.push({
    event: 'carousel clicked',
    data: data
  });
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

test('listener on: datalayer:event', () => {
  const mockCallback = jest.fn();
  const argOn = {
    'on': 'datalayer:event',
    'handler': mockCallback
  };
  dataLayer.push(argOn);
  dataLayer.push({
    'event': 'clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  const argOff = {
    'off': 'datalayer:event'
  };
  dataLayer.push(argOff);
  dataLayer.push({
    'event': 'datalayer:event',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: custom event', () => {
  const mockCallback = jest.fn();
  const argOn = {
    'on': 'carousel clicked',
    'handler': mockCallback
  };
  dataLayer.push(argOn);
  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  const argOff = {
    'off': 'carousel clicked'
  };
  dataLayer.push(argOff);
  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: scope = past', () => {
  const mockCallback = jest.fn();
  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  const argOn = {
    'on': 'carousel clicked',
    'scope': 'past',
    'handler': mockCallback
  };
  dataLayer.push(argOn);
  expect(mockCallback.mock.calls.length).toBe(1);

  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: scope = future', () => {
  const mockCallback = jest.fn();
  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  const argOn = {
    'on': 'carousel clicked',
    'scope': 'future',
    'handler': mockCallback
  };
  dataLayer.push(argOn);
  expect(mockCallback.mock.calls.length).toBe(0);

  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: scope = all', () => {
  const mockCallback = jest.fn();
  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  const argOn = {
    'on': 'carousel clicked',
    'scope': 'all',
    'handler': mockCallback
  };
  dataLayer.push(argOn);
  expect(mockCallback.mock.calls.length).toBe(1);

  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(2);
});

test('listener on: scope = undefined (default to future)', () => {
  const mockCallback = jest.fn();
  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  const argOn = {
    'on': 'carousel clicked',
    'handler': mockCallback
  };
  dataLayer.push(argOn);
  expect(mockCallback.mock.calls.length).toBe(0);

  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('invalid data', () => {
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
  dataLayer.push({
    data: data,
    'invalid': 'invalid'
  });
  expect(dataLayer.getState()).toMatchObject({});
});

test('invalid event', () => {
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
  dataLayer.push({
    event: 'clicked',
    data: data,
    'invalid': 'invalid'
  });
  expect(dataLayer.getState()).toMatchObject({});
});

test('invalid listener on', () => {
  const mockCallback = jest.fn();
  const argOn = {
    'on': 'carousel clicked',
    'handler': mockCallback,
    'invalid': 'invalid'
  };
  dataLayer.push(argOn);

  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(0);
});

test('invalid listener off', () => {
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
    'off': 'datalayer:change',
    'invalid': 'invalid'
  };
  dataLayer.push(argOff);
  dataLayer.push({
    data: {
      'page': {
        'id': '/content/mysite/en/products/running'
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(2);
});

// high load benchmark: runs alone in 10.139s with commit: df0fef59c86635d3c29e6f698352491dcf39003c (15/oct/2019)
test.skip('high load', () => {
  const mockCallback = jest.fn();
  const argOn = {
    'on': 'carousel clicked',
    'handler': mockCallback
  };
  dataLayer.push(argOn);

  const data = {};
  for (let i= 0; i < 1000; i++) {
    let pageId = '/content/mysite/en/products/crossfit' + i;
    let pageKey = 'page' + i;
    data[pageKey] = {
      'id': pageId,
      'siteLanguage': 'en-us',
      'siteCountry': 'US',
      'pageType': 'product detail',
      'pageName': 'pdp - crossfit zoom',
      'pageCategory': 'womens > shoes > athletic'
    };

    dataLayer.push({
      'event': 'carousel clicked',
      'data': data
    });
    expect(dataLayer.getState()).toMatchObject(data);
    expect(mockCallback.mock.calls.length).toBe(i + 1);
  }

});

test('invalid item is filtered out from array', () => {
  dataLayer = [
    {
      'off': 'carousel 15 clicked'
    },
    {
      'on': 'carousel 15 clicked'
    },
    {
      'data': {
        'invalid': {}
      },
      'invalid': 'invalid'
    },
    {
      'event': 'clicked',
      'data': {
        'invalid': {}
      },
      'invalid': 'invalid'
    }
  ];
  new DataLayer.Manager({ dataLayer: dataLayer });
  dataLayer.push({
    'data': {
      'invalid': {}
    },
    'invalid': 'invalid'
  });
  dataLayer.push({
    'event': 'clicked',
    'data': {
      'invalid': {}
    },
    'invalid': 'invalid'
  });
  dataLayer.push({
    'on': 'carousel 14 clicked',
    'handler': function(event) {
      //
    },
  });
  dataLayer.push({
    'off': 'carousel 14 clicked',
  });
  expect(dataLayer.length).toEqual(0);
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
