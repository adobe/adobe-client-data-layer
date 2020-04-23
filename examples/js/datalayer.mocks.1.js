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

  adobeDataLayer.push({
    on: 'datalayer:ready',
    handler: function(event) {

      // -----------------------------------------------------------------------------------------------------------------
      // Test case 1: add data
      // -----------------------------------------------------------------------------------------------------------------

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

      const id1 = adobeDataLayer.getState().component.carousel.carousel1.id;
      if (id1 !== '/content/mysite/en/home/jcr:content/root/carousel1') {
        console.error('FAILs: test case 1 "add data"');
      } else {
        console.info('SUCCESS: test case 1 "add data"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // Test case 2: remove data
      // -----------------------------------------------------------------------------------------------------------------

      adobeDataLayer.push({
        component: {
          carousel: {
            carousel1: undefined
          }
        }
      });

      if (adobeDataLayer.getState().component.carousel.carousel1) {
        console.error('FAILS: test case 2 "remove data"');
      } else {
        console.info('SUCCESS: test case 2 "remove data"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // Test case 3: add event with data
      // -----------------------------------------------------------------------------------------------------------------

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

      const  id3 = adobeDataLayer.getState().component.carousel.carousel3.id;
      if (id3 !== '/content/mysite/en/home/jcr:content/root/carousel3') {
        console.error('FAILS: test case 3 "add event with data"');
      } else {
        console.info('SUCCESS: test case 3 "add event with data"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 4: listener on: datalayer:change
      // -----------------------------------------------------------------------------------------------------------------

      let success4 = false;

      adobeDataLayer.push({
        on: 'datalayer:change',
        handler: function(event) {
          success4 = true;
        }
      });

      adobeDataLayer.push({
        component: {
          carousel: {
            carousel4: {
              id: '/content/mysite/en/home/jcr:content/root/carousel4',
              items: {}
            }
          }
        }
      });

      if (!success4) {
        console.error('FAILS: test case 4 "listener on: datalayer:change"');
      } else {
        console.info('SUCCESS: test case 4 "listener on: datalayer:change"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 5: listener on: datalayer:event
      // -----------------------------------------------------------------------------------------------------------------

      let success5 = false;

      adobeDataLayer.push({
        on: 'datalayer:event',
        handler: function(event) {
          success5 = true;
        }
      });

      adobeDataLayer.push({
        event: 'datalayer:event',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel5'
        }
      });

      if (!success5) {
        console.error('FAILS: test case 5 "listener on: datalayer:event"');
      } else {
        console.info('SUCCESS: test case 5 "listener on: datalayer:event"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 6: listener on: custom event
      // -----------------------------------------------------------------------------------------------------------------

      let success6 = false;

      adobeDataLayer.push({
        on: 'carousel clicked',
        handler: function(event) {
          success6 = true;
        }
      });

      adobeDataLayer.push({
        event: 'carousel clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel6'
        }
      });

      if (!success6) {
        console.error('FAILS: test case 6 "listener on: custom event"');
      } else {
        console.info('SUCCESS: test case 6 "listener on: custom event"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 7: listener on: scope = past
      // -----------------------------------------------------------------------------------------------------------------

      let success7a = false;

      adobeDataLayer.push({
        event: 'carousel 7a clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel7a'
        }
      });

      adobeDataLayer.push({
        on: 'carousel 7a clicked',
        scope: 'past',
        handler: function(event) {
          success7a = true;
        }
      });

      if (!success7a) {
        console.error('FAILS: test case 7a "listener on: scope = past"');
      } else {
        console.info('SUCCESS: test case 7a "listener on: scope = past"');
      }

      let  success7b = true;

      adobeDataLayer.push({
        on: 'carousel 7b clicked',
        scope: 'past',
        handler: function(event) {
          success7b = false;
        }
      });

      adobeDataLayer.push({
        event: 'carousel 7b clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel7b'
        }
      });

      if (!success7b) {
        console.error('FAILS: test case 7b "listener on: scope = past"');
      } else {
        console.info('SUCCESS: test case 7b "listener on: scope = past"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 8: listener on: scope = future
      // -----------------------------------------------------------------------------------------------------------------

      let  success8a = true;

      adobeDataLayer.push({
        event: 'carousel 8a clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel8a'
        }
      });

      adobeDataLayer.push({
        on: 'carousel 8a clicked',
        scope: 'future',
        handler: function(event) {
          success8a = false;
        }
      });

      if (!success8a) {
        console.error('FAILS: test case 8a "listener on: scope = future"');
      } else {
        console.info('SUCCESS: test case 8a "listener on: scope = future"');
      }

      let  success8b = false;

      adobeDataLayer.push({
        on: 'carousel 8b clicked',
        scope: 'future',
        handler: function(event) {
          success8b = true;
        }
      });

      adobeDataLayer.push({
        event: 'carousel 8b clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel8b'
        }
      });

      if (!success8b) {
        console.error('FAILS: test case 8b "listener on: scope = future"');
      } else {
        console.info('SUCCESS: test case 8b "listener on: scope = future"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 9: listener on: scope = all
      // -----------------------------------------------------------------------------------------------------------------

      let  success9a = false;

      adobeDataLayer.push({
        event: 'carousel 9a clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel9a'
        }
      });

      adobeDataLayer.push({
        on: 'carousel 9a clicked',
        scope: 'all',
        handler: function(event) {
          success9a = true;
        }
      });

      if (!success9a) {
        console.error('FAILS: test case 9a "listener on: scope = all"');
      } else {
        console.info('SUCCESS: test case 9a "listener on: scope = all"');
      }

      let  success9b = false;

      adobeDataLayer.push({
        on: 'carousel 9b clicked',
        scope: 'all',
        handler: function(event) {
          success9b = true;
        }
      });

      adobeDataLayer.push({
        event: 'carousel 9b clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel9b'
        }
      });

      if (!success9b) {
        console.error('FAILS: test case 9b "listener on: scope = all"');
      } else {
        console.info('SUCCESS: test case 9b "listener on: scope = all"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 10: listener on: scope = undefined (default to 'future')
      // -----------------------------------------------------------------------------------------------------------------

      let  success10a = true;

      adobeDataLayer.push({
        event: 'carousel 10a clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel10a'
        }
      });

      adobeDataLayer.push({
        on: 'carousel 10a clicked',
        handler: function(event) {
          success10a = false;
        }
      });

      if (!success10a) {
        console.error('FAILS: test case 10a "listener on: scope = undefined"');
      } else {
        console.info('SUCCESS: test case 10a "listener on: scope = undefined"');
      }

      let  success10b = false;

      adobeDataLayer.push({
        on: 'carousel 10b clicked',
        handler: function(event) {
          success10b = true;
        }
      });

      adobeDataLayer.push({
        event: 'carousel 10b clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel10b'
        }
      });

      if (!success10b) {
        console.error('FAILS: test case 10b "listener on: scope = undefined"');
      } else {
        console.info('SUCCESS: test case 10b "listener on: scope = undefined"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 11: listener off
      // -----------------------------------------------------------------------------------------------------------------

      let  success11 = true;

      adobeDataLayer.push({
        on: 'carousel 11a clicked',
        handler: function(event) {
          success11 = false;
        }
      });

      adobeDataLayer.push({
        event: 'carousel 11a clicked',
        eventInfo: {
          id: '/content/mysite/en/home/jcr:content/root/carousel11a'
        }
      });

      // success11 should be: false: we force it to true:
      success11 = true;

      adobeDataLayer.push({
        off: 'carousel 11a clicked'
      });

      adobeDataLayer.push({
        event: 'carousel 11a clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel11a'
        }
      });

      if (!success11) {
        console.error('FAILS: test case 11 "listener off"');
      } else {
        console.log('SUCCESS: test case 11 "listener off"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 12: type validation: data
      // -----------------------------------------------------------------------------------------------------------------

      adobeDataLayer.push({
        valid: {
          data: true
        }
      });

      if (!adobeDataLayer.getState().valid.data) {
        console.error('FAILS: test case 12 "type validation: data"');
      } else {
        console.info('SUCCESS: test case 12 "type validation: data"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 13: type validation: event
      // -----------------------------------------------------------------------------------------------------------------

      adobeDataLayer.push({
        event: 'clicked',
        data: {
          valid: true
        }
      });

      if (!adobeDataLayer.getState().data.valid) {
        console.error('FAILS: test case 13 "type validation: event"');
      } else {
        console.info('SUCCESS: test case 13 "type validation: event"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 14: type validation: listener on
      // -----------------------------------------------------------------------------------------------------------------

      let  success14 = false;

      adobeDataLayer.push({
        on: 'carousel 14 clicked',
        handler: function(event) {
          success14 = true;
        }
      });

      adobeDataLayer.push({
        event: 'carousel 14 clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel14'
        }
      });

      if (!success14) {
        console.error('FAILS: test case 14 "validation: listener on"');
      } else {
        console.info('SUCCESS: test case 14 "validation: listener on"');
      }


      // -----------------------------------------------------------------------------------------------------------------
      // test case 15: type validation: listener off
      // -----------------------------------------------------------------------------------------------------------------

      let  success15 = false;

      adobeDataLayer.push({
        on: 'carousel 15 clicked',
        handler: function(event) {
          success15 = true;
        }
      });

      adobeDataLayer.push({
        event: 'carousel 15 clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel15'
        }
      });

      // success15 should be: true: we force it to false:
      success15 = false;

      adobeDataLayer.push({
        off: 'carousel 15 clicked',
        handler: function(event) {
          success15 = true;
        },
        invalid: 'invalid'
      });

      adobeDataLayer.push({
        event: 'carousel 15 clicked',
        eventInfo: {
          reference: '/content/mysite/en/home/jcr:content/root/carousel15'
        }
      });

      if (!success15) {
        console.error('FAILS: test case 15 "type validation: listener off"');
      } else {
        console.info('SUCCESS: test case 15 "type validation: listener off"');
      }

    }
  });

})();
