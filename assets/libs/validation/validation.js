function Validator(options) {

    function getParent(element, selector) {
        while ( element.parentElement ) {
            if ( element.parentElement.matches(selector) ) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {}

    // Hàm thực hiện validate
    function validate(inputElement, rule) {

        var errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorSelector)
        var errorMessage;
        var rulesFunc = selectorRules[rule.selector];

        // Xác định lỗi
        for ( var i = 0; i< rulesFunc.length; i++ ) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rulesFunc[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rulesFunc[i](inputElement.value)
            }
            
            if (errorMessage) break;
        }
        
        if (errorMessage) {
            errorElement.innerHTML = errorMessage
            getParent(inputElement, options.formGroup).classList.add('invalid')
        } else {
            errorElement.innerHTML = ''
            getParent(inputElement, options.formGroup).classList.remove('invalid')
        }

        return !!errorMessage
    }


    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    
    if (formElement) {
        // Báo lỗi khi submit 
        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = false;

            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (isValid) {
                    isFormValid = true
                }
            })

            if (isFormValid) {
                // 
            } else {

                if (typeof options.onSubmit === 'function') {
                    var enabledInput = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enabledInput).reduce(function(values, element) {
                        switch(element.type) {
                            case 'checkbox':
                                if (element.matches(':checked')) {
                                    if (!Array.isArray(values[element.name])) {
                                        values[element.name] = [];
                                    }
                                    values[element.name].push(element.value);
                                } else if (!values[element.name]) {  // Điều kiện là nếu không có key element.name trong values thì tạo nó và gán bằng chuỗi rỗng vì undefined chính là falsy
                                    values[element.name] = '';
                                }
                                break;
                            case 'radio':
                                values[element.name] = formElement.querySelector('input[name="' + element.name + '"]:checked').value
                                break;
                            case 'file':
                                values[element.name] = element.files
                                break;
                            default:
                                values[element.name] = element.value
                        }
                        
                        return values
                    }, {})
                    function resetForm(newValues) {
                        for (const key in newValues) {
                            const input = Array.from(enabledInput).find(inp => inp.name == key);
                            input.value = newValues[key];
                        }
                    }
                    options.onSubmit(formValues, { resetForm })
                }
            }
        }
        
        // Lặp qua mỗi rule và xử lý lắng nghe sự kiện blur, input
        options.rules.forEach(function(rule) {

            // Lưu lại các rule cho mỗi input
            if ( Array.isArray(selectorRules[rule.selector]) ) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            //

            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement) {
                // Xử lý trường hợp hiện error khi blur ra ngoài khi nhập sai
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }


                // Xử lý trường hợp đã nhập vào và xóa bỏ error sau khi blur ra ngoài
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorSelector)
                    errorElement.innerHTML = ''
                    getParent(inputElement, options.formGroup).classList.remove('invalid')
                }
            })

        })

    }
}



Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này!'
        }
    }
}



Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập email!'
        }
    }
}


Validator.isNumber = function(selector, message, { min, max, minMaxMessage } = { }) {
    const hasMin = min !== undefined;
    const hasMax = max !== undefined;
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\d+$/;
            return (
                regex.test(value) && (hasMin ? parseInt(value) >= min : true) && (hasMax ? parseInt(value) <= max : true)) 
                ? 
                undefined 
                : 
                (hasMin || hasMax ? (minMaxMessage || 'Vui lòng nhập đúng phạm vị giá trị của số ') : (message || 'Vui lòng nhập số!'));
        }
    };
};


Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự!`
        }
    }
}



Validator.isConfirmed = function(selector, getConfirm, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirm() ? undefined : message || 'Giá trị nhập vào không khớp!'
        }
    }
}