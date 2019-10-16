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
/* global console, window, dataLayer, CustomEvent */
(function() {
  'use strict';

  /* eslint no-console: "off" */
  /* eslint no-unused-vars: "off" */


  // -----------------------------------------------------------------------------------------------------------------
  // Test case 1: add data
  // -----------------------------------------------------------------------------------------------------------------

  dataLayer.push({
    'data': {
      'component': {
        'carousel': {
          'carousel1': {
            'id': '/content/mysite/en/home/jcr:content/root/carousel1',
            'items': {}
          }
        }
      }
    }
  });

  const id1 = dataLayer.getState().component.carousel.carousel1.id;
  if (id1 !== '/content/mysite/en/home/jcr:content/root/carousel1') {
    console.error('test case 1 "add data" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // Test case 2: remove data
  // -----------------------------------------------------------------------------------------------------------------

  dataLayer.push({
    'data': {
      'component': {
        'carousel': {
          'carousel1': undefined
        }
      }
    }
  });

  if (dataLayer.getState().component.carousel.carousel1) {
    console.error('test case 2 "remove data" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // Test case 3: add event with data
  // -----------------------------------------------------------------------------------------------------------------

  dataLayer.push({
    'event': 'carousel clicked',
    'data': {
      'component': {
        'carousel': {
          'carousel3': {
            'id': '/content/mysite/en/home/jcr:content/root/carousel3',
            'items': {}
          }
        }
      }
    }
  });

  const  id3 = dataLayer.getState().component.carousel.carousel3.id;
  if (id3 !== '/content/mysite/en/home/jcr:content/root/carousel3') {
    console.error('test case 3 "add event with data" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 4: listener on: datalayer:change
  // -----------------------------------------------------------------------------------------------------------------

  let success4 = false;

  dataLayer.push({
    'on': 'datalayer:change',
    'handler': function(event) {
      success4 = true;
    }
  });

  dataLayer.push({
    'data': {
      'component': {
        'carousel': {
          'carousel4': {
            'id': '/content/mysite/en/home/jcr:content/root/carousel4',
            'items': {}
          }
        }
      }
    }
  });

  if (!success4) {
    console.error('test case 4 "listener on: datalayer:change" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 5: listener on: datalayer:event
  // -----------------------------------------------------------------------------------------------------------------

  let success5 = false;

  dataLayer.push({
    'on': 'datalayer:event',
    'handler': function(event) {
      success5 = true;
    }
  });

  dataLayer.push({
    'event': 'datalayer:event',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel5'
    }
  });

  if (!success5) {
    console.error('test case 5 "listener on: datalayer:event" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 6: listener on: custom event
  // -----------------------------------------------------------------------------------------------------------------

  let success6 = false;

  dataLayer.push({
    'on': 'carousel clicked',
    'handler': function(event) {
      success6 = true;
    }
  });

  dataLayer.push({
    'event': 'carousel clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel6'
    }
  });

  if (!success6) {
    console.error('test case 6 "listener on: custom event" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 7: listener on: scope = past
  // -----------------------------------------------------------------------------------------------------------------

  let success7a = false;

  dataLayer.push({
    'event': 'carousel 7a clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel7a'
    }
  });

  dataLayer.push({
    'on': 'carousel 7a clicked',
    'scope': 'past',
    'handler': function(event) {
      success7a = true;
    }
  });

  if (!success7a) {
    console.error('test case 7a "listener on: scope = past" failed');
  }

  let  success7b = true;

  dataLayer.push({
    'on': 'carousel 7b clicked',
    'scope': 'past',
    'handler': function(event) {
      success7b = false;
    }
  });

  dataLayer.push({
    'event': 'carousel 7b clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel7b'
    }
  });

  if (!success7b) {
    console.error('test case 7b "listener on: scope = past" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 8: listener on: scope = future
  // -----------------------------------------------------------------------------------------------------------------

  let  success8a = true;

  dataLayer.push({
    'event': 'carousel 8a clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel8a'
    }
  });

  dataLayer.push({
    'on': 'carousel 8a clicked',
    'scope': 'future',
    'handler': function(event) {
      success8a = false;
    }
  });

  if (!success8a) {
    console.error('test case 8a "listener on: scope = future" failed');
  }

  let  success8b = false;

  dataLayer.push({
    'on': 'carousel 8b clicked',
    'scope': 'future',
    'handler': function(event) {
      success8b = true;
    }
  });

  dataLayer.push({
    'event': 'carousel 8b clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel8b'
    }
  });

  if (!success8b) {
    console.error('test case 8b "listener on: scope = future" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 9: listener on: scope = all
  // -----------------------------------------------------------------------------------------------------------------

  let  success9a = false;

  dataLayer.push({
    'event': 'carousel 9a clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel9a'
    }
  });

  dataLayer.push({
    'on': 'carousel 9a clicked',
    'scope': 'all',
    'handler': function(event) {
      success9a = true;
    }
  });

  if (!success9a) {
    console.error('test case 9a "listener on: scope = all" failed');
  }

  let  success9b = false;

  dataLayer.push({
    'on': 'carousel 9b clicked',
    'scope': 'all',
    'handler': function(event) {
      success9b = true;
    }
  });

  dataLayer.push({
    'event': 'carousel 9b clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel9b'
    }
  });

  if (!success9b) {
    console.error('test case 9b "listener on: scope = all" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 10: listener on: scope = undefined (default to 'future')
  // -----------------------------------------------------------------------------------------------------------------

  let  success10a = true;

  dataLayer.push({
    'event': 'carousel 10a clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel10a'
    }
  });

  dataLayer.push({
    'on': 'carousel 10a clicked',
    'handler': function(event) {
      success10a = false;
    }
  });

  if (!success10a) {
    console.error('test case 10a "listener on: scope = undefined" failed');
  }

  let  success10b = false;

  dataLayer.push({
    'on': 'carousel 10b clicked',
    'handler': function(event) {
      success10b = true;
    }
  });

  dataLayer.push({
    'event': 'carousel 10b clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel10b'
    }
  });

  if (!success10b) {
    console.error('test case 10b "listener on: scope = undefined" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 11: listener off
  // -----------------------------------------------------------------------------------------------------------------

  let  success11 = true;

  dataLayer.push({
    'on': 'carousel 11a clicked',
    'handler': function(event) {
      success11 = false;
    }
  });

  dataLayer.push({
    'event': 'carousel 11a clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel11a'
    }
  });

  // success11 should be: false: we force it to true:
  success11 = true;

  dataLayer.push({
    'off': 'carousel 11a clicked',
    'handler': function(event) {
      success11 = false;
    }
  });

  dataLayer.push({
    'event': 'carousel 11a clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel11a'
    }
  });

  if (!success11) {
    console.error('test case 11 "listener off" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 12: type validation: data
  // -----------------------------------------------------------------------------------------------------------------

  dataLayer.push({
    'data': {
      'invalid': {}
    },
    'invalid': 'invalid'
  });

  if (dataLayer.getState().invalid) {
    console.error('test case 12 "type validation: data" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 13: type validation: event
  // -----------------------------------------------------------------------------------------------------------------

  dataLayer.push({
    'event': 'clicked',
    'data': {
      'invalid': {}
    },
    'invalid': 'invalid'
  });

  if (dataLayer.getState().invalid) {
    console.error('test case 13 "type validation: event" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 14: type validation: listener on
  // -----------------------------------------------------------------------------------------------------------------

  let  success14 = true;

  dataLayer.push({
    'on': 'carousel 14 clicked',
    'handler': function(event) {
      success14 = false;
    },
    'invalid': 'invalid'
  });

  dataLayer.push({
    'event': 'carousel 14 clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel14'
    }
  });

  if (!success14) {
    console.error('test case 14 "validation: listener on" failed');
  }


  // -----------------------------------------------------------------------------------------------------------------
  // test case 15: type validation: listener off
  // -----------------------------------------------------------------------------------------------------------------

  let  success15 = false;

  dataLayer.push({
    'on': 'carousel 15 clicked',
    'handler': function(event) {
      success15 = true;
    }
  });

  dataLayer.push({
    'event': 'carousel 15 clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel15'
    }
  });

  // success15 should be: true: we force it to false:
  success15 = false;

  dataLayer.push({
    'off': 'carousel 15 clicked',
    'handler': function(event) {
      success15 = true;
    },
    'invalid': 'invalid'
  });

  dataLayer.push({
    'event': 'carousel 15 clicked',
    'info': {
      'id': '/content/mysite/en/home/jcr:content/root/carousel15'
    }
  });

  if (!success15) {
    console.error('test case 15 "type validation: listener off" failed');
  }




})();
