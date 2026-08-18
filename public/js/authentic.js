/* ============================================================
   LOVEVERSE AUTHENTICATION
   Register + Login + Location Autocomplete
============================================================ */


/* ============================================================
   FLOATING HEARTS
============================================================ */

$(document).ready(function () {

    const heartsContainer = document.getElementById('hearts');

    if (heartsContainer) {

        for (let i = 0; i < 20; i++) {

            const heart = document.createElement('div');

            heart.classList.add('heart');

            heart.style.left =
                Math.random() * 100 + "vw";

            heart.style.animationDuration =
                (8 + Math.random() * 5) + "s";

            heart.style.animationDelay =
                Math.random() * 8 + "s";

            const size =
                15 + Math.random() * 20;

            heart.style.width = size + "px";
            heart.style.height = size + "px";

            heartsContainer.appendChild(heart);
        }
    }

});


/* ============================================================
   GOOGLE AUTOCOMPLETE
   ------------------------------------------------------------
   Location is currently handled by LocationIQ below.
   This function is kept because your HTML may still have
   Google Maps callback=initAutocomplete.
============================================================ */

function initAutocomplete() {

    // New design uses LocationIQ autocomplete.
    // So Google Places autocomplete is not required here.

    const input =
        document.getElementById('location');

    if (!input || typeof google === 'undefined') {
        return;
    }

    try {

        const autocomplete =
            new google.maps.places.Autocomplete(input);

        autocomplete.addListener(
            'place_changed',
            function () {

                const place =
                    autocomplete.getPlace();

                if (
                    place.geometry &&
                    place.geometry.location
                ) {

                    document.getElementById('latitude').value =
                        place.geometry.location.lat();

                    document.getElementById('longitude').value =
                        place.geometry.location.lng();
                }

            }
        );

    } catch (error) {

        console.log(
            "Google autocomplete not initialized."
        );

    }
}


/* ============================================================
   AUTH UI
============================================================ */

function showLoginForm() {

    $('#register-section')
        .removeClass('active')
        .hide();

    $('#user-login')
        .removeClass('active')
        .hide();


    $('#user-login')
        .addClass('active')
        .fadeIn(250);


    /* Top tabs */

    $('#show-login')
        .addClass('active');

    $('#show-register')
        .removeClass('active');


    /* Heading */

    $('#title').text(
        'Welcome back'
    );

    $('#subtitle').text(
        'Please enter your login details below'
    );
}


function showRegisterForm() {

    $('#user-login')
        .removeClass('active')
        .hide();

    $('#register-section')
        .removeClass('active')
        .hide();


    $('#register-section')
        .addClass('active')
        .fadeIn(250);


    /* Top tabs */

    $('#show-register')
        .addClass('active');

    $('#show-login')
        .removeClass('active');


    /* Heading */

    $('#title').text(
        'Create account'
    );

    $('#subtitle').text(
        'Join LoveVerse and start meeting new people'
    );
}


/* ============================================================
   TOP SIGN IN / SIGN UP TABS
============================================================ */

$(document).on(
    'click',
    '#show-login',
    function (e) {

        e.preventDefault();

        showLoginForm();

    }
);


$(document).on(
    'click',
    '#show-register',
    function (e) {

        e.preventDefault();

        showRegisterForm();

    }
);


/* ============================================================
   BOTTOM LOGIN / REGISTER LINKS
============================================================ */

$(document).on(
    'click',
    '#login-to-register',
    function (e) {

        e.preventDefault();

        showRegisterForm();

    }
);


$(document).on(
    'click',
    '#register-to-login',
    function (e) {

        e.preventDefault();

        showLoginForm();

    }
);


/* ============================================================
   REGISTER FORM
============================================================ */

