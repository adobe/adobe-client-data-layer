"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),e}!function a(o,s,f){function c(t,e){if(!s[t]){if(!o[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(g)return g(t,!0);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}var i=s[t]={exports:{}};o[t][0].call(i.exports,function(e){return c(o[t][1][e]||e)},i,i.exports,a,o,s,f)}return s[t].exports}for(var g="function"==typeof require&&require,e=0;e<f.length;e++)c(f[e]);return c}({1:[function(e,t,n){var o={};o.Item=e("./DataLayerItem"),o.utils=e("./DataLayerUtils");var s="datalayer:change",f="datalayer:event",r="datalayer:ready",i="past",a="future",c="all";o.Manager=function(e){this._config=e,this._initialize()},o.Manager.prototype._initialize=function(){var e=this;Array.isArray(e._config.dataLayer)||(e._config.dataLayer=[]),e._dataLayer=e._config.dataLayer,e._state={},e._listeners=[],e._augment(),e._processItems();var t=new o.Item({event:r});e._triggerListeners(t)},o.Manager.prototype._augment=function(){var a=this;a._dataLayer.push=function(e){var r=arguments,i=arguments;if(Object.keys(r).forEach(function(e){var t=r[e],n=new o.Item(t);a._processItem(n),!o.utils.isListenerConfig(t)&&n.valid||delete i[e]}),i[0])return Array.prototype.push.apply(this,i)},a._dataLayer.getState=function(){return JSON.parse(JSON.stringify(a._state))}},o.Manager.prototype._processItems=function(){for(var e=this,t=0;t<e._dataLayer.length;t++){var n=new o.Item(e._dataLayer[t],t);e._processItem(n),!o.utils.isListenerConfig(n.config)&&n.valid||(e._dataLayer.splice(t,1),t--)}},o.Manager.prototype._processItem=function(e){var t=this;if(e.valid){({data:function(e){t._updateState(e),t._triggerListeners(e)},event:function(e){e.config.data&&t._updateState(e),t._triggerListeners(e)},listenerOn:function(e){t._processListenerOn(e)},listenerOff:function(e){t._unregisterListener(e)}})[e.type](e)}else{var n="The following item cannot be handled by the data layer because it does not have a valid format: "+JSON.stringify(e.config);console.error(n)}},o.Manager.prototype._processListenerOn=function(e){var t=e.config.scope;switch(t=t||a){case i:this._triggerListenerOnPreviousItems(e);break;case a:this._registerListener(e);break;case c:this._triggerListenerOnPreviousItems(e),this._registerListener(e);break;default:console.error("The listener does not have a valid scope: "+t)}},o.Manager.prototype._triggerListeners=function(n){var r=this;r._listeners.forEach(function(e){var t=new o.Item(e);r._triggerListener(t,n)})},o.Manager.prototype._triggerListenerOnPreviousItems=function(e){var t=e.index;if(!(0===t||0===this._dataLayer.length||t>this._dataLayer.length-1))for(var n=t&&-1!==t?t:this._dataLayer.length,r=0;r<n;r++){var i=this._dataLayer[r],a=new o.Item(i,r);this._triggerListener(e,a)}},o.Manager.prototype._triggerListener=function(e,t){var n=e.config,r=t.config,i=!1;if(o.utils.isDataConfig(r)?n.on===s&&(i=!0):o.utils.isEventConfig(r)&&(n.on!==f&&n.on!==r.event||(i=!0),r.data&&n.on===s&&(i=!0)),i){var a=JSON.parse(JSON.stringify(t.config));n.handler(a)}},o.Manager.prototype._registerListener=function(e){var t=e.config;0===this._getRegisteredListeners(t).length&&(this._listeners.push(t),console.debug("listener registered on -",t.on))},o.Manager.prototype._unregisterListener=function(e){var t=e.config,n=JSON.parse(JSON.stringify(t));n.on=t.off,n.handler=t.handler,delete n.off;for(var r=this._getRegisteredListeners(n),i=0;i<r.length;i++)-1<r[i]&&(this._listeners.splice(r[i],1),console.debug("listener unregistered on -",n.on))},o.Manager.prototype._updateState=function(e){o.utils.deepMerge(this._state,e.config.data)},o.Manager.prototype._getRegisteredListeners=function(e){for(var t=[],n=0;n<this._listeners.length;n++){var r=this._listeners[n];if(e.on===r.on){if(e.handler&&e.handler.toString()!==r.handler.toString())continue;t.push(n)}}return t},new o.Manager({dataLayer:window.dataLayer}),t.exports=o},{"./DataLayerItem":2,"./DataLayerUtils":3}],2:[function(e,t,n){var o=e("./DataLayerUtils"),s="data",f="event",c="listenerOn",g="listenerOff",r=function(){function a(e,t){_classCallCheck(this,a);var n,r,i=this;i._config=e,i._type=(n=e,o.isDataConfig(n)?r=s:o.isEventConfig(n)?r=f:o.isListenerOnConfig(n)?r=c:o.isListenerOffConfig(n)&&(r=g),r),i._index=t,i._valid=!!i._type}return _createClass(a,[{key:"config",get:function(){return this._config}},{key:"type",get:function(){return this._type}},{key:"valid",get:function(){return this._valid}},{key:"index",get:function(){return this._index}}]),a}();t.exports=r},{"./DataLayerUtils":3}],3:[function(e,t,n){var r={deepMerge:function(t,n){var r={},i=this;i.isObject(t)&&i.isObject(n)&&Object.keys(n).forEach(function(e){i.isObject(n[e])?(t[e]||(r[e]={},Object.assign(t,r)),i.deepMerge(t[e],n[e])):void 0===n[e]?delete t[e]:(r[e]=n[e],Object.assign(t,r))})},isObject:function(e){return e&&"object"===_typeof(e)&&!Array.isArray(e)},isDataConfig:function(e){return!!e&&(1===Object.keys(e).length&&e.data)},isEventConfig:function(e){if(!e)return!1;var t=Object.keys(e);return 1===t.length&&e.event||2===t.length&&e.event&&(e.info||e.data)||3===t.length&&e.event&&e.info&&e.data},isListenerConfig:function(e){return this.isListenerOnConfig(e)||this.isListenerOffConfig(e)},isListenerOnConfig:function(e){if(!e)return!1;var t=Object.keys(e);return 2===t.length&&e.on&&e.handler||3===t.length&&e.on&&e.handler&&(e.scope||e.selector)||4===t.length&&e.on&&e.handler&&e.scope&&e.selector},isListenerOffConfig:function(e){if(!e)return!1;var t=Object.keys(e);return 1===t.length&&e.off||2===t.length&&e.off&&e.handler||3===t.length&&e.off&&e.handler&&(e.scope||e.selector)||4===t.length&&e.off&&e.handler&&e.scope&&e.selector}};t.exports=r},{}]},{},[1]);
//# sourceMappingURL=datalayer.js.map
