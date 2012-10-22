/**
 * jQuery form field validator
 * 
 * @copyright Dmitry Ponomarev <demdxx@gmail.com>
 * @license MIT
 * @year 2012
 * 
 * @example
 *      $(form).validator();
 *      if ($('#theForm').validate()) { // Do something }
 * 
 * @TODO
 *      + Validate no standart controls
 *      + Add error messages
 */

(function($){
    var validateTypes = ['email', 'url', 'password', 'namber'];

    var validators = {
        'required': function(form, item, options) {
            return ''!=$(item).val().trim();
        },
        'email': {
            'pattern': /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        },
        'uri': {
            'pattern': /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/
        },
        'url': {
            'pattern': /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/
        },
        'password': {
            'pattern': /^[a-zA-Z0-9]{3,}$/,
            'required': true
        },
        'number': {
            'pattern': /^[+-]?\d+$/
        }
    };

    function validateFieldReset(form, item, options) {
        var sendEvent = true;
        if (typeof(options['reset'])=='function') {
            sendEvent = options.reset(form, item, options);
        }
        if (sendEvent!==false) {
            var event = jQuery.Event("reset");
            event.validatorForm = form;
            event.validatorOptions = options;
            if (false!==$(form).trigger(event, item)) {
                $(item).removeClass('error');
            }
        }
    };

    /**
     * Validate dom object field
     * @param form
     * @param item
     * @param options
     * @return match result
     */
    function validateField(form, item, options) {
        var $item = $(item);

        if (
            !$item.attr("validate")
         && !$item.attr("pattern")
         && !$item.attr("required")
         && validateTypes.indexOf($item.attr('type'))<0)
            return true;

        validateFieldReset(form, item, options);

        var surcess = true;
        var empty = false;
        var value = $(item).val();
        var valid_arr = $item.attr("validate") ? $item.attr("validate").split(' ') : [];
        if (validateTypes.indexOf($item.attr('type'))>-1)
            valid_arr.push($item.attr('type'));

        if ($item.attr("required"))
            valid_arr.push("required");

        if (valid_arr.length>0) {
            for (var k in options.validators) {
                if (valid_arr.indexOf(k)>-1) {
                    var vld = options.validators[k];
                    if (typeof(vld)=='function') {
                        surcess = vld(form, item, options);
                    } else {
                        if ('required' in vld) {
                            if (vld.required) {
                                if (value=='') {
                                    surcess = false;
                                    break;
                                }
                            } else if (value=='') {
                                empty = true;
                                break;
                            }
                        }
                        if ('func' in vld)
                            surcess = vld.func(form, item, options);
                        if (surcess && 'pattern' in vld)
                            surcess = 'object'==typeof(vld.pattern)
                                    ? vld.pattern.test(value)
                                    : (new RegExp(vld.pattern, 'ig')).test(value);
                        if (surcess && 'minlength' in vld)
                            surcess = vld.minlength <= value.length;
                        if (surcess && 'maxlength' in vld)
                            surcess = vld.maxlength >= value.length;
                    }
                    if (!surcess)
                        break;
                }
            }
        }

        if (surcess && $item.attr("pattern")) {
            if (!(empty && !value)
            &&  !(new RegExp($(item).attr("pattern"), 'ig')).test(value))
            {
                surcess = false;
            }
        }

        var sendEvent = true;
        if (surcess) {
            if (typeof(options['surcess'])=='function') {
                sendEvent = options.surcess(form, item, options);
            }
        } else {
            if (typeof(options['fail'])=='function') {
                sendEvent = options.fail(form, item, options);
            }
        }

        if (sendEvent!==false) {
            var event = jQuery.Event(surcess ? "surcess" : "fail");
            event.validatorForm = form;
            event.validatorOptions = options;
            if (false!==$(form).trigger(event, item)) {
                if (surcess)
                    $(item).removeClass('error');
                else
                    $(item).addClass('error');
            }
        }
        return surcess;
    };

    function initValidator(form, options) {
        options = $.extend(options || {}, {'validators': validators});
        $('input, textarea, select', form).each(function(){
            var onChange = (function(form, item, options) {
                var _form = form;
                var _item = item;
                var _options = options;
                return function(event) {
                    validateField(_form, item, _options);
                };
            })(form, this, options);
            $(this).on({
                'keyup': onChange,
                'change': onChange
            });
        });

        if ($(form).is('form')) {
            $(form).on('submit', function(){
                return $(this).validate();
            });
        }
    };

    /**
     * Extend jQuery
     */
    $.fn.validator = function(options) {
        if (!options)
            options = {};
        this.each(function(){
            initValidator(this, options);
            $(this).data('validator', options);
        });
        return this;
    };
    $.validator_set_rule = function(code, validator) {
        validators[code] = validator;
        return this;
    };

    /**
     * Validate form or container
     * @return boolean
     */
    $.fn.validate = function() {
        var valid = true;
        this.each(function(){
            var vld = $(this).data('validator');
            var form = this;
            if (null!=vld) {
                $('input, textarea, select', this).each(function(){
                    if (!validateField(form, this, vld))
                        valid = false;
                });
            }
        });
        return valid;
    };
})(jQuery);
