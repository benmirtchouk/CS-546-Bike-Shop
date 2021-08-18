// Courtesy validation for obviously incorrect cases.
 
const errorForEmailEntry = (email) => {
    if (!email || typeof(email) != "string") { return "Must be a string"}
    const parts = email.split("@");
    if (parts.length != 2) { return "Must have exactly one @"}
    if (parts[1].split(".").length < 2) { return "Must have a top level domain"}
    return null
}

const errorForPassword = (password) => {
    if (!password || typeof(password) != "string") { return "Must be a string" }
    if (password.length < 4) { return "Must be at least four characters long"} 
}

const errorForName = (name) => { 
    if (!name|| typeof(name) != "string") { return "Must be a string" }
    if (name.trim().length == 0 ) { return "Must be non empty" }
}

const validateEmailPasswordOrError = (emailField, passwordField) => {
    const email = emailField.value;
    const emailError = errorForEmailEntry(email);
    if(emailError != null) {
        alert(`Email: ${emailError}`);
        return false;
    }

    const password = passwordField.value;
    const passwordError = errorForPassword(password);
    if (passwordError != null) {
        alert(`Password: ${passwordError}`);
        return false;
    }

    return true;
}

// Bind the event handlers
( () => {

    // #MARK:- Tab header
    // #MARK: Tab header dropdown 
    const dropDowns = document.getElementsByClassName("tabDropDown");
    for(const dropDown of dropDowns) {

        let outOfBoundsTimeout = null;

        const tabCollection = dropDown.nextElementSibling;
        document.getElementById("pageContent").onmouseenter = () => {
            if (tabCollection.classList.contains("gone")) { return; }
            outOfBoundsTimeout = setTimeout(() => {
                tabCollection.classList.add("gone");
                dropDown.classList.remove("gone");
                outOfBoundsTimeout = null
            }, 500)

        }

        tabCollection.onmouseenter = () => {
            if (outOfBoundsTimeout == null) { return }
            clearTimeout(outOfBoundsTimeout);
            outOfBoundsTimeout = null;

        }

        dropDown.onmouseenter = () => {
            tabCollection.classList.remove("gone");
            dropDown.classList.add("gone")
        }
    };


    // #MARK: Tab header forms
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener('submit', event => {
        event.preventDefault();

        const inputs = loginForm.elements;
        validateEmailPasswordOrError(inputs[0], inputs[1]);

        var requestConfig = {
            method: 'POST',
            url: '/user/login',
            contentType: 'application/json',
            data: JSON.stringify({
                email: inputs[0].value,
                password: inputs[1].value,
            })
        };

        $.ajax(requestConfig).then((res) => {
            if (res.error) {
                alert(res.error);
            } else {
                $("#unauth-header").hide()
                $("#auth-header").html(`<div><p>${res.user.firstName}</p><p>${res.user.lastName}</p><a href="/user/logout">Log Out</a></div>`)
                $("#auth-header").show()
            }
        });

        return false;
    })

    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener('submit', event => {
        event.preventDefault();

        const inputs = registerForm.elements;

        const passwordField = inputs[1];
        if(!validateEmailPasswordOrError(inputs[0], passwordField, event)) { return; }
        const password = passwordField.value;
        const confirmPassword = inputs[2].value;
        if (password != confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        for ([field, label] of [[inputs[3], "First"], [inputs[4], "Last"]]) {
            const name = field.value;
            const nameError = errorForName(name);
            if(nameError) {
                alert(`${label} Name: ${nameError}`)
                return;
            }
        }

        var requestConfig = {
            method: 'POST',
            url: '/user/register',
            contentType: 'application/json',
            data: JSON.stringify({
                email: inputs[0].value,
                password,
                confirmPassword,
                firstName: inputs[3].value,
                lastName: inputs[4].value
            })
        };

        $.ajax(requestConfig).then((res) => {
            if (res.error) {
                alert(res.error);
            } else {
                $("#unauth-header").hide()
                $("#auth-header").html(`<div><p>${res.user.firstName}</p><p>${res.user.lastName}</p><a href="/user/logout">Log Out</a></div>`)
                $("#auth-header").show()
            }
        });

        return false;
    })

})()