( () => {
    let scrollingTo = null
    let scrollTimeout = null;
    const scrollLogic = (scrollTarget, blockTarget) => {
        if(scrollingTo!= null) {
            scrollingTo.classList.remove("scrollTarget");
            scrollingTo = null;
        }
        if(scrollTimeout != null) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        scrollingTo = scrollTarget;
        scrollTarget.classList.add("scrollTarget");
        if(blockTarget !== 'start' && blockTarget !== 'end') {
            blockTarget = 'start'
        }
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: blockTarget});
        scrollTimeout = setTimeout(() => { scrollTarget.classList.remove("scrollTarget"); scrollTimeout = null; }, 3000);
    }
        

    const editProductFormText = document.getElementById("editProductFormText");
    const editProductForm = document.getElementById("editProductForm");
    const editProductFormSubmit = document.getElementById("editProductFormSubmit");
    let editBikeId = null
    editProductForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = $(editProductForm).serializeArray()


        const dataToSend = {}
        for(field of formData) {
            const {name, value} = field;
            // Browser form semantics handle numerical and data type. As all fields are optional on an edit, so JS needs to confirm it is present
            if(!value) { continue }
            const nameTokens = name.split('.')
            // Nest the spec object
            const shouldNest = nameTokens.length > 1
            const finalKey =  shouldNest ? nameTokens[1] : name;
            if (shouldNest) {
                const parentKey = nameTokens[0];
                if (typeof dataToSend[parentKey] !== 'object'){
                    dataToSend[parentKey] = {};
                }
                dataToSend[parentKey][finalKey] = value;
            } else {
                dataToSend[finalKey] = value;
            }
            
        }
        // Separate the CSV data if present 
        if (dataToSend.tags) {
            dataToSend.tags = dataToSend.tags.split(",");
        }

        const bikeId = editBikeId
        if(Object.keys(dataToSend).length == 0) { 
            alert("Please enter at least one field to modify");
            return; 
        }

        const requestData = {
            contentType: 'application/json',
            data: JSON.stringify(dataToSend)
        }

        if (bikeId != null) {
            requestData.type = "PATCH", 
            requestData.url = `/bikes/${bikeId}`
        } else {
            requestData.type = "PUT"
            requestData.url = '/bikes'
        }


        $.ajax(requestData).then((res) => {
            // Redirect to cause a page reload 
            window.location = "/admin";
        }).catch((error) => {
            const status = error.status
            const message = error.responseJSON.message ? error.responseJSON.message: "Server rejected changes";
            alert(`${status}: ${message}`);
        })
    });

    const closeForm = () => {
        editProductForm.parentNode.classList.add("gone");
    }

    document.getElementById("closeEditProductForm").onclick = (event) => {
        event.preventDefault();
        closeForm();
    }

    document.getElementById("addABike").onclick = (event) => {
        event.preventDefault();
        scrollLogic(editProductForm, 'end'); 

        editProductFormText.textContent = `Creating a new bike`;  
        editProductForm.reset();
        $(".requiredIfNew").prop('required', true);
        editProductFormSubmit.textContent = "Create!";

        editProductForm.parentNode.classList.remove("gone");
    }

    for(const button of document.getElementsByClassName('productEditButton')) {
        button.onclick =  (event) => {
            event.preventDefault();
            scrollLogic(editProductForm, 'end'); 
            // Get the id from the outer A tag
            const productCard = button.parentNode.parentNode.parentNode;
            editBikeId = productCard.dataset.id;
            // Get the name of the bike from what is displayed on the first line of the card
            const editBikeName = productCard
                                .innerText.split('\n')[0]
                                .split(":")[1]
                                .trim();

            editProductFormText.textContent = `Editing properties for "${editBikeName}". Only enter the fields to be updated.`;  
            editProductForm.reset();
            $(".requiredIfNew").prop('required', false);
            editProductFormSubmit.textContent = "Update!";
            editProductForm.parentNode.classList.remove("gone");
        }
    }

    for(const button of document.getElementsByClassName('productRemoveButton')) {
        button.onclick =  (event) => {
            event.preventDefault();
            // Get the id from the outer A tag
            const productCard = button.parentNode.parentNode.parentNode;
            bikeId = productCard.dataset.id;

            $.ajax({
                type: "DELETE",
                url: `bikes/${bikeId}`
            }).then((res) => {
                // Redirect to cause a page reload 
                window.location = "/admin";
            }).catch((error) => {
                const status = error.status
                const message = error.responseJSON.message ? error.responseJSON.message: "Server rejected changes";
                alert(`${status}: ${message}`);
            })
        }
    }

    
    const scrollCardMap = {};
    const scrollCards = document.getElementsByClassName("scrollToProductCard");
    for (const scrollCard of scrollCards) {
        scrollCardMap[scrollCard.dataset.id] = scrollCard
    }

    for (const topSeller of document.getElementsByClassName("topSellerCard")) {
        topSeller.onclick = () => { 
            closeForm();
            scrollLogic(scrollCardMap[topSeller.dataset.id], 'start'); 
        }  
    }
})()