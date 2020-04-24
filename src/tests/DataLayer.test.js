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
let dataLayer;

beforeEach(() => {
  dataLayer = [];
  new DataLayer.Manager({ dataLayer: dataLayer });
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
  dataLayer.push({ data: data });
  expect(dataLayer.getState()).toStrictEqual(data);
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
  dataLayer.push({ data: data });
  expect(dataLayer.getState()).toStrictEqual(data);
  dataLayer.push({
    data: {
      component: {
        carousel: {
          carousel1: undefined
        }
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
  expect(dataLayer.getState()).toStrictEqual(updatedData);
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
  dataLayer.push({
    event: 'carousel clicked',
    data: data
  });
  expect(dataLayer.getState()).toStrictEqual(data);
});

// -----------------------------------------------------------------------------------------------------------------
// Event listener on
// -----------------------------------------------------------------------------------------------------------------

test('check dataLayer change event was executed', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('datalayer:change', mockCallback);
  dataLayer.push({
    data: {
      page: {
        id: '/content/mysite/en/products/crossfit'
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  dataLayer.removeEventListener('datalayer:change');
  dataLayer.push({
    data: {
      page: {
        id: '/content/mysite/en/products/running'
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: datalayer:event', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('datalayer:event', mockCallback);
  dataLayer.push({
    event: 'clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  dataLayer.removeEventListener('datalayer:event');
  dataLayer.push({
    event: 'datalayer:event',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: datalayer:change', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('datalayer:change', mockCallback);
  dataLayer.push({
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
  dataLayer.removeEventListener('datalayer:change');
  dataLayer.push({
    event: 'datalayer:change',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: custom event', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('carousel clicked', mockCallback);
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  dataLayer.removeEventListener('carousel clicked');
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: scope = past', () => {
  const mockCallback = jest.fn();
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  dataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'past'});
  expect(mockCallback.mock.calls.length).toBe(1);

  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: scope = future', () => {
  const mockCallback = jest.fn();
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  dataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'future'});
  expect(mockCallback.mock.calls.length).toBe(0);
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: scope = all', () => {
  const mockCallback = jest.fn();
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  dataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'all'});
  expect(mockCallback.mock.calls.length).toBe(1);
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(2);
});

test('listener on: scope = undefined (default to future)', () => {
  const mockCallback = jest.fn();
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  dataLayer.addEventListener('carousel clicked', mockCallback);
  expect(mockCallback.mock.calls.length).toBe(0);
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: register a handler that has already been registered', () => {
  const mockCallback = jest.fn();
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  dataLayer.addEventListener('carousel clicked', mockCallback);
  dataLayer.addEventListener('carousel clicked', mockCallback);

  // -> only one listener is registered

  expect(mockCallback.mock.calls.length).toBe(0);

  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener on: register a handler (with a static function) that has already been registered', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('carousel clicked', function() {
    mockCallback();
  });
  dataLayer.addEventListener('carousel clicked', function() {
    mockCallback();
  });

  // both listeners are registered

  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(2);
});

describe('listener with path', () => {
  const mockCallback = jest.fn();
  const listenerOn = [
    'datalayer:change',
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
    dataLayer.addEventListener.apply(dataLayer, listenerOn);
    dataLayer.push({ data: carouselData });
    expect(mockCallback.mock.calls.length).toBe(0);
    dataLayer.push({ data: imageData });
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('custom listener with path for image component data', () => {
    let listenerOn = [
      'viewed',
      mockCallback,
      { path: 'component.image' }
    ];
    dataLayer.addEventListener.apply(dataLayer, listenerOn);
    dataLayer.push({
      event: 'viewed',
      data: carouselData
    });
    expect(mockCallback.mock.calls.length).toBe(0);
    dataLayer.push({
      event: 'viewed',
      data: imageData
    });
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('listener on: datalayer:change with path', () => {
    dataLayer.addEventListener.apply(dataLayer, listenerOn);
    dataLayer.push({
      event: 'datalayer:change',
      data: carouselData
    });
    expect(mockCallback.mock.calls.length).toBe(0);
    dataLayer.push({
      event: 'datalayer:change',
      data: imageData
    });
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('listener: custom event, path and scope: all', () => {
    dataLayer.push({
      event: 'datalayer:change',
      data: carouselData
    });
    dataLayer.push({
      event: 'datalayer:change',
      data: imageData
    });
    dataLayer.addEventListener('datalayer:change', mockCallback, {
      path: 'component',
      scope: 'all'
    });
    dataLayer.push({
      event: 'datalayer:change',
      data: imageData
    });
    expect(mockCallback.mock.calls.length).toBe(3);
  });

  test('listener: path: old/new value', () => {
    dataLayer.push({
      event: 'datalayer:change',
      data: {
        component: {
          carousel: {
            carousel1: {
              id: 'old',
              items: {}
            }
          }
        }
      }
    });
    dataLayer.addEventListener('datalayer:change',
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
    dataLayer.push({
      event: 'datalayer:change',
      data: {
        component: {
          carousel: {
            carousel1: {
              id: 'new',
              items: {}
            }
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
    dataLayer.push({
      event: 'datalayer:change',
      data: oldData
    });
    dataLayer.addEventListener('datalayer:change',
      function(event, oldState, newState) {
        if (isEqual(oldState, oldData)) {
          mockCallback();
        }
        if (isEqual(newState, newData)) {
          mockCallback();
        }
      }
    );
    dataLayer.push({
      event: 'datalayer:change',
      data: newData
    });
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
    dataLayer.push({
      event: 'datalayer:change',
      data: oldData
    });
    dataLayer.addEventListener('datalayer:change',
      function(event, oldState, newState) {
        if (isEqual(this.getState(), newState)) {
          mockCallback();
        }
      }
    );
    dataLayer.push({
      event: 'datalayer:change',
      data: newData
    });
    expect(mockCallback.mock.calls.length).toBe(1);
  });

  test('listener: path: undefined old/new state for past events', () => {
    dataLayer.push({
      event: 'datalayer:change',
      data: {
        component: {
          carousel: {
            carousel1: {
              id: '/content/mysite/en/home/jcr:content/root/carousel1',
              items: {}
            }
          }
        }
      }
    });
    dataLayer.addEventListener('datalayer:change',
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
  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  dataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'all' });
  expect(mockCallback.mock.calls.length).toBe(1);
  dataLayer.removeEventListener('carousel clicked', mockCallback);

  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
});

test('listener off: unregister a handler with a static function', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('carousel clicked', function() {
    mockCallback();
  });
  dataLayer.removeEventListener('carousel clicked', function() {
    mockCallback();
  });

  // -> does not unregister the listener

  dataLayer.push({
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

  dataLayer.addEventListener('user loaded', mockCallback1);
  dataLayer.addEventListener('user loaded', mockCallback2);
  dataLayer.push({
    event: 'user loaded'
  });

  expect(mockCallback1.mock.calls.length).toBe(1);
  expect(mockCallback2.mock.calls.length).toBe(1);

  dataLayer.removeEventListener('user loaded');
  dataLayer.push({
    event: 'user loaded'
  });

  expect(mockCallback1.mock.calls.length).toBe(1);
  expect(mockCallback2.mock.calls.length).toBe(1);
});

// -----------------------------------------------------------------------------------------------------------------
// Invalid: data, event, listeners
// -----------------------------------------------------------------------------------------------------------------

test('invalid data', () => {
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
  dataLayer.push({
    data: data,
    invalid: 'invalid'
  });
  expect(dataLayer.getState()).toStrictEqual({});
});

test('invalid event', () => {
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
  dataLayer.push({
    event: 'clicked',
    data: data,
    invalid: 'invalid'
  });
  expect(dataLayer.getState()).toStrictEqual({});
});

test('invalid listener on', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('carousel clicked', mockCallback, { invalid: 'invalid' });

  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(0);
});

test('invalid listener on scope', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('carousel clicked', mockCallback, { scope: 'invalid' });

  dataLayer.push({
    event: 'carousel clicked',
    info: {
      id: '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });
  expect(mockCallback.mock.calls.length).toBe(0);
});

test('invalid listener off', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('datalayer:change', mockCallback);
  dataLayer.push({
    data: {
      page: {
        id: '/content/mysite/en/products/crossfit'
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(1);
  dataLayer.removeEventListener('datalayer:change', mockCallback, { invalid: 'invalid' });
  dataLayer.push({
    data: {
      page: {
        id: '/content/mysite/en/products/running'
      }
    }
  });
  expect(mockCallback.mock.calls.length).toBe(2);
});

test('invalid item is filtered out from array', () => {
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
  new DataLayer.Manager({ dataLayer: dataLayer });
  dataLayer.push({
    data: {
      invalid: {}
    },
    invalid: 'invalid'
  });
  dataLayer.push({
    event: 'clicked',
    data: {
      invalid: {}
    },
    invalid: 'invalid'
  });
  dataLayer.addEventListener('carousel 14 clicked', function(event) {
      //
  });
  dataLayer.push({
    off: 'carousel 14 clicked',
  });
  expect(dataLayer.length).toStrictEqual(0);
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
  dataLayer.push({ data: data });
  expect(dataLayer.getState()).toStrictEqual(data);
  expect(dataLayer.getState("component.carousel.carousel1")).toStrictEqual(carousel1);
  expect(dataLayer.getState("undefined-path")).toStrictEqual(undefined);
});

// -----------------------------------------------------------------------------------------------------------------
// Performance
// -----------------------------------------------------------------------------------------------------------------

// high load benchmark: runs alone in 10.139s with commit: df0fef59c86635d3c29e6f698352491dcf39003c (15/oct/2019)
test.skip('high load', () => {
  const mockCallback = jest.fn();
  dataLayer.addEventListener('carousel clicked', mockCallback);

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

    dataLayer.push({
      event: 'carousel clicked',
      data: data
    });
    expect(dataLayer.getState()).toStrictEqual(data);
    expect(mockCallback.mock.calls.length).toBe(i + 1);
  }

});
