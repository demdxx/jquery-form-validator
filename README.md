jQuery form validator
=====================

    @copyright Ponomarev Dmitry <demdxx@gmail.com>
    @license MIT
    @version 0.0.1
    @year 2012

Functions
---------

    global jQuery.validator_set_rule(code, rule);
           code – mnemonic name
           rule - { 'pattern': regexp [, required: boolean ] } or function (form, item, options)

    local $('selector').validator(options) Init validation
            options - {
                'validators': [my rules],
                [surcess:   function(form, item, options)],
                [fail:      function(form, item, options)],
                [reset:     function(form, item, options)]
            }

    local $('selector').validate() Check form

Default rules
-------------

 * required
 * email
 * password
 * uri
 * url
 * number
 * pattern as field of inputs

Events
------

    event.validatorForm;
    event.validatorOptions;

 * reset:   function(event, item)
 * surcess: function(event, item)
 * fail:    function(event, item)

Example
-------

```html
<form method="post">
    Email: <input name="email" type="email" required="required" />
    OR: <input name="email" type="text" validate="email required" />
    OR: <input name="email" type="text" pattern='/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/' />
    <input type="text" name="password" validate="password" />
    <input type="submit" value="send" />
</form>
```

```javascript
// My rule
$.validator_set_rule(
    'password',
    {'pattern': /^[a-zA-Z0-9]{3,}$/, required: true}
);

$('form').validator().on('submit', function(){
    return $(this).validate();
});
```
