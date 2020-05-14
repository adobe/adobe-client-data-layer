// -----------------------------------------------------------------------------------------------------------------
// Pushing data
// -----------------------------------------------------------------------------------------------------------------

window.adobeDataLayer = window.adobeDataLayer || [];

window.adobeDataLayer.getState();

window.adobeDataLayer.push({
  component: {
    carousel: {
      carousel1: {
        id: '/content/mysite/en/home/jcr:content/root/carousel1',
        shownItems: [
          'item1', 'item2'
        ]
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
});

// remove item

window.adobeDataLayer.push({
  component: {
    carousel: {
      carousel3: null
    }
  }
});

console.log('Pushing component: ', window.adobeDataLayer.getState().component.carousel);

// getState() returns a copy of the state

window.adobeDataLayer.getState().component.carousel.carousel2.id = 'new id';

window.adobeDataLayer.getState('component.carousel.carousel2');

// update an object

window.adobeDataLayer.push({
  component: {
    carousel: {
      carousel1: {
        shownItems: [
          'item1', 'item2-new'
        ]
      }
    }
  }
});

window.adobeDataLayer.getState('component.carousel.carousel1');

// -----------------------------------------------------------------------------------------------------------------
// Pushing a function
// -----------------------------------------------------------------------------------------------------------------

window.adobeDataLayer.push(function(dl) {
  console.log('Pushing a function:');
  console.log(dl.getState());
});

// -----------------------------------------------------------------------------------------------------------------
// Pushing an event
// -----------------------------------------------------------------------------------------------------------------

window.adobeDataLayer.push({
  event: 'clicked',
  eventInfo: {
    reference: 'component.carousel.carousel1'
  },
  component: {
    carousel: {
      carousel1: {
        id: '/content/mysite/en/home/jcr:content/root/carousel1-new'
      }
    }
  }
});

// -----------------------------------------------------------------------------------------------------------------
// Adding an event listener: scope
// -----------------------------------------------------------------------------------------------------------------

const fct1 = function(event) {
  console.log('fct1');
  console.log(event);
};

window.adobeDataLayer.addEventListener('adobeDataLayer:change', fct1);

window.adobeDataLayer.push({
  component: {
    carousel: {
      carousel4: {
        id: '/content/mysite/en/home/jcr:content/root/carousel4',
        items: {}
      }
    }
  }
});

const fct2 = function(event, oldState, newState) {
  console.log('fct2');
  console.log('this', this);
  console.log('event', event);
  console.log('oldState', oldState);
  console.log('newState', newState);
};

window.adobeDataLayer.addEventListener('adobeDataLayer:change', fct2, { scope: 'future' });

window.adobeDataLayer.push({
  component: {
    carousel: {
      carousel5: {
        id: '/content/mysite/en/home/jcr:content/root/carousel5',
        items: {}
      }
    }
  }
});

// -----------------------------------------------------------------------------------------------------------------
// Adding an event listener: path
// -----------------------------------------------------------------------------------------------------------------

const fct3 = function(event, oldValue, newValue) {
  console.log('fct3');
  console.log('this', this);
  console.log('event', event);
  console.log('oldValue', oldValue);
  console.log('newValue', newValue);
};

window.adobeDataLayer.addEventListener('adobeDataLayer:change', fct3, { path: 'component.carousel.carousel5' });

window.adobeDataLayer.push({
  component: {
    carousel: {
      carousel5: {
        id: '/content/mysite/en/home/jcr:content/root/carousel5-new',
        items: {}
      }
    }
  }
});

// -----------------------------------------------------------------------------------------------------------------
// Removing an event listener
// -----------------------------------------------------------------------------------------------------------------

window.adobeDataLayer.removeEventListener('adobeDataLayer:change');

window.adobeDataLayer.push({
  component: {
    carousel: {
      carousel6: {
        id: '/content/mysite/en/home/jcr:content/root/carousel6',
        items: {}
      }
    }
  }
});