$(document).on(
    'submit',
    '#user-register',
    function (e) {

        e.preventDefault();


        const form =
            $('#user-register');


        let isValid = true;


        /* -----------------------------------------
           Validate required fields
        ----------------------------------------- */

        form
            .find(
                'input[required], select[required]'
            )
            .each(function () {

                /*
                 * Checkbox
                 */

                if (
                    $(this).attr('type') ===
                    'checkbox'
                ) {

                    if (!$(this).is(':checked')) {

                        $(this).addClass('error');

                        isValid = false;

                    } else {

                        $(this).removeClass('error');

                    }

                    return;
                }


                /*
                 * Normal inputs
                 */

                if (!$(this).val()) {

                    $(this).addClass('error');

                    isValid = false;

                } else {

                    $(this).removeClass('error');

                }

            });


        /* -----------------------------------------
           Check location
        ----------------------------------------- */

        const location =
            $('#locationInput').val().trim();


        if (!location) {

            $('#locationInput')
                .addClass('error');

            isValid = false;

        } else {

            $('#locationInput')
                .removeClass('error');
        }


        /* -----------------------------------------
           Check latitude / longitude
        ----------------------------------------- */

        const latitude =
            $('#latitude').val();

        const longitude =
            $('#longitude').val();


        if (!latitude || !longitude) {

            /*
             * Don't block if your backend doesn't
             * require coordinates.
             *
             * But show warning because location
             * should ideally be selected from
             * autocomplete.
             */

            console.log(
                "Location coordinates are missing."
            );
        }


        /* -----------------------------------------
           Validation failed
        ----------------------------------------- */

        if (!isValid) {

            toastr.error(
                "Please fill all required fields"
            );

            return false;
        }


        /* -----------------------------------------
           FormData
        ----------------------------------------- */

        const formdata =
            new FormData(
                form[0]
            );


        /* -----------------------------------------
           Disable button
        ----------------------------------------- */

        const submitButton =
            $('#submit-btn');


        submitButton
            .prop('disabled', true);


        const originalText =
            submitButton.text();


        submitButton.text(
            'Creating Account...'
        );


        /* -----------------------------------------
           AJAX REGISTER
        ----------------------------------------- */

        $.ajax({

            type: 'POST',

            url: 'register',

            data: formdata,

            contentType: false,

            processData: false

        })

        .done(function (response) {


            /* -------------------------------------
               SUCCESS
            ------------------------------------- */

            if (
                response.success === true &&
                response.data &&
                response.data.statusCode === 200
            ) {

                toastr.success(
                    response.message ||
                    'Registration successful'
                );


                setTimeout(
                    function () {

                        /*
                         * After registration
                         * automatically open Login.
                         */

                        showLoginForm();


                        /*
                         * Optional:
                         * pre-fill registered email
                         */

                        const registeredEmail =
                            $('#user-register')
                                .find(
                                    'input[name="email"]'
                                )
                                .val();


                        if (registeredEmail) {

                            $('#loginForm')
                                .find(
                                    'input[name="email"]'
                                )
                                .val(
                                    registeredEmail
                                );
                        }


                    },
                    1000
                );

            }


            /* -------------------------------------
               VALIDATION / SERVER ERRORS
            ------------------------------------- */

            else if (
                response.errors &&
                Array.isArray(response.errors)
            ) {

                response.errors.forEach(
                    function (error) {

                        toastr.error(error);

                    }
                );

            }


            /* -------------------------------------
               NORMAL ERROR MESSAGE
            ------------------------------------- */

            else if (response.message) {

                toastr.error(
                    response.message
                );

            }

        })


        /* -----------------------------------------
           AJAX ERROR
        ----------------------------------------- */

        .fail(function (xhr) {

            console.log(
                "Register Error:",
                xhr
            );


            let errorMessage =
                "Something went wrong!";


            if (
                xhr.responseJSON &&
                xhr.responseJSON.message
            ) {

                errorMessage =
                    xhr.responseJSON.message;
            }


            /*
             * Laravel validation errors
             */

            if (
                xhr.responseJSON &&
                xhr.responseJSON.errors
            ) {

                const errors =
                    xhr.responseJSON.errors;


                Object.keys(errors).forEach(
                    function (key) {

                        if (
                            Array.isArray(
                                errors[key]
                            )
                        ) {

                            errors[key].forEach(
                                function (msg) {

                                    toastr.error(msg);

                                }
                            );

                        }

                    }
                );

            } else {

                toastr.error(
                    errorMessage
                );

            }

        })


        /* -----------------------------------------
           ALWAYS
        ----------------------------------------- */

        .always(function () {

            submitButton
                .prop('disabled', false);

            submitButton.text(
                originalText
            );

        });

    }
);


