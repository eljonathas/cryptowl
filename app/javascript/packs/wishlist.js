$(document).on("turbolinks:load", () => {
  const { pathname } = window.location;

  if (pathname === "/wishlist") {
    // loads wishlist from localstorage
    const getWishlist = localStorage.getItem("wishlist");
    const wishlistContainer = $(".wishlist-page");
    const renderEmptyWishlist = (container) => {
      container.html(`
        <div class="empty-wishlist flex flex-col flex-1 justify-center items-center mt-12">
          <div class="flex flex-col items-center m-auto">
            <i class="fe fe-heart text-9xl text-white text-opacity-60"></i>
            <p class="text-white text-opacity-60 font-semibold">Lista de desejos vazia :(</p>
            <p class="text-white text-opacity-60 font-normal text-sm">Suas criptomoedas aparecerão aqui</p>
          </div>
        </div>
      `);
    };

    if (JSON.parse(getWishlist).length || 0) {
      let cardsHtml = "";

      const wishlistJson = JSON.parse(getWishlist);

      wishlistJson.forEach((crypto) => {
        cardsHtml += `
          <article class="crypto-card flex flex-col gap-4 col-span-3 rounded-md">
            <a href="/crypto/${crypto.id}" class="flex items-center justify-between p-4">
              <div class="flex items-center">
                <img src="${crypto.logo}" class="w-6 h-6 rounded-full mr-2"/>

                <div class="flex flex-col">
                  <p class="text-white text-opacity-50 text-xs">${crypto.symbol}</p>
                  <h1 class="text-white font-semibold">${crypto.name}</h1>
                </div>
              </div>

              <i crypto-id="${crypto.id}" class="wishlist-remove fe fe-heart text-3xl cursor-pointer text-white text-opacity-40 z-50"></i>
            </a>
          </article>
        `;
      });

      wishlistContainer.html(`
        <h1 class="mb-4 text-white text-opacity-60">Lista de desejos</h1>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          ${cardsHtml}
        </div>
      `);
    } else {
      // if wishlist does not exist, render the empty container reference
      renderEmptyWishlist(wishlistContainer);
    }

    $(document).on("click", ".wishlist-remove", (e) => {
      e.stopPropagation();
      e.preventDefault();

      const $el = $(e.target);
      const cryptoId = $el.attr("crypto-id");
      const wishlist = localStorage.getItem("wishlist");
      const wishlistJson = JSON.parse(wishlist);

      localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlistJson.filter((crypto) => crypto.id != cryptoId))
      );

      $el.parent().parent().remove();

      if (!JSON.parse(localStorage.getItem("wishlist")).length) {
        renderEmptyWishlist(wishlistContainer);
      }
    });
  }
});
