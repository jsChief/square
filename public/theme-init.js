// Applies saved appearance settings before first paint to avoid a flash.
(function () {
  try {
    var savedTheme = localStorage.getItem("square-theme");
    if (
      ["forest", "ocean", "ember", "plum", "slate"].indexOf(savedTheme) > -1
    ) {
      document.documentElement.dataset.theme = savedTheme;
    }

    var savedMode = localStorage.getItem("square-mode");
    var mode =
      savedMode === "light" || savedMode === "dark"
        ? savedMode
        : window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.dataset.mode = mode;
  } catch {
    document.documentElement.dataset.mode = "light";
  }
})();
