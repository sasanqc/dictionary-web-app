"strict mode";
const toggleBtn = document.getElementById("checkbox-theme");
const body = document.querySelector("body");
const moonIcon = document.querySelector("#moon-icon");
const selectCurrent = document.querySelector(".select__current");
const selectOption = document.querySelector(".select__options");
const invalidText = document.querySelector(".search-bar__invalid-text");
const searchBtn = document.querySelector(".search-bar__icon");
const searchInput = document.querySelector(".search-bar__input");
const resultContainer = document.querySelector(".result");
const meaningsContainer = document.querySelector(".meanings");
const sourceContainer = document.querySelector(".source");
const notFoundContainer = document.querySelector(".not-found");
const animatedLoading = document.querySelector(".animated-loading");
// select ===================================================
const options = [
  { property: "var(--font-sans-serif)", label: "Sans Serif" },
  { property: "var(--font-serif)", label: "Serif" },
  { property: "var(--font-mono)", label: "Mono" },
];

selectCurrent.addEventListener("click", () => {
  selectOption.classList.add("select__options--open");
});

selectOption.addEventListener("click", (event) => {
  const selectedOption = 1 * event.target.getAttribute("value");
  body.style.fontFamily = options[selectedOption].property;
  selectCurrent.textContent = options[selectedOption].label;
  selectOption.classList.remove("select__options--open");
});

window.addEventListener("click", (event) => {
  if (
    !selectOption.contains(event.target) &&
    !selectCurrent.contains(event.target)
  ) {
    selectOption.classList.remove("select__options--open");
  }
});

// theme goggling =====================================================
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

//handle search key==================================================
searchBtn.addEventListener("click", async () => {
  console.log("i: ", searchInput.value);
  //clear previous word result
  clearWordSearch();

  //validation check
  if (!searchInput.value) {
    searchInput.classList.add("search-bar__input--invalid");
    invalidText.classList.add("search-bar__invalid-text--visible");
    return;
  }

  try {
    animatedLoading.classList.add("animated-loading--visible");
    const data = await getWordFromAPI(searchInput.value);

    renderResult(data);

    data.meanings.forEach((meaning) => {
      reanderMeaning(meaning);
    });
    const synonymsContainer = [
      ...meaningsContainer.querySelectorAll(".synonyms__words"),
    ];

    synonymsContainer.forEach((el) =>
      el.addEventListener("click", (event) => {
        searchInput.value = event.target.textContent;
        searchBtn.click();
      })
    );

    // add a divider after meanings
    meaningsContainer.insertAdjacentHTML(
      "beforeend",
      /*html*/ `<div class="meaning__divider"></div>`
    );

    renderSource(data.sourceUrls[0]);
  } catch (error) {
    if (error.status === 404) {
      renderNotFound(error);
    }
  } finally {
    animatedLoading.classList.remove("animated-loading--visible");
  }
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Enter" && searchInput === document.activeElement) {
    searchBtn.click();
  }
});
//get data from API==================================================
const getWordFromAPI = async function (word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await response.json();
    if (response.status === 404) {
      data.status = 404;
      throw data;
    }
    return data[0];
  } catch (error) {
    throw error;
  }
};

init();

const renderResult = function (data) {
  const phonetic =
    data.phonetic || data.phonetics.map((el) => el.text).filter((el) => el)[0];

  const audio = new Audio(
    data.phonetics.map((el) => el.audio).filter((el) => el)[0]
  );

  const resultHtml = /*html*/ `
        <div class="result__text-box">
          <h1 class="heading-xl">${data.word}</h1>
          <p class="heading-m result__phonetic">${phonetic}</p>
        </div>
        <img src="./assets/images/icon-play.svg" alt="" class="result__icon" />        
  `;

  resultContainer.insertAdjacentHTML("beforeend", resultHtml);

  const resultIcon = resultContainer.querySelector(".result__icon");

  resultIcon.addEventListener("mouseover", () => {
    resultIcon.src = "./assets/images/icon-play-hover.svg";
  });

  resultIcon.addEventListener("mouseout", () => {
    resultIcon.src = "./assets/images/icon-play.svg";
  });

  resultIcon.addEventListener("click", () => {
    audio.currentTime = 0;
    audio.play();
  });
};

function reanderMeaning({ partOfSpeech, definitions, synonyms }) {
  const definitionsHtml = definitions
    .map(
      (el) =>
        `<li class="meaning__item">${el.definition}</li> ${
          el.example
            ? `<li class="meaning__item meaning__item--sample">${el.example}</li>`
            : ``
        }`
    )
    .join("");

  const meaningHtml = /*html*/ `
     <li class="meaning">
      <div class="meaning__header">
        <p class="heading-m meaning__type">${partOfSpeech}</p>
        <div class="meaning__divider"></div>
      </div>
      <div class="meaning__description">
        <p class="body-l meaning__title">Meaning</p>
        <ul class="meaning__items">
          ${definitionsHtml}
        </ul>
      </div>
      ${
        synonyms.length > 0
          ? /*html*/ `<div class="synonyms">
            <p class="body-l synonyms__title">Synonyms</p>
            <div class="synonyms__words">
              ${synonyms
                .map((el) => `<p class="body-lb synonyms__word">${el}</p>`)
                .join("")}
            </div>
          </div>`
          : ``
      }
    </li>
    
  `;

  meaningsContainer.insertAdjacentHTML("beforeend", meaningHtml);
}

function renderNotFound(error) {
  notFoundContainer.style.display = "block";
  const notFoundHtml = /*html */ `<p class="not-found__emoji">😕</p>
  <h1 class="heading-sb not-found__title">${error.title}</h1>
  <p class="body-m not-found__error-message">
   ${error.message + error.resolution}
  </p>`;

  notFoundContainer.insertAdjacentHTML("beforeend", notFoundHtml);
}

function renderSource(url) {
  const sourceHtml = /*html*/ `
  <a
      href="${url}"
      class="body-s source__link"
      >Source</a
    >
    <a
    href="${url}"
      class="body-s source__link--full"
      >${url}</a
    >
    <a href="${url}">
      <img
        src="./assets/images/icon-new-window.svg"
        alt=""
        class="source__icon"
      />
    </a> `;
  sourceContainer.insertAdjacentHTML("beforeend", sourceHtml);
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function clearWordSearch() {
  [
    resultContainer,
    meaningsContainer,
    sourceContainer,
    notFoundContainer,
  ].forEach((el) => removeAllChildNodes(el));
}
