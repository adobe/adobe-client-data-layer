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

  // Test case: scope = future -> console output should be: event3, event4

  window.adobeDataLayer = window.adobeDataLayer || [];



// Example 1. If event listener has path filter then we return before / after value not the whole before / after state

adobeDataLayer.addEventListener("test1", function(event, before, after) {
    console.log('LOG1: ', before, after);
}, { path: 'component.image' });
adobeDataLayer.push({
    event: "test1",
    component: { image: { id: 'image1' } }
});
// LOG1: undefined, { id: "image1' }

// Clear DL before next example
adobeDataLayer.push({ component: null });



// Example 2. If we add event listener and only then push items to DL we get before / after state arguments in callback function.

adobeDataLayer.addEventListener("test2", function(event, before, after) {
    console.log('LOG2: ', before, after);
});
adobeDataLayer.push({
    event: "test2", 
    count: "one"
});
// LOG2: {}, { count: "one" }

// Clear DL before next example
adobeDataLayer.push({ count: null });



// Example 3. If we add event listener then for all past items (items in DL) we will not get before / after arguments in callback function.

adobeDataLayer.push({
    event: "test3", 
    count: "one"
});
adobeDataLayer.addEventListener("test3", function(event, before, after) {
    console.log('LOG3: ', before, after);
});
// LOG3: undefined, undefined

// Clear DL before next example
adobeDataLayer.push({ count: null });



// Example 4. If we have data in DL, then add event listener and then push items to DL we will get before / after state arguments in callback function only for items that are pushed after event listener was added.

adobeDataLayer.push({
    event: "test4", 
    count: "one"
});
adobeDataLayer.addEventListener("test4", function(event, before, after) {
    console.log('LOG4: ', before, after);
});
adobeDataLayer.push({
    event: "test4", 
    count: "two"
});
// LOG4: undefined, undefined
// LOG4: {}, { count: "one" }

// Clear DL before next example
adobeDataLayer.push({ count: null });

})();
