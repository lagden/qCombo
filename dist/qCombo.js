(function() {
  (function(root, factory) {
    if (typeof define === "function" && define.amd) {
      define(['classie/classie', 'eventEmitter/EventEmitter'], factory);
    } else {
      root.QCombo = factory(root.classie, root.EventEmitter);
    }
  })(this, function(classie, EventEmitter) {
    'use strict';
    var GUID, QCombo, QComboException, extend, instances, isElement, _SPL;
    extend = function(a, b) {
      var prop;
      for (prop in b) {
        a[prop] = b[prop];
      }
      return a;
    };
    isElement = function(obj) {
      if (typeof HTMLElement === "object") {
        return obj instanceof HTMLElement;
      } else {
        return obj && typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string";
      }
    };
    GUID = 0;
    instances = {};
    QComboException = (function() {
      function QComboException(message, name) {
        this.message = message;
        this.name = name != null ? name : 'QComboException';
      }

      return QComboException;

    })();
    _SPL = {
      getTemplate: function() {
        return '<div class="widgetSlide"> <div class="widgetSlide__opt widgetSlide__opt--min"> <span>{captionMin}</span> </div> <div class="widgetSlide__knob"></div> <div class="widgetSlide__opt widgetSlide__opt--max"> <span>{captionMax}</span> </div>';
      }
    };
    QCombo = (function() {
      function QCombo(container, options) {
        var id, initialized;
        if (false === (this instanceof QCombo)) {
          return new QCombo(container, options);
        }
        if (typeof container === 'string') {
          this.container = document.querySelector(container);
        } else {
          this.container = container;
        }
        initialized = QCombo.data(this.container);
        if (initialized instanceof QCombo) {
          return initialized;
        } else {
          id = ++GUID;
        }
        this.container.srGUID = id;
        instances[id] = this;
        this.options = {
          labeledby: null,
          required: false,
          template: _SPL.getTemplate,
          setElements: _SPL.setElements,
          setSizes: _SPL.setSizes,
          getTapElement: _SPL.getTapElement,
          getDragElement: _SPL.getDragElement,
          initialize: 'qCombo--initialized',
          selectors: {
            widget: '.widgetSlide',
            opts: '.widgetSlide__opt',
            optMin: '.widgetSlide__opt--min',
            optMax: '.widgetSlide__opt--max',
            knob: '.widgetSlide__knob'
          }
        };
        extend(this.options, options);
        this.selectCombo = this.container.querySelector('select');
        if (isElement(this.selectCombo === false)) {
          throw new QComboException('✖ No select');
        } else {
          classie.add(this.container, this.options.initialize);
          this.keyCodes = {
            'space': 32,
            'left': 37,
            'right': 39
          };
          this.aria = {
            'tabindex': 0,
            'role': 'combobox',
            'aria-expanded': true,
            'aria-autocomplete': 'list',
            'aria-owns': null,
            'aria-activedescendant': null,
            'aria-labeledby': this.options.labeledby,
            'aria-required': this.options.required
          };
          this.eventToggleParams = [
            {
              'instance': this,
              'select': this.selectCombo,
              'value': this.valor
            }
          ];
          this.eventChange = new CustomEvent('change');
        }
        return;
      }

      return QCombo;

    })();
    extend(QCombo.prototype, EventEmitter.prototype);
    QCombo.data = function(el) {
      var id;
      id = el && el.srGUID;
      return id && instances[id];
    };
    return QCombo;
  });

}).call(this);
