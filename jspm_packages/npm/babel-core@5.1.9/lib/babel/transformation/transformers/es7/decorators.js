/* */ 
"format global";
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

exports.check = check;
exports.ObjectExpression = ObjectExpression;
exports.__esModule = true;

var defineMap = _interopRequireWildcard(require("../../helpers/define-map"));

var t = _interopRequireWildcard(require("../../../types"));

var metadata = {
  optional: true,
  stage: 1
};

exports.metadata = metadata;

function check(node) {
  return !!node.decorators;
}

function ObjectExpression(node, parent, scope, file) {
  var hasDecorators = false;
  for (var i = 0; i < node.properties.length; i++) {
    var prop = node.properties[i];
    if (prop.decorators) {
      hasDecorators = true;
      break;
    }
  }
  if (!hasDecorators) return;

  var mutatorMap = {};

  for (var i = 0; i < node.properties.length; i++) {
    defineMap.push(mutatorMap, node.properties[i], null, file);
  }

  var obj = defineMap.toClassObject(mutatorMap);
  obj = defineMap.toComputedObjectFromClass(obj);
  return t.callExpression(file.addHelper("create-decorated-object"), [obj]);
}