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
const isEqual = require('lodash.isequal');
const isEmpty = require('lodash.isempty');
const merge = require('lodash.merge');
let adobeDataLayer;

beforeEach(() => {
  adobeDataLayer = [];
  new DataLayer.Manager({ dataLayer: adobeDataLayer });
});

// -----------------------------------------------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------------------------------------------

test('add data', () => {
  const data = {
    page: {
      id: '/content/mysite/en/products/crossfit',
      siteLanguage: 'en-us',
      siteCountry: 'US',
      pageType: 'product detail',
      pageName: 'pdp - crossfit zoom',
      pageCategory: 'womens > shoes > athletic'
    }
  };
  adobeDataLayer.push(data);
  expect(adobeDataLayer.getState()).toStrictEqual(data);
});

test('remove data', () => {
  const data = {
    component: {
      carousel: {
        carousel1: {
          id: '/content/mysite/en/home/jcr:content/root/carousel1',
          items: {}
        },
        carousel2: {
          id: '/content/mysite/en/home/jcr:content/root/carousel2',
          items: {}
        }
      }
    }
  };
  adobeDataLayer.push(data);
  expect(adobeDataLayer.getState()).toStrictEqual(data);
  adobeDataLayer.push({
    component: {
      carousel: {
        carousel1: undefined
      }
    }
  });
  const updatedData = {
    component: {
      carousel: {
        carousel1: undefined,
        carousel2: {
          id: '/content/mysite/en/home/jcr:content/root/carousel2',
          items: {}
        }
      }
    }
  };
  expect(adobeDataLayer.getState()).toStrictEqual(updatedData);
});

// -----------------------------------------------------------------------------------------------------------------
// Event
// -----------------------------------------------------------------------------------------------------------------

test('add event', () => {
  const data = {
    component: {
      carousel: {
        carousel3: {
          id: '/content/mysite/en/home/jcr:content/root/carousel3',
          items: {}
        }
      }
    }
  };
  adobeDataLayer.push({
    event: 'carousel clicked',
    component: {
      carousel: {
        carousel3: {
          id: '/content/mysite/en/home/jcr:content/root/carousel3',
          items: {}
        }
      }
    }
  });
  expect(adobeDataLayer.getState()).toStrictEqual(data);
});

// -----------------------------------------------------------------------------------------------------------------
// Function
// -----------------------------------------------------------------------------------------------------------------

