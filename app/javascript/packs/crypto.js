$(document).on("turbolinks:load", (e) => {
  const { pathname } = window.location;
  const pathnameArr = pathname.split("/").splice(1);
  const [path, param] = pathnameArr;
  const currHeader = $("#curr-header");
  const currSymbol = $("#curr-symbol");

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  const kFormatter = (num) => {
    return Math.abs(num) > 999
      ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "K"
      : Math.sign(num) * Math.abs(num);
  };

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " anos";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " meses";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " dias";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " horas";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutos";
    }
    return Math.floor(seconds) + " segundos";
  };

  if (path === "crypto") {
    $.ajax({
      url: `https://api.coincap.io/v2/assets/${param}`,
      type: "GET",
      success: ({ data }) => {
        const parseNumber =
          Number(data.changePercent24Hr) < 0
            ? Number(data.changePercent24Hr).toFixed(2) * -1
            : Number(data.changePercent24Hr).toFixed(2);

        const currencySocket = new WebSocket(
          `wss://ws.coincap.io/prices?assets=${data.id}`
        );

        const parseHtml = `
          <div class="flex items-center gap-5">
            <img src="https://cryptologos.cc/logos/thumbs/${
              data.id
            }.png?v=010" class="object-contain w-14 h-14" alt="${
          data.name
        }" onerror="this.style.display='none'">
          
            <div class="flex flex-col items-start">
              <h2 class="text-3xl font-semibold mb-2">${data.name.toUpperCase()}/DÓLAR AMERICANO</h2>
              <div class="flex items-center gap-2 mb-8">
                <p class="px-2 py-1 rounded-md bg-white bg-opacity-5 text-white text-opacity-60 text-sm">${
                  data.symbol
                }/USD</p>
                <p class="px-2 py-1 rounded-md bg-white bg-opacity-5 text-white text-opacity-60 text-sm">Classificação #${
                  data.rank
                }</p>
              </div>
              <div class="flex items-center gap-3 h-12">
                <a class="flex items-center curr-button px-6 h-full rounded-md cursor-pointer">Negocie agora</a>
                <a class="flex items-center curr-button px-6 h-full rounded-md cursor-pointer"><i class="fe fe-heart-o text-2xl"></i></a>
              </div>
            </div>
          </div>

          <div class="flex items-end flex-col">
            <p class="text-xs mb-2 opacity-60">Preço de ${data.name} (${
          data.symbol
        })</p>
            <h1 id="price-value" class="text-4xl font-bold mb-2">${formatter.format(
              data.priceUsd
            )}</h1>
            <div class="flex items-center gap-4 mb-4">
              <p class="text-md opacity-60">24h</p>
              <span class="price-change flex items-center text-md py-1 px-3 font-semibold rounded-md ${
                Number(data.changePercent24Hr) < 0
                  ? "bg-red-500 down"
                  : "bg-green-500 up"
              }"><i class="triangle mr-1"></i>${parseNumber}</span>
            </div>
            <div class="flex items-start gap-8">
              <div class="flex flex-col items-start">
                <h1 class="text-semibold text-lg">${kFormatter(
                  parseInt(data.marketCapUsd)
                )}</h1>
                <p class="text-white text-opacity-60 text-sm">CAP. DE MERCADO</p>
              </div>

              <div class="flex flex-col items-start">
                <h1 class="text-semibold text-lg">${kFormatter(
                  parseInt(data.volumeUsd24Hr)
                )}</h1>
                <p class="text-white text-opacity-60 text-sm">VOLUME 24H</p>
              </div>

              <div class="flex flex-col items-start">
                <h1 class="text-semibold text-lg">${kFormatter(
                  parseInt(data.supply)
                )}</h1>
                <p class="text-white text-opacity-60 text-sm">FORNECIMENTO</p>
              </div>

              <div class="flex flex-col items-start">
                <h1 class="text-semibold text-lg">${kFormatter(
                  parseInt(data.vwap24Hr)
                )}</h1>
                <p class="text-white text-opacity-60 text-sm">VWAP 24H</p>
              </div>
            </div>
          </div>
        `;

        currHeader.html(parseHtml);
        currSymbol.html(data.name);

        currencySocket.onopen = () => {
          console.log("Currency socket opened");
        };

        currencySocket.onmessage = (response) => {
          const parseData = JSON.parse(response.data);

          $("#price-value").html(formatter.format(parseData[data.id]));
        };

        window.currencySocket = currencySocket;
      },
      error: () => (window.location.href = "/404"),
    });
  } else {
    if (window.currencySocket) window.currencySocket.close();
  }

  $("#header-nav ul li").on("click", (e) => {
    const $el = $(e.target);
    const reference = $el.attr("refer");

    let contentHtml = "";

    $("#currency-content-display").html("");

    switch (reference) {
      case "default":
        break;
      case "news":
        $.ajax({
          url: `https://api.coinmarketcap.com/data-api/v3/headlines/coinPage/news/slug?slug=${param}&size=5&page=1`,
          success: (response) => {
            response.data.forEach((news) => {
              const releaseDate = new Date(news.createdAt).getTime();

              contentHtml += `
                <article class="bg-white bg-opacity-0 hover:bg-opacity-5 p-4 rounded-md transition ease">
                  <a class="grid grid-cols-12 gap-4" href="${
                    news.meta.sourceUrl
                  }" target="_blank" rel="noopener noreferrer">
                    <div class="col-span-3 w-full h-40">
                      <img class="w-full h-full rounded-md object-cover" src="${
                        news.cover
                      }" alt="${
                news.meta.title
              }" onerror="this.onerror=null;this.src='/images/image_alt.png'"/>
                    </div>

                    <div class="col-span-9 flex flex-col gap-1">
                      <h1 class="text-lg font-semibold">${
                        news.meta.title
                      } <i class="fe fe-link-external text-white text-opacity-40 ml-2"></i></h1>
                      <p class="text-base text-white text-opacity-60">${
                        news.meta.subtitle
                      }</p>
                      <div class="flex items-center gap-6">
                        <span class="text-white text-opacity-60 text-sm">${
                          news.meta.sourceName
                        }</span>
                        <span class="text-white text-opacity-60 text-sm">${timeSince(
                          releaseDate
                        )} atrás</span>
                        ${news.assets.map(
                          (asset) =>
                            `<span class="flex items-center text-sm text-white text-opacity-60 bg-white bg-opacity-5 p-2 rounded-full gap-1">
                            <img src="${asset.logo}" class="object-contain w-4 h-4 rounded-full" alt="${asset.name}" onerror="this.style.display='none'">

                            ${asset.name}
                          </span>`
                        )}
                      </div>
                    </div>
                  </a>
                </article>
              `;

              $("#currency-content-display").html(contentHtml);
            });
          },
          error: () => {
            $("#currency-content-display").html(
              `<p class="text-white text-opacity-60 text-sm">Nenhuma notícia encontrada para essa moeda</p>`
            );
          },
        });
        break;
      case "markets":
        break;
    }

    $("#header-nav ul li").removeClass("selected");
    $el.addClass("selected");
  });
});
