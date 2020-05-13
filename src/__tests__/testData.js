/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const _ = require('../../custom-lodash.js');
const merge = _.merge;

const carousel1 = {
  component: {
    carousel: {
      carousel1: {
        id: '/content/mysite/en/home/jcr:content/root/carousel1',
        shownItems: [
          'item1', 'item2', 'item3', 'item4', 'item5'
        ],
        items: {}
      }
    }
  }
};

const image1 = {
  component: {
    image: {
      image1: {
        src: '/content/image/test.jpg'
      }
    }
  }
};

const testData = {

  // Pages

  page1: {
    page: {
      id: '/content/mysite/en/products/crossfit',
      siteLanguage: 'en-us',
      siteCountry: 'US',
      pageType: 'product detail',
      pageName: 'pdp - crossfit zoom',
      pageCategory: 'womens > shoes > athletic'
    }
  },
  page2: {
    page: {
      id: '/content/mysite/en/products/running',
      siteLanguage: 'en-us',
      siteCountry: 'US',
      pageType: 'product detail',
      pageName: 'pdp - running zoom',
      pageCategory: 'womens > shoes > running'
    }
  },

  componentNull: {
    component: null
  },

  componentUndefined: {
    component: undefined
  },

  // Carousel 1

  carousel1: carousel1,
  carousel1withUndefined: {
    component: {
      carousel: {
        carousel1: undefined
      }
    }
  },
  carousel1withNull: {
    component: {
      carousel: {
        carousel1: null
      }
    }
  },
  carousel1withNullAndUndefinedArrayItems: {
    component: {
      carousel: {
        carousel1: {
          id: '/content/mysite/en/home/jcr:content/root/carousel1',
          shownItems: [
            'item1', null, 'item3', undefined, 'item5'
          ],
          items: {}
        }
      }
    }
  },
  carousel1withRemovedArrayItems: {
    component: {
      carousel: {
        carousel1: {
          id: '/content/mysite/en/home/jcr:content/root/carousel1',
          shownItems: [
            'item1', 'item3', 'item5'
          ],
          items: {}
        }
      }
    }
  },
  carousel1empty: {
    component: {
      carousel: {
      }
    }
  },
  carousel1new: merge({}, carousel1, {
    component: {
      carousel: {
        carousel1: {
          id: '/content/mysite/en/home/jcr:content/root/carousel1-new'
        }
      }
    }
  }),
  carousel1click: merge({}, carousel1, {
    event: 'carousel clicked'
  }),
  carousel1change: merge({}, carousel1, {
    event: 'adobeDataLayer:change'
  }),
  carousel1viewed: merge({}, carousel1, {
    event: 'viewed'
  }),
  carousel1oldId: merge({}, carousel1, {
    component: {
      carousel: {
        carousel1: {
          id: 'old'
        }
      }
    }
  }),
  carousel1newId: merge({}, carousel1, {
    component: {
      carousel: {
        carousel1: {
          id: 'new'
        }
      }
    }
  }),

  // Carousel 2

  carousel2: {
    component: {
      carousel: {
        carousel2: {
          id: '/content/mysite/en/home/jcr:content/root/carousel2',
          items: {}
        }
      }
    }
  },
  carousel2withUndefined: {
    component: {
      carousel: {
        carousel2: undefined
      }
    }
  },
  carousel2empty: {
    component: {
      carousel: {
      }
    }
  },

  // Image 1

  image1: image1,
  image1change: merge({}, image1, {
    event: 'adobeDataLayer:change'
  }),
  image1viewed: merge({}, image1, {
    event: 'viewed'
  })
};

module.exports = testData;
