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
module.exports = {
  "extends": ["standard", "plugin:compat/recommended"],
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jest": true
  },
  "rules": {
    "complexity": ["warn", 15],
    "no-new": "off",
    "semi": ["error", "always"],
    "space-before-function-paren": ["error", "never"],
    "valid-jsdoc": [ "warn", {
      "prefer": {
        "arg": "param",
        "argument": "param",
        "return": "returns"
      },
      "preferType": {
        "boolean": "Boolean",
        "number": "Number",
        "object": "Object",
        "string": "String"
      },
      "matchDescription": ".+",
      "requireReturn": false,
      "requireReturnType": true,
      "requireParamDescription": true,
      "requireReturnDescription": true
    }]
  }
};