test('add function: simple', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.push(mockCallback);
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('add function: add listener with adobeDataLayer:change event', () => {
  const mockCallback = jest.fn();

  adobeDataLayer.push(function(dl) {
    dl.addEventListener("adobeDataLayer:change", mockCallback);
  });

  adobeDataLayer.push({
    component: {
      carousel: {
        carousel1: {
          id: '/content/mysite/en/home/jcr:content/root/carousel1',
          items: {}
        }
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('add function: function updates the state', () => {
  const data1 = {
    component: {
      carousel: {
        carousel1: {
          id: '/content/mysite/en/home/jcr:content/root/carousel1-old',
        }
      }
    }
  };
  const data2 = {
    component: {
      carousel: {
        carousel1: {
          id: '/content/mysite/en/home/jcr:content/root/carousel1-new',
        }
      }
    }
  };
  adobeDataLayer.push(data1);
  expect(adobeDataLayer.getState()).toEqual(data1);
  const testFct = function(adl) {
    adl.push(data2);
  };
  adobeDataLayer.push(testFct);
  expect(adobeDataLayer.getState()).toEqual(data2);
});

// -----------------------------------------------------------------------------------------------------------------
// Event listener on
// -----------------------------------------------------------------------------------------------------------------

test('check dataLayer change event was executed', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback);
  adobeDataLayer.push({
    data: {
      page: {
        id: '/content/mysite/en/products/crossfit'
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  adobeDataLayer.removeEventListener('adobeDataLayer:change');
  adobeDataLayer.push({
    data: {
      page: {
        id: '/content/mysite/en/products/running'
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: adobeDataLayer:event', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('adobeDataLayer:event', mockCallback);
  adobeDataLayer.push({
    event: 'clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  adobeDataLayer.removeEventListener('adobeDataLayer:event');
  adobeDataLayer.push({
    event: 'adobeDataLayer:event',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: adobeDataLayer:change', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback);
  adobeDataLayer.push({
    event: 'clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    },
    data: {
      page: {
        id: '/content/mysite/en/products/running'
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  adobeDataLayer.removeEventListener('adobeDataLayer:change');
  adobeDataLayer.push({
    event: 'adobeDataLayer:change',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: custom event', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('carousel clicked', mockCallback);
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  adobeDataLayer.removeEventListener('carousel clicked');
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: scope = past', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'past'});
  expect(mockCallback.mock.calls.length).toBe(1);

  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: scope = future', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'future'});
  expect(mockCallback.mock.calls.length).toBe(0);
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: scope = all', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'all'});
  expect(mockCallback.mock.calls.length).toBe(1);
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(2);
});

test('listener on: scope = undefined (default to all)', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  adobeDataLayer.addEventListener('carousel clicked', mockCallback);
  expect(mockCallback.mock.calls.length).toBe(1);
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(2);
});

test('listener on: register a handler that has already been registered', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  adobeDataLayer.addEventListener('carousel clicked', mockCallback);
  adobeDataLayer.addEventListener('carousel clicked', mockCallback);

  // -> only one listener is registered

  expect(mockCallback.mock.calls.length).toBe(1);

  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(2);
});

test('listener on: register a handler (with a static function) that has already been registered', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('carousel clicked', function() {
    mockCallback();
  });
  adobeDataLayer.addEventListener('carousel clicked', function() {
    mockCallback();
  });

  // both listeners are registered

  adobeDataLayer.push({
    event: 'carousel clicked',
    eventInfo: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(2);
});

describe('listener with path', () => {
  const mockCallback = jest.fn();
  const listenerOn = [
    'adobeDataLayer:change',
    mockCallback,
    { path: 'component.image' }
  ];
  const carouselData = {
    component: {
      carousel: {
        carousel1: {
          id: '/content/mysite/en/home/jcr:content/root/carousel1',
          items: {}
        }
      }
    }
  };
  const imageData = {
    component: {
      image: {
        src: '/content/image/test.jpg'
      }
    }
  };

  beforeEach(() => {
    mockCallback.mockClear();
  });

  test('on change listener with path for image component data', () => {
    adobeDataLayer.addEventListener.apply(adobeDataLayer, listenerOn);
    adobeDataLayer.push(carouselData);
    expect(mockCallback.mock.calls.length).toBe(0);
    adobeDataLayer.push(imageData);
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('custom listener with path for image component data', () => {
    let listenerOn = [
      'viewed',
      mockCallback,
      { path: 'component.image' }
    ];
    adobeDataLayer.addEventListener.apply(adobeDataLayer, listenerOn);
    adobeDataLayer.push(merge({
      event: 'viewed',

    }, carouselData));
    expect(mockCallback.mock.calls.length).toBe(0);
    adobeDataLayer.push(merge({
      event: 'viewed',
    }, imageData));
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('listener on: adobeDataLayer:change with path', () => {
    adobeDataLayer.addEventListener.apply(adobeDataLayer, listenerOn);
    adobeDataLayer.push(merge({
      event: 'adobeDataLayer:change',
    }, carouselData));
    expect(mockCallback.mock.calls.length).toBe(0);
    adobeDataLayer.push(merge({
      event: 'adobeDataLayer:change',
    }, imageData));
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('listener: custom event, path and scope: all', () => {
    adobeDataLayer.push(merge({
      event: 'adobeDataLayer:change'
    }, carouselData));
    adobeDataLayer.push(merge({
      event: 'adobeDataLayer:change'
    }, imageData));
    adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback, {
      path: 'component',
      scope: 'all'
    });
    adobeDataLayer.push(merge({
      event: 'adobeDataLayer:change',
    }, imageData));
    expect(mockCallback.mock.calls.length).toBe(3);
  });

  test('listener: path: old/new value', () => {
    adobeDataLayer.push({
      event: 'adobeDataLayer:change',
      component: {
        carousel: {
          carousel1: {
            id: 'old',
            items: {}
          }
        }
      }
    });
    adobeDataLayer.addEventListener('adobeDataLayer:change',
      function(event, oldValue, newValue) {
        if (oldValue === 'old') {
          mockCallback();
        }
        if (newValue === 'new') {
          mockCallback();
        }
      }, {
        path: 'component.carousel.carousel1.id',
    });
    adobeDataLayer.push({
      event: 'adobeDataLayer:change',
      component: {
        carousel: {
          carousel1: {
            id: 'new',
            items: {}
          }
        }
      }
    });
    expect(mockCallback.mock.calls.length).toBe(2);
  });

  test('listener: path: old/new state', () => {
    const oldData = {
      component: {
        carousel: {
          carousel1: {
            id: 'old',
            items: {}
          }
        }
      }
    };
    const newData = {
      component: {
        carousel: {
          carousel1: {
            id: 'new',
            items: {}
          }
        }
      }
    };
    adobeDataLayer.push(merge({
      event: 'adobeDataLayer:change'
    }, oldData));
    adobeDataLayer.addEventListener('adobeDataLayer:change',
      function(event, oldState, newState) {
        if (isEqual(oldState, oldData)) {
          mockCallback();
        }
        if (isEqual(newState, newData)) {
          mockCallback();
        }
      }
    );
    adobeDataLayer.push(merge({
      event: 'adobeDataLayer:change',
    }, newData));
    expect(mockCallback.mock.calls.length).toBe(2);
  });

  test('listener: path: calling getState() within a handler should return the state after the event', () => {
    const oldData = {
      component: {
        carousel: {
          carousel1: {
            id: 'old',
            items: {}
          }
        }
      }
    };
    const newData = {
      component: {
        carousel: {
          carousel1: {
            id: 'new',
            items: {}
          }
        }
      }
    };
    adobeDataLayer.push({
      event: 'adobeDataLayer:change',
      oldData
    });
    adobeDataLayer.addEventListener('adobeDataLayer:change',
      function(event, oldState, newState) {
        if (isEqual(this.getState(), newState)) {
          mockCallback();
        }
      }
    );
    adobeDataLayer.push({
      event: 'adobeDataLayer:change',
      newData
    });
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('listener: path: undefined old/new state for past events', () => {
    adobeDataLayer.push({
      event: 'adobeDataLayer:change',
      component: {
        carousel: {
          carousel1: {
            id: '/content/mysite/en/home/jcr:content/root/carousel1',
            items: {}
          }
        }
      }
    });
    adobeDataLayer.addEventListener('adobeDataLayer:change',
      function(event, oldState, newState) {
        if (isEqual(oldState, undefined) && isEqual(newState, undefined)) {
          mockCallback();
        }
      }, {
        scope: 'past'
      }
    );
    expect(mockCallback.mock.calls.length).toBe(1);
  });
});

// -----------------------------------------------------------------------------------------------------------------
// Event listener off
// -----------------------------------------------------------------------------------------------------------------

test('listener off: unregister one handler', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'all' });
  expect(mockCallback.mock.calls.length).toBe(1);
  adobeDataLayer.removeEventListener('carousel clicked', mockCallback);

  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener off: unregister a handler with a static function', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('carousel clicked', function() {
    mockCallback();
  });
  adobeDataLayer.removeEventListener('carousel clicked', function() {
    mockCallback();
  });

  // -> does not unregister the listener

  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener off: unregister multiple handlers', () => {
  const mockCallback1 = jest.fn();
  const mockCallback2 = jest.fn();

  adobeDataLayer.addEventListener('user loaded', mockCallback1);
  adobeDataLayer.addEventListener('user loaded', mockCallback2);
  adobeDataLayer.push({
    event: 'user loaded'
  });

  expect(mockCallback1.mock.calls.length).toBe(1);
  expect(mockCallback2.mock.calls.length).toBe(1);

  adobeDataLayer.removeEventListener('user loaded');
  adobeDataLayer.push({
    event: 'user loaded'
  });

  expect(mockCallback1.mock.calls.length).toBe(1);
  expect(mockCallback2.mock.calls.length).toBe(1);
});

// -----------------------------------------------------------------------------------------------------------------
// Invalid: data, event, listeners
// -----------------------------------------------------------------------------------------------------------------

test.skip('invalid listener on', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('carousel clicked', mockCallback, { invalid: 'invalid' });

  adobeDataLayer.push({
    event: 'carousel clicked',
    eventInfo: {
      reference: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(0);
});

test('invalid listener on scope', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'invalid' });

  adobeDataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(0);
});

test.skip('invalid listener off', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('adobeDataLayer:change', mockCallback);
  adobeDataLayer.push({
    data: {
      page: {
        id: '/content/mysite/en/products/crossfit'
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  adobeDataLayer.removeEventListener('adobeDataLayer:change', mockCallback, { invalid: 'invalid' });
  adobeDataLayer.push({
    data: {
      page: {
        id: '/content/mysite/en/products/running'
      }
    }
  });
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
  new adobeDataLayer.Manager({ dataLayer: dataLayer });
  adobeDataLayer.push({
    data: {
      invalid: {}
    },
    invalid: 'invalid'
  });
  adobeDataLayer.push({
    event: 'clicked',
    data: {
      invalid: {}
    },
    invalid: 'invalid'
  });
  adobeDataLayer.addEventListener('carousel 14 clicked', function(event) {
      //
  });
  adobeDataLayer.push({
    off: 'carousel 14 clicked',
  });
  expect(adobeDataLayer.length).toStrictEqual(0);
});

// -----------------------------------------------------------------------------------------------------------------
// getState()
// -----------------------------------------------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------------------------------------------
// Performance
// -----------------------------------------------------------------------------------------------------------------

// high load benchmark: runs alone in 10.139s with commit: df0fef59c86635d3c29e6f698352491dcf39003c (15/oct/2019)
test.skip('high load', () => {
  const mockCallback = jest.fn();
  adobeDataLayer.addEventListener('carousel clicked', mockCallback);

  const data = {};
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
