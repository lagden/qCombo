# ver isso
# http://jsfiddle.net/Wolfy87/JqRvS/
# http://stackoverflow.com/questions/19084976/jquery-autocomplete-matching-multiple-unordered-words-in-a-string

((root, factory) ->
  if typeof define is "function" and define.amd
    define [
        'classie/classie'
        'eventEmitter/EventEmitter'
        'hammerjs/hammer'
      ], factory
  else
    root.QCombo = factory root.classie,
                          root.EventEmitter,
                          root.Hammer
  return
) @, (classie, EventEmitter, Hammer) ->

  'use strict'

  # Extend object
  extend = (a, b) ->
    a[prop] = b[prop] for prop of b
    return a

  isElement = (obj) ->
    if typeof HTMLElement is "object"
      return obj instanceof HTMLElement
    else
      return obj and
             typeof obj is "object" and
             obj.nodeType is 1 and
             typeof obj.nodeName is "string"

  # Globally unique identifiers
  GUID = 0

  # Globally unique identifiers event handler
  handlerGUID = 0

  # Internal store of all QCombo intances
  instances = {}

  # Exception
  class QComboException
    constructor: (@message, @name='QComboException') ->

  # Private Methods
  _SPL =
    # Template
    getTemplate: ->
      return '
        <div tabindex="0" class="widgetCombo" data-value="{v}">
          <div class="widgetComboLabel">
            <div class="widgetCombo__label"><span>{c}</span></div>
          </div>
          <div class="widgetComboList">
            <input type="search" class="widgetCombo__q">
            <ul role="listbox" class="widgetCombo__listbox"></ul>
          </div>
        </div>'

    # Widget onSelected
    onSelected: (event) ->
      target  = event.target
      index   = _SPL.getData(target, 'data-index')

      @caption = _SPL.getCaption(target)
      @valor = _SPL.getData(target, 'data-value')

      _SPL.updateCombo.call @, index
      _SPL.updateWidget.call @
      _SPL.updateParam.call @
      _SPL.isEmpty.call @
      _SPL.onFocusOut.call @

      @emitChange()
      @selectCombo.dispatchEvent @eventChange
      return

    # Toggle
    onToggle: (event) ->
      focused = classie.has @widget, 'focused'
      if focused is false or @focus is false
        @focus = true
        _SPL.onFocusIn.call @
      else
        _SPL.onFocusOut.call @

      return

    onFocusIn: (event) ->
      classie.add @widget, 'focused'
      console.log 'onFocusIn'
      return

    onFocusOut: (event) ->
      classie.remove @widget, 'focused'
      @focus = false
      console.log 'onFocusOut'
      return

    # Open
    onOpen: (event) ->
      # isOpen = classie.has @widget, 'isSearching'
      # if isOpen
      #   classie.add @widget, 'isSearching'
      return

    # Close
    onClose: (event) ->
      # isOpen = classie.has @widget, 'isSearching'
      # if isOpen
      #   classie.remove @widget, 'isSearching'
      return

    # Return a text content from element
    getCaption: (el) ->
      return if isElement el then el.textContent else null

    # Return a value from element
    getValue: (el) ->
      return if isElement el then el.value else null

    # Return a data from element
    getData: (el, attr = 'data-value') ->
      return if isElement el then el.getAttribute(attr) else null

    # Get Combo selected by index
    getSelected: (el) ->
      return el[el.selectedIndex]

    # Option selected
    selected: (o) ->
      o.setAttribute 'selected', ''
      o.selected = true
      return

    # Option unselected
    unselected: (o) ->
      o.removeAttribute 'selected'
      o.selected = false
      return

    # Clean up all options
    unselectedAll: ->
      _SPL.unselected option for option in @selectCombo.options
      return

    isEmpty: ->
      method = if @valor == '' or @valor == null then 'add' else 'remove'
      classie[method] @widget, 'isEmpty'
      return

    updateCombo: (index = -1) ->
      _SPL.unselectedAll.call @
      @selectCombo.selectedIndex = index
      selected = _SPL.getSelected @selectCombo
      _SPL.selected selected if selected?
      return

    updateWidget: ->
      @label.textContent = @caption
      value = if @valor is null then '' else @valor
      @widget.setAttribute('data-value', value)
      return

    updateParam: ->
      @eventChangeParams = [
          'instance'   : @
          'select'     : @selectCombo
          'value'      : @valor
          'caption'    : @caption
        ]
      return

    isListening: (el) ->
      id = el and el.listenerGUID
      return id and @listeners[el.listenerGUID]

    updateAddEvents: ->
      for li in @list.querySelectorAll 'li'
        listener = _SPL.isListening.call @, li
        if listener instanceof Hammer is false
          manager = new Hammer.Manager li
          manager.add new Hammer.Tap event: 'tap'
          manager.on 'tap', @events['selected']

          # Map listeners
          ++@listenerGUID
          li.listenerGUID = @listenerGUID
          @listeners[@listenerGUID] = manager
      return

    updateRemoveEvents: (el) ->
      listener = _SPL.isListening.call @, el
      if listener instanceof Hammer is true
        listener.destroy()
        @listeners[@listenerGUID] = null
      return

    updateDataList: ->
      contentList = []
      for o in @selectComboOptions
        str = []
        str.push "<li data-index=\"#{o.index}\" data-value=\"#{o.valor}\">"
        str.push "#{o.caption}</li>"
        contentList.push str.join ''

      # Remove all children and events from @list
      while @list.hasChildNodes()
        el = @list.lastChild
        _SPL.updateRemoveEvents.call @, el
        @list.removeChild el

      @list.insertAdjacentHTML 'afterbegin', contentList.join ''
      _SPL.updateAddEvents.call @
      return

    # Get combo options data and keep on @selectComboOptions
    getOptions: (callback)->
      @selectComboOptions = []
      for option in @selectCombo.querySelectorAll 'option'
        if option.value != ''
          @selectComboOptions.push
            index  : option.index
            valor  : _SPL.getValue(option)
            caption: _SPL.getCaption(option)

      if callback?
        callback()

      return

    # Build widget
    build: ->

      # Initial values
      selected = _SPL.getSelected @selectCombo
      @valor = _SPL.getValue selected
      @caption = _SPL.getCaption selected

      # Template Render
      r =
        'c'   : @caption || @options.empty
        'v'   : @valor
        'guid': @container.srGUID

      content = @options.template().replace /\{(.*?)\}/g, (a, b) ->
        return r[b]

      @container.insertAdjacentHTML 'afterbegin', content

      r = null

      # Elements
      @widget       = @container.querySelector @options.selectors.widget
      @widgetLabel  = @widget.querySelector @options.selectors.comboLabel
      @label        = @widgetLabel.querySelector @options.selectors.label
      @widgetList   = @widget.querySelector @options.selectors.comboList
      @q            = @widgetList.querySelector @options.selectors.q
      @list         = @widgetList.querySelector @options.selectors.list

      # Checking if value is empty
      _SPL.isEmpty.call @

      # Events
      @events =
        toggle     : _SPL.onToggle.bind(@)
        close      : _SPL.onClose.bind(@)
        selected   : _SPL.onSelected.bind(@)
        focusin    : _SPL.onFocusIn.bind(@)
        focusout   : _SPL.onFocusOut.bind(@)
        # keydown  : _SPL.onKeydown.bind(@)

      # Hammer Manager
      @hammer = [
        {
          manager : new Hammer.Manager @widgetLabel
          evento  : new Hammer.Tap event: 'tap'
          method  : 'toggle'
        }
      ]

      # Add Event and Handler
      for o in @hammer
        o.manager.add o.evento
        o.manager.on o.evento.options.event, @events[o.method]

      # Focus in and out
      @widget.addEventListener 'focusin', @events.focusin, true
      @widget.addEventListener 'focusout', @events.focusout, true

      # @q.addEventListener 'focus', @events.open, true
      # @q.addEventListener 'focus', (event) ->
      #   event.preventDefault()


      # Keyboard Event
      # @widget.addEventListener 'keydown', @eventCall.keydown

      # Get options from combo and update list
      _SPL.getOptions.call @, _SPL.updateDataList.bind(@)

      # Init
      # _SPL.onToggle.call(@)
      return

  # Class
  class QCombo
    constructor: (container, options) ->

      # Container
      if typeof container == 'string'
        @container = document.querySelector container
      else
        @container = container

      # Check if component was initialized
      initialized = QCombo.data @container
      if initialized instanceof QCombo
        return initialized
      else
        id = ++GUID

      @container.srGUID = id
      instances[id] = @

      # Select Combo
      @selectCombo = @container.querySelector('select');

      # Exception
      if isElement @selectCombo is false
        throw new QComboException '✖ No select combo'
      else
        # Initialize
        #
        # Select Combo Options
        @selectComboOptions = []

        # Listening
        @listeners = {}
        @listenerGUID = 0

        # Options
        @options =
          labeledby      : null
          required       : false
          empty          : @selectCombo.getAttribute('title') || ''
          template       : _SPL.getTemplate
          getOptions     : _SPL.getOptions
          setElements    : _SPL.setElements
          setSizes       : _SPL.setSizes
          getTapElement  : _SPL.getTapElement
          getDragElement : _SPL.getDragElement
          initialize     : 'qCombo--initialized'
          selectors:
            widget       : '.widgetCombo'
            comboLabel   : '.widgetComboLabel'
            label        : '.widgetCombo__label > span'
            comboList    : '.widgetComboList'
            q            : '.widgetCombo__q'
            list         : '.widgetCombo__listbox'

        extend @options, options

        classie.add @container, @options.initialize

        # Keyboard
        @keyCodes =
          'enter': 13
          'up'   : 38
          'down' : 40

        # Event parameters
        @eventChangeParams = [
          'instance'   : @
          'select'     : @selectCombo
          'value'      : @valor
          'caption'    : @caption
        ]

        # Custom Event change
        @eventChange = new CustomEvent 'change'

        # Focus
        @focus = false

        # Buid
        _SPL.build.call @

      return

    # Trigger change event
    emitChange: ->
      @.emitEvent 'change', @eventChangeParams
      return

  # Extends
  extend QCombo::, EventEmitter::

  # https://github.com/metafizzy/outlayer/blob/master/outlayer.js#L887
  #
  # get QCombo instance from element
  # @param {Element} el
  # @return {QCombo}
  #
  QCombo.data = (el) ->
    id = el and el.srGUID
    return id and instances[id]

  return QCombo
