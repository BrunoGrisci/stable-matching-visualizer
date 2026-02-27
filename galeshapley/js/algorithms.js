(function () {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function toInt(value, fallback = 0) {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return parsed;
  }

  function trimString(value) {
    return String(value == null ? '' : value).trim();
  }

  function uniqueList(values) {
    const out = [];
    const seen = new Set();
    for (const raw of values || []) {
      const v = trimString(raw);
      if (!v || seen.has(v)) {
        continue;
      }
      seen.add(v);
      out.push(v);
    }
    return out;
  }

  function normalizePairsContainer(rawPairs) {
    if (!rawPairs) {
      return new Set();
    }

    if (rawPairs instanceof Set) {
      return new Set(Array.from(rawPairs, (x) => trimString(x)));
    }

    if (Array.isArray(rawPairs)) {
      return new Set(rawPairs.map((x) => trimString(x)).filter(Boolean));
    }

    if (typeof rawPairs === 'string') {
      const out = new Set();
      for (const token of rawPairs.split(',')) {
        const clean = trimString(token);
        if (clean) {
          out.add(clean);
        }
      }
      return out;
    }

    return new Set();
  }

  function makePairKey(man, woman) {
    return `${trimString(man)}|${trimString(woman)}`;
  }

  function parseForbiddenText(text) {
    const out = new Set();
    for (const token of String(text || '').split(',')) {
      const clean = trimString(token);
      if (!clean) {
        continue;
      }
      const sep = clean.includes('-') ? '-' : (clean.includes('|') ? '|' : ':');
      const [man, woman] = clean.split(sep).map((x) => trimString(x));
      if (!man || !woman) {
        continue;
      }
      out.add(makePairKey(man, woman));
    }
    return out;
  }

  function parseCapacityText(text) {
    const out = {};
    for (const token of String(text || '').split(',')) {
      const clean = trimString(token);
      if (!clean) {
        continue;
      }
      const sep = clean.includes(':') ? ':' : '=';
      const [name, rawCap] = clean.split(sep).map((x) => trimString(x));
      if (!name) {
        continue;
      }
      const cap = clamp(toInt(rawCap, 1), 1, 1000000);
      out[name] = cap;
    }
    return out;
  }

  function createRng(seed) {
    let state = Number.isFinite(seed) ? Math.floor(seed) : (Date.now() % 2147483647);
    if (state <= 0) {
      state += 2147483646;
    }
    return function random() {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };
  }

  function shuffled(list, rng) {
    const arr = list.slice();
    const random = typeof rng === 'function' ? rng : Math.random;
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function sequentialNames(prefix, n) {
    const out = [];
    for (let i = 1; i <= n; i += 1) {
      out.push(`${prefix}${i}`);
    }
    return out;
  }

  function normalizeInstance(raw) {
    const input = raw || {};
    const allowIncompletePrefs = Boolean(input.allowIncompletePrefs);
    const menFromPrefs = input.mPrefs ? Object.keys(input.mPrefs) : [];
    const womenFromPrefs = input.wPrefs ? Object.keys(input.wPrefs) : [];

    const men = uniqueList([...(input.men || []), ...menFromPrefs]);
    const women = uniqueList([...(input.women || []), ...womenFromPrefs]);

    if (!men.length || !women.length) {
      throw new Error('Both sides must have at least one participant.');
    }

    const forbidden = normalizePairsContainer(input.forbidden);
    const menSet = new Set(men);
    const womenSet = new Set(women);

    const mPrefs = {};
    const wPrefs = {};

    for (const man of men) {
      const fromInput = uniqueList((input.mPrefs && input.mPrefs[man]) || []);
      const filtered = [];
      const seen = new Set();
      for (const woman of fromInput) {
        if (!womenSet.has(woman)) {
          continue;
        }
        if (!seen.has(woman)) {
          seen.add(woman);
          filtered.push(woman);
        }
      }
      if (!allowIncompletePrefs) {
        for (const woman of women) {
          if (!seen.has(woman)) {
            seen.add(woman);
            filtered.push(woman);
          }
        }
      }
      mPrefs[man] = filtered;
    }

    for (const woman of women) {
      const fromInput = uniqueList((input.wPrefs && input.wPrefs[woman]) || []);
      const filtered = [];
      const seen = new Set();
      for (const man of fromInput) {
        if (!menSet.has(man)) {
          continue;
        }
        if (!seen.has(man)) {
          seen.add(man);
          filtered.push(man);
        }
      }
      if (!allowIncompletePrefs) {
        for (const man of men) {
          if (!seen.has(man)) {
            seen.add(man);
            filtered.push(man);
          }
        }
      }
      wPrefs[woman] = filtered;
    }

    const mCap = {};
    const wCap = {};
    for (const man of men) {
      const capRaw = input.mCap && input.mCap[man] != null ? input.mCap[man] : 1;
      mCap[man] = clamp(toInt(capRaw, 1), 1, 1000000);
    }
    for (const woman of women) {
      const capRaw = input.wCap && input.wCap[woman] != null ? input.wCap[woman] : 1;
      wCap[woman] = clamp(toInt(capRaw, 1), 1, 1000000);
    }

    const menCategory = {};
    const womenCategory = {};
    const inMenCat = input.menCategory || {};
    const inWomenCat = input.womenCategory || {};
    for (const man of men) {
      const c = trimString(inMenCat[man]);
      menCategory[man] = c || '';
    }
    for (const woman of women) {
      const c = trimString(inWomenCat[woman]);
      womenCategory[woman] = c || '';
    }

    return {
      name: trimString(input.name) || 'custom',
      men,
      women,
      mPrefs,
      wPrefs,
      mCap,
      wCap,
      menCategory,
      womenCategory,
      forbidden,
      allowIncompletePrefs
    };
  }

  function cloneInstance(instance) {
    return normalizeInstance({
      name: instance.name,
      men: instance.men.slice(),
      women: instance.women.slice(),
      mPrefs: Object.fromEntries(instance.men.map((m) => [m, (instance.mPrefs[m] || []).slice()])),
      wPrefs: Object.fromEntries(instance.women.map((w) => [w, (instance.wPrefs[w] || []).slice()])),
      mCap: { ...instance.mCap },
      wCap: { ...instance.wCap },
      menCategory: { ...instance.menCategory },
      womenCategory: { ...instance.womenCategory },
      forbidden: new Set(instance.forbidden),
      allowIncompletePrefs: Boolean(instance.allowIncompletePrefs)
    });
  }

  function pairFromOrientation(side, proposer, receiver) {
    if (side === 'men') {
      return {
        man: proposer,
        woman: receiver,
        key: makePairKey(proposer, receiver)
      };
    }

    return {
      man: receiver,
      woman: proposer,
      key: makePairKey(receiver, proposer)
    };
  }

  function isForbiddenInOrientation(instance, side, proposer, receiver) {
    return pairFromOrientation(side, proposer, receiver).key && instance.forbidden.has(pairFromOrientation(side, proposer, receiver).key);
  }

  function buildOrientation(instance, proposerSide) {
    const side = proposerSide === 'women' ? 'women' : 'men';
    const proposers = side === 'men' ? instance.men.slice() : instance.women.slice();
    const receivers = side === 'men' ? instance.women.slice() : instance.men.slice();
    const proposerSet = new Set(proposers);
    const receiverSet = new Set(receivers);

    const pPrefsSource = side === 'men' ? instance.mPrefs : instance.wPrefs;
    const rPrefsSource = side === 'men' ? instance.wPrefs : instance.mPrefs;
    const proposerCapsSource = side === 'men' ? instance.mCap : instance.wCap;
    const receiverCapsSource = side === 'men' ? instance.wCap : instance.mCap;

    const pPrefs = {};
    const pRank = {};
    let totalPossibleProposals = 0;

    for (const proposer of proposers) {
      const list = [];
      const seen = new Set();
      const rawList = pPrefsSource[proposer] || [];
      for (const receiver of rawList) {
        if (!receiverSet.has(receiver) || seen.has(receiver)) {
          continue;
        }
        if (isForbiddenInOrientation(instance, side, proposer, receiver)) {
          continue;
        }
        seen.add(receiver);
        list.push(receiver);
      }
      pPrefs[proposer] = list;
      totalPossibleProposals += list.length;

      const rankMap = {};
      for (let i = 0; i < list.length; i += 1) {
        rankMap[list[i]] = i;
      }
      pRank[proposer] = rankMap;
    }

    const rPrefs = {};
    const rRank = {};
    for (const receiver of receivers) {
      const list = [];
      const seen = new Set();
      const rawList = rPrefsSource[receiver] || [];
      for (const proposer of rawList) {
        if (!proposerSet.has(proposer) || seen.has(proposer)) {
          continue;
        }
        if (isForbiddenInOrientation(instance, side, proposer, receiver)) {
          continue;
        }
        seen.add(proposer);
        list.push(proposer);
      }
      for (const proposer of proposers) {
        if (!seen.has(proposer) && !isForbiddenInOrientation(instance, side, proposer, receiver)) {
          seen.add(proposer);
          list.push(proposer);
        }
      }

      const rankMap = {};
      for (let i = 0; i < list.length; i += 1) {
        rankMap[list[i]] = i;
      }

      rPrefs[receiver] = list;
      rRank[receiver] = rankMap;
    }

    const proposerCaps = {};
    for (const proposer of proposers) {
      const capRaw = proposerCapsSource[proposer] != null ? proposerCapsSource[proposer] : 1;
      proposerCaps[proposer] = clamp(toInt(capRaw, 1), 1, 1000000);
    }

    const receiverCaps = {};
    for (const receiver of receivers) {
      const capRaw = receiverCapsSource[receiver] != null ? receiverCapsSource[receiver] : 1;
      receiverCaps[receiver] = clamp(toInt(capRaw, 1), 1, 1000000);
    }

    return {
      side,
      proposers,
      receivers,
      pPrefs,
      pRank,
      rPrefs,
      rRank,
      proposerCaps,
      receiverCaps,
      totalPossibleProposals
    };
  }

  function getWorstCurrent(receiver, currentList, rRank) {
    if (!currentList.length) {
      return null;
    }

    let worst = currentList[0];
    let worstRank = Object.prototype.hasOwnProperty.call(rRank[receiver], worst)
      ? rRank[receiver][worst]
      : Number.POSITIVE_INFINITY;

    for (let i = 1; i < currentList.length; i += 1) {
      const proposer = currentList[i];
      const rank = Object.prototype.hasOwnProperty.call(rRank[receiver], proposer)
        ? rRank[receiver][proposer]
        : Number.POSITIVE_INFINITY;
      if (rank > worstRank) {
        worst = proposer;
        worstRank = rank;
      }
    }

    return worst;
  }

  class GSEngine {
    constructor(instance, proposerSide, options = {}) {
      this.instance = cloneInstance(instance);
      this.orientation = buildOrientation(this.instance, proposerSide);
      this.capacitySide = options.capacitySide === 'proposer' ? 'proposer' : 'receiver';

      this.queue = this.orientation.proposers.slice();
      this.head = 0;

      this.nextIndex = {};
      this.proposerMatch = {};
      this.receiverMatches = {};

      for (const proposer of this.orientation.proposers) {
        this.nextIndex[proposer] = 0;
        this.proposerMatch[proposer] = [];
      }
      for (const receiver of this.orientation.receivers) {
        this.receiverMatches[receiver] = [];
      }

      this.proposalCount = 0;
      this.stepCount = 0;
      this.done = false;
      this.lastEvent = {
        type: 'initial',
        line: 1,
        key: 'step_initial'
      };
    }

    getProposerCapacity(proposer) {
      if (this.capacitySide !== 'proposer') {
        return 1;
      }
      const cap = this.orientation.proposerCaps[proposer];
      return Number.isFinite(cap) ? cap : 1;
    }

    getReceiverCapacity(receiver) {
      if (this.capacitySide !== 'receiver') {
        return 1;
      }
      const cap = this.orientation.receiverCaps[receiver];
      return Number.isFinite(cap) ? cap : 1;
    }

    hasFreeSlot(proposer) {
      const current = this.proposerMatch[proposer] || [];
      return current.length < this.getProposerCapacity(proposer);
    }

    hasRemainingChoice(proposer) {
      const prefs = this.orientation.pPrefs[proposer] || [];
      return this.nextIndex[proposer] < prefs.length;
    }

    canPropose(proposer) {
      return this.hasFreeSlot(proposer) && this.hasRemainingChoice(proposer);
    }

    enqueueIfCanPropose(proposer) {
      if (this.canPropose(proposer)) {
        this.queue.push(proposer);
      }
    }

    removeMatchFromProposer(proposer, receiver) {
      const list = this.proposerMatch[proposer] || [];
      const idx = list.indexOf(receiver);
      if (idx >= 0) {
        list.splice(idx, 1);
      }
    }

    step() {
      if (this.done) {
        return null;
      }

      while (this.head < this.queue.length) {
        const proposer = this.queue[this.head];
        this.head += 1;

        if (!this.hasFreeSlot(proposer)) {
          continue;
        }

        const prefs = this.orientation.pPrefs[proposer] || [];
        if (this.nextIndex[proposer] >= prefs.length) {
          this.stepCount += 1;
          this.lastEvent = {
            type: 'exhausted',
            line: this.capacitySide === 'proposer' ? 9 : 8,
            key: 'step_exhausted',
            proposer,
            proposalCount: this.proposalCount
          };
          return this.lastEvent;
        }

        const receiver = prefs[this.nextIndex[proposer]];
        this.nextIndex[proposer] += 1;
        this.proposalCount += 1;

        const current = this.receiverMatches[receiver];
        const cap = this.getReceiverCapacity(receiver);

        if (current.length < cap) {
          current.push(proposer);
          this.proposerMatch[proposer].push(receiver);
          this.enqueueIfCanPropose(proposer);

          this.stepCount += 1;
          this.lastEvent = {
            type: 'accept_free',
            line: this.capacitySide === 'proposer' ? 13 : 12,
            key: 'step_accept_free',
            proposer,
            receiver,
            proposalCount: this.proposalCount
          };
          return this.lastEvent;
        }

        const worstCurrent = getWorstCurrent(receiver, current, this.orientation.rRank);
        const candidateRank = Object.prototype.hasOwnProperty.call(this.orientation.rRank[receiver], proposer)
          ? this.orientation.rRank[receiver][proposer]
          : Number.POSITIVE_INFINITY;
        const worstRank = Object.prototype.hasOwnProperty.call(this.orientation.rRank[receiver], worstCurrent)
          ? this.orientation.rRank[receiver][worstCurrent]
          : Number.POSITIVE_INFINITY;

        if (candidateRank < worstRank) {
          const idx = current.indexOf(worstCurrent);
          if (idx >= 0) {
            current[idx] = proposer;
          } else {
            current.push(proposer);
          }

          this.proposerMatch[proposer].push(receiver);
          this.removeMatchFromProposer(worstCurrent, receiver);

          this.enqueueIfCanPropose(proposer);
          this.enqueueIfCanPropose(worstCurrent);

          this.stepCount += 1;
          this.lastEvent = {
            type: 'replace',
            line: 17,
            key: 'step_replace',
            proposer,
            receiver,
            displaced: worstCurrent,
            proposalCount: this.proposalCount
          };
          return this.lastEvent;
        }

        this.enqueueIfCanPropose(proposer);

        this.stepCount += 1;
        this.lastEvent = {
          type: 'reject',
          line: this.capacitySide === 'proposer' ? 16 : 15,
          key: 'step_reject',
          proposer,
          receiver,
          displaced: worstCurrent,
          proposalCount: this.proposalCount
        };
        return this.lastEvent;
      }

      this.done = true;
      this.stepCount += 1;
      this.lastEvent = {
        type: 'finished',
        line: 18,
        key: 'step_finished',
        proposalCount: this.proposalCount
      };
      return this.lastEvent;
    }

    runToEnd(maxEvents = Number.POSITIVE_INFINITY) {
      let count = 0;
      while (!this.done && count < maxEvents) {
        const ev = this.step();
        if (!ev) {
          break;
        }
        count += 1;
      }
      return this.getSnapshot();
    }

    getPairsCanonical() {
      const out = [];
      for (const proposer of this.orientation.proposers) {
        const receivers = this.proposerMatch[proposer] || [];
        for (const receiver of receivers) {
          out.push(pairFromOrientation(this.orientation.side, proposer, receiver));
        }
      }

      out.sort((a, b) => {
        if (a.man === b.man) {
          return a.woman.localeCompare(b.woman);
        }
        return a.man.localeCompare(b.man);
      });

      return out;
    }

    getSnapshot() {
      const queueRemaining = this.queue.slice(this.head);
      const freeProposers = [];
      for (const proposer of this.orientation.proposers) {
        if (this.canPropose(proposer)) {
          freeProposers.push(proposer);
        }
      }

      const engagedTo = this.capacitySide === 'proposer'
        ? Object.fromEntries(this.orientation.proposers.map((p) => [p, this.proposerMatch[p].slice()]))
        : Object.fromEntries(this.orientation.receivers.map((r) => [r, this.receiverMatches[r].slice()]));

      return {
        done: this.done,
        proposalCount: this.proposalCount,
        stepCount: this.stepCount,
        lastEvent: this.lastEvent,
        capacitySide: this.capacitySide,
        proposerMatch: Object.fromEntries(this.orientation.proposers.map((p) => [p, this.proposerMatch[p].slice()])),
        receiverMatches: Object.fromEntries(this.orientation.receivers.map((r) => [r, this.receiverMatches[r].slice()])),
        pairs: this.getPairsCanonical(),
        totalPossibleProposals: this.orientation.totalPossibleProposals,
        orientation: this.orientation,
        queueRemaining,
        nextIndex: { ...this.nextIndex },
        freeProposers,
        engagedTo
      };
    }
  }

  function countInstabilities(orientation, proposerMatch, receiverMatches, capacitySide = 'receiver') {
    let count = 0;

    for (const proposer of orientation.proposers) {
      const currentReceivers = Array.isArray(proposerMatch[proposer]) ? proposerMatch[proposer] : [];
      const currentSet = new Set(currentReceivers);
      const proposerCap = capacitySide === 'proposer'
        ? (orientation.proposerCaps[proposer] || 1)
        : 1;
      const worstCurrent = getWorstCurrent(proposer, currentReceivers, orientation.pRank);
      const worstCurrentRank = worstCurrent && Object.prototype.hasOwnProperty.call(orientation.pRank[proposer], worstCurrent)
        ? orientation.pRank[proposer][worstCurrent]
        : Number.POSITIVE_INFINITY;

      const prefs = orientation.pPrefs[proposer] || [];
      for (const receiver of prefs) {
        if (currentSet.has(receiver)) {
          continue;
        }

        const receiverRankForProposer = Object.prototype.hasOwnProperty.call(orientation.pRank[proposer], receiver)
          ? orientation.pRank[proposer][receiver]
          : Number.POSITIVE_INFINITY;

        const proposerWants = currentReceivers.length < proposerCap || receiverRankForProposer < worstCurrentRank;
        if (!proposerWants) {
          continue;
        }

        const currentList = receiverMatches[receiver] || [];
        const cap = capacitySide === 'receiver'
          ? (orientation.receiverCaps[receiver] || 1)
          : 1;

        if (currentList.length < cap) {
          count += 1;
          continue;
        }

        if (!currentList.length) {
          continue;
        }

        const worst = getWorstCurrent(receiver, currentList, orientation.rRank);
        const worstRank = Object.prototype.hasOwnProperty.call(orientation.rRank[receiver], worst)
          ? orientation.rRank[receiver][worst]
          : Number.POSITIVE_INFINITY;
        const candidateRank = Object.prototype.hasOwnProperty.call(orientation.rRank[receiver], proposer)
          ? orientation.rRank[receiver][proposer]
          : Number.POSITIVE_INFINITY;

        if (candidateRank < worstRank) {
          count += 1;
        }
      }
    }

    return count;
  }

  function evaluatePerfect(snapshot) {
    const orientation = snapshot.orientation;
    const capacitySide = snapshot.capacitySide || 'receiver';

    const getProposerCap = (proposer) => {
      if (capacitySide !== 'proposer') {
        return 1;
      }
      const cap = orientation.proposerCaps[proposer];
      return Number.isFinite(cap) ? Math.max(0, cap) : 1;
    };

    const getReceiverCap = (receiver) => {
      if (capacitySide !== 'receiver') {
        return 1;
      }
      const cap = orientation.receiverCaps[receiver];
      return Number.isFinite(cap) ? Math.max(0, cap) : 1;
    };

    let proposerCapSum = 0;
    let receiverCapSum = 0;
    let proposerMatchSum = 0;
    let receiverMatchSum = 0;

    for (const proposer of orientation.proposers) {
      const cap = getProposerCap(proposer);
      const matches = Array.isArray(snapshot.proposerMatch[proposer]) ? snapshot.proposerMatch[proposer].length : 0;
      proposerCapSum += cap;
      proposerMatchSum += matches;
      if (matches !== cap) {
        return false;
      }
    }

    for (const receiver of orientation.receivers) {
      const cap = getReceiverCap(receiver);
      const matches = Array.isArray(snapshot.receiverMatches[receiver]) ? snapshot.receiverMatches[receiver].length : 0;
      receiverCapSum += cap;
      receiverMatchSum += matches;
      if (matches !== cap) {
        return false;
      }
    }

    const pairCount = Array.isArray(snapshot.pairs) ? snapshot.pairs.length : 0;
    return proposerCapSum === receiverCapSum
      && proposerMatchSum === receiverMatchSum
      && proposerMatchSum === pairCount
      && pairCount === proposerCapSum;
  }

  function evaluateOptimality(instance, orientation, capacitySide = 'receiver') {
    const allProposerCapOne = orientation.proposers.every((proposer) => (orientation.proposerCaps[proposer] || 0) === 1);
    const allReceiverCapOne = orientation.receivers.every((receiver) => (orientation.receiverCaps[receiver] || 0) === 1);
    const allCapOne = allProposerCapOne && allReceiverCapOne;
    const sameSize = orientation.proposers.length === orientation.receivers.length;
    const forbiddenExists = instance.forbidden.size > 0;

    // Classic one-to-one (and Good/Bad) setting.
    if (sameSize && allCapOne && !forbiddenExists) {
      return {
        mode: 'current',
        proposerOptimal: true,
        receiverPessimal: true,
        context: 'one_to_one'
      };
    }

    // Resident matching (many-to-one): capacities may sit on either side depending on proposer orientation.
    if ((capacitySide === 'proposer' && allReceiverCapOne)
      || (capacitySide === 'receiver' && allProposerCapOne)) {
      return {
        mode: 'current',
        proposerOptimal: true,
        receiverPessimal: true,
        context: 'many_to_one'
      };
    }

    return {
      mode: 'not_applicable',
      proposerOptimal: null,
      receiverPessimal: null,
      context: null
    };
  }

  function evaluateGoodManGoodWomanProperty(instance, pairs) {

    const goodMen = instance.men.filter((man) => trimString(instance.menCategory[man]).toLowerCase() === 'good');
    const goodWomen = new Set(
      instance.women.filter((woman) => trimString(instance.womenCategory[woman]).toLowerCase() === 'good')
    );

    if (!goodMen.length || !goodWomen.size) {
      return {
        mode: 'not_applicable',
        holds: null
      };
    }

    const manToWoman = {};
    for (const pair of pairs) {
      manToWoman[pair.man] = pair.woman;
    }

    let holds = true;
    for (const goodMan of goodMen) {
      if (!goodWomen.has(manToWoman[goodMan])) {
        holds = false;
        break;
      }
    }

    return {
      mode: 'current',
      holds
    };
  }

  function analyzeSnapshot(instance, proposerSide, snapshot) {
    const orientation = snapshot.orientation;
    const instabilityCount = countInstabilities(
      orientation,
      snapshot.proposerMatch,
      snapshot.receiverMatches,
      snapshot.capacitySide || 'receiver'
    );
    const perfect = evaluatePerfect(snapshot);
    const optimality = snapshot.done
      ? evaluateOptimality(instance, orientation, snapshot.capacitySide || 'receiver')
      : {
        mode: 'pending',
        proposerOptimal: null,
        receiverPessimal: null,
        context: null
      };
    const goodBadProperty = snapshot.done
      ? evaluateGoodManGoodWomanProperty(instance, snapshot.pairs)
      : {
        mode: 'pending',
        holds: null
      };

    return {
      perfect,
      instabilityCount,
      terminationBound: orientation.totalPossibleProposals,
      usedProposals: snapshot.proposalCount,
      terminatesWithinBound: snapshot.proposalCount <= orientation.totalPossibleProposals,
      optimality,
      goodBadProperty
    };
  }

  function createHplSplInstance() {
    return normalizeInstance({
      name: 'HPL/SPL',
      men: ['Atlanta', 'Boston', 'Chicago', 'Detroit', 'El Paso'],
      women: ['Val', 'Wayne', 'Xavier', 'Yolanda', 'Zeus'],
      mPrefs: {
        Atlanta: ['Wayne', 'Val', 'Yolanda', 'Zeus', 'Xavier'],
        Boston: ['Yolanda', 'Wayne', 'Val', 'Xavier', 'Zeus'],
        Chicago: ['Wayne', 'Zeus', 'Xavier', 'Yolanda', 'Val'],
        Detroit: ['Val', 'Yolanda', 'Xavier', 'Wayne', 'Zeus'],
        'El Paso': ['Wayne', 'Yolanda', 'Val', 'Zeus', 'Xavier']
      },
      wPrefs: {
        Val: ['El Paso', 'Atlanta', 'Boston', 'Detroit', 'Chicago'],
        Wayne: ['Chicago', 'Boston', 'Detroit', 'Atlanta', 'El Paso'],
        Xavier: ['Boston', 'Chicago', 'Detroit', 'El Paso', 'Atlanta'],
        Yolanda: ['Atlanta', 'El Paso', 'Detroit', 'Chicago', 'Boston'],
        Zeus: ['Detroit', 'Boston', 'El Paso', 'Chicago', 'Atlanta']
      }
    });
  }

  function createHomensMulheresInstance() {
    return normalizeInstance({
      name: 'HOMENS/MULHERES',
      men: ['V', 'W', 'X', 'Y', 'Z'],
      women: ['A', 'B', 'C', 'D', 'E'],
      mPrefs: {
        V: ['A', 'B', 'C', 'D', 'E'],
        W: ['B', 'C', 'D', 'A', 'E'],
        X: ['C', 'D', 'A', 'B', 'E'],
        Y: ['D', 'A', 'B', 'C', 'E'],
        Z: ['A', 'B', 'C', 'D', 'E']
      },
      wPrefs: {
        A: ['W', 'X', 'Y', 'Z', 'V'],
        B: ['X', 'Y', 'Z', 'V', 'W'],
        C: ['Y', 'Z', 'V', 'W', 'X'],
        D: ['Z', 'V', 'W', 'X', 'Y'],
        E: ['V', 'W', 'X', 'Y', 'Z']
      }
    });
  }

  function createRandomInstance(n, seed) {
    const size = clamp(toInt(n, 5), 2, 2000);
    const rng = createRng(seed);
    const men = sequentialNames('M', size);
    const women = sequentialNames('W', size);
    const mPrefs = {};
    const wPrefs = {};

    for (const man of men) {
      mPrefs[man] = shuffled(women, rng);
    }
    for (const woman of women) {
      wPrefs[woman] = shuffled(men, rng);
    }

    return normalizeInstance({
      name: 'random',
      men,
      women,
      mPrefs,
      wPrefs
    });
  }

  function createInverseInstance(n) {
    const size = clamp(toInt(n, 5), 2, 2000);
    const men = sequentialNames('M', size);
    const women = sequentialNames('W', size);
    const mPrefs = {};
    const wPrefs = {};

    const reverseMen = men.slice().reverse();
    for (const man of men) {
      mPrefs[man] = women.slice();
    }
    for (const woman of women) {
      wPrefs[woman] = reverseMen.slice();
    }

    return normalizeInstance({
      name: 'inverse',
      men,
      women,
      mPrefs,
      wPrefs
    });
  }

  function createWorstCaseInstance(n) {
    const size = clamp(toInt(n, 5), 2, 2000);
    const men = sequentialNames('M', size);
    const women = sequentialNames('W', size);
    const mPrefs = {};
    const wPrefs = {};

    if (size === 2) {
      mPrefs.M1 = ['W1', 'W2'];
      mPrefs.M2 = ['W1', 'W2'];
      wPrefs.W1 = ['M2', 'M1'];
      wPrefs.W2 = ['M1', 'M2'];
      return normalizeInstance({
        name: 'worst_case',
        men,
        women,
        mPrefs,
        wPrefs
      });
    }

    const topWomen = women.slice(0, size - 1);
    for (let i = 0; i < size - 1; i += 1) {
      const rotated = [];
      for (let offset = 0; offset < size - 1; offset += 1) {
        rotated.push(topWomen[(i + offset) % (size - 1)]);
      }
      mPrefs[men[i]] = [...rotated, women[size - 1]];
    }
    mPrefs[men[size - 1]] = [...topWomen, women[size - 1]];

    for (let i = 0; i < size - 1; i += 1) {
      const rotatedMen = [];
      for (let offset = 0; offset < size - 1; offset += 1) {
        rotatedMen.push(men[(i + 1 + offset) % size]);
      }
      wPrefs[women[i]] = rotatedMen;
    }
    wPrefs[women[size - 1]] = men.slice();

    return normalizeInstance({
      name: 'worst_case',
      men,
      women,
      mPrefs,
      wPrefs
    });
  }

  function createEasyInstance(n) {
    const size = clamp(toInt(n, 5), 2, 2000);
    const men = sequentialNames('M', size);
    const women = sequentialNames('W', size);
    const mPrefs = {};
    const wPrefs = {};

    for (let i = 0; i < size; i += 1) {
      const man = men[i];
      const woman = women[i];
      mPrefs[man] = [woman, ...women.filter((w) => w !== woman)];
      wPrefs[woman] = [man, ...men.filter((m) => m !== man)];
    }

    return normalizeInstance({
      name: 'easy',
      men,
      women,
      mPrefs,
      wPrefs
    });
  }

  function applyGoodBadCategories(instance, k, seed) {
    const base = cloneInstance(instance);
    const men = base.men.slice();
    const women = base.women.slice();
    const size = Math.min(men.length, women.length);
    const safeK = clamp(toInt(k, Math.max(1, Math.floor(size / 2))), 1, Math.max(1, size - 1));
    const rng = createRng(seed);

    const goodMen = new Set(shuffled(men, rng).slice(0, safeK));
    const goodWomen = new Set(shuffled(women, rng).slice(0, safeK));
    const womenSet = new Set(women);
    const menSet = new Set(men);

    function reorderByCategory(prefList, universe, universeSet, goodSet) {
      const merged = uniqueList([...(prefList || []), ...universe]);
      const goodPart = [];
      const badPart = [];

      for (const name of merged) {
        if (!universeSet.has(name)) {
          continue;
        }
        if (goodSet.has(name)) {
          goodPart.push(name);
        } else {
          badPart.push(name);
        }
      }

      return [...goodPart, ...badPart];
    }

    const mPrefs = {};
    const wPrefs = {};
    const menCategory = {};
    const womenCategory = {};

    for (const man of men) {
      mPrefs[man] = reorderByCategory(base.mPrefs[man], women, womenSet, goodWomen);
      menCategory[man] = goodMen.has(man) ? 'good' : 'bad';
    }
    for (const woman of women) {
      wPrefs[woman] = reorderByCategory(base.wPrefs[woman], men, menSet, goodMen);
      womenCategory[woman] = goodWomen.has(woman) ? 'good' : 'bad';
    }

    return normalizeInstance({
      ...base,
      mPrefs,
      wPrefs,
      menCategory,
      womenCategory
    });
  }

  function createGoodBadInstance(n, k, seed) {
    const base = createRandomInstance(n, seed);
    const categorySeed = Number.isFinite(seed) ? seed + 104729 : seed;
    const adapted = applyGoodBadCategories(base, k, categorySeed);
    adapted.name = 'good_bad';
    return adapted;
  }

  function createGoodBadPresetInstance(preset, n, k, seed) {
    const key = trimString(preset);
    let base;

    if (key === 'inverse') {
      base = createInverseInstance(n);
    } else if (key === 'easy') {
      base = createEasyInstance(n);
    } else if (key === 'worst_case_demo') {
      base = createWorstCaseInstance(n);
    } else {
      base = createRandomInstance(n, seed);
    }

    const categorySeed = Number.isFinite(seed) ? seed + 104729 : seed;
    const adapted = applyGoodBadCategories(base, k, categorySeed);
    adapted.name = `good_bad_${key || 'random'}`;
    return adapted;
  }

  function rotateList(list, offset) {
    const size = list.length;
    if (!size) {
      return [];
    }
    const shift = ((toInt(offset, 0) % size) + size) % size;
    if (shift === 0) {
      return list.slice();
    }
    return [...list.slice(shift), ...list.slice(0, shift)];
  }

  function distributeCapacities(count, total, minCap, maxCap, random, rng) {
    const safeCount = Math.max(1, toInt(count, 1));
    const safeMin = Math.max(1, toInt(minCap, 1));
    const safeMax = Math.max(safeMin, toInt(maxCap, safeMin));
    const minTotal = safeCount * safeMin;
    const maxTotal = safeCount * safeMax;
    const safeTotal = clamp(toInt(total, minTotal), minTotal, maxTotal);
    const caps = Array(safeCount).fill(safeMin);
    let remaining = safeTotal - minTotal;

    if (remaining <= 0) {
      return caps;
    }

    const randomFn = typeof rng === 'function' ? rng : Math.random;
    if (random) {
      while (remaining > 0) {
        const available = [];
        for (let i = 0; i < safeCount; i += 1) {
          if (caps[i] < safeMax) {
            available.push(i);
          }
        }
        if (!available.length) {
          break;
        }
        const idx = available[Math.floor(randomFn() * available.length)];
        caps[idx] += 1;
        remaining -= 1;
      }
      return caps;
    }

    let cursor = 0;
    while (remaining > 0) {
      const idx = cursor % safeCount;
      if (caps[idx] < safeMax) {
        caps[idx] += 1;
        remaining -= 1;
      }
      cursor += 1;
    }

    return caps;
  }

  function createResidentMatchingInstance(config = {}) {
    const key = trimString(config.preset || 'random') || 'random';
    const residentsCount = clamp(toInt(config.residents, 10), 1, 2000);
    const hospitalsCount = clamp(toInt(config.hospitals, 6), 1, 2000);

    const hospitalCapMin = clamp(toInt(config.hospitalCapMin, 1), 1, 1000000);
    const hospitalCapMax = clamp(toInt(config.hospitalCapMax, Math.max(1, hospitalCapMin)), hospitalCapMin, 1000000);
    const minPositions = hospitalsCount * hospitalCapMin;
    const maxPositions = hospitalsCount * hospitalCapMax;
    const positions = clamp(toInt(config.positions, minPositions), minPositions, maxPositions);

    const residentAppsMin = clamp(toInt(config.residentAppsMin, 1), 1, hospitalsCount);
    const residentAppsMax = clamp(
      toInt(config.residentAppsMax, Math.min(3, hospitalsCount)),
      residentAppsMin,
      hospitalsCount
    );

    const rng = createRng(config.seed);
    const hospitals = sequentialNames('H', hospitalsCount);
    const residents = sequentialNames('R', residentsCount);
    const mPrefsBase = {};
    const wPrefsBase = {};

    if (key === 'inverse') {
      const reverseHospitals = hospitals.slice().reverse();
      for (const hospital of hospitals) {
        mPrefsBase[hospital] = residents.slice();
      }
      for (const resident of residents) {
        wPrefsBase[resident] = reverseHospitals.slice();
      }
    } else if (key === 'easy') {
      for (let i = 0; i < hospitals.length; i += 1) {
        const hospital = hospitals[i];
        const topResident = residents[i % residents.length];
        mPrefsBase[hospital] = [topResident, ...residents.filter((r) => r !== topResident)];
      }
      for (let j = 0; j < residents.length; j += 1) {
        const resident = residents[j];
        const topHospital = hospitals[j % hospitals.length];
        wPrefsBase[resident] = [topHospital, ...hospitals.filter((h) => h !== topHospital)];
      }
    } else if (key === 'worst_case_demo') {
      for (let i = 0; i < hospitals.length; i += 1) {
        const hospital = hospitals[i];
        mPrefsBase[hospital] = rotateList(residents, i);
      }
      for (let j = 0; j < residents.length; j += 1) {
        const resident = residents[j];
        const shifted = rotateList(hospitals, j + 1);
        wPrefsBase[resident] = shifted;
      }
    } else {
      for (const hospital of hospitals) {
        mPrefsBase[hospital] = shuffled(residents, rng);
      }
      for (const resident of residents) {
        wPrefsBase[resident] = shuffled(hospitals, rng);
      }
    }

    const capacities = distributeCapacities(
      hospitalsCount,
      positions,
      hospitalCapMin,
      hospitalCapMax,
      key === 'random',
      rng
    );

    const mCap = {};
    const wCap = {};
    for (let i = 0; i < hospitals.length; i += 1) {
      mCap[hospitals[i]] = capacities[i];
    }
    for (const resident of residents) {
      wCap[resident] = 1;
    }

    const forbidden = new Set();
    const wPrefs = {};
    const mPrefs = {};

    for (let idx = 0; idx < residents.length; idx += 1) {
      const resident = residents[idx];
      const order = (wPrefsBase[resident] || hospitals).slice();
      const span = residentAppsMax - residentAppsMin + 1;
      const appCount = key === 'random'
        ? residentAppsMin + Math.floor(rng() * span)
        : residentAppsMin + (idx % span);
      const boundedCount = clamp(appCount, residentAppsMin, residentAppsMax);
      const allowed = new Set(order.slice(0, boundedCount));
      wPrefs[resident] = order.filter((hospital) => allowed.has(hospital));

      if (allowed.size === hospitals.length) {
        continue;
      }

      for (const hospital of hospitals) {
        if (!allowed.has(hospital)) {
          forbidden.add(makePairKey(hospital, resident));
        }
      }
    }

    for (const hospital of hospitals) {
      const orderedResidents = (mPrefsBase[hospital] || residents).slice();
      mPrefs[hospital] = orderedResidents.filter((resident) => !forbidden.has(makePairKey(hospital, resident)));
    }

    return normalizeInstance({
      name: `resident_${key}`,
      men: hospitals,
      women: residents,
      mPrefs,
      wPrefs,
      mCap,
      wCap,
      forbidden,
      allowIncompletePrefs: true
    });
  }

  function applyForbiddenPairs(instance, forbiddenSet) {
    const copy = cloneInstance(instance);
    for (const key of forbiddenSet) {
      copy.forbidden.add(key);
    }
    return normalizeInstance(copy);
  }

  function generateForbiddenPairs(instance, count, seed) {
    const men = (instance && instance.men) ? instance.men.slice() : [];
    const women = (instance && instance.women) ? instance.women.slice() : [];
    if (!men.length || !women.length) {
      return new Set();
    }

    const maxPairs = men.length * women.length;
    const target = clamp(toInt(count, 0), 0, maxPairs);
    const out = new Set();

    if (target === 0) {
      return out;
    }

    const random = createRng(seed);
    const maxAttempts = Math.max(target * 48, 128);
    let attempts = 0;

    while (out.size < target && attempts < maxAttempts) {
      const man = men[Math.floor(random() * men.length)];
      const woman = women[Math.floor(random() * women.length)];
      out.add(makePairKey(man, woman));
      attempts += 1;
    }

    if (out.size < target) {
      for (const man of men) {
        for (const woman of women) {
          out.add(makePairKey(man, woman));
          if (out.size >= target) {
            break;
          }
        }
        if (out.size >= target) {
          break;
        }
      }
    }

    return out;
  }

  function applyReceiverCapacities(instance, proposerSide, capsByName) {
    const copy = cloneInstance(instance);
    const side = proposerSide === 'women' ? 'women' : 'men';
    const targetCaps = side === 'men' ? copy.wCap : copy.mCap;
    for (const [name, cap] of Object.entries(capsByName || {})) {
      if (!Object.prototype.hasOwnProperty.call(targetCaps, name)) {
        continue;
      }
      targetCaps[name] = clamp(toInt(cap, 1), 1, 1000000);
    }
    return normalizeInstance(copy);
  }

  function applyProposerCapacities(instance, proposerSide, capsByName) {
    const copy = cloneInstance(instance);
    const side = proposerSide === 'women' ? 'women' : 'men';
    const targetCaps = side === 'men' ? copy.mCap : copy.wCap;
    for (const [name, cap] of Object.entries(capsByName || {})) {
      if (!Object.prototype.hasOwnProperty.call(targetCaps, name)) {
        continue;
      }
      targetCaps[name] = clamp(toInt(cap, 1), 1, 1000000);
    }
    return normalizeInstance(copy);
  }

  function parseCsvLine(line, delimiter) {
    const out = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (ch === delimiter && !inQuotes) {
        out.push(current);
        current = '';
        continue;
      }

      current += ch;
    }

    out.push(current);
    return out.map((x) => trimString(x));
  }

  function parseCsvInstance(text) {
    const rawText = String(text || '');
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    if (!lines.length) {
      throw new Error('Empty CSV');
    }

    const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ',';

    const men = [];
    const women = [];
    const mPrefs = {};
    const wPrefs = {};
    const mCap = {};
    const wCap = {};
    const menCategory = {};
    const womenCategory = {};
    const forbidden = new Set();

    for (const line of lines) {
      const cols = parseCsvLine(line, delimiter);
      if (!cols.length) {
        continue;
      }

      const group = cols[0].toLowerCase();

      if (group === 'group') {
        continue;
      }

      if (group === 'forbidden') {
        const man = cols[1];
        const woman = cols[2];
        if (man && woman) {
          forbidden.add(makePairKey(man, woman));
        }
        continue;
      }

      if (group !== 'men' && group !== 'women' && group !== 'man' && group !== 'woman' && group !== 'm' && group !== 'w') {
        continue;
      }

      const side = group.startsWith('m') ? 'men' : 'women';
      const name = cols[1];
      if (!name) {
        continue;
      }

      const prefs = cols[2]
        ? cols[2].split('|').map((x) => trimString(x)).filter(Boolean)
        : [];
      const cap = cols[3] ? clamp(toInt(cols[3], 1), 1, 1000000) : 1;
      const category = cols[4] ? trimString(cols[4]).toLowerCase() : '';

      if (side === 'men') {
        if (!men.includes(name)) {
          men.push(name);
        }
        mPrefs[name] = prefs;
        mCap[name] = cap;
        menCategory[name] = category;
      } else {
        if (!women.includes(name)) {
          women.push(name);
        }
        wPrefs[name] = prefs;
        wCap[name] = cap;
        womenCategory[name] = category;
      }
    }

    return normalizeInstance({
      name: 'csv',
      men,
      women,
      mPrefs,
      wPrefs,
      mCap,
      wCap,
      menCategory,
      womenCategory,
      forbidden
    });
  }

  function exportCsvInstance(instance) {
    const lines = [];
    lines.push('group,name,prefs,capacity,category');

    for (const man of instance.men) {
      const prefs = (instance.mPrefs[man] || []).join('|');
      const cap = instance.mCap[man] != null ? instance.mCap[man] : 1;
      const category = instance.menCategory[man] || '';
      lines.push(`men,${man},${prefs},${cap},${category}`);
    }

    for (const woman of instance.women) {
      const prefs = (instance.wPrefs[woman] || []).join('|');
      const cap = instance.wCap[woman] != null ? instance.wCap[woman] : 1;
      const category = instance.womenCategory[woman] || '';
      lines.push(`women,${woman},${prefs},${cap},${category}`);
    }

    for (const key of instance.forbidden) {
      const parts = key.split('|');
      if (parts.length === 2) {
        lines.push(`forbidden,${parts[0]},${parts[1]}`);
      }
    }

    return `${lines.join('\n')}\n`;
  }

  window.GSAlgorithms = {
    normalizeInstance,
    cloneInstance,
    parseForbiddenText,
    parseCapacityText,
    parseCsvInstance,
    exportCsvInstance,
    applyForbiddenPairs,
    generateForbiddenPairs,
    applyReceiverCapacities,
    applyProposerCapacities,
    applyGoodBadCategories,
    createResidentMatchingInstance,
    buildOrientation,
    analyzeSnapshot,
    GSEngine,

    presets: {
      hplSpl: createHplSplInstance,
      homensMulheres: createHomensMulheresInstance,
      random: createRandomInstance,
      inverse: createInverseInstance,
      easy: createEasyInstance,
      residentMatching: createResidentMatchingInstance,
      goodBad: createGoodBadInstance,
      goodBadFromPreset: createGoodBadPresetInstance,
      worstCase: createWorstCaseInstance
    }
  };
})();
