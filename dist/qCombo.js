(function() {
  (function(root, factory) {
    if (typeof define === "function" && define.amd) {
      define(['classie/classie', 'eventEmitter/EventEmitter'], factory);
    } else {
      root.QCombo = factory(root.classie, root.EventEmitter);
    }
  })(this, function(classie, EventEmitter) {
    'use strict';
    var GUID, QCombo, QComboException, extend, handlerGUID, instances, isElement, _SPL;
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
    handlerGUID = 0;
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
        return '<div class="widgetCombo"> <div class="widgetComboLabel"> <div data-value="{v}" class="widgetCombo__caption"> <span>{c}</span> </div> <div class="qCombo-down qCombo__icon"></div> <div class="qCombo-clean qCombo__icon"></div> </div> <div class="widgetComboList"> <input type="text" role="combobox" class="widgetCombo__q"> <div class="qCombo-search qCombo__icon"></div> <ul role="listbox" class="widgetCombo__listbox"></ul> </div> </div>';
      },
      onOpen: function(event) {
        var isOpen;
        isOpen = classie.has(this.widget, 'isSearching');
        if (isOpen === false) {
          classie.add(this.widget, 'isSearching');
          this.q.focus();
        }
      },
      onClose: function(event) {
        var afterWait;
        afterWait = function() {
          var isOpen;
          isOpen = classie.has(this.widget, 'isSearching');
          if (isOpen === true) {
            return classie.remove(this.widget, 'isSearching');
          }
        };
        setTimeout(afterWait.bind(this), 300);
      },
      onSelected: function(event) {
        var target;
        target = event.target;
        this.valor = _SPL.getValue(target);
        this.caption.textContent = _SPL.getCaption(target);
        this.caption.parentElement.setAttribute('data-value', this.valor);
        _SPL.empty.call(this);
      },
      onKeydown: function() {
        var trigger;
        trigger = true;
        switch (event.keyCode) {
          case this.keyCodes.up:
            this.shift = !this.options.negative;
            break;
          case this.keyCodes.down:
            this.shift = this.options.negative;
            break;
          default:
            trigger = false;
        }
      },
      isListening: function(el) {
        var id;
        id = el && el.listenerGUID;
        return id && this.listeners[el.listenerGUID];
      },
      updateListEvents: function() {
        var li, _i, _len, _ref, _results;
        _ref = this.list.querySelectorAll('li');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          li = _ref[_i];
          if ((_SPL.isListening.call(this, li) != null) === false) {
            console.log('added', li);
            li.addEventListener('click', this.events.selected, false);
            ++this.listenerGUID;
            li.listenerGUID = this.listenerGUID;
            _results.push(this.listeners[this.listenerGUID] = true);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      getCaption: function(el) {
        if (el != null) {
          return el.textContent;
        } else {
          return null;
        }
      },
      getValue: function(el) {
        if (el != null) {
          return el.value || el.getAttribute('data-value');
        } else {
          return null;
        }
      },
      getData: function() {
        var option, _i, _len, _ref;
        _ref = this.selectCombo.querySelectorAll('option');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          option = _ref[_i];
          console.log(option);
          this.selectComboOptions[_SPL.getValue(option)] = _SPL.getCaption(option);
        }
      },
      empty: function() {
        var method;
        console.log(this.valor === null);
        method = this.valor === '' || this.valor === null ? 'add' : 'remove';
        classie[method](this.widget, 'isEmpty');
      },
      build: function() {
        var caption, content, contentList, d, optionSelected, r, title, v, _ref;
        title = this.selectCombo.getAttribute('title');
        optionSelected = this.selectCombo.querySelector('option:checked');
        if (title == null) {
          this.options.emptyCaption = title;
        }
        if (optionSelected !== null) {
          caption = _SPL.getCaption(optionSelected);
          this.valor = _SPL.getValue(optionSelected);
        } else {
          caption = this.options.emptyCaption;
          this.valor = '';
        }
        r = {
          'c': caption,
          'v': this.valor
        };
        content = this.options.template().replace(/\{(.*?)\}/g, function(a, b) {
          return r[b];
        });
        this.container.insertAdjacentHTML('afterbegin', content);
        this.widget = this.container.querySelector(this.options.selectors.widget);
        this.widgetLabel = this.widget.querySelector(this.options.selectors.comboLabel);
        this.caption = this.widgetLabel.querySelector(this.options.selectors.caption);
        this.down = this.widgetLabel.querySelector(this.options.selectors.down);
        this.clean = this.widgetLabel.querySelector(this.options.selectors.clean);
        this.widgetList = this.widget.querySelector(this.options.selectors.comboList);
        this.q = this.widgetList.querySelector(this.options.selectors.q);
        this.list = this.widgetList.querySelector(this.options.selectors.list);
        _SPL.empty.call(this);
        _SPL.getData.call(this);
        contentList = [];
        _ref = this.selectComboOptions;
        for (v in _ref) {
          d = _ref[v];
          if (v !== 'null') {
            contentList.push("<li data-value=\"" + v + "\">" + d + "</li>");
          }
        }
        this.list.insertAdjacentHTML('afterbegin', contentList.join(''));
        this.events = {
          'open': _SPL.onOpen.bind(this),
          'close': _SPL.onClose.bind(this),
          'selected': _SPL.onSelected.bind(this)
        };
        this.caption.addEventListener('click', this.events.open, false);
        this.down.addEventListener('click', this.events.open, false);
        this.q.addEventListener('blur', this.events.close, false);
        this.eventCall = {
          'keydown': _SPL.onKeydown.bind(this)
        };
        _SPL.updateListEvents.call(this);
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
          emptyCaption: 'Selecione',
          template: _SPL.getTemplate,
          getData: _SPL.getData,
          setElements: _SPL.setElements,
          setSizes: _SPL.setSizes,
          getTapElement: _SPL.getTapElement,
          getDragElement: _SPL.getDragElement,
          initialize: 'qCombo--initialized',
          selectors: {
            widget: '.widgetCombo',
            comboLabel: '.widgetComboLabel',
            caption: '.widgetCombo__caption > span',
            down: '.qCombo-down',
            clean: '.qCombo-clean',
            comboList: '.widgetComboList',
            q: '.widgetCombo__q',
            list: '.widgetCombo__listbox'
          }
        };
        extend(this.options, options);
        this.selectCombo = this.container.querySelector('select');
        this.selectComboOptions = {};
        this.listeners = {};
        this.listenerGUID = 0;
        if (isElement(this.selectCombo === false)) {
          throw new QComboException('✖ No select');
        } else {
          classie.add(this.container, this.options.initialize);
          this.keyCodes = {
            'up': 38,
            'down': 40
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
          _SPL.build.call(this);
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
