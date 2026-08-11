const statusMessage = document.querySelector("#app-status-message");
const demoForm = document.querySelector("#demo-form");
const resetFormButton = document.querySelector("#reset-form");
const announceUpdateButton = document.querySelector("#announce-update");
const emptyStateButton = document.querySelector("#empty-state-action");
const dialog = document.querySelector("#demo-dialog");
const openDialogButton = document.querySelector("#open-dialog");
const closeDialogButton = document.querySelector("#close-dialog");
const menuToggleButton = document.querySelector("#menu-toggle");
const appNav = document.querySelector("#app-nav");

const menuMediaQuery = window.matchMedia("(max-width: 720px)");

let dialogOpener = null;

function announce(message) {
  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;
}

function setFieldError(control, errorElement, hasError) {
  if (!control || !errorElement) {
    return;
  }

  errorElement.hidden = !hasError;
  control.classList.toggle("is-invalid", hasError);
  control.setAttribute("aria-invalid", hasError ? "true" : "false");
}

function validateForm() {
  const appName = demoForm.elements.appName;
  const department = demoForm.elements.department;
  const useCase = demoForm.elements.useCase;
  const useCaseError = document.querySelector("#use-case-error");

  const appNameMissing = appName.value.trim() === "";
  const departmentMissing = department.value === "";
  const useCaseMissing = !Array.from(useCase).some((option) => option.checked);

  setFieldError(appName, document.querySelector("#app-name-error"), appNameMissing);
  setFieldError(department, document.querySelector("#department-error"), departmentMissing);

  if (useCaseError) {
    useCaseError.hidden = !useCaseMissing;
  }

  Array.from(useCase).forEach((option) => {
    option.setAttribute("aria-invalid", useCaseMissing ? "true" : "false");
  });

  if (appNameMissing) {
    appName.focus();
    return false;
  }

  if (departmentMissing) {
    department.focus();
    return false;
  }

  if (useCaseMissing) {
    useCase[0].focus();
    return false;
  }

  return true;
}

function clearFormErrors() {
  setFieldError(demoForm.elements.appName, document.querySelector("#app-name-error"), false);
  setFieldError(demoForm.elements.department, document.querySelector("#department-error"), false);

  const useCaseError = document.querySelector("#use-case-error");
  if (useCaseError) {
    useCaseError.hidden = true;
  }

  Array.from(demoForm.elements.useCase).forEach((option) => {
    option.setAttribute("aria-invalid", "false");
  });
}

function updateCurrentNavLink() {
  const links = Array.from(document.querySelectorAll(".app-nav a"));
  const currentHash = window.location.hash || "#overview";

  links.forEach((link) => {
    if (link.getAttribute("href") === currentHash) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setMenuOpen(isOpen) {
  if (!menuToggleButton || !appNav) {
    return;
  }

  menuToggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");

  if (isOpen) {
    appNav.dataset.open = "true";
  } else {
    appNav.removeAttribute("data-open");
  }
}

function isMenuOpen() {
  return menuToggleButton?.getAttribute("aria-expanded") === "true";
}

if (demoForm) {
  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
      announce("The demo form has errors. Review the highlighted required fields.");
      return;
    }

    announce("Demo form validated successfully. No data was saved.");
  });
}

if (resetFormButton) {
  resetFormButton.addEventListener("click", () => {
    demoForm.reset();
    clearFormErrors();
    announce("Demo form reset.");
  });
}

if (announceUpdateButton) {
  announceUpdateButton.addEventListener("click", () => {
    announce("Demo status update announced through the live region.");
  });
}

if (emptyStateButton) {
  emptyStateButton.addEventListener("click", () => {
    announce("Empty states should explain why the page is empty and identify the next useful action.");
  });
}

if (dialog && openDialogButton && closeDialogButton) {
  openDialogButton.addEventListener("click", () => {
    dialogOpener = openDialogButton;
    dialog.showModal();
    closeDialogButton.focus();
  });

  closeDialogButton.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("close", () => {
    if (dialogOpener) {
      dialogOpener.focus();
    }
  });
}

if (menuToggleButton && appNav) {
  menuToggleButton.addEventListener("click", () => {
    setMenuOpen(!isMenuOpen());
  });

  appNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement && menuMediaQuery.matches) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen()) {
      setMenuOpen(false);
      menuToggleButton.focus();
    }
  });

  menuMediaQuery.addEventListener("change", (event) => {
    if (!event.matches) {
      setMenuOpen(false);
    }
  });
}

window.addEventListener("hashchange", updateCurrentNavLink);
updateCurrentNavLink();
