( () => {

    for(const button of document.getElementsByClassName('productEditButton')) {
        button.onclick =  () => {
            alert("STUB: Will redirect to product page");
        }
    }

    for(const button of document.getElementsByClassName('productRemoveButton')) {
        button.onclick =  () => {
            alert("STUB: Will send delete to server");
        }
    }

    
    const scrollCardMap = {};
    const scrollCards = document.getElementsByClassName("scrollToProductCard");
    for (const scrollCard of scrollCards) {
        scrollCardMap[scrollCard.dataset.id] = scrollCard
    }
    
    for (const topSeller of document.getElementsByClassName("topSellerCard")) {
        topSeller.onclick = () => {
            const scrollTarget = scrollCardMap[topSeller.dataset.id];
            scrollTarget.classList.add("scrollTarget");
            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start'});
            setTimeout(() => { scrollTarget.classList.remove("scrollTarget") }, 3000);
        }
    }

})()