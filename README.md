# SmartySelect
Demo: https://codepen.io/Alebex/pen/rmWQyg

------------------------------------------

## Usage

```console
    npm install --save smarty-select
``` 

#### HTML Layout

```HTML
    <div class="select-container">
        <select hidden>
            <option value="value-1">option-1</option>
            <option value="value-2">option-2</option>
            <option value="value-3">option-3</option>
            ...
        </select>
    </div>
```

```HTML
    <!-- Multiple select -->
    <div class="select-container">
        <select multiple hidden>
            <option value="value-1">option-1</option>
            <option value="value-2">option-2</option>
            <option value="value-3">option-3</option>
            ...
        </select>
    </div>
```

#### Initialize SmartySelect

```js
    import SmartySelect from 'smarty-select';

    const test = SmartySelect(selectContainer, parameters);    
    // selectContainer - HTMLElement or string (with CSS Selector). Required.
    // parameters - object - object with SmartySelect parameters. Optional.
```

## Parameters

Parameter                  | Type      | Default
---------------------------|-----------|--------------------
classes.container          | string    | 'smarty-select'
classes.button             | string    | 'smarty-select__button'
classes.dropdown           | string    | 'smarty-select__dropdown'
classes.dropdownMenu       | string    | 'smarty-select__dropdownMenu'
classes.option             | string    | 'smarty-select__option'
placeholderText            | string    | 'Select options...'
optionHTML(value, index)   | function  | { return value; }

## Callbacks

Parameter                  | Type      | Description
---------------------------|-----------|--------------------
change(callback)           | function  | Callback function, call after change select
destroy()                  | function  | Destroy SmartySelect after call function
init()                     | function  | re-initialize the function, after destroy()

`Author:` `Alebex`