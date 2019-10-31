// -----------------------------------------------------------------------------------------------------------------
// validation
// -----------------------------------------------------------------------------------------------------------------

dataLayer;
dataLayer.getState();

dataLayer.push({
  data: {
    component: {
      carousel: {
        carousel1: {
          id: '/content/mysite/en/home/jcr:content/root/carousel1',
          items: {}
        },
        carousel2: {
          id: '/content/mysite/en/home/jcr:content/root/carousel2',
          items: {}
        },
        carousel3: {
          id: '/content/mysite/en/home/jcr:content/root/carousel3',
          items: {}
        }
      }
    }
  }
});

dataLayer.getState();

// remove item

dataLayer.push({
  data: {
    component: {
      carousel: {
        carousel1: undefined
      }
    }
  }
});

dataLayer.getState().component.carousel;

dataLayer.push({
  invalidKey: 'should be rejected',
  data: {
    component: {
      carousel: {
        carousel0: {
          id: '/content/mysite/en/home/jcr:content/root/carousel0',
          items: {}
        }
      }
    }
  }
});

dataLayer.getState().component.carousel;

// -----------------------------------------------------------------------------------------------------------------
// scope
// -----------------------------------------------------------------------------------------------------------------

dataLayer.push({
  on: 'datalayer:change',
  scope: 'past',
  handler: function(event) {
    console.log('scope = past', event);
  }
});

dataLayer.push({
  data: {
    component: {
      carousel: {
        carousel4: {
          id: '/content/mysite/en/home/jcr:content/root/carousel4',
          items: {}
        }
      }
    }
  }
});

dataLayer.push({
  on: 'datalayer:change',
  scope: 'future',
  handler: function(event, oldState, newState) {
    console.log('scope = future', this, event, oldState, newState);
  }
});

dataLayer.push({
  data: {
    component: {
      carousel: {
        carousel5: {
          id: '/content/mysite/en/home/jcr:content/root/carousel5',
          items: {}
        }
      }
    }
  }
});

// invalid scope

dataLayer.push({
  on: 'datalayer:change',
  scope: 'invalid',
  handler: function(event) {
    console.log('scope = invalid', event);
  }
});

// -----------------------------------------------------------------------------------------------------------------
// selector
// -----------------------------------------------------------------------------------------------------------------

dataLayer.push({
  on: 'datalayer:change',
  selector: 'component.carousel.carousel5',
  handler: function(event, oldValue, newValue) {
    console.log('selector', this, event, oldValue, newValue);
  }
});

dataLayer.push({
  data: {
    component: {
      carousel: {
        carousel5: {
          id: '/content/mysite/en/home/jcr:content/root/carousel5-new',
          items: {}
        }
      }
    }
  }
});

dataLayer.push({
  off: 'datalayer:change'
});

dataLayer.push({
  data: {
    component: {
      carousel: {
        carousel6: {
          id: '/content/mysite/en/home/jcr:content/root/carousel6',
          items: {}
        }
      }
    }
  }
});


