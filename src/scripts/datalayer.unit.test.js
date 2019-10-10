const DataLayer = require('./datalayer');


test('Deep merge of target and source object', () => {
    let target = {
        a: {
            ab: 12
        }
    };
    DataLayer.utils.deepMerge(target, {a: {ab: undefined, ac: 13, ad: {ada: 141}}, b: 2});
    expect(target).toMatchObject({a: {ac: 13, ad: {ada: 141}}, b: 2});
});