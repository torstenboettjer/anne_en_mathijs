(() => {
  // ns-hugo-imp:/home/torsten/Repository/anne_en_mathijs/themes/alpha/assets/alpha/liva/js/modules/constants.js
  var LivaPositions = {
    BOTTOM_LEFT: "liva-bottom-left",
    BOTTOM_RIGHT: "liva-bottom-right"
  };
  var LivaStates = {
    HIDDEN: "liva-hidden",
    ERROR: "liva-fab-error"
  };
  var ApiUrls = {
    HUGO_VERSION: "https://api.github.com/repos/gohugoio/hugo/tags",
    THEME_VERSION: "https://api.github.com/repos/oxypteros/alpha/tags"
  };
  var DocUrls = {
    ALPHA_UPDATE: "https://alpha.oxypteros.com/update",
    HUGO_UPDATE: "https://alpha.oxypteros.com/hugo/update"
  };
  var StorageKeys = {
    ERROR_LIST: "liva-error-list",
    FAB_POSITION: "liva-pos"
  };

  // ns-hugo-imp:/home/torsten/Repository/anne_en_mathijs/themes/alpha/assets/alpha/liva/js/modules/error-tracker.js
  var currentPage = window.location.href;
  var onErrorsUpdatedCallback = () => {
  };
  var updateLocalStorage = () => {
    const errorElements = document.querySelectorAll("[data-error]");
    let errorData = JSON.parse(localStorage.getItem(StorageKeys.ERROR_LIST)) || {};
    if (errorElements.length > 0) {
      errorData[currentPage] = [...errorElements].map((el) => el.dataset.error);
    } else {
      delete errorData[currentPage];
    }
    localStorage.setItem(StorageKeys.ERROR_LIST, JSON.stringify(errorData));
    console.log("Updated error list:", errorData);
    onErrorsUpdatedCallback();
  };
  function initializeErrorTracking(callback) {
    if (typeof callback === "function") {
      onErrorsUpdatedCallback = callback;
    }
    const observer = new MutationObserver(updateLocalStorage);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-error"]
    });
    window.addEventListener("storage", (event) => {
      if (event.key === StorageKeys.ERROR_LIST) {
        console.log("LocalStorage changed in another tab.");
        onErrorsUpdatedCallback();
      }
    });
    updateLocalStorage();
  }

  // ns-hugo-imp:/home/torsten/Repository/anne_en_mathijs/themes/alpha/assets/alpha/liva/js/modules/dom.js
  var livaContainer = document.querySelector('[data-alpha="liva-container"]');
  var livaConsoleContainer = document.querySelector('[data-alpha="liva-console-container"]');
  var livaConsoleContent = document.querySelector('[data-alpha="liva-console-content"]');
  var livaFab = document.querySelector('[data-alpha="liva-fab-button"]');
  var livaSettings = document.querySelector('[data-alpha="liva-settings"]');
  var livaSettingsCloseBtn = document.querySelector('[data-alpha="liva-close-settings"]');
  var selectPositionElement = document.querySelector('[data-alpha="liva-select-position"]');
  var livaOpenConsoleBtn = document.querySelector('[data-alpha="liva-open-console-button"]');
  var livaUpdateBtn = document.querySelector('[data-alpha="liva-updates-button"]');
  var livaConsole = document.querySelector('[data-alpha="liva-console"]');
  var livaConsoleCloseBtn = document.querySelector('[data-alpha="liva-close-console"]');
  var livaConsoleHelpBtn = document.querySelector('[data-alpha="liva-console-help-button"]');
  var livaConsoleResetBtn = document.querySelector(
    '[data-alpha="liva-console-reset-button"]'
  );
  var localAlphaVersionEl = document.querySelector('[data-alpha="local-alpha-version"]');
  var localHugoVersionEl = document.querySelector('[data-alpha="local-hugo-version"]');
  var alphaBadge = document.querySelector('[data-alpha="liva-alpha-update-badge"]');
  var hugoBadge = document.querySelector('[data-alpha="liva-hugo-update-badge"]');

  // ns-hugo-imp:/home/torsten/Repository/anne_en_mathijs/themes/alpha/assets/alpha/liva/js/modules/fab-controller.js
  function restoreFabPosition() {
    const fabPosition = localStorage.getItem(StorageKeys.FAB_POSITION);
    if (!fabPosition || !livaContainer) return;
    livaContainer.classList.remove(LivaPositions.BOTTOM_LEFT, LivaPositions.BOTTOM_RIGHT);
    livaContainer.classList.add(fabPosition);
    const optionToSelect = selectPositionElement.querySelector(`option[value="${fabPosition}"]`);
    if (optionToSelect) {
      selectPositionElement.querySelectorAll("option").forEach((opt) => opt.removeAttribute("selected"));
      optionToSelect.setAttribute("selected", "");
      selectPositionElement.value = fabPosition;
    }
  }
  function handlePositionChange() {
    const selectedValue = selectPositionElement.value;
    livaContainer.classList.remove(LivaPositions.BOTTOM_LEFT, LivaPositions.BOTTOM_RIGHT);
    livaContainer.classList.add(selectedValue);
    localStorage.setItem(StorageKeys.FAB_POSITION, selectedValue);
    restoreFabPosition();
  }
  function updateFabState() {
    if (!livaFab) return;
    const errorData = JSON.parse(localStorage.getItem(StorageKeys.ERROR_LIST)) || {};
    const hasErrors = Object.keys(errorData).length > 0;
    if (hasErrors) {
      livaFab.classList.add(LivaStates.ERROR);
    } else {
      livaFab.classList.remove(LivaStates.ERROR);
    }
  }

  // ns-hugo-imp:/home/torsten/Repository/anne_en_mathijs/themes/alpha/assets/alpha/liva/js/modules/update-checker.js
  var localAlphaVersion = localAlphaVersionEl?.textContent || "";
  var localHugoVersion = localHugoVersionEl?.textContent || "";
  var appendLink = (url, title, text, element, badgeEl, badge_class) => {
    element.innerHTML = "";
    const link = Object.assign(document.createElement("a"), {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      title,
      textContent: text
    });
    element.appendChild(link);
    badgeEl.classList.add(badge_class);
  };
  var checkError = (element, title, badgeEl) => {
    element.innerHTML = "Error";
    element.title = title;
    badgeEl.classList.add("liva-check-error");
  };
  var compareAlphaVersion = (remoteVersion) => {
    if (remoteVersion && remoteVersion !== localAlphaVersion) {
      appendLink(
        DocUrls.ALPHA_UPDATE,
        "Update alpha to the latest version",
        remoteVersion,
        localAlphaVersionEl,
        alphaBadge,
        "liva-update"
      );
      appendTemplate(document.querySelector('[data-alpha="liva-alpha-updates-template"]'));
    } else if (remoteVersion) {
      localAlphaVersionEl.title = "You have the latest version";
      alphaBadge.classList.add("liva-no-update");
      appendTemplate(document.querySelector('[data-alpha="liva-no-alpha-updates-template"]'));
    } else {
      checkError(localAlphaVersionEl, "Could not check for alpha updates", alphaBadge);
    }
  };
  var compareHugoVersion = (remoteVersion) => {
    if (remoteVersion && remoteVersion !== localHugoVersion) {
      appendLink(
        DocUrls.HUGO_UPDATE,
        "Update Hugo to the latest version",
        remoteVersion,
        localHugoVersionEl,
        hugoBadge,
        "liva-update"
      );
      appendTemplate(document.querySelector('[data-alpha="liva-hugo-updates-template"]'));
    } else if (remoteVersion) {
      localHugoVersionEl.title = "You have the latest version";
      hugoBadge.classList.add("liva-no-update");
      appendTemplate(document.querySelector('[data-alpha="liva-no-hugo-updates-template"]'));
    } else {
      checkError(localHugoVersionEl, "Could not check for Hugo updates", hugoBadge);
    }
  };
  async function checkUpdates() {
    openConsole();
    try {
      const response = await fetch(ApiUrls.THEME_VERSION);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      compareAlphaVersion(data[0].name);
    } catch (error) {
      console.error("Error fetching Alpha Version URL:", error);
      compareAlphaVersion(null);
    }
    try {
      const response = await fetch(ApiUrls.HUGO_VERSION);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      compareHugoVersion(data[0].name);
    } catch (error) {
      console.error("Error fetching Hugo Version URL:", error);
      compareHugoVersion(null);
    }
  }

  // ns-hugo-imp:/home/torsten/Repository/anne_en_mathijs/themes/alpha/assets/alpha/liva/js/modules/ui-controller.js
  var getTemplateNameForError = (error) => `${error}-template`;
  var appendTemplate = (template) => {
    if (template) {
      livaConsoleContent.appendChild(template.content.cloneNode(true));
    }
  };
  var consoleErrorEntry = (error, url) => {
    const div = document.createElement("div");
    div.className = "liva-console-entry";
    div.textContent = "> ";
    const span = Object.assign(document.createElement("span"), {
      className: "liva-console-code",
      textContent: error
    });
    div.append(span);
    if (url) {
      div.append(
        " - ",
        Object.assign(document.createElement("a"), {
          className: "liva-console-error-link",
          href: url,
          textContent: url
        })
      );
    }
    livaConsoleContent.appendChild(div);
  };
  var showErrors = () => {
    livaConsoleContent.innerHTML = "";
    const storedData = JSON.parse(localStorage.getItem(StorageKeys.ERROR_LIST)) || {};
    const uniqueConfigErrors = /* @__PURE__ */ new Set();
    for (const [pageUrl, errorList] of Object.entries(storedData)) {
      errorList.forEach((error) => {
        const isConfigError = error.startsWith("liva-config-");
        if (!isConfigError || !uniqueConfigErrors.has(error)) {
          consoleErrorEntry(error, pageUrl);
          const templateName = getTemplateNameForError(error);
          const template = document.querySelector(`[data-alpha="${templateName}"]`);
          appendTemplate(template);
          if (isConfigError) uniqueConfigErrors.add(error);
        }
      });
    }
  };
  var showConsoleHelp = () => {
    livaConsoleContent.innerHTML = "";
    appendTemplate(document.querySelector('[data-alpha="liva-help-template"]'));
  };
  var resetConsoleStorage = () => {
    localStorage.removeItem(StorageKeys.ERROR_LIST);
    window.location.reload();
  };
  var closeSettings = () => {
    livaSettings.classList.add(LivaStates.HIDDEN);
    livaSettings.inert = true;
  };
  var openSettings = () => {
    livaSettings.classList.remove(LivaStates.HIDDEN);
    livaSettings.inert = false;
  };
  var closeConsole = () => {
    livaConsoleContainer.classList.add(LivaStates.HIDDEN);
    livaConsoleContainer.inert = true;
    livaConsoleContent.innerHTML = "";
  };
  var openConsole = () => {
    if (!livaSettings.classList.contains(LivaStates.HIDDEN)) closeSettings();
    livaConsoleContainer.classList.remove(LivaStates.HIDDEN);
    livaConsoleContainer.inert = false;
  };
  var toggleConsole = () => {
    if (livaConsoleContainer.classList.contains(LivaStates.HIDDEN)) {
      openConsole();
      showErrors();
    } else {
      closeConsole();
    }
  };
  var handleFabClick = () => {
    if (livaFab.classList.contains(LivaStates.ERROR)) {
      toggleConsole();
    } else {
      livaSettings.classList.contains(LivaStates.HIDDEN) ? openSettings() : closeSettings();
    }
  };
  function initializeUiEventListeners() {
    livaFab?.addEventListener("click", handleFabClick);
    livaSettingsCloseBtn?.addEventListener("click", closeSettings);
    selectPositionElement?.addEventListener("change", handlePositionChange);
    livaOpenConsoleBtn?.addEventListener("click", toggleConsole);
    livaUpdateBtn?.addEventListener("click", () => {
      closeSettings();
      checkUpdates();
    });
    livaConsoleCloseBtn?.addEventListener("click", closeConsole);
    livaConsoleHelpBtn?.addEventListener("click", showConsoleHelp);
    livaConsoleResetBtn?.addEventListener("click", resetConsoleStorage);
  }

  // <stdin>
  function main() {
    console.log("LiVa is active");
    initializeUiEventListeners();
    restoreFabPosition();
    initializeErrorTracking(updateFabState);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
