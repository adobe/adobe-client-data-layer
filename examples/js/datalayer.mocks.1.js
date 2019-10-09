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

  window.dataLayer = window.dataLayer || [];

  // populate data layer
  dataLayer.push({
    'data': {
      'page': {
        'id': '/content/mysite/en/products/crossfit',
        'siteLanguage': 'en-us',
        'siteCountry': 'US',
        'pageType': 'product detail',
        'pageName': 'pdp - crossfit zoom',
        'pageCategory': 'womens > shoes > athletic'
      }
    }
  });

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

  dataLayer.push({
    'event': 'tab viewed',
    'data': {
      'component': {
        'tab': {
          'tab2': {
            'id': '/content/mysite/en/home/jcr:content/root/tab2',
            'items': {}
          }
        }
      }
    },
    'info': {
      'title': 'some thing'
    }
  });

  dataLayer.push({
    'on': 'datalayer:change',
    'handler': function(event) {
      // handle
    }
  });

  dataLayer.push({
    'on': 'datalayer:event',
    'handler': function(event) {
      // handle
    }
  });

  // continue populating data layer on ready
  dataLayer.push({
    'on': 'datalayer:ready',
    'handler': function() {
      dataLayer.push({
        'event': 'page updated',
        'data': {
          'page': {
            'new prop': "I'm new",
            'id': 'NEW/content/mysite/en/products/crossfit',
            'siteLanguage': 'en-us',
            'siteCountry': 'US',
            'pageType': 'product detail',
            'pageName': 'pdp - crossfit zoom',
            'pageCategory': 'womens > shoes > athletic'
          }
        }
      });

      dataLayer.push({
        'event': 'component updated',
        'data': {
          'component': {
            'image': {
              'image4': {
                'id': '/content/mysite/en/home/jcr:content/root/image4',
                'items': {}
              }
            }
          }
        }
      });

      dataLayer.push({
        'event': 'removed',
        'data': {
          'component': {
            'image': {
              'image4': {
                'id': '/content/mysite/en/home/jcr:content/root/image4',
                'items': undefined
              }
            }
          }
        }
      });

      dataLayer.push({
        'on': 'removed',
        'handler': function(event) {
          // handle
        }
      });

      dataLayer.push({
        'off': 'removed',
        'handler': function(event) {
          // handle
        }
      });
    }
  });

})();
