$(document).on("turbolinks:load", () => {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
    $("#toggle-theme-color i").removeClass("fe-moon").addClass("fe-sunny-o");
  }

  $("#toggle-theme-color").on("click", (e) => {
    const $this = $(e.currentTarget).find("i");
    const themeActive = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";

    if (themeActive === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }

    if ($this.attr("class").indexOf("fe-moon") != -1) {
      $this.removeClass("fe-moon").addClass("fe-sunny-o");
    } else {
      $this.removeClass("fe-sunny-o").addClass("fe-moon");
    }

    localStorage.setItem("theme", themeActive);
  });

  $(window).on("click", () => {
    if ($("#submenu-items-list").parent().parent().hasClass("active")) {
      $("#submenu-items-list").parent().parent().removeClass("active");
    }
  });

  $("#search-input-text, #submenu-items-list").on("click", (e) => {
    e.stopPropagation();
  });

  $("#search-input-text").on("focusin", (e) => {
    const $target = $(e.target);
    const targetValue = $target.val();

    if (targetValue.length > 0) {
      $("#submenu-items-list").parent().parent().addClass("active");
    }
  });

  $("#search-input-text").on("input", (e) => {
    const $target = $(e.target);
    const targetValue = $target.val().toLowerCase();

    let itemsHtml = "";

    if (targetValue.length >= 2) {
      window.coinsApiData.forEach((data) => {
        if (data.name.toLowerCase().indexOf(targetValue) != -1) {
          itemsHtml += `
            <li>
              <a class="flex items-center px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-5" href="/crypto/${data.id}">
                <img src="https://cryptologos.cc/logos/thumbs/${data.id}.png?v=010" class="object-contain mr-2 h-5 w-5" alt="${data.name}" onerror="this.style.display='none'">
                <p class="text-semibold text-white">${data.name} <span class="opacity-50">${data.symbol}</span></p>
              </a>
            </li>
          `;
        }
      });

      if (itemsHtml.length > 0) {
        $("#submenu-items-list").html(itemsHtml);
      } else {
        $("#submenu-items-list").html(
          "<li class='not-found text-center opacity-50 text-sm'>Nenhum resultado encontrado</li>"
        );
      }

      $("#submenu-items-list").parent().parent().addClass("active");
    } else if (targetValue.length == 0) {
      $("#submenu-items-list").parent().parent().removeClass("active");
    }
  });
});
