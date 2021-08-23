const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

// For ID-based price tags
if (document.getElementById('price'))
    document.getElementById('price').innerHTML = priceFormatter.format(parseInt(document.getElementById('price').innerHTML, 10));

// For Class-based price tags
if (document.getElementsByClassName('price')) {
    const priceTags = document.getElementsByClassName('price')
    for (let i = 0; i < priceTags.length; i++)
        priceTags[i].innerHTML = priceFormatter.format(parseInt(priceTags[i].innerHTML, 10));
}
