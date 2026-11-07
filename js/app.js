/**
 * NexusHub Event Management Web Application
 * Author: Devdatta Chaudhuri
 * Repository: https://github.com/devdattachaudhuri/eventmanage
 * 
 * Production-Ready Vanilla ES6+ Application Logic
 * Zero external libraries or npm dependencies
 */

(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT & LOCAL STORAGE
  // ---------------------------------------------------------------------------
  const STORAGE_KEYS = {
    EVENTS: "nh_events_v3",
    PASSES: "nh_passes_v3",
    THEME: "nh_theme_v3",
    SYNC_ROOM: "nh_sync_room_v3",
    SENDER_ID: "nh_sender_id_v3"
  };

  // Generate or retrieve persistent unique sender ID for this client/device
  let senderId = localStorage.getItem(STORAGE_KEYS.SENDER_ID);
  if (!senderId) {
    senderId = "dev_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.SENDER_ID, senderId);
  }

  // Determine active sync room (URL parameter ?room=xyz takes precedence over localStorage)
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get("room");
  let syncRoom = roomParam || localStorage.getItem(STORAGE_KEYS.SYNC_ROOM) || "nexushub_mesh_v3";
  if (roomParam) {
    localStorage.setItem(STORAGE_KEYS.SYNC_ROOM, roomParam);
  }

  let syncEventSource = null;
  let syncStatus = "disconnected"; // 'connected' | 'connecting' | 'disconnected'
  let syncReconnectTimeout = null;

  let state = {
    events: [],
    passes: [],
    selectedCategory: "All",
    searchQuery: "",
    sortBy: "date",
    viewMode: "grid", // 'grid' | 'list'
    activeSpotlightEvent: null
  };

  /**
   * Initialize or retrieve state from LocalStorage
   */
  function initState() {
    // Purge legacy obsolete storage keys from early prototypes
    localStorage.removeItem("cp_events_v1");
    localStorage.removeItem("cp_passes_v1");
    localStorage.removeItem("nh_events_v2");
    localStorage.removeItem("nh_passes_v2");

    const blacklistedSignatures = [
      "innovatex", "harmonics", "robotics workshop", "cyberclash",
      "designcraft", "ventureforge", "glowrun", "robovanguard", "framed",
      "campushack", "campus-hack"
    ];

    // 1. Events State with anti-stale validation: always ensure all 9 fresh events
    const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
    let validEvents = null;

    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        if (Array.isArray(parsed) && parsed.length === INITIAL_EVENTS.length) {
          const hasStaleOrBlacklisted = parsed.some(ev => {
            const t = (ev.title || "").toLowerCase();
            const id = (ev.id || "");
            return !id.startsWith("nh-") || blacklistedSignatures.some(sig => t.includes(sig));
          });
          if (!hasStaleOrBlacklisted) {
            validEvents = parsed;
          }
        }
      } catch (e) {
        validEvents = null;
      }
    }

    if (validEvents) {
      state.events = validEvents;
    } else {
      state.events = typeof INITIAL_EVENTS !== "undefined" ? JSON.parse(JSON.stringify(INITIAL_EVENTS)) : [];
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(state.events));
    }

    // 2. Passes State
    const savedPasses = localStorage.getItem(STORAGE_KEYS.PASSES);
    if (savedPasses) {
      try {
        state.passes = JSON.parse(savedPasses);
      } catch (e) {
        state.passes = [];
      }
    } else {
      state.passes = [];
    }

    // 3. Theme Init
    initTheme();

    // 4. Set Spotlight Event (Featured or first)
    state.activeSpotlightEvent = state.events.find(ev => ev.featured) || state.events[0];
  }

  function saveEventsToStorage(broadcast = true) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(state.events));
    if (broadcast) {
      broadcastSyncAction("SYNC_EVENTS", { events: state.events });
    }
  }

  function savePassesToStorage(broadcast = true) {
    localStorage.setItem(STORAGE_KEYS.PASSES, JSON.stringify(state.passes));
    updatePassesBadge();
    if (broadcast) {
      broadcastSyncAction("SYNC_PASSES", { passes: state.passes });
    }
  }

  // ---------------------------------------------------------------------------
  // MULTI-DEVICE REAL-TIME CLOUD SYNCHRONIZATION (NTFY.SH ZERO-AUTH PUB/SUB)
  // ---------------------------------------------------------------------------
  function getHubUrl(room) {
    return `https://ntfy.sh/${encodeURIComponent(room)}`;
  }

  function updateSyncUI(status, label) {
    syncStatus = status;
    const dot = document.getElementById("sync-status-dot");
    const text = document.getElementById("sync-status-text");
    const indicator = document.getElementById("sync-status-indicator");
    const modalStatus = document.getElementById("sync-connection-status-display");
    const modalRoom = document.getElementById("sync-current-room-display");
    const modalRoomInput = document.getElementById("sync-room-input");
    const shareInput = document.getElementById("sync-shareable-link-input");

    if (dot) {
      dot.className = `sync-status-dot ${status}`;
    }
    if (text) {
      text.textContent = label || (status === "connected" ? "Live Sync" : (status === "connecting" ? "Connecting" : "Offline"));
    }
    if (indicator) {
      indicator.title = `Live Cloud Sync: ${status === "connected" ? "Active (Room: " + syncRoom + ")" : (status === "connecting" ? "Connecting to " + syncRoom : "Offline")}`;
    }
    if (modalStatus) {
      modalStatus.textContent = status === "connected" ? `Active & Connected (SSE)` : (status === "connecting" ? `Connecting...` : `Offline / Reconnecting`);
      modalStatus.className = `sync-info-value ${status}`;
    }
    if (modalRoom) {
      modalRoom.textContent = syncRoom;
    }
    if (modalRoomInput && document.activeElement !== modalRoomInput) {
      modalRoomInput.value = syncRoom;
    }
    if (shareInput) {
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set("room", syncRoom);
      shareInput.value = shareUrl.toString();
    }
  }

  function initRealtimeSync() {
    if (syncEventSource) {
      try { syncEventSource.close(); } catch (e) {}
      syncEventSource = null;
    }

    if (syncReconnectTimeout) {
      clearTimeout(syncReconnectTimeout);
      syncReconnectTimeout = null;
    }

    updateSyncUI("connecting", "Connecting");

    // Catch up on missed events immediately via poll=1 without aggressive intervals
    fetchMissedHistory();

    try {
      const sseUrl = `${getHubUrl(syncRoom)}/sse`;
      syncEventSource = new EventSource(sseUrl);

      syncEventSource.onopen = () => {
        updateSyncUI("connected", "Live Sync");
      };

      syncEventSource.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          // ntfy.sh messages enclose the body in the 'message' property
          if (raw && raw.message) {
            handleIncomingSyncPayload(raw.message);
          }
        } catch (err) {
          // Ignore keepalives or non-JSON messages
        }
      };

      syncEventSource.onerror = () => {
        if (syncEventSource && syncEventSource.readyState === EventSource.CONNECTING) {
          updateSyncUI("connecting", "Reconnecting");
          return;
        }
        updateSyncUI("disconnected", "Offline");
        if (syncEventSource) {
          try { syncEventSource.close(); } catch (e) {}
          syncEventSource = null;
        }
        // Auto-reconnect after 4s
        syncReconnectTimeout = setTimeout(() => {
          initRealtimeSync();
        }, 4000);
      };
    } catch (err) {
      updateSyncUI("disconnected", "Offline");
    }
  }

  function broadcastSyncAction(actionType, data = {}) {
    const payload = {
      senderId: senderId,
      room: syncRoom,
      action: actionType,
      data: data,
      timestamp: Date.now()
    };

    const messageString = JSON.stringify(payload);

    // Send HTTP POST to ntfy.sh room
    fetch(getHubUrl(syncRoom), {
      method: "POST",
      body: messageString,
      headers: {
        "Title": "NexusHub Sync",
        "Priority": "low"
      }
    }).catch(err => {
      console.warn("Sync broadcast temporarily unavailable:", err);
    });
  }

  function handleIncomingSyncPayload(rawString) {
    let payload;
    try {
      payload = typeof rawString === "string" ? JSON.parse(rawString) : rawString;
    } catch (e) {
      return;
    }

    if (!payload || !payload.action) return;

    // Reject self-broadcasts using senderId to eliminate infinite loops
    if (payload.senderId === senderId) return;

    // Verify room matches
    if (payload.room && payload.room !== syncRoom) return;

    let stateChanged = false;

    if (payload.action === "BOOK_PASS" && payload.data && payload.data.pass) {
      const incomingPass = payload.data.pass;
      if (!state.passes.some(p => p.id === incomingPass.id)) {
        state.passes.unshift(incomingPass);
        savePassesToStorage(false);
        stateChanged = true;
      }
      if (payload.data.eventId) {
        const ev = state.events.find(e => e.id === payload.data.eventId);
        if (ev) {
          ev.bookedSeats = Math.min(ev.totalSeats, (ev.bookedSeats || 0) + 1);
          saveEventsToStorage(false);
          stateChanged = true;
        }
      }
      showToast(`⚡ Real-time: Pass created on another device (${incomingPass.eventTitle})`, "success");
    } else if (payload.action === "CANCEL_PASS" && payload.data && payload.data.passId) {
      const targetId = payload.data.passId;
      const passIdx = state.passes.findIndex(p => p.id === targetId);
      if (passIdx !== -1) {
        const removed = state.passes.splice(passIdx, 1)[0];
        savePassesToStorage(false);
        if (removed && removed.eventId) {
          const ev = state.events.find(e => e.id === removed.eventId);
          if (ev && ev.bookedSeats > 0) {
            ev.bookedSeats -= 1;
            saveEventsToStorage(false);
          }
        }
        stateChanged = true;
        showToast(`⚡ Real-time: Pass cancelled from another device`, "info");
      }
    } else if (payload.action === "SYNC_PASSES" && payload.data && Array.isArray(payload.data.passes)) {
      // Merge unique passes by ID
      const existingIds = new Set(state.passes.map(p => p.id));
      let added = 0;
      payload.data.passes.forEach(p => {
        if (!existingIds.has(p.id)) {
          state.passes.unshift(p);
          existingIds.add(p.id);
          added++;
        }
      });
      if (added > 0) {
        savePassesToStorage(false);
        stateChanged = true;
      }
    } else if (payload.action === "SYNC_EVENTS" && payload.data && Array.isArray(payload.data.events)) {
      // Synchronize seat counts
      payload.data.events.forEach(incomingEv => {
        const localEv = state.events.find(e => e.id === incomingEv.id);
        if (localEv && typeof incomingEv.bookedSeats === "number") {
          if (localEv.bookedSeats !== incomingEv.bookedSeats) {
            localEv.bookedSeats = incomingEv.bookedSeats;
            stateChanged = true;
          }
        }
      });
      if (stateChanged) {
        saveEventsToStorage(false);
      }
    }

    if (stateChanged) {
      renderSpotlightBanner();
      renderEvents();
      renderPassesList();
      updatePassesBadge();
    }
  }

  // Fetch recent history via poll=1 to catch up on offline data
  function fetchMissedHistory(showToastFeedback = false) {
    const pollUrl = `${getHubUrl(syncRoom)}/json?poll=1`;
    fetch(pollUrl)
      .then(res => res.text())
      .then(text => {
        if (!text) return;
        // ntfy /json?poll=1 returns NDJSON (one JSON object per line)
        const lines = text.trim().split("\n");
        let processedCount = 0;
        lines.forEach(line => {
          if (!line.trim()) return;
          try {
            const raw = JSON.parse(line);
            if (raw && raw.message) {
              handleIncomingSyncPayload(raw.message);
              processedCount++;
            }
          } catch (e) {}
        });
        if (showToastFeedback) {
          showToast(`Cloud synchronization complete!`, "success");
        }
      })
      .catch(err => {
        if (showToastFeedback) {
          showToast(`Unable to reach cloud hub right now. Using offline data.`, "info");
        }
      });
  }

  // Switch to another private room code
  function changeSyncRoom(newRoom) {
    if (!newRoom) return;
    const sanitized = newRoom.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    if (!sanitized) {
      showToast("Please enter a valid room code (alphanumeric).", "error");
      return;
    }
    syncRoom = sanitized;
    localStorage.setItem(STORAGE_KEYS.SYNC_ROOM, syncRoom);

    // Update URL query param cleanly without reloading page
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("room", syncRoom);
    window.history.replaceState({}, "", currentUrl.toString());

    initRealtimeSync();
    showToast(`Connected to sync room: "${syncRoom}"`, "success");
  }

  // Export full backup of passes and custom events
  function exportBackupJSON() {
    const backupData = {
      version: "2.1",
      exportedAt: new Date().toISOString(),
      room: syncRoom,
      events: state.events,
      passes: state.passes
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NexusHub_Backup_${syncRoom}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Backup exported successfully as JSON file!", "success");
  }

  // Import JSON backup file
  function importBackupJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!imported) throw new Error("Invalid format");

        let passesAdded = 0;
        if (Array.isArray(imported.passes)) {
          const existingIds = new Set(state.passes.map(p => p.id));
          imported.passes.forEach(p => {
            if (p && p.id && !existingIds.has(p.id)) {
              state.passes.push(p);
              existingIds.add(p.id);
              passesAdded++;
            }
          });
        }

        if (Array.isArray(imported.events)) {
          imported.events.forEach(impEv => {
            const match = state.events.find(e => e.id === impEv.id);
            if (match && typeof impEv.bookedSeats === "number") {
              match.bookedSeats = impEv.bookedSeats;
            }
          });
        }

        saveEventsToStorage(true);
        savePassesToStorage(true);

        renderSpotlightBanner();
        renderEvents();
        renderPassesList();
        updatePassesBadge();

        showToast(`Imported ${passesAdded} passes successfully! Synced across cloud.`, "success");
      } catch (err) {
        showToast("Error importing file: Invalid JSON backup format.", "error");
      }
    };
    reader.readAsText(file);
  }
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    document.documentElement.setAttribute("data-theme", initialTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Cyber Dark' : 'Studio Light'} mode`, "info");
  }

  // ---------------------------------------------------------------------------
  // TOAST NOTIFICATION SYSTEM
  // ---------------------------------------------------------------------------
  function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconSvg = "";
    if (type === "success") {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === "error") {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }

  // Helper: Escape HTML
  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ---------------------------------------------------------------------------
  // 3D TILT EFFECT FOR CARDS
  // ---------------------------------------------------------------------------
  function apply3DTilt(element, maxAngle = 12) {
    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxAngle;
      const rotateY = ((x - centerX) / centerX) * maxAngle;

      element.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
    });

    element.addEventListener("mouseleave", () => {
      element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    });
  }

  // ---------------------------------------------------------------------------
  // LIVE COUNTDOWN TIMER ENGINE
  // ---------------------------------------------------------------------------
  function getTimeRemaining(targetIsoDate) {
    const total = Date.parse(targetIsoDate) - Date.now();
    if (total <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { total, days, hours, minutes, seconds };
  }

  function startCountdownLoops() {
    function updateTimers() {
      // 1. Update Spotlight Banner Countdown
      if (state.activeSpotlightEvent) {
        const remaining = getTimeRemaining(state.activeSpotlightEvent.isoDate);
        const dEl = document.getElementById("spotlight-days");
        const hEl = document.getElementById("spotlight-hours");
        const mEl = document.getElementById("spotlight-minutes");
        const sEl = document.getElementById("spotlight-seconds");

        if (dEl && hEl && mEl && sEl) {
          dEl.textContent = String(remaining.days).padStart(2, "0");
          hEl.textContent = String(remaining.hours).padStart(2, "0");
          mEl.textContent = String(remaining.minutes).padStart(2, "0");
          sEl.textContent = String(remaining.seconds).padStart(2, "0");
        }
      }

      // 2. Update Mini Countdown chips in grid cards
      const chips = document.querySelectorAll("[data-countdown-target]");
      chips.forEach((chip) => {
        const iso = chip.getAttribute("data-countdown-target");
        const rem = getTimeRemaining(iso);
        if (rem.total <= 0) {
          chip.textContent = "Event Ended";
        } else if (rem.days > 0) {
          chip.textContent = `${rem.days}d ${rem.hours}h left`;
        } else {
          chip.textContent = `${rem.hours}h ${rem.minutes}m left`;
        }
      });
    }

    updateTimers();
    setInterval(updateTimers, 1000);
  }

  // ---------------------------------------------------------------------------
  // ANIMATED NUMERICAL COUNTERS (HERO SECTION)
  // ---------------------------------------------------------------------------
  function animateStatsCounter() {
    const statElements = document.querySelectorAll(".stat-number[data-target]");
    statElements.forEach((el) => {
      const target = parseInt(el.getAttribute("data-target"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1800; // ms
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quadratic
        const easeProgress = progress * (2 - progress);
        const currentVal = Math.floor(easeProgress * target);

        el.textContent = `${currentVal.toLocaleString()}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = `${target.toLocaleString()}${suffix}`;
        }
      }

      requestAnimationFrame(update);
    });
  }

  // ---------------------------------------------------------------------------
  // FILTERING, SORTING & RENDERING
  // ---------------------------------------------------------------------------
  function getFilteredEvents() {
    return state.events
      .filter((ev) => {
        // Category Filter
        if (state.selectedCategory !== "All" && ev.category.toLowerCase() !== state.selectedCategory.toLowerCase()) {
          return false;
        }

        // Live Search Filter
        if (state.searchQuery.trim() !== "") {
          const q = state.searchQuery.toLowerCase();
          const matchTitle = ev.title.toLowerCase().includes(q);
          const matchDesc = ev.shortDescription.toLowerCase().includes(q);
          const matchVenue = ev.venue.toLowerCase().includes(q);
          const matchTags = ev.tags.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchVenue && !matchTags) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (state.sortBy === "date") {
          return new Date(a.isoDate) - new Date(b.isoDate);
        } else if (state.sortBy === "popularity") {
          const percA = a.bookedSeats / a.totalSeats;
          const percB = b.bookedSeats / b.totalSeats;
          return percB - percA; // Descending
        } else if (state.sortBy === "alpha") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }

  function renderSpotlightBanner() {
    const bannerContainer = document.getElementById("spotlight-container");
    if (!bannerContainer || !state.activeSpotlightEvent) return;

    const ev = state.activeSpotlightEvent;
    const remainingSeats = ev.totalSeats - ev.bookedSeats;
    const fillPercent = Math.min(Math.round((ev.bookedSeats / ev.totalSeats) * 100), 100);

    bannerContainer.innerHTML = `
      <div class="spotlight-banner">
        <div class="spotlight-grid">
          <div class="spotlight-content">
            <div class="spotlight-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              Flagship Spotlight Event
            </div>
            <h2 class="spotlight-title">${escapeHTML(ev.title)}</h2>
            <p class="spotlight-synopsis">${escapeHTML(ev.shortDescription)}</p>

            <div class="spotlight-countdown-wrapper">
              <div class="countdown-label">T-Minus to Inception:</div>
              <div class="countdown-timer">
                <div class="countdown-unit">
                  <div class="countdown-digits" id="spotlight-days">00</div>
                  <div class="countdown-caption">Days</div>
                </div>
                <div class="countdown-unit">
                  <div class="countdown-digits" id="spotlight-hours">00</div>
                  <div class="countdown-caption">Hours</div>
                </div>
                <div class="countdown-unit">
                  <div class="countdown-digits" id="spotlight-minutes">00</div>
                  <div class="countdown-caption">Mins</div>
                </div>
                <div class="countdown-unit">
                  <div class="countdown-digits" id="spotlight-seconds">00</div>
                  <div class="countdown-caption">Secs</div>
                </div>
              </div>
            </div>

            <div class="capacity-meter">
              <div class="capacity-labels">
                <span>Pass Allocation</span>
                <span class="capacity-remaining">${remainingSeats > 0 ? `${remainingSeats} Seats Left` : 'Sold Out'} (${fillPercent}% Booked)</span>
              </div>
              <div class="capacity-bar-track">
                <div class="capacity-bar-fill" style="width: ${fillPercent}%;"></div>
              </div>
            </div>

            <div class="spotlight-actions">
              <button class="btn-primary" onclick="window.NexusHub.openBookingModal('${ev.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                Reserve Seat Now
              </button>
              <button class="btn-secondary" onclick="window.NexusHub.openDetailsModal('${ev.id}')">
                Inspect Agenda
              </button>
            </div>
          </div>

          <div class="spotlight-media">
            <img src="${escapeHTML(ev.image)}" alt="${escapeHTML(ev.title)}" loading="lazy">
            <div class="spotlight-media-overlay"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEvents() {
    const gridContainer = document.getElementById("events-grid");
    const resultsCountEl = document.getElementById("results-count");
    if (!gridContainer) return;

    const filtered = getFilteredEvents();
    if (resultsCountEl) {
      resultsCountEl.textContent = `Showing ${filtered.length} of ${state.events.length} campus events`;
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No Matching Events Discovered</h3>
          <p>Try modifying your keyword query or switching the category filter.</p>
          <button class="btn-secondary" style="margin-top: 1.5rem;" onclick="window.NexusHub.resetFilters()">
            Reset All Filters
          </button>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtered.map((ev) => {
      const remainingSeats = ev.totalSeats - ev.bookedSeats;
      const fillRatio = ev.bookedSeats / ev.totalSeats;
      const fillPercent = Math.min(Math.round(fillRatio * 100), 100);

      // Status indicator classes
      let statusClass = "status-available";
      let statusLabel = `${remainingSeats} Seats Available`;
      let fillClass = "fill-available";

      if (remainingSeats <= 0) {
        statusClass = "status-almost-full";
        statusLabel = "Sold Out";
        fillClass = "fill-almost-full";
      } else if (fillRatio >= 0.85) {
        statusClass = "status-almost-full";
        statusLabel = `Almost Full (${remainingSeats} left)`;
        fillClass = "fill-almost-full";
      } else if (fillRatio >= 0.60) {
        statusClass = "status-selling-fast";
        statusLabel = `Selling Fast (${remainingSeats} left)`;
        fillClass = "fill-selling-fast";
      }

      // Category badge class
      let badgeClass = "badge-tech";
      if (ev.category.toLowerCase() === "cultural") badgeClass = "badge-cultural";
      if (ev.category.toLowerCase() === "workshops") badgeClass = "badge-workshops";
      if (ev.category.toLowerCase() === "sports") badgeClass = "badge-sports";
      if (ev.category.toLowerCase() === "business") badgeClass = "badge-business";

      return `
        <div class="event-card" data-event-id="${ev.id}">
          <div class="card-img-holder">
            <img class="card-img" src="${escapeHTML(ev.image)}" alt="${escapeHTML(ev.title)}" loading="lazy">
            <span class="card-category-badge ${badgeClass}">${escapeHTML(ev.category)}</span>
            <div class="card-countdown-chip" data-countdown-target="${ev.isoDate}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Calculating...</span>
            </div>
          </div>

          <div class="card-content">
            <div class="card-date-venue-row">
              <span class="meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${escapeHTML(ev.date)}
              </span>
              <span class="meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${escapeHTML(ev.venue.split(",")[0])}
              </span>
            </div>

            <h3 class="card-title">${escapeHTML(ev.title)}</h3>
            <p class="card-description">${escapeHTML(ev.shortDescription)}</p>

            <div class="card-capacity-box">
              <div class="capacity-meta-row">
                <span class="capacity-status-badge ${statusClass}">${statusLabel}</span>
                <span style="font-weight: 600; color: var(--text-muted); font-size: 0.72rem;">${fillPercent}%</span>
              </div>
              <div class="card-capacity-track">
                <div class="card-capacity-fill ${fillClass}" style="width: ${fillPercent}%;"></div>
              </div>
            </div>

            <div class="card-actions-row">
              <button class="btn-card-secondary" onclick="window.NexusHub.openDetailsModal('${ev.id}')">
                Inspect Agenda
              </button>
              <button class="btn-card-primary" ${remainingSeats <= 0 ? 'disabled' : ''} onclick="window.NexusHub.openBookingModal('${ev.id}')">
                ${remainingSeats <= 0 ? 'Sold Out' : 'Book Pass'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach 3D tilt interaction to rendered cards
    const cards = gridContainer.querySelectorAll(".event-card");
    cards.forEach((card) => apply3DTilt(card, 10));
  }

  // ---------------------------------------------------------------------------
  // EVENT DETAILS MODAL
  // ---------------------------------------------------------------------------
  function openDetailsModal(eventId) {
    const ev = state.events.find(e => e.id === eventId);
    if (!ev) return;

    const overlay = document.getElementById("details-modal-overlay");
    const container = document.getElementById("details-modal-content");
    if (!overlay || !container) return;

    const remainingSeats = ev.totalSeats - ev.bookedSeats;

    container.innerHTML = `
      <div class="details-modal-hero">
        <img src="${escapeHTML(ev.image)}" alt="${escapeHTML(ev.title)}">
        <div class="details-hero-overlay"></div>
        <div class="details-hero-content">
          <span class="card-category-badge badge-tech" style="position: static; margin-bottom: 0.5rem; display: inline-block;">${escapeHTML(ev.category)}</span>
          <h2 style="font-size: 1.6rem; color: #fff;">${escapeHTML(ev.title)}</h2>
          <p style="color: rgba(255,255,255,0.8); font-size: 0.88rem;">${escapeHTML(ev.tagline)}</p>
        </div>
      </div>

      <div class="details-body">
        <div class="details-meta-grid">
          <div class="details-meta-cell">
            <span class="details-meta-label">Schedule</span>
            <span class="details-meta-val">${escapeHTML(ev.date)} &bull; ${escapeHTML(ev.time)}</span>
          </div>
          <div class="details-meta-cell">
            <span class="details-meta-label">Official Venue</span>
            <span class="details-meta-val">${escapeHTML(ev.venue)}</span>
          </div>
          <div class="details-meta-cell">
            <span class="details-meta-label">Seat Availability</span>
            <span class="details-meta-val" style="color: var(--accent-cyan);">${remainingSeats} Available / ${ev.totalSeats} Total</span>
          </div>
        </div>

        <h4 class="details-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          Executive Synopsis
        </h4>
        <p style="font-size: 0.92rem; line-height: 1.65; margin-bottom: 1.5rem;">${escapeHTML(ev.longDescription)}</p>

        <h4 class="details-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Chronological Program Agenda
        </h4>
        <div class="agenda-timeline">
          ${ev.agenda.map(item => `
            <div class="agenda-item">
              <div class="agenda-bullet"></div>
              <div class="agenda-time">${escapeHTML(item.time)}</div>
              <div class="agenda-item-title">${escapeHTML(item.title)}</div>
              <div class="agenda-desc">${escapeHTML(item.description)}</div>
            </div>
          `).join("")}
        </div>

        ${ev.speakers && ev.speakers.length > 0 ? `
          <h4 class="details-section-title" style="margin-top: 2rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Keynote Speakers & Jury Panel
          </h4>
          <div class="speakers-grid">
            ${ev.speakers.map(sp => `
              <div class="speaker-card">
                <img class="speaker-avatar" src="${escapeHTML(sp.avatar)}" alt="${escapeHTML(sp.name)}">
                <div>
                  <div class="speaker-name">${escapeHTML(sp.name)}</div>
                  <div class="speaker-role">${escapeHTML(sp.role)}</div>
                </div>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </div>

      <div class="details-footer">
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">Organized by:</span>
          <span style="font-size: 0.88rem; font-weight: 600;">${escapeHTML(ev.organizer)}</span>
        </div>
        <button class="btn-primary" ${remainingSeats <= 0 ? 'disabled' : ''} onclick="window.NexusHub.closeModal('details-modal-overlay'); window.NexusHub.openBookingModal('${ev.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          ${remainingSeats <= 0 ? 'Sold Out' : 'Book Your Spot'}
        </button>
      </div>
    `;

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // ---------------------------------------------------------------------------
  // REGISTRATION MODAL & RIGOROUS INLINE VALIDATION
  // ---------------------------------------------------------------------------
  function populateEventSelect(preselectedId = null) {
    const selectEl = document.getElementById("reg-event-select");
    if (!selectEl) return;

    selectEl.innerHTML = `
      <option value="" disabled ${!preselectedId ? 'selected' : ''}>-- Select an Event to Reserve --</option>
      ${state.events.map(ev => {
        const remaining = ev.totalSeats - ev.bookedSeats;
        const isSelected = ev.id === preselectedId ? "selected" : "";
        const isSoldOut = remaining <= 0 ? "disabled" : "";
        return `<option value="${ev.id}" ${isSelected} ${isSoldOut}>${escapeHTML(ev.title)} (${remaining > 0 ? `${remaining} spots` : 'SOLD OUT'})</option>`;
      }).join("")}
    `;
  }

  function openBookingModal(eventId = null) {
    const overlay = document.getElementById("booking-modal-overlay");
    if (!overlay) return;

    populateEventSelect(eventId);
    resetFormErrors();
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function resetFormErrors() {
    const form = document.getElementById("registration-form");
    if (!form) return;
    const inputs = form.querySelectorAll(".form-input, .form-select");
    inputs.forEach(i => {
      i.classList.remove("is-valid", "is-invalid");
    });
    const feedbacks = form.querySelectorAll(".form-feedback");
    feedbacks.forEach(f => {
      f.textContent = "";
      f.classList.remove("is-error", "is-success");
    });
  }

  // Validation Rules
  const VALIDATION_RULES = {
    fullName: {
      regex: /^[A-Za-z\s]{3,50}$/,
      errorMessage: "Full name must be at least 3 letters (alphabetic characters only)."
    },
    email: {
      regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      errorMessage: "Please enter a valid academic/personal email address."
    },
    phone: {
      regex: /^\d{10}$/,
      errorMessage: "Phone number must be exactly 10 numeric digits."
    },
    rollNo: {
      regex: /^[A-Za-z0-9\-_]{4,20}$/,
      errorMessage: "Institutional ID must be 4-20 alphanumeric characters."
    }
  };

  function validateField(inputEl) {
    const fieldName = inputEl.name;
    const value = inputEl.value.trim();
    const feedbackEl = document.getElementById(`feedback-${fieldName}`);
    const rule = VALIDATION_RULES[fieldName];

    if (!rule) {
      if (inputEl.type === "checkbox") {
        if (!inputEl.checked) {
          if (feedbackEl) {
            feedbackEl.textContent = "You must agree to the Code of Conduct.";
            feedbackEl.className = "form-feedback is-error";
          }
          return false;
        } else {
          if (feedbackEl) feedbackEl.textContent = "";
          return true;
        }
      }

      if (fieldName === "eventId" || fieldName === "attendeeRole") {
        if (!value) {
          inputEl.classList.add("is-invalid");
          inputEl.classList.remove("is-valid");
          if (feedbackEl) {
            feedbackEl.textContent = "Please make a valid selection.";
            feedbackEl.className = "form-feedback is-error";
          }
          return false;
        } else {
          inputEl.classList.add("is-valid");
          inputEl.classList.remove("is-invalid");
          if (feedbackEl) feedbackEl.textContent = "";
          return true;
        }
      }
      return true;
    }

    if (!rule.regex.test(value)) {
      inputEl.classList.add("is-invalid");
      inputEl.classList.remove("is-valid");
      if (feedbackEl) {
        feedbackEl.textContent = rule.errorMessage;
        feedbackEl.className = "form-feedback is-error";
      }
      return false;
    } else {
      inputEl.classList.remove("is-invalid");
      inputEl.classList.add("is-valid");
      if (feedbackEl) {
        feedbackEl.textContent = "Looks good!";
        feedbackEl.className = "form-feedback is-success";
      }
      return true;
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const inputs = [
      form.elements["fullName"],
      form.elements["email"],
      form.elements["phone"],
      form.elements["eventId"],
      form.elements["attendeeRole"],
      form.elements["rollNo"],
      form.elements["agreeTerms"]
    ];

    let isFormValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      showToast("Please correct the highlighted validation errors.", "error");
      return;
    }

    const eventId = form.elements["eventId"].value;
    const email = form.elements["email"].value.trim().toLowerCase();
    const fullName = form.elements["fullName"].value.trim();
    const phone = form.elements["phone"].value.trim();
    const role = form.elements["attendeeRole"].value;
    const rollNo = form.elements["rollNo"].value.trim().toUpperCase();

    // 1. Duplicate Booking Check
    const hasAlreadyBooked = state.passes.some(
      pass => pass.eventId === eventId && pass.email.toLowerCase() === email
    );

    if (hasAlreadyBooked) {
      showToast("Duplicate Booking: You have already reserved a boarding pass for this event with this email.", "error");
      const emailFeedback = document.getElementById("feedback-email");
      const emailInput = form.elements["email"];
      emailInput.classList.add("is-invalid");
      if (emailFeedback) {
        emailFeedback.textContent = "A pass has already been issued to this email for this event.";
        emailFeedback.className = "form-feedback is-error";
      }
      return;
    }

    // 2. Capacity Check
    const targetEvent = state.events.find(ev => ev.id === eventId);
    if (!targetEvent || targetEvent.bookedSeats >= targetEvent.totalSeats) {
      showToast("Unfortunately, this event has reached maximum capacity.", "error");
      return;
    }

    // 3. Issue Booking & Decrement Seat
    targetEvent.bookedSeats += 1;
    saveEventsToStorage(false);

    const ticketId = `NH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPass = {
      id: ticketId,
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      eventDate: targetEvent.date,
      eventTime: targetEvent.time,
      venue: targetEvent.venue,
      fullName: fullName,
      email: email,
      phone: phone,
      role: role,
      rollNo: rollNo,
      issuedAt: new Date().toISOString()
    };

    state.passes.unshift(newPass);
    savePassesToStorage(false);

    // Broadcast booking action to all paired devices
    broadcastSyncAction("BOOK_PASS", { pass: newPass, eventId: targetEvent.id });

    // Close booking modal and reset
    closeModal("booking-modal-overlay");
    form.reset();
    resetFormErrors();

    // Re-render
    renderSpotlightBanner();
    renderEvents();

    // Trigger celebration & Display Boarding Pass
    triggerConfetti();
    showToast("Registration Confirmed! Boarding Pass Generated.", "success");
    openBoardingPassModal(newPass);
  }

  // ---------------------------------------------------------------------------
  // AUTHENTIC PURE VANILLA JS 2D QR CODE GENERATOR (HTML5 CANVAS)
  // Generates genuine scannable QR Code on HTML5 Canvas with zero dependencies
  // ---------------------------------------------------------------------------
  const QR = (function () {
    // Galois Field GF(256) tables with primitive polynomial 0x11d (285)
    const EXP = new Uint8Array(512);
    const LOG = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      EXP[i + 255] = x;
      LOG[x] = i;
      x = (x << 1) ^ (x & 128 ? 285 : 0);
    }

    function gmul(a, b) {
      if (a === 0 || b === 0) return 0;
      return EXP[LOG[a] + LOG[b]];
    }

    function rsGeneratorPoly(degree) {
      let poly = [1];
      for (let i = 0; i < degree; i++) {
        let next = new Array(poly.length + 1).fill(0);
        let factor = EXP[i];
        for (let j = 0; j < poly.length; j++) {
          next[j] ^= gmul(poly[j], factor);
          next[j + 1] ^= poly[j];
        }
        poly = next;
      }
      return poly;
    }

    function rsComputeECC(data, eccLength) {
      const gen = rsGeneratorPoly(eccLength);
      const res = new Uint8Array(eccLength);
      for (let i = 0; i < data.length; i++) {
        const coef = data[i] ^ res[0];
        for (let j = 0; j < eccLength - 1; j++) {
          res[j] = res[j + 1] ^ gmul(gen[j + 1], coef);
        }
        res[eccLength - 1] = gmul(gen[eccLength], coef);
      }
      return res;
    }

    function encodeDataBytes(text) {
      const utf8 = new TextEncoder().encode(text);
      const bitBuffer = [];

      function writeBits(val, len) {
        for (let i = len - 1; i >= 0; i--) {
          bitBuffer.push((val >> i) & 1);
        }
      }

      // Mode: Byte (0100)
      writeBits(4, 4);
      // Character count indicator for Version 1-9 byte mode: 8 bits
      const len = Math.min(utf8.length, 42);
      writeBits(len, 8);

      for (let i = 0; i < len; i++) {
        writeBits(utf8[i], 8);
      }

      // Terminator
      const dataCapacityBits = 44 * 8; // 352 bits
      const termLen = Math.min(4, dataCapacityBits - bitBuffer.length);
      writeBits(0, termLen);

      // Pad to nearest byte
      while (bitBuffer.length % 8 !== 0) {
        bitBuffer.push(0);
      }

      // Convert to bytes
      const dataBytes = [];
      for (let i = 0; i < bitBuffer.length; i += 8) {
        let b = 0;
        for (let j = 0; j < 8; j++) {
          b = (b << 1) | bitBuffer[i + j];
        }
        dataBytes.push(b);
      }

      // Fill with pad bytes (0xEC, 0x11)
      const padBytes = [0xEC, 0x11];
      let padIdx = 0;
      while (dataBytes.length < 44) {
        dataBytes.push(padBytes[padIdx]);
        padIdx = (padIdx + 1) % 2;
      }

      const eccBytes = rsComputeECC(dataBytes, 26);
      return { dataBytes, eccBytes };
    }

    function createMatrix(version = 3) {
      const size = 17 + 4 * version; // 29 for ver 3
      const matrix = Array.from({ length: size }, () => Array(size).fill(null));
      const reserved = Array.from({ length: size }, () => Array(size).fill(false));

      function setModule(r, c, val) {
        matrix[r][c] = val;
        reserved[r][c] = true;
      }

      // 1. Finder patterns (7x7) + Separator
      function addFinder(startR, startC) {
        for (let r = -1; r <= 7; r++) {
          for (let c = -1; c <= 7; c++) {
            const row = startR + r;
            const col = startC + c;
            if (row >= 0 && row < size && col >= 0 && col < size) {
              const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
              const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
              setModule(row, col, isBorder || isCore ? 1 : 0);
            }
          }
        }
      }

      addFinder(0, 0);
      addFinder(0, size - 7);
      addFinder(size - 7, 0);

      // 2. Alignment pattern
      const alignPos = 22;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
          const isCenter = r === 0 && c === 0;
          setModule(alignPos + r, alignPos + c, isOuter || isCenter ? 1 : 0);
        }
      }

      // 3. Timing patterns
      for (let i = 8; i < size - 8; i++) {
        if (!reserved[6][i]) setModule(6, i, i % 2 === 0 ? 1 : 0);
        if (!reserved[i][6]) setModule(i, 6, i % 2 === 0 ? 1 : 0);
      }

      // 4. Dark Module
      setModule(4 * version + 9, 8, 1);

      // 5. Reserve format info areas
      for (let i = 0; i < 9; i++) {
        if (!reserved[8][i]) reserved[8][i] = true;
        if (!reserved[i][8]) reserved[i][8] = true;
      }
      for (let i = size - 8; i < size; i++) {
        if (!reserved[8][i]) reserved[8][i] = true;
        if (!reserved[i][8]) reserved[i][8] = true;
      }

      return { size, matrix, reserved };
    }

    function placeCodewords(matrixObj, allBytes) {
      const { size, matrix, reserved } = matrixObj;
      const bits = [];
      allBytes.forEach(b => {
        for (let i = 7; i >= 0; i--) {
          bits.push((b >> i) & 1);
        }
      });

      let bitIdx = 0;
      let upward = true;

      for (let right = size - 1; right > 0; right -= 2) {
        if (right === 6) right--;
        const rows = [];
        for (let r = 0; r < size; r++) rows.push(upward ? size - 1 - r : r);

        for (const row of rows) {
          for (let colOffset = 0; colOffset < 2; colOffset++) {
            const col = right - colOffset;
            if (!reserved[row][col]) {
              const bit = bitIdx < bits.length ? bits[bitIdx++] : 0;
              const mask = (row + col) % 2 === 0;
              matrix[row][col] = mask ? bit ^ 1 : bit;
            }
          }
        }
        upward = !upward;
      }

      // Format information
      const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
      const tlPositions = [
        [8,0], [8,1], [8,2], [8,3], [8,4], [8,5], [8,7], [8,8],
        [7,8], [5,8], [4,8], [3,8], [2,8], [1,8], [0,8]
      ];
      tlPositions.forEach(([r, c], idx) => {
        matrix[r][c] = formatBits[idx];
      });

      for (let i = 0; i < 7; i++) {
        matrix[size - 1 - i][8] = formatBits[i];
      }
      for (let i = 0; i < 8; i++) {
        matrix[8][size - 8 + i] = formatBits[7 + i];
      }
    }

    function drawToCanvas(canvas, text, cellSize = 5) {
      const { dataBytes, eccBytes } = encodeDataBytes(text);
      const allBytes = [...dataBytes, ...eccBytes];
      const matObj = createMatrix(3);
      placeCodewords(matObj, allBytes);

      const { size, matrix } = matObj;
      const quietZone = 2;
      const canvasSize = (size + quietZone * 2) * cellSize;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      ctx.fillStyle = "#070913";
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c] === 1) {
            ctx.fillRect((c + quietZone) * cellSize, (r + quietZone) * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    return { drawToCanvas };
  })();

  // ---------------------------------------------------------------------------
  // DIGITAL BOARDING PASS MODAL
  // ---------------------------------------------------------------------------
  function openBoardingPassModal(pass) {
    const overlay = document.getElementById("pass-modal-overlay");
    const container = document.getElementById("pass-modal-content");
    if (!overlay || !container) return;

    container.innerHTML = `
      <div class="boarding-pass-ticket" id="printable-boarding-pass">
        <div class="ticket-header">
          <div>
            <div class="ticket-brand">NEXUSHUB AIR-PASS</div>
            <div style="font-size: 0.75rem; opacity: 0.9;">OFFICIAL EVENT ENTRANCE ADMITTANCE</div>
          </div>
          <div class="ticket-status-pill">VERIFIED PASS</div>
        </div>

        <div class="ticket-body">
          <h2 class="ticket-event-name">${escapeHTML(pass.eventTitle)}</h2>

          <div class="ticket-details-grid">
            <div>
              <div class="ticket-cell-label">Attendee Name</div>
              <div class="ticket-cell-val">${escapeHTML(pass.fullName)}</div>
            </div>
            <div>
              <div class="ticket-cell-label">Institutional ID</div>
              <div class="ticket-cell-val">${escapeHTML(pass.rollNo)}</div>
            </div>
            <div>
              <div class="ticket-cell-label">Admittance Date & Time</div>
              <div class="ticket-cell-val">${escapeHTML(pass.eventDate)} &bull; ${escapeHTML(pass.eventTime)}</div>
            </div>
            <div>
              <div class="ticket-cell-label">Attendee Classification</div>
              <div class="ticket-cell-val">${escapeHTML(pass.role)}</div>
            </div>
            <div style="grid-column: 1 / -1;">
              <div class="ticket-cell-label">Designated Venue</div>
              <div class="ticket-cell-val">${escapeHTML(pass.venue)}</div>
            </div>
          </div>

          <div class="ticket-perforation">
            <div class="perforation-circle-left"></div>
            <div class="perforation-line"></div>
            <div class="perforation-circle-right"></div>
          </div>

          <div class="ticket-qr-section">
            <div class="ticket-barcode-meta">
              <span class="ticket-cell-label">Electronic Ticket Identifier</span>
              <span class="ticket-ref-code">${escapeHTML(pass.id)}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Scan at campus security turnstiles for fast entry.</span>
            </div>
            <div class="ticket-qr-container">
              <canvas id="ticket-canvas-qr"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="ticket-actions-bar">
        <button class="btn-print-pass" onclick="window.NexusHub.printPass()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print / Save Pass (PDF)
        </button>
        <button class="btn-secondary" style="border-radius: var(--radius-full); padding: 0.8rem 1.5rem;" onclick="window.NexusHub.closeModal('pass-modal-overlay')">
          Close
        </button>
      </div>
    `;

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Draw real QR Code onto the canvas
    const canvas = document.getElementById("ticket-canvas-qr");
    if (canvas) {
      const qrPayload = `NEXUSHUB:${pass.id}:${pass.rollNo}:${pass.fullName}:${pass.eventId}`;
      QR.drawToCanvas(canvas, qrPayload, 4);
    }
  }

  function printPass() {
    window.print();
  }

  // ---------------------------------------------------------------------------
  // "MY PASSES" SLIDE-OUT DRAWER
  // ---------------------------------------------------------------------------
  function updatePassesBadge() {
    const badgeEl = document.getElementById("passes-badge-count");
    if (badgeEl) {
      badgeEl.textContent = state.passes.length;
    }
  }

  function openPassesDrawer() {
    const overlay = document.getElementById("passes-drawer-overlay");
    if (!overlay) return;
    renderPassesList();
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closePassesDrawer() {
    const overlay = document.getElementById("passes-drawer-overlay");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function renderPassesList(search = "") {
    const listEl = document.getElementById("drawer-passes-list");
    if (!listEl) return;

    let filtered = state.passes;
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      filtered = state.passes.filter(p => 
        p.id.toLowerCase().includes(q) ||
        p.eventTitle.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; opacity: 0.5;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          <p style="font-weight: 600; font-size: 0.95rem;">${search.trim() ? "No matching passes found" : "No Booked Passes Yet"}</p>
          <p style="font-size: 0.8rem; margin-top: 0.35rem;">Explore campus events and reserve your digital boarding pass.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(pass => `
      <div class="booked-pass-card" data-pass-id="${pass.id}">
        <div class="booked-pass-header">
          <span class="booked-ticket-code">${escapeHTML(pass.id)}</span>
          <span style="font-size: 0.72rem; color: var(--accent-emerald); font-weight: 700;">CONFIRMED</span>
        </div>
        <h4 class="booked-event-title">${escapeHTML(pass.eventTitle)}</h4>
        <div class="booked-meta">
          <span><strong>Attendee:</strong> ${escapeHTML(pass.fullName)} (${escapeHTML(pass.rollNo)})</span>
          <span><strong>Date:</strong> ${escapeHTML(pass.eventDate)}</span>
          <span><strong>Venue:</strong> ${escapeHTML(pass.venue.split(",")[0])}</span>
        </div>
        <div class="booked-card-actions">
          <button class="btn-pass-view" onclick="window.NexusHub.viewSpecificPass('${pass.id}')">
            View / Print Pass
          </button>
          <button class="btn-pass-cancel" onclick="window.NexusHub.cancelPass('${pass.id}')">
            Cancel
          </button>
        </div>
      </div>
    `).join("");
  }

  function viewSpecificPass(passId) {
    const pass = state.passes.find(p => p.id === passId);
    if (!pass) return;
    closePassesDrawer();
    openBoardingPassModal(pass);
  }

  function cancelPass(passId) {
    const passIndex = state.passes.findIndex(p => p.id === passId);
    if (passIndex === -1) return;

    const pass = state.passes[passIndex];
    const confirmed = window.confirm(`Are you certain you wish to cancel your pass ${pass.id} for "${pass.eventTitle}"? Your seat will be restored to the public pool.`);
    if (!confirmed) return;

    // Restore seat in event
    const ev = state.events.find(e => e.id === pass.eventId);
    if (ev && ev.bookedSeats > 0) {
      ev.bookedSeats -= 1;
      saveEventsToStorage(false);
    }

    state.passes.splice(passIndex, 1);
    savePassesToStorage(false);

    // Broadcast cancellation to all devices in the room
    broadcastSyncAction("CANCEL_PASS", { passId: passId, eventId: pass.eventId });

    renderPassesList();
    renderSpotlightBanner();
    renderEvents();
    showToast(`Pass ${passId} cancelled. 1 seat restored.`, "info");
  }

  // ---------------------------------------------------------------------------
  // CONFETTI CELEBRATION ENGINE (PURE CANVAS PARTICLES)
  // ---------------------------------------------------------------------------
  function triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    const particles = [];
    const colors = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ffffff"];
    const particleCount = 140;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - 50,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.7) * 22,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        decay: Math.random() * 0.012 + 0.008
      });
    }

    let animationFrame;
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      particles.forEach(p => {
        if (p.alpha > 0) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.45; // gravity
          p.vx *= 0.98; // air resistance
          p.rotation += p.rotationSpeed;
          p.alpha -= p.decay;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();

          activeCount++;
        }
      });

      if (activeCount > 0) {
        animationFrame = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    requestAnimationFrame(renderConfetti);
  }

  // ---------------------------------------------------------------------------
  // MODAL CONTROLS & EVENT LISTENERS
  // ---------------------------------------------------------------------------
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
    }
    const activeModals = document.querySelectorAll(".modal-overlay.active, .passes-drawer-overlay.active");
    if (activeModals.length === 0) {
      document.body.style.overflow = "";
    }
  }

  function resetFilters() {
    state.selectedCategory = "All";
    state.searchQuery = "";
    state.sortBy = "date";

    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) sortSelect.value = "date";

    const pills = document.querySelectorAll(".btn-pill");
    pills.forEach(p => {
      p.classList.toggle("active", p.getAttribute("data-category") === "All");
    });

    renderEvents();
  }

  function setupEventListeners() {
    // 1. Theme toggle
    const themeBtn = document.getElementById("btn-theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    // 2. Passes Drawer Toggle
    const passesBtn = document.getElementById("btn-my-passes");
    if (passesBtn) passesBtn.addEventListener("click", openPassesDrawer);

    const closeDrawerBtn = document.getElementById("btn-close-drawer");
    if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closePassesDrawer);

    const drawerOverlay = document.getElementById("passes-drawer-overlay");
    if (drawerOverlay) {
      drawerOverlay.addEventListener("click", (e) => {
        if (e.target === drawerOverlay) closePassesDrawer();
      });
    }

    const drawerSearch = document.getElementById("drawer-search-input");
    if (drawerSearch) {
      drawerSearch.addEventListener("input", (e) => {
        renderPassesList(e.target.value);
      });
    }

    // 3. Category Pills
    const pills = document.querySelectorAll(".btn-pill");
    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        state.selectedCategory = pill.getAttribute("data-category");
        renderEvents();
      });
    });

    // 4. Live Search Input
    const searchInput = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("btn-clear-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = state.searchQuery ? "block" : "none";
        }
        renderEvents();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        state.searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderEvents();
      });
    }

    // Hotkey: Ctrl+K or '/' to focus search
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")) {
        e.preventDefault();
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
          const controlsSection = document.getElementById("controls-section");
          if (controlsSection) {
            controlsSection.scrollIntoView({ behavior: "smooth" });
          }
          setTimeout(() => searchInput.focus(), 300);
        }
      }
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
        closePassesDrawer();
        document.body.style.overflow = "";
      }
    });

    // 5. Quick search navbar trigger
    const navSearchTrigger = document.getElementById("nav-search-trigger");
    if (navSearchTrigger) {
      navSearchTrigger.addEventListener("click", () => {
        const searchInput = document.getElementById("search-input");
        const controlsSection = document.getElementById("controls-section");
        if (controlsSection) controlsSection.scrollIntoView({ behavior: "smooth" });
        if (searchInput) setTimeout(() => searchInput.focus(), 300);
      });
    }

    // 6. Sorting dropdown
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        renderEvents();
      });
    }

    // 7. View Switcher (Grid vs List)
    const btnGridView = document.getElementById("btn-view-grid");
    const btnListView = document.getElementById("btn-view-list");
    const eventsGrid = document.getElementById("events-grid");

    if (btnGridView && btnListView && eventsGrid) {
      btnGridView.addEventListener("click", () => {
        btnGridView.classList.add("active");
        btnListView.classList.remove("active");
        state.viewMode = "grid";
        eventsGrid.classList.remove("list-view");
      });

      btnListView.addEventListener("click", () => {
        btnListView.classList.add("active");
        btnGridView.classList.remove("active");
        state.viewMode = "list";
        eventsGrid.classList.add("list-view");
      });
    }

    // 8. Form Validation & Submission
    const regForm = document.getElementById("registration-form");
    if (regForm) {
      regForm.addEventListener("submit", handleFormSubmit);

      const formInputs = regForm.querySelectorAll(".form-input, .form-select");
      formInputs.forEach(input => {
        input.addEventListener("input", () => validateField(input));
        input.addEventListener("blur", () => validateField(input));
      });

      const termsCheck = document.getElementById("reg-agree-terms");
      if (termsCheck) {
        termsCheck.addEventListener("change", () => validateField(termsCheck));
      }
    }

    // 9. Overlay click-to-close on modals
    const modalOverlays = document.querySelectorAll(".modal-overlay");
    modalOverlays.forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
          document.body.style.overflow = "";
        }
      });
    });

    // 10. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById("btn-mobile-menu");
    const mobileDrawer = document.getElementById("mobile-nav-drawer");
    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileDrawer.classList.toggle("active");
      });
      mobileDrawer.querySelectorAll(".mobile-nav-link").forEach(link => {
        link.addEventListener("click", () => {
          mobileDrawer.classList.remove("active");
        });
      });
    }

    // 11. 3D tilt on hero floating card
    const heroCard = document.querySelector(".hero-3d-card");
    if (heroCard) apply3DTilt(heroCard, 14);

    // 12. Navbar Scroll Glass Elevation
    window.addEventListener("scroll", () => {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        if (window.scrollY > 20) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }
    });

    // 13. Sync modal and controls event listeners
    const btnSyncAction = document.getElementById("btn-sync-action");
    const syncStatusIndicator = document.getElementById("sync-status-indicator");
    if (btnSyncAction) {
      btnSyncAction.addEventListener("click", () => {
        openModal("sync-modal-overlay");
      });
    }
    if (syncStatusIndicator) {
      syncStatusIndicator.addEventListener("click", () => {
        openModal("sync-modal-overlay");
      });
    }

    const btnSaveRoom = document.getElementById("btn-save-room");
    const syncRoomInput = document.getElementById("sync-room-input");
    if (btnSaveRoom && syncRoomInput) {
      btnSaveRoom.addEventListener("click", () => {
        changeSyncRoom(syncRoomInput.value);
      });
      syncRoomInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          changeSyncRoom(syncRoomInput.value);
        }
      });
    }

    const btnCopySyncLink = document.getElementById("btn-copy-sync-link");
    const syncLinkInput = document.getElementById("sync-shareable-link-input");
    if (btnCopySyncLink && syncLinkInput) {
      btnCopySyncLink.addEventListener("click", () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(syncLinkInput.value).then(() => {
            showToast("Pairing link copied to clipboard! Open on your other device.", "success");
          }).catch(() => {
            syncLinkInput.select();
            document.execCommand("copy");
            showToast("Pairing link copied!", "success");
          });
        } else {
          syncLinkInput.select();
          document.execCommand("copy");
          showToast("Pairing link copied!", "success");
        }
      });
    }

    const btnForceSync = document.getElementById("btn-force-sync");
    if (btnForceSync) {
      btnForceSync.addEventListener("click", () => {
        fetchMissedHistory(true);
      });
    }

    const btnDrawerForceSync = document.getElementById("btn-drawer-force-sync");
    if (btnDrawerForceSync) {
      btnDrawerForceSync.addEventListener("click", () => {
        fetchMissedHistory(true);
      });
    }

    const btnExportBackup = document.getElementById("btn-export-backup");
    const btnDrawerExport = document.getElementById("btn-drawer-export");
    if (btnExportBackup) btnExportBackup.addEventListener("click", exportBackupJSON);
    if (btnDrawerExport) btnDrawerExport.addEventListener("click", exportBackupJSON);

    const syncImportInput = document.getElementById("sync-import-file-input");
    if (syncImportInput) {
      syncImportInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          importBackupJSON(e.target.files[0]);
          e.target.value = "";
        }
      });
    }

    const drawerImportInput = document.getElementById("drawer-import-file-input");
    if (drawerImportInput) {
      drawerImportInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          importBackupJSON(e.target.files[0]);
          e.target.value = "";
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // PUBLIC EXPOSURE TO GLOBAL WINDOW
  // ---------------------------------------------------------------------------
  const NexusHubAPI = {
    openBookingModal,
    openDetailsModal,
    openPassesDrawer,
    closePassesDrawer,
    closeModal,
    openModal,
    viewSpecificPass,
    cancelPass,
    printPass,
    resetFilters,
    exportBackupJSON,
    fetchMissedHistory,
    changeSyncRoom
  };

  window.NexusHub = NexusHubAPI;
  window.K_PULSE = NexusHubAPI; // Backward compatibility alias
  window.NexusHub = NexusHubAPI;

  // ---------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY
  // ---------------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initState();
    setupEventListeners();
    updatePassesBadge();
    renderSpotlightBanner();
    renderEvents();
    startCountdownLoops();
    animateStatsCounter();
    initRealtimeSync();
  });

})();
