"strict mode";
const toggleBtn = document.getElementById("checkbox-theme");
const body = document.querySelector("body");
const moonIcon = document.querySelector("#moon-icon");

toggleBtn.addEventListener("change", (e) => {
  e.target.checked ? setTheme("dark") : setTheme("light");
});

const setTheme = function (theme) {
  body.classList = [];
  body.classList.add(theme);
  localStorage.setItem("theme", theme);
  moonIcon.setAttribute("stroke", "var(--clr-toggle-bg)");
};

const getPreferredThemeFromOS = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// when the prefers-color-scheme changes, this event will be emitted
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (event) => {
    event.matches ? toggleBtn.click() : toggleBtn.click();
  });

function init() {
  const theme = localStorage.getItem("theme") || getPreferredThemeFromOS();
  setTheme(theme);
  toggleBtn.checked = theme === "dark";
}

init();
