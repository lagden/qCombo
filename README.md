qCombo.js
=========

It is a plugin to make select boxes much more user-friendly

## Installation

    bower install qCombo

#### Warning for IE

Required [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill) polyfill to avoid error.

## Options

```Coffee
labeledby      : null
required       : false
template       : _SPL.getTemplate
```

## Usage

**Markup**

```html
<label for="animal">Choose one animal:</label>
<div class="qCombo">
    <select name="animal" id="animal">
      <option value="">Select</option>
      <option value="Dog">Dog</option>
      <option value="Cat">Cat</option>
      <option value="Lion">Lion</option>
      <option value="Fox">Fox</option>
    </select>
</div>
```

**AMD**

```javascript
require('qCombo')('.qCombo');
```

**Global**

```javascript
new QCombo('.qCombo');
```

## Author

[Thiago Lagden](http://lagden.in)
