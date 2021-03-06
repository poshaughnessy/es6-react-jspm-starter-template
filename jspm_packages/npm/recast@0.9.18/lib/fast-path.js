/* */ 
var assert = require("assert");
var types = require("./types");
var n = types.namedTypes;
var Node = n.Node;
var isArray = types.builtInTypes.array;
var isNumber = types.builtInTypes.number;
function FastPath(value) {
  assert.ok(this instanceof FastPath);
  this.stack = [value];
}
var FPp = FastPath.prototype;
module.exports = FastPath;
FastPath.from = function(obj) {
  if (obj instanceof FastPath) {
    return obj.copy();
  }
  if (obj instanceof types.NodePath) {
    var copy = Object.create(FastPath.prototype);
    var stack = [obj.value];
    for (var pp; (pp = obj.parentPath); obj = pp)
      stack.push(obj.name, pp.value);
    copy.stack = stack.reverse();
    return copy;
  }
  return new FastPath(obj);
};
FPp.copy = function copy() {
  var copy = Object.create(FastPath.prototype);
  copy.stack = this.stack.slice(0);
  return copy;
};
FPp.getName = function getName() {
  var s = this.stack;
  var len = s.length;
  if (len > 1) {
    return s[len - 2];
  }
  return null;
};
FPp.getValue = function getValue() {
  var s = this.stack;
  return s[s.length - 1];
};
FPp.getNode = function getNode() {
  var s = this.stack;
  for (var i = s.length - 1; i >= 0; i -= 2) {
    var value = s[i];
    if (n.Node.check(value)) {
      return value;
    }
  }
  return null;
};
FPp.getParentNode = function getParentNode() {
  var s = this.stack;
  var count = 0;
  for (var i = s.length - 1; i >= 0; i -= 2) {
    var value = s[i];
    if (n.Node.check(value) && count++ > 0) {
      return value;
    }
  }
  return null;
};
FPp.getRootValue = function getRootValue() {
  var s = this.stack;
  if (s.length % 2 === 0) {
    return s[1];
  }
  return s[0];
};
FPp.call = function call(callback) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;
  for (var i = 1; i < argc; ++i) {
    var name = arguments[i];
    value = value[name];
    s.push(name, value);
  }
  var result = callback(this);
  s.length = origLen;
  return result;
};
FPp.each = function each(callback) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;
  for (var i = 1; i < argc; ++i) {
    var name = arguments[i];
    value = value[name];
    s.push(name, value);
  }
  for (var i = 0; i < value.length; ++i) {
    if (i in value) {
      s.push(i, value[i]);
      callback(this);
      s.length -= 2;
    }
  }
  s.length = origLen;
};
FPp.map = function map(callback) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;
  for (var i = 1; i < argc; ++i) {
    var name = arguments[i];
    value = value[name];
    s.push(name, value);
  }
  var result = new Array(value.length);
  for (var i = 0; i < value.length; ++i) {
    if (i in value) {
      s.push(i, value[i]);
      result[i] = callback(this, i);
      s.length -= 2;
    }
  }
  s.length = origLen;
  return result;
};
FPp.needsParens = function(assumeExpressionContext) {
  var parent = this.getParentNode();
  if (!parent) {
    return false;
  }
  var name = this.getName();
  var node = this.getNode();
  if (!n.Expression.check(node)) {
    return false;
  }
  if (node.type === "Identifier") {
    return false;
  }
  switch (node.type) {
    case "UnaryExpression":
    case "SpreadElement":
    case "SpreadProperty":
      return parent.type === "MemberExpression" && name === "object" && parent.object === node;
    case "BinaryExpression":
    case "LogicalExpression":
      switch (parent.type) {
        case "CallExpression":
          return name === "callee" && parent.callee === node;
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
          return true;
        case "MemberExpression":
          return name === "object" && parent.object === node;
        case "BinaryExpression":
        case "LogicalExpression":
          var po = parent.operator;
          var pp = PRECEDENCE[po];
          var no = node.operator;
          var np = PRECEDENCE[no];
          if (pp > np) {
            return true;
          }
          if (pp === np && name === "right") {
            assert.strictEqual(parent.right, node);
            return true;
          }
        default:
          return false;
      }
    case "SequenceExpression":
      switch (parent.type) {
        case "ForStatement":
          return false;
        case "ExpressionStatement":
          return name !== "expression";
        default:
          return true;
      }
    case "YieldExpression":
      switch (parent.type) {
        case "BinaryExpression":
        case "LogicalExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "CallExpression":
        case "MemberExpression":
        case "NewExpression":
        case "ConditionalExpression":
        case "YieldExpression":
          return true;
        default:
          return false;
      }
    case "Literal":
      return parent.type === "MemberExpression" && isNumber.check(node.value) && name === "object" && parent.object === node;
    case "AssignmentExpression":
    case "ConditionalExpression":
      switch (parent.type) {
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BinaryExpression":
        case "LogicalExpression":
          return true;
        case "CallExpression":
          return name === "callee" && parent.callee === node;
        case "ConditionalExpression":
          return name === "test" && parent.test === node;
        case "MemberExpression":
          return name === "object" && parent.object === node;
        default:
          return false;
      }
    default:
      if (parent.type === "NewExpression" && name === "callee" && parent.callee === node) {
        return containsCallExpression(node);
      }
  }
  if (assumeExpressionContext !== true && !this.canBeFirstInStatement() && this.firstInStatement())
    return true;
  return false;
};
function isBinary(node) {
  return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
}
function isUnaryLike(node) {
  return n.UnaryExpression.check(node) || (n.SpreadElement && n.SpreadElement.check(node)) || (n.SpreadProperty && n.SpreadProperty.check(node));
}
var PRECEDENCE = {};
[["||"], ["&&"], ["|"], ["^"], ["&"], ["==", "===", "!=", "!=="], ["<", ">", "<=", ">=", "in", "instanceof"], [">>", "<<", ">>>"], ["+", "-"], ["*", "/", "%"]].forEach(function(tier, i) {
  tier.forEach(function(op) {
    PRECEDENCE[op] = i;
  });
});
function containsCallExpression(node) {
  if (n.CallExpression.check(node)) {
    return true;
  }
  if (isArray.check(node)) {
    return node.some(containsCallExpression);
  }
  if (n.Node.check(node)) {
    return types.someField(node, function(name, child) {
      return containsCallExpression(child);
    });
  }
  return false;
}
FPp.canBeFirstInStatement = function() {
  var node = this.getNode();
  return !n.FunctionExpression.check(node) && !n.ObjectExpression.check(node);
};
FPp.firstInStatement = function() {
  var s = this.stack;
  var parentName,
      parent;
  var childName,
      child;
  for (var i = s.length - 1; i >= 0; i -= 2) {
    if (n.Node.check(s[i])) {
      childName = parentName;
      child = parent;
      parentName = s[i - 1];
      parent = s[i];
    }
    if (!parent || !child) {
      continue;
    }
    if (n.BlockStatement.check(parent) && parentName === "body" && childName === 0) {
      assert.strictEqual(parent.body[0], child);
      return true;
    }
    if (n.ExpressionStatement.check(parent) && childName === "expression") {
      assert.strictEqual(parent.expression, child);
      return true;
    }
    if (n.SequenceExpression.check(parent) && parentName === "expressions" && childName === 0) {
      assert.strictEqual(parent.expressions[0], child);
      continue;
    }
    if (n.CallExpression.check(parent) && childName === "callee") {
      assert.strictEqual(parent.callee, child);
      continue;
    }
    if (n.MemberExpression.check(parent) && childName === "object") {
      assert.strictEqual(parent.object, child);
      continue;
    }
    if (n.ConditionalExpression.check(parent) && childName === "test") {
      assert.strictEqual(parent.test, child);
      continue;
    }
    if (isBinary(parent) && childName === "left") {
      assert.strictEqual(parent.left, child);
      continue;
    }
    if (n.UnaryExpression.check(parent) && !parent.prefix && childName === "argument") {
      assert.strictEqual(parent.argument, child);
      continue;
    }
    return false;
  }
  return true;
};
