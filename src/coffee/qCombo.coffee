# ver isso
# http://jsfiddle.net/Wolfy87/JqRvS/
# http://stackoverflow.com/questions/19084976/jquery-autocomplete-matching-multiple-unordered-words-in-a-string

((root, factory) ->
  if typeof define is "function" and define.amd
    define [
        'classie/classie'
        'eventEmitter/EventEmitter'
      ], factory
  else
    root.QCombo = factory root.classie,
                               root.EventEmitter,
  return
) @, (classie, EventEmitter) ->

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
        <div class="widgetCombo">
          <div class="widgetComboLabel">
            <div data-value="{v}" class="widgetCombo__caption">
              <span>{c}</span>
            </div>
            <div class="qCombo-down qCombo__icon"></div>
            <div class="qCombo-clean qCombo__icon"></div>
          </div>
          <div class="widgetComboList">
            <input type="text" role="combobox" class="widgetCombo__q">
            <div class="qCombo-search qCombo__icon"></div>
            <ul role="listbox" class="widgetCombo__listbox"></ul>
          </div>
        </div>'

    onOpen: (event) ->
      isOpen = classie.has @widget, 'isSearching'
      if isOpen is off
        classie.add @widget, 'isSearching'
        @q.focus()
      return

    onClose: (event) ->
      afterWait = ->
        isOpen = classie.has @widget, 'isSearching'
        if isOpen is on
          classie.remove @widget, 'isSearching'

      setTimeout afterWait.bind(@), 300
      return

    onSelected: (event) ->
      target = event.target
      @valor = _SPL.getValue target
      @caption.textContent = _SPL.getCaption target
      @caption.parentElement.setAttribute 'data-value', @valor
      _SPL.empty.call(@)
      return

    onKeydown: ->
      trigger = true
      switch event.keyCode
        when @keyCodes.up
          @shift = !@options.negative
        when @keyCodes.down
          @shift = @options.negative
        else
          trigger = false

      # _SPL.onToggle.call(@) if trigger
      return

    isListening: (el) ->
      id = el and el.listenerGUID
      return id and @listeners[el.listenerGUID]


    updateListEvents: ->
      for li in @list.querySelectorAll('li')
        if _SPL.isListening.call(@, li)? is false
          console.log 'added', li
          li.addEventListener 'click', @events.selected, false
          ++@listenerGUID
          li.listenerGUID = @listenerGUID
          @listeners[@listenerGUID] = true

    getCaption: (el) ->
      return if el? then el.textContent else null

    getValue: (el) ->
      return if el? then el.value || el.getAttribute('data-value') else null

    getData: ->
      for option in @selectCombo.querySelectorAll 'option'
        console.log option
        @selectComboOptions[_SPL.getValue(option)] = _SPL.getCaption(option)
      return

    empty: ->
      console.log @valor == null
      method = if @valor == '' or @valor == null then 'add' else 'remove'
      classie[method] @widget, 'isEmpty'
      return

    # Build widget
    build: ->

      # Combo property
      title          = @selectCombo.getAttribute 'title'
      optionSelected = @selectCombo.querySelector 'option:checked'

      # Update emptyCaption
      @options.emptyCaption = title unless title?

      if optionSelected isnt null
        caption = _SPL.getCaption optionSelected
        @valor = _SPL.getValue optionSelected
      else
        caption = @options.emptyCaption
        @valor = ''

      # Template Render
      r =
        'c' : caption
        'v' : @valor

      content = @options.template().replace /\{(.*?)\}/g, (a, b) ->
        return r[b]

      @container.insertAdjacentHTML 'afterbegin', content

      # Components
      @widget      = @container.querySelector(@options.selectors.widget)
      @widgetLabel = @widget.querySelector(@options.selectors.comboLabel)
      @caption     = @widgetLabel.querySelector(@options.selectors.caption)
      @down        = @widgetLabel.querySelector(@options.selectors.down)
      @clean       = @widgetLabel.querySelector(@options.selectors.clean)
      @widgetList  = @widget.querySelector(@options.selectors.comboList)
      @q           = @widgetList.querySelector(@options.selectors.q)
      @list        = @widgetList.querySelector(@options.selectors.list)

      # Empty
      _SPL.empty.call(@)

      # Get Option Data
      _SPL.getData.call(@)

      # Fill List
      contentList = []
      for v, d of @selectComboOptions
        if v isnt 'null'
          contentList.push "<li data-value=\"#{v}\">#{d}</li>"
      @list.insertAdjacentHTML 'afterbegin', contentList.join ''

      # # Elements and size
      # @options.setElements.call(@)

      # # Set widths
      # @sizes = _SPL.getSizes.call(@)
      # @width = @sizes.max
      # @options.setSizes.call(@)

      # # Aria
      # @widget.setAttribute attrib, value for attrib, value of @aria

      # Events
      @events =
        'open'  : _SPL.onOpen.bind(@)
        'close': _SPL.onClose.bind(@)
        'selected': _SPL.onSelected.bind(@)

      # Click
      @caption.addEventListener 'click', @events.open, false
      @down.addEventListener 'click', @events.open, false

      # Blur
      @q.addEventListener 'blur', @events.close, false

      # Keyboard Event
      @eventCall = 'keydown': _SPL.onKeydown.bind(@)
      # @widget.addEventListener 'keydown', @eventCall.keydown

      _SPL.updateListEvents.call(@)

      # Init
      # _SPL.onToggle.call(@)
      return

  # Class
  class QCombo
    constructor: (container, options) ->

      # Self instance
      if false is (@ instanceof QCombo)
        return new QCombo container, options

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

      # Options
      @options =
        labeledby      : null
        required       : false
        emptyCaption   : 'Selecione'
        template       : _SPL.getTemplate
        getData        : _SPL.getData
        setElements    : _SPL.setElements
        setSizes       : _SPL.setSizes
        getTapElement  : _SPL.getTapElement
        getDragElement : _SPL.getDragElement
        initialize     : 'qCombo--initialized'
        selectors:
          widget     : '.widgetCombo'
          comboLabel : '.widgetComboLabel'
          caption    : '.widgetCombo__caption > span'
          down       : '.qCombo-down'
          clean      : '.qCombo-clean'
          comboList  : '.widgetComboList'
          q          : '.widgetCombo__q'
          list       : '.widgetCombo__listbox'

      extend @options, options

      # Select Combo
      @selectCombo = @container.querySelector('select');

      # Select Combo Options
      @selectComboOptions = {}

      # Listening
      @listeners = {}
      @listenerGUID = 0

      # Exception
      if isElement @selectCombo is no
        throw new QComboException '✖ No select'
      else
        # Initialize
        classie.add @container, @options.initialize

        # Keyboard
        @keyCodes =
          'up'   : 38
          'down' : 40

        # Accessibility
        @aria =
          'tabindex'              : 0
          'role'                  : 'combobox'
          'aria-expanded'         : true
          'aria-autocomplete'     : 'list'
          'aria-owns'             : null
          'aria-activedescendant' : null
          'aria-labeledby'        : @options.labeledby
          'aria-required'         : @options.required

        # Event parameters
        @eventToggleParams = [
          'instance' : @
          'select'   : @selectCombo
          'value'    : @valor
        ]

        # Custom Event change
        @eventChange = new CustomEvent 'change'

        _SPL.build.call(@)

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
