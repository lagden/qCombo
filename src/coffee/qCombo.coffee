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

  # Internal store of all QCombo intances
  instances = {}

  # Exception
  class QComboException
    constructor: (@message, @name='QComboException') ->

  # Private Methods
  _SPL =
    # Template
    getTemplate: ->
      return '<div class="widgetSlide">
        <div class="widgetSlide__opt widgetSlide__opt--min">
        <span>{captionMin}</span>
        </div>
        <div class="widgetSlide__knob"></div>
        <div class="widgetSlide__opt widgetSlide__opt--max">
        <span>{captionMax}</span>
        </div>'

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
        template       : _SPL.getTemplate
        setElements    : _SPL.setElements
        setSizes       : _SPL.setSizes
        getTapElement  : _SPL.getTapElement
        getDragElement : _SPL.getDragElement
        initialize     : 'qCombo--initialized'
        selectors:
          widget : '.widgetSlide'
          opts   : '.widgetSlide__opt'
          optMin : '.widgetSlide__opt--min'
          optMax : '.widgetSlide__opt--max'
          knob   : '.widgetSlide__knob'

      extend @options, options

      # Select Combo
      @selectCombo = @container.querySelector('select');

      # Exception
      if isElement @selectCombo is no
        throw new QComboException '✖ No select'
      else
        # Initialize
        classie.add @container, @options.initialize

        # Keyboard
        @keyCodes =
          'space' : 32
          'left'  : 37
          'right' : 39

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

        # Event change
        @eventChange = new CustomEvent 'change'

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
