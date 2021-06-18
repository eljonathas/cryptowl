var activeSessions = [];

$(document).on("turbolinks:load", () => {
  var currentOffset = 0;

  const { pathname } = window.location;

  const coins_table = $("#table-content");

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  /**
   * @function getCryptoData() retorna uma promise que faz a captura dos dados na API para renderizar na tela
   */
  function getCryptoData() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url:
          "https://api.coincap.io/v2/assets?limit=50&offset=" +
          50 * currentOffset,
        error: () => {
          reject(new Error());
        },
        success: (resonse) => {
          var generated_html = "";

          resonse.data.forEach((data) => {
            generated_html += `
            <tr data-id="${data.id}" row-reference="${data.id}">
              <td>${data.rank}</td>
              <td class="crypto-name">
                <a href="/crypto/${data.id}">${data.name} (${data.symbol})</a>
              </td>
              <td class="crypto-price" double-price="${
                data.priceUsd
              }">${formatter.format(data.priceUsd)}</td>
              <td class="price price-${
                Number(data.changePercent24Hr).toFixed(2) < 0 ? "down" : "up"
              }">${
              Number(data.changePercent24Hr) < 0
                ? Number(data.changePercent24Hr).toFixed(2) * -1
                : Number(data.changePercent24Hr).toFixed(2)
            }%</td>
              <td>${formatter.format(parseInt(data.marketCapUsd))}</td>
              <td>${
                data.vwap24Hr
                  ? formatter.format(parseInt(data.vwap24Hr))
                  : "Indisponível"
              }</td>
              <td>${formatter.format(parseInt(data.supply))}</td>
              </tr>
              `;
          });

          $("#table-loading").attr("class", "hidden");
          $("#table-content").attr("class", "visible");

          coins_table.html(generated_html);

          resolve(true);

          // timeout for content animation
          setTimeout(() => {
            coins_table.find("tr").addClass("loaded");
          }, 100);
        },
      });
    });
  }

  /**
   * A função @function loadCoinsSocket() faz a conexão com o WebSocket fornecido pela API para renderizar as informações em tela
   */
  function loadCoinsSocket() {
    const coinsSocket = new WebSocket("wss://ws.coincap.io/prices?assets=ALL");

    coinsSocket.onopen = () => {
      getCryptoData();
      activeSessions.push(coinsSocket);

      console.log("WebSocket opened");
    };

    coinsSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const dataKeys = Object.keys(data);

      dataKeys.forEach((value) => {
        const cryptoRef = $(`[data-id="${value}"] .crypto-price`);
        const latestCryptoRefValue = Number(cryptoRef.attr("double-price"));
        const newValue = Number(data[value]);
        const animateTag =
          newValue > latestCryptoRefValue ? "price-isup" : "price-isdown";

        cryptoRef
          .attr("class", `crypto-price ${animateTag}`)
          .attr("double-price", newValue)
          .html(formatter.format(newValue));
      });
    };

    coinsSocket.onclose = () => {
      if (window.location.pathname === "/coins") {
        loadCoinsSocket();
      }
    };
  }

  if (pathname === "/coins") {
    loadCoinsSocket();

    // update all data every 50 seconds
    window.cryptoRefresh = setInterval(getCryptoData, 50000);
  } else {
    if (activeSessions.length) {
      activeSessions.forEach((wsocket) => {
        wsocket.close();
      });

      activeSessions = [];
    }

    clearInterval(window.cryptoRefresh);
  }

  $("#pagination_values ul li").on("click", (e) => {
    const $this = $(e.target);
    const thisOffset = $this.attr("page-offset");

    if (!$this.hasClass("active")) {
      currentOffset = thisOffset;

      $("#table-loading").attr("class", "visible");
      $("#table-content").attr("class", "hidden");

      $("#pagination_values ul li").removeClass("active");
      $this.addClass("active");

      getCryptoData();
    }
  });
});
