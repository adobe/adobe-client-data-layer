const DataLayer = require('./datalayer');
let dataLayer;

beforeEach(() => {
    dataLayer = [];
    new DataLayer.Manager({dataLayer: dataLayer});
});

test('simple state check after pushing data', () => {
    const data = {
        'page': {
            'id': '/content/mysite/en/products/crossfit',
            'siteLanguage': 'en-us',
            'siteCountry': 'US',
            'pageType': 'product detail',
            'pageName': 'pdp - crossfit zoom',
            'pageCategory': 'womens > shoes > athletic'
        }
    };
    dataLayer.push({data: data});
    expect(dataLayer.getState()).toMatchObject(data);
});

test('check dataLayer change event was executed', () => {
    const mockCallback = jest.fn();
    const argOn = {
        'on': 'datalayer:change',
        'handler': mockCallback
    };
    dataLayer.push(argOn);
    dataLayer.push({
        data: {
            'page': {
                'id': '/content/mysite/en/products/crossfit'
            }
        }
    });
    expect(mockCallback.mock.calls.length).toBe(1);
    const argOff = {
        'off': 'datalayer:change'
    };
    dataLayer.push(argOff)
    dataLayer.push({
        data: {
            'page': {
                'id': '/content/mysite/en/products/running'
            }
        }
    });
    expect(mockCallback.mock.calls.length).toBe(1);
});




/**
 * Tests for DataLayer.utils functions
 */
test('deep merge of target and source object', () => {
    let target = {
        a: {
            ab: 12
        }
    };
    DataLayer.utils.deepMerge(target, {a: {ab: undefined, ac: 13, ad: {ada: 141}}, b: 2});
    expect(target).toMatchObject({a: {ac: 13, ad: {ada: 141}}, b: 2});
});

test('argument to be an object', () => {
    expect(DataLayer.utils.isObject({foo: "bar"})).toBe(true);
    expect(DataLayer.utils.isObject(["foo", "bar"])).toBe(false);
});