const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});
document.getElementById('product-price').innerHTML = priceFormatter.format(parseInt(document.getElementById('product-price').innerHTML, 10));