let pageIndex = 1;

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

  const numberFormatter = (num) => {
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

  const prefetchNewsData = (page) => {
    return new Promise((resolve, reject) => {
      // prefetch news data
      $.ajax({
        url: `https://api.coinmarketcap.com/data-api/v3/headlines/coinPage/news/slug?slug=${param}&size=5&page=${page}`,
        success: (response) => {
          resolve(response.data);
        },
        error: () => reject(new Error()),
      });
    });
  };

  const renderNewsContent = (newsArr) => {
    let contentHtml = "";

    if (newsArr.length) {
      newsArr.forEach((news) => {
        const releaseDate = new Date(news.createdAt).getTime();

        contentHtml += `
          <article class="bg-white bg-opacity-0 md:hover:bg-opacity-5 md:p-4 rounded-md transition ease">
            <a class="grid grid-cols-1 md:grid-cols-12 md:gap-4" href="${
              news.meta.sourceUrl
            }" target="_blank" rel="noopener noreferrer">
              <div class="col-span-3 w-full h-40 mb-4 md:mb-0">
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
                <div class="flex items-center justify-center md:justify-start gap-6 flex-1 mt-4 md:mt-0">
                  <span class="text-white text-opacity-60 text-sm">${
                    news.meta.sourceName
                  }</span>
                  <span class="text-white text-opacity-60 text-sm">${timeSince(
                    releaseDate
                  )} atrás</span>
                  <span class="flex items-center text-sm text-white text-opacity-60 bg-white bg-opacity-5 px-2 py-1 rounded-full gap-1">
                    <img src="${
                      news.assets[0]?.logo
                        ? news.assets[0]?.logo
                        : "/images/usd_logo.png"
                    }" class="object-contain w-4 h-4 rounded-full" alt="${
          news.assets[0]?.name
        }" onerror="this.style.display='none'">

                    ${news.assets[0]?.name}
                  </span>
                </div>
              </div>
            </a>
          </article>
        `;
      });

      // prevent the tabs fast change conflicts
      if ($("#header-nav ul li.selected").attr("refer") == "news") {
        $("#currency-content-display").append(contentHtml);
      }
    }
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

        const wishlist = localStorage.getItem("wishlist");
        const wishlistJSON = wishlist && JSON.parse(wishlist);
        const verification = wishlistJSON
          ? wishlistJSON.filter((crypto) => crypto.id === data.id)
          : [];

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
                <a href="https://www.binance.com/pt-BR" target="_blank" rel="noopener noreferrer" class="flex items-center curr-button px-6 h-full rounded-md cursor-pointer">Negocie agora</a>
                <span id="wishlist-add-btn" class="flex items-center curr-button px-6 h-full rounded-md cursor-pointer"><i class="fe ${
                  verification.length ? "fe-heart" : "fe-heart-o"
                } text-2xl"></i></span>
              </div>
            </div>
          </div>

          <div class="flex items-start md:items-end flex-col w-full md:w-auto">
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
            <div class="flex flex-col md:flex-row items-start gap-8">
              <div class="flex flex-col items-start">
                <h1 class="text-semibold text-lg">${numberFormatter(
                  parseInt(data.marketCapUsd)
                )}</h1>
                <p class="text-white text-opacity-60 text-sm">CAP. DE MERCADO</p>
              </div>

              <div class="flex flex-col items-start">
                <h1 class="text-semibold text-lg">${numberFormatter(
                  parseInt(data.volumeUsd24Hr)
                )}</h1>
                <p class="text-white text-opacity-60 text-sm">VOLUME 24H</p>
              </div>

              <div class="flex flex-col items-start">
                <h1 class="text-semibold text-lg">${numberFormatter(
                  parseInt(data.supply)
                )}</h1>
                <p class="text-white text-opacity-60 text-sm">FORNECIMENTO</p>
              </div>

              <div class="flex flex-col items-start">
                <h1 class="text-semibold text-lg">${numberFormatter(
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

        // click to load coin data chart information
        $("#header-nav ul li:first-child").trigger("click");

        // load conversor content
        $("#currency-conversor").html(`
          <h1 class="mb-2 text-white text-opacity-40 font-semibold">Conversor de valores</h1>
          <article class="flex flex-col gap-2 p-1 rounded-lg">
            <div class="bg-black bg-opacity-20 p-3 flex items-center justify-between rounded-md">
              <div class="flex items-center gap-3">
                <img src="https://cryptologos.cc/logos/thumbs/${data.id}.png?v=010" class="object-contain w-6 h-6" alt="${data.name}" onerror="this.style.display='none'">

                <div class="flex flex-col">
                  <p class="text-xs text-white text-opacity-40">${data.symbol}</p>
                  <h1>${data.name}</h1>
                </div>
              </div>

              <input refer="crypto" current-price="${data.priceUsd}" type="text" class="input-currency bg-transparent text-white text-right ml-4 flex-1 outline-none font-semibold text-lg truncate" placeholder="0"/>
            </div>
            <div class="p-3 flex items-center justify-between rounded-md">
              <div class="flex items-center gap-3">
                <img src="/images/usd_logo.png" class="object-contain w-6 h-6" alt="USD" onerror="this.style.display='none'">

                <div class="flex flex-col">
                  <p class="text-xs text-white text-opacity-40">USD</p>
                  <h1>United States Dolar</h1>
                </div>
              </div>

              <input refer="usd" type="text" class="input-currency bg-transparent text-white text-right ml-4 flex-1 outline-none font-semibold text-lg truncate" placeholder="0" />
            </div>
          </article>
        `);

        // create event listener for wishlist add button
        $("#wishlist-add-btn").on("click", (e) => {
          const $elIcon = $("#wishlist-add-btn i");
          const getWishlist = localStorage.getItem("wishlist");
          const cryptoData = {
            id: data.id,
            name: data.name,
            symbol: data.symbol,
            logo: `https://cryptologos.cc/logos/thumbs/${data.id}.png`,
          };

          if (getWishlist) {
            const wishlistJson = JSON.parse(getWishlist);
            const verification = wishlistJson.filter(
              (crypto) => crypto.id === data.id
            );

            if (!verification.length) {
              wishlistJson.push(cryptoData);
              localStorage.setItem("wishlist", JSON.stringify(wishlistJson));

              $elIcon.removeClass("fe-heart-o").addClass("fe-heart");
            } else {
              const newWishlist = wishlistJson.filter(
                (crypto) => crypto.id != data.id
              );
              localStorage.setItem("wishlist", JSON.stringify(newWishlist));
              $elIcon.removeClass("fe-heart").addClass("fe-heart-o");
            }
          } else {
            localStorage.setItem("wishlist", JSON.stringify([cryptoData]));
          }
        });
      },
      error: () => (window.location.href = "/404"),
    });
  } else {
    if (window.currencySocket) window.currencySocket.close();
  }

  // value conversor
  $(document).on("input", "input.input-currency", (e) => {
    const inputValue = Number($(e.target).val());
    const reference = $(e.target).attr("refer");
    const cryptoInput = $(document).find(
      'input.input-currency[refer="crypto"]'
    );
    const currentPrice = Number(cryptoInput.attr("current-price"));

    if (reference == "usd") {
      cryptoInput.val(inputValue / currentPrice);
    } else if (reference == "crypto") {
      const usdInput = $(document).find('input.input-currency[refer="usd"]');

      usdInput.val(inputValue * currentPrice);
    }
  });

  $("#header-nav ul li").on("click", (e) => {
    const $el = $(e.target);
    const reference = $el.attr("refer");

    $("#currency-content-display").html("");
    $("#dynamic-content-column").html("");

    switch (reference) {
      case "default":
        // first, add the relative content html
        $("#currency-content-display").html(`
          <div class="flex flex-col relative">
            <div id="crypto-chart-loader" class="flex flex-col items-center gap-1 w-full h-full justify-center rounded-md bg-black bg-opacity-20 absolute z-50">
              <div class="flex items-center">
                <svg class="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h1>Carregando dados...</h1>
              </div>
              <p class="text-white opacity-60 text-center">Aguarde enquanto as informações <br/> são inseridas no gráfico.</p>
            </div>

            <canvas id="crypto-chart" refer="${param}" width="600" height="400"></canvas>
          </div>
        `);

        // after, get the canvas context and create a new chart
        const cryptoChartContext = $(document)
          .find("#crypto-chart")[0]
          .getContext("2d");

        // later, call the crypto api for get their data
        $.ajax({
          url: `https://api.coincap.io/v2/assets/${param}/history`,
          method: "GET",
          data: {
            interval: "d1",
          },
          success: (response) => {
            const { data } = response;
            const prices = data.map((obj) => obj.priceUsd);
            const times = data.map((obj) => {
              const parseDate = new Date(obj.date);

              return parseDate.getFullYear();
            });

            const cryptoChart = new Chart(cryptoChartContext, {
              type: "line",
              data: {
                labels: times,
                datasets: [
                  {
                    label: "$",
                    data: prices,
                    backgroundColor: "rgba(95, 133, 219, 1)",
                    borderColor: "rgba(95, 133, 219, 1)",
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHitRadius: 10,
                    lineTension: 0.2,
                  },
                ],
              },
              options: {
                legend: {
                  display: false,
                },
              },
            });

            $("#crypto-chart-loader").hide();
          },
        });

        prefetchNewsData(1).then((newsArr) => {
          let contentHtml = "";

          newsArr.forEach((news) => {
            contentHtml += `
              <article class="w-full rounded-md">
                <a href="${news.meta.sourceUrl}" class="flex p-4" target="_blank" rel="noopener noreferrer">
                  <h1>${news.meta.title} <i class="fe fe-link-external text-white text-opacity-40 ml-2"></i></h1>
                </a>
              </article>
            `;
          });

          // now, load the right bar content
          $("#dynamic-content-column").html(`
            <section class="flex flex-col gap-1">
              <h1 class="mb-2 text-white text-opacity-40 font-semibold">Notícias recentes</h1>
              <div class="flex flex-col gap-2">
                ${contentHtml}
              </div>
            </section>
          `);
        });
        break;
      case "news":
        pageIndex = 1;

        // add content loading before render
        $("#currency-content-display").html(`
          <div class="w-full h-40 bg-white bg-opacity-5 animate-pulse rounded-md"></div>
          <div class="w-full h-40 bg-white bg-opacity-5 animate-pulse rounded-md"></div>
          <div class="w-full h-40 bg-white bg-opacity-5 animate-pulse rounded-md"></div>
          <div class="w-full h-40 bg-white bg-opacity-5 animate-pulse rounded-md"></div>
          <div class="w-full h-40 bg-white bg-opacity-5 animate-pulse rounded-md"></div>
          <div class="w-full h-40 bg-white bg-opacity-5 animate-pulse rounded-md"></div>
          <div class="w-full h-40 bg-white bg-opacity-5 animate-pulse rounded-md"></div>
        `);

        prefetchNewsData(pageIndex).then((newsArr) => {
          // clear loading content before render
          $("#currency-content-display").html("");

          // solve conflicts of the fast tabs change
          renderNewsContent(newsArr);
        });
        break;
      case "markets":
        break;
    }

    $("#header-nav ul li").removeClass("selected");
    $el.addClass("selected");
  });

  // enable infinite scroll for news content
  $(window).on("scroll", (e) => {
    const selectedContent = $("#header-nav ul li.selected");
    const selectedContentRefer = selectedContent.attr("refer");

    if (selectedContentRefer == "news") {
      const currentScrollPosition = $(window).scrollTop() + $(window).height();

      if (currentScrollPosition >= $(document).height() - 10) {
        pageIndex += 1;

        prefetchNewsData(pageIndex).then((newsArr) => {
          renderNewsContent(newsArr);
        });
      }
    }
  });
});
