// para o funcionamento da barra de pesquisa, faço um primeiro request para pegar os dados de todas as moedas existentes na api
$.ajax({
  url: "https://api.coincap.io/v2/assets?limit=500",
  method: "GET",
  success: (response) => {
    window.coinsApiData = response.data;
  },
});

$(document).on("turbolinks:load", () => {});
