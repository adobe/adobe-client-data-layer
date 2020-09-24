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

  window.adobeDataLayer = [];
  var instance = 0;

  adobeDataLayer.push(function(dl) {
      dl.addEventListener(
          "new event", 
          function(event) {
              console.log("callback " + ++instance, dl.getState());
          }
      )
  });

  adobeDataLayer.push({
      event: "new event",
      context: "test"
  });

})();
