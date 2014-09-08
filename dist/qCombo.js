(function() {
  (function(root, factory) {
    if (typeof define === "function" && define.amd) {
      define(['classie/classie', 'eventEmitter/EventEmitter', 'hammerjs/hammer'], factory);
    } else {
      root.QCombo = factory(root.classie, root.EventEmitter, root.Hammer);
    }
  })(this, function(classie, EventEmitter, Hammer) {
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
        return '<div class="widgetCombo" data-value="{v}"> <div class="widgetComboLabel"> <div class="widgetCombo__label"> <span>{c}</span> </div> <div class="qCombo-down qCombo__icon"></div> <div class="qCombo-clean qCombo__icon"></div> </div> <div class="widgetComboList"> <input type="text" role="combobox" class="widgetCombo__q"> <div class="qCombo-search qCombo__icon"></div> <ul role="listbox" class="widgetCombo__listbox"></ul> </div> </div>';
      },
      onChange: function(event) {
        var index, target;
        target = event.target;
        index = _SPL.getData(target, 'data-index');
        this.caption = _SPL.getCaption(target);
        this.valor = _SPL.getData(target, 'data-value');
        _SPL.updateCombo.call(this, index);
        _SPL.updateWidget.call(this);
        _SPL.updateParam.call(this);
        _SPL.isEmpty.call(this);
        this.emitChange();
        this.selectCombo.dispatchEvent(this.eventChange);
      },
      onReset: function(event) {
        this.caption = this.options.empty;
        this.valor = null;
        _SPL.updateCombo.call(this);
        _SPL.updateWidget.call(this);
        _SPL.updateParam.call(this);
        _SPL.isEmpty.call(this);
        this.emitChange();
        this.selectCombo.dispatchEvent(this.eventChange);
      },
      onOpen: function(event) {
        var afterFocus, isOpen;
        afterFocus = function() {
          return this.q.focus();
        };
        isOpen = classie.has(this.widget, 'isSearching');
        if (isOpen === false) {
          classie.add(this.widget, 'isSearching');
          setTimeout(afterFocus.bind(this), 100);
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
        setTimeout(afterWait.bind(this), 200);
      },
      getCaption: function(el) {
        if (isElement(el)) {
          return el.textContent;
        } else {
          return null;
        }
      },
      getValue: function(el) {
        if (isElement(el)) {
          return el.value;
        } else {
          return null;
        }
      },
      getData: function(el, attr) {
        if (attr == null) {
          attr = 'data-value';
        }
        if (isElement(el)) {
          return el.getAttribute(attr);
        } else {
          return null;
        }
      },
      getSelected: function(el) {
        return el[el.selectedIndex];
      },
      selected: function(o) {
        o.setAttribute('selected', '');
        o.selected = true;
      },
      unselected: function(o) {
        o.removeAttribute('selected');
        o.selected = false;
      },
      unselectedAll: function() {
        var option, _i, _len, _ref;
        _ref = this.selectCombo.options;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          option = _ref[_i];
          _SPL.unselected(option);
        }
      },
      isEmpty: function() {
        var method;
        method = this.valor === '' || this.valor === null ? 'add' : 'remove';
        classie[method](this.widget, 'isEmpty');
      },
      updateCombo: function(index) {
        var selected;
        if (index == null) {
          index = -1;
        }
        _SPL.unselectedAll.call(this);
        this.selectCombo.selectedIndex = index;
        selected = _SPL.getSelected(this.selectCombo);
        if (selected != null) {
          _SPL.selected(selected);
        }
      },
      updateWidget: function() {
        var value;
        this.label.textContent = this.caption;
        value = this.valor === null ? '' : this.valor;
        this.widget.setAttribute('data-value', value);
      },
      updateParam: function() {
        this.eventChangeParams = [
          {
            'instance': this,
            'select': this.selectCombo,
            'value': this.valor,
            'caption': this.caption
          }
        ];
      },
      updateDataList: function() {
        var contentList, el, o, str, _i, _len, _ref;
        contentList = [];
        _ref = this.selectComboOptions;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          str = [];
          str.push("<li data-index=\"" + o.index + "\" data-value=\"" + o.valor + "\">");
          str.push("" + o.caption + "</li>");
          contentList.push(str.join(''));
        }
        while (this.list.hasChildNodes()) {
          el = this.list.lastChild;
          _SPL.updateRemoveEvents.call(this, el);
          this.list.removeChild(el);
        }
        this.list.insertAdjacentHTML('afterbegin', contentList.join(''));
        _SPL.updateAddEvents.call(this);
      },
      updateAddEvents: function() {
        var li, listener, manager, _i, _len, _ref;
        _ref = this.list.querySelectorAll('li');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          li = _ref[_i];
          listener = _SPL.isListening.call(this, li);
          if (listener instanceof Hammer === false) {
            manager = new Hammer.Manager(li);
            manager.add(new Hammer.Tap({
              event: 'tap'
            }));
            manager.on('tap', this.events['change']);
            ++this.listenerGUID;
            li.listenerGUID = this.listenerGUID;
            this.listeners[this.listenerGUID] = manager;
          }
        }
      },
      updateRemoveEvents: function(el) {
        var listener;
        listener = _SPL.isListening.call(this, el);
        if (listener instanceof Hammer === true) {
          listener.destroy();
          this.listeners[this.listenerGUID] = null;
        }
      },
      isListening: function(el) {
        var id;
        id = el && el.listenerGUID;
        return id && this.listeners[el.listenerGUID];
      },
      getOptions: function(callback) {
        var option, _i, _len, _ref;
        this.selectComboOptions = [];
        _ref = this.selectCombo.querySelectorAll('option');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          option = _ref[_i];
          if (option.value !== '') {
            this.selectComboOptions.push({
              index: option.index,
              valor: _SPL.getValue(option),
              caption: _SPL.getCaption(option)
            });
          }
        }
        if (callback != null) {
          callback();
        }
      },
      build: function() {
        var content, o, r, selected, _i, _len, _ref;
        selected = _SPL.getSelected(this.selectCombo);
        this.valor = _SPL.getValue(selected);
        this.caption = _SPL.getCaption(selected);
        r = {
          'c': this.caption || this.options.empty,
          'v': this.valor
        };
        content = this.options.template().replace(/\{(.*?)\}/g, function(a, b) {
          return r[b];
        });
        this.container.insertAdjacentHTML('afterbegin', content);
        this.widget = this.container.querySelector(this.options.selectors.widget);
        this.widgetLabel = this.widget.querySelector(this.options.selectors.comboLabel);
        this.labelHandler = this.widgetLabel.querySelector(this.options.selectors.labelHandler);
        this.label = this.labelHandler.querySelector(this.options.selectors.label);
        this.down = this.widgetLabel.querySelector(this.options.selectors.down);
        this.clean = this.widgetLabel.querySelector(this.options.selectors.clean);
        this.widgetList = this.widget.querySelector(this.options.selectors.comboList);
        this.q = this.widgetList.querySelector(this.options.selectors.q);
        this.list = this.widgetList.querySelector(this.options.selectors.list);
        _SPL.isEmpty.call(this);
        this.events = {
          open: _SPL.onOpen.bind(this),
          close: _SPL.onClose.bind(this),
          reset: _SPL.onReset.bind(this),
          change: _SPL.onChange.bind(this)
        };
        this.hammer = [
          {
            manager: new Hammer.Manager(this.labelHandler),
            evento: new Hammer.Tap({
              event: 'tap'
            }),
            method: 'open'
          }, {
            manager: new Hammer.Manager(this.down),
            evento: new Hammer.Tap({
              event: 'tap'
            }),
            method: 'open'
          }, {
            manager: new Hammer.Manager(this.clean),
            evento: new Hammer.Tap({
              event: 'tap'
            }),
            method: 'reset'
          }
        ];
        _ref = this.hammer;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          o.manager.add(o.evento);
          o.manager.on(o.evento.options.event, this.events[o.method]);
        }
        this.q.addEventListener('blur', this.events.close, false);
        _SPL.getOptions.call(this, _SPL.updateDataList.bind(this));
      }
    };
    QCombo = (function() {
      function QCombo(container, options) {
        var id, initialized;
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
        this.selectCombo = this.container.querySelector('select');
        if (isElement(this.selectCombo === false)) {
          throw new QComboException('✖ No select combo');
        } else {
          this.selectComboOptions = [];
          this.listeners = {};
          this.listenerGUID = 0;
          this.options = {
            labeledby: null,
            required: false,
            empty: this.selectCombo.getAttribute('title') || '',
            template: _SPL.getTemplate,
            getOptions: _SPL.getOptions,
            setElements: _SPL.setElements,
            setSizes: _SPL.setSizes,
            getTapElement: _SPL.getTapElement,
            getDragElement: _SPL.getDragElement,
            initialize: 'qCombo--initialized',
            selectors: {
              widget: '.widgetCombo',
              comboLabel: '.widgetComboLabel',
              labelHandler: '.widgetCombo__label',
              label: 'span',
              down: '.qCombo-down',
              clean: '.qCombo-clean',
              comboList: '.widgetComboList',
              q: '.widgetCombo__q',
              list: '.widgetCombo__listbox'
            }
          };
          extend(this.options, options);
          classie.add(this.container, this.options.initialize);
          this.keyCodes = {
            'enter': 13,
            'up': 38,
            'down': 40
          };
          this.eventChangeParams = [
            {
              'instance': this,
              'select': this.selectCombo,
              'value': this.valor,
              'caption': this.caption
            }
          ];
          this.eventChange = new CustomEvent('change');
          this.singletap = new Hammer.Tap({
            event: 'singletap'
          });
          _SPL.build.call(this);
        }
        return;
      }

      QCombo.prototype.emitChange = function() {
        this.emitEvent('change', this.eventChangeParams);
      };

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
