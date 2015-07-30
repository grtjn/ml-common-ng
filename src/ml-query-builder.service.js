(function() {
  'use strict';

  angular.module('ml.common')
    .factory('MLQueryBuilder', MLQueryBuilder);

  /*
   * Structured Query Syntax Reference: http://docs.marklogic.com/guide/search-dev/structured-query#id_59265
   */
  function MLQueryBuilder() {
    
    // [GJo] Allow exposing these under DEPRECATED names as well
    
    function qtext(text) {
      return {
        'qtext': text
      };
    }

    function rangeConstraint(name, operator, values, options) {
      if (!values && !options) {
        values = operator;
        operator = undefined;
      }
      operator = operator || 'EQ';
      values = asArray.apply(null, [values]);
      options = asArray.apply(null, [options]);
      return {
        'range-constraint-query': {
          'constraint-name': name,
          'range-operator': operator,
          'value': values,
          'range-option': options
        }
      };
    }
    
    function customConstraint(name, terms) {
      terms = asArray.apply(null, [terms]);
      return {
        'custom-constraint-query': {
          'constraint-name': name,
          'text': terms
        }
      };
    }
    
    function propertiesFragment(query) {
      return { 'properties-fragment-query': query };
    }
    
    function operatorState(name, state) {
      return {
        'operator-state': {
          'operator-name': name,
          'state-name': state
        }
      };
    }
    
    return {

      // [GJo] methods in order of the syntax ref
      
      query: function query() {
        var args = asArray.apply(null, arguments);
        return {
          'query': {
            'queries': args
          }
        };
      },

      // [GJo] undocumented?
      qtext: qtext,

      term: function term(text, weight) {
        text = asArray.apply(null, [text]);
        weight = weight || 1.0;
        return {
          'term-query': {
            'text': text,
            'weight': weight
          }
        };
      },

      and: function and() {
        var args = asArray.apply(null, arguments);
        var ordered = false;
        return {
          'and-query': {
            'queries': args,
            'ordered': ordered
          }
        };
      },

      or: function or() {
        var args = asArray.apply(null, arguments);
        return {
          'or-query': {
            'queries': args
          }
        };
      },

      // TODO: and-not-query

      not: function not(query) {
        return {
          'not-query': query
        };
      },
      
      // TODO: not-in-query
      // TODO: near-query

      boost: function boost(matching, boosting) {
        if (!boosting) {
          boosting = matching;
          matching = undefined;
        }
        return {
          'boost-query': {
            'matching-query': matching || this.and(),
            'boosting-query': boosting
          }
        };
      },

      propertiesFragment: propertiesFragment,

      directory: function directory() {
        var uris = asArray.apply(null, arguments);
        var infinite = true;
        return {
          'directory-query': {
            'uri': uris,
            'infinite': infinite
          }
        };
      },

      collection: function collection() {
        var uris = asArray.apply(null, arguments);
        return {
          'collection-query': {
            'uri': uris
          }
        };
      },

      // TODO: container-query

      document: function document() {
        var uris = asArray.apply(null, arguments);
        return {
          'document-query': {
            'uri': uris
          }
        };
      },

      documentFragment: function documentFragment(query) {
        return { 'document-fragment-query': query };
      },

      locksFragment: function locksFragment(query) {
        return { 'locks-fragment-query': query };
      },
      
      // TODO: range-query
      // TODO: value-query
      // TODO: word-query
      // TODO: geo-elem-query
      // TODO: geo-elem-pair-query
      // TODO: geo-attr-pair-query
      // TODO: geo-path-query
      // TODO: geo-json-property-query
      // TODO: geo-json-property-pair-query
      
      rangeConstraint: rangeConstraint,

      valueConstraint: function valueConstraint(name, text, weight) {
        weight = weight || 1.0;
        var type;
        if (text === null) {
          type = 'null';
          text = asArray.apply(null, [text]);
        } else {
          text = asArray.apply(null, [text]);
          type = typeof text[0];
          type = ((type === 'string') && 'text') || type;
        }
        var obj = {
          'value-constraint-query': {
            'constraint-name': name,
            'weight': weight
          }
        };
        obj[type] = text;
        return obj;
      },

      wordConstraint: function wordConstraint(name, text, weight) {
        text = asArray.apply(null, [text]);
        weight = weight || 1.0;
        return {
          'word-constraint-query': {
            'constraint-name': name,
            'text': text,
            'weight': weight
          }
        };
      },

      collectionConstraint: function collectionConstraint(name, uris) {
        uris = asArray.apply(null, [uris]);
        return {
          'collection-constraint-query': {
            'constraint-name': name,
            'uri': uris
          }
        };
      },

      // TODO: container-constraint-query
      // TODO: element-constraint-query
      // TODO: properties-constraint-query
      
      customConstraint: customConstraint,

      customGeospatialConstraint: function customGeospatialConstraint(name, annotation, shapes) {
        if (!shapes) {
          shapes = annotation;
          annotation = undefined;
        }
        
        shapes = asArray.apply(null, [shapes]);
        
        var points = [];
        var boxes = [];
        var circles = [];
        var polygons = [];
        
        for (var i = 0; i < shapes.length; i++) {
          var shape = shapes[i];
          
          if (shape.latitude) {
            points.push(shape);
          } else if (shape.south) {
            boxes.push(shape);
          } else if (shape.radius) {
            circles.push(shape);
          } else if (shape.point) {
            polygons.push(shape);
          }
        }
        
        return {
          'custom-constraint-query': {
            'constraint-name': name,
            'annotation': annotation,
            'point': points,
            'box': boxes,
            'circle': circles,
            'polygon': polygons,
          }
        };
      },

      geospatialConstraint: function geospatialConstraint(name, shapes) {
        shapes = asArray.apply(null, [shapes]);
        
        var points = [];
        var boxes = [];
        var circles = [];
        var polygons = [];
        
        for (var i = 0; i < shapes.length; i++) {
          var shape = shapes[i];
          
          if (shape.latitude) {
            points.push(shape);
          } else if (shape.south) {
            boxes.push(shape);
          } else if (shape.radius) {
            circles.push(shape);
          } else if (shape.point) {
            polygons.push(shape);
          }
        }
        
        return {
          'geospatial-constraint-query': {
            'constraint-name': name,
            'point': points,
            'box': boxes,
            'circle': circles,
            'polygon': polygons,
          }
        };
      },

      // TODO: lsqt-query
      // TODO: period-compare-query
      // TODO: period-range-query

      operatorState: operatorState,

      // Convenience method
      constraint: function constraint(type) {
        switch(type) {
          case 'range':
            return this.rangeConstraint;
          case 'value':
            return this.valueConstraint;
          case 'word':
            return this.wordConstraint;
          case 'collection':
            return this.collectionConstraint;
          case 'custom':
            return this.customConstraint;
          case 'custom-geospatial':
            return this.customGeospatialConstraint;
          case 'geospatial':
            return this.geospatialConstraint;
          default:
            return this.rangeConstraint;
        }
      },
      
      // DEPRECATED
      
      text: qtext,
      range: rangeConstraint,
      // [GJo] conflicts with collection-query!
      //collection: collectionConstraint
      custom: customConstraint,
      properties: propertiesFragment,
      operator: operatorState

    };

  }

  function asArray() {
    var args;

    if ( arguments.length === 0 ) {
      args = [];
    } else if ( arguments.length === 1) {
      if (Array.isArray( arguments[0] )) {
        args = arguments[0];
      } else {
        args = [ arguments[0] ];
      }
    } else {
      args = [].slice.call(arguments);
    }

    return args;
  }


}());
