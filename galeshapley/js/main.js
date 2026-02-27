(function () {
  const { GSI18N, GSAlgorithms } = window;

  const state = {
    lang: 'en',
    theme: 'light',
    proposerSide: 'men',
    variant: 'classic',
    preset: 'hpl_spl',
    groupNames: {
      men: 'Men',
      women: 'Women'
    },
    instance: null,
    engine: null,
    autoTimer: null,
    statusMessage: '',
    logEntries: [],
    activeTab: 'sim',
    insightsCache: null,
    exhaustedProposers: new Set(),
    recentlySingle: new Set(),
    traits: {},
    controlsCollapsed: false,
    codeCollapsed: false,
    curves: {
      running: false,
      stopRequested: false,
      rows: [],
      progress: '',
      xMax: null,
      yZoom: 1,
      activeSeries: null,
      tooltip: null,
      toggles: {
        random: true,
        inverse: true,
        easy: true,
        worstCase: true,
        linear: true,
        half: true,
        square: true
      }
    }
  };

  const resizeState = {
    mode: null,
    pointerId: null,
    bounds: null,
    splitterEl: null
  };

  const els = {
    mainLayout: document.getElementById('mainLayout'),
    controlPanel: document.getElementById('controlPanel'),
    workspacePanel: document.getElementById('workspacePanel'),
    simGrid: document.getElementById('simGrid'),
    visualColumn: document.getElementById('visualColumn'),
    codeColumn: document.getElementById('codeColumn'),

    mainSplitter: document.getElementById('mainSplitter'),
    simSplitter: document.getElementById('simSplitter'),

    toggleControlsBtn: document.getElementById('toggleControlsBtn'),
    toggleCodeBtn: document.getElementById('toggleCodeBtn'),
    floatingControlsBtn: document.getElementById('floatingControlsBtn'),
    floatingCodeBtn: document.getElementById('floatingCodeBtn'),

    langToggle: document.getElementById('langToggle'),
    langFlag: document.getElementById('langFlag'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),

    helpBtn: document.getElementById('helpBtn'),
    helpOverlay: document.getElementById('helpOverlay'),
    helpCloseBtn: document.getElementById('helpCloseBtn'),
    referencesLink: document.getElementById('referencesLink'),
    referencesOverlay: document.getElementById('referencesOverlay'),
    referencesCloseBtn: document.getElementById('referencesCloseBtn'),

    variantSelect: document.getElementById('variantSelect'),
    presetSelect: document.getElementById('presetSelect'),
    presetHplOption: document.querySelector('#presetSelect option[value="hpl_spl"]'),
    pairsInput: document.getElementById('pairsInput'),
    goodCountInput: document.getElementById('goodCountInput'),
    proposerSelect: document.getElementById('proposerSelect'),
    proposerMenOption: document.getElementById('proposerMenOption'),
    proposerWomenOption: document.getElementById('proposerWomenOption'),
    groupLeftInput: document.getElementById('groupLeftInput'),
    groupRightInput: document.getElementById('groupRightInput'),
    forbiddenCountInput: document.getElementById('forbiddenCountInput'),
    residentCountInput: document.getElementById('residentCountInput'),
    positionsCountInput: document.getElementById('positionsCountInput'),
    hospitalCountInput: document.getElementById('hospitalCountInput'),
    hospitalPosMinInput: document.getElementById('hospitalPosMinInput'),
    hospitalPosMaxInput: document.getElementById('hospitalPosMaxInput'),
    residentAppsMinInput: document.getElementById('residentAppsMinInput'),
    residentAppsMaxInput: document.getElementById('residentAppsMaxInput'),
    speedSelect: document.getElementById('speedSelect'),

    pairsField: document.getElementById('pairsField'),
    goodCountField: document.getElementById('goodCountField'),
    forbiddenField: document.getElementById('forbiddenField'),
    residentCountField: document.getElementById('residentCountField'),
    positionsCountField: document.getElementById('positionsCountField'),
    hospitalCountField: document.getElementById('hospitalCountField'),
    hospitalPosRangeField: document.getElementById('hospitalPosRangeField'),
    residentAppsRangeField: document.getElementById('residentAppsRangeField'),

    scenarioNote: document.getElementById('scenarioNote'),
    presetNote: document.getElementById('presetNote'),

    loadPresetBtn: document.getElementById('loadPresetBtn'),
    resetRunBtn: document.getElementById('resetRunBtn'),
    runStepBtn: document.getElementById('runStepBtn'),
    autoRunBtn: document.getElementById('autoRunBtn'),
    runFullBtn: document.getElementById('runFullBtn'),

    csvInput: document.getElementById('csvInput'),
    applyTablesBtn: document.getElementById('applyTablesBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),

    statusBar: document.getElementById('statusBar'),
    advancedDetails: document.getElementById('advancedDetails'),

    proposalCount: document.getElementById('proposalCount'),
    engagedCount: document.getElementById('engagedCount'),
    singleMenCount: document.getElementById('singleMenCount'),
    singleWomenCount: document.getElementById('singleWomenCount'),
    singleLeftLabel: document.getElementById('singleLeftLabel'),
    singleRightLabel: document.getElementById('singleRightLabel'),

    menPrefTitle: document.getElementById('menPrefTitle'),
    womenPrefTitle: document.getElementById('womenPrefTitle'),
    menPrefTable: document.getElementById('menPrefTable'),
    womenPrefTable: document.getElementById('womenPrefTable'),
    graphModeTag: document.getElementById('graphModeTag'),
    matchGraph: document.getElementById('matchGraph'),
    insightsGrid: document.getElementById('insightsGrid'),

    codeDisplay: document.getElementById('codeDisplay'),
    dsDisplay: document.getElementById('dsDisplay'),
    stepLog: document.getElementById('stepLog'),

    menEditorTableEl: document.getElementById('menEditorTable'),
    womenEditorTableEl: document.getElementById('womenEditorTable'),
    menEditorTable: document.getElementById('menEditorTable').querySelector('tbody'),
    womenEditorTable: document.getElementById('womenEditorTable').querySelector('tbody'),
    addManRowBtn: document.getElementById('addManRowBtn'),
    addWomanRowBtn: document.getElementById('addWomanRowBtn'),
    editorLeftTitle: document.getElementById('editorLeftTitle'),
    editorRightTitle: document.getElementById('editorRightTitle'),

    tabSimBtn: document.getElementById('tabSimBtn'),
    tabCurvesBtn: document.getElementById('tabCurvesBtn'),
    tabSim: document.getElementById('tabSim'),
    tabCurves: document.getElementById('tabCurves'),

    curveStartInput: document.getElementById('curveStartInput'),
    curveEndInput: document.getElementById('curveEndInput'),
    curveStepInput: document.getElementById('curveStepInput'),
    curveRepeatsInput: document.getElementById('curveRepeatsInput'),
    curveXMaxSelect: document.getElementById('curveXMaxSelect'),
    curveYZoomInput: document.getElementById('curveYZoomInput'),

    toggleRandom: document.getElementById('toggleRandom'),
    toggleInverse: document.getElementById('toggleInverse'),
    toggleEasy: document.getElementById('toggleEasy'),
    toggleWorstCase: document.getElementById('toggleWorstCase'),
    toggleLinear: document.getElementById('toggleLinear'),
    toggleHalf: document.getElementById('toggleHalf'),
    toggleSquare: document.getElementById('toggleSquare'),

    runCurvesBtn: document.getElementById('runCurvesBtn'),
    stopCurvesBtn: document.getElementById('stopCurvesBtn'),
    curveStatus: document.getElementById('curveStatus'),
    curveChartArea: document.getElementById('curveChartArea'),
    curveChartSvg: document.getElementById('curveChartSvg'),
    curveTooltip: document.getElementById('curveTooltip'),
    curveTable: document.getElementById('curveTable')
  };

  function t(key, params = {}) {
    return GSI18N.t(state.lang, key, params);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function hashString(value) {
    let hash = 2166136261;
    const s = String(value || '');
    for (let i = 0; i < s.length; i += 1) {
      hash ^= s.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash >>> 0);
  }

  function setStatus(keyOrText, params = {}, isRaw = false) {
    state.statusMessage = isRaw ? String(keyOrText) : t(keyOrText, params);
    renderStatus();
  }

  function readNumberInput(inputEl, fallback, min, max) {
    const parsed = Number.parseInt(String(inputEl.value || ''), 10);
    const safe = Number.isFinite(parsed) ? parsed : fallback;
    const clamped = clamp(safe, min, max);
    inputEl.value = String(clamped);
    return clamped;
  }

  function syncForbiddenCountBounds(maxPairs) {
    const max = Math.max(0, Number.isFinite(maxPairs) ? maxPairs : 0);
    els.forbiddenCountInput.min = '0';
    els.forbiddenCountInput.max = String(max);
    readNumberInput(els.forbiddenCountInput, Math.min(1, max), 0, max);
  }

  function readForbiddenCount(maxPairs) {
    const max = Math.max(0, Number.isFinite(maxPairs) ? maxPairs : 0);
    syncForbiddenCountBounds(max);
    return readNumberInput(els.forbiddenCountInput, Math.min(1, max), 0, max);
  }

  function syncResidentMatchingBounds() {
    const hospitals = readNumberInput(els.hospitalCountInput, 6, 1, 2000);
    readNumberInput(els.residentCountInput, 10, 1, 2000);

    const posMin = readNumberInput(els.hospitalPosMinInput, 1, 1, 1000000);
    els.hospitalPosMaxInput.min = String(posMin);
    const posMax = readNumberInput(els.hospitalPosMaxInput, Math.max(posMin, 3), posMin, 1000000);
    els.hospitalPosMinInput.max = String(posMax);

    const minTotal = hospitals * posMin;
    const maxTotal = hospitals * posMax;
    els.positionsCountInput.min = String(minTotal);
    els.positionsCountInput.max = String(maxTotal);
    readNumberInput(els.positionsCountInput, minTotal, minTotal, maxTotal);

    els.residentAppsMinInput.max = String(hospitals);
    const appsMin = readNumberInput(els.residentAppsMinInput, 1, 1, hospitals);
    els.residentAppsMaxInput.min = String(appsMin);
    els.residentAppsMaxInput.max = String(hospitals);
    const appsMax = readNumberInput(els.residentAppsMaxInput, Math.max(appsMin, Math.min(3, hospitals)), appsMin, hospitals);
    els.residentAppsMinInput.max = String(appsMax);
    readNumberInput(els.residentAppsMinInput, appsMin, 1, appsMax);
  }

  function readResidentMatchingConfig() {
    syncResidentMatchingBounds();
    return {
      residents: readNumberInput(els.residentCountInput, 10, 1, 2000),
      positions: readNumberInput(
        els.positionsCountInput,
        12,
        Number.parseInt(els.positionsCountInput.min, 10) || 1,
        Number.parseInt(els.positionsCountInput.max, 10) || 1000000
      ),
      hospitals: readNumberInput(els.hospitalCountInput, 6, 1, 2000),
      hospitalCapMin: readNumberInput(els.hospitalPosMinInput, 1, 1, 1000000),
      hospitalCapMax: readNumberInput(
        els.hospitalPosMaxInput,
        3,
        Number.parseInt(els.hospitalPosMaxInput.min, 10) || 1,
        1000000
      ),
      residentAppsMin: readNumberInput(
        els.residentAppsMinInput,
        1,
        1,
        Number.parseInt(els.residentAppsMinInput.max, 10) || 1
      ),
      residentAppsMax: readNumberInput(
        els.residentAppsMaxInput,
        3,
        Number.parseInt(els.residentAppsMaxInput.min, 10) || 1,
        Number.parseInt(els.residentAppsMaxInput.max, 10) || 1
      )
    };
  }

  function getCssVarPx(name, fallback) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return parsed;
  }

  function setCssVarPx(name, value) {
    document.documentElement.style.setProperty(name, `${Math.round(value)}px`);
  }

  function getScenarioDefaultGroupKeys(variant = state.variant) {
    if (variant === 'capacity') {
      return {
        left: 'side_hospitals',
        right: 'side_residents'
      };
    }
    return {
      left: 'side_men',
      right: 'side_women'
    };
  }

  function syncDefaultGroupInputs() {
    const defaults = getScenarioDefaultGroupKeys(state.variant);
    if (!els.groupLeftInput.value.trim() || els.groupLeftInput.dataset.default === '1') {
      els.groupLeftInput.value = t(defaults.left);
      els.groupLeftInput.dataset.default = '1';
    }
    if (!els.groupRightInput.value.trim() || els.groupRightInput.dataset.default === '1') {
      els.groupRightInput.value = t(defaults.right);
      els.groupRightInput.dataset.default = '1';
    }
  }

  function setLanguage(lang) {
    state.lang = lang === 'pt' ? 'pt' : 'en';
    document.body.dataset.lang = state.lang;
    document.documentElement.lang = state.lang === 'pt' ? 'pt-BR' : 'en';

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      node.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach((node) => {
      const key = node.getAttribute('data-i18n-title');
      const label = t(key);
      node.setAttribute('title', label);
      node.setAttribute('aria-label', label);
    });

    document.title = t('app_title');
    els.langFlag.textContent = state.lang === 'en' ? '🇺🇸' : '🇧🇷';
    els.langToggle.title = state.lang === 'en' ? 'Mudar para Português' : 'Switch to English';

    syncDefaultGroupInputs();

    updateToggleButtons();
    updateScenarioPresetNotes();
    updateDynamicLabels();
    renderAll();
  }

  function setTheme(theme) {
    state.theme = theme === 'dark' ? 'dark' : 'light';
    document.body.classList.toggle('theme-dark', state.theme === 'dark');
    document.body.classList.toggle('theme-light', state.theme !== 'dark');
    els.themeIcon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }

  function updateDynamicLabels() {
    const defaults = getScenarioDefaultGroupKeys(state.variant);
    state.groupNames.men = String(els.groupLeftInput.value || '').trim() || t(defaults.left);
    state.groupNames.women = String(els.groupRightInput.value || '').trim() || t(defaults.right);

    els.menPrefTitle.textContent = t('pref_title_generic', { group: state.groupNames.men });
    els.womenPrefTitle.textContent = t('pref_title_generic', { group: state.groupNames.women });
    els.editorLeftTitle.textContent = t('editor_title_generic', { group: state.groupNames.men });
    els.editorRightTitle.textContent = t('editor_title_generic', { group: state.groupNames.women });

    els.singleLeftLabel.textContent = t('counter_single_generic', { group: state.groupNames.men });
    els.singleRightLabel.textContent = t('counter_single_generic', { group: state.groupNames.women });

    els.proposerMenOption.textContent = t('proposer_generic', { group: state.groupNames.men });
    els.proposerWomenOption.textContent = t('proposer_generic', { group: state.groupNames.women });
  }

  function updateToggleButtons() {
    const controlsKey = state.controlsCollapsed ? 'toggle_controls_show' : 'toggle_controls_hide';
    const codeKey = state.codeCollapsed ? 'toggle_code_show' : 'toggle_code_hide';

    els.toggleControlsBtn.dataset.i18nTitle = controlsKey;
    els.toggleCodeBtn.dataset.i18nTitle = codeKey;

    const controlsLabel = t(controlsKey);
    const codeLabel = t(codeKey);

    els.toggleControlsBtn.title = controlsLabel;
    els.toggleControlsBtn.setAttribute('aria-label', controlsLabel);
    els.toggleControlsBtn.textContent = state.controlsCollapsed ? '🧰+' : '🧰-';

    els.toggleCodeBtn.title = codeLabel;
    els.toggleCodeBtn.setAttribute('aria-label', codeLabel);
    els.toggleCodeBtn.textContent = state.codeCollapsed ? '📜+' : '📜-';

    els.floatingControlsBtn.title = controlsLabel;
    els.floatingControlsBtn.setAttribute('aria-label', controlsLabel);
    els.floatingControlsBtn.textContent = '🧰+';
    els.floatingControlsBtn.hidden = !state.controlsCollapsed;

    els.floatingCodeBtn.title = codeLabel;
    els.floatingCodeBtn.setAttribute('aria-label', codeLabel);
    els.floatingCodeBtn.textContent = '📜+';
    els.floatingCodeBtn.hidden = !(state.codeCollapsed && state.activeTab === 'sim');
  }

  function applyPanelLayout() {
    document.body.classList.toggle('controls-collapsed', state.controlsCollapsed);
    document.body.classList.toggle('code-collapsed', state.codeCollapsed);
    updateToggleButtons();
  }

  function isDesktopLayout() {
    return !window.matchMedia('(max-width: 1200px)').matches;
  }

  function startResize(mode, event) {
    if (!isDesktopLayout()) {
      return;
    }
    if (mode === 'main' && state.controlsCollapsed) {
      return;
    }
    if (mode === 'sim' && state.codeCollapsed) {
      return;
    }

    resizeState.mode = mode;
    resizeState.pointerId = event.pointerId;
    resizeState.splitterEl = mode === 'main' ? els.mainSplitter : els.simSplitter;

    if (mode === 'main') {
      const rect = els.mainLayout.getBoundingClientRect();
      resizeState.bounds = {
        rect,
        min: getCssVarPx('--controls-min', 280),
        max: getCssVarPx('--controls-max', 520)
      };
    } else {
      const rect = els.simGrid.getBoundingClientRect();
      resizeState.bounds = {
        rect,
        min: getCssVarPx('--code-min', 320),
        max: getCssVarPx('--code-max', 680)
      };
    }

    if (resizeState.splitterEl) {
      resizeState.splitterEl.classList.add('active');
    }
    document.body.classList.add('resizing');

    document.addEventListener('pointermove', onResizeMove);
    document.addEventListener('pointerup', stopResize);
    document.addEventListener('pointercancel', stopResize);
    event.preventDefault();
  }

  function onResizeMove(event) {
    if (!resizeState.mode || !resizeState.bounds) {
      return;
    }

    if (resizeState.mode === 'main') {
      const x = event.clientX - resizeState.bounds.rect.left;
      const width = clamp(x, resizeState.bounds.min, resizeState.bounds.max);
      setCssVarPx('--controls-width', width);
      return;
    }

    const fromRight = resizeState.bounds.rect.right - event.clientX;
    const width = clamp(fromRight, resizeState.bounds.min, resizeState.bounds.max);
    setCssVarPx('--code-width', width);
  }

  function stopResize() {
    document.removeEventListener('pointermove', onResizeMove);
    document.removeEventListener('pointerup', stopResize);
    document.removeEventListener('pointercancel', stopResize);

    if (resizeState.splitterEl) {
      resizeState.splitterEl.classList.remove('active');
    }

    resizeState.mode = null;
    resizeState.pointerId = null;
    resizeState.bounds = null;
    resizeState.splitterEl = null;
    document.body.classList.remove('resizing');
  }

  function toggleControlsPanel() {
    state.controlsCollapsed = !state.controlsCollapsed;
    applyPanelLayout();
  }

  function toggleCodePanel() {
    state.codeCollapsed = !state.codeCollapsed;
    applyPanelLayout();
  }

  function updateScenarioPresetNotes() {
    const scenarioKeyMap = {
      classic: 'scenario_note_classic',
      good_bad: 'scenario_note_good_bad',
      forbidden: 'scenario_note_forbidden',
      capacity: 'scenario_note_capacity'
    };

    const presetKeyMap = {
      hpl_spl: 'preset_note_hpl',
      worst_case_demo: 'preset_note_worst_case',
      random: 'preset_note_random',
      inverse: 'preset_note_inverse',
      easy: 'preset_note_easy'
    };

    els.scenarioNote.textContent = t(scenarioKeyMap[state.variant] || 'scenario_note_classic');
    els.presetNote.textContent = t(presetKeyMap[state.preset] || 'preset_note_random');
  }

  function updatePresetAvailability() {
    const variant = els.variantSelect.value;
    const allowHpl = variant === 'classic';

    if (els.presetHplOption) {
      els.presetHplOption.hidden = !allowHpl;
      els.presetHplOption.disabled = !allowHpl;
    }

    if (!allowHpl && els.presetSelect.value === 'hpl_spl') {
      els.presetSelect.value = 'random';
    }

    state.preset = els.presetSelect.value;
  }

  function updateVariantFieldsVisibility() {
    const variant = els.variantSelect.value;
    updatePresetAvailability();
    const preset = els.presetSelect.value;
    const n = readNumberInput(els.pairsInput, 5, 2, 2000);

    const usesN = variant !== 'capacity'
      && (variant === 'good_bad' || preset === 'random' || preset === 'inverse' || preset === 'easy' || preset === 'worst_case_demo');
    const showCap = variant === 'capacity';
    const showCategory = variant === 'good_bad';
    const showResidentParams = variant === 'capacity';

    els.pairsField.classList.toggle('hidden', !usesN);
    els.goodCountField.classList.toggle('hidden', variant !== 'good_bad');
    els.forbiddenField.classList.toggle('hidden', variant !== 'forbidden');
    els.residentCountField.classList.toggle('hidden', !showResidentParams);
    els.positionsCountField.classList.toggle('hidden', !showResidentParams);
    els.hospitalCountField.classList.toggle('hidden', !showResidentParams);
    els.hospitalPosRangeField.classList.toggle('hidden', !showResidentParams);
    els.residentAppsRangeField.classList.toggle('hidden', !showResidentParams);
    els.advancedDetails.hidden = variant === 'classic';

    els.menEditorTableEl.classList.toggle('hide-cap-col', !showCap);
    els.womenEditorTableEl.classList.toggle('hide-cap-col', !showCap);
    els.menEditorTableEl.classList.toggle('hide-cat-col', !showCategory);
    els.womenEditorTableEl.classList.toggle('hide-cat-col', !showCategory);
    if (variant === 'capacity') {
      syncResidentMatchingBounds();
    } else {
      syncForbiddenCountBounds(n * n);
    }
  }

  function formatPartnerList(list) {
    if (!Array.isArray(list) || !list.length) {
      return t('partner_none');
    }
    return list.join(', ');
  }

  function buildPartnerMaps(pairs) {
    const menPartners = {};
    const womenPartners = {};

    for (const man of state.instance.men) {
      menPartners[man] = [];
    }
    for (const woman of state.instance.women) {
      womenPartners[woman] = [];
    }

    for (const pair of pairs) {
      if (!menPartners[pair.man]) {
        menPartners[pair.man] = [];
      }
      if (!womenPartners[pair.woman]) {
        womenPartners[pair.woman] = [];
      }
      menPartners[pair.man].push(pair.woman);
      womenPartners[pair.woman].push(pair.man);
    }

    return { menPartners, womenPartners };
  }

  function rankValue(prefList, candidateList) {
    if (!Array.isArray(candidateList) || !candidateList.length) {
      return '-';
    }

    let bestRank = Number.POSITIVE_INFINITY;
    for (const candidate of candidateList) {
      const idx = prefList.indexOf(candidate);
      if (idx >= 0 && idx < bestRank) {
        bestRank = idx;
      }
    }

    if (!Number.isFinite(bestRank)) {
      return '-';
    }

    if (candidateList.length > 1) {
      return `${bestRank + 1}+`;
    }

    return String(bestRank + 1);
  }

  function personCategory(side, name) {
    if (!state.instance || state.variant !== 'good_bad') {
      return '';
    }

    const map = side === 'men' ? state.instance.menCategory : state.instance.womenCategory;
    const value = String(map && map[name] ? map[name] : '').trim().toLowerCase();
    return value === 'good' || value === 'bad' ? value : '';
  }

  function isForbiddenPair(man, woman) {
    if (!state.instance || state.variant !== 'forbidden') {
      return false;
    }
    return state.instance.forbidden.has(`${man}|${woman}`);
  }

  function isForbiddenCandidate(side, name, candidate) {
    if (side === 'men') {
      return isForbiddenPair(name, candidate);
    }
    return isForbiddenPair(candidate, name);
  }

  function graphClothesColor(side, name, isExhausted) {
    if (isExhausted) {
      return '#9d5b5b';
    }

    const category = personCategory(side, name);
    if (category === 'good') {
      return side === 'men' ? '#2f9f72' : '#62c88f';
    }
    if (category === 'bad') {
      return side === 'men' ? '#7453b4' : '#a385db';
    }

    return side === 'men' ? 'var(--graph-men)' : 'var(--graph-women)';
  }

  function statusSlots(side, name, partnersCount, recentlySingle) {
    const matched = Math.max(0, Number.parseInt(String(partnersCount || 0), 10) || 0);
    const isHospitalWithCapacity = state.variant === 'capacity' && side === 'men';

    if (!isHospitalWithCapacity) {
      if (recentlySingle) {
        return ['single'];
      }
      if (matched > 0) {
        return ['engaged'];
      }
      return [];
    }

    const rawCap = Number.parseInt(String(state.instance && state.instance.mCap ? state.instance.mCap[name] : 1), 10);
    const cap = Math.max(1, Number.isFinite(rawCap) ? rawCap : 1);
    const engagedCount = clamp(matched, 0, cap);
    const slots = [];

    for (let i = 0; i < engagedCount; i += 1) {
      slots.push('engaged');
    }

    if (recentlySingle && cap > 0) {
      if (slots.length < cap) {
        slots.push('single');
      } else if (slots.length > 0) {
        slots[slots.length - 1] = 'single';
      } else {
        slots.push('single');
      }
    }

    while (slots.length < cap) {
      slots.push('open');
    }

    return slots;
  }

  function tableStatusMarkerHtml(side, name, partnersCount, recentlySingle) {
    const slots = statusSlots(side, name, partnersCount, recentlySingle);
    if (!slots.length) {
      return '';
    }

    if (slots.length === 1 && slots[0] !== 'open') {
      if (slots[0] === 'single') {
        return `<span class="name-marker single" aria-label="${escapeHtml(t('status_became_single'))}">∅</span>`;
      }
      return `<span class="name-marker engaged" aria-label="${escapeHtml(t('legend_engaged'))}">O</span>`;
    }

    const markerHtml = slots
      .map((slot) => {
        if (slot === 'engaged') {
          return '<span class="name-marker engaged" aria-hidden="true">O</span>';
        }
        if (slot === 'single') {
          return '<span class="name-marker single" aria-hidden="true">∅</span>';
        }
        return '<span class="name-marker open" aria-hidden="true">_</span>';
      })
      .join('');
    return `<span class="name-slot-markers" aria-hidden="true">${markerHtml}</span>`;
  }

  function graphStatusClass(slot) {
    if (slot === 'single') return 'graph-status-single';
    if (slot === 'engaged') return 'graph-status-engaged';
    return 'graph-status-open';
  }

  function graphStatusChar(slot) {
    if (slot === 'single') return '∅';
    if (slot === 'engaged') return 'O';
    return '_';
  }

  function graphStatusMarkerSvg(side, name, x, y, partnersCount, recentlySingle, spacing = 10) {
    const slots = statusSlots(side, name, partnersCount, recentlySingle);
    if (!slots.length) {
      return '';
    }

    if (slots.length === 1) {
      const slot = slots[0];
      return `<text class="graph-status-marker ${graphStatusClass(slot)}" x="${x}" y="${y}" text-anchor="middle">${graphStatusChar(slot)}</text>`;
    }

    const step = spacing;
    const startX = x - ((slots.length - 1) * step) / 2;
    return slots
      .map((slot, idx) => {
        const slotX = startX + (idx * step);
        return `<text class="graph-status-marker ${graphStatusClass(slot)}" x="${slotX}" y="${y}" text-anchor="middle">${graphStatusChar(slot)}</text>`;
      })
      .join('');
  }

  function graphLayoutMetrics(detailedMode) {
    if (detailedMode) {
      const nodeTop = 24;
      const nodeBottom = 23;
      const markerAscent = 16;
      const markerDescent = 4;
      const markerGapAboveNode = 2;
      const interNodeGap = 2;
      const topPadding = 2;
      const bottomPadding = 28;
      const markerHeight = markerAscent + markerDescent;
      const markerTopExtent = nodeTop + markerGapAboveNode + markerHeight;
      return {
        nodeTop,
        nodeBottom,
        markerAscent,
        markerDescent,
        markerGapAboveNode,
        interNodeGap,
        topPadding,
        bottomPadding,
        markerHeight,
        markerTopExtent,
        // Baseline position for marker text so marker stays above its own node.
        markerBaselineOffset: -(nodeTop + markerGapAboveNode + markerDescent),
        requiredStep: nodeBottom + interNodeGap + markerTopExtent
      };
    }

    const nodeTop = 6;
    const nodeBottom = 6;
    const markerAscent = 12;
    const markerDescent = 3;
    const markerGapAboveNode = 1;
    const interNodeGap = 2;
    const topPadding = 2;
    const bottomPadding = 16;
    const markerHeight = markerAscent + markerDescent;
    const markerTopExtent = nodeTop + markerGapAboveNode + markerHeight;
    return {
      nodeTop,
      nodeBottom,
      markerAscent,
      markerDescent,
      markerGapAboveNode,
      interNodeGap,
      topPadding,
      bottomPadding,
      markerHeight,
      markerTopExtent,
      markerBaselineOffset: -(nodeTop + markerGapAboveNode + markerDescent),
      requiredStep: nodeBottom + interNodeGap + markerTopExtent
    };
  }

  function createEditorRow(side, rowData = {}) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const prefsCell = document.createElement('td');
    const capCell = document.createElement('td');
    capCell.className = 'editor-cap-col';
    const catCell = document.createElement('td');
    catCell.className = 'editor-cat-col';
    const delCell = document.createElement('td');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = rowData.name || '';
    nameInput.placeholder = state.variant === 'capacity'
      ? (side === 'men' ? 'H1' : 'R1')
      : (side === 'men' ? 'M1' : 'W1');

    const prefsInput = document.createElement('input');
    prefsInput.type = 'text';
    prefsInput.value = rowData.prefs || '';
    prefsInput.placeholder = state.variant === 'capacity'
      ? (side === 'men' ? 'R1, R2, R3' : 'H1, H2, H3')
      : (side === 'men' ? 'W1, W2, W3' : 'M1, M2, M3');

    const capInput = document.createElement('input');
    capInput.type = 'number';
    capInput.min = '1';
    capInput.step = '1';
    capInput.value = rowData.cap != null ? String(rowData.cap) : '1';

    const catInput = document.createElement('input');
    catInput.type = 'hidden';
    const catToggle = document.createElement('button');
    catToggle.type = 'button';
    catToggle.className = 'secondary category-toggle';
    const normalizedCategory = String(rowData.category || '').trim().toLowerCase() === 'bad' ? 'bad' : 'good';

    const setCategory = (value) => {
      const normalized = value === 'bad' ? 'bad' : 'good';
      catInput.value = normalized;
      catToggle.dataset.category = normalized;
      catToggle.textContent = normalized;
      catToggle.setAttribute('aria-label', `category ${normalized}`);
    };

    catToggle.addEventListener('click', () => {
      setCategory(catInput.value === 'good' ? 'bad' : 'good');
    });
    setCategory(normalizedCategory);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'secondary row-del-btn';
    delBtn.textContent = '×';
    delBtn.addEventListener('click', () => row.remove());

    nameCell.appendChild(nameInput);
    prefsCell.appendChild(prefsInput);
    capCell.appendChild(capInput);
    catCell.appendChild(catInput);
    catCell.appendChild(catToggle);
    delCell.appendChild(delBtn);

    row.appendChild(nameCell);
    row.appendChild(prefsCell);
    row.appendChild(capCell);
    row.appendChild(catCell);
    row.appendChild(delCell);

    return row;
  }

  function fillEditors(instance) {
    els.menEditorTable.innerHTML = '';
    els.womenEditorTable.innerHTML = '';

    for (const man of instance.men) {
      els.menEditorTable.appendChild(createEditorRow('men', {
        name: man,
        prefs: (instance.mPrefs[man] || []).join(', '),
        cap: instance.mCap[man],
        category: instance.menCategory[man] || ''
      }));
    }

    for (const woman of instance.women) {
      els.womenEditorTable.appendChild(createEditorRow('women', {
        name: woman,
        prefs: (instance.wPrefs[woman] || []).join(', '),
        cap: instance.wCap[woman],
        category: instance.womenCategory[woman] || ''
      }));
    }
  }

  function parseEditorRows(tbody, side, options = {}) {
    const includeCap = Boolean(options.includeCap);
    const includeCategory = Boolean(options.includeCategory);

    const names = [];
    const prefs = {};
    const cap = {};
    const category = {};

    for (const tr of tbody.querySelectorAll('tr')) {
      const inputs = tr.querySelectorAll('input, select');
      if (inputs.length < 4) {
        continue;
      }

      const name = String(inputs[0].value || '').trim();
      if (!name) {
        continue;
      }

      const prefList = String(inputs[1].value || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

      const capValue = includeCap
        ? Number.parseInt(String(inputs[2].value || '1'), 10)
        : 1;
      const catValue = includeCategory
        ? String(inputs[3].value || '').trim().toLowerCase()
        : '';

      names.push(name);
      prefs[name] = prefList;
      cap[name] = includeCap && Number.isFinite(capValue) ? Math.max(1, capValue) : 1;
      category[name] = includeCategory ? catValue : '';
    }

    return side === 'men'
      ? { men: names, mPrefs: prefs, mCap: cap, menCategory: category }
      : { women: names, wPrefs: prefs, wCap: cap, womenCategory: category };
  }

  function getBasePresetInstance() {
    const preset = state.preset;
    const n = readNumberInput(els.pairsInput, 5, 2, 2000);

    if (preset === 'hpl_spl') {
      return GSAlgorithms.presets.hplSpl();
    }
    if (preset === 'worst_case_demo') {
      return GSAlgorithms.presets.worstCase(n);
    }
    if (preset === 'inverse') {
      return GSAlgorithms.presets.inverse(n);
    }
    if (preset === 'easy') {
      return GSAlgorithms.presets.easy(n);
    }

    return GSAlgorithms.presets.random(n);
  }

  function buildInstanceFromControls() {
    state.variant = els.variantSelect.value;
    state.preset = els.presetSelect.value;
    state.proposerSide = els.proposerSelect.value === 'women' ? 'women' : 'men';

    if (state.variant === 'capacity') {
      const config = readResidentMatchingConfig();
      return GSAlgorithms.createResidentMatchingInstance({
        preset: state.preset,
        ...config,
        seed: state.preset === 'random' ? Date.now() : 314159
      });
    }

    const n = readNumberInput(els.pairsInput, 5, 2, 2000);
    const k = readNumberInput(els.goodCountInput, Math.max(1, Math.floor(n / 2)), 1, Math.max(1, n - 1));

    let instance;

    if (state.variant === 'good_bad') {
      const goodBadSeed = Date.now();
      instance = GSAlgorithms.presets.goodBadFromPreset(state.preset, n, k, goodBadSeed);
    } else {
      instance = getBasePresetInstance();
    }

    if (state.variant === 'forbidden') {
      const maxForbidden = instance.men.length * instance.women.length;
      const forbiddenCount = readForbiddenCount(maxForbidden);
      const forbidden = GSAlgorithms.generateForbiddenPairs(instance, forbiddenCount, Date.now());
      instance = GSAlgorithms.applyForbiddenPairs(instance, forbidden);
    }

    return instance;
  }

  function generateTraits(instance) {
    const all = [...instance.men, ...instance.women];
    const traits = {};
    for (const name of all) {
      const h = hashString(name);
      traits[name] = {
        body: h % 3,
        hat: (h >> 3) % 3,
        glasses: ((h >> 5) % 2) === 1,
        colorOffset: (h % 140)
      };
    }
    state.traits = traits;
  }

  function createEngine(instance, proposerSide = state.proposerSide) {
    let options = {};
    if (state.variant === 'capacity') {
      const capacitySide = proposerSide === 'women' ? 'receiver' : 'proposer';
      options = { capacitySide };
    }
    return new GSAlgorithms.GSEngine(instance, proposerSide, options);
  }

  function initializeEngine() {
    state.engine = createEngine(state.instance, state.proposerSide);
    state.logEntries = [t('step_initial')];
    state.exhaustedProposers = new Set();
    state.recentlySingle = new Set();
    state.insightsCache = null;
    stopAuto(false);
    renderAll();
  }

  function loadInstance(instance, statusKey = 'status_loaded') {
    state.instance = GSAlgorithms.cloneInstance(instance);
    generateTraits(state.instance);
    fillEditors(state.instance);
    initializeEngine();
    setStatus(statusKey);
  }

  function formatEventMessage(event) {
    if (!event || !event.key) {
      return '';
    }

    const params = {
      proposer: event.proposer,
      receiver: event.receiver,
      displaced: event.displaced
    };

    if (event.type === 'accept_free') {
      return [
        t('note_propose', params),
        t('note_accept', params)
      ].join('\n');
    }

    if (event.type === 'replace') {
      return [
        t('note_propose', params),
        t('note_accept', params),
        t('note_renounces', params)
      ].join('\n');
    }

    if (event.type === 'reject') {
      const lines = [
        t('note_propose', params),
        t('note_reject', params)
      ];
      if (event.displaced) {
        lines.push(t('note_prefers', params));
      }
      return lines.join('\n');
    }

    return t(event.key, params);
  }

  function mapEventToCodeLine(event) {
    if (!event) {
      return 1;
    }

    if (Number.isFinite(event.line) && event.line >= 1) {
      return event.line;
    }

    if (event.type === 'initial') return 1;
    if (event.type === 'exhausted') return 8;
    if (event.type === 'accept_free') return 12;
    if (event.type === 'reject') return 15;
    if (event.type === 'replace') return 17;
    if (event.type === 'finished') return 18;
    return 10;
  }

  function runStep() {
    if (!state.engine) {
      return;
    }

    const event = state.engine.step();
    if (!event) {
      return;
    }

    state.recentlySingle = new Set();
    if (event.type === 'replace' && event.displaced) {
      state.recentlySingle.add(event.displaced);
    }

    if (event.type === 'exhausted' && event.proposer) {
      state.exhaustedProposers.add(event.proposer);
    }

    const text = formatEventMessage(event);
    if (text) {
      state.logEntries.push(text);
    }

    if (state.logEntries.length > 320) {
      state.logEntries.splice(0, state.logEntries.length - 320);
    }

    if (event.type === 'finished') {
      stopAuto(false);
      setStatus('status_finished');
      state.insightsCache = GSAlgorithms.analyzeSnapshot(state.instance, state.proposerSide, state.engine.getSnapshot());
    } else if (state.autoTimer) {
      setStatus('status_running');
    } else if (text) {
      setStatus(text, {}, true);
    }

    renderAll();
  }

  function runFull() {
    if (!state.engine || state.engine.done) {
      return;
    }

    stopAuto(false);
    state.engine.runToEnd();
    const snapshot = state.engine.getSnapshot();
    state.recentlySingle = new Set();

    for (const proposer of snapshot.orientation.proposers) {
      const matches = Array.isArray(snapshot.proposerMatch[proposer]) ? snapshot.proposerMatch[proposer] : [];
      if (matches.length === 0 && snapshot.nextIndex[proposer] >= (snapshot.orientation.pPrefs[proposer] || []).length) {
        state.exhaustedProposers.add(proposer);
      }
    }

    state.logEntries.push(t('status_full'));
    state.insightsCache = GSAlgorithms.analyzeSnapshot(state.instance, state.proposerSide, snapshot);
    setStatus('status_full');
    renderAll();
  }

  function autoIntervalMs() {
    const speed = Number.parseFloat(String(els.speedSelect.value || '1'));
    const safe = Number.isFinite(speed) ? clamp(speed, 0.25, 10) : 1;
    return clamp(Math.round(880 / safe), 25, 1500);
  }

  function stopAuto(showPaused) {
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
      if (showPaused) {
        setStatus('status_paused');
      }
    }
    renderAutoButton();
  }

  function toggleAuto() {
    if (!state.engine || state.engine.done) {
      return;
    }

    if (state.autoTimer) {
      stopAuto(true);
      return;
    }

    setStatus('status_running');
    state.autoTimer = setInterval(() => {
      if (!state.engine || state.engine.done) {
        stopAuto(false);
        return;
      }
      runStep();
    }, autoIntervalMs());
    renderAutoButton();
  }

  function renderAutoButton() {
    els.autoRunBtn.textContent = state.autoTimer ? t('auto_pause_btn') : t('auto_run_btn');
  }

  function renderStatus() {
    els.statusBar.textContent = state.statusMessage || '';
  }

  function renderCounters() {
    if (!state.engine || !state.instance) {
      return;
    }

    const snapshot = state.engine.getSnapshot();
    const menMatched = new Set();
    const womenMatched = new Set();
    for (const pair of snapshot.pairs) {
      menMatched.add(pair.man);
      womenMatched.add(pair.woman);
    }

    els.proposalCount.textContent = String(snapshot.proposalCount);
    els.engagedCount.textContent = String(snapshot.pairs.length);
    els.singleMenCount.textContent = String(Math.max(0, state.instance.men.length - menMatched.size));
    els.singleWomenCount.textContent = String(Math.max(0, state.instance.women.length - womenMatched.size));

    const done = snapshot.done;
    els.runStepBtn.disabled = done;
    els.autoRunBtn.disabled = done;
    els.runFullBtn.disabled = done;
  }

  function buildCodeLines() {
    if (state.variant === 'capacity') {
      const capacityOnProposer = state.proposerSide !== 'women';
      if (!capacityOnProposer) {
        return [
          '1  from collections import deque',
          '2  r_rank = {r: {p: i for i, p in enumerate(pref)} for r, pref in r_prefs.items()}',
          '3  free_p = deque(p_prefs.keys())',
          '4  next_idx = {p: 0 for p in p_prefs}',
          '5  engaged_to = {r: [] for r in r_prefs}',
          '6  while free_p:',
          '7      p = free_p.popleft()',
          '8      if next_idx[p] >= len(p_prefs[p]): continue',
          '9      r = p_prefs[p][next_idx[p]]',
          '10     next_idx[p] += 1',
          '11     if len(engaged_to[r]) < r_cap[r]:',
          '12         engaged_to[r].append(p)',
          '13     else:',
          '14         p_prime = worst_current(r, engaged_to[r], r_rank)',
          '15         if r_rank[r][p_prime] < r_rank[r][p]: free_p.append(p)',
          '16         else:',
          '17             engaged_to[r].remove(p_prime); engaged_to[r].append(p); free_p.append(p_prime)',
          '18 return {(p, r) for r, lst in engaged_to.items() for p in lst}'
        ];
      }
      return [
        '1  from collections import deque',
        '2  r_rank = {r: {p: i for i, p in enumerate(pref)} for r, pref in r_prefs.items()}',
        '3  free_p = deque(p_prefs.keys())',
        '4  next_idx = {p: 0 for p in p_prefs}',
        '5  engaged_to = {p: [] for p in p_prefs}',
        '6  held_by = {r: [] for r in r_prefs}',
        '7  while free_p:',
        '8      p = free_p.popleft()',
        '9      if len(engaged_to[p]) >= p_cap[p] or next_idx[p] >= len(p_prefs[p]): continue',
        '10     r = p_prefs[p][next_idx[p]]',
        '11     next_idx[p] += 1',
        '12     if not held_by[r]:',
        '13         held_by[r] = [p]; engaged_to[p].append(r); free_p.append(p)',
        '14     else:',
        '15         p_prime = held_by[r][0]',
        '16         if r_rank[r][p_prime] < r_rank[r][p]: free_p.append(p)',
        '17         else: held_by[r] = [p]; engaged_to[p].append(r); engaged_to[p_prime].remove(r); free_p.extend([p, p_prime])',
        '18 return {(p, r) for p, lst in engaged_to.items() for r in lst}'
      ];
    }

    const line3 = state.variant === 'forbidden'
      ? `3  free_p = deque(p_prefs.keys())  # ${t('code_comment_prefs_exclude_f')}`
      : '3  free_p = deque(p_prefs.keys())';
    const exhaustedComment = state.variant === 'forbidden'
      ? t('code_comment_exhausted_allowed')
      : t('code_comment_exhausted_all');

    return [
      '1  from collections import deque',
      '2  r_rank = {r: {p: i for i, p in enumerate(pref)} for r, pref in r_prefs.items()}',
      line3,
      '4  next_idx = {p: 0 for p in p_prefs}',
      `5  engaged_to = {}  # ${t('code_comment_engaged_one')}`,
      '6  while free_p:',
      '7      p = free_p.popleft()',
      `8      if next_idx[p] >= len(p_prefs[p]): continue  # ${exhaustedComment}`,
      '9      r = p_prefs[p][next_idx[p]]',
      '10     next_idx[p] += 1',
      '11     if r not in engaged_to:',
      '12         engaged_to[r] = p',
      '13     else:',
      '14         p_prime = engaged_to[r]',
      '15         if r_rank[r][p_prime] < r_rank[r][p]: free_p.append(p)',
      '16         else:',
      '17             engaged_to[r] = p; free_p.append(p_prime)',
      '18 return {(p, r) for r, p in engaged_to.items()}'
    ];
  }

  function renderCode() {
    const lines = buildCodeLines();
    const activeLine = state.engine ? mapEventToCodeLine(state.engine.getSnapshot().lastEvent) : -1;

    els.codeDisplay.innerHTML = lines
      .map((line, idx) => {
        const lineNo = idx + 1;
        const activeClass = lineNo === activeLine ? 'active' : '';
        return `<div class="code-line ${activeClass}">${escapeHtml(line)}</div>`;
      })
      .join('');
  }

  function renderDataStructures() {
    if (!state.engine) {
      els.dsDisplay.innerHTML = '';
      return;
    }

    const snapshot = state.engine.getSnapshot();
    const side = snapshot.orientation.side;
    const proposerLabel = side === 'men' ? state.groupNames.men : state.groupNames.women;
    const receiverLabel = side === 'men' ? state.groupNames.women : state.groupNames.men;
    const freeName = 'free_p';
    const nextName = 'next_idx';
    const rankName = 'r_rank';
    const currentReceiver = snapshot.lastEvent && snapshot.lastEvent.receiver
      ? snapshot.lastEvent.receiver
      : null;
    const prefRowLimit = Math.min(200, Math.max(state.instance.men.length, state.instance.women.length, 12));
    const prefItemLimit = 8;
    const rankRowLimit = 200;
    const queueRowLimit = 300;
    const mapRowLimit = 250;
    const exhaustedRowLimit = 300;

    const previewPrefList = (list) => {
      const safe = Array.isArray(list) ? list : [];
      const body = safe.slice(0, prefItemLimit).join(', ');
      if (!body) {
        return '-';
      }
      return safe.length > prefItemLimit ? `${body}, ...` : body;
    };

    const pPrefRows = snapshot.orientation.proposers
      .slice(0, prefRowLimit)
      .map((proposer) => `
        <tr>
          <td>${escapeHtml(proposer)}</td>
          <td class="ds-prefs-cell">${escapeHtml(previewPrefList(snapshot.orientation.pPrefs[proposer]))}</td>
        </tr>
      `)
      .join('');

    const rPrefRows = snapshot.orientation.receivers
      .slice(0, prefRowLimit)
      .map((receiver) => `
        <tr>
          <td>${escapeHtml(receiver)}</td>
          <td class="ds-prefs-cell">${escapeHtml(previewPrefList(snapshot.orientation.rPrefs[receiver]))}</td>
        </tr>
      `)
      .join('');

    const receiverOrder = Array.from(new Set([
      currentReceiver,
      ...snapshot.orientation.receivers
    ].filter(Boolean))).slice(0, rankRowLimit);

    const rRankRows = receiverOrder
      .map((receiver) => {
        const ranked = (snapshot.orientation.rPrefs[receiver] || [])
          .slice(0, 8)
          .map((proposer, idx) => `${proposer}:${idx}`)
          .join(', ');
        return `
          <tr>
            <td>${escapeHtml(receiver)}</td>
            <td>${escapeHtml(ranked || '-')}</td>
          </tr>
        `;
      })
      .join('');

    const queueCells = snapshot.queueRemaining.slice(0, queueRowLimit)
      .map((name, idx) => `
        <span class="ds-queue-cell">
          <small>${idx}</small>
          <span>${escapeHtml(name)}</span>
        </span>
      `)
      .join('');

    const nextRows = snapshot.orientation.proposers.slice(0, mapRowLimit)
      .map((proposer) => `
        <tr>
          <td>${escapeHtml(proposer)}</td>
          <td>${escapeHtml(String(snapshot.nextIndex[proposer] || 0))}</td>
        </tr>
      `)
      .join('');

    const capacityOnProposer = snapshot.capacitySide === 'proposer';
    const engagedEntities = state.variant === 'capacity'
      ? (capacityOnProposer ? snapshot.orientation.proposers : snapshot.orientation.receivers)
      : snapshot.orientation.receivers;
    const engagedHeader = state.variant === 'capacity'
      ? (capacityOnProposer ? t('ds_proposer') : t('ds_receiver'))
      : t('ds_receiver');

    const engagedRows = engagedEntities.slice(0, mapRowLimit)
      .map((entity) => `
        <tr>
          <td>${escapeHtml(entity)}</td>
          <td>${escapeHtml((snapshot.engagedTo[entity] || []).join(', ') || '-')}</td>
        </tr>
      `)
      .join('');

    const exhaustedBadges = Array.from(state.exhaustedProposers)
      .slice(0, exhaustedRowLimit)
      .map((name) => `<span class="ds-badge warn">${escapeHtml(name)}</span>`)
      .join('');

    const forbiddenBadges = state.variant === 'forbidden'
      ? Array.from(state.instance.forbidden)
        .slice(0, exhaustedRowLimit)
        .map((key) => {
          const parts = String(key).split('|');
          if (parts.length !== 2) {
            return '';
          }
          return `<span class="ds-badge warn">${escapeHtml(`${parts[0]}-${parts[1]}`)}</span>`;
        })
        .join('')
      : '';

    const capRows = state.variant === 'capacity'
      ? (capacityOnProposer ? snapshot.orientation.proposers : snapshot.orientation.receivers)
        .slice(0, mapRowLimit)
        .map((entity) => `
          <tr>
            <td>${escapeHtml(entity)}</td>
            <td>${escapeHtml(String(capacityOnProposer
              ? (snapshot.orientation.proposerCaps[entity] || 0)
              : (snapshot.orientation.receiverCaps[entity] || 0)))}</td>
          </tr>
        `)
        .join('')
      : '';

    els.dsDisplay.innerHTML = `
      <div class="ds-grid">
        <section class="ds-card">
          <h4>p_prefs</h4>
          <table class="ds-mini-table">
            <thead><tr><th>${escapeHtml(proposerLabel)}</th><th>${escapeHtml(t('table_prefs'))}</th></tr></thead>
            <tbody>${pPrefRows || `<tr><td colspan="2">-</td></tr>`}</tbody>
          </table>
        </section>

        <section class="ds-card">
          <h4>r_prefs</h4>
          <table class="ds-mini-table">
            <thead><tr><th>${escapeHtml(receiverLabel)}</th><th>${escapeHtml(t('table_prefs'))}</th></tr></thead>
            <tbody>${rPrefRows || `<tr><td colspan="2">-</td></tr>`}</tbody>
          </table>
        </section>

        <section class="ds-card ds-card-wide">
          <h4>${escapeHtml(rankName)}</h4>
          <table class="ds-mini-table">
            <thead><tr><th>${escapeHtml(t('ds_receiver'))}</th><th>${escapeHtml(t('ds_top_rank'))}</th></tr></thead>
            <tbody>${rRankRows || `<tr><td colspan="2">-</td></tr>`}</tbody>
          </table>
        </section>

        <section class="ds-card ds-card-wide">
          <h4>${escapeHtml(freeName)} = deque</h4>
          <div class="ds-queue-track">${queueCells || `<span class="ds-empty">${escapeHtml(t('partner_none'))}</span>`}</div>
        </section>

        <section class="ds-card">
          <h4>${escapeHtml(nextName)}</h4>
          <table class="ds-mini-table">
            <thead><tr><th>${escapeHtml(t('ds_proposer'))}</th><th>idx</th></tr></thead>
            <tbody>${nextRows}</tbody>
          </table>
        </section>

        <section class="ds-card">
          <h4>engaged_to</h4>
          <table class="ds-mini-table">
            <thead><tr><th>${escapeHtml(engagedHeader)}</th><th>${escapeHtml(t('table_partner'))}</th></tr></thead>
            <tbody>${engagedRows}</tbody>
          </table>
        </section>

        ${state.variant === 'capacity'
          ? `<section class="ds-card">
              <h4>${capacityOnProposer ? 'p_cap' : 'r_cap'} (${escapeHtml(t('ds_caps'))})</h4>
              <table class="ds-mini-table">
                <thead><tr><th>${escapeHtml(capacityOnProposer ? t('ds_proposer') : t('ds_receiver'))}</th><th>cap</th></tr></thead>
                <tbody>${capRows || `<tr><td colspan="2">-</td></tr>`}</tbody>
              </table>
            </section>`
          : ''}

        ${state.variant === 'forbidden'
          ? `<section class="ds-card ds-card-wide">
              <h4>F (${escapeHtml(t('ds_forbidden'))})</h4>
              <div class="ds-badges">${forbiddenBadges || `<span class="ds-empty">${escapeHtml(t('partner_none'))}</span>`}</div>
            </section>`
          : ''}

        <section class="ds-card ds-card-wide">
          <h4>${escapeHtml(t('ds_exhausted'))}</h4>
          <div class="ds-badges">${exhaustedBadges || `<span class="ds-empty">${escapeHtml(t('partner_none'))}</span>`}</div>
        </section>
      </div>
    `;
  }

  function renderLog() {
    if (!state.logEntries.length) {
      els.stepLog.innerHTML = '';
      return;
    }

    const currentIndex = state.logEntries.length - 1;
    els.stepLog.innerHTML = state.logEntries
      .map((msg, idx) => {
        const cls = idx === currentIndex ? 'step-item current' : 'step-item';
        return `<div class="${cls}">${escapeHtml(msg)}</div>`;
      })
      .join('');

    els.stepLog.scrollTop = els.stepLog.scrollHeight;
  }

  function rankHeaderLabel(index) {
    const rank = index + 1;
    if (state.lang === 'pt') {
      return `${rank}\u00ba`;
    }
    const mod10 = rank % 10;
    const mod100 = rank % 100;
    let suffix = 'th';
    if (mod10 === 1 && mod100 !== 11) suffix = 'st';
    else if (mod10 === 2 && mod100 !== 12) suffix = 'nd';
    else if (mod10 === 3 && mod100 !== 13) suffix = 'rd';
    return `${rank}${suffix}`;
  }

  function prefTableHtml(side, names, prefsMap, partnersMap, activeRowName, activeTarget) {
    const maxPrefLen = names.reduce((acc, name) => Math.max(acc, (prefsMap[name] || []).length), 0);
    const maxCols = maxPrefLen <= 12 ? maxPrefLen : 8;

    const headerCols = [];
    for (let i = 0; i < maxCols; i += 1) {
      headerCols.push(`<th>${escapeHtml(rankHeaderLabel(i))}</th>`);
    }

    const rows = names
      .map((name) => {
        const prefList = prefsMap[name] || [];
        const partners = new Set(partnersMap[name] || []);
        const rowClass = name === activeRowName ? 'active-row' : '';
        const rowCategory = personCategory(side, name);
        const displaced = state.recentlySingle.has(name);
        const becameSingle = displaced && ((state.variant === 'capacity' && side === 'men') || partners.size === 0);
        const marker = tableStatusMarkerHtml(side, name, partners.size, becameSingle);

        const prefCells = [];
        for (let i = 0; i < maxCols; i += 1) {
          const candidate = prefList[i];
          const classes = ['pref-cell'];
          if (!candidate) {
            classes.push('muted');
            prefCells.push(`<td class="${classes.join(' ')}">-</td>`);
            continue;
          }

          const forbiddenCell = isForbiddenCandidate(side, name, candidate);
          if (forbiddenCell) {
            classes.push('forbidden');
          }

          if (partners.has(candidate)) {
            classes.push('engaged');
            const candidateSide = side === 'men' ? 'women' : 'men';
            const candidateCategory = personCategory(candidateSide, candidate);
            if (candidateCategory) {
              classes.push(`engaged-${candidateCategory}`);
            }
          }
          if (name === activeRowName && candidate === activeTarget) {
            classes.push('proposed');
          }
          prefCells.push(`<td class="${classes.join(' ')}">${escapeHtml(candidate)}</td>`);
        }

        const nameCellClasses = ['name-cell'];
        if (rowCategory) {
          nameCellClasses.push(`cat-${rowCategory}`);
        }
        if (partners.size > 0) {
          nameCellClasses.push('engaged');
        }

        return `
          <tr class="${rowClass}">
            <td class="${nameCellClasses.join(' ')}">${escapeHtml(name)}${marker ? ` ${marker}` : ''}</td>
            ${prefCells.join('')}
          </tr>
        `;
      })
      .join('');

    const sideLabel = side === 'men' ? state.groupNames.men : state.groupNames.women;

    return `
      <table class="pref-table pref-table-matrix">
        <thead>
          <tr>
            <th>${escapeHtml(sideLabel)}</th>
            ${headerCols.join('')}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  function renderPrefTables() {
    if (!state.instance || !state.engine) {
      els.menPrefTable.innerHTML = '';
      els.womenPrefTable.innerHTML = '';
      return;
    }

    const snapshot = state.engine.getSnapshot();
    const ev = snapshot.lastEvent || {};
    const { menPartners, womenPartners } = buildPartnerMaps(snapshot.pairs);

    let menActiveRow = null;
    let menTarget = null;
    let womenActiveRow = null;
    let womenTarget = null;

    if (state.proposerSide === 'men') {
      menActiveRow = ev.proposer || null;
      menTarget = ev.receiver || null;
      womenActiveRow = ev.receiver || null;
      womenTarget = ev.proposer || null;
    } else {
      menActiveRow = ev.receiver || null;
      menTarget = ev.proposer || null;
      womenActiveRow = ev.proposer || null;
      womenTarget = ev.receiver || null;
    }

    els.menPrefTable.innerHTML = prefTableHtml('men', state.instance.men, state.instance.mPrefs, menPartners, menActiveRow, menTarget);
    els.womenPrefTable.innerHTML = prefTableHtml('women', state.instance.women, state.instance.wPrefs, womenPartners, womenActiveRow, womenTarget);
  }

  function getCoords(names, x, yTop, yBottom) {
    const out = {};
    if (!names.length) return out;

    if (names.length === 1) {
      out[names[0]] = { x, y: (yTop + yBottom) / 2 };
      return out;
    }

    const step = (yBottom - yTop) / (names.length - 1);
    for (let i = 0; i < names.length; i += 1) {
      out[names[i]] = { x, y: yTop + (step * i) };
    }
    return out;
  }

  function avatarSvg(name, coord, side, partnerCount, isRecentlySingle, isExhausted, rankText, showName, markerOffset = -35) {
    const trait = state.traits[name] || { body: 0, hat: 0, glasses: false, colorOffset: 0 };
    const baseHue = side === 'men' ? 200 : 330;
    const hue = (baseHue + trait.colorOffset) % 360;
    const bodyColor = graphClothesColor(side, name, isExhausted);
    const headColor = isExhausted ? '#d5b4b4' : `hsl(${(hue + 16) % 360}deg 70% 77%)`;
    const strokeColor = isExhausted ? '#7a3f3f' : 'rgba(0,0,0,0.25)';

    const x = coord.x;
    const y = coord.y;
    const body = trait.body === 0
      ? `<rect x="${x - 12}" y="${y - 2}" width="24" height="26" rx="7" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="1"></rect>`
      : trait.body === 1
        ? `<ellipse cx="${x}" cy="${y + 10}" rx="12" ry="14" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="1"></ellipse>`
        : `<polygon points="${x - 12},${y + 23} ${x + 12},${y + 23} ${x + 8},${y - 1} ${x - 8},${y - 1}" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="1"></polygon>`;

    const hat = trait.hat === 0
      ? ''
      : trait.hat === 1
        ? `<rect x="${x - 10}" y="${y - 28}" width="20" height="6" rx="3" fill="#2f3846"></rect>`
        : `<path d="M ${x - 11} ${y - 24} Q ${x} ${y - 34} ${x + 11} ${y - 24} L ${x + 9} ${y - 20} L ${x - 9} ${y - 20} Z" fill="#374151"></path>`;

    const glasses = trait.glasses
      ? `<rect x="${x - 9}" y="${y - 15}" width="7" height="5" rx="1.6" fill="none" stroke="#1f2937" stroke-width="1"></rect>
         <rect x="${x + 2}" y="${y - 15}" width="7" height="5" rx="1.6" fill="none" stroke="#1f2937" stroke-width="1"></rect>
         <line x1="${x - 2}" y1="${y - 13}" x2="${x + 2}" y2="${y - 13}" stroke="#1f2937" stroke-width="1"></line>`
      : '';

    const statusMarker = graphStatusMarkerSvg(side, name, x, y + markerOffset, partnerCount, isRecentlySingle, 10);

    return `
      ${body}
      <circle cx="${x}" cy="${y - 14}" r="10" fill="${headColor}" stroke="${strokeColor}" stroke-width="1"></circle>
      <circle cx="${x - 3.2}" cy="${y - 15}" r="1.1" fill="#111827"></circle>
      <circle cx="${x + 3.2}" cy="${y - 15}" r="1.1" fill="#111827"></circle>
      <path d="M ${x - 3} ${y - 9} Q ${x} ${y - 7} ${x + 3} ${y - 9}" stroke="#7b4a3a" stroke-width="1" fill="none"></path>
      ${glasses}
      ${hat}
      ${statusMarker}
      ${showName ? `<text class="graph-node-label" x="${x + (side === 'men' ? -18 : 18)}" y="${y + 28}" text-anchor="${side === 'men' ? 'end' : 'start'}">${escapeHtml(name)}</text>` : ''}
      <text class="graph-rank-label" x="${x + (side === 'men' ? -30 : 30)}" y="${y - 24}" text-anchor="${side === 'men' ? 'end' : 'start'}">${escapeHtml(t('legend_rank'))}:${escapeHtml(rankText)}</text>
      ${isExhausted ? `<text class="graph-rank-label" x="${x}" y="${y + 38}" text-anchor="middle" fill="var(--danger)">${escapeHtml(t('graph_exhausted'))}</text>` : ''}
    `;
  }

  function hospitalSvg(name, coord, partnerCount, isRecentlySingle, isExhausted, rankText, showName, compact = false, markerOffset = -35) {
    const trait = state.traits[name] || { body: 0, hat: 0, glasses: false, colorOffset: 0 };
    const hue = (190 + (trait.colorOffset * 2)) % 360;
    const sat = 48 + (trait.body * 6);
    const bodyLight = 48 + (trait.hat * 5);
    const roofLight = Math.max(24, bodyLight - 16);
    const doorLight = Math.max(18, bodyLight - 24);
    const windowHue = (hue + 165) % 360;

    const x = coord.x;
    const y = coord.y;
    const strokeColor = isExhausted ? '#7a3f3f' : 'rgba(0,0,0,0.27)';
    const bodyColor = isExhausted ? '#a76464' : `hsl(${hue}deg ${sat}% ${bodyLight}%)`;
    const roofColor = isExhausted ? '#8e4e4e' : `hsl(${hue}deg ${Math.max(36, sat - 8)}% ${roofLight}%)`;
    const windowColor = isExhausted ? '#efc9c9' : `hsl(${windowHue}deg 88% 92%)`;
    const doorColor = isExhausted ? '#7a4040' : `hsl(${hue}deg ${Math.max(24, sat - 16)}% ${doorLight}%)`;
    const statusMarker = graphStatusMarkerSvg('men', name, x, y + markerOffset, partnerCount, isRecentlySingle, compact ? 8 : 10);

    if (compact) {
      return `
        <polygon points="${x - 9},${y - 2} ${x},${y - 10} ${x + 9},${y - 2}" fill="${roofColor}" stroke="${strokeColor}" stroke-width="1"></polygon>
        <rect x="${x - 8}" y="${y - 2}" width="16" height="11" rx="1.8" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="1"></rect>
        <rect x="${x - 2}" y="${y + 2}" width="4" height="7" rx="1" fill="${doorColor}"></rect>
        ${statusMarker}
        ${showName ? `<text class="graph-node-label" x="${x - 12}" y="${y + 4}" text-anchor="end">${escapeHtml(name)}</text>` : ''}
        <text class="graph-rank-label" x="${x - 24}" y="${y - 8}" text-anchor="end">${escapeHtml(t('legend_rank'))}:${escapeHtml(rankText)}</text>
      `;
    }

    return `
      <polygon points="${x - 14},${y - 3} ${x},${y - 16} ${x + 14},${y - 3}" fill="${roofColor}" stroke="${strokeColor}" stroke-width="1"></polygon>
      <rect x="${x - 12}" y="${y - 3}" width="24" height="26" rx="3" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="1"></rect>
      <rect x="${x - 8.4}" y="${y + 2}" width="4.2" height="4.2" rx="0.8" fill="${windowColor}" opacity="0.95"></rect>
      <rect x="${x + 4.2}" y="${y + 2}" width="4.2" height="4.2" rx="0.8" fill="${windowColor}" opacity="0.95"></rect>
      <rect x="${x - 8.4}" y="${y + 8.2}" width="4.2" height="4.2" rx="0.8" fill="${windowColor}" opacity="0.95"></rect>
      <rect x="${x + 4.2}" y="${y + 8.2}" width="4.2" height="4.2" rx="0.8" fill="${windowColor}" opacity="0.95"></rect>
      <rect x="${x - 2.4}" y="${y + 10}" width="4.8" height="13" rx="1.2" fill="${doorColor}"></rect>
      ${statusMarker}
      ${showName ? `<text class="graph-node-label" x="${x - 18}" y="${y + 28}" text-anchor="end">${escapeHtml(name)}</text>` : ''}
      <text class="graph-rank-label" x="${x - 30}" y="${y - 24}" text-anchor="end">${escapeHtml(t('legend_rank'))}:${escapeHtml(rankText)}</text>
      ${isExhausted ? `<text class="graph-rank-label" x="${x}" y="${y + 38}" text-anchor="middle" fill="var(--danger)">${escapeHtml(t('graph_exhausted'))}</text>` : ''}
    `;
  }

  function renderGraph() {
    if (!state.instance || !state.engine) {
      els.matchGraph.innerHTML = '';
      return;
    }

    const snapshot = state.engine.getSnapshot();
    const orientation = snapshot.orientation;
    const ev = snapshot.lastEvent || {};

    const men = state.instance.men;
    const women = state.instance.women;
    const totalNodes = men.length + women.length;
    const showNames = totalNodes <= 140;
    const avatars = totalNodes <= 260;

    const detailed = totalNodes <= 260;
    const maxRank = detailed
      ? (Math.max(men.length, women.length) <= 20 ? 6 : (Math.max(men.length, women.length) <= 80 ? 3 : 2))
      : 1;

    els.graphModeTag.textContent = detailed ? t('graph_mode_full') : t('graph_mode_large');

    const width = 1200;
    const baseHeight = 620;
    const maxSideCount = Math.max(men.length, women.length);
    const activeMetrics = graphLayoutMetrics(avatars);
    const detailedMetrics = graphLayoutMetrics(true);
    const compactMetrics = graphLayoutMetrics(false);

    const requiredSpan = maxSideCount > 1
      ? activeMetrics.requiredStep * (maxSideCount - 1)
      : 0;
    const topClear = activeMetrics.markerTopExtent + activeMetrics.topPadding;
    const bottomClear = activeMetrics.nodeBottom + activeMetrics.bottomPadding;
    const minHeight = topClear + requiredSpan + bottomClear;
    const height = Math.max(baseHeight, Math.ceil(minHeight));
    const yTop = topClear;
    const yBottom = height - bottomClear;

    const markerOffsetDetailed = detailedMetrics.markerBaselineOffset;
    const markerOffsetCompact = compactMetrics.markerBaselineOffset;

    const menCoords = getCoords(men, 170, yTop, yBottom);
    const womenCoords = getCoords(women, width - 170, yTop, yBottom);
    const { menPartners, womenPartners } = buildPartnerMaps(snapshot.pairs);
    els.matchGraph.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const defs = `
      <defs>
        <marker id="edgeArrow" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L7,3.5 L0,7 z" fill="var(--graph-edge)"></path>
        </marker>
        <marker id="activeArrow" markerWidth="9" markerHeight="9" refX="7.5" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--graph-active)"></path>
        </marker>
        <marker id="engagedArrow" markerWidth="9" markerHeight="9" refX="7.5" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--graph-engaged)"></path>
        </marker>
      </defs>
    `;

    const forbiddenEdges = [];
    if (state.variant === 'forbidden' && state.instance.forbidden.size > 0) {
      for (const key of state.instance.forbidden) {
        const parts = String(key).split('|');
        if (parts.length !== 2) {
          continue;
        }
        const from = menCoords[parts[0]];
        const to = womenCoords[parts[1]];
        if (!from || !to) {
          continue;
        }
        forbiddenEdges.push(`<line class="graph-forbidden-edge" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`);
      }
    }

    const edgeLines = [];
    for (const proposer of orientation.proposers) {
      const prefs = orientation.pPrefs[proposer] || [];
      const from = state.proposerSide === 'men' ? menCoords[proposer] : womenCoords[proposer];
      if (!from) continue;

      const limit = Math.min(maxRank, prefs.length);
      for (let i = 0; i < limit; i += 1) {
        const receiver = prefs[i];
        const to = state.proposerSide === 'men' ? womenCoords[receiver] : menCoords[receiver];
        if (!to) continue;

        const w = Math.max(0.8, 4.4 - ((i / Math.max(1, limit)) * 3.3));
        edgeLines.push(`<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="var(--graph-edge)" stroke-width="${w.toFixed(2)}" stroke-opacity="0.43" marker-end="url(#edgeArrow)"></line>`);
      }
    }

    const engagedEdges = snapshot.pairs
      .map((pair) => {
        const from = menCoords[pair.man];
        const to = womenCoords[pair.woman];
        if (!from || !to) return '';
        return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="var(--graph-engaged)" stroke-width="3.6" marker-end="url(#engagedArrow)"></line>`;
      })
      .join('');

    let activeEdge = '';
    if (ev.proposer && ev.receiver) {
      const from = state.proposerSide === 'men' ? menCoords[ev.proposer] : womenCoords[ev.proposer];
      const to = state.proposerSide === 'men' ? womenCoords[ev.receiver] : menCoords[ev.receiver];
      if (from && to) {
        activeEdge = `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="var(--graph-active)" stroke-width="4.4" marker-end="url(#activeArrow)"></line>`;
      }
    }

    const menNodes = men
      .map((man) => {
        const coord = menCoords[man];
        if (!coord) return '';
        const partners = menPartners[man] || [];
        const rank = rankValue(state.instance.mPrefs[man] || [], partners);
        const exhausted = state.proposerSide === 'men' && state.exhaustedProposers.has(man);
        const displaced = state.recentlySingle.has(man);
        const recentlySingle = displaced && (state.variant === 'capacity' || partners.length === 0);
        const isResidentHospital = state.variant === 'capacity';

        if (!avatars) {
          if (isResidentHospital) {
            return hospitalSvg(man, coord, partners.length, recentlySingle, exhausted, rank, showNames, true, markerOffsetCompact);
          }
          const clothesColor = graphClothesColor('men', man, exhausted);
          return `
            ${graphStatusMarkerSvg('men', man, coord.x, coord.y + markerOffsetCompact, partners.length, recentlySingle, 8)}
            <circle cx="${coord.x}" cy="${coord.y}" r="6" fill="${clothesColor}" stroke="rgba(0,0,0,0.24)" stroke-width="1"></circle>
            ${showNames ? `<text class="graph-node-label" x="${coord.x - 12}" y="${coord.y + 4}" text-anchor="end">${escapeHtml(man)}</text>` : ''}
            <text class="graph-rank-label" x="${coord.x - 24}" y="${coord.y - 8}" text-anchor="end">${escapeHtml(t('legend_rank'))}:${escapeHtml(rank)}</text>
          `;
        }

        if (isResidentHospital) {
          return hospitalSvg(man, coord, partners.length, recentlySingle, exhausted, rank, showNames, false, markerOffsetDetailed);
        }
        return avatarSvg(man, coord, 'men', partners.length, recentlySingle, exhausted, rank, showNames, markerOffsetDetailed);
      })
      .join('');

    const womenNodes = women
      .map((woman) => {
        const coord = womenCoords[woman];
        if (!coord) return '';
        const partners = womenPartners[woman] || [];
        const rank = rankValue(state.instance.wPrefs[woman] || [], partners);
        const exhausted = state.proposerSide === 'women' && state.exhaustedProposers.has(woman);
        const recentlySingle = state.recentlySingle.has(woman) && partners.length === 0;

        if (!avatars) {
          const clothesColor = graphClothesColor('women', woman, exhausted);
          return `
            ${graphStatusMarkerSvg('women', woman, coord.x, coord.y + markerOffsetCompact, partners.length, recentlySingle, 8)}
            <circle cx="${coord.x}" cy="${coord.y}" r="6" fill="${clothesColor}" stroke="rgba(0,0,0,0.24)" stroke-width="1"></circle>
            ${showNames ? `<text class="graph-node-label" x="${coord.x + 12}" y="${coord.y + 4}" text-anchor="start">${escapeHtml(woman)}</text>` : ''}
            <text class="graph-rank-label" x="${coord.x + 24}" y="${coord.y - 8}" text-anchor="start">${escapeHtml(t('legend_rank'))}:${escapeHtml(rank)}</text>
          `;
        }

        return avatarSvg(woman, coord, 'women', partners.length, recentlySingle, exhausted, rank, showNames, markerOffsetDetailed);
      })
      .join('');

    const titleY = Math.max(24, Math.min(34, yTop - 14));
    const sideTitles = `
      <text class="graph-side-title" x="88" y="${titleY}" text-anchor="start">${escapeHtml(state.groupNames.men)}</text>
      <text class="graph-side-title" x="${width - 88}" y="${titleY}" text-anchor="end">${escapeHtml(state.groupNames.women)}</text>
    `;

    els.matchGraph.innerHTML = `${defs}${forbiddenEdges.join('')}${edgeLines.join('')}${engagedEdges}${activeEdge}${sideTitles}${menNodes}${womenNodes}`;
  }

  function renderInsights() {
    if (!state.instance || !state.engine) {
      els.insightsGrid.innerHTML = '';
      return;
    }

    const snapshot = state.engine.getSnapshot();
    if (snapshot.done && !state.insightsCache) {
      state.insightsCache = GSAlgorithms.analyzeSnapshot(state.instance, state.proposerSide, snapshot);
    }

    const showGoodBadInsight = state.variant === 'good_bad';

    if (!snapshot.done || !state.insightsCache) {
      const pendingCards = [
        insightCardHtml('neutral', t('insight_perfect_title'), t('insight_pending')),
        insightCardHtml('neutral', t('insight_stable_title'), t('insight_pending')),
        insightCardHtml('neutral', t('insight_terminates_title'), t('insight_pending')),
        insightCardHtml('neutral', t('insight_optimal_title'), t('insight_pending'))
      ];
      if (showGoodBadInsight) {
        pendingCards.push(insightCardHtml('neutral', t('insight_good_bad_title'), t('insight_pending')));
      }
      els.insightsGrid.innerHTML = pendingCards.join('');
      return;
    }

    const insight = state.insightsCache;
    const perfectText = insight.perfect ? t('insight_true') : t('insight_false');
    const stableText = insight.instabilityCount === 0
      ? t('insight_true')
      : `${t('insight_false')} (${insight.instabilityCount})`;
    const termText = t('insight_termination_value', {
      used: insight.usedProposals,
      bound: insight.terminationBound
    });

    let optimalText = t('insight_optimal_not_applicable');
    let optimalClass = 'neutral';

    if (insight.optimality.mode === 'current') {
      const ok = Boolean(insight.optimality.proposerOptimal) && Boolean(insight.optimality.receiverPessimal);
      const optimalKey = insight.optimality.context === 'many_to_one'
        ? 'insight_optimal_current_many_to_one'
        : 'insight_optimal_current';
      optimalText = ok
        ? `${t('insight_true')} - ${t(optimalKey)}`
        : t('insight_false');
      optimalClass = ok ? 'good' : 'bad';
    }

    const cards = [
      insightCardHtml(insight.perfect ? 'good' : 'bad', t('insight_perfect_title'), perfectText),
      insightCardHtml(insight.instabilityCount === 0 ? 'good' : 'bad', t('insight_stable_title'), stableText),
      insightCardHtml(insight.terminatesWithinBound ? 'good' : 'bad', t('insight_terminates_title'), termText),
      insightCardHtml(optimalClass, t('insight_optimal_title'), optimalText)
    ];

    if (showGoodBadInsight) {
      let goodBadText = t('insight_good_bad_not_applicable');
      let goodBadClass = 'neutral';
      const property = insight.goodBadProperty;

      if (property && property.mode === 'current') {
        if (property.holds) {
          goodBadText = `${t('insight_true')} - ${t('insight_good_bad_current')}`;
          goodBadClass = 'good';
        } else {
          goodBadText = t('insight_false');
          goodBadClass = 'bad';
        }
      }

      cards.push(insightCardHtml(goodBadClass, t('insight_good_bad_title'), goodBadText));
    }

    els.insightsGrid.innerHTML = cards.join('');
  }

  function insightCardHtml(type, title, value) {
    return `
      <article class="insight-card ${type}">
        <span class="title">${escapeHtml(title)}</span>
        <strong class="value">${escapeHtml(value)}</strong>
      </article>
    `;
  }

  function refreshCurveControlsFromState() {
    els.toggleRandom.checked = state.curves.toggles.random;
    els.toggleInverse.checked = state.curves.toggles.inverse;
    els.toggleEasy.checked = state.curves.toggles.easy;
    els.toggleWorstCase.checked = state.curves.toggles.worstCase;
    els.toggleLinear.checked = state.curves.toggles.linear;
    els.toggleHalf.checked = state.curves.toggles.half;
    els.toggleSquare.checked = state.curves.toggles.square;

    els.curveYZoomInput.value = String(state.curves.yZoom);

    if (state.curves.rows.length) {
      const options = state.curves.rows.map((row) => row.n);
      els.curveXMaxSelect.innerHTML = options
        .map((n) => `<option value="${n}">${n}</option>`)
        .join('');
      if (state.curves.running) {
        state.curves.xMax = options[options.length - 1];
      } else if (state.curves.xMax == null || !options.includes(state.curves.xMax)) {
        state.curves.xMax = options[options.length - 1];
      }
      els.curveXMaxSelect.value = String(state.curves.xMax);
      els.curveXMaxSelect.disabled = false;
      els.curveYZoomInput.disabled = false;
    } else {
      els.curveXMaxSelect.innerHTML = '<option value="">-</option>';
      els.curveXMaxSelect.disabled = true;
      els.curveYZoomInput.disabled = true;
    }
  }

  function renderCurvesStatus() {
    const msg = state.curves.progress || t('curve_idle');
    els.curveStatus.textContent = msg;
    els.runCurvesBtn.disabled = state.curves.running;
    els.stopCurvesBtn.disabled = !state.curves.running;
  }

  function getVisibleCurveRows() {
    if (!state.curves.rows.length) {
      return [];
    }
    if (state.curves.xMax == null) {
      return state.curves.rows.slice();
    }
    return state.curves.rows.filter((row) => row.n <= state.curves.xMax);
  }

  function renderCurveTable() {
    if (!state.curves.rows.length) {
      els.curveTable.innerHTML = `<tbody><tr><td>${escapeHtml(t('curve_empty'))}</td></tr></tbody>`;
      return;
    }

    const rows = state.curves.rows
      .map((row) => `
        <tr>
          <td>${row.n}</td>
          <td>${row.random.toFixed(2)}</td>
          <td>${row.inverse.toFixed(2)}</td>
          <td>${row.easy.toFixed(2)}</td>
          <td>${row.worstCase.toFixed(2)}</td>
          <td>${row.linear.toFixed(2)}</td>
          <td>${row.half.toFixed(2)}</td>
          <td>${row.square.toFixed(2)}</td>
        </tr>
      `)
      .join('');

    els.curveTable.innerHTML = `
      <thead>
        <tr>
          <th>${escapeHtml(t('curve_col_n'))}</th>
          <th>${escapeHtml(t('curve_col_random'))}</th>
          <th>${escapeHtml(t('curve_col_inverse'))}</th>
          <th>${escapeHtml(t('curve_col_easy'))}</th>
          <th>${escapeHtml(t('curve_col_worst_case'))}</th>
          <th>${escapeHtml(t('curve_col_linear'))}</th>
          <th>${escapeHtml(t('curve_col_half'))}</th>
          <th>${escapeHtml(t('curve_col_square'))}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    `;
  }

  function applyCurveFocus() {
    const active = state.curves.activeSeries;
    const nodes = els.curveChartSvg.querySelectorAll('[data-series-key]');
    nodes.forEach((node) => {
      const key = node.getAttribute('data-series-key');
      if (!active || key === active) {
        node.style.opacity = '1';
      } else {
        node.style.opacity = '0.2';
      }
    });
  }

  function renderCurveTooltip() {
    const tip = state.curves.tooltip;
    if (!tip) {
      els.curveTooltip.hidden = true;
      return;
    }

    els.curveTooltip.hidden = false;
    els.curveTooltip.innerHTML = `
      <strong>${escapeHtml(tip.label)}</strong><br>
      n=${escapeHtml(String(tip.n))}<br>
      ${escapeHtml(t('curve_axis_y'))}: ${escapeHtml(Number(tip.value).toFixed(2))}
    `;

    els.curveTooltip.style.left = `${tip.x}px`;
    els.curveTooltip.style.top = `${tip.y}px`;
  }

  function renderCurveChart() {
    const rows = getVisibleCurveRows();
    if (!rows.length) {
      els.curveChartSvg.innerHTML = '';
      renderCurveTooltip();
      return;
    }

    const width = 960;
    const height = 380;
    const margin = { top: 56, right: 24, bottom: 46, left: 68 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const series = [
      { key: 'random', color: '#4f83d1', dash: '', width: 2.3, label: t('curve_col_random'), enabled: state.curves.toggles.random },
      { key: 'inverse', color: '#cf5f4f', dash: '', width: 2.3, label: t('curve_col_inverse'), enabled: state.curves.toggles.inverse },
      { key: 'easy', color: '#3ea572', dash: '', width: 2.3, label: t('curve_col_easy'), enabled: state.curves.toggles.easy },
      { key: 'worstCase', color: '#9254d9', dash: '', width: 2.3, label: t('curve_col_worst_case'), enabled: state.curves.toggles.worstCase },
      { key: 'linear', color: '#4f83d1', dash: '5 5', width: 1.5, label: t('curve_col_linear'), enabled: state.curves.toggles.linear },
      { key: 'half', color: '#cf5f4f', dash: '5 5', width: 1.5, label: t('curve_col_half'), enabled: state.curves.toggles.half },
      { key: 'square', color: '#7f6bc6', dash: '5 5', width: 1.5, label: t('curve_col_square'), enabled: state.curves.toggles.square }
    ];

    const enabledSeries = series.filter((s) => s.enabled);
    const xValues = rows.map((r) => r.n);
    const yValues = [];

    for (const row of rows) {
      for (const serie of enabledSeries) {
        yValues.push(row[serie.key]);
      }
    }

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMaxRaw = Math.max(1, ...yValues);
    const yMax = Math.max(1, yMaxRaw / Math.max(1, state.curves.yZoom));

    const xPos = (x) => {
      if (xMax === xMin) return margin.left + (chartW / 2);
      return margin.left + (((x - xMin) / (xMax - xMin)) * chartW);
    };
    const yPos = (y) => margin.top + chartH - ((Math.min(y, yMax) / yMax) * chartH);

    const grid = [];
    for (let i = 0; i <= 5; i += 1) {
      const y = margin.top + (chartH * i) / 5;
      const val = Math.round(yMax * (1 - (i / 5)));
      grid.push(`<line class="curve-grid-line" x1="${margin.left}" y1="${y}" x2="${margin.left + chartW}" y2="${y}"></line>`);
      grid.push(`<text class="curve-label" x="${margin.left - 8}" y="${y + 4}" text-anchor="end">${val}</text>`);
    }

    for (const row of rows) {
      const x = xPos(row.n);
      grid.push(`<line class="curve-grid-line" x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + chartH}"></line>`);
      grid.push(`<text class="curve-label" x="${x}" y="${margin.top + chartH + 15}" text-anchor="middle">${row.n}</text>`);
    }

    const axis = `
      <line class="curve-axis" x1="${margin.left}" y1="${margin.top + chartH}" x2="${margin.left + chartW}" y2="${margin.top + chartH}"></line>
      <line class="curve-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartH}"></line>
      <text class="curve-label" x="${margin.left + chartW / 2}" y="${height - 8}" text-anchor="middle">${escapeHtml(t('curve_axis_x'))}</text>
      <text class="curve-label" x="16" y="${margin.top + chartH / 2}" text-anchor="middle" transform="rotate(-90 16 ${margin.top + chartH / 2})">${escapeHtml(t('curve_axis_y'))}</text>
    `;

    const curves = [];
    const legend = [];

    enabledSeries.forEach((serie, idx) => {
      const points = rows.map((row) => ({ n: row.n, value: row[serie.key], x: xPos(row.n), y: yPos(row[serie.key]) }));
      const path = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

      curves.push(`<path class="curve-series" data-series-key="${serie.key}" d="${path}" fill="none" stroke="${serie.color}" stroke-width="${serie.width}" stroke-dasharray="${serie.dash}"></path>`);
      curves.push(points.map((p) => `
        <circle
          class="curve-point"
          data-series-key="${serie.key}"
          data-label="${escapeHtml(serie.label)}"
          data-n="${p.n}"
          data-value="${p.value}"
          cx="${p.x}" cy="${p.y}" r="2.4" fill="${serie.color}"></circle>
      `).join(''));

      const lx = margin.left + 8 + ((idx % 3) * 250);
      const ly = 20 + (Math.floor(idx / 3) * 14);
      legend.push(`<line data-series-key="${serie.key}" x1="${lx}" y1="${ly - 4}" x2="${lx + 16}" y2="${ly - 4}" stroke="${serie.color}" stroke-width="${serie.width}" stroke-dasharray="${serie.dash}"></line>`);
      legend.push(`<text class="curve-legend" data-series-key="${serie.key}" x="${lx + 22}" y="${ly - 1}">${escapeHtml(serie.label)}</text>`);
    });

    els.curveChartSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    els.curveChartSvg.innerHTML = `${grid.join('')}${axis}${curves.join('')}${legend.join('')}`;
    applyCurveFocus();
    renderCurveTooltip();
  }

  function renderCurvePanel() {
    refreshCurveControlsFromState();
    renderCurvesStatus();
    renderCurveTable();
    renderCurveChart();
  }

  function renderAll() {
    updateDynamicLabels();
    renderStatus();
    renderCounters();
    renderCode();
    renderDataStructures();
    renderLog();
    renderPrefTables();
    renderGraph();
    renderInsights();
    renderCurvePanel();
    renderAutoButton();
  }

  function applyTablesToInstance() {
    state.variant = els.variantSelect.value;
    const includeCap = state.variant === 'capacity';
    const includeCategory = state.variant === 'good_bad';
    const includeForbidden = state.variant === 'forbidden';

    const menData = parseEditorRows(els.menEditorTable, 'men', { includeCap, includeCategory });
    const womenData = parseEditorRows(els.womenEditorTable, 'women', { includeCap, includeCategory });

    try {
      const baseInstance = GSAlgorithms.normalizeInstance({
        name: 'custom',
        ...menData,
        ...womenData,
        forbidden: new Set()
      });
      const instance = includeForbidden
        ? GSAlgorithms.applyForbiddenPairs(
          baseInstance,
          GSAlgorithms.generateForbiddenPairs(
            baseInstance,
            readForbiddenCount(baseInstance.men.length * baseInstance.women.length),
            Date.now()
          )
        )
        : baseInstance;
      loadInstance(instance, 'status_table_applied');
    } catch (error) {
      setStatus('status_invalid');
    }
  }

  function exportCurrentCsv() {
    if (!state.instance) {
      return;
    }

    const csv = GSAlgorithms.exportCsvInstance(state.instance);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stable_matching_instance.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus('status_export_done');
  }

  async function runCurvesBenchmark() {
    if (state.curves.running) {
      return;
    }

    let start = readNumberInput(els.curveStartInput, 10, 2, 2000);
    let end = readNumberInput(els.curveEndInput, 200, 2, 2000);
    const step = readNumberInput(els.curveStepInput, 10, 1, 1000);
    const repeats = readNumberInput(els.curveRepeatsInput, 3, 1, 100);

    if (start > end) {
      const tmp = start;
      start = end;
      end = tmp;
      els.curveStartInput.value = String(start);
      els.curveEndInput.value = String(end);
    }

    state.curves.running = true;
    state.curves.stopRequested = false;
    state.curves.rows = [];
    state.curves.xMax = null;
    state.curves.progress = t('status_curve_running');
    state.curves.tooltip = null;
    renderCurvePanel();

    const points = [];
    for (let n = start; n <= end; n += step) {
      points.push(n);
      if (points.length >= 220) break;
    }

    const total = points.length;

    for (let i = 0; i < points.length; i += 1) {
      if (state.curves.stopRequested) {
        break;
      }

      const n = points[i];
      let sumRandom = 0;

      const inverseInst = GSAlgorithms.presets.inverse(n);
      const easyInst = GSAlgorithms.presets.easy(n);
      const worstInst = GSAlgorithms.presets.worstCase(n);

      const eInverse = createEngine(inverseInst, state.proposerSide);
      const eEasy = createEngine(easyInst, state.proposerSide);
      const eWorst = createEngine(worstInst, state.proposerSide);

      eInverse.runToEnd();
      eEasy.runToEnd();
      eWorst.runToEnd();

      const inverseValue = eInverse.proposalCount;
      const easyValue = eEasy.proposalCount;
      const worstValue = eWorst.proposalCount;

      for (let r = 0; r < repeats; r += 1) {
        const seed = (n * 10007) + (r * 97) + i;

        const randomInst = GSAlgorithms.presets.random(n, seed);

        const eRandom = createEngine(randomInst, state.proposerSide);

        eRandom.runToEnd();

        sumRandom += eRandom.proposalCount;
      }

      state.curves.rows.push({
        n,
        random: sumRandom / repeats,
        inverse: inverseValue,
        easy: easyValue,
        worstCase: worstValue,
        linear: n,
        half: (n * (n + 1)) / 2,
        square: n * n,
        worstTheory: (n * (n - 1)) + 1
      });

      state.curves.progress = t('curve_progress', {
        n,
        done: i + 1,
        total
      });

      renderCurvePanel();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    state.curves.running = false;

    if (state.curves.stopRequested) {
      state.curves.progress = t('status_curve_stopped');
      setStatus('status_curve_stopped');
    } else {
      state.curves.progress = t('status_curve_done');
      setStatus('status_curve_done');
    }

    renderCurvePanel();
  }

  function stopCurvesBenchmark() {
    state.curves.stopRequested = true;
  }

  function switchTab(tab) {
    state.activeTab = tab === 'curves' ? 'curves' : 'sim';

    const isSim = state.activeTab === 'sim';
    els.tabSimBtn.classList.toggle('active', isSim);
    els.tabCurvesBtn.classList.toggle('active', !isSim);
    els.tabSim.classList.toggle('active', isSim);
    els.tabCurves.classList.toggle('active', !isSim);

    if (!isSim) {
      renderCurvePanel();
    }
    updateToggleButtons();
  }

  function syncModalBodyLock() {
    const hasOpen = !els.helpOverlay.hidden || !els.referencesOverlay.hidden;
    document.body.classList.toggle('modal-open', hasOpen);
  }

  function openHelp() {
    els.helpOverlay.hidden = false;
    syncModalBodyLock();
  }

  function closeHelp() {
    els.helpOverlay.hidden = true;
    syncModalBodyLock();
  }

  function openReferences() {
    els.referencesOverlay.hidden = false;
    syncModalBodyLock();
  }

  function closeReferences() {
    els.referencesOverlay.hidden = true;
    syncModalBodyLock();
  }

  function bindCurveInteractions() {
    els.curveChartSvg.addEventListener('pointermove', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const node = target.closest('[data-series-key]');
      if (!node) {
        state.curves.activeSeries = null;
        applyCurveFocus();
        return;
      }
      state.curves.activeSeries = node.getAttribute('data-series-key');
      applyCurveFocus();
    });

    els.curveChartSvg.addEventListener('pointerleave', () => {
      state.curves.activeSeries = null;
      applyCurveFocus();
    });

    els.curveChartSvg.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const point = target.closest('.curve-point');
      if (!point) {
        state.curves.tooltip = null;
        renderCurveTooltip();
        return;
      }

      const areaRect = els.curveChartArea.getBoundingClientRect();
      const svgRect = els.curveChartSvg.getBoundingClientRect();
      const cx = Number(point.getAttribute('cx') || 0);
      const cy = Number(point.getAttribute('cy') || 0);
      const vb = els.curveChartSvg.viewBox.baseVal;

      const x = ((cx / Math.max(1, vb.width)) * svgRect.width) + (svgRect.left - areaRect.left);
      const y = ((cy / Math.max(1, vb.height)) * svgRect.height) + (svgRect.top - areaRect.top);

      state.curves.tooltip = {
        label: point.getAttribute('data-label') || '',
        n: point.getAttribute('data-n') || '',
        value: Number(point.getAttribute('data-value') || 0),
        x: clamp(x, 24, areaRect.width - 24),
        y: clamp(y, 24, areaRect.height - 12)
      };
      renderCurveTooltip();
    });
  }

  function bindEvents() {
    els.langToggle.addEventListener('click', () => {
      setLanguage(state.lang === 'en' ? 'pt' : 'en');
    });

    els.themeToggle.addEventListener('click', () => {
      setTheme(state.theme === 'light' ? 'dark' : 'light');
    });

    els.toggleControlsBtn.addEventListener('click', toggleControlsPanel);
    els.toggleCodeBtn.addEventListener('click', toggleCodePanel);
    els.floatingControlsBtn.addEventListener('click', toggleControlsPanel);
    els.floatingCodeBtn.addEventListener('click', toggleCodePanel);

    els.mainSplitter.addEventListener('pointerdown', (event) => startResize('main', event));
    els.simSplitter.addEventListener('pointerdown', (event) => startResize('sim', event));

    els.helpBtn.addEventListener('click', openHelp);
    els.helpCloseBtn.addEventListener('click', closeHelp);
    els.helpOverlay.addEventListener('click', (event) => {
      if (event.target === els.helpOverlay) {
        closeHelp();
      }
    });

    els.referencesLink.addEventListener('click', (event) => {
      event.preventDefault();
      openReferences();
    });

    els.referencesCloseBtn.addEventListener('click', closeReferences);
    els.referencesOverlay.addEventListener('click', (event) => {
      if (event.target === els.referencesOverlay) {
        closeReferences();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!els.referencesOverlay.hidden) {
        closeReferences();
        return;
      }
      if (!els.helpOverlay.hidden) {
        closeHelp();
      }
    });

    els.variantSelect.addEventListener('change', () => {
      state.variant = els.variantSelect.value;
      if (state.variant === 'capacity') {
        els.proposerSelect.value = 'men';
        state.proposerSide = 'men';
      }
      syncDefaultGroupInputs();
      updateVariantFieldsVisibility();
      updateScenarioPresetNotes();
      updateDynamicLabels();
      renderAll();
    });

    els.presetSelect.addEventListener('change', () => {
      state.preset = els.presetSelect.value;
      updateVariantFieldsVisibility();
      updateScenarioPresetNotes();
    });

    els.pairsInput.addEventListener('input', () => {
      const parsed = Number.parseInt(String(els.pairsInput.value || ''), 10);
      const n = Number.isFinite(parsed) ? clamp(parsed, 2, 2000) : 2;
      syncForbiddenCountBounds(n * n);
    });

    const residentInputs = [
      els.residentCountInput,
      els.positionsCountInput,
      els.hospitalCountInput,
      els.hospitalPosMinInput,
      els.hospitalPosMaxInput,
      els.residentAppsMinInput,
      els.residentAppsMaxInput
    ];
    for (const input of residentInputs) {
      input.addEventListener('input', () => {
        if (state.variant === 'capacity') {
          syncResidentMatchingBounds();
        }
      });
    }

    els.proposerSelect.addEventListener('change', () => {
      state.proposerSide = els.proposerSelect.value === 'women' ? 'women' : 'men';
      if (state.instance) {
        initializeEngine();
        setStatus('status_reset');
      }
    });

    els.groupLeftInput.addEventListener('input', () => {
      els.groupLeftInput.dataset.default = '0';
      updateDynamicLabels();
      renderAll();
    });

    els.groupRightInput.addEventListener('input', () => {
      els.groupRightInput.dataset.default = '0';
      updateDynamicLabels();
      renderAll();
    });

    els.speedSelect.addEventListener('change', () => {
      if (state.autoTimer) {
        stopAuto(false);
        toggleAuto();
      }
    });

    els.loadPresetBtn.addEventListener('click', () => {
      try {
        const instance = buildInstanceFromControls();
        loadInstance(instance, 'status_loaded');
      } catch (error) {
        setStatus('status_invalid');
      }
    });

    els.resetRunBtn.addEventListener('click', () => {
      initializeEngine();
      setStatus('status_reset');
    });

    els.runStepBtn.addEventListener('click', runStep);
    els.autoRunBtn.addEventListener('click', toggleAuto);
    els.runFullBtn.addEventListener('click', runFull);

    els.addManRowBtn.addEventListener('click', () => {
      els.menEditorTable.appendChild(createEditorRow('men'));
    });

    els.addWomanRowBtn.addEventListener('click', () => {
      els.womenEditorTable.appendChild(createEditorRow('women'));
    });

    els.applyTablesBtn.addEventListener('click', applyTablesToInstance);
    els.exportCsvBtn.addEventListener('click', exportCurrentCsv);

    els.csvInput.addEventListener('change', async () => {
      const file = els.csvInput.files && els.csvInput.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const instance = GSAlgorithms.parseCsvInstance(text);
        loadInstance(instance, 'status_csv_loaded');
      } catch (error) {
        setStatus('status_csv_error');
      } finally {
        els.csvInput.value = '';
      }
    });

    els.tabSimBtn.addEventListener('click', () => switchTab('sim'));
    els.tabCurvesBtn.addEventListener('click', () => switchTab('curves'));

    els.runCurvesBtn.addEventListener('click', () => {
      void runCurvesBenchmark();
    });
    els.stopCurvesBtn.addEventListener('click', stopCurvesBenchmark);

    els.curveXMaxSelect.addEventListener('change', () => {
      const v = Number.parseInt(String(els.curveXMaxSelect.value || ''), 10);
      state.curves.xMax = Number.isFinite(v) ? v : null;
      state.curves.tooltip = null;
      renderCurvePanel();
    });

    els.curveYZoomInput.addEventListener('input', () => {
      const z = Number.parseFloat(String(els.curveYZoomInput.value || '1'));
      state.curves.yZoom = Number.isFinite(z) ? clamp(z, 1, 8) : 1;
      state.curves.tooltip = null;
      renderCurvePanel();
    });

    const toggleMap = [
      [els.toggleRandom, 'random'],
      [els.toggleInverse, 'inverse'],
      [els.toggleEasy, 'easy'],
      [els.toggleWorstCase, 'worstCase'],
      [els.toggleLinear, 'linear'],
      [els.toggleHalf, 'half'],
      [els.toggleSquare, 'square']
    ];

    for (const [el, key] of toggleMap) {
      el.addEventListener('change', () => {
        state.curves.toggles[key] = Boolean(el.checked);
        state.curves.tooltip = null;
        renderCurvePanel();
      });
    }

    bindCurveInteractions();

    window.addEventListener('resize', () => {
      renderGraph();
      renderCurveChart();
    });
  }

  function init() {
    bindEvents();
    applyPanelLayout();
    updateVariantFieldsVisibility();

    els.groupLeftInput.dataset.default = '1';
    els.groupRightInput.dataset.default = '1';

    setTheme('light');
    setLanguage('en');

    try {
      const instance = buildInstanceFromControls();
      loadInstance(instance, 'status_loaded');
    } catch (error) {
      setStatus('status_invalid');
    }

    switchTab('sim');
    state.curves.progress = t('curve_idle');
    renderAll();
  }

  init();
})();
