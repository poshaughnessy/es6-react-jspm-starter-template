/* */ 
'use strict';
require("mock-modules").autoMockOff();
var transformAll = require("../../syntax").transformAll;
function transform(source) {
  return transformAll(source, {}, ['allocate']);
}
describe('react displayName jsx', function() {
  it('should only inject displayName if missing', function() {
    var code = ['"use strict";', 'var Whateva = React.createClass({', '  displayName: "Whateva",', '  render: function() {', '    return null;', '  }', '});'].join('\n');
    var result = ['"use strict";', 'var Whateva = React.createClass({', '  displayName: "Whateva",', '  render: function() {', '    return null;', '  }', '});'].join('\n');
    expect(transform(code).code).toEqual(result);
  });
  it('should inject displayName in simple assignment', () => {
    var code = ['var Component = React.createClass({', '  render: function() {', '    return null;', '  }', '});'].join('\n');
    var result = ['var Component = React.createClass({displayName: "Component",', '  render: function() {', '    return null;', '  }', '});'].join('\n');
    expect(transform(code).code).toEqual(result);
  });
  it('should inject displayName in simple assignment without var', () => {
    var code = ['var Component;', 'Component = React.createClass({', '  render: function() {', '    return null;', '  }', '});'].join('\n');
    var result = ['var Component;', 'Component = React.createClass({displayName: "Component",', '  render: function() {', '    return null;', '  }', '});'].join('\n');
    expect(transform(code).code).toEqual(result);
  });
  it('should inject displayName in property assignment', () => {
    var code = ['exports.Component = React.createClass({', '  render: function() {', '    return null;', '  }', '});'].join('\n');
    var result = ['exports.Component = React.createClass({displayName: "Component",', '  render: function() {', '    return null;', '  }', '});'].join('\n');
    expect(transform(code).code).toEqual(result);
  });
  it('should inject displayName in object declaration', () => {
    var code = ['exports = {', '  Component: React.createClass({', '    render: function() {', '      return null;', '    }', '  })', '};'].join('\n');
    var result = ['exports = {', '  Component: React.createClass({displayName: "Component",', '    render: function() {', '      return null;', '    }', '  })', '};'].join('\n');
    expect(transform(code).code).toEqual(result);
  });
});
