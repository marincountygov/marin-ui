const statusMessage = document.querySelector("#app-status-message");
const demoForm = document.querySelector("#demo-form");
const resetFormButton = document.querySelector("#reset-form");
const announceUpdateButton = document.querySelector("#announce-update");
const emptyStateButton = document.querySelector("#empty-state-action");
const dialog = document.querySelector("#demo-dialog");
const openDialogButton = document.querySelector("#open-dialog");
const closeDialogButton = document.querySelector("#close-dialog");

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

// Dual layout routing:
// - #overview, #components, #forms, #data are shown together and scrollable.
// - #about, #security, #accessibility, #updates are shown exclusively as single info pages.
function updateViewMode() {
  const hash = window.location.hash.slice(1) || "overview";
  const mainSectionIds = ["overview", "components", "forms", "data"];
  const infoSectionIds = ["about", "security", "accessibility", "updates"];

  const isMainSection = mainSectionIds.includes(hash) || !window.location.hash;

  mainSectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = !isMainSection;
  });

  infoSectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = (id !== hash);
  });

  if (isMainSection && window.location.hash) {
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  document.querySelectorAll(".app-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === `#${hash}` || (!window.location.hash && href === "#overview")) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("hashchange", updateViewMode);
window.addEventListener("DOMContentLoaded", updateViewMode);
