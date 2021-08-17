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

    let scrollingTo = null
    let scrollTimeout = null;
    
    for (const topSeller of document.getElementsByClassName("topSellerCard")) {
        topSeller.onclick = () => {
            
            if(scrollingTo!= null) {
                scrollingTo.classList.remove("scrollTarget");
                scrollingTo = null;
            }
            if(scrollTimeout != null) {
                clearTimeout(scrollTimeout);
                scrollTimeout = null;
            }

            const scrollTarget = scrollCardMap[topSeller.dataset.id];
            scrollingTo = scrollTarget;
            scrollTarget.classList.add("scrollTarget");
            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start'});
            scrollTimeout = setTimeout(() => { scrollTarget.classList.remove("scrollTarget"); scrollTimeout = null; }, 3000);
        }
    }

})()