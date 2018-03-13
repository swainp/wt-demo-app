module.exports = {
  "extends" : [
    "standard",
    "plugin:promise/recommended",
    "plugin:react/recommended"
  ],
  "plugins": [
    "promise"
  ],
  "env": {
    "browser" : true,
    "node"    : true,
    "mocha"   : true,
    "jest"    : true
  },
  "globals" : {
    "artifacts": false,
    "contract": false,
    "assert": false,
    "web3": false,
    'WEB3_PROVIDER': true,
    'LIFTOKEN_ADDRESS': true,
    'WT_INDEXES': true,
    'GAS_MARGIN': true,
    'MAPS_API_KEY': true
  },
  "rules": {

    // Strict mode
    "strict": [2, "global"],

    // Code style
    "indent": [2, 2],
    "quotes": [2, "single"],
    "semi": ["error", "always"],
    "space-before-function-paren": ["error", "always"],
    "no-use-before-define": 0,
    "eqeqeq": [2, "smart"],
    "dot-notation": [2, {"allowKeywords": true, "allowPattern": ""}],
    "no-redeclare": [2, {"builtinGlobals": true}],
    "no-trailing-spaces": [2, { "skipBlankLines": true }],
    "eol-last": 1,
    "comma-spacing": [2, {"before": false, "after": true}],
    "camelcase": [2, {"properties": "always"}],
    "no-mixed-spaces-and-tabs": [2, "smart-tabs"],
    "comma-dangle": [1, "always-multiline"],
    "no-dupe-args": 2,
    "no-dupe-keys": 2,
    "no-debugger": 0,
    "no-undef": 2,
    "one-var": [0],
    "object-curly-spacing": [2, "always"],
    "generator-star-spacing": ["error", "before"],
    "promise/avoid-new": 0,
    "promise/always-return": 0,
    "react/no-unescaped-entities": 0,
    "react/prop-types": 0
  },
  "settings": {
    "react": {
      "createClass": "createReactClass", // Regex for Component Factory to use,
                                         // default to "createReactClass"
      "pragma": "React",  // Pragma to use, default to "React"
      "version": "15.0", // React version, default to the latest React stable release
      "flowVersion": "0.53" // Flow version
    },
    "propWrapperFunctions": [ "forbidExtraProps" ] // The names of any functions used to wrap the
                                                   // propTypes object, e.g. `forbidExtraProps`.
                                                   // If this isn't set, any propTypes wrapped in
                                                   // a function will be skipped.
  }
};
