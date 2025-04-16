export function loadScript(src, globalVarName) {
  return new Promise((resolve, reject) => {
    // if already loaded
    if (window[globalVarName]) return resolve(window[globalVarName]);

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(window[globalVarName]);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}