/* cart.js — Chalet 42 shared cart manager
 * Relies on localStorage. No external dependencies.
 * Exposes window.Cart for use across pages.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'chalet42_cart';

    var Cart = {
        getItems: function () {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            } catch (_) {
                return [];
            }
        },

        _save: function (items) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            Cart._updateNavCount();
        },

        add: function (product) {
            /* product: { id, name, price (cents), image, priceId } */
            var items = Cart.getItems();
            var existing = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === product.id) { existing = items[i]; break; }
            }
            if (existing) {
                existing.qty += 1;
            } else {
                items.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    priceId: product.priceId || '',
                    qty: 1
                });
            }
            Cart._save(items);
        },

        remove: function (productId) {
            var items = Cart.getItems().filter(function (i) { return i.id !== productId; });
            Cart._save(items);
        },

        setQty: function (productId, qty) {
            var n = parseInt(qty, 10);
            if (isNaN(n) || n < 1) { n = 1; }
            var items = Cart.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === productId) { items[i].qty = n; break; }
            }
            Cart._save(items);
        },

        getCount: function () {
            return Cart.getItems().reduce(function (sum, i) { return sum + i.qty; }, 0);
        },

        getTotal: function () {
            return Cart.getItems().reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
        },

        clear: function () {
            localStorage.removeItem(STORAGE_KEY);
            Cart._updateNavCount();
        },

        _updateNavCount: function () {
            var count = Cart.getCount();
            var badges = document.querySelectorAll('.cart-count');
            for (var i = 0; i < badges.length; i++) {
                badges[i].textContent = count;
                badges[i].hidden = count === 0;
            }
        }
    };

    /* Wire up "Add to Cart" buttons on page load */
    document.addEventListener('DOMContentLoaded', function () {
        Cart._updateNavCount();

        var buttons = document.querySelectorAll('.btn-add-to-cart');
        for (var i = 0; i < buttons.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    Cart.add({
                        id: btn.dataset.productId,
                        name: btn.dataset.productName,
                        price: parseInt(btn.dataset.productPrice, 10),
                        image: btn.dataset.productImage,
                        priceId: btn.dataset.stripePriceId || ''
                    });
                    var original = btn.textContent;
                    btn.textContent = 'Added!';
                    btn.disabled = true;
                    setTimeout(function () {
                        btn.textContent = original;
                        btn.disabled = false;
                    }, 1500);
                });
            })(buttons[i]);
        }
    });

    window.Cart = Cart;
})();
