// đối tượng form
function validator(options) {
    var formElement = document.querySelector('#form-1');

    function getParents(elemnt, selector) {
        while (elemnt.parentElement) {
            if (elemnt.parentElement.matches(selector)) {
                return elemnt.parentElement;
            }
            elemnt = elemnt.parentElement;
        }
    }

    var selectorRuler = {}

    formElement.addEventListener('submit', submitHandle)

    // hàm xử lí lỗi khi không nhập kí  tự validate 
    function validate(inputElement, ruler) {
        var errorElement = getParents(inputElement, options.formGrupSlect).querySelector(options.formError)
        var errorMessge;

        var rulers = selectorRuler[ruler.selector];

        for (var i = 0; i < rulers.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    {

                        errorMessge = rulers[i](
                            formElement.querySelector(ruler.selector + ':checked')
                        )

                    }
                    break;
                default:
                    {
                        errorMessge = rulers[i](inputElement.value)
                    }
            }

            if (errorMessge) break;
        }

        if (errorMessge) {
            getParents(inputElement, '.form-group').classList.add('invalid')
            errorElement.innerHTML = errorMessge
        } else {
            errorElement.innerHTML = ''
            getParents(inputElement, '.form-group').classList.remove('invalid')
        }
        return !errorMessge;
    }


    function submitHandle(e) {
        e.preventDefault();
        isFormValid = true;

        // lặp qua từng rule để validate
        options.rulers.map((ruler) => {
                var inputElement = formElement.querySelector(ruler.selector)
                var isValid = validate(inputElement, ruler)
                inputElement.oninput = function() {
                    var errorElement = getParents(inputElement, '.form-group').querySelector(options.formError)
                    var errorMessge = ruler.test(inputElement.value)
                    errorElement.innerHTML = ''
                    getParents(inputElement, '.form-group').classList.remove('invalid')
                }
                if (!isValid) {
                    isFormValid = false;
                }
            })
            // lấy dưx liệu người dùng nhập vào thẻ input


        if (isFormValid) {
            if (typeof options.onSubmit === 'function') {
                var enableInput = formElement.querySelectorAll('[name]:not([disabled])')
                var formvalues = Array.from(enableInput).reduce((values, input) => {
                    switch (input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            if (!input.matches(':checked')) {
                                return values;
                                values[input.name] = ''
                            }
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = []
                            }

                            values[input.name].push(input.value)
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:

                            values[input.name] = input.value

                    }
                    return values;
                }, {})
                options.onSubmit(formvalues);
            } else {
                formElement.submit();
            }
        }

    }
    // lấy elemnt cần validate
    if (formElement) {

        options.rulers.map((ruler) => {
            var inputElements = formElement.querySelectorAll(ruler.selector)

            if (Array.isArray(selectorRuler[ruler.selector])) {
                selectorRuler[ruler.selector].push(ruler.test)
            } else {
                selectorRuler[ruler.selector] = [ruler.test]
            }

            Array.from(inputElements).forEach((inputElement) => {

                function blurInput() {
                    //xử lí khi blur ra khỏi input
                    validate(inputElement, ruler)
                        // xử lí khi người dùng nhập vào một ký tự
                    inputElement.oninput = function() {
                        var errorElement = getParents(inputElement, '.form-group').querySelector(options.formError)
                        var errorMessge = ruler.test(inputElement.value)
                        errorElement.innerHTML = ''
                        inputElement.parentElement.classList.remove('invalid')
                    }
                }

                inputElement.addEventListener('blur', blurInput)
                    // 
                inputElement.oninput = function() {
                        var errorElement = getParents(inputElement, '.form-group').querySelector(options.formError)
                        var errorMessge = ruler.test(inputElement.value)
                        errorElement.innerHTML = ''
                        inputElement.parentElement.classList.remove('invalid')
                    }
                    // 
                inputElement.onchange = function() {
                    var errorElement = getParents(inputElement, '.form-group').querySelector(options.formError)
                    if (inputElement.value === '') {
                        var errorMessge = ruler.test(inputElement.value)
                        inputElement.parentElement.classList.add('invalid')
                        errorElement.innerHTML = 'Vui lòng chọn lại'
                    } else {
                        errorElement.innerHTML = ''
                        inputElement.parentElement.classList.remove('invalid')
                    }

                }

            })

        })

    }
}

validator.isRequired = function(selector, message) {
    return {
        selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}
validator.isEmail = function(selector, message) {
    return {
        selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này là email'
        }
    }
}

validator.minLength = function(selector, min, message) {
    return {
        selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}

validator.isConfirm = function(selector, getConfirm, message) {
    return {
        selector,
        test: function(value) {
            return (value === getConfirm()) ? undefined : message || 'Xác nhận của bạn chưa chính xác'
        }
    }
}

validator({
    form: 'form-1',
    formGrupSlect: '.form-group',
    formError: '.form-message',

    rulers: [
        validator.isRequired('#fullname', 'Vui lòng nhập đầy đủ tên của bạn'),
        validator.isRequired('#email', 'vui lòng nhập email của bạn'),
        validator.isEmail('#email'),
        validator.minLength('#password', 6),
        validator.isRequired('#password_confirmation', 'Vui lòng nhập mật khẩu của bạn để có thể nhập lại'),
        validator.isConfirm('#password_confirmation', function() {
            return document.querySelector('#form-1 #password').value;
        }, 'Mật khẩu nhập lại không đúng'),
        validator.isRequired('#province', 'Vui lòng chọn tỉnh thành của bạn'),
        validator.isRequired('input[name="checkBox"]', 'Vui lòng chọn ít nhất 1 lựa chọn'),

        validator.isRequired('#files', 'Vui lòng tải ảnh lên'),
    ],
    onSubmit: function(data) {
        console.log(data);
    }
})