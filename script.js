/* =========================================================================
   Immersive UI v1.1.0
   ========================================================================= */

(function () {
  "use strict";

  var isStowed = false;

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window) || (window.innerWidth <= 1024);
  }

  var config = {
    useModUI: true,
    storyLayout: "overlay", // "overlay", "below", "above"
    sideviewEnabled: true,
    sideviewOpacity: 100,
    sideviewSide: "right",
    compactStats: false,
    statmetersCollapsed: false,
    storyOffset: isMobileDevice() ? 0 : 300,
    btnTheme: "default",
    customBtnColor: "#26262a",
    accentColor: "gold",
    customAccent: "#ffd700",
    storyAccentColor: "ui", // "ui" = match UI accent, "game" = native default
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

  var BTN_MAP = {
    default:  { top: "rgba(38, 38, 42, 0.98)", bot: "rgba(27, 27, 31, 0.98)", hoverTop: "rgba(50, 50, 56, 0.98)", hoverBot: "rgba(33, 33, 39, 0.98)", border: "rgba(212, 176, 79, 0.22)", hoverBorder: "rgba(212, 176, 79, 0.40)", text: "#e8e8e8", gold: "#d4b04f" },
    purple:   { top: "rgba(45, 30, 60, 0.98)", bot: "rgba(25, 18, 38, 0.98)", hoverTop: "rgba(60, 40, 80, 0.98)", hoverBot: "rgba(35, 24, 50, 0.98)", border: "rgba(168, 85, 247, 0.3)", hoverBorder: "rgba(168, 85, 247, 0.6)", text: "#f3e8ff", gold: "#c084fc" },
    crimson:  { top: "rgba(60, 25, 30, 0.98)", bot: "rgba(35, 15, 20, 0.98)", hoverTop: "rgba(80, 32, 40, 0.98)", hoverBot: "rgba(48, 20, 26, 0.98)", border: "rgba(244, 63, 94, 0.3)", hoverBorder: "rgba(244, 63, 94, 0.6)", text: "#ffe4e6", gold: "#fb7185" },
    navy:     { top: "rgba(25, 40, 65, 0.98)", bot: "rgba(15, 25, 45, 0.98)", hoverTop: "rgba(32, 55, 90, 0.98)", hoverBot: "rgba(20, 35, 60, 0.98)", border: "rgba(59, 130, 246, 0.3)", hoverBorder: "rgba(59, 130, 246, 0.6)", text: "#e0f2fe", gold: "#38bdf8" },
    emerald:  { top: "rgba(25, 50, 35, 0.98)", bot: "rgba(15, 30, 22, 0.98)", hoverTop: "rgba(32, 68, 48, 0.98)", hoverBot: "rgba(20, 42, 30, 0.98)", border: "rgba(34, 197, 94, 0.3)", hoverBorder: "rgba(34, 197, 94, 0.6)", text: "#dcfce7", gold: "#4ade80" }
  };

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

    var topR = clampShift(r, 22), topG = clampShift(g, 22), topB = clampShift(b, 22);
    var botR = clampShift(r, -12), botG = clampShift(g, -12), botB = clampShift(b, -12);
    var hTopR = clampShift(r, 38), hTopG = clampShift(g, 38), hTopB = clampShift(b, 38);
    var hBotR = clampShift(r, 8), hBotG = clampShift(g, 8), hBotB = clampShift(b, 8);

    return {
      top: "rgba(" + topR + ", " + topG + ", " + topB + ", 0.98)",
      bot: "rgba(" + botR + ", " + botG + ", " + botB + ", 0.98)",
      hoverTop: "rgba(" + hTopR + ", " + hTopG + ", " + hTopB + ", 0.98)",
      hoverBot: "rgba(" + hBotR + ", " + hBotG + ", " + hBotB + ", 0.98)",
      border: "rgba(212, 176, 79, 0.28)",
      hoverBorder: "rgba(212, 176, 79, 0.55)",
      text: "#e8e8e8",
      gold: "#d4b04f"
    };
  }

  var isSyncing = false;
  var syncDebounceTimer = null;

  function loadConfig() {
    try {
      var saved = localStorage.getItem("dolp_mod_config");
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
      localStorage.setItem("dolp_mod_config", JSON.stringify(config));
    } catch (_) {}
  }

  function el(id) { return document.getElementById(id); }

  function cleanStyles(node) {
    if (!node) return;
    node.removeAttribute("style");
  }

  function updateSidebarHeightVar() {
    var sidebar = el("dolp-sidebar");
    if (sidebar && config.useModUI) {
      var h = sidebar.offsetHeight || 170;
      document.documentElement.style.setProperty("--dolp-sidebar-height", h + "px");
    } else {
      document.documentElement.style.setProperty("--dolp-sidebar-height", "170px");
    }
  }

  function applySidebarFontOptions() {
    var sidebar = el("dolp-sidebar");
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
      var container = el("dolp-stats-container");
      if (container) container.classList.toggle("statsExtended", isExpanded);
      statsElem.classList.toggle("statsExtended", isExpanded);
      statsElem.classList.toggle("dolp-stats-expanded", isExpanded);
      setTimeout(updateSidebarHeightVar, 0);
      requestAnimationFrame(updateSidebarHeightVar);
    };

    var isExpanded = !!(window.V && window.V.extendedStats);
    var container = el("dolp-stats-container");
    if (container) container.classList.toggle("statsExtended", isExpanded);
    statsElem.classList.toggle("statsExtended", isExpanded);
    statsElem.classList.toggle("dolp-stats-expanded", isExpanded);
    setTimeout(updateSidebarHeightVar, 0);
  }

  function syncStatmeterColors() {
    var statMeters = el("statmeters");
    if (!statMeters) return;
    
    var captions = statMeters.children;
    for (var i = 0; i < captions.length; i++) {
      var cap = captions[i];
      var span = cap.querySelector("span");
      if (span && span.className) {
        cap.className = span.className;
      }
    }
  }

  function watchNativeOptionsOverlay() {
    var customOverlay = el("customOverlay");
    if (!customOverlay) return;

    if (customOverlay.getAttribute("data-overlay") === "options" || el("customOverlayContent")) {
      var select = customOverlay.querySelector("select[name*='options.theme']") || customOverlay.querySelector("select[id*='theme']");
      if (select && !select.querySelector("option[value='midnight']")) {
        var opt = document.createElement("option");
        opt.value = "midnight";
        opt.textContent = "Midnight Dark";
        select.appendChild(opt);

        if (window.V && window.V.options && window.V.options.theme === "midnight") {
          opt.selected = true;
          document.body.classList.add("theme-midnight");
          document.body.setAttribute("data-theme", "midnight");
        }

        select.addEventListener("change", function () {
          if (select.value === "midnight") {
            document.body.classList.add("theme-midnight");
            document.body.setAttribute("data-theme", "midnight");
          } else {
            document.body.classList.remove("theme-midnight");
            document.body.removeAttribute("data-theme");
          }
        });
      }
    }
  }

  function checkMobileDevice() {
    var isMobile = isMobileDevice();
    if (isMobile) {
      document.body.classList.add("dolp-mobile");
    } else {
      document.body.classList.remove("dolp-mobile");
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
      var oldBtn = el("dolp-classic-ui-settings-btn");
      if (oldBtn) oldBtn.remove();
      return;
    }
    var target = el("overlayButtons") || el("storyCaptionContent");
    if (!target) return;

    var classicBtn = el("dolp-classic-ui-settings-btn");
    if (!classicBtn) {
      classicBtn = document.createElement("button");
      classicBtn.id = "dolp-classic-ui-settings-btn";
      classicBtn.className = "macro-button";
      classicBtn.textContent = "UI SETTINGS";
      classicBtn.style.cssText = "margin-top:6px; width:100%; cursor:pointer;";
      classicBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        openUISettingsOverlay();
      });
    }
    if (classicBtn.parentElement !== target) {
      target.appendChild(classicBtn);
    }
  }

  function applyConfig() {
    checkMobileDevice();
    applySidebarFontOptions();
    checkStackedOpenPanels();

    var root = document.documentElement;

    // Story Layout Classes
    document.body.classList.remove("dolp-layout-overlay", "dolp-layout-below", "dolp-layout-above");
    var layout = config.storyLayout || "overlay";
    document.body.classList.add("dolp-layout-" + layout);

    // Accent Color Logic for UI
    if (config.accentColor === "game") {
      root.style.removeProperty("--dolp-accent");
      document.body.style.removeProperty("--dolp-accent");
      document.body.classList.remove("dolp-custom-accent");
    } else {
      var accentHex = (config.accentColor === "custom") ? config.customAccent : ACCENT_MAP[config.accentColor];
      if (!accentHex) accentHex = "#ffd700";
      root.style.setProperty("--dolp-accent", accentHex);
      document.body.style.setProperty("--dolp-accent", accentHex);
      document.body.classList.add("dolp-custom-accent");
    }

    // Story Text Accent Color Logic (Support "ui" preset to match UI Accent)
    if (!config.storyAccentColor || config.storyAccentColor === "game") {
      root.style.removeProperty("--dolp-story-accent");
      document.body.style.removeProperty("--dolp-story-accent");
      document.body.classList.remove("dolp-custom-story-accent");
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
      root.style.setProperty("--dolp-story-accent", storyAccentHex);
      document.body.style.setProperty("--dolp-story-accent", storyAccentHex);
      document.body.classList.add("dolp-custom-story-accent");
    }

    // Base Theme Logic
    var themeObj = null;
    if (config.baseTheme === "custom") {
      themeObj = generateThemeFromBaseHex(config.customBase || "#0d0d12");
    } else if (config.baseTheme === "game") {
      themeObj = null;
    } else {
      themeObj = BASE_MAP[config.baseTheme] || BASE_MAP.midnight;
    }

    if (themeObj) {
      root.style.setProperty("--dolp-bg", themeObj.bg);
      root.style.setProperty("--dolp-card-bg", themeObj.card);
      root.style.setProperty("--dolp-btn-bg", themeObj.btn);
      root.style.setProperty("--dolp-btn-hover", themeObj.btnHover);
      root.style.setProperty("--dolp-border", themeObj.border);
      root.style.setProperty("--dolp-text", themeObj.text);
      root.style.setProperty("--dolp-text-muted", themeObj.textMuted);
    } else {
      root.style.removeProperty("--dolp-bg");
      root.style.removeProperty("--dolp-card-bg");
      root.style.removeProperty("--dolp-btn-bg");
      root.style.removeProperty("--dolp-btn-hover");
      root.style.removeProperty("--dolp-border");
      root.style.removeProperty("--dolp-text");
      root.style.removeProperty("--dolp-text-muted");
    }

    // Button Theme Logic
    var btnObj = null;
    if (config.btnTheme === "custom") {
      btnObj = generateButtonThemeFromHex(config.customBtnColor || "#26262a");
    } else {
      btnObj = BTN_MAP[config.btnTheme] || BTN_MAP.default;
    }

    if (btnObj) {
      root.style.setProperty("--dolp-btn-top", btnObj.top);
      root.style.setProperty("--dolp-btn-bot", btnObj.bot);
      root.style.setProperty("--dolp-btn-top-hover", btnObj.hoverTop);
      root.style.setProperty("--dolp-btn-bot-hover", btnObj.hoverBot);
      root.style.setProperty("--dolp-btn-border", btnObj.border);
      root.style.setProperty("--dolp-btn-border-active", btnObj.hoverBorder);
      root.style.setProperty("--dolp-btn-text", btnObj.text);
      root.style.setProperty("--dolp-btn-gold", btnObj.gold);
    }

    root.style.setProperty("--dolp-panel-width", "280px");
    var offsetVal = isMobileDevice() ? 0 : parseInt(config.storyOffset, 10);
    if (isNaN(offsetVal) || offsetVal < 0) offsetVal = isMobileDevice() ? 0 : 300;
    root.style.setProperty("--dolp-story-offset", offsetVal + "px");

    if (config.compactStats) {
      document.body.classList.add("dolp-compact-stats");
    } else {
      document.body.classList.remove("dolp-compact-stats");
    }

    var statMeters = el("statmeters");
    if (statMeters) {
      statMeters.classList.toggle("dolp-statmeters-collapsed", !!config.statmetersCollapsed);
      syncStatmeterColors();
    }

    document.body.classList.toggle("dolp-sv-disabled", !config.sideviewEnabled);
    var svHost = el("dolp-sv-host");
    if (svHost) {
      svHost.style.display = config.sideviewEnabled ? "block" : "none";
    }

    var sidebar = el("dolp-sidebar");
    var tray    = el("ui-bar-tray");
    var uiBar   = el("ui-bar");

    if (config.useModUI) {
      document.body.classList.add("dolp-mod-active");
      if (sidebar) sidebar.style.display = "flex";

      var header = el("dolp-header");
      if (tray && header && tray.parentElement !== header) {
        header.insertBefore(tray, header.firstChild);
      }
    } else {
      document.body.classList.remove("dolp-mod-active");
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
    watchNativeOptionsOverlay();
    updateSidebarHeightVar();
  }

  function updateSwitchButton() {
    var historyElem = el("ui-bar-history");
    var trayElem    = el("ui-bar-tray");
    var target      = trayElem || historyElem;
    if (!target) return;

    var switchBtn = el("dolp-ui-toggle-btn");
    if (!switchBtn) {
      switchBtn = document.createElement("button");
      switchBtn.id = "dolp-ui-toggle-btn";
      switchBtn.className = "dolp-ui-switch-btn";
    }

    switchBtn.onclick = function (e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      config.useModUI = !config.useModUI;
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

    var attrBtns = el("dolp-attr-buttons");
    var setBtns  = el("dolp-set-buttons");
    var allBtns  = [];

    [attrBtns, setBtns, overlayBtns].forEach(function (container) {
      if (container) {
        var btns = Array.from(container.querySelectorAll("button, .macro-button, a"));
        btns.forEach(function (b) {
          if (allBtns.indexOf(b) === -1) allBtns.push(b);
        });
      }
    });

    if (allBtns.length === 0) return;

    overlayBtns.innerHTML = "";

    var btnMap = {};
    allBtns.forEach(function (b) {
      var txt = (b.textContent || "").toUpperCase().trim();
      btnMap[txt] = b;
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

    overlayBtns.appendChild(createSplit("DOL+ CREDITS", "DECOMOD"));
    overlayBtns.appendChild(createSplit("OPTIONS", "SAVES"));

    var usedBtns = [
      bChar, getBtn("SOCIAL"),
      getBtn("TRAITS"), getBtn("JOURNAL"),
      getBtn("STATS"), getBtn("FEATS"),
      getBtn("DOL+ CREDITS"), getBtn("DECOMOD"),
      getBtn("OPTIONS"), getBtn("SAVES")
    ];

    var remaining = allBtns.filter(function (b) { return usedBtns.indexOf(b) === -1; });
    for (var i = 0; i < remaining.length; i += 2) {
      var splitRem = document.createElement("div");
      splitRem.className = "sidebarButtonSplit";
      splitRem.appendChild(remaining[i]);
      if (remaining[i + 1]) splitRem.appendChild(remaining[i + 1]);
      overlayBtns.appendChild(splitRem);
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
    var startImg = el("startingPlayerImage") || document.querySelector("#startingPlayerImage");
      if (startImg && (startImg.children.length > 0 || startImg.querySelector("canvas, img"))) {
        startImg.style.display = "block";
        startImg.style.visibility = "visible";
        var topTitle = startCaption.querySelector("#dolp-start-story-title") || startCaption.querySelector("h1, h2, .title");
        if (topTitle && topTitle.nextSibling !== startImg) {
          if (topTitle.nextSibling) {
            startCaption.insertBefore(startImg, topTitle.nextSibling);
          } else {
            startCaption.appendChild(startImg);
          }
        }
      }
    document.body.classList.remove("dolp-mod-active");
    document.body.classList.remove("dolp-stowed");
    var sidebar = el("dolp-sidebar");
    if (sidebar) sidebar.style.display = "none";

    // Remove Mod UI cloned title and setting buttons
    var modTitle = el("dolp-start-story-title");
    if (modTitle) modTitle.remove();

    var startUISetBtn = el("dolp-start-ui-settings-btn");
    if (startUISetBtn) startUISetBtn.remove();

    reconstructOverlayButtons(overlayBtns);

    if (tray && uiBar && tray.parentElement !== uiBar) {
      uiBar.insertBefore(tray, uiBar.firstChild);
    }

    if (uiBody && storyCap && storyCap.parentElement !== storyCap) {
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

    // Restore startingPlayerImage back into native caption container for Classic UI
    if (startImg && captionCnt && startImg.parentElement !== captionCnt) {
      captionCnt.appendChild(startImg);
    }

    if (captionCnt && overlayBtns && overlayBtns.parentElement !== captionCnt) {
      captionCnt.appendChild(overlayBtns);
    }

    if (startCap && storyCap && startCap.parentElement !== storyCap) {
      storyCap.appendChild(startCap);
    }

    if (mobStats && storyCap && mobStats.parentElement !== storyCap) {
      storyCap.appendChild(mobStats);
    }

    if (menu && uiBody && menu.parentElement !== uiBody) {
      uiBody.appendChild(menu);
    }

    [sky, imgWrap, captionDiv, captionCnt, stats, statMeters, overlayBtns, mobStats, uiBar, uiBody, storyCap, menu, startCap, startImg].forEach(cleanStyles);

    var stage = el("dolp-visual-stage");
    if (stage) stage.innerHTML = "";

    if (typeof window.updatehistorycontrols === "function") {
      try { window.updatehistorycontrols(); } catch (_) {}
    }
  }

  function ensureSidebarDOM() {
    if (el("dolp-sidebar")) return;

    var sidebar = document.createElement("div");
    sidebar.id  = "dolp-sidebar";

    var header = document.createElement("div");
    header.id  = "dolp-header";

    var tray = el("ui-bar-tray");
    if (tray) {
      header.appendChild(tray);
    }

    var statsContainer = document.createElement("div");
    statsContainer.id  = "dolp-stats-container";
    header.appendChild(statsContainer);

    var tabBar = document.createElement("div");
    tabBar.id  = "dolp-tab-bar";

    var tabs = [
      { id: "visuals", label: "Visuals" },
      { id: "attributes", label: "Attributes" },
      { id: "settings", label: "Settings" }
    ];

    tabs.forEach(function (t) {
      var btn = document.createElement("button");
      btn.className = "dolp-tab-btn" + (config.openPanels && config.openPanels[t.id] ? " active" : "");
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
    masterToggle.id = "dolp-master-toggle";
    masterToggle.className = "dolp-toggle-btn";
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
    body.id  = "dolp-body";

    ["visuals", "attributes", "settings"].forEach(function (id) {
      var panel = document.createElement("div");
      panel.id  = "dolp-panel-" + id;
      panel.className = "dolp-panel" + (config.openPanels && config.openPanels[id] ? " active" : "");
      body.appendChild(panel);
    });

    sidebar.appendChild(body);
    document.body.appendChild(sidebar);
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
    isStowed = !isStowed;
    applyStates();
  }

  function applyStates() {
    var sidebar = el("dolp-sidebar");
    if (sidebar) {
      sidebar.classList.toggle("stowed", isStowed);
    }
    document.body.classList.toggle("dolp-stowed", isStowed);

    var toggleBtn = el("dolp-master-toggle");
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

    var tabBtns = document.querySelectorAll(".dolp-tab-btn");
    tabBtns.forEach(function (btn) {
      var t = btn.getAttribute("data-tab");
      var isOpen = !isStowed && !!config.openPanels[t];
      btn.classList.toggle("active", isOpen);
    });

    ["visuals", "attributes", "settings"].forEach(function (id) {
      var p = el("dolp-panel-" + id);
      if (p) {
        var isOpen = !isStowed && !!config.openPanels[id];
        p.classList.toggle("active", isOpen);
      }
    });

    var uiBar = el("ui-bar");
    if (uiBar) {
      uiBar.classList.toggle("stowed", isStowed);
    }

    updateSidebarHeightVar();
  }

  function wireOriginalToggle() {
    var toggleBtn = el("ui-bar-toggle");
    if (toggleBtn && !toggleBtn.dataset.dolpWired) {
      toggleBtn.dataset.dolpWired = "1";
      toggleBtn.addEventListener("click", function (e) {
        if (config.useModUI) {
          e.stopPropagation();
          e.preventDefault();
          toggleStow();
        }
      });
    }
  }

  function showStatToast(label, val) {
    if (!config.useModUI) return;
    var existing = el("dolp-stat-toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.id = "dolp-stat-toast";
    toast.textContent = label + ": " + val;
    document.body.appendChild(toast);

    setTimeout(function () {
      if (toast.parentElement) toast.remove();
    }, 2200);
  }

  function getStatExactValue(id, rawText) {
    if (window.V) {
      if (id.indexOf("pain") !== -1) return Math.floor(window.V.pain || 0) + " / 100";
      if (id.indexOf("arousal") !== -1) return Math.floor(window.V.arousal || 0) + " / " + (window.V.arousalmax || 10000);
      if (id.indexOf("tired") !== -1 || id.indexOf("fatigue") !== -1) return Math.floor(window.V.tiredness || 0) + " / " + (window.V.tirednessmax || 1000);
      if (id.indexOf("stress") !== -1) return Math.floor(window.V.stress || 0) + " / " + (window.V.stressmax || 10000);
      if (id.indexOf("trauma") !== -1) return Math.floor(window.V.trauma || 0) + " / " + (window.V.traumamax || 10000);
      if (id.indexOf("control") !== -1) return Math.floor(window.V.control || 0) + " / " + (window.V.controlmax || 1000);
      if (id.indexOf("allure") !== -1) return Math.floor(window.V.allure || 0);
      if (id.indexOf("oxygen") !== -1 || id.indexOf("air") !== -1) return Math.floor(window.V.oxygen || 0) + " / " + (window.V.oxygenmax || 100);
    }
    return rawText || "N/A";
  }

  function wireStowedMobileStatsClick(mobStats) {
    if (!mobStats) return;
    var statElems = mobStats.querySelectorAll(".stat");
    statElems.forEach(function (elem) {
      var id = (elem.id || "").toLowerCase();
      var label = elem.getAttribute("aria-label") || elem.getAttribute("title") || id || "Stat";

      function updateTitle() {
        var textContent = (elem.textContent || "").trim();
        var val = getStatExactValue(id, textContent);
        elem.setAttribute("title", label.toUpperCase() + ": " + val);
      }

      elem.onmouseenter = function () {
        if (!config.useModUI) return;
        updateTitle();
      };

      if (elem.dataset.dolpWired) return;
      elem.dataset.dolpWired = "1";
      elem.style.cursor = "pointer";
    });
  }

  function ensureUISettingsOverlay() {
    if (el("dolp-ui-settings-overlay-container")) return;

    var container = document.createElement("div");
    container.id = "dolp-ui-settings-overlay-container";
    container.className = "hidden";

    var win = document.createElement("div");
    win.id = "dolp-ui-settings-window";

    var titleHeader = document.createElement("div");
    titleHeader.style.cssText = "display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--dolp-accent); padding-bottom:8px; margin-bottom:12px;";

    var title = document.createElement("h3");
    title.textContent = "UI SETTINGS";
    title.style.cssText = "margin:0; color:var(--dolp-accent); font-weight:bold;";

    var closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = "background:transparent; border:none; color:var(--dolp-accent); font-size:1.2em; cursor:pointer;";
    closeBtn.addEventListener("click", function () {
      container.classList.add("hidden");
    });

    titleHeader.appendChild(title);
    titleHeader.appendChild(closeBtn);
    win.appendChild(titleHeader);

    // Layout Section
    var genBox = document.createElement("div");
    genBox.className = "dolp-custom-box";
    var genTitle = document.createElement("div");
    genTitle.className = "dolp-custom-title";
    genTitle.textContent = "General Layout & Mobile";
    genBox.appendChild(genTitle);

    genBox.appendChild(createCustomSelect("UI Layout Mode", [
      { label: "Tab UI (Mod)", val: "mod" },
      { label: "Classic Game UI", val: "classic" }
    ], config.useModUI ? "mod" : "classic", function (val) {
      config.useModUI = (val === "mod");
      saveConfig();
      applyConfig();
      requestSync(true);
    }));

    // Story Position Select
    var storyPosRow = createCustomSelect("Story Position", [
      { label: "Side-by-Side / Overlay (Default)", val: "overlay" },
      { label: "Story Below Sidebar (Recommended for Mobile)", val: "below" },
      { label: "Story Above Sidebar (Recommended for Mobile)", val: "above" }
    ], config.storyLayout || "overlay", function (val) {
      config.storyLayout = val;
      saveConfig();
      applyConfig();
    });

    genBox.appendChild(storyPosRow);

    // Story Text Offset Row with Real-Time Smooth Range Slider
    var sliderRow = document.createElement("div");
    sliderRow.className = "dolp-custom-row";
    sliderRow.style.cssText = "flex-direction:column; align-items:stretch; gap:4px;";

    var sliderHeader = document.createElement("div");
    sliderHeader.className = "dolp-slider-header";

    var sliderLabel = document.createElement("label");
    sliderLabel.textContent = "Story Text Offset";

    var sliderRightDiv = document.createElement("div");
    sliderRightDiv.className = "dolp-slider-right";

    var sliderValDisplay = document.createElement("span");
    sliderValDisplay.style.cssText = "color:var(--dolp-accent); font-weight:bold; font-size:0.9em;";
    var curOffsetNum = parseInt(config.storyOffset, 10);
    if (isNaN(curOffsetNum) || curOffsetNum < 0) curOffsetNum = isMobileDevice() ? 0 : 300;
    sliderValDisplay.textContent = curOffsetNum + "px";

    var resetOffsetBtn = document.createElement("button");
    resetOffsetBtn.textContent = "Reset Offset";
    resetOffsetBtn.style.cssText = "padding:2px 6px; font-size:0.75em; cursor:pointer;";

    sliderRightDiv.appendChild(sliderValDisplay);
    sliderRightDiv.appendChild(resetOffsetBtn);

    sliderHeader.appendChild(sliderLabel);
    sliderHeader.appendChild(sliderRightDiv);

    if (isMobileDevice()) {
      var mobileNote = document.createElement("span");
      mobileNote.style.cssText = "color:var(--dolp-accent); font-size:0.75em; font-style:italic; margin-top:2px;";
      mobileNote.textContent = "(Locked to Default on Mobile)";
      sliderHeader.appendChild(mobileNote);
    }

    var offsetSlider = document.createElement("input");
    offsetSlider.type = "range";
    offsetSlider.min = "0";
    offsetSlider.max = isMobileDevice() ? "300" : "600";
    offsetSlider.step = "5";
    offsetSlider.value = curOffsetNum;
    offsetSlider.style.cssText = "width:100%; cursor:pointer;";

    if (isMobileDevice()) {
      offsetSlider.disabled = true;
      resetOffsetBtn.disabled = true;
      offsetSlider.style.cursor = "not-allowed";
      resetOffsetBtn.style.cursor = "not-allowed";
    }

    var saveOffsetTimeout = null;
    offsetSlider.addEventListener("input", function () {
      if (isMobileDevice()) return;
      var val = parseInt(offsetSlider.value, 10);
      sliderValDisplay.textContent = val + "px";
      config.storyOffset = val;
      document.documentElement.style.setProperty("--dolp-story-offset", val + "px");
      document.body.style.setProperty("--dolp-story-offset", val + "px");
      clearTimeout(saveOffsetTimeout);
      saveOffsetTimeout = setTimeout(function () {
        saveConfig();
      }, 300);
    });

    resetOffsetBtn.addEventListener("click", function () {
      if (isMobileDevice()) return;
      var defaultVal = isMobileDevice() ? 0 : 300;
      offsetSlider.value = defaultVal;
      sliderValDisplay.textContent = defaultVal + "px";
      config.storyOffset = defaultVal;
      document.documentElement.style.setProperty("--dolp-story-offset", defaultVal + "px");
      document.body.style.setProperty("--dolp-story-offset", defaultVal + "px");
      saveConfig();
    });

    sliderRow.appendChild(sliderHeader);
    sliderRow.appendChild(offsetSlider);
    genBox.appendChild(sliderRow);

    genBox.appendChild(createCustomRow("Sideview Mirror", "checkbox", config.sideviewEnabled, function (val) {
      config.sideviewEnabled = val;
      saveConfig();
      applyConfig();
    }));

    // Sideview Opacity Slider
    var svOpRow = document.createElement("div");
    svOpRow.className = "dolp-custom-row";
    svOpRow.style.cssText = "flex-direction:column; align-items:stretch; gap:4px;";
    var svOpHeader = document.createElement("div");
    svOpHeader.style.cssText = "display:flex; justify-content:space-between; align-items:center;";
    var svOpLabel = document.createElement("label");
    svOpLabel.textContent = "Sideview Mirror Opacity";
    var svOpValDisplay = document.createElement("span");
    svOpValDisplay.style.cssText = "color:var(--dolp-accent); font-weight:bold; font-size:0.9em;";
    svOpValDisplay.textContent = (config.sideviewOpacity || 100) + "%";
    svOpHeader.appendChild(svOpLabel);
    svOpHeader.appendChild(svOpValDisplay);

    var svOpSlider = document.createElement("input");
    svOpSlider.type = "range";
    svOpSlider.min = "10";
    svOpSlider.max = "100";
    svOpSlider.step = "5";
    svOpSlider.value = config.sideviewOpacity || 100;
    svOpSlider.style.cssText = "width:100%; cursor:pointer;";
    svOpSlider.addEventListener("input", function () {
      var val = parseInt(svOpSlider.value, 10);
      svOpValDisplay.textContent = val + "%";
      config.sideviewOpacity = val;
      saveConfig();
      applyConfig();
    });
    svOpRow.appendChild(svOpHeader);
    svOpRow.appendChild(svOpSlider);
    genBox.appendChild(svOpRow);

    // Sideview Position Side
    genBox.appendChild(createCustomSelect("Sideview Mirror Side", [
      { label: "Right Side", val: "right" },
      { label: "Left Side",  val: "left" }
    ], config.sideviewSide || "right", function (val) {
      config.sideviewSide = val;
      saveConfig();
      applyConfig();
    }));

    genBox.appendChild(createCustomRow("Compact Statbars", "checkbox", config.compactStats, function (val) {
      config.compactStats = val;
      saveConfig();
      applyConfig();
    }));

    win.appendChild(genBox);

    // Button Volume Section
    var btnBox = document.createElement("div");
    btnBox.className = "dolp-custom-box";
    var btnTitle = document.createElement("div");
    btnTitle.className = "dolp-custom-title";
    btnTitle.textContent = "Button Inner Colors";
    btnBox.appendChild(btnTitle);

    var customBtnRow = createCustomRow("Custom Button Color", "color", getActiveBtnHex(), function (val) {
      config.customBtnColor = val;
      config.btnTheme = "custom";
      saveConfig();
      applyConfig();
    });
    customBtnRow.id = "dolp-custom-btn-row";
    customBtnRow.style.display = "flex";

    btnBox.appendChild(createCustomSelect("Button Theme Preset", [
      { label: "Default Dark Slate", val: "default" },
      { label: "Midnight Purple",   val: "purple" },
      { label: "Deep Crimson",      val: "crimson" },
      { label: "Ocean Navy",        val: "navy" },
      { label: "Forest Emerald",    val: "emerald" },
      { label: "Custom Inner Color", val: "custom" }
    ], config.btnTheme, function (val) {
      config.btnTheme = val;
      var btnColorInput = customBtnRow.querySelector("input[type='color']");
      if (btnColorInput) btnColorInput.value = getActiveBtnHex();
      saveConfig();
      applyConfig();
    }));

    btnBox.appendChild(customBtnRow);
    win.appendChild(btnBox);

// Base Theme Section
    var baseBox = document.createElement("div");
    baseBox.className = "dolp-custom-box";
    var baseTitle = document.createElement("div");
    baseTitle.className = "dolp-custom-title";
    baseTitle.textContent = "Base UI Theme";
    baseBox.appendChild(baseTitle);

    var baseSelectRow = createCustomSelect("Base Theme Preset", [
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
      var baseColorInput = customBaseRow.querySelector("input[type='color']");
      if (baseColorInput) baseColorInput.value = getActiveBaseHex();
      saveConfig();
      applyConfig();
    });

    var baseSelect = baseSelectRow.querySelector("select");

    var customBaseRow = createCustomRow("Custom Base Color", "color", getActiveBaseHex(), function (val) {
      config.customBase = val;
      config.baseTheme = "custom";
      if (baseSelect) baseSelect.value = "custom";
      saveConfig();
      applyConfig();
    });
    customBaseRow.id = "dolp-custom-base-row";
    customBaseRow.style.display = "flex";

    baseBox.appendChild(baseSelectRow);
    baseBox.appendChild(customBaseRow);
    win.appendChild(baseBox);


    // Accent Color Section
    var accentBox = document.createElement("div");
    accentBox.className = "dolp-custom-box";
    var accentTitle = document.createElement("div");
    accentTitle.className = "dolp-custom-title";
    accentTitle.textContent = "UI Accent Color";
    accentBox.appendChild(accentTitle);

    var customAccentRow = createCustomRow("Custom Accent Color", "color", getActiveAccentHex(), function (val) {
      config.customAccent = val;
      config.accentColor = "custom";
      saveConfig();
      applyConfig();
    });
    customAccentRow.id = "dolp-custom-accent-row";
    customAccentRow.style.display = "flex";

    accentBox.appendChild(createCustomSelect("UI Accent Preset", [
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
      var accentColorInput = customAccentRow.querySelector("input[type='color']");
      if (accentColorInput) accentColorInput.value = getActiveAccentHex();
      if (config.storyAccentColor === "ui" || config.storyAccentColor === "match_ui") {
        var storyAccentColorInput = document.querySelector("#dolp-custom-story-accent-row input[type='color']");
        if (storyAccentColorInput) storyAccentColorInput.value = getActiveStoryAccentHex();
      }
      saveConfig();
      applyConfig();
    }));

    accentBox.appendChild(customAccentRow);
    win.appendChild(accentBox);

    // Story Text Accent Color Section
    var storyAccentBox = document.createElement("div");
    storyAccentBox.className = "dolp-custom-box";
    var storyAccentTitle = document.createElement("div");
    storyAccentTitle.className = "dolp-custom-title";
    storyAccentTitle.textContent = "Story Text Accent Color";
    storyAccentBox.appendChild(storyAccentTitle);

    var customStoryAccentRow = createCustomRow("Custom Story Accent", "color", getActiveStoryAccentHex(), function (val) {
      config.customStoryAccent = val;
      config.storyAccentColor = "custom";
      saveConfig();
      applyConfig();
    });
    customStoryAccentRow.id = "dolp-custom-story-accent-row";
    customStoryAccentRow.style.display = "flex";

    storyAccentBox.appendChild(createCustomSelect("Story Text Accent Preset", [
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
      var storyAccentColorInput = customStoryAccentRow.querySelector("input[type='color']");
      if (storyAccentColorInput) storyAccentColorInput.value = getActiveStoryAccentHex();
      saveConfig();
      applyConfig();
    }));

    storyAccentBox.appendChild(customStoryAccentRow);
    win.appendChild(storyAccentBox);

    // Presets Manager
    var mgrBox = document.createElement("div");
    mgrBox.className = "dolp-custom-box";
    var mgrTitle = document.createElement("div");
    mgrTitle.className = "dolp-custom-title";
    mgrTitle.textContent = "Custom Themes Manager";
    mgrBox.appendChild(mgrTitle);

    var saveRow = document.createElement("div");
    saveRow.className = "dolp-custom-row";
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
    presetRow.className = "dolp-custom-row";
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
        config.customBtnColor = theme.customBtnColor || "#26262a";
        saveConfig();
        applyConfig();
        var existing = el("dolp-ui-settings-overlay-container");
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

    // Export / Import Row - Contained Box Width
    var ioRow = document.createElement("div");
    ioRow.className = "dolp-custom-row dolp-io-row";
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
          if (data.customBtnColor) config.customBtnColor = data.customBtnColor;
          if (data.savedThemes) config.savedThemes = data.savedThemes;
          saveConfig();
          applyConfig();
          var existing = el("dolp-ui-settings-overlay-container");
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
    var container = el("dolp-ui-settings-overlay-container");
    if (container) container.classList.remove("hidden");
  }

  function syncContent() {
    applySidebarFontOptions();

    if (!config.useModUI) {
      applyConfig();
      return;
    }

    ensureSidebarDOM();

    var sidebar     = el("dolp-sidebar");
    var headerStats = el("dolp-stats-container");
    var pVis        = el("dolp-panel-visuals");
    var pAttr       = el("dolp-panel-attributes");
    var pSet        = el("dolp-panel-settings");

    if (!pVis || !pAttr || !pSet || !headerStats) return;

    var attrKeywords = ["CHARACTERISTICS", "ATTRIBUTES", "SOCIAL", "TRAITS", "JOURNAL", "STATS", "FEATS"];
    var blacklistedTexts = ["RESTART", "SHARE", "SHARES", "SETTINGS", "UI SETTINGS"];

    var overlayButtons = el("overlayButtons") || document.querySelector("#overlayButtons");
    var captionContent = el("storyCaptionContent") || document.querySelector("#storyCaptionContent");

    var allSourceBtns = [];
    var seenTexts = {};

    function collectButtonsFrom(container) {
      if (!container) return;
      var btns = Array.from(container.querySelectorAll("button, .macro-button, a"));
      btns.forEach(function (b) {
        if (b.closest("#menu") || b.closest(".menu")) return;
        if (b.id === "dolp-ui-toggle-btn" || b.id === "dolp-master-toggle" || b.id === "dolp-ui-settings-btn" || b.classList.contains("dolp-statmeter-arrow") || b.classList.contains("dolp-tab-btn")) {
          return;
        }

        var txt = (b.textContent || "").trim().toUpperCase();
        if (!txt || txt.length < 2) return;
        if (blacklistedTexts.indexOf(txt) !== -1) return;

        if (!seenTexts[txt]) {
          seenTexts[txt] = true;
          allSourceBtns.push(b);
        }
      });
    }

    collectButtonsFrom(overlayButtons);
    collectButtonsFrom(captionContent);
    collectButtonsFrom(pAttr);
    collectButtonsFrom(pSet);

    headerStats.innerHTML = "";
    pVis.innerHTML = "";
    pAttr.innerHTML = "";
    pSet.innerHTML = "";

    var attrBtns = document.createElement("div");
    attrBtns.id = "dolp-attr-buttons";
    attrBtns.className = "dolp-btn-grid";

    var setBtns = document.createElement("div");
    setBtns.id = "dolp-set-buttons";
    setBtns.className = "dolp-btn-grid";

/* Start Menu Check */
    var startCaption = el("startCaption");
    if (startCaption) {
      if (sidebar) sidebar.classList.add("dolp-start-menu");
      pVis.appendChild(startCaption);
// Add #story-title at the top of start menu caption (Mod UI only)
      var storyTitle = el("story-title");
      var titleText = (storyTitle ? storyTitle.innerHTML : "").trim() || (window.Story && Story.title ? Story.title : "Degrees of Lewdity");
      if (titleText) {
        var existingModTitle = startCaption.querySelector("#dolp-start-story-title");
        if (!existingModTitle) {
          existingModTitle = document.createElement("h1");
          existingModTitle.id = "dolp-start-story-title";
          existingModTitle.className = "title";
          existingModTitle.style.cssText = "margin-bottom:12px; text-align:center; color:var(--dolp-accent); font-weight:bold; font-size:1.8em; text-shadow:0 0 8px var(--dolp-accent, #ffd700), 0 0 16px rgba(255, 215, 0, 0.4);";
          startCaption.insertBefore(existingModTitle, startCaption.firstChild);
        }
        existingModTitle.innerHTML = titleText;
      }

      // Position #startingPlayerImage directly below the sidebar menu title (Mod UI only)
      var startImg = el("startingPlayerImage") || document.querySelector("#startingPlayerImage");
      if (startImg) {
        startImg.style.display = "block";
        startImg.style.visibility = "visible";
        var topTitle = startCaption.querySelector("#dolp-start-story-title") || startCaption.querySelector("h1, h2, .title");
        if (topTitle && topTitle.nextSibling !== startImg) {
          startCaption.insertBefore(startImg, topTitle.nextSibling);
        }
      }

      var existingStartUISet = startCaption.querySelector("#dolp-start-ui-settings-btn");
      if (!existingStartUISet) {
        var startUISetBtn = document.createElement("button");
        startUISetBtn.id = "dolp-start-ui-settings-btn";
        startUISetBtn.className = "macro-button";
        startUISetBtn.textContent = "UI SETTINGS";
        startUISetBtn.style.cssText = "margin-top:10px; width:100%; cursor:pointer;";
        startUISetBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          e.preventDefault();
          openUISettingsOverlay();
        });
        startCaption.appendChild(startUISetBtn);
      }

      wireOriginalToggle();
      applyStates();
      applyConfig();
      return;
    } else {
      if (sidebar) sidebar.classList.remove("dolp-start-menu");
    }
    
    /* 1. Stats Bar into Header */
    var statsElem = el("stats") || document.querySelector("#stats");
    if (statsElem) {
      headerStats.appendChild(statsElem);
      statsElem.style.display = "block";
      statsElem.style.visibility = "visible";
      wireStatsClick(statsElem);
    }

    /* 2. Visual Stage */
    var stage = document.createElement("div");
    stage.id = "dolp-visual-stage";

    var sky     = el("canvasSkybox") || document.querySelector("#canvasSkybox");
    var imgWrap = el("sidebar-img-container") || document.querySelector("#sidebar-img-container");

    if (sky) stage.appendChild(sky);
    if (imgWrap) stage.appendChild(imgWrap);

    pVis.appendChild(stage);

    /* Statmeters in Visuals Panel */
    var statMeters = el("statmeters") || document.querySelector("#statmeters");
    if (statMeters) {
      var headerDiv = document.createElement("div");
      headerDiv.className = "dolp-statmeter-header";

      var arrowBtn = document.createElement("button");
      arrowBtn.className = "dolp-statmeter-arrow";
      arrowBtn.textContent = config.statmetersCollapsed ? "▲" : "▼";
      arrowBtn.title = "Toggle Horizontal Statmeter Badges";
      arrowBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        config.statmetersCollapsed = !config.statmetersCollapsed;
        arrowBtn.textContent = config.statmetersCollapsed ? "▲" : "▼";
        statMeters.classList.toggle("dolp-statmeters-collapsed", !!config.statmetersCollapsed);
        syncStatmeterColors();
        saveConfig();
        setTimeout(updateSidebarHeightVar, 0);
        requestAnimationFrame(updateSidebarHeightVar);
      });

      headerDiv.appendChild(arrowBtn);

      pVis.appendChild(headerDiv);
      pVis.appendChild(statMeters);

      statMeters.style.display = "block";
      statMeters.style.visibility = "visible";
      statMeters.classList.toggle("dolp-statmeters-collapsed", !!config.statmetersCollapsed);
      syncStatmeterColors();
    }

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
    if (captionContent) {
      pAttr.appendChild(captionContent);
      captionContent.style.display = "block";
      captionContent.style.visibility = "visible";

      var rawOverlay = captionContent.querySelector("#overlayButtons");
      if (rawOverlay) {
        rawOverlay.style.display = "none";
      }
    }

    var attrBtnList = [];
    allSourceBtns.forEach(function (btn) {
      var txt = (btn.textContent || "").toUpperCase().trim();
      if (!txt) return;

      var isAttr = attrKeywords.some(function (kw) { return txt.indexOf(kw) !== -1; });
      if (isAttr) {
        attrBtnList.push(btn);
      } else {
        btn.classList.add("macro-button");
        setBtns.appendChild(btn);
      }
    });

    var charBtn = null;
    var featBtn = null;
    var midBtns = [];

    attrBtnList.forEach(function (b) {
      var txt = (b.textContent || "").toUpperCase().trim();
      if (txt.indexOf("CHARACTERISTICS") !== -1 || txt.indexOf("ATTRIBUTES") !== -1) {
        charBtn = b;
      } else if (txt.indexOf("FEATS") !== -1) {
        featBtn = b;
      } else {
        midBtns.push(b);
      }
    });

    if (charBtn) {
      charBtn.classList.add("dolp-btn-full");
      attrBtns.appendChild(charBtn);
    }

    midBtns.forEach(function (b) {
      b.classList.remove("dolp-btn-full");
      attrBtns.appendChild(b);
    });

    if (featBtn) {
      featBtn.classList.add("dolp-btn-full");
      attrBtns.appendChild(featBtn);
    }

    pAttr.appendChild(attrBtns);

    /* 5. Settings Panel */
    var uiSettingsBtn = document.createElement("button");
    uiSettingsBtn.id = "dolp-ui-settings-btn";
    uiSettingsBtn.className = "macro-button";
    uiSettingsBtn.textContent = "UI SETTINGS";
    uiSettingsBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      openUISettingsOverlay();
    });

    pSet.appendChild(uiSettingsBtn);
    pSet.appendChild(setBtns);

    wireOriginalToggle();
    applyStates();
    applyConfig();
  }

  function createCustomRow(labelText, type, currentVal, onChange) {
    var div = document.createElement("div");
    div.className = "dolp-custom-row";

    var lbl = document.createElement("label");
    lbl.textContent = labelText;

    var input = document.createElement("input");
    input.type = type;
    if (type === "checkbox") input.checked = !!currentVal;
    else if (type === "color") input.value = currentVal || "#ffd700";

    input.addEventListener("change", function () {
      onChange(type === "checkbox" ? input.checked : input.value);
    });

    div.appendChild(lbl);
    div.appendChild(input);
    return div;
  }

  function createCustomSelect(labelText, options, currentVal, onChange) {
    var div = document.createElement("div");
    div.className = "dolp-custom-row";

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

  var mirrorPairs = [];
  var rafRunning  = false;
  var rebuildTimer = null;
  var skyObserved  = false;

  function ensureSVHost() {
    var host = el("dolp-sv-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "dolp-sv-host";
      var inner = document.createElement("div");
      inner.id = "dolp-sv-inner";
      host.appendChild(inner);
      document.body.appendChild(host);
    }
    host.style.display = config.sideviewEnabled ? "block" : "none";
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
    var inner = el("dolp-sv-inner");
    var host = el("dolp-sv-host");
    if (!inner || !host) return;

    if (!config.sideviewEnabled) {
      host.style.display = "none";
      return;
    }
    host.style.display = "block";

    var opacity = (typeof config.sideviewOpacity !== "undefined" ? config.sideviewOpacity : 100) / 100;
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
    if (!config.sideviewEnabled) {
      var h = el("dolp-sv-host");
      if (h) h.style.display = "none";
      return;
    }

    var src = el("canvasSkybox");
    ensureSVHost();
    var inner = el("dolp-sv-inner");
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
    if (config.sideviewEnabled) {
      sizeSV();
      for (var i = 0; i < mirrorPairs.length; i++) {
        var s = mirrorPairs[i][0], d = mirrorPairs[i][1];
        if (!s.isConnected) continue;
        if (d.width  !== s.width)  d.width  = s.width;
        if (d.height !== s.height) d.height = s.height;
        var ctx = d.getContext("2d");
        if (!ctx) continue;
        ctx.clearRect(0, 0, d.width, d.height);
        try { ctx.drawImage(s, 0, 0); } catch (_) {}
      }
    }
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
      }
    }, 30);
  }

  function relayout(immediate) {
    requestSync(immediate);
    ensureSVHost();
    if (!mirrorPairs.length) rebuildMirror();
    else scheduleMirrorRebuild();
    watchSkybox();
  }

  function boot() {
    loadConfig();
    applyConfig();

    if (typeof $ === "function") {
      $(document).on(":passagerender", function () { relayout(true); });
      $(document).on(":passageend",    function () { relayout(true); });
    } else {
      document.addEventListener(":passagerender", function () { relayout(true); });
      document.addEventListener(":passageend",    function () { relayout(true); });
    }

    if (typeof MutationObserver !== "undefined" && document.body) {
      new MutationObserver(function () {
        sizeSV();
        applySidebarFontOptions();
      }).observe(document.body, { attributes: true, attributeFilter: ["style"] });
    }

    relayout(true);
    window.addEventListener("resize", function () {
      sizeSV();
      updateSidebarHeightVar();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();