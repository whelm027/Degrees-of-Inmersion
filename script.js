/* =========================================================================
   Immersive UI v1.2.3
   ========================================================================= */

(function () {
  "use strict";

  function isMobileDevice() {
    var hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    var isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobileUA || (hasTouch && window.innerWidth <= 1024);
  }

  var isMobileDefault = isMobileDevice();

  var config = {
    useModUI: true,
    isStowed: false,
    storyLayout: isMobileDefault ? "below" : "overlay", // "overlay", "below", "above"
    sideviewEnabled: true,
    sideviewOpacity: 100,
    sideviewSide: "right",
    compactStats: false,
    statmetersCollapsed: false,
    statsInVisuals: false,
    disablePaperdoll: false,
    panelWidth: "280px",
    sidebarLeftOffset: "0px",
    storyOffset: isMobileDefault ? 20 : 300,
    btnTheme: "default",
    btnStyle: "solid", // "solid", "flat", "neon", "clay", "radiant", "cyber"
    customBtnColor: "#26262a",
    accentColor: "gold",
    customAccent: "#ffd700",
    storyAccentColor: "ui",
    customStoryAccent: "#ffd700",
    baseTheme: "midnight",
    customBase: "#0d0d12",
    savedThemes: {},
    openPanels: { visuals: true, attributes: false, settings: false }
  };

  var ACCENT_MAP = {
    game:   "",
    gold:   "#ffd700",
    purple: "#a855f7",
    cyan:   "#00b3ff",
    green:  "#22c55e",
    red:    "#f43f5e",
    pink:   "#ec4899",
    silver: "#94a3b8",
    amber:  "#f59e0b"
  };

  var BASE_MAP = {
    game: null,
    midnight: { bg: "#0d0d12", card: "#111116", btn: "#181820", btnHover: "#22222d", border: "#22222d", text: "#f1f5f9", textMuted: "#94a3b8" },
    obsidian: { bg: "#000000", card: "#0a0a0c", btn: "#141418", btnHover: "#1e1e24", border: "#26262e", text: "#f8fafc", textMuted: "#a1a1aa" },
    navy:     { bg: "#0a1128", card: "#101d42", btn: "#1c2d5a", btnHover: "#2b4178", border: "#2b4178", text: "#e2e8f0", textMuted: "#94a3b8" },
    charcoal: { bg: "#18181b", card: "#27272a", btn: "#3f3f46", btnHover: "#52525b", border: "#3f3f46", text: "#f4f4f5", textMuted: "#a1a1aa" },
    espresso: { bg: "#1c1917", card: "#292524", btn: "#44403c", btnHover: "#57534e", border: "#44403c", text: "#f5f5f4", textMuted: "#a8a29e" },
    nordic:   { bg: "#0f172a", card: "#1e293b", btn: "#334155", btnHover: "#475569", border: "#334155", text: "#f8fafc", textMuted: "#94a3b8" }
  };

  function hexToRgb(hex) {
    if (!hex || hex.charAt(0) !== "#") return "255, 215, 0";
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var num = parseInt(hex, 16);
    if (isNaN(num)) return "255, 215, 0";
    return ((num >> 16) & 255) + ", " + ((num >> 8) & 255) + ", " + (num & 255);
  }

  function normalizeHex(hex) {
    if (typeof hex !== "string") return null;
    var h = hex.trim();
    if (h.charAt(0) !== "#") h = "#" + h;
    if (h.length === 4) {
      h = "#" + h.slice(1).split("").map(function (c) { return c + c; }).join("");
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(h)) return null;
    return h.toLowerCase();
  }

  function hexToRgbObj(hex) {
    var h = normalizeHex(hex) || "#ffd700";
    var num = parseInt(h.slice(1), 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex(r, g, b) {
    function c(v) {
      var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return s.length === 1 ? "0" + s : s;
    }
    return "#" + c(r) + c(g) + c(b);
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var d = max - min;
    var h = 0;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    var s = max === 0 ? 0 : d / max;
    var v = max;
    return { h: h, s: s, v: v };
  }

  function hsvToRgb(h, s, v) {
    var c = v * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = v - c;
    var r, g, b;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  }

  function hexToHsv(hex) {
    var rgb = hexToRgbObj(hex);
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
  }

  function getActiveAccentHex() {
    if (config.accentColor === "custom") return config.customAccent || "#ffd700";
    return ACCENT_MAP[config.accentColor] || "#ffd700";
  }

  function getActiveStoryAccentHex() {
    if (config.storyAccentColor === "ui" || config.storyAccentColor === "match_ui") {
      return getActiveAccentHex();
    }
    if (config.storyAccentColor === "custom") return config.customStoryAccent || "#ffd700";
    return ACCENT_MAP[config.storyAccentColor] || "#ffd700";
  }

  function getActiveBaseHex() {
    if (config.baseTheme === "custom") return config.customBase || "#0d0d12";
    if (config.baseTheme === "game" || !BASE_MAP[config.baseTheme]) return "#0d0d12";
    return BASE_MAP[config.baseTheme].bg || "#0d0d12";
  }

  function getActiveBtnHex() {
    if (config.btnTheme === "custom") return config.customBtnColor || "#26262a";
    var map = {
      default: "#26262a",
      purple: "#2d1e3c",
      crimson: "#3c191e",
      navy: "#192841",
      emerald: "#193223"
    };
    return map[config.btnTheme] || "#26262a";
  }

  function generateThemeFromBaseHex(hex) {
    if (!hex || hex.charAt(0) !== "#") hex = "#0d0d12";
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var num = parseInt(hex, 16);
    if (isNaN(num)) num = 0x0d0d12;
    var r = (num >> 16) & 255;
    var g = (num >> 8) & 255;
    var b = num & 255;

    function lighten(factor) {
      var nr = Math.min(255, r + factor);
      var ng = Math.min(255, g + factor);
      var nb = Math.min(255, b + factor);
      return "#" + ((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1);
    }

    return {
      bg: "#" + hex,
      card: lighten(10),
      btn: lighten(20),
      btnHover: lighten(32),
      border: lighten(32),
      text: "#f8fafc",
      textMuted: "#a1a1aa"
    };
  }

  function generateButtonThemeFromHex(hex) {
    if (!hex || hex.charAt(0) !== "#") hex = "#26262a";
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var num = parseInt(hex, 16);
    if (isNaN(num)) num = 0x26262a;
    var r = (num >> 16) & 255;
    var g = (num >> 8) & 255;
    var b = num & 255;

    function clampShift(val, amount) {
      return Math.max(0, Math.min(255, val + amount));
    }

    var style = config.btnStyle || "solid";
    var topR, topG, topB, botR, botG, botB;

    if (style === "flat") {
      return {
        top: "rgba(" + r + ", " + g + ", " + b + ", 1.0)",
        bot: "rgba(" + r + ", " + g + ", " + b + ", 1.0)",
        hoverTop: "rgba(" + clampShift(r, 30) + ", " + clampShift(g, 30) + ", " + clampShift(b, 30) + ", 1.0)",
        hoverBot: "rgba(" + clampShift(r, 30) + ", " + clampShift(g, 30) + ", " + clampShift(b, 30) + ", 1.0)",
        text: "#e8e8e8",
        gold: "#d4b04f",
        backdrop: "none",
        shadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        bgImage: "none"
      };
    } else if (style === "neon") {
      topR = clampShift(r, 15); topG = clampShift(g, 15); topB = clampShift(b, 15);
      botR = clampShift(r, -25); botG = clampShift(g, -25); botB = clampShift(b, -25);
      return {
        top: "rgba(" + topR + ", " + topG + ", " + topB + ", 0.95)",
        bot: "rgba(" + botR + ", " + botG + ", " + botB + ", 0.95)",
        hoverTop: "rgba(" + clampShift(r, 45) + ", " + clampShift(g, 45) + ", " + clampShift(b, 45) + ", 0.98)",
        hoverBot: "rgba(" + clampShift(r, 5) + ", " + clampShift(g, 5) + ", " + clampShift(b, 5) + ", 0.98)",
        text: "#ffffff",
        gold: "#ffd700",
        backdrop: "none",
        shadow: "0 0 12px rgba(var(--accent-rgb, 255, 215, 0), 0.6), inset 0 0 6px rgba(var(--accent-rgb, 255, 215, 0), 0.4)",
        bgImage: "linear-gradient(180deg, rgba(" + topR + ", " + topG + ", " + topB + ", 0.95) 0%, rgba(" + botR + ", " + botG + ", " + botB + ", 0.95) 100%)"
      };
    } else if (style === "clay") {
      topR = clampShift(r, 25); topG = clampShift(g, 25); topB = clampShift(b, 25);
      botR = clampShift(r, -15); botG = clampShift(g, -15); botB = clampShift(b, -15);
      return {
        top: "rgba(" + topR + ", " + topG + ", " + topB + ", 0.98)",
        bot: "rgba(" + botR + ", " + botG + ", " + botB + ", 0.98)",
        hoverTop: "rgba(" + clampShift(r, 45) + ", " + clampShift(g, 45) + ", " + clampShift(b, 45) + ", 0.98)",
        hoverBot: "rgba(" + clampShift(r, 5) + ", " + clampShift(g, 5) + ", " + clampShift(b, 5) + ", 0.98)",
        text: "#f0f0f0",
        gold: "#eab308",
        backdrop: "none",
        shadow: "inset 2px 2px 4px rgba(255, 255, 255, 0.2), inset -2px -2px 4px rgba(0, 0, 0, 0.5), 0 3px 6px rgba(0,0,0,0.3)",
        bgImage: "linear-gradient(180deg, rgba(" + topR + ", " + topG + ", " + topB + ", 0.98) 0%, rgba(" + botR + ", " + botG + ", " + botB + ", 0.98) 100%)"
      };
    } else if (style === "radiant") {
      var brightR = clampShift(r, 50), brightG = clampShift(g, 50), brightB = clampShift(b, 50);
      var midR = clampShift(r, 15), midG = clampShift(g, 15), midB = clampShift(b, 15);
      var darkR = clampShift(r, -20), darkG = clampShift(g, -20), darkB = clampShift(b, -20);

      var hBrightR = clampShift(r, 70), hBrightG = clampShift(g, 70), hBrightB = clampShift(b, 70);
      var hDarkR = clampShift(r, 0), hDarkG = clampShift(g, 0), hDarkB = clampShift(b, 0);

      return {
        top: "rgba(" + midR + ", " + midG + ", " + midB + ", 0.98)",
        bot: "rgba(" + darkR + ", " + darkG + ", " + darkB + ", 0.98)",
        hoverTop: "rgba(" + hBrightR + ", " + hBrightG + ", " + hBrightB + ", 0.98)",
        hoverBot: "rgba(" + hDarkR + ", " + hDarkG + ", " + hDarkB + ", 0.98)",
        text: "#ffffff",
        gold: "#ffd700",
        backdrop: "none",
        shadow: "0 0 14px rgba(" + brightR + ", " + brightG + ", " + brightB + ", 0.45), inset 0 1px 0 rgba(" + brightR + ", " + brightG + ", " + brightB + ", 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.5)",
        bgImage: "radial-gradient(ellipse at 50% 15%, rgba(" + brightR + ", " + brightG + ", " + brightB + ", 0.75) 0%, transparent 70%), linear-gradient(180deg, rgba(" + midR + ", " + midG + ", " + midB + ", 0.98) 0%, rgba(" + darkR + ", " + darkG + ", " + darkB + ", 0.98) 100%)"
      };
    } else if (style === "cyber") {
      topR = clampShift(r, 12); topG = clampShift(g, 18); topB = clampShift(b, 30);
      botR = clampShift(r, -30); botG = clampShift(g, -25); botB = clampShift(b, -15);
      return {
        top: "rgba(" + topR + ", " + topG + ", " + topB + ", 0.98)",
        bot: "rgba(" + botR + ", " + botG + ", " + botB + ", 0.98)",
        hoverTop: "rgba(" + clampShift(topR, 35) + ", " + clampShift(topG, 35) + ", " + clampShift(topB, 45) + ", 0.98)",
        hoverBot: "rgba(" + clampShift(botR, 15) + ", " + clampShift(botG, 15) + ", " + clampShift(botB, 20) + ", 0.98)",
        text: "#f0f4f8",
        gold: "#38bdf8",
        backdrop: "none",
        shadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.5)",
        bgImage: "linear-gradient(180deg, rgba(" + topR + ", " + topG + ", " + topB + ", 0.98) 0%, rgba(" + botR + ", " + botG + ", " + botB + ", 0.98) 100%)"
      };
    }

    topR = clampShift(r, 22); topG = clampShift(g, 22); topB = clampShift(b, 22);
    botR = clampShift(r, -12); botG = clampShift(g, -12); botB = clampShift(b, -12);

    return {
      top: "rgba(" + topR + ", " + topG + ", " + topB + ", 0.98)",
      bot: "rgba(" + botR + ", " + botG + ", " + botB + ", 0.98)",
      hoverTop: "rgba(" + clampShift(r, 38) + ", " + clampShift(g, 38) + ", " + clampShift(b, 38) + ", 0.98)",
      hoverBot: "rgba(" + clampShift(r, 8) + ", " + clampShift(g, 8) + ", " + clampShift(b, 8) + ", 0.98)",
      text: "#e8e8e8",
      gold: "#d4b04f",
      backdrop: "none",
      shadow: "none",
      bgImage: "linear-gradient(180deg, rgba(" + topR + ", " + topG + ", " + topB + ", 0.98) 0%, rgba(" + botR + ", " + botG + ", " + botB + ", 0.98) 100%)"
    };
  }

  var isSyncing = false;
  var syncDebounceTimer = null;
  var lastStableSidebarHeight = 170;

  function loadConfig() {
    try {
      var saved = localStorage.getItem("mod_config");
      if (saved) {
        var parsed = JSON.parse(saved);
        for (var k in parsed) {
          if (parsed.hasOwnProperty(k)) config[k] = parsed[k];
        }
      }
    } catch (_) {}
  }

  function saveConfig() {
    try {
      localStorage.setItem("mod_config", JSON.stringify(config));
    } catch (_) {}
  }

  function el(id) { return document.getElementById(id); }

  function cleanStyles(node) {
    if (!node) return;
    node.removeAttribute("style");
  }

  function updateSidebarHeightVar() {
    var sidebar = el("sidebar");
    if (sidebar && config.useModUI) {
      if (isSyncing) return;
      var h = sidebar.offsetHeight;
      if (h && h > 30) {
        lastStableSidebarHeight = h;
        document.documentElement.style.setProperty("--sidebar-height", h + "px");
      } else if (lastStableSidebarHeight > 30) {
        document.documentElement.style.setProperty("--sidebar-height", lastStableSidebarHeight + "px");
      }
    } else {
      document.documentElement.style.setProperty("--sidebar-height", "170px");
    }
  }

  function applySidebarFontOptions() {
    var sidebar = el("sidebar");
    if (!sidebar) return;

    if (window.V && window.V.options) {
      var opt = window.V.options;
      var rawVal = opt.sidebarFontSize || opt.fontSize;
      if (typeof rawVal !== "undefined" && rawVal !== null && rawVal !== "") {
        var parsed = parseInt(rawVal, 10);
        if (!isNaN(parsed)) {
          if (parsed >= 1 && parsed <= 5) {
            var map = { 1: "85%", 2: "95%", 3: "105%", 4: "115%", 5: "125%" };
            sidebar.style.fontSize = map[parsed] || "100%";
          } else if (parsed > 5 && parsed <= 32) {
            sidebar.style.fontSize = parsed + "px";
          } else if (parsed > 32) {
            sidebar.style.fontSize = parsed + "%";
          } else {
            sidebar.style.fontSize = "";
          }
        } else if (typeof rawVal === "string") {
          if (rawVal.endsWith("%") || rawVal.endsWith("px") || rawVal.endsWith("em") || rawVal.endsWith("rem")) {
            sidebar.style.fontSize = rawVal;
          } else {
            sidebar.style.fontSize = "";
          }
        } else {
          sidebar.style.fontSize = "";
        }
      } else {
        sidebar.style.fontSize = "";
      }

      var lhVal = opt.sidebarLineHeight || opt.lineHeight;
      if (typeof lhVal !== "undefined" && lhVal !== null && lhVal !== "") {
        if (typeof lhVal === "number" && !isNaN(lhVal) && lhVal > 0) {
          sidebar.style.lineHeight = lhVal > 5 ? (lhVal + "%") : lhVal;
        } else if (typeof lhVal === "string" && lhVal.length > 0) {
          sidebar.style.lineHeight = lhVal;
        } else {
          sidebar.style.lineHeight = "";
        }
      } else {
        sidebar.style.lineHeight = "";
      }
    }
  }

  function wireStatsClick(statsElem) {
    if (!statsElem) return;
    statsElem.style.cursor = "pointer";
    statsElem.onclick = function (e) {
      if (typeof window.extendStats === "function") {
        try { window.extendStats(); } catch (_) {}
      }
      var isExpanded = !!(window.V && window.V.extendedStats);
      var container = el("stats-container");
      if (container) container.classList.toggle("statsExtended", isExpanded);
      statsElem.classList.toggle("statsExtended", isExpanded);
      statsElem.classList.toggle("stats-expanded", isExpanded);
      setTimeout(updateSidebarHeightVar, 0);
      requestAnimationFrame(updateSidebarHeightVar);
    };

    var isExpanded = !!(window.V && window.V.extendedStats);
    var container = el("stats-container");
    if (container) container.classList.toggle("statsExtended", isExpanded);
    statsElem.classList.toggle("statsExtended", isExpanded);
    statsElem.classList.toggle("stats-expanded", isExpanded);
    setTimeout(updateSidebarHeightVar, 0);
  }

  function syncStatmeterColors() {
    var statMeters = el("statmeters");
    if (!statMeters) return;
    
    var captions = statMeters.children;
    for (var i = 0; i < captions.length; i++) {
      var cap = captions[i];
      if (!config.useModUI) {
        if (cap.id) cap.className = "";
        cap.removeAttribute("data-val");
        cap.removeAttribute("data-title");
        cap.removeAttribute("title");
        continue;
      }
      
      if (cap.getAttribute("title") && !cap.dataset.origTitle) {
        cap.dataset.origTitle = cap.getAttribute("title");
      }
      var origTitle = cap.dataset.origTitle || "";

      var span = cap.querySelector("span");
      var innerText = "";
      if (span && span.textContent) {
        innerText = span.textContent.trim();
      }
      if (!innerText) {
        var rawText = cap.textContent || "";
        var match = rawText.match(/\d+(?:\.\d+)?%?/);
        if (match) innerText = match[0];
      }
      if (!innerText) {
        innerText = (cap.textContent || "").replace(/[^0-9.%]/g, "").trim();
      }

      var rawLabel = (cap.textContent || "").split(":")[0].trim();
      var properLabel = rawLabel ? (rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase()) : "";
      var fullTitle = origTitle || (properLabel && innerText ? (properLabel + ": " + innerText) : (properLabel || innerText));
      
      if (config.statmetersCollapsed) {
        if (innerText) {
          cap.setAttribute("data-val", innerText);
        } else {
          cap.removeAttribute("data-val");
        }
        cap.removeAttribute("data-title");
        cap.removeAttribute("title");
      } else {
        cap.removeAttribute("data-val");
        if (cap.id) cap.className = "";
        if (fullTitle) {
          cap.setAttribute("data-title", fullTitle);
          cap.setAttribute("title", fullTitle);
        } else {
          cap.removeAttribute("data-title");
          cap.removeAttribute("title");
        }
      }

      if (!cap.dataset.clickValWired) {
        cap.dataset.clickValWired = "1";
        cap.style.cursor = "pointer";

        cap.addEventListener("click", function (e) {
          e.stopPropagation();
          var self = this;
          self.classList.add("show-val");
          if (self._hideTimer) clearTimeout(self._hideTimer);
          self._hideTimer = setTimeout(function () {
            self.classList.remove("show-val");
          }, 2500);
        });

        cap.addEventListener("mouseleave", function () {
          var self = this;
          if (self._hideTimer) clearTimeout(self._hideTimer);
          self.classList.remove("show-val");
        });
      }

      if (span && span.className) {
        cap.className = span.className;
      } else {
        var id = (cap.id || "").toLowerCase();
        if (id.indexOf("air") !== -1 || id.indexOf("oxygen") !== -1) {
          cap.className = "lblue";
        }
      }
    }
  }

  function checkMobileDevice() {
    var isMobile = isMobileDevice();
    if (isMobile) {
      document.body.classList.add("mobile-ui");
    } else {
      document.body.classList.remove("mobile-ui");
    }
  }

  function checkStackedOpenPanels() {
    if (config.storyLayout === "below" || config.storyLayout === "above") {
      var openCount = 0;
      for (var k in config.openPanels) {
        if (config.openPanels[k]) openCount++;
      }
      if (openCount > 1) {
        config.openPanels = { visuals: false, attributes: false, settings: true };
      }
    }
  }

  function ensureClassicUISettingsButton() {
    if (config.useModUI) {
      var oldBtn = el("classic-ui-settings-btn");
      if (oldBtn) oldBtn.remove();
      var oldModBtn = el("ui-settings-btn");
      if (oldModBtn && !oldModBtn.closest("#sidebar")) oldModBtn.remove();
      return;
    }

    var modBtn = el("ui-settings-btn");
    if (modBtn) modBtn.remove();
    var startSetBtn = el("start-ui-settings-btn");
    if (startSetBtn) startSetBtn.remove();

    var startCap = el("startCaption");
    var overlayBtns = el("overlayButtons");
    var captionCnt = el("storyCaptionContent");

    var target = null;
    if (startCap && startCap.isConnected && (startCap.children.length > 0 || startCap.textContent.trim().length > 0)) {
      target = startCap;
    } else if (overlayBtns && overlayBtns.isConnected) {
      target = overlayBtns;
    } else if (captionCnt && captionCnt.isConnected) {
      target = captionCnt;
    }

    if (!target) return;

    var classicBtn = el("classic-ui-settings-btn");
    if (!classicBtn) {
      classicBtn = document.createElement("button");
      classicBtn.id = "classic-ui-settings-btn";
      classicBtn.className = "macro-button btn-full";
      classicBtn.textContent = "UI SETTINGS";
      classicBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        openUISettingsOverlay();
      });
    }

    if (classicBtn.parentElement !== target || target.lastElementChild !== classicBtn) {
      target.appendChild(classicBtn);
    }
  }

  function applyConfig() {
    if (config.disablePaperdoll) cachedPaperdollActive = false;
    checkMobileDevice();
    applySidebarFontOptions();
    checkStackedOpenPanels();

    var root = document.documentElement;
    var isMobile = isMobileDevice();

    var nativeStartCap = el("startCaption");
    var isStartMenu = !!(nativeStartCap && (nativeStartCap.closest("#storyCaptionContent") || nativeStartCap.closest("#storyCaptionDiv") || nativeStartCap.closest("#story") || nativeStartCap.closest("#panel-visuals")));
    var isClassic = !config.useModUI;

    var minPWidth = 260;
    var maxPWidth = isMobile ? 450 : 600;
    var pWidthNum = (isStartMenu || isClassic) ? 280 : (parseInt(config.panelWidth, 10) || 280);
    if (isNaN(pWidthNum) || pWidthNum < minPWidth) pWidthNum = minPWidth;
    if (pWidthNum > maxPWidth) pWidthNum = maxPWidth;
    root.style.setProperty("--panel-width", pWidthNum + "px");

    var stageScale = (isStartMenu || isClassic) ? 1 : (pWidthNum / 280);
    root.style.setProperty("--stage-scale", stageScale.toFixed(4));

    var maxSLeftOffset = isMobile ? 100 : 1200;
    var sOffsetNum = parseInt(config.sidebarLeftOffset, 10);
    if (isNaN(sOffsetNum) || sOffsetNum < 0) sOffsetNum = 0;
    if (sOffsetNum > maxSLeftOffset) sOffsetNum = maxSLeftOffset;
    root.style.setProperty("--sidebar-left-offset", sOffsetNum + "px");

    document.body.classList.remove("layout-overlay", "layout-below", "layout-above");
    var layout = config.storyLayout || "overlay";
    document.body.classList.add("layout-" + layout);

    if (config.accentColor === "game") {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-rgb");
      document.body.style.removeProperty("--accent");
      document.body.classList.remove("custom-accent");
    } else {
      var accentHex = (config.accentColor === "custom") ? config.customAccent : ACCENT_MAP[config.accentColor];
      if (!accentHex) accentHex = "#ffd700";
      root.style.setProperty("--accent", accentHex);
      root.style.setProperty("--accent-rgb", hexToRgb(accentHex));
      document.body.style.setProperty("--accent", accentHex);
      document.body.classList.add("custom-accent");
    }

    if (!config.storyAccentColor || config.storyAccentColor === "game") {
      root.style.removeProperty("--story-accent");
      document.body.style.removeProperty("--story-accent");
      document.body.classList.remove("custom-story-accent");
    } else {
      var storyAccentHex = "";
      if (config.storyAccentColor === "ui" || config.storyAccentColor === "match_ui") {
        storyAccentHex = (config.accentColor === "custom") ? config.customAccent : ACCENT_MAP[config.accentColor];
      } else if (config.storyAccentColor === "custom") {
        storyAccentHex = config.customStoryAccent;
      } else {
        storyAccentHex = ACCENT_MAP[config.storyAccentColor];
      }
      if (!storyAccentHex) storyAccentHex = "#ffd700";
      root.style.setProperty("--story-accent", storyAccentHex);
      document.body.style.setProperty("--story-accent", storyAccentHex);
      document.body.classList.add("custom-story-accent");
    }

    var themeObj = null;
    if (config.baseTheme === "custom") {
      themeObj = generateThemeFromBaseHex(config.customBase || "#0d0d12");
    } else if (config.baseTheme === "game") {
      themeObj = null;
    } else {
      themeObj = BASE_MAP[config.baseTheme] || BASE_MAP.midnight;
    }

    if (themeObj) {
      root.style.setProperty("--bg", themeObj.bg);
      root.style.setProperty("--card-bg", themeObj.card);
      root.style.setProperty("--btn-bg", themeObj.btn);
      root.style.setProperty("--btn-hover", themeObj.btnHover);
      root.style.setProperty("--border", themeObj.border);
      root.style.setProperty("--text", themeObj.text);
      root.style.setProperty("--text-muted", themeObj.textMuted);
    } else {
      root.style.removeProperty("--bg");
      root.style.removeProperty("--card-bg");
      root.style.removeProperty("--btn-bg");
      root.style.removeProperty("--btn-hover");
      root.style.removeProperty("--border");
      root.style.removeProperty("--text");
      root.style.removeProperty("--text-muted");
    }

    var btnObj = generateButtonThemeFromHex(getActiveBtnHex());
    if (btnObj) {
      root.style.setProperty("--btn-top", btnObj.top);
      root.style.setProperty("--btn-bot", btnObj.bot);
      root.style.setProperty("--btn-top-hover", btnObj.hoverTop);
      root.style.setProperty("--btn-bot-hover", btnObj.hoverBot);
      root.style.setProperty("--btn-text", btnObj.text);
      root.style.setProperty("--btn-gold", btnObj.gold);
      root.style.setProperty("--btn-backdrop-filter", btnObj.backdrop || "none");
      root.style.setProperty("--btn-box-shadow", btnObj.shadow || "none");
      root.style.setProperty("--btn-bg-image", btnObj.bgImage || "none");
    }

    var maxStoryOffset = isMobile ? 600 : 1000;
    var offsetVal = parseInt(config.storyOffset, 10);
    if (isNaN(offsetVal) || offsetVal < 0) offsetVal = isMobile ? 20 : 300;
    if (offsetVal > maxStoryOffset) offsetVal = maxStoryOffset;
    root.style.setProperty("--story-offset", offsetVal + "px");

    if (config.compactStats) {
      document.body.classList.add("compact-stats");
    } else {
      document.body.classList.remove("compact-stats");
    }

    var statMeters = el("statmeters");
    if (statMeters) {
      statMeters.classList.toggle("statmeters-collapsed", !!config.statmetersCollapsed);
      syncStatmeterColors();
    }

    var svOpacity = (typeof config.sideviewOpacity !== "undefined") ? parseInt(config.sideviewOpacity, 10) : 100;
    var sideviewActive = config.sideviewEnabled && (svOpacity > 0);
    document.body.classList.toggle("sv-disabled", !sideviewActive);
    var svHost = el("sv-host");
    if (svHost) {
      svHost.style.display = sideviewActive ? "block" : "none";
    }

    var sidebar = el("sidebar");
    var tray    = el("ui-bar-tray");
    var uiBar   = el("ui-bar");

    if (config.useModUI) {
      document.body.classList.add("mod-active");
      if (sidebar) sidebar.style.display = "flex";

      var header = el("header");
      if (tray && header && tray.parentElement !== header) {
        header.insertBefore(tray, header.firstChild);
      }
    } else {
      document.body.classList.remove("mod-active");
      if (sidebar) sidebar.style.display = "none";

      if (tray && uiBar && tray.parentElement !== uiBar) {
        uiBar.insertBefore(tray, uiBar.firstChild);
      }

      restoreOriginalDOM();
    }

    ensureClassicUISettingsButton();

    var statsElem = el("stats") || document.querySelector("#stats");
    wireStatsClick(statsElem);

    updateSwitchButton();
    applyStates();
    sizeSV();
    updateSidebarHeightVar();
    updateStageHeight();
  }

  function updateSwitchButton() {
    var historyElem = el("ui-bar-history");
    var trayElem    = el("ui-bar-tray");
    var target      = trayElem || historyElem;
    if (!target) return;

    var switchBtn = el("ui-toggle-btn");
    if (!switchBtn) {
      switchBtn = document.createElement("button");
      switchBtn.id = "ui-toggle-btn";
      switchBtn.className = "ui-switch-btn";
    }

    switchBtn.onclick = function (e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      config.useModUI = !config.useModUI;
      config.isStowed = false;
      saveConfig();
      applyConfig();
      requestSync(true);
    };

    if (switchBtn.parentElement !== target) {
      var origToggle = el("ui-bar-toggle");
      if (origToggle && origToggle.parentElement === target) {
        target.insertBefore(switchBtn, origToggle);
      } else {
        target.appendChild(switchBtn);
      }
    }

    switchBtn.textContent = config.useModUI ? "Classic UI" : "Mod UI";
    switchBtn.title = config.useModUI ? "Switch to Original Game UI" : "Switch to Mod Tabbed UI";
  }

  function reconstructOverlayButtons(overlayBtns) {
    if (!overlayBtns) return;

    var attrBtns = el("attr-buttons");
    var setBtns  = el("set-buttons");
    var pAttr    = el("panel-attributes");
    var pSet     = el("panel-settings");
    var allBtns  = [];

    [attrBtns, setBtns, overlayBtns, pAttr, pSet].forEach(function (container) {
      if (container) {
        var btns = Array.from(container.querySelectorAll("button, .macro-button"));
        btns.forEach(function (b) {
          if (b.id === "ui-settings-btn" || b.id === "start-ui-settings-btn" || b.id === "classic-ui-settings-btn" || b.id === "ui-toggle-btn" || b.id === "master-toggle") return;
          b.classList.remove("btn-full");
          if (allBtns.indexOf(b) === -1) allBtns.push(b);
        });
      }
    });

    if (allBtns.length === 0) return;

    overlayBtns.innerHTML = "";

    var btnMap = {};
    allBtns.forEach(function (b) {
      var txt = (b.textContent || "").toUpperCase().trim();
      if (txt) btnMap[txt] = b;
    });

    function getBtn(txt) {
      return btnMap[txt] || null;
    }

    function createSplit(txt1, txt2) {
      var split = document.createElement("div");
      split.className = "sidebarButtonSplit";
      var b1 = getBtn(txt1);
      var b2 = getBtn(txt2);
      if (b1) split.appendChild(b1);
      if (b2) split.appendChild(b2);
      return split;
    }

    var bChar = getBtn("CHARACTERISTICS") || getBtn("ATTRIBUTES");
    if (bChar) {
      bChar.textContent = "CHARACTERISTICS";
      overlayBtns.appendChild(bChar);
    }

    var bSoc = getBtn("SOCIAL");
    if (bSoc) overlayBtns.appendChild(bSoc);

    overlayBtns.appendChild(createSplit("TRAITS", "JOURNAL"));
    overlayBtns.appendChild(createSplit("STATS", "FEATS"));

    overlayBtns.appendChild(document.createElement("br"));

    var optionsBtn = getBtn("OPTIONS");
    var savesBtn   = getBtn("SAVES");

    var usedBtns = [
      bChar, bSoc,
      getBtn("TRAITS"), getBtn("JOURNAL"),
      getBtn("STATS"), getBtn("FEATS"),
      optionsBtn, savesBtn
    ];

    var remaining = allBtns.filter(function (b) { return usedBtns.indexOf(b) === -1; });
    for (var i = 0; i < remaining.length; i += 2) {
      var splitRem = document.createElement("div");
      splitRem.className = "sidebarButtonSplit";
      splitRem.appendChild(remaining[i]);
      if (remaining[i + 1]) splitRem.appendChild(remaining[i + 1]);
      overlayBtns.appendChild(splitRem);
    }

    if (optionsBtn || savesBtn) {
      var optSaveSplit = document.createElement("div");
      optSaveSplit.className = "sidebarButtonSplit";
      if (optionsBtn) optSaveSplit.appendChild(optionsBtn);
      if (savesBtn) optSaveSplit.appendChild(savesBtn);
      overlayBtns.appendChild(optSaveSplit);
    }
  }

  function restoreOriginalDOM() {
    var uiBar      = el("ui-bar");
    var tray       = el("ui-bar-tray");
    var uiBody     = el("ui-bar-body");
    var storyCap   = el("story-caption");
    var captionDiv = el("storyCaptionDiv");
    var captionCnt = el("storyCaptionContent");
    var imgWrap    = el("sidebar-img-container");
    var sky        = el("canvasSkybox");
    var stats      = el("stats");
    var statMeters = el("statmeters");
    var overlayBtns= el("overlayButtons");
    var mobStats   = el("mobileStats");
    var menu       = el("menu");
    var startCap   = el("startCaption");
    var startImg   = el("startingPlayerImage") || document.querySelector("#startingPlayerImage");

    var modBtn = el("ui-settings-btn");
    if (modBtn) modBtn.remove();
    var startSetBtn = el("start-ui-settings-btn");
    if (startSetBtn) startSetBtn.remove();

    document.body.classList.remove("mod-active", "mod-stowed");

    var sidebar = el("sidebar");
    if (sidebar) {
      sidebar.style.display = "none";
      sidebar.classList.remove("stowed", "mod-start-menu");
    }

    var modTitle = el("start-story-title");
    if (modTitle) modTitle.remove();

    if (startCap) {
      var startGrids = Array.from(startCap.querySelectorAll(".start-btn-grid, .start-bottom-row, .btn-grid, .start-extra-btns"));
      startGrids.forEach(function (g) {
        while (g.firstChild) {
          startCap.appendChild(g.firstChild);
        }
        g.remove();
      });

      var startActionBtns = Array.from(startCap.querySelectorAll("button, .macro-button")).filter(function (b) {
        if (b.id === "start-ui-settings-btn" || b.id === "ui-toggle-btn" || b.id === "classic-ui-settings-btn") return false;
        var txt = (b.textContent || "").toUpperCase().trim();
        return txt.length > 1;
      });

      var saveClassicBtn = null;
      var optionsClassicBtn = null;
      var featsClassicBtn = null;
      var otherClassicBtns = [];

      startActionBtns.forEach(function (btn) {
        var txt = (btn.textContent || "").toUpperCase().trim();
        if (txt.indexOf("SAVE") !== -1) saveClassicBtn = btn;
        else if (txt.indexOf("OPTION") !== -1) optionsClassicBtn = btn;
        else if (txt.indexOf("FEAT") !== -1) featsClassicBtn = btn;
        else otherClassicBtns.push(btn);
      });

      if (otherClassicBtns.length > 0) {
        var classicExtraDiv = document.createElement("div");
        classicExtraDiv.className = "start-extra-btns";
        classicExtraDiv.style.cssText = "margin-bottom:8px; display:flex; flex-direction:column; gap:6px;";
        otherClassicBtns.forEach(function (btn) {
          btn.classList.add("btn-full");
          btn.style.borderRadius = "0px";
          classicExtraDiv.appendChild(btn);
        });
        startCap.appendChild(classicExtraDiv);
      }

      if (saveClassicBtn) {
        saveClassicBtn.classList.add("btn-full");
        saveClassicBtn.style.borderRadius = "0px";
        startCap.appendChild(saveClassicBtn);
      }

      if (optionsClassicBtn || featsClassicBtn) {
        var classicBottomPair = document.createElement("div");
        classicBottomPair.className = "start-bottom-row";
        if (optionsClassicBtn) {
          optionsClassicBtn.classList.remove("btn-full");
          optionsClassicBtn.style.borderRadius = "0px";
          classicBottomPair.appendChild(optionsClassicBtn);
        }
        if (featsClassicBtn) {
          featsClassicBtn.classList.remove("btn-full");
          featsClassicBtn.style.borderRadius = "0px";
          classicBottomPair.appendChild(featsClassicBtn);
        }
        startCap.appendChild(classicBottomPair);
      }

      if (startImg && startCap && startImg.parentElement !== startCap) {
        startCap.insertBefore(startImg, startCap.firstChild);
      }

      if (startCap && storyCap && startCap.parentElement !== storyCap) {
        storyCap.appendChild(startCap);
      }
    }

    reconstructOverlayButtons(overlayBtns);

    if (tray && uiBar && tray.parentElement !== uiBar) {
      uiBar.insertBefore(tray, uiBar.firstChild);
    }

    if (uiBody && storyCap && storyCap.parentElement !== uiBody) {
      uiBody.appendChild(storyCap);
    }

    if (sky && storyCap && sky.parentElement !== storyCap) {
      storyCap.insertBefore(sky, storyCap.firstChild);
    }

    if (imgWrap && storyCap && imgWrap.parentElement !== storyCap) {
      if (sky && sky.nextSibling) storyCap.insertBefore(imgWrap, sky.nextSibling);
      else storyCap.appendChild(imgWrap);
    }

    if (captionDiv && storyCap && captionDiv.parentElement !== storyCap) {
      storyCap.appendChild(captionDiv);
    }

    if (stats && captionDiv && stats.parentElement !== captionDiv) {
      if (captionCnt && captionCnt.parentElement === captionDiv) {
        captionDiv.insertBefore(stats, captionCnt);
      } else {
        captionDiv.appendChild(stats);
      }
    }
    wireStatsClick(stats);

    if (captionCnt && captionDiv && captionCnt.parentElement !== captionDiv) {
      captionDiv.appendChild(captionCnt);
    }

    if (statMeters) {
      statMeters.classList.remove("statmeters-collapsed");
      var caps = statMeters.children;
      for (var c = 0; c < caps.length; c++) {
        if (caps[c].id) caps[c].className = "";
        caps[c].removeAttribute("data-val");
      }
    }

    if (captionCnt && statMeters) {
      var firstElem = captionCnt.firstElementChild;
      if (firstElem && firstElem !== statMeters) {
        if (firstElem.nextElementSibling) {
          captionCnt.insertBefore(statMeters, firstElem.nextElementSibling);
        } else {
          captionCnt.appendChild(statMeters);
        }
      } else {
        captionCnt.appendChild(statMeters);
      }
    }

    if (captionCnt && overlayBtns && overlayBtns.parentElement !== captionCnt) {
      captionCnt.appendChild(overlayBtns);
    }

    if (mobStats && storyCap && mobStats.parentElement !== storyCap) {
      storyCap.appendChild(mobStats);
    }

    if (menu && uiBody && menu.parentElement !== uiBody) {
      uiBody.appendChild(menu);
    }

    [sky, imgWrap, captionDiv, captionCnt, stats, statMeters, overlayBtns, mobStats, uiBar, uiBody, storyCap, menu, startCap, startImg].forEach(cleanStyles);

    var stage = el("visual-stage");
    if (stage) stage.innerHTML = "";

    if (typeof window.updatehistorycontrols === "function") {
      try { window.updatehistorycontrols(); } catch (_) {}
    }

    applyStates();
  }

  function wireGlobalSwipe() {
    if (window._modSwipeWired) return;
    window._modSwipeWired = true;

    var touchStartX = 0;
    var touchStartY = 0;
    var touchEndX = 0;
    var touchEndY = 0;
    var touchTargetIsSidebar = false;

    document.addEventListener("touchstart", function (e) {
      if (!config.useModUI) return;
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
        touchTargetIsSidebar = !!(e.target && e.target.closest("#sidebar"));
      }
    }, { passive: true });

    document.addEventListener("touchmove", function (e) {
      if (!config.useModUI) return;
      if (e.touches && e.touches.length === 1) {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener("touchend", function () {
      if (!config.useModUI) return;
      var dx = touchEndX - touchStartX;
      var dy = touchEndY - touchStartY;

      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (config.isStowed && dx > 35 && (touchTargetIsSidebar || touchStartX < 60)) {
          toggleStow();
        } else if (!config.isStowed && dx < -35 && touchTargetIsSidebar) {
          toggleStow();
        }
      }
    }, { passive: true });
  }

  function ensureSidebarDOM() {
    if (el("sidebar")) return;

    var sidebar = document.createElement("div");
    sidebar.id  = "sidebar";

    var header = document.createElement("div");
    header.id  = "header";

    var tray = el("ui-bar-tray");
    if (tray) {
      header.appendChild(tray);
    }

    var statsContainer = document.createElement("div");
    statsContainer.id  = "stats-container";
    header.appendChild(statsContainer);

    var tabBar = document.createElement("div");
    tabBar.id  = "tab-bar";

    var tabs = [
      { id: "visuals", label: "VISUALS" },
      { id: "attributes", label: "ATTRIBUTES" },
      { id: "settings", label: "SETTINGS" }
    ];

    tabs.forEach(function (t) {
      var btn = document.createElement("button");
      btn.className = "tab-btn" + (config.openPanels && config.openPanels[t.id] ? " active" : "");
      btn.setAttribute("data-tab", t.id);
      btn.textContent = t.label;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        togglePanel(t.id);
      });
      tabBar.appendChild(btn);
    });

    var masterToggle = document.createElement("button");
    masterToggle.id = "master-toggle";
    masterToggle.className = "toggle-btn";
    masterToggle.textContent = "▲";
    masterToggle.title = "Toggle Sidebar Panels";
    masterToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      toggleMasterPanels();
    });
    tabBar.appendChild(masterToggle);

    header.appendChild(tabBar);
    sidebar.appendChild(header);

    var body = document.createElement("div");
    body.id  = "panel-body";

    ["visuals", "attributes", "settings"].forEach(function (id) {
      var panel = document.createElement("div");
      panel.id  = "panel-" + id;
      panel.className = "panel" + (config.openPanels && config.openPanels[id] ? " active" : "");
      body.appendChild(panel);
    });

    sidebar.appendChild(body);
    document.body.appendChild(sidebar);
    wireGlobalSwipe();
  }

  function togglePanel(panelId) {
    if (!config.openPanels) {
      config.openPanels = { visuals: true, attributes: false, settings: false };
    }

    var isStacked = (config.storyLayout === "below" || config.storyLayout === "above");

    if (isStacked) {
      var currentlyOpen = !!config.openPanels[panelId];
      config.openPanels = { visuals: false, attributes: false, settings: false };
      config.openPanels[panelId] = !currentlyOpen;
    } else {
      config.openPanels[panelId] = !config.openPanels[panelId];
    }

    saveConfig();
    applyStates();
  }

  function toggleMasterPanels() {
    if (!config.openPanels) {
      config.openPanels = { visuals: true, attributes: false, settings: false };
    }

    var anyOpen = false;
    for (var k in config.openPanels) {
      if (config.openPanels[k]) anyOpen = true;
    }

    for (var id in config.openPanels) {
      config.openPanels[id] = !anyOpen;
    }

    saveConfig();
    applyStates();
  }

  function toggleStow() {
    config.isStowed = !config.isStowed;
    if (isMobileDevice()) {
      config.storyOffset = config.isStowed ? 25 : 20;
    }
    saveConfig();
    applyStates();
    applyConfig();
  }

  function applyStates() {
    var sidebar = el("sidebar");
    var uiBar   = el("ui-bar");

    var isStowedBool = !!config.isStowed;

    if (config.useModUI) {
      if (sidebar) sidebar.classList.toggle("stowed", isStowedBool);
      if (uiBar) uiBar.classList.toggle("stowed", isStowedBool);
      document.body.classList.toggle("mod-stowed", isStowedBool);
    } else {
      if (sidebar) sidebar.classList.remove("stowed");
      document.body.classList.remove("mod-stowed");
    }

    var toggleBtn = el("master-toggle");
    if (toggleBtn) {
      var anyOpen = false;
      if (config.openPanels) {
        for (var k in config.openPanels) {
          if (config.openPanels[k]) anyOpen = true;
        }
      }
      toggleBtn.textContent = anyOpen ? "▲" : "▼";
    }

    if (!config.openPanels) {
      config.openPanels = { visuals: true, attributes: false, settings: false };
    }

    var tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(function (btn) {
      var t = btn.getAttribute("data-tab");
      var isOpen = !isStowedBool && !!config.openPanels[t];
      btn.classList.toggle("active", isOpen);
    });

    ["visuals", "attributes", "settings"].forEach(function (id) {
      var p = el("panel-" + id);
      if (p) {
        var isOpen = !isStowedBool && !!config.openPanels[id];
        p.classList.toggle("active", isOpen);
      }
    });

    updateSidebarHeightVar();
  }

  function wireOriginalToggle() {
    var toggleBtn = el("ui-bar-toggle");
    if (toggleBtn && !toggleBtn.dataset.modWired) {
      toggleBtn.dataset.modWired = "1";
      toggleBtn.addEventListener("click", function (e) {
        if (config.useModUI) {
          e.stopPropagation();
          e.preventDefault();
          toggleStow();
        }
      });
    }
  }

  function wireStowedMobileStatsClick(mobStats) {
    if (!mobStats) return;
    var statElems = mobStats.querySelectorAll(".stat");
    statElems.forEach(function (elem) {
      var id = (elem.id || "").toLowerCase();
      var label = elem.getAttribute("aria-label") || elem.getAttribute("title") || id || "Stat";

      function updateTitle() {
        var textContent = (elem.textContent || "").trim();
        elem.setAttribute("title", label.toUpperCase() + ": " + textContent);
      }

      elem.onmouseenter = function () {
        if (!config.useModUI) return;
        updateTitle();
      };

      if (elem.dataset.modWired) return;
      elem.dataset.modWired = "1";
      elem.style.cursor = "pointer";
    });
  }

  function ensureUISettingsOverlay() {
    if (el("ui-settings-overlay-container")) return;

    var container = document.createElement("div");
    container.id = "ui-settings-overlay-container";
    container.className = "hidden";

    var win = document.createElement("div");
    win.id = "ui-settings-window";

    var titleHeader = document.createElement("div");
    titleHeader.className = "ui-settings-header-fixed";

    var title = document.createElement("h3");
    title.textContent = "UI SETTINGS";
    title.style.cssText = "margin:0; color:var(--accent); font-weight:bold;";

    var closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.className = "ui-settings-close-btn";
    closeBtn.addEventListener("click", function () {
      container.classList.add("hidden");
    });

    titleHeader.appendChild(title);
    titleHeader.appendChild(closeBtn);
    win.appendChild(titleHeader);

    var isMobile = isMobileDevice();

    var genBox = document.createElement("div");
    genBox.className = "custom-box";
    var genTitle = document.createElement("div");
    genTitle.className = "custom-title";
    genTitle.textContent = "General Layout & Sizes";
    genBox.appendChild(genTitle);

    genBox.appendChild(createCustomSelect("UI Layout Mode", [
      { label: "Tab UI (Mod)", val: "mod" },
      { label: "Classic Game UI", val: "classic" }
    ], config.useModUI ? "mod" : "classic", function (val) {
      config.useModUI = (val === "mod");
      config.isStowed = false;
      saveConfig();
      applyConfig();
      requestSync(true);
    }));

    var sLeftRow = document.createElement("div");
    sLeftRow.className = "custom-row";
    sLeftRow.style.cssText = "flex-direction:column; align-items:stretch; gap:4px;";

    var sLeftHeader = document.createElement("div");
    sLeftHeader.style.cssText = "display:flex; justify-content:space-between; align-items:center;";

    var sLeftLabel = document.createElement("label");
    sLeftLabel.textContent = "Sidebar Position (Below/Above Mode)";

    var sLeftRightDiv = document.createElement("div");
    sLeftRightDiv.style.cssText = "display:flex; align-items:center; gap:8px;";

    var sLeftValDisplay = document.createElement("span");
    sLeftValDisplay.style.cssText = "color:var(--accent); font-weight:bold; font-size:0.9em;";
    var curSLeftNum = parseInt(config.sidebarLeftOffset, 10) || 0;
    if (isMobile && curSLeftNum > 100) curSLeftNum = 100;
    sLeftValDisplay.textContent = curSLeftNum + "px";

    var resetSLeftBtn = document.createElement("button");
    resetSLeftBtn.textContent = "Reset Position";
    resetSLeftBtn.style.cssText = "padding:2px 6px; font-size:0.75em; cursor:pointer;";

    sLeftRightDiv.appendChild(sLeftValDisplay);
    sLeftRightDiv.appendChild(resetSLeftBtn);

    sLeftHeader.appendChild(sLeftLabel);
    sLeftHeader.appendChild(sLeftRightDiv);

    var sLeftSlider = document.createElement("input");
    sLeftSlider.type = "range";
    sLeftSlider.min = "0";
    sLeftSlider.max = isMobile ? "100" : "1200";
    sLeftSlider.step = "5";
    sLeftSlider.value = curSLeftNum;
    sLeftSlider.style.cssText = "width:100%; cursor:pointer;";

    var saveSLeftTimeout = null;
    sLeftSlider.addEventListener("input", function () {
      var val = parseInt(sLeftSlider.value, 10);
      sLeftValDisplay.textContent = val + "px";
      config.sidebarLeftOffset = val + "px";
      document.documentElement.style.setProperty("--sidebar-left-offset", val + "px");
      clearTimeout(saveSLeftTimeout);
      saveSLeftTimeout = setTimeout(function () {
        saveConfig();
      }, 300);
    });

    resetSLeftBtn.addEventListener("click", function () {
      sLeftSlider.value = "0";
      sLeftValDisplay.textContent = "0px";
      config.sidebarLeftOffset = "0px";
      document.documentElement.style.setProperty("--sidebar-left-offset", "0px");
      saveConfig();
    });

    sLeftRow.appendChild(sLeftHeader);
    sLeftRow.appendChild(sLeftSlider);

    function updateSLeftVisibility() {
      var isStacked = (config.storyLayout === "below" || config.storyLayout === "above");
      if (isStacked) {
        sLeftRow.style.setProperty("display", "flex", "important");
      } else {
        sLeftRow.style.setProperty("display", "none", "important");
      }
    }
    updateSLeftVisibility();

    genBox.appendChild(createCustomSelect("Story Position", [
      { label: "Side-by-Side / Overlay (Default)", val: "overlay" },
      { label: "Story Below Sidebar (Recommended for Mobile)", val: "below" },
      { label: "Story Above Sidebar (Recommended for Mobile)", val: "above" }
    ], config.storyLayout || (isMobile ? "below" : "overlay"), function (val) {
      config.storyLayout = val;
      updateSLeftVisibility();
      saveConfig();
      applyConfig();
    }));

    genBox.appendChild(sLeftRow);

    var pWidthRow = document.createElement("div");
    pWidthRow.className = "custom-row";
    pWidthRow.style.cssText = "flex-direction:column; align-items:stretch; gap:4px;";

    var pWidthHeader = document.createElement("div");
    pWidthHeader.style.cssText = "display:flex; justify-content:space-between; align-items:center;";

    var pWidthLabel = document.createElement("label");
    pWidthLabel.textContent = "Sidebar Size";

    var pWidthRightDiv = document.createElement("div");
    pWidthRightDiv.style.cssText = "display:flex; align-items:center; gap:8px;";

    var pWidthValDisplay = document.createElement("span");
    pWidthValDisplay.style.cssText = "color:var(--accent); font-weight:bold; font-size:0.9em;";
    
    var curPWidthNum = parseInt(config.panelWidth, 10) || 280;
    if (curPWidthNum < 260) curPWidthNum = 260;
    if (isMobile && curPWidthNum > 450) curPWidthNum = 450;
    pWidthValDisplay.textContent = curPWidthNum + "px";

    var resetPWidthBtn = document.createElement("button");
    resetPWidthBtn.textContent = "Reset Size";
    resetPWidthBtn.style.cssText = "padding:2px 6px; font-size:0.75em; cursor:pointer;";

    pWidthRightDiv.appendChild(pWidthValDisplay);
    pWidthRightDiv.appendChild(resetPWidthBtn);

    pWidthHeader.appendChild(pWidthLabel);
    pWidthHeader.appendChild(pWidthRightDiv);

    var pWidthSlider = document.createElement("input");
    pWidthSlider.type = "range";
    pWidthSlider.min = "260";
    pWidthSlider.max = isMobile ? "450" : "600";
    pWidthSlider.step = "5";
    pWidthSlider.value = curPWidthNum;
    pWidthSlider.style.cssText = "width:100%; cursor:pointer;";

    var savePWidthTimeout = null;
    pWidthSlider.addEventListener("input", function () {
      var val = parseInt(pWidthSlider.value, 10);
      pWidthValDisplay.textContent = val + "px";
      config.panelWidth = val + "px";
      applyConfig();
      clearTimeout(savePWidthTimeout);
      savePWidthTimeout = setTimeout(function () {
        saveConfig();
      }, 300);
    });

    resetPWidthBtn.addEventListener("click", function () {
      pWidthSlider.value = "280";
      pWidthValDisplay.textContent = "280px";
      config.panelWidth = "280px";
      applyConfig();
      saveConfig();
    });

    pWidthRow.appendChild(pWidthHeader);
    pWidthRow.appendChild(pWidthSlider);
    genBox.appendChild(pWidthRow);

    var sliderRow = document.createElement("div");
    sliderRow.className = "custom-row";
    sliderRow.style.cssText = "flex-direction:column; align-items:stretch; gap:4px;";

    var sliderHeader = document.createElement("div");
    sliderHeader.className = "slider-header";

    var sliderLabel = document.createElement("label");
    sliderLabel.textContent = "Story Text Offset";

    var sliderRightDiv = document.createElement("div");
    sliderRightDiv.className = "slider-right";

    var sliderValDisplay = document.createElement("span");
    sliderValDisplay.style.cssText = "color:var(--accent); font-weight:bold; font-size:0.9em;";
    
    var curOffsetNum = parseInt(config.storyOffset, 10);
    if (isNaN(curOffsetNum) || curOffsetNum < 0) curOffsetNum = isMobile ? 20 : 300;
    sliderValDisplay.textContent = curOffsetNum + "px";

    var resetOffsetBtn = document.createElement("button");
    resetOffsetBtn.textContent = "Reset Offset";
    resetOffsetBtn.style.cssText = "padding:2px 6px; font-size:0.75em; cursor:pointer;";

    sliderRightDiv.appendChild(sliderValDisplay);
    sliderRightDiv.appendChild(resetOffsetBtn);

    sliderHeader.appendChild(sliderLabel);
    sliderHeader.appendChild(sliderRightDiv);

    var offsetSlider = document.createElement("input");
    offsetSlider.type = "range";
    offsetSlider.min = "0";
    offsetSlider.max = isMobile ? "600" : "1000";
    offsetSlider.step = "5";
    offsetSlider.value = curOffsetNum;
    offsetSlider.style.cssText = "width:100%; cursor:pointer;";

    var saveOffsetTimeout = null;
    offsetSlider.addEventListener("input", function () {
      var val = parseInt(offsetSlider.value, 10);
      sliderValDisplay.textContent = val + "px";
      config.storyOffset = val;
      document.documentElement.style.setProperty("--story-offset", val + "px");
      document.body.style.setProperty("--story-offset", val + "px");
      clearTimeout(saveOffsetTimeout);
      saveOffsetTimeout = setTimeout(function () {
        saveConfig();
      }, 300);
    });

    resetOffsetBtn.addEventListener("click", function () {
      var defaultVal = isMobile ? 20 : 300;
      offsetSlider.value = defaultVal;
      sliderValDisplay.textContent = defaultVal + "px";
      config.storyOffset = defaultVal;
      document.documentElement.style.setProperty("--story-offset", defaultVal + "px");
      document.body.style.setProperty("--story-offset", defaultVal + "px");
      saveConfig();
    });

    sliderRow.appendChild(sliderHeader);
    sliderRow.appendChild(offsetSlider);
    genBox.appendChild(sliderRow);

    var svOpRow = document.createElement("div");
    svOpRow.className = "custom-row";
    svOpRow.style.cssText = "flex-direction:column; align-items:stretch; gap:4px;";
    
    var svOpHeader = document.createElement("div");
    svOpHeader.style.cssText = "display:flex; justify-content:space-between; align-items:center;";
    
    var svOpLabel = document.createElement("label");
    svOpLabel.textContent = "Sideview Mirror Opacity";

    var svOpRightDiv = document.createElement("div");
    svOpRightDiv.style.cssText = "display:flex; align-items:center; gap:8px;";

    var svOpValDisplay = document.createElement("span");
    svOpValDisplay.style.cssText = "color:var(--accent); font-weight:bold; font-size:0.9em;";
    svOpValDisplay.textContent = (typeof config.sideviewOpacity !== "undefined" ? config.sideviewOpacity : 100) + "%";

    var resetSvOpBtn = document.createElement("button");
    resetSvOpBtn.textContent = "Reset Opacity";
    resetSvOpBtn.style.cssText = "padding:2px 6px; font-size:0.75em; cursor:pointer;";

    svOpRightDiv.appendChild(svOpValDisplay);
    svOpRightDiv.appendChild(resetSvOpBtn);

    svOpHeader.appendChild(svOpLabel);
    svOpHeader.appendChild(svOpRightDiv);

    var svOpSlider = document.createElement("input");
    svOpSlider.type = "range";
    svOpSlider.min = "0";
    svOpSlider.max = "100";
    svOpSlider.step = "5";
    svOpSlider.value = (typeof config.sideviewOpacity !== "undefined") ? config.sideviewOpacity : 100;
    svOpSlider.style.cssText = "width:100%; cursor:pointer;";

    svOpSlider.addEventListener("input", function () {
      var val = parseInt(svOpSlider.value, 10);
      svOpValDisplay.textContent = val + "%";
      config.sideviewOpacity = val;
      config.sideviewEnabled = (val > 0);
      saveConfig();
      applyConfig();
    });

    resetSvOpBtn.addEventListener("click", function () {
      svOpSlider.value = "100";
      svOpValDisplay.textContent = "100%";
      config.sideviewOpacity = 100;
      config.sideviewEnabled = true;
      saveConfig();
      applyConfig();
    });

    svOpRow.appendChild(svOpHeader);
    svOpRow.appendChild(svOpSlider);
    genBox.appendChild(svOpRow);

    genBox.appendChild(createCustomSelect("Sideview Mirror Side", [
      { label: "Right Side", val: "right" },
      { label: "Left Side",  val: "left" }
    ], config.sideviewSide || "right", function (val) {
      config.sideviewSide = val;
      saveConfig();
      applyConfig();
    }));

    genBox.appendChild(createCustomRow("Money/Time Stat in Visuals", "checkbox", config.statsInVisuals, function (val) {
      config.statsInVisuals = val;
      saveConfig();
      applyConfig();
      requestSync(true);
    }));

    genBox.appendChild(createCustomRow("Compact Statbars", "checkbox", config.compactStats, function (val) {
      config.compactStats = val;
      saveConfig();
      applyConfig();
    }));

    genBox.appendChild(createCustomRow("Disable Paperdoll Detection", "checkbox", config.disablePaperdoll, function (val) {
      config.disablePaperdoll = val;
      cachedPaperdollActive = null;
      saveConfig();
      applyConfig();
      updateStageHeight();
      scheduleStageHeightRetries();
    }));

    win.appendChild(genBox);

    var colorGridTable = document.createElement("div");
    colorGridTable.className = "color-grid";

    var boxBtn = document.createElement("div");
    boxBtn.className = "custom-box";
    var titleBtn = document.createElement("div");
    titleBtn.className = "custom-title";
    titleBtn.textContent = "Button Inner Colors";
    boxBtn.appendChild(titleBtn);

    var cBtnInputRow = createCustomRow("Custom Color", "color", getActiveBtnHex(), function (val) {
      config.customBtnColor = val;
      config.btnTheme = "custom";
      saveConfig();
      applyConfig();
    });

    var selectBtnPreset = createCustomSelect("Preset", [
      { label: "Default Dark Slate", val: "default" },
      { label: "Midnight Purple",   val: "purple" },
      { label: "Deep Crimson",      val: "crimson" },
      { label: "Ocean Navy",        val: "navy" },
      { label: "Forest Emerald",    val: "emerald" },
      { label: "Custom Inner Color", val: "custom" }
    ], config.btnTheme, function (val) {
      config.btnTheme = val;
      var colorInput = cBtnInputRow.querySelector("input[type='color']");
      if (colorInput) colorInput.value = getActiveBtnHex();
      saveConfig();
      applyConfig();
    });

    var selectBtnStyle = createCustomSelect("Button Material Style", [
      { label: "Solid",   val: "solid" },
      { label: "Flat",    val: "flat" },
      { label: "Neon",    val: "neon" },
      { label: "Clay",    val: "clay" },
      { label: "Radiant", val: "radiant" },
      { label: "Cyber",   val: "cyber" }
    ], config.btnStyle || "solid", function (val) {
      config.btnStyle = val;
      saveConfig();
      applyConfig();
    });

    boxBtn.appendChild(selectBtnPreset);
    boxBtn.appendChild(selectBtnStyle);
    boxBtn.appendChild(cBtnInputRow);
    colorGridTable.appendChild(boxBtn);

    var boxBase = document.createElement("div");
    boxBase.className = "custom-box";
    var titleBase = document.createElement("div");
    titleBase.className = "custom-title";
    titleBase.textContent = "Base UI Theme";
    boxBase.appendChild(titleBase);

    var cBaseInputRow = createCustomRow("Custom Base", "color", getActiveBaseHex(), function (val) {
      config.customBase = val;
      config.baseTheme = "custom";
      saveConfig();
      applyConfig();
    });

    var selectBasePreset = createCustomSelect("Preset", [
      { label: "Default (Game Theme)", val: "game" },
      { label: "Midnight Dark",        val: "midnight" },
      { label: "Obsidian Black",       val: "obsidian" },
      { label: "Deep Navy",            val: "navy" },
      { label: "Charcoal Gray",        val: "charcoal" },
      { label: "Warm Espresso",        val: "espresso" },
      { label: "Nordic Slate",         val: "nordic" },
      { label: "Custom Base Color",    val: "custom" }
    ], config.baseTheme, function (val) {
      config.baseTheme = val;
      var colorInput = cBaseInputRow.querySelector("input[type='color']");
      if (colorInput) colorInput.value = getActiveBaseHex();
      saveConfig();
      applyConfig();
    });

    boxBase.appendChild(selectBasePreset);
    boxBase.appendChild(cBaseInputRow);
    colorGridTable.appendChild(boxBase);

    var boxAccent = document.createElement("div");
    boxAccent.className = "custom-box";
    var titleAccent = document.createElement("div");
    titleAccent.className = "custom-title";
    titleAccent.textContent = "UI Accent Color";
    boxAccent.appendChild(titleAccent);

    var cAccentInputRow = createCustomRow("Custom Accent", "color", getActiveAccentHex(), function (val) {
      config.customAccent = val;
      config.accentColor = "custom";
      saveConfig();
      applyConfig();
    });

    var selectAccentPreset = createCustomSelect("Preset", [
      { label: "Default (Game Accent)", val: "game" },
      { label: "Gold",                  val: "gold" },
      { label: "Purple",                val: "purple" },
      { label: "Cyan",                  val: "cyan" },
      { label: "Emerald Green",         val: "green" },
      { label: "Crimson Red",           val: "red" },
      { label: "Rose Pink",             val: "pink" },
      { label: "Slate Silver",          val: "silver" },
      { label: "Amber Orange",          val: "amber" },
      { label: "Custom Accent Color",   val: "custom" }
    ], config.accentColor, function (val) {
      config.accentColor = val;
      var colorInput = cAccentInputRow.querySelector("input[type='color']");
      if (colorInput) colorInput.value = getActiveAccentHex();
      saveConfig();
      applyConfig();
    });

    boxAccent.appendChild(selectAccentPreset);
    boxAccent.appendChild(cAccentInputRow);
    colorGridTable.appendChild(boxAccent);

    var boxStoryAccent = document.createElement("div");
    boxStoryAccent.className = "custom-box";
    var titleStoryAccent = document.createElement("div");
    titleStoryAccent.className = "custom-title";
    titleStoryAccent.textContent = "Story Text Accent";
    boxStoryAccent.appendChild(titleStoryAccent);

    var cStoryAccentInputRow = createCustomRow("Custom Accent", "color", getActiveStoryAccentHex(), function (val) {
      config.customStoryAccent = val;
      config.storyAccentColor = "custom";
      saveConfig();
      applyConfig();
    });

    var selectStoryAccentPreset = createCustomSelect("Preset", [
      { label: "Match UI Accent Color", val: "ui" },
      { label: "Default (Game Native)", val: "game" },
      { label: "Gold",                  val: "gold" },
      { label: "Purple",                val: "purple" },
      { label: "Cyan",                  val: "cyan" },
      { label: "Emerald Green",         val: "green" },
      { label: "Crimson Red",           val: "red" },
      { label: "Rose Pink",             val: "pink" },
      { label: "Slate Silver",          val: "silver" },
      { label: "Amber Orange",          val: "amber" },
      { label: "Custom Accent Color",   val: "custom" }
    ], config.storyAccentColor || "ui", function (val) {
      config.storyAccentColor = val;
      var colorInput = cStoryAccentInputRow.querySelector("input[type='color']");
      if (colorInput) colorInput.value = getActiveStoryAccentHex();
      saveConfig();
      applyConfig();
    });

    boxStoryAccent.appendChild(selectStoryAccentPreset);
    boxStoryAccent.appendChild(cStoryAccentInputRow);
    colorGridTable.appendChild(boxStoryAccent);

    win.appendChild(colorGridTable);

    var mgrBox = document.createElement("div");
    mgrBox.className = "custom-box";
    var mgrTitle = document.createElement("div");
    mgrTitle.className = "custom-title";
    mgrTitle.textContent = "Custom Themes Manager";
    mgrBox.appendChild(mgrTitle);

    var saveRow = document.createElement("div");
    saveRow.className = "custom-row";
    saveRow.style.cssText = "display:flex; flex-wrap:wrap; gap:6px; width:100%; box-sizing:border-box;";
    
    var saveInput = document.createElement("input");
    saveInput.type = "text";
    saveInput.placeholder = "Theme Name...";
    saveInput.style.cssText = "flex:1 1 120px; min-width:0; max-width:100%; box-sizing:border-box;";
    
    var saveBtn = document.createElement("button");
    saveBtn.textContent = "Save Preset";
    saveBtn.style.cssText = "flex:0 0 auto; padding:4px 8px; cursor:pointer; box-sizing:border-box;";
    
    saveRow.appendChild(saveInput);
    saveRow.appendChild(saveBtn);
    mgrBox.appendChild(saveRow);

    var presetRow = document.createElement("div");
    presetRow.className = "custom-row";
    presetRow.style.cssText = "display:flex; flex-wrap:wrap; gap:6px; width:100%; box-sizing:border-box;";
    
    var presetSelect = document.createElement("select");
    presetSelect.style.cssText = "flex:1 1 120px; min-width:0; max-width:100%; box-sizing:border-box;";

    function updatePresetSelect() {
      presetSelect.innerHTML = "";
      config.savedThemes = config.savedThemes || {};
      var keys = Object.keys(config.savedThemes);
      if (keys.length === 0) {
        var o = document.createElement("option");
        o.textContent = "(No Saved Presets)";
        presetSelect.appendChild(o);
      } else {
        keys.forEach(function (k) {
          var o = document.createElement("option");
          o.value = k;
          o.textContent = k;
          presetSelect.appendChild(o);
        });
      }
    }

    updatePresetSelect();

    var loadBtn = document.createElement("button");
    loadBtn.textContent = "Load";
    loadBtn.style.cssText = "padding:4px 8px; cursor:pointer;";

    var delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.cssText = "padding:4px 8px; cursor:pointer;";

    presetRow.appendChild(presetSelect);
    presetRow.appendChild(loadBtn);
    presetRow.appendChild(delBtn);
    mgrBox.appendChild(presetRow);

    saveBtn.addEventListener("click", function () {
      var name = (saveInput.value || "").trim();
      if (!name) return;
      config.savedThemes = config.savedThemes || {};
      config.savedThemes[name] = {
        baseTheme: config.baseTheme,
        customBase: config.customBase,
        accentColor: config.accentColor,
        customAccent: config.customAccent,
        storyAccentColor: config.storyAccentColor,
        customStoryAccent: config.customStoryAccent,
        btnTheme: config.btnTheme,
        btnStyle: config.btnStyle,
        customBtnColor: config.customBtnColor
      };
      saveConfig();
      saveInput.value = "";
      updatePresetSelect();
    });

    loadBtn.addEventListener("click", function () {
      var selected = presetSelect.value;
      if (selected && config.savedThemes && config.savedThemes[selected]) {
        var theme = config.savedThemes[selected];
        config.baseTheme = theme.baseTheme || "midnight";
        config.customBase = theme.customBase || "#0d0d12";
        config.accentColor = theme.accentColor || "gold";
        config.customAccent = theme.customAccent || "#ffd700";
        config.storyAccentColor = theme.storyAccentColor || "ui";
        config.customStoryAccent = theme.customStoryAccent || "#ffd700";
        config.btnTheme = theme.btnTheme || "default";
        config.btnStyle = theme.btnStyle || "solid";
        config.customBtnColor = theme.customBtnColor || "#26262a";
        saveConfig();
        applyConfig();
        var existing = el("ui-settings-overlay-container");
        if (existing) existing.remove();
        openUISettingsOverlay();
      }
    });

    delBtn.addEventListener("click", function () {
      var selected = presetSelect.value;
      if (selected && config.savedThemes && config.savedThemes[selected]) {
        delete config.savedThemes[selected];
        saveConfig();
        updatePresetSelect();
      }
    });

    var ioRow = document.createElement("div");
    ioRow.className = "custom-row io-row";
    ioRow.style.cssText = "flex-direction:column; align-items:stretch; width:100%; box-sizing:border-box;";

    var ioText = document.createElement("textarea");
    ioText.placeholder = "Export/Import Theme Code...";
    ioText.style.cssText = "width:100%; max-width:100%; height:50px; margin-bottom:6px; box-sizing:border-box; resize:vertical;";

    var ioBtnContainer = document.createElement("div");
    ioBtnContainer.style.cssText = "display:flex; justify-content:space-between; gap:6px; width:100%; box-sizing:border-box;";

    var exportBtn = document.createElement("button");
    exportBtn.textContent = "Export Theme";
    exportBtn.style.cssText = "flex:1; padding:4px 8px; cursor:pointer;";

    var importBtn = document.createElement("button");
    importBtn.textContent = "Import Theme";
    importBtn.style.cssText = "flex:1; padding:4px 8px; cursor:pointer;";

    exportBtn.addEventListener("click", function () {
      var data = {
        baseTheme: config.baseTheme,
        customBase: config.customBase,
        accentColor: config.accentColor,
        customAccent: config.customAccent,
        storyAccentColor: config.storyAccentColor,
        customStoryAccent: config.customStoryAccent,
        btnTheme: config.btnTheme,
        btnStyle: config.btnStyle,
        customBtnColor: config.customBtnColor,
        savedThemes: config.savedThemes || {}
      };
      ioText.value = JSON.stringify(data);
    });

    importBtn.addEventListener("click", function () {
      try {
        var data = JSON.parse(ioText.value);
        if (data) {
          if (data.baseTheme) config.baseTheme = data.baseTheme;
          if (data.customBase) config.customBase = data.customBase;
          if (data.accentColor) config.accentColor = data.accentColor;
          if (data.customAccent) config.customAccent = data.customAccent;
          if (data.storyAccentColor) config.storyAccentColor = data.storyAccentColor;
          if (data.customStoryAccent) config.customStoryAccent = data.customStoryAccent;
          if (data.btnTheme) config.btnTheme = data.btnTheme;
          if (data.btnStyle) config.btnStyle = data.btnStyle;
          if (data.customBtnColor) config.customBtnColor = data.customBtnColor;
          if (data.savedThemes) config.savedThemes = data.savedThemes;
          saveConfig();
          applyConfig();
          var existing = el("ui-settings-overlay-container");
          if (existing) existing.remove();
          openUISettingsOverlay();
        }
      } catch (err) {
        alert("Invalid Theme Code!");
      }
    });
    
    ioBtnContainer.appendChild(exportBtn);
    ioBtnContainer.appendChild(importBtn);
    ioRow.appendChild(ioText);
    ioRow.appendChild(ioBtnContainer);
    mgrBox.appendChild(ioRow);

    win.appendChild(mgrBox);

    container.appendChild(win);

    container.addEventListener("click", function (e) {
      if (e.target === container) {
        container.classList.add("hidden");
      }
    });

    document.body.appendChild(container);
  }

  function openUISettingsOverlay() {
    ensureUISettingsOverlay();
    var container = el("ui-settings-overlay-container");
    if (container) container.classList.remove("hidden");
  }

  var cachedPaperdollActive = null;

  function isPaperdollEnabled() {
    if (config.disablePaperdoll) return false;
    if (cachedPaperdollActive !== null) return cachedPaperdollActive;
    if (window.V && window.V.options) {
      var pd = window.V.options.paperdoll;
      if (pd === true || pd === 1 || pd === "enabled") {
        cachedPaperdollActive = true;
        return true;
      }
    }
    if (document.querySelector("#imgInv2, .mainCanvasnobonder, #paperdoll, .paperdollCanvas")) {
      cachedPaperdollActive = true;
      return true;
    }
    cachedPaperdollActive = false;
    return false;
  }

  function getNativeVisualHeight(scaler) {
    if (config.disablePaperdoll) {
      return 192;
    }
    var imgElem = (scaler ? scaler.querySelector("#img") : null) || el("img") || document.querySelector("#img");
    if (imgElem) {
      var h = imgElem.offsetHeight || imgElem.naturalHeight || imgElem.height;
      if (h && h > 50) return h;
    }
    return isPaperdollEnabled() ? 236 : 192;
  }

  function updateStageHeight() {
    var stage = el("visual-stage");
    var scaler = el("stage-scaler");
    if (!stage || !scaler) return;
    var scale = parseFloat(document.documentElement.style.getPropertyValue("--stage-scale")) || 1;
    var nativeH = getNativeVisualHeight(scaler);
    stage.style.height = Math.round(nativeH * scale) + "px";
  }

  function scheduleStageHeightRetries() {
    updateStageHeight();
    setTimeout(updateStageHeight, 50);
    setTimeout(updateStageHeight, 150);
    setTimeout(updateStageHeight, 300);
    setTimeout(updateStageHeight, 600);
  }

  function syncContent() {
    applySidebarFontOptions();

    if (!config.useModUI) {
      applyConfig();
      return;
    }

    ensureSidebarDOM();

    var sidebar     = el("sidebar");
    var headerStats = el("stats-container");
    var pVis        = el("panel-visuals");
    var pAttr       = el("panel-attributes");
    var pSet        = el("panel-settings");

    if (!pVis || !pAttr || !pSet || !headerStats) return;

    var attrKeywords = ["CHARACTERISTICS", "ATTRIBUTES", "SOCIAL", "TRAITS", "JOURNAL", "STATS", "FEATS"];
    var blacklistedTexts = ["RESTART", "SHARE", "SHARES", "SETTINGS", "UI SETTINGS"];

    var overlayButtons = el("overlayButtons") || document.querySelector("#overlayButtons");
    var captionContent = el("storyCaptionContent") || document.querySelector("#storyCaptionContent");
    var captionDiv     = el("storyCaptionDiv") || document.querySelector("#storyCaptionDiv");
    var storyCap       = el("story-caption") || document.querySelector("#story-caption");
    var uiBarBody      = el("ui-bar-body") || document.querySelector("#ui-bar-body");
    var currentPassage = (window.SugarCube && SugarCube.State) ? SugarCube.State.passage : (window.V ? window.V.passage : "");
    var isStartPassage = (currentPassage === "Start" || currentPassage === "Start Pass" || !currentPassage);

    var nativeStartCap = el("startCaption") || document.querySelector("#startCaption");
    if (nativeStartCap) {
      var isNativeInStory = !!(nativeStartCap.closest("#storyCaptionContent") || nativeStartCap.closest("#storyCaptionDiv") || nativeStartCap.closest("#story"));

      if (!isStartPassage && !isNativeInStory) {
        nativeStartCap.remove();
        nativeStartCap = null;
      }
    }

    var rescuedStats = el("stats") || document.querySelector("#stats");
    if (rescuedStats && rescuedStats.parentElement) {
      rescuedStats.parentElement.removeChild(rescuedStats);
    }

    var rescuedSky = el("canvasSkybox") || document.querySelector("#canvasSkybox");
    if (rescuedSky && rescuedSky.parentElement) {
      rescuedSky.parentElement.removeChild(rescuedSky);
    }

    var rescuedImgWrap = el("sidebar-img-container") || document.querySelector("#sidebar-img-container");
    if (rescuedImgWrap && rescuedImgWrap.parentElement) {
      rescuedImgWrap.parentElement.removeChild(rescuedImgWrap);
    }

    var rescuedStatMeters = el("statmeters") || document.querySelector("#statmeters");
    if (rescuedStatMeters && rescuedStatMeters.parentElement) {
      rescuedStatMeters.parentElement.removeChild(rescuedStatMeters);
    }

    var rescuedCaptionContent = el("storyCaptionContent") || document.querySelector("#storyCaptionContent");
    if (rescuedCaptionContent && rescuedCaptionContent.parentElement) {
      rescuedCaptionContent.parentElement.removeChild(rescuedCaptionContent);
    }

    var rescuedStartCap = el("startCaption") || document.querySelector("#startCaption");
    if (rescuedStartCap && rescuedStartCap.parentElement) {
      rescuedStartCap.parentElement.removeChild(rescuedStartCap);
    }

    var allSourceBtns = [];
    var seenTexts = {};

    function isButtonValidAndEnabled(b) {
      if (!b) return false;
      if (b.disabled || b.hasAttribute("disabled") || b.getAttribute("disabled") === "disabled") return false;
      if (b.getAttribute("aria-disabled") === "true") return false;
      if (b.classList.contains("disabled") || b.classList.contains("hidden")) return false;
      if (b.style && (b.style.display === "none" || b.style.visibility === "hidden")) return false;
      return true;
    }

    function collectButtonsFrom(container) {
      if (!container) return;
      var btns = Array.from(container.querySelectorAll("button, .macro-button"));
      btns.forEach(function (b) {
        if (b.closest("#menu") || b.closest(".menu")) return;
        if (b.id === "ui-toggle-btn" || b.id === "master-toggle" || b.id === "ui-settings-btn" || b.id === "start-ui-settings-btn" || b.id === "classic-ui-settings-btn" || b.classList.contains("statmeter-arrow") || b.classList.contains("tab-btn")) {
          return;
        }

        if (!isButtonValidAndEnabled(b)) return;

        var txt = (b.textContent || "").trim().toUpperCase();
        if (!txt || txt.length < 2) return;
        if (blacklistedTexts.indexOf(txt) !== -1) return;

        if (!seenTexts[txt]) {
          seenTexts[txt] = true;
          allSourceBtns.push(b);
        }
      });
    }

    var freshNativeBtns = [];
    var nativeContainers = [overlayButtons, captionContent, captionDiv, storyCap, uiBarBody, nativeStartCap];
    
    nativeContainers.forEach(function (container) {
      if (!container) return;
      var btns = Array.from(container.querySelectorAll("button, .macro-button"));
      btns.forEach(function (b) {
        if (b.closest("#menu") || b.closest(".menu") || b.closest("#sidebar")) return;
        if (b.id === "ui-toggle-btn" || b.id === "master-toggle" || b.id === "ui-settings-btn" || b.id === "start-ui-settings-btn" || b.id === "classic-ui-settings-btn" || b.classList.contains("statmeter-arrow") || b.classList.contains("tab-btn")) return;
        if (!isButtonValidAndEnabled(b)) return;
        var txt = (b.textContent || "").trim().toUpperCase();
        if (!txt || txt.length < 2 || blacklistedTexts.indexOf(txt) !== -1) return;
        freshNativeBtns.push(b);
      });
    });

    var hasFreshNativeBtns = (freshNativeBtns.length > 0);

    collectButtonsFrom(overlayButtons);
    collectButtonsFrom(captionContent);
    collectButtonsFrom(captionDiv);
    collectButtonsFrom(storyCap);
    collectButtonsFrom(uiBarBody);
    collectButtonsFrom(nativeStartCap);

    if (!hasFreshNativeBtns) {
      collectButtonsFrom(pAttr);
      collectButtonsFrom(pSet);
    }

    var rayIcons = document.querySelectorAll("#rayseticon");
    if (rayIcons.length > 1) {
      for (var r = 1; r < rayIcons.length; r++) {
        rayIcons[r].remove();
      }
    }

    var existingUISetBtn = el("ui-settings-btn");
    var oldClassicBtn = el("classic-ui-settings-btn");
    if (oldClassicBtn) oldClassicBtn.remove();

    headerStats.innerHTML = "";
    pVis.innerHTML = "";
    pAttr.innerHTML = "";
    pSet.innerHTML = "";

    var attrBtns = document.createElement("div");
    attrBtns.id = "attr-buttons";
    attrBtns.className = "btn-grid";

    var setBtns = document.createElement("div");
    setBtns.id = "set-buttons";
    setBtns.className = "btn-grid";

    if (nativeStartCap && isStartPassage) {
      if (sidebar) sidebar.classList.add("mod-start-menu");
      if (pVis && nativeStartCap.parentElement !== pVis) {
        pVis.appendChild(nativeStartCap);
      }

      var storyTitle = el("story-title");
      var titleText = (storyTitle ? storyTitle.innerHTML : "").trim() || (window.Story && Story.title ? Story.title : "Degrees of Lewdity");
      if (titleText) {
        var existingModTitle = nativeStartCap.querySelector("#start-story-title");
        if (!existingModTitle) {
          existingModTitle = document.createElement("h1");
          existingModTitle.id = "start-story-title";
          existingModTitle.className = "title";
          existingModTitle.style.cssText = "margin-bottom:0px !important; padding-bottom:50px !important; text-align:center; color:var(--accent); font-weight:bold; font-size:1.8em; text-shadow:0 0 8px var(--accent, #ffd700), 0 0 16px rgba(255, 215, 0, 0.4);";
          nativeStartCap.insertBefore(existingModTitle, nativeStartCap.firstChild);
        }
        existingModTitle.innerHTML = titleText;
      }

      var startImg = el("startingPlayerImage") || document.querySelector("#startingPlayerImage") || el("startImg");
      if (startImg) {
        var topTitle = nativeStartCap.querySelector("#start-story-title") || nativeStartCap.querySelector("h1, h2, .title");
        if (topTitle && topTitle.nextSibling !== startImg && topTitle.parentElement === nativeStartCap) {
          nativeStartCap.insertBefore(startImg, topTitle.nextSibling);
        }
      }

      var startActionBtns = Array.from(nativeStartCap.querySelectorAll("button, .macro-button")).filter(function (b) {
        if (b.id === "start-ui-settings-btn" || b.id === "ui-toggle-btn" || b.id === "classic-ui-settings-btn") return false;
        var txt = (b.textContent || "").toUpperCase().trim();
        return txt.length > 1;
      });

      var extraBtnsContainer = nativeStartCap.querySelector(".start-extra-btns");
      if (!extraBtnsContainer) {
        extraBtnsContainer = document.createElement("div");
        extraBtnsContainer.className = "start-extra-btns";
        extraBtnsContainer.style.cssText = "margin-bottom:8px; display:flex; flex-direction:column; gap:6px;";
        nativeStartCap.appendChild(extraBtnsContainer);
      }

      var mainActionGrid = nativeStartCap.querySelector(".start-btn-grid");
      if (!mainActionGrid) {
        mainActionGrid = document.createElement("div");
        mainActionGrid.className = "start-btn-grid";
        nativeStartCap.appendChild(mainActionGrid);
      }

      if (mainActionGrid.parentElement === nativeStartCap && extraBtnsContainer.nextSibling !== mainActionGrid) {
        nativeStartCap.insertBefore(extraBtnsContainer, mainActionGrid);
      }

      var saveStartBtn = null;
      var optionsStartBtn = null;
      var featsStartBtn = null;
      var otherStartBtns = [];

      startActionBtns.forEach(function (btn) {
        var txt = (btn.textContent || "").toUpperCase().trim();
        if (txt.indexOf("SAVE") !== -1) {
          saveStartBtn = btn;
        } else if (txt.indexOf("OPTION") !== -1) {
          optionsStartBtn = btn;
        } else if (txt.indexOf("FEAT") !== -1) {
          featsStartBtn = btn;
        } else {
          otherStartBtns.push(btn);
        }
      });

      otherStartBtns.forEach(function (btn) {
        btn.classList.add("btn-full");
        btn.style.cssText = "width:100% !important; max-width:100% !important; border-radius:7px !important;";
        if (btn.parentElement !== extraBtnsContainer) {
          extraBtnsContainer.appendChild(btn);
        }
      });

      if (saveStartBtn) {
        saveStartBtn.classList.add("btn-full");
        if (saveStartBtn.parentElement !== mainActionGrid) {
          mainActionGrid.appendChild(saveStartBtn);
        }
      }

      if (optionsStartBtn || featsStartBtn) {
        var bottomPairRow = mainActionGrid.querySelector(".start-bottom-row");
        if (!bottomPairRow) {
          bottomPairRow = document.createElement("div");
          bottomPairRow.className = "start-bottom-row";
          mainActionGrid.appendChild(bottomPairRow);
        }
        if (optionsStartBtn) {
          optionsStartBtn.classList.remove("btn-full");
          if (optionsStartBtn.parentElement !== bottomPairRow) {
            bottomPairRow.appendChild(optionsStartBtn);
          }
        }
        if (featsStartBtn) {
          featsStartBtn.classList.remove("btn-full");
          if (featsStartBtn.parentElement !== bottomPairRow) {
            bottomPairRow.appendChild(featsStartBtn);
          }
        }
      }

      var existingStartUISet = nativeStartCap.querySelector("#start-ui-settings-btn");
      if (!existingStartUISet) {
        var startUISetBtn = document.createElement("button");
        startUISetBtn.id = "start-ui-settings-btn";
        startUISetBtn.className = "macro-button btn-full";
        startUISetBtn.textContent = "UI SETTINGS";
        startUISetBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          e.preventDefault();
          openUISettingsOverlay();
        });
        nativeStartCap.appendChild(startUISetBtn);
      }

      wireOriginalToggle();
      applyStates();
      applyConfig();
      return;
    } else {
      if (sidebar) sidebar.classList.remove("mod-start-menu");
    }
    
    /* 1. Stats Bar Placement */
    var statsElem = rescuedStats || el("stats") || document.querySelector("#stats");
    if (statsElem) {
      if (!config.statsInVisuals) {
        headerStats.appendChild(statsElem);
      }
      statsElem.style.display = "block";
      statsElem.style.visibility = "visible";
      wireStatsClick(statsElem);
    }

    /* 2. Visual Stage & Scaled Base Host */
    var stage = document.createElement("div");
    stage.id = "visual-stage";

    var stageScaler = document.createElement("div");
    stageScaler.id = "stage-scaler";
    stage.appendChild(stageScaler);

    var sky     = rescuedSky || el("canvasSkybox") || document.querySelector("#canvasSkybox");
    var imgWrap = rescuedImgWrap || el("sidebar-img-container") || document.querySelector("#sidebar-img-container");

    if (sky) stageScaler.appendChild(sky);
    if (imgWrap) stageScaler.appendChild(imgWrap);

    var rayIds = ["imgInv", "imgInv2", "imgInv3", "rayseticon", "characterTemperature", "characterTemperatureTooltip", "spray", "condoms"];
    rayIds.forEach(function (id) {
      var elem = el(id) || document.querySelector("#" + id);
      if (elem && !stageScaler.contains(elem)) {
        stageScaler.appendChild(elem);
      }
    });

    var rayClasses = [".spray-shelf", ".condoms-sidebar", ".pepper-sprays"];
    rayClasses.forEach(function (cls) {
      var elem = document.querySelector(cls);
      if (elem && !stageScaler.contains(elem)) {
        stageScaler.appendChild(elem);
      }
    });

    pVis.appendChild(stage);

    var visScrollWrap = document.createElement("div");
    visScrollWrap.id = "visuals-statmeters-wrap";

    if (config.statsInVisuals && statsElem) {
      visScrollWrap.appendChild(statsElem);
    }

    var statMeters = rescuedStatMeters || el("statmeters") || document.querySelector("#statmeters");
    if (statMeters) {
      var headerDiv = visScrollWrap.querySelector(".statmeter-header");
      if (!headerDiv) {
        headerDiv = document.createElement("div");
        headerDiv.className = "statmeter-header";

        var arrowBtn = document.createElement("button");
        arrowBtn.className = "statmeter-arrow";
        arrowBtn.textContent = config.statmetersCollapsed ? "▲" : "▼";
        arrowBtn.title = "Toggle Horizontal Statmeter Badges";
        arrowBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          e.preventDefault();
          config.statmetersCollapsed = !config.statmetersCollapsed;
          arrowBtn.textContent = config.statmetersCollapsed ? "▲" : "▼";
          statMeters.classList.toggle("statmeters-collapsed", !!config.statmetersCollapsed);
          syncStatmeterColors();
          saveConfig();
          setTimeout(updateSidebarHeightVar, 0);
          requestAnimationFrame(updateSidebarHeightVar);
        });

        headerDiv.appendChild(arrowBtn);
      } else {
        var existingBtn = headerDiv.querySelector(".statmeter-arrow");
        if (existingBtn) existingBtn.textContent = config.statmetersCollapsed ? "▲" : "▼";
      }

      visScrollWrap.appendChild(headerDiv);
      visScrollWrap.appendChild(statMeters);

      statMeters.style.display = "block";
      statMeters.style.visibility = "visible";
      statMeters.classList.toggle("statmeters-collapsed", !!config.statmetersCollapsed);
      syncStatmeterColors();
    }

    pVis.appendChild(visScrollWrap);

    /* 3. Mobile Stats */
    var mobStats = el("mobileStats") || document.querySelector("#mobileStats");
    if (mobStats) {
      if (sidebar) {
        var existingMob = sidebar.querySelector("#mobileStats");
        if (existingMob && existingMob !== mobStats) existingMob.remove();
        sidebar.appendChild(mobStats);
        wireStowedMobileStatsClick(mobStats);
      }
    }

    /* 4. Attributes Panel */
    if (rescuedCaptionContent || captionContent) {
      var capToAppend = rescuedCaptionContent || captionContent;
      pAttr.appendChild(capToAppend);
      capToAppend.style.display = "block";
      capToAppend.style.visibility = "visible";

      var rawOverlay = capToAppend.querySelector("#overlayButtons");
      if (rawOverlay) {
        rawOverlay.style.display = "none";
      }
    }

    var attrBtnList = [];
    var setBtnList = [];

    allSourceBtns.forEach(function (btn) {
      var txt = (btn.textContent || "").toUpperCase().trim();
      if (!txt) return;

      var isAttr = attrKeywords.some(function (kw) { return txt.indexOf(kw) !== -1; });
      if (isAttr) {
        attrBtnList.push(btn);
      } else {
        btn.classList.add("macro-button");
        setBtnList.push(btn);
      }
    });

    var charBtn = null;
    var socialBtn = null;
    var remainingAttrBtns = [];

    attrBtnList.forEach(function (b) {
      var txt = (b.textContent || "").toUpperCase().trim();
      if (txt.indexOf("CHARACTERISTICS") !== -1 || txt.indexOf("ATTRIBUTES") !== -1) {
        charBtn = b;
      } else if (txt.indexOf("SOCIAL") !== -1) {
        socialBtn = b;
      } else {
        remainingAttrBtns.push(b);
      }
    });

    if (charBtn) {
      charBtn.classList.add("btn-full");
      attrBtns.appendChild(charBtn);
    }

    if (socialBtn) {
      socialBtn.classList.add("btn-full");
      attrBtns.appendChild(socialBtn);
    }

    var isOddRemainingAttr = (remainingAttrBtns.length % 2 !== 0);
    remainingAttrBtns.forEach(function (b, index) {
      if (isOddRemainingAttr && index === 0) {
        b.classList.add("btn-full");
      } else {
        b.classList.remove("btn-full");
      }
      attrBtns.appendChild(b);
    });

    pAttr.appendChild(attrBtns);

    /* 5. Settings Panel Layout */
    var uiSettingsBtn = existingUISetBtn;
    if (!uiSettingsBtn) {
      uiSettingsBtn = document.createElement("button");
      uiSettingsBtn.id = "ui-settings-btn";
      uiSettingsBtn.className = "macro-button btn-full";
      uiSettingsBtn.textContent = "UI SETTINGS";
      uiSettingsBtn.style.color = "var(--accent)";
      uiSettingsBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        openUISettingsOverlay();
      });
    } else {
      uiSettingsBtn.className = "macro-button btn-full";
      uiSettingsBtn.style.color = "var(--accent)";
    }

    setBtns.appendChild(uiSettingsBtn);

    var optionsSetBtn = null;
    var savesSetBtn = null;
    var otherSetBtns = [];

    setBtnList.forEach(function (b) {
      var txt = (b.textContent || "").toUpperCase().trim();
      if (txt.indexOf("OPTION") !== -1) {
        optionsSetBtn = b;
      } else if (txt.indexOf("SAVE") !== -1) {
        savesSetBtn = b;
      } else {
        otherSetBtns.push(b);
      }
    });

    var isOddMiddleSet = (otherSetBtns.length % 2 !== 0);
    otherSetBtns.forEach(function (b, index) {
      if (isOddMiddleSet && index === 0) {
        b.classList.add("btn-full");
      } else {
        b.classList.remove("btn-full");
      }
      setBtns.appendChild(b);
    });

    if (optionsSetBtn) {
      optionsSetBtn.classList.remove("btn-full");
      setBtns.appendChild(optionsSetBtn);
    }
    if (savesSetBtn) {
      savesSetBtn.classList.remove("btn-full");
      setBtns.appendChild(savesSetBtn);
    }

    pSet.appendChild(setBtns);

    wireOriginalToggle();
    applyStates();
    applyConfig();
    scheduleStageHeightRetries();
  }

  // ---------------------------------------------------------------------
  // Custom color picker. Native <input type="color"> looks/behaves fine
  // in a PC browser but renders very differently (and often worse) on
  // Android APK/WebView, since it just delegates to whatever picker the
  // platform provides. This draws our own SV square + hue slider + hex
  // field so it looks and behaves identically everywhere, using Pointer
  // Events so mouse, touch and pen all work the same way.
  // ---------------------------------------------------------------------

  function createColorPopup(initialHex, onChange, onClose) {
    var hsv = hexToHsv(initialHex);

    var backdrop = document.createElement("div");
    backdrop.className = "cp-backdrop";

    var popup = document.createElement("div");
    popup.className = "cp-popup";
    popup.addEventListener("pointerdown", function (e) { e.stopPropagation(); });

    var title = document.createElement("div");
    title.className = "cp-title";
    title.textContent = "Pick a Color";
    popup.appendChild(title);

    var sv = document.createElement("div");
    sv.className = "cp-sv";
    var svCursor = document.createElement("div");
    svCursor.className = "cp-sv-cursor";
    sv.appendChild(svCursor);
    popup.appendChild(sv);

    var hue = document.createElement("div");
    hue.className = "cp-hue";
    var hueCursor = document.createElement("div");
    hueCursor.className = "cp-hue-cursor";
    hue.appendChild(hueCursor);
    popup.appendChild(hue);

    var bottomRow = document.createElement("div");
    bottomRow.className = "cp-bottom-row";

    var preview = document.createElement("div");
    preview.className = "cp-preview";

    var hexInput = document.createElement("input");
    hexInput.type = "text";
    hexInput.className = "cp-hex-input";
    hexInput.maxLength = 7;
    hexInput.autocapitalize = "characters";
    hexInput.spellcheck = false;

    var doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.className = "cp-done-btn";
    doneBtn.textContent = "Done";

    bottomRow.appendChild(preview);
    bottomRow.appendChild(hexInput);
    bottomRow.appendChild(doneBtn);
    popup.appendChild(bottomRow);

    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);

    function currentHex() {
      var rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    function render(skipHexInput) {
      var hex = currentHex();
      var pureHueHex = rgbToHex.apply(null, (function () {
        var rgb = hsvToRgb(hsv.h, 1, 1);
        return [rgb.r, rgb.g, rgb.b];
      })());

      sv.style.background = "linear-gradient(to top, #000, rgba(0,0,0,0)), " +
        "linear-gradient(to right, #fff, rgba(255,255,255,0)), " + pureHueHex;

      var svRect = { w: sv.clientWidth || 1, h: sv.clientHeight || 1 };
      svCursor.style.left = (hsv.s * svRect.w) + "px";
      svCursor.style.top = ((1 - hsv.v) * svRect.h) + "px";

      var hueRect = { w: hue.clientWidth || 1 };
      hueCursor.style.left = ((hsv.h / 360) * hueRect.w) + "px";

      preview.style.backgroundColor = hex;
      if (!skipHexInput) hexInput.value = hex.toUpperCase();

      onChange(hex);
    }

    function makeDraggable(el, handler) {
      var dragging = false;
      function pos(e) {
        var r = el.getBoundingClientRect();
        var x = Math.max(0, Math.min(r.width, e.clientX - r.left));
        var y = Math.max(0, Math.min(r.height, e.clientY - r.top));
        return { x: x, y: y, w: r.width || 1, h: r.height || 1 };
      }
      el.addEventListener("pointerdown", function (e) {
        dragging = true;
        el.setPointerCapture(e.pointerId);
        handler(pos(e));
        e.preventDefault();
      });
      el.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        handler(pos(e));
      });
      function stop(e) {
        if (!dragging) return;
        dragging = false;
        try { el.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      el.addEventListener("pointerup", stop);
      el.addEventListener("pointercancel", stop);
    }

    makeDraggable(sv, function (p) {
      hsv.s = p.x / p.w;
      hsv.v = 1 - (p.y / p.h);
      render();
    });

    makeDraggable(hue, function (p) {
      hsv.h = (p.x / p.w) * 360;
      render();
    });

    hexInput.addEventListener("input", function () {
      var h = normalizeHex(hexInput.value);
      if (!h) return;
      hsv = hexToHsv(h);
      render(true);
    });

    function close() {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      document.removeEventListener("keydown", onKeydown);
      if (onClose) onClose();
    }

    function onKeydown(e) {
      if (e.key === "Escape") close();
    }

    backdrop.addEventListener("pointerdown", close);
    doneBtn.addEventListener("pointerdown", function (e) { e.stopPropagation(); close(); });
    document.addEventListener("keydown", onKeydown);

    render();

    return {
      close: close,
      setHex: function (hex) {
        hsv = hexToHsv(hex);
        render();
      }
    };
  }

  function buildColorField(initialHex, onChange) {
    var wrap = document.createElement("div");
    wrap.className = "cp-field";

    var swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "cp-swatch";
    swatch.setAttribute("aria-label", "Choose color");

    var hiddenInput = document.createElement("input");
    hiddenInput.type = "color";
    hiddenInput.tabIndex = -1;
    hiddenInput.className = "cp-hidden-input";
    hiddenInput.setAttribute("aria-hidden", "true");

    var state = { hex: normalizeHex(initialHex) || "#ffd700" };
    var popupApi = null;

    function applyVisual(hex) {
      swatch.style.backgroundColor = hex;
    }

    Object.defineProperty(hiddenInput, "value", {
      get: function () { return state.hex; },
      set: function (v) {
        var h = normalizeHex(v);
        if (!h) return;
        state.hex = h;
        applyVisual(h);
        if (popupApi) popupApi.setHex(h);
      },
      configurable: true
    });

    applyVisual(state.hex);

    swatch.addEventListener("click", function (e) {
      e.preventDefault();
      if (popupApi) return;
      popupApi = createColorPopup(state.hex, function (hex) {
        state.hex = hex;
        applyVisual(hex);
        onChange(hex);
      }, function () {
        popupApi = null;
      });
    });

    wrap.appendChild(swatch);
    wrap.appendChild(hiddenInput);
    return wrap;
  }

  function createCustomRow(labelText, type, currentVal, onChange) {
    var div = document.createElement("div");
    div.className = "custom-row";

    var lbl = document.createElement("label");
    lbl.textContent = labelText;
    div.appendChild(lbl);

    if (type === "color") {
      if (isMobileDevice()) {
        div.appendChild(buildColorField(currentVal || "#ffd700", onChange));
      } else {
        var inputColor = document.createElement("input");
        inputColor.type = "color";
        inputColor.value = currentVal || "#ffd700";
        inputColor.addEventListener("change", function () {
          onChange(inputColor.value);
        });
        inputColor.addEventListener("input", function () {
          onChange(inputColor.value);
        });
        div.appendChild(inputColor);
      }
      return div;
    }

    var input = document.createElement("input");
    input.type = type;
    if (type === "checkbox") input.checked = !!currentVal;

    input.addEventListener("change", function () {
      onChange(type === "checkbox" ? input.checked : input.value);
    });

    div.appendChild(input);
    return div;
  }

  function createCustomSelect(labelText, options, currentVal, onChange) {
    var div = document.createElement("div");
    div.className = "custom-row";

    var lbl = document.createElement("label");
    lbl.textContent = labelText;

    var select = document.createElement("select");
    options.forEach(function (opt) {
      var o = document.createElement("option");
      o.value = opt.val;
      o.textContent = opt.label;
      if (opt.val === currentVal) o.selected = true;
      select.appendChild(o);
    });

    select.addEventListener("change", function () {
      onChange(select.value);
    });

    div.appendChild(lbl);
    div.appendChild(select);
    return div;
  }

  /* Sideview Implementation */
  var mirrorPairs = [];
  var rafRunning  = false;
  var rebuildTimer = null;
  var skyObserved  = false;

  function ensureSVHost() {
    var host = el("sv-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "sv-host";
      var inner = document.createElement("div");
      inner.id = "sv-inner";
      host.appendChild(inner);
      document.body.appendChild(host);
    }
    var svOpacity = (typeof config.sideviewOpacity !== "undefined") ? parseInt(config.sideviewOpacity, 10) : 100;
    var sideviewActive = config.sideviewEnabled && (svOpacity > 0);
    host.style.display = sideviewActive ? "block" : "none";
  }

  function getBodyZoom() {
    var zoom = 1;
    if (document.body && document.body.style && document.body.style.zoom) {
      var z = parseFloat(document.body.style.zoom);
      if (!isNaN(z) && z > 0) {
        zoom = z > 5 ? z / 100 : z;
      }
    } else if (window.V && window.V.options && window.V.options.zoom) {
      var vz = parseFloat(window.V.options.zoom);
      if (!isNaN(vz) && vz > 0) {
        zoom = vz / 100;
      }
    }
    return zoom;
  }

  function sizeSV() {
    var inner = el("sv-inner");
    var host = el("sv-host");
    if (!inner || !host) return;

    var opacityVal = (typeof config.sideviewOpacity !== "undefined") ? parseInt(config.sideviewOpacity, 10) : 100;
    var sideviewActive = config.sideviewEnabled && (opacityVal > 0);

    if (!sideviewActive) {
      host.style.display = "none";
      return;
    }
    host.style.display = "block";

    var opacity = opacityVal / 100;
    inner.style.opacity = opacity;

    if (config.sideviewSide === "left") {
      host.classList.add("sv-left");
      host.classList.remove("sv-right");
      host.style.left = "0";
      host.style.right = "auto";
      inner.style.left = "0";
      inner.style.right = "auto";
      inner.style.transformOrigin = "top left";
    } else {
      host.classList.add("sv-right");
      host.classList.remove("sv-left");
      host.style.right = "0";
      host.style.left = "auto";
      inner.style.right = "0";
      inner.style.left = "auto";
      inner.style.transformOrigin = "top right";
    }

    var src = el("canvasSkybox");
    var srcCanvas = src ? src.querySelector("canvas") : null;
    var srcH = (srcCanvas && srcCanvas.height) ? srcCanvas.height : 192;

    var bodyZoom = getBodyZoom();
    var viewH = window.innerHeight || document.documentElement.clientHeight || 0;
    var effectiveH = viewH / srcH;
    var scale = effectiveH / bodyZoom;

    inner.style.transform = "scale(" + scale.toFixed(6) + ")";
  }

  function stripIds(node) {
    node.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
  }

  function rebuildMirror() {
    var opacityVal = (typeof config.sideviewOpacity !== "undefined") ? parseInt(config.sideviewOpacity, 10) : 100;
    var sideviewActive = config.sideviewEnabled && (opacityVal > 0);

    if (!sideviewActive) {
      var h = el("sv-host");
      if (h) h.style.display = "none";
      return;
    }

    var src = el("canvasSkybox");
    ensureSVHost();
    var inner = el("sv-inner");
    if (!src || !inner) return;

    var clone = src.cloneNode(true);
    clone.removeAttribute("id");
    stripIds(clone);
    inner.innerHTML = "";
    inner.appendChild(clone);

    mirrorPairs = [];
    var srcC = src.querySelectorAll("canvas");
    var dstC = clone.querySelectorAll("canvas");
    for (var i = 0; i < srcC.length; i++) {
      if (dstC[i]) mirrorPairs.push([srcC[i], dstC[i]]);
    }

    if (!rafRunning) {
      rafRunning = true;
      requestAnimationFrame(mirrorLoop);
    }

    sizeSV();
  }

  function mirrorLoop() {
    var opacityVal = (typeof config.sideviewOpacity !== "undefined") ? parseInt(config.sideviewOpacity, 10) : 100;
    var sideviewActive = config.sideviewEnabled && (opacityVal > 0);

    if (sideviewActive && mirrorPairs.length > 0) {
      sizeSV();
      for (var i = 0; i < mirrorPairs.length; i++) {
        var pair = mirrorPairs[i];
        if (!pair) continue;
        var s = pair[0], d = pair[1];
        if (!s || !d || !s.isConnected) continue;
        if (s.width === 0 || s.height === 0) continue;
        if (d.width  !== s.width)  d.width  = s.width;
        if (d.height !== s.height) d.height = s.height;
        var ctx = d.getContext("2d");
        if (!ctx) continue;
        try {
          ctx.clearRect(0, 0, d.width, d.height);
          ctx.drawImage(s, 0, 0);
        } catch (_) {}
      }
    }
    rafRunning = true;
    requestAnimationFrame(mirrorLoop);
  }

  function scheduleMirrorRebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(function () {
      rebuildMirror();
    }, 150);
  }

  function watchSkybox() {
    if (skyObserved || typeof MutationObserver === "undefined") return;
    var src = el("canvasSkybox");
    if (!src) return;
    skyObserved = true;
    new MutationObserver(scheduleMirrorRebuild).observe(src, {
      childList: true, subtree: true
    });
  }

  function requestSync(immediate) {
    if (immediate) {
      clearTimeout(syncDebounceTimer);
      if (isSyncing) return;
      isSyncing = true;
      try {
        syncContent();
        scheduleMirrorRebuild();
      } catch (err) {
        console.warn("[ImmersiveTabs] sync error:", err);
      } finally {
        isSyncing = false;
        requestAnimationFrame(updateSidebarHeightVar);
      }
      return;
    }

    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(function () {
      if (isSyncing) return;
      isSyncing = true;
      try {
        syncContent();
        scheduleMirrorRebuild();
      } catch (err) {
        console.warn("[ImmersiveTabs] sync error:", err);
      } finally {
        isSyncing = false;
        requestAnimationFrame(updateSidebarHeightVar);
      }
    }, 30);
  }

  function scheduleSyncRetries() {
    requestSync(true);
    setTimeout(function () { requestSync(false); }, 50);
    setTimeout(function () { requestSync(false); }, 150);
    setTimeout(function () { requestSync(false); }, 300);
    setTimeout(function () { requestSync(false); }, 600);
    setTimeout(function () { requestSync(false); }, 1000);
  }

  function watchDOMChanges() {
    if (typeof MutationObserver === "undefined") return;
    var target = el("ui-bar") || el("storyCaptionDiv") || document.body;
    if (!target || target.dataset.modObserverWired) return;
    target.dataset.modObserverWired = "1";

    new MutationObserver(function (mutations) {
      if (!config.useModUI || isSyncing) return;
      var hasAddedNodes = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes && mutations[i].addedNodes.length > 0) {
          hasAddedNodes = true;
          break;
        }
      }
      if (hasAddedNodes) {
        requestSync(false);
      }
    }).observe(target, { childList: true, subtree: true });
  }

  function relayout(immediate) {
    scheduleSyncRetries();
    ensureSVHost();
    if (!mirrorPairs.length) rebuildMirror();
    else scheduleMirrorRebuild();
    watchSkybox();
    watchDOMChanges();
  }

  function boot() {
    loadConfig();
    applyConfig();

    if (typeof $ === "function") {
      $(document).on(":passageend", function () { relayout(true); });
      $(document).on(":oncloseoverlay", (_e, overlay) => {
        if (overlay === "characteristics") {
          var characteristicsImg = document.querySelector('#customOverlay [id="img"]');
          if (characteristicsImg) {
              characteristicsImg.id = "characteristics-img";
          }
        }
      });
      $(document).on(":dialogopened", function () {
        var overlay = el("ui-settings-overlay-container");
        if (overlay) overlay.classList.add("hidden");
      });
    } else {
      document.addEventListener(":passageend", function () { relayout(true); });
    }

    if (typeof MutationObserver !== "undefined") {
      var passageTarget = el("passages") || el("story") || document.querySelector("#passages, #story, body");
      if (passageTarget) {
        new MutationObserver(function () {
          if (!config.useModUI || isSyncing) return;
          sizeSV();
          applySidebarFontOptions();
        }).observe(passageTarget, { childList: true, subtree: true });
      }
    }

    wireGlobalSwipe();
    relayout(true);
    window.addEventListener("resize", function () {
      sizeSV();
      updateSidebarHeightVar();
      scheduleStageHeightRetries();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
