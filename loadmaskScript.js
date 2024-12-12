const originalXHR = window.XMLHttpRequest;
function CustomXMLHttpRequest() {
  const xhr = new originalXHR();
  const originalOpen = xhr.open;
  xhr.open = function (method, url) {
    this.loaderTargetElement = "getUser";
    this.loaderType = loaderTypes.fullPageOverlayWithLoader;

    originalOpen.apply(xhr, arguments);
  };
  const originalSend = xhr.send;
  const originalSetRequestHeader = xhr.setRequestHeader;
  xhr.setRequestHeader = function (header, value) {
    if (header === "loader-target-element") {
      this.loaderTargetElement = value;
    } else {
      originalSetRequestHeader.apply(xhr, arguments);
    }
  };

  xhr.send = function (body) {
    const targetElementId = this.loaderTargetElement;
    const loaderType = this.loaderType;
    if (targetElementId) {
      showLoader(targetElementId, loaderType);
    }

    xhr.addEventListener("load", function () {
      if (targetElementId) {
        hideLoader(targetElementId);
      }
    });

    xhr.addEventListener("error", function () {
      if (targetElementId) {
        hideLoader(targetElementId);
      }
    });
    originalSend.apply(xhr, arguments);
  };
  return xhr;
}
window.XMLHttpRequest = CustomXMLHttpRequest;

function showLoader(elementId, loaderType) {
  const element = document.getElementById(elementId);
  if (element) {
    const originalContent = element.innerHTML;
    element.setAttribute("data-original-content", originalContent);
    element.innerHTML = `
            ${originalContent}
            <span class="${loaderTypes.spinner}"></span>
        `;
    element.disabled = true;
  }
}

function hideLoader(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    const originalContent = element.getAttribute("data-original-content");
    if (originalContent) {
      element.innerHTML = originalContent;
      element.removeAttribute("data-original-content");
      element.disabled = false;
    }
  }
}

const loaderTypes = {
  spinner: "spinner",
  overlay: "overlay",
  fullPageOverlay: "fullPageOverlay",
  fullPageOverlayWithLoader: "fullPageOverlayWithLoader",
};

const originalFetch = window.fetch;

window.fetch = async function (...args) {
  const [url, options = {}] = args;
  const targetElementId = options.headers?.["loader-target-element"];
  const loaderType =
    options.headers?.["loader-type"] || loaderTypes.fullPageOverlayWithLoader;

  if (options.headers) {
    const { "loader-target-element": removed, ...remainingHeaders } =
      options.headers;
    options.headers = remainingHeaders;
  }

  if (targetElementId) showLoader(targetElementId, loaderType);

  try {
    return await originalFetch(url, options);
  } finally {
    if (targetElementId) hideLoader(targetElementId);
  }
};