/* ============================================================
   REMOVE ERROR ON INPUT / CHANGE
============================================================ */

$(document).on(
    'input change',
    '#user-register input[required], #user-register select[required]',
    function () {

        if (
            $(this).attr('type') ===
            'checkbox'
        ) {

            if ($(this).is(':checked')) {

                $(this).removeClass('error');

            }

            return;
        }


        if ($(this).val()) {

            $(this).removeClass('error');

        }

    }
);


/* ============================================================
   LOCATION ERROR REMOVE
============================================================ */

$(document).on(
    'input',
    '#locationInput',
    function () {

        if ($(this).val()) {

            $(this).removeClass('error');

        }
    }
);


/* ============================================================
   LOGIN
============================================================ */

$(document).on(
    'submit',
    '#loginForm',
    function (e) {

        e.preventDefault();


        const form =
            $('#loginForm');


        const email =
            form
                .find('input[name="email"]')
                .val()
                .trim();


        const password =
            form
                .find('input[name="password"]')
                .val();


        /* -----------------------------------------
           Client validation
        ----------------------------------------- */

        let isValid = true;


        if (!email) {

            form
                .find('input[name="email"]')
                .addClass('error');

            isValid = false;

        } else {

            form
                .find('input[name="email"]')
                .removeClass('error');

        }


        if (!password) {

            form
                .find('input[name="password"]')
                .addClass('error');

            isValid = false;

        } else {

            form
                .find('input[name="password"]')
                .removeClass('error');

        }


        if (!isValid) {

            toastr.error(
                "Please enter email and password"
            );

            return false;
        }


        /* -----------------------------------------
           Disable button
        ----------------------------------------- */

        const button =
            form.find('button[type="submit"]');


        const originalText =
            button.text();


        button
            .prop('disabled', true)
            .text(
                'Signing In...'
            );


        /* -----------------------------------------
           Login FormData
        ----------------------------------------- */

        const formData = {

            email: email,

            password: password

        };


        /* -----------------------------------------
           AJAX LOGIN
        ----------------------------------------- */

        $.ajax({

            type: 'POST',

            url: '/',

            data: formData,

        })


        .done(function (response) {


            if (
                response.success === true
            ) {


                toastr.options = {

                    timeOut: 1000,

                    extendedTimeOut: 1000,

                    closeButton: true,

                    positionClass:
                        "toast-top-right",

                    progressBar: true

                };


                toastr.success(
                    response.message ||
                    "Login successful"
                );


                setTimeout(
                    function () {


                        if (
                            response.data &&
                            response.data.redirect
                        ) {

                            window.location.href =
                                response.data.redirect;

                        }

                    },
                    1000
                );


            }


            else if (
                response.message
            ) {

                toastr.error(
                    response.message
                );

            }

        })


        .fail(function (xhr) {


            console.log(
                "Login Error:",
                xhr
            );


            let errorMsg =
                "Login failed";


            if (
                xhr.responseJSON &&
                xhr.responseJSON.message
            ) {

                errorMsg =
                    xhr.responseJSON.message;
            }


            /*
             * Laravel validation errors
             */

            if (
                xhr.responseJSON &&
                xhr.responseJSON.errors
            ) {

                const errors =
                    xhr.responseJSON.errors;


                Object.keys(errors).forEach(
                    function (key) {

                        if (
                            Array.isArray(
                                errors[key]
                            )
                        ) {

                            errors[key].forEach(
                                function (msg) {

                                    toastr.error(msg);

                                }
                            );

                        }

                    }
                );

            } else {

                toastr.error(
                    errorMsg
                );

            }

        })


        .always(function () {

            button
                .prop('disabled', false)
                .text(originalText);

        });

    }
);


