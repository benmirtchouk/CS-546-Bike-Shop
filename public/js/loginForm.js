( () => {
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
            const foo = tabCollection.offsetHeight;
        }
    };


})()