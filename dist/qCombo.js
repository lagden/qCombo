(function() {
  (function(root, factory) {
    if (typeof define === "function" && define.amd) {
      define(['classie/classie', 'eventEmitter/EventEmitter', 'hammerjs/hammer', 'async/lib/async'], factory);
    } else {
      root.QCombo = factory(root.classie, root.EventEmitter, root.Hammer, root.async);
    }
  })(this, function(classie, EventEmitter, Hammer, async) {
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
        return '<div tabindex="0" class="widgetCombo" data-value="{v}"> <div class="widgetComboLabel"> <div class="widgetCombo__label"><span>{c}</span></div> </div> <div class="widgetComboList"> <input type="search" class="widgetCombo__q"> <ul role="listbox" class="widgetCombo__listbox"></ul> </div> </div>';
      },
      onSelected: function(event) {
        var index, target;
        target = event.target;
        index = _SPL.getData(target, 'data-index');
        this.caption = _SPL.getCaption(target);
        this.valor = _SPL.getData(target, 'data-value');
        _SPL.updateCombo.call(this, index);
        _SPL.updateWidget.call(this);
        _SPL.updateParam.call(this);
        _SPL.isEmpty.call(this);
        _SPL.onFocusOut.call(this);
        this.emitChange();
        this.selectCombo.dispatchEvent(this.eventChange);
      },
      onToggle: function(event) {
        var focused;
        focused = classie.has(this.widget, 'focused');
        if (focused === false || this.focus === false) {
          this.focus = true;
          _SPL.onFocusIn.call(this);
        } else {
          _SPL.onFocusOut.call(this);
        }
      },
      onFocusIn: function(event) {
        classie.add(this.widget, 'focused');
        console.log('onFocusIn');
      },
      onFocusOut: function(event) {
        classie.remove(this.widget, 'focused');
        this.focus = false;
        console.log('onFocusOut');
      },
      onOpen: function(event) {},
      onClose: function(event) {},
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
      isListening: function(el) {
        var id;
        id = el && el.listenerGUID;
        return id && this.listeners[el.listenerGUID];
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
            manager.on('tap', this.events['selected']);
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
          'v': this.valor,
          'guid': this.container.srGUID
        };
        content = this.options.template().replace(/\{(.*?)\}/g, function(a, b) {
          return r[b];
        });
        this.container.insertAdjacentHTML('afterbegin', content);
        r = null;
        this.widget = this.container.querySelector(this.options.selectors.widget);
        this.widgetLabel = this.widget.querySelector(this.options.selectors.comboLabel);
        this.label = this.widgetLabel.querySelector(this.options.selectors.label);
        this.widgetList = this.widget.querySelector(this.options.selectors.comboList);
        this.q = this.widgetList.querySelector(this.options.selectors.q);
        this.list = this.widgetList.querySelector(this.options.selectors.list);
        _SPL.isEmpty.call(this);
        this.events = {
          toggle: _SPL.onToggle.bind(this),
          close: _SPL.onClose.bind(this),
          selected: _SPL.onSelected.bind(this),
          focusin: _SPL.onFocusIn.bind(this),
          focusout: _SPL.onFocusOut.bind(this)
        };
        this.hammer = [
          {
            manager: new Hammer.Manager(this.widgetLabel),
            evento: new Hammer.Tap({
              event: 'tap'
            }),
            method: 'toggle'
          }
        ];
        _ref = this.hammer;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          o.manager.add(o.evento);
          o.manager.on(o.evento.options.event, this.events[o.method]);
        }
        this.widget.addEventListener('focusin', this.events.focusin, true);
        this.widget.addEventListener('focusout', this.events.focusout, true);
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
              label: '.widgetCombo__label > span',
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
          this.focus = false;
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