/* ============================================================
   LOGIN ERROR REMOVE
============================================================ */

$(document).on(
    'input',
    '#loginForm input[required]',
    function () {

        if ($(this).val()) {

            $(this).removeClass('error');

        }

    }
);


/* ============================================================
   LOCATIONIQ AUTOCOMPLETE
============================================================ */

const ACCESS =
    "pk.730d12ad2b022ddf7061d435502bbc12";


let debounceTimer;

let lastLocationData = [];


/* ============================================================
   LOCATION SEARCH
============================================================ */

$(document).on(
    'input',
    '#locationInput',
    function () {


        clearTimeout(
            debounceTimer
        );


        const input =
            $(this);


        const query =
            input
                .val()
                .trim();


        /* -----------------------------------------
           Clear coordinates when user changes
           location after selecting one
        ----------------------------------------- */

        $('#latitude').val('');

        $('#longitude').val('');


        /* -----------------------------------------
           Minimum characters
        ----------------------------------------- */

        if (query.length < 2) {

            $('#locationSuggestions')
                .hide()
                .empty();

            return;
        }


        /* -----------------------------------------
           Debounce
        ----------------------------------------- */

        debounceTimer =
            setTimeout(
                function () {


                    $.get(

                        `https://us1.locationiq.com/v1/autocomplete?key=${ACCESS}&q=${encodeURIComponent(query)}`,

                        function (data) {


                            lastLocationData =
                                data || [];


                            let html =
                                "";


                            if (
                                !data ||
                                !data.length
                            ) {

                                $('#locationSuggestions')
                                    .hide();

                                return;
                            }


                            data.forEach(
                                function (
                                    item,
                                    index
                                ) {


                                    html += `

                                        <div
                                            class="suggest-item"
                                            data-index="${index}"
                                        >

                                            📍
                                            ${item.display_name}

                                        </div>

                                    `;

                                }
                            );


                            $('#locationSuggestions')
                                .html(html)
                                .show();

                        }

                    )

                    .fail(
                        function (xhr) {

                            console.log(
                                "LocationIQ Error:",
                                xhr
                            );

                            $('#locationSuggestions')
                                .hide();

                        }
                    );


                },
                500
            );

    }
);


/* ============================================================
   SELECT LOCATION
============================================================ */

$(document).on(
    'click',
    '.suggest-item',
    function () {


        const index =
            $(this).data('index');


        const selected =
            lastLocationData[index];


        if (!selected) {

            return;
        }


        /* -----------------------------------------
           Address
        ----------------------------------------- */

        $('#locationInput')
            .val(
                selected.display_name
            );


        /* -----------------------------------------
           Coordinates
        ----------------------------------------- */

        $('#latitude')
            .val(
                selected.lat
            );


        $('#longitude')
            .val(
                selected.lon
            );


        /* -----------------------------------------
           Hide suggestions
        ----------------------------------------- */

        $('#locationSuggestions')
            .hide();


        /* -----------------------------------------
           Remove validation error
        ----------------------------------------- */

        $('#locationInput')
            .removeClass('error');


        console.log(
            "📍 Selected Address:",
            selected.display_name
        );

        console.log(
            "➡ Latitude:",
            selected.lat
        );

        console.log(
            "➡ Longitude:",
            selected.lon
        );

    }
);


/* ============================================================
   CLOSE LOCATION SUGGESTIONS
============================================================ */

$(document).on(
    'click',
    function (e) {

        if (
            !$(e.target)
                .closest(
                    '.location-wrapper'
                )
                .length
        ) {

            $('#locationSuggestions')
                .hide();
        }

    }
);