const DataLayer = require('./datalayer');

/**
 * Tests for DataLayer.utils functions
 */
test('Deep merge of target and source object', () => {
    let target = {
        a: {
            ab: 12
        }
    };
    DataLayer.utils.deepMerge(target, {a: {ab: undefined, ac: 13, ad: {ada: 141}}, b: 2});
    expect(target).toMatchObject({a: {ac: 13, ad: {ada: 141}}, b: 2});
});

test('Argument to be an object', () => {
   expect(DataLayer.utils.isObject({foo: "bar"})).toBe(true);
   expect(DataLayer.utils.isObject(["foo", "bar"])).toBe(false);
});