// para o funcionamento da barra de pesquisa, faço um primeiro request para pegar os dados de todas as moedas existentes na api
$.ajax({
  url: "https://api.coincap.io/v2/assets?limit=500",
  method: "GET",
  success: (response) => {
    window.coinsApiData = response.data;
  },
});

$(document).on("turbolinks:load", () => {
  $(window).on("scroll", (e) => {
    const $window = $(e.target);
    const currentScrollPosition = $(window).scrollTop();
    const toTopButton = $("#scroll-top-button");

    if (currentScrollPosition >= 500) {
      if (!toTopButton.hasClass("active")) {
        toTopButton.addClass("active");
      }
    } else {
      if (toTopButton.hasClass("active")) {
        toTopButton.removeClass("active");
      }
    }
  });

  $("#scroll-top-button").on("click", () => {
    $("html, body").animate({ scrollTop: 0 }, "fast");
  });
});
