/* DayFlow v3 — Themes, Subtasks, Descriptions */

const THEMES = {
    midnight: { name: 'Midnight', emoji: '🌙', accent: '#22c55e', accentBright: '#4ade80', accentDim: 'rgba(34,197,94,0.10)', accentGlow: 'rgba(34,197,94,0.20)', accentDeep: '#15803d', bgPrimary: '#08080d', bgSecondary: '#0f0f16' },
    ocean:    { name: 'Ocean',    emoji: '🌊', accent: '#0ea5e9', accentBright: '#38bdf8', accentDim: 'rgba(14,165,233,0.10)', accentGlow: 'rgba(14,165,233,0.20)', accentDeep: '#0369a1', bgPrimary: '#060d14', bgSecondary: '#0a1520' },
    sunset:   { name: 'Zachód',   emoji: '🌅', accent: '#f97316', accentBright: '#fb923c', accentDim: 'rgba(249,115,22,0.10)', accentGlow: 'rgba(249,115,22,0.20)', accentDeep: '#c2410c', bgPrimary: '#0f0808', bgSecondary: '#1a0e0e' },
    forest:   { name: 'Las',      emoji: '🌲', accent: '#4ade80', accentBright: '#86efac', accentDim: 'rgba(74,222,128,0.10)', accentGlow: 'rgba(74,222,128,0.20)', accentDeep: '#16a34a', bgPrimary: '#060d08', bgSecondary: '#0a150c' },
    lavender: { name: 'Lawenda',  emoji: '💜', accent: '#8b5cf6', accentBright: '#a78bfa', accentDim: 'rgba(139,92,246,0.10)', accentGlow: 'rgba(139,92,246,0.20)', accentDeep: '#6d28d9', bgPrimary: '#0a080f', bgSecondary: '#110e1a' },
    sakura:   { name: 'Sakura',   emoji: '🌸', accent: '#ec4899', accentBright: '#f472b6', accentDim: 'rgba(236,72,153,0.10)', accentGlow: 'rgba(236,72,153,0.20)', accentDeep: '#be185d', bgPrimary: '#0d080a', bgSecondary: '#170e12' },
    mono:     { name: 'Monokai',  emoji: '⚡', accent: '#eab308', accentBright: '#facc15', accentDim: 'rgba(234,179,8,0.10)', accentGlow: 'rgba(234,179,8,0.20)', accentDeep: '#a16207', bgPrimary: '#0a0a08', bgSecondary: '#151512' }
};

const App = {
    tasks: [], history: {}, settings: { dayOffsetHours: 0 }, currentTab: 'today', currentTheme: 'midnight',
    calendarMonth: new Date().getMonth(), calendarYear: new Date().getFullYear(),
    celebrationShown: false, expandedTasks: new Set(), modalSubtasks: [], editingTaskName: null, historyDateKey: null, dom: {},

    init() {
        this.cacheDom(); this.loadData(); this.loadTheme(); this.render(); this.bindEvents(); this.registerSW();
    },

    cacheDom() {
        const $ = id => document.getElementById(id);
        this.dom = {
            headerDate: $('header-date'), streakCount: $('streak-count'), streakBadge: $('streak-badge'),
            progressPercent: $('progress-percent'), progressFill: document.querySelector('.progress-ring-fill'),
            taskList: $('task-list'), emptyState: $('empty-state'), btnAdd: $('btn-add-task'),
            modalOverlay: $('modal-overlay'), modal: $('modal'), taskInput: $('new-task-input'),
            taskDesc: $('new-task-desc'), subtaskInput: $('new-subtask-input'), modalSubtaskList: $('modal-subtask-list'),
            taskStartDate: $('new-task-start-date'), taskEndDate: $('new-task-end-date'),
            btnAddSubtask: $('btn-add-subtask'), btnCancel: $('btn-cancel'), btnConfirm: $('btn-confirm'),
            navBtns: document.querySelectorAll('.nav-btn'),
            tabToday: $('tab-today'), tabCalendar: $('tab-calendar'),
            calendarMonthYear: $('calendar-month-year'), calendarGrid: $('calendar-grid'), calendarStats: $('calendar-stats'),
            btnPrev: $('btn-prev-month'), btnNext: $('btn-next-month'),
            celebration: $('celebration'),
            weekdayPicker: $('weekday-picker'), intervalPicker: $('interval-picker'), intervalDays: $('interval-days'),
            btnTheme: $('btn-theme'), themeOverlay: $('theme-overlay'), themeGrid: $('theme-grid'), btnCloseTheme: $('btn-close-theme'),
            btnSettings: $('btn-settings'), settingsOverlay: $('settings-overlay'), settingDayOffset: $('setting-day-offset'), btnCloseSettings: $('btn-close-settings'),
            historyOverlay: $('history-overlay'), historyDateTitle: $('history-date-title'), historyTaskList: $('history-task-list'), historyEmptyState: $('history-empty-state'), btnCloseHistory: $('btn-close-history')
        };
    },

    // === Data ===
    loadData() {
        try {
            const raw = localStorage.getItem('dayflow-data');
            if (raw) {
                const d = JSON.parse(raw);
                if (d.tasks?.length && typeof d.tasks[0] === 'string') {
                    this.tasks = d.tasks.map(n => ({ name: n, schedule: { type: 'daily' }, description: '', subtasks: [], startDate: '', endDate: '' }));
                } else {
                    this.tasks = (d.tasks || []).map(t => ({ ...t, description: t.description || '', subtasks: t.subtasks || [], startDate: t.startDate || '', endDate: t.endDate || '' }));
                }
                this.history = d.history || {};
                this.settings = d.settings || { dayOffsetHours: 0 };
                if (this.dom.settingDayOffset) this.dom.settingDayOffset.value = this.settings.dayOffsetHours;
                this.saveData();
            } else {
                this.tasks = [
                    { name: 'Rozciąganie', schedule: { type: 'daily' }, description: 'Poranny zestaw rozciągania', subtasks: ['Kręgosłup', 'Hamstringi', 'Barki', 'Biodra', 'Łydki'], startDate: '', endDate: '' },
                    { name: 'Trening', schedule: { type: 'weekdays', days: [1,3,5] }, description: 'Plan siłowy A/B', subtasks: ['Rozgrzewka', 'Ćwiczenia główne', 'Cardio'], startDate: '', endDate: '' },
                    { name: 'Czytanie', schedule: { type: 'daily' }, description: '', subtasks: [], startDate: '', endDate: '' },
                    { name: 'Pij wodę (8 szklanek)', schedule: { type: 'daily' }, description: '', subtasks: [], startDate: '', endDate: '' },
                    { name: 'Medytacja', schedule: { type: 'interval', every: 2, startDate: new Date().toISOString().slice(0,10) }, description: '10 min mindfulness', subtasks: [], startDate: '', endDate: '' }
                ];
                this.history = {}; this.settings = { dayOffsetHours: 0 }; this.saveData();
            }
        } catch(e) { this.tasks = []; this.history = {}; this.settings = { dayOffsetHours: 0 }; }
    },

    saveData() {
        try { localStorage.setItem('dayflow-data', JSON.stringify({ tasks: this.tasks, history: this.history, settings: this.settings })); } catch(e) {}
    },

    // === Dates ===
    getTodayKey() { const d = new Date(); d.setHours(d.getHours() - (this.settings.dayOffsetHours || 0)); return this.dateToKey(d); },
    dateToKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; },
    keyToDate(k) { const [y,m,d] = k.split('-').map(Number); return new Date(y,m-1,d); },
    formatDate(d) {
        const dn = ['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'];
        const mn = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
        return `${dn[d.getDay()]}, ${d.getDate()} ${mn[d.getMonth()]}`;
    },
    getMonthName(m) { return ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'][m]; },
    getDayNameShort(n) { return ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'][n]; },

    // === Schedule ===
    isScheduledForDate(task, dateKey) {
        if (task.startDate && dateKey < task.startDate) return false;
        if (task.endDate && dateKey > task.endDate) return false;
        const s = task.schedule;
        if (!s || s.type === 'daily') return true;
        const date = this.keyToDate(dateKey);
        if (s.type === 'weekdays') return s.days?.includes(date.getDay());
        if (s.type === 'interval') {
            const start = new Date(s.startDate); start.setHours(0,0,0,0); date.setHours(0,0,0,0);
            const diff = Math.round((date - start) / 864e5);
            return diff >= 0 && diff % s.every === 0;
        }
        return true;
    },
    getTasksForDate(dk) { return this.tasks.filter(t => this.isScheduledForDate(t, dk)); },
    getScheduleLabel(task) {
        const s = task.schedule;
        if (!s || s.type === 'daily') return null;
        if (s.type === 'weekdays') {
            const sorted = [...(s.days||[])].sort((a,b) => (a||7) - (b||7));
            return '🗓 ' + sorted.map(d => this.getDayNameShort(d)).join(' ');
        }
        if (s.type === 'interval') return `🔁 co ${s.every} dni`;
        return null;
    },

    // === Task Status ===
    isTaskDone(taskName) {
        const val = this.history[this.getTodayKey()]?.[taskName];
        if (typeof val === 'boolean') return val;
        if (typeof val === 'object' && val) { const v = Object.values(val); return v.length > 0 && v.every(x => x); }
        return false;
    },
    getSubtaskStates(taskName, subtasks) {
        const val = this.history[this.getTodayKey()]?.[taskName];
        const states = {};
        subtasks.forEach(st => { states[st] = (typeof val === 'object' && val) ? val[st] === true : false; });
        return states;
    },
    getDayStatus(dk) {
        const scheduled = this.getTasksForDate(dk);
        if (!scheduled.length) return 'free';
        const dayData = this.history[dk];
        if (!dayData) return 'none';
        let done = 0;
        scheduled.forEach(t => {
            const val = dayData[t.name];
            if (typeof val === 'boolean' && val) done++;
            else if (typeof val === 'object' && val) { const v = Object.values(val); if (v.length && v.every(x => x)) done++; }
        });
        if (done === scheduled.length) return 'completed';
        if (done > 0) return 'partial';
        return 'none';
    },
    calculateStreak() {
        let streak = 0; const today = new Date(); let check = new Date(today);
        const ts = this.getDayStatus(this.getTodayKey());
        if (ts === 'completed') { streak = 1; check.setDate(check.getDate()-1); }
        else { check.setDate(check.getDate()-1); }
        for (let i = 0; i < 365; i++) {
            const s = this.getDayStatus(this.dateToKey(check));
            if (s === 'completed') { streak++; check.setDate(check.getDate()-1); }
            else if (s === 'free') { check.setDate(check.getDate()-1); }
            else break;
        }
        return streak;
    },

    // === Task Actions ===
    toggleTask(taskName) {
        const dk = this.getTodayKey(); if (!this.history[dk]) this.history[dk] = {};
        const task = this.tasks.find(t => t.name === taskName);
        if (task?.subtasks?.length) {
            const isDone = this.isTaskDone(taskName);
            this.history[dk][taskName] = {};
            task.subtasks.forEach(st => { this.history[dk][taskName][st] = !isDone; });
        } else {
            const scheduled = this.getTasksForDate(dk);
            scheduled.forEach(t => { if (!(t.name in this.history[dk])) this.history[dk][t.name] = false; });
            this.history[dk][taskName] = !this.history[dk][taskName];
        }
        this.saveData(); this.renderTasks(); this.updateProgress(); this.updateStreak();
        const status = this.getDayStatus(dk);
        if (status === 'completed' && !this.celebrationShown) { this.celebrationShown = true; this.celebrate(); }
        if (status !== 'completed') this.celebrationShown = false;
    },
    toggleSubtask(taskName, subtaskName) {
        const dk = this.getTodayKey(); if (!this.history[dk]) this.history[dk] = {};
        const task = this.tasks.find(t => t.name === taskName);
        if (typeof this.history[dk][taskName] !== 'object' || !this.history[dk][taskName]) {
            this.history[dk][taskName] = {};
            (task?.subtasks || []).forEach(st => { this.history[dk][taskName][st] = false; });
        }
        this.history[dk][taskName][subtaskName] = !this.history[dk][taskName][subtaskName];
        this.saveData(); this.renderTasks(); this.updateProgress(); this.updateStreak();
        const status = this.getDayStatus(dk);
        if (status === 'completed' && !this.celebrationShown) { this.celebrationShown = true; this.celebrate(); }
        if (status !== 'completed') this.celebrationShown = false;
    },
    saveTask(oldName, name, schedule, description, subtasks, startDate, endDate) {
        const trimmed = name.trim(); if (!trimmed) return false;
        if (oldName !== trimmed && this.tasks.some(t => t.name === trimmed)) return false;
        let task;
        if (oldName) {
            task = this.tasks.find(t => t.name === oldName);
            if (!task) return false;
            if (oldName !== trimmed) {
                Object.keys(this.history).forEach(dk => {
                    if (this.history[dk] && oldName in this.history[dk]) {
                        this.history[dk][trimmed] = this.history[dk][oldName];
                        delete this.history[dk][oldName];
                    }
                });
            }
            task.name = trimmed; task.schedule = schedule || { type: 'daily' };
            task.description = description || ''; task.subtasks = subtasks || [];
            task.startDate = startDate || ''; task.endDate = endDate || '';
        } else {
            task = { name: trimmed, schedule: schedule || { type: 'daily' }, description: description || '', subtasks: subtasks || [], startDate: startDate || '', endDate: endDate || '' };
            this.tasks.push(task);
        }
        const dk = this.getTodayKey();
        if (this.isScheduledForDate(task, dk)) {
            if (!this.history[dk]) this.history[dk] = {};
            if (!(trimmed in this.history[dk])) {
                this.history[dk][trimmed] = subtasks?.length ? (() => { const o = {}; subtasks.forEach(s => o[s]=false); return o; })() : false;
            }
        }
        this.saveData(); this.renderTasks(); this.updateProgress(); return true;
    },
    removeTask(taskName) {
        this.tasks = this.tasks.filter(t => t.name !== taskName);
        const dk = this.getTodayKey(); if (this.history[dk]) delete this.history[dk][taskName];
        this.expandedTasks.delete(taskName);
        this.saveData(); this.renderTasks(); this.updateProgress(); this.updateStreak();
    },

    openHistoryModal(dateKey) {
        this.historyDateKey = dateKey;
        this.dom.historyDateTitle.textContent = this.formatDate(this.keyToDate(dateKey));
        this.renderHistoryTasks();
        this.dom.historyOverlay.classList.add('visible');
    },
    closeHistoryModal() {
        this.dom.historyOverlay.classList.remove('visible');
        this.historyDateKey = null;
        this.renderCalendar();
    },
    renderHistoryTasks() {
        const dk = this.historyDateKey;
        const list = this.dom.historyTaskList; list.innerHTML = '';
        const scheduledTasks = this.getTasksForDate(dk);
        if (!scheduledTasks.length) { this.dom.historyEmptyState.style.display = 'block'; this.dom.historyEmptyState.innerHTML = '<p>Brak zadań w tym dniu.</p>'; return; }
        this.dom.historyEmptyState.style.display = 'none';
        scheduledTasks.forEach((task) => {
            const val = this.history[dk]?.[task.name];
            let isDone = false;
            if (typeof val === 'boolean') isDone = val;
            if (typeof val === 'object' && val) { const v = Object.values(val); isDone = v.length > 0 && v.every(x => x); }
            const hasSub = task.subtasks?.length > 0;
            const li = document.createElement('li');
            li.className = `task-item${isDone ? ' completed' : ''}${hasSub ? ' has-subtasks' : ''}`;
            const descH = task.description ? `<span class="task-description">${this.esc(task.description)}</span>` : '';
            let progH = '', subH = '';
            if (hasSub) {
                const st = {}; task.subtasks.forEach(s => st[s] = (val && typeof val === 'object' && val[s]) ? true : false);
                const dn = Object.values(st).filter(v=>v).length;
                progH = `<span class="subtask-progress">${dn}/${task.subtasks.length}</span>`;
                subH = `<div class="subtask-list" style="max-height: 500px; opacity: 1;"><div class="subtask-list-inner">${task.subtasks.map(s => {
                    const sd = st[s];
                    return `<div class="subtask-item${sd?' done':''}"><label class="subtask-checkbox"><input type="checkbox" ${sd?'checked':''} data-task="${this.esc(task.name)}" data-subtask="${this.esc(s)}" data-history="true"><span class="subtask-checkmark"><svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/></svg></span></label><span class="subtask-name">${this.esc(s)}</span></div>`;
                }).join('')}</div></div>`;
            }
            li.innerHTML = `<div class="task-main"><label class="task-checkbox"><input type="checkbox" ${isDone?'checked':''} data-task="${this.esc(task.name)}" data-history="true"><span class="checkmark"><svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg></span></label><div class="task-info"><div class="task-name-row"><span class="task-name">${this.esc(task.name)}</span>${progH}</div>${descH}</div></div>${subH}`;
            list.appendChild(li);
        });
    },
    toggleHistoryTask(taskName) {
        const dk = this.historyDateKey; if (!this.history[dk]) this.history[dk] = {};
        const task = this.tasks.find(t => t.name === taskName);
        if (task?.subtasks?.length) {
            const val = this.history[dk][taskName];
            let isDone = false; if (typeof val === 'object' && val) { const v = Object.values(val); isDone = v.length > 0 && v.every(x => x); }
            this.history[dk][taskName] = {};
            task.subtasks.forEach(st => { this.history[dk][taskName][st] = !isDone; });
        } else {
            const scheduled = this.getTasksForDate(dk);
            scheduled.forEach(t => { if (!(t.name in this.history[dk])) this.history[dk][t.name] = false; });
            this.history[dk][taskName] = !this.history[dk][taskName];
        }
        this.saveData(); this.renderHistoryTasks(); 
        if (dk === this.getTodayKey()) { this.renderTasks(); this.updateProgress(); this.updateStreak(); }
    },
    toggleHistorySubtask(taskName, subtaskName) {
        const dk = this.historyDateKey; if (!this.history[dk]) this.history[dk] = {};
        const task = this.tasks.find(t => t.name === taskName);
        if (typeof this.history[dk][taskName] !== 'object' || !this.history[dk][taskName]) {
            this.history[dk][taskName] = {};
            (task?.subtasks || []).forEach(st => { this.history[dk][taskName][st] = false; });
        }
        this.history[dk][taskName][subtaskName] = !this.history[dk][taskName][subtaskName];
        this.saveData(); this.renderHistoryTasks();
        if (dk === this.getTodayKey()) { this.renderTasks(); this.updateProgress(); this.updateStreak(); }
    },

    // === Theme ===
    loadTheme() { this.currentTheme = localStorage.getItem('dayflow-theme') || 'midnight'; this.applyTheme(this.currentTheme); },
    applyTheme(id) {
        const t = THEMES[id]; if (!t) return;
        this.currentTheme = id;
        const r = document.documentElement.style;
        r.setProperty('--accent', t.accent); r.setProperty('--accent-bright', t.accentBright);
        r.setProperty('--accent-dim', t.accentDim); r.setProperty('--accent-glow', t.accentGlow);
        r.setProperty('--accent-deep', t.accentDeep); r.setProperty('--bg-primary', t.bgPrimary);
        r.setProperty('--bg-secondary', t.bgSecondary); r.setProperty('--shadow-accent', `0 4px 20px ${t.accentGlow}`);
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bgPrimary);
        localStorage.setItem('dayflow-theme', id);
    },
    renderThemeGrid() {
        this.dom.themeGrid.innerHTML = Object.entries(THEMES).map(([id, t]) =>
            `<div class="theme-card${id === this.currentTheme ? ' active' : ''}" data-theme="${id}">
                <div class="theme-preview" style="background:linear-gradient(135deg,${t.accent},${t.accentDeep})"></div>
                <span class="theme-name">${t.emoji} ${t.name}</span>
            </div>`
        ).join('');
    },

    // === Render ===
    render() { this.updateHeader(); this.renderTasks(); this.updateProgress(); this.updateStreak(); this.renderCalendar(); this.renderThemeGrid(); },
    updateHeader() { this.dom.headerDate.textContent = this.formatDate(new Date()); },
    updateStreak() {
        const s = this.calculateStreak(); this.dom.streakCount.textContent = s;
        this.dom.streakBadge.style.borderColor = s > 0 ? 'rgba(245,158,11,0.3)' : '';
        this.dom.streakBadge.style.background = s > 0 ? 'rgba(245,158,11,0.08)' : '';
    },
    updateProgress() {
        const todayTasks = this.getTasksForDate(this.getTodayKey()); const total = todayTasks.length;
        if (!total) { this.dom.progressPercent.textContent = '—'; this.dom.progressFill.style.strokeDashoffset = 364.42; return; }
        const done = todayTasks.filter(t => this.isTaskDone(t.name)).length;
        const pct = Math.round(done/total*100);
        this.dom.progressPercent.textContent = `${pct}%`;
        this.dom.progressFill.style.strokeDashoffset = 364.42 - (364.42 * pct / 100);
    },
    renderTasks() {
        const list = this.dom.taskList; list.innerHTML = '';
        const todayTasks = this.getTasksForDate(this.getTodayKey());
        if (!this.tasks.length) { this.dom.emptyState.style.display = 'block'; this.dom.emptyState.innerHTML = '<div class="empty-icon">📋</div><p>Brak zadań. Dodaj swoje pierwsze!</p>'; return; }
        if (!todayTasks.length) { this.dom.emptyState.style.display = 'block'; this.dom.emptyState.innerHTML = '<div class="free-day-icon">🏖️</div><div class="free-day-title">Dzień wolny!</div><p>Brak zadań na dziś. Odpoczywaj!</p>'; return; }
        this.dom.emptyState.style.display = 'none';
        todayTasks.forEach((task, i) => {
            const isDone = this.isTaskDone(task.name);
            const hasSub = task.subtasks?.length > 0;
            const isExp = this.expandedTasks.has(task.name);
            const li = document.createElement('li');
            li.className = `task-item${isDone ? ' completed' : ''}${hasSub ? ' has-subtasks' : ''}${isExp ? ' expanded' : ''}`;
            li.style.animationDelay = `${i * 0.05}s`;
            const badge = this.getScheduleLabel(task);
            const badgeH = badge ? `<span class="task-schedule-badge">${badge}</span>` : '';
            const descH = task.description ? `<span class="task-description">${this.esc(task.description)}</span>` : '';
            let progH = '', subH = '';
            if (hasSub) {
                const st = this.getSubtaskStates(task.name, task.subtasks);
                const dn = Object.values(st).filter(v=>v).length;
                progH = `<span class="subtask-progress">${dn}/${task.subtasks.length}</span>`;
                subH = `<div class="subtask-list"><div class="subtask-list-inner">${task.subtasks.map(s => {
                    const sd = st[s];
                    return `<div class="subtask-item${sd?' done':''}"><label class="subtask-checkbox"><input type="checkbox" ${sd?'checked':''} data-task="${this.esc(task.name)}" data-subtask="${this.esc(s)}"><span class="subtask-checkmark"><svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/></svg></span></label><span class="subtask-name">${this.esc(s)}</span></div>`;
                }).join('')}</div></div>`;
            }
            const expBtn = hasSub ? `<button class="btn-expand" data-task="${this.esc(task.name)}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>` : '';
            const editBtn = `<button class="btn-edit" data-task="${this.esc(task.name)}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>`;
            const delBtn = `<button class="btn-delete" data-task="${this.esc(task.name)}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
            li.innerHTML = `<div class="task-main"><label class="task-checkbox"><input type="checkbox" ${isDone?'checked':''} data-task="${this.esc(task.name)}"><span class="checkmark"><svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg></span></label><div class="task-info"><div class="task-name-row"><span class="task-name">${this.esc(task.name)}</span>${progH}</div>${descH}${badgeH}</div><div class="task-actions">${editBtn}${expBtn}${delBtn}</div></div>${subH}`;
            list.appendChild(li);
        });
    },
    renderCalendar() {
        const g = this.dom.calendarGrid; g.innerHTML = '';
        const y = this.calendarYear, m = this.calendarMonth, today = new Date(), tk = this.getTodayKey();
        this.dom.calendarMonthYear.textContent = `${this.getMonthName(m)} ${y}`;
        let sd = new Date(y,m,1).getDay()-1; if(sd<0) sd=6;
        const dim = new Date(y,m+1,0).getDate(); let cd=0, tp=0;
        for(let i=0;i<sd;i++) { const e=document.createElement('div'); e.className='calendar-day empty'; g.appendChild(e); }
        for(let d=1;d<=dim;d++) {
            const c=document.createElement('div'); c.className='calendar-day'; c.textContent=d;
            const dt=new Date(y,m,d), dk=this.dateToKey(dt), isT=dk===tk, isF=dt>today&&!isT;
            c.dataset.date = dk;
            if(isT) c.classList.add('today');
            if(isF) { c.classList.add('future'); }
            else { const s=this.getDayStatus(dk); if(s==='completed'){c.classList.add('completed');cd++;tp++;} else if(s==='partial'){c.classList.add('partial');tp++;} else if(s==='none'){tp++;} }
            g.appendChild(c);
        }
        this.dom.calendarStats.innerHTML = tp ? `<strong>${cd}</strong> z <strong>${tp}</strong> dni ukończonych` : 'Brak danych';
    },

    // === Tabs ===
    switchTab(tab) {
        if(tab===this.currentTab) return; const old=this.currentTab; this.currentTab=tab;
        this.dom.navBtns.forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
        const p={today:this.dom.tabToday,calendar:this.dom.tabCalendar}; const op=p[old],np=p[tab], r=tab==='calendar';
        op.classList.remove('active'); op.style.transform=r?'translateX(-20px)':'translateX(20px)'; op.style.opacity='0';
        setTimeout(()=>{op.style.pointerEvents='none';np.style.transform=r?'translateX(20px)':'translateX(-20px)';
        requestAnimationFrame(()=>{np.classList.add('active');np.style.transform='';np.style.opacity='';np.style.pointerEvents='';});},50);
        if(tab==='calendar') this.renderCalendar();
    },

    // === Modals ===
    openModal(taskName) {
        this.dom.modalOverlay.classList.add('visible');
        if (typeof taskName === 'string') {
            this.editingTaskName = taskName;
            const t = this.tasks.find(x => x.name === taskName);
            this.dom.taskInput.value = t.name;
            this.dom.taskDesc.value = t.description || '';
            this.modalSubtasks = [...(t.subtasks || [])];
            this.dom.taskStartDate.value = t.startDate || '';
            this.dom.taskEndDate.value = t.endDate || '';
            this.dom.btnConfirm.textContent = 'Zapisz';
            const s = t.schedule || {type: 'daily'};
            const dr=this.dom.modal.querySelector(`input[name="schedule"][value="${s.type}"]`); if(dr)dr.checked=true;
            this.dom.weekdayPicker.querySelectorAll('.weekday-btn').forEach(b=>{const d=parseInt(b.dataset.day);b.classList.toggle('selected',s.days?.includes(d));});
            this.dom.intervalDays.value = s.every || 2;
        } else {
            this.editingTaskName = null;
            this.dom.taskInput.value=''; this.dom.taskDesc.value='';
            this.modalSubtasks=[];
            this.dom.taskStartDate.value = ''; this.dom.taskEndDate.value = '';
            this.dom.btnConfirm.textContent = 'Dodaj';
            const dr=this.dom.modal.querySelector('input[name="schedule"][value="daily"]'); if(dr)dr.checked=true;
            this.dom.weekdayPicker.querySelectorAll('.weekday-btn').forEach(b=>{const d=parseInt(b.dataset.day);b.classList.toggle('selected',d>=1&&d<=5);});
            this.dom.intervalDays.value='2'; 
        }
        this.renderModalSubtasks();
        const sel = this.dom.modal.querySelector('input[name="schedule"]:checked')?.value || 'daily';
        this.dom.weekdayPicker.classList.toggle('visible', sel==='weekdays');
        this.dom.intervalPicker.classList.toggle('visible', sel==='interval');
        setTimeout(()=>this.dom.taskInput.focus(),300);
    },
    closeModal() { this.dom.modalOverlay.classList.remove('visible'); },
    getScheduleFromModal() {
        const sel = this.dom.modal.querySelector('input[name="schedule"]:checked')?.value || 'daily';
        if(sel==='daily') return {type:'daily'};
        if(sel==='weekdays') { const days=[]; this.dom.weekdayPicker.querySelectorAll('.weekday-btn.selected').forEach(b=>days.push(parseInt(b.dataset.day))); return days.length&&days.length<7?{type:'weekdays',days}:{type:'daily'}; }
        if(sel==='interval') { const ev=Math.max(2,Math.min(365,parseInt(this.dom.intervalDays.value)||2)); return {type:'interval',every:ev,startDate:this.getTodayKey()}; }
        return {type:'daily'};
    },
    confirmAdd() {
        const name=this.dom.taskInput.value.trim(); if(!name) return;
        const sd = this.dom.taskStartDate.value; const ed = this.dom.taskEndDate.value;
        if(this.saveTask(this.editingTaskName, name,this.getScheduleFromModal(),this.dom.taskDesc.value.trim(),this.modalSubtasks.slice(), sd, ed)) this.closeModal();
        else { this.dom.modal.style.animation='none'; this.dom.modal.offsetHeight; this.dom.modal.style.animation='shake 0.4s ease'; }
    },
    addModalSubtask() {
        const v=this.dom.subtaskInput.value.trim(); if(!v||this.modalSubtasks.includes(v)) return;
        this.modalSubtasks.push(v); this.renderModalSubtasks(); this.dom.subtaskInput.value=''; this.dom.subtaskInput.focus();
    },
    removeModalSubtask(name) { this.modalSubtasks=this.modalSubtasks.filter(s=>s!==name); this.renderModalSubtasks(); },
    renderModalSubtasks() {
        this.dom.modalSubtaskList.innerHTML = this.modalSubtasks.map(s =>
            `<div class="subtask-chip"><span>${this.esc(s)}</span><button class="chip-remove" data-ms="${this.esc(s)}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`
        ).join('');
    },

    // === Celebration ===
    celebrate() {
        const c=this.dom.celebration; const cols=['#22c55e','#4ade80','#f59e0b','#fbbf24','#8b5cf6','#ec4899'];
        for(let i=0;i<40;i++){const e=document.createElement('div');e.className='confetti';e.style.cssText=`left:${Math.random()*100}%;top:-10px;background:${cols[Math.floor(Math.random()*cols.length)]};animation-delay:${Math.random()*0.8}s;animation-duration:${2+Math.random()*1.5}s;width:${6+Math.random()*6}px;height:${6+Math.random()*6}px`;c.appendChild(e);}
        const m=document.createElement('div');m.className='completion-message';m.innerHTML='<span class="emoji">🎉</span><span class="text">Świetna robota!</span>';c.appendChild(m);
        setTimeout(()=>{c.innerHTML='';},3000);
    },

    // === Events ===
    bindEvents() {
        this.dom.btnAdd.addEventListener('click',()=>this.openModal());
        this.dom.btnCancel.addEventListener('click',()=>this.closeModal());
        this.dom.btnConfirm.addEventListener('click',()=>this.confirmAdd());
        this.dom.modalOverlay.addEventListener('click',e=>{if(e.target===this.dom.modalOverlay)this.closeModal();});
        this.dom.taskInput.addEventListener('keydown',e=>{if(e.key==='Enter')this.confirmAdd();if(e.key==='Escape')this.closeModal();});
        this.dom.btnAddSubtask.addEventListener('click',()=>this.addModalSubtask());
        this.dom.subtaskInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.addModalSubtask();}});
        this.dom.modalSubtaskList.addEventListener('click',e=>{const b=e.target.closest('.chip-remove');if(b)this.removeModalSubtask(b.dataset.ms);});
        this.dom.modal.querySelectorAll('input[name="schedule"]').forEach(r=>r.addEventListener('change',()=>{
            this.dom.weekdayPicker.classList.toggle('visible',r.value==='weekdays');
            this.dom.intervalPicker.classList.toggle('visible',r.value==='interval');
        }));
        this.dom.weekdayPicker.addEventListener('click',e=>{const b=e.target.closest('.weekday-btn');if(b)b.classList.toggle('selected');});
        this.dom.taskList.addEventListener('click',e=>{
            const stCb=e.target.closest('.subtask-checkbox input');
            if(stCb){e.preventDefault();this.toggleSubtask(stCb.dataset.task,stCb.dataset.subtask);return;}
            const cb=e.target.closest('.task-checkbox input');
            if(cb){e.preventDefault();this.toggleTask(cb.dataset.task);return;}
            const exp=e.target.closest('.btn-expand');
            if(exp){const n=exp.dataset.task;this.expandedTasks.has(n)?this.expandedTasks.delete(n):this.expandedTasks.add(n);this.renderTasks();return;}
            const edit=e.target.closest('.btn-edit');
            if(edit){this.openModal(edit.dataset.task);return;}
            const del=e.target.closest('.btn-delete');
            if(del){const it=del.closest('.task-item');it.style.transform='translateX(100%)';it.style.opacity='0';setTimeout(()=>this.removeTask(del.dataset.task),250);return;}
            const ti=e.target.closest('.task-main');
            if(ti&&!e.target.closest('.btn-delete')&&!e.target.closest('.btn-expand')&&!e.target.closest('.btn-edit')){const c=ti.querySelector('.task-checkbox input');if(c)this.toggleTask(c.dataset.task);}
        });
        this.dom.historyTaskList.addEventListener('click',e=>{
            const stCb=e.target.closest('.subtask-checkbox input');
            if(stCb){e.preventDefault();this.toggleHistorySubtask(stCb.dataset.task,stCb.dataset.subtask);return;}
            const cb=e.target.closest('.task-checkbox input');
            if(cb){e.preventDefault();this.toggleHistoryTask(cb.dataset.task);return;}
            const ti=e.target.closest('.task-main');
            if(ti){const c=ti.querySelector('.task-checkbox input');if(c)this.toggleHistoryTask(c.dataset.task);}
        });
        this.dom.calendarGrid.addEventListener('click',e=>{
            const day = e.target.closest('.calendar-day');
            if (day && !day.classList.contains('empty')) {
                this.openHistoryModal(day.dataset.date);
            }
        });
        this.dom.navBtns.forEach(b=>b.addEventListener('click',()=>this.switchTab(b.dataset.tab)));
        this.dom.btnPrev.addEventListener('click',()=>{this.calendarMonth--;if(this.calendarMonth<0){this.calendarMonth=11;this.calendarYear--;}this.renderCalendar();});
        this.dom.btnNext.addEventListener('click',()=>{this.calendarMonth++;if(this.calendarMonth>11){this.calendarMonth=0;this.calendarYear++;}this.renderCalendar();});
        document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(this.dom.themeOverlay.classList.contains('visible'))this.dom.themeOverlay.classList.remove('visible');else if(this.dom.modalOverlay.classList.contains('visible'))this.closeModal();else if(this.dom.historyOverlay.classList.contains('visible'))this.closeHistoryModal();else if(this.dom.settingsOverlay.classList.contains('visible'))this.dom.settingsOverlay.classList.remove('visible');}});
        // Theme & Settings
        this.dom.btnTheme.addEventListener('click',()=>{this.renderThemeGrid();this.dom.themeOverlay.classList.add('visible');});
        this.dom.btnCloseTheme.addEventListener('click',()=>this.dom.themeOverlay.classList.remove('visible'));
        this.dom.themeOverlay.addEventListener('click',e=>{if(e.target===this.dom.themeOverlay)this.dom.themeOverlay.classList.remove('visible');});
        this.dom.themeGrid.addEventListener('click',e=>{const c=e.target.closest('.theme-card');if(c){this.applyTheme(c.dataset.theme);this.renderThemeGrid();}});
        
        this.dom.btnSettings.addEventListener('click',()=>this.dom.settingsOverlay.classList.add('visible'));
        this.dom.btnCloseSettings.addEventListener('click',()=>{
            this.settings.dayOffsetHours = parseInt(this.dom.settingDayOffset.value) || 0;
            this.saveData(); this.render(); this.dom.settingsOverlay.classList.remove('visible');
        });
        this.dom.settingsOverlay.addEventListener('click',e=>{if(e.target===this.dom.settingsOverlay)this.dom.settingsOverlay.classList.remove('visible');});
        
        this.dom.btnCloseHistory.addEventListener('click',()=>this.closeHistoryModal());
        this.dom.historyOverlay.addEventListener('click',e=>{if(e.target===this.dom.historyOverlay)this.closeHistoryModal();});
        // Swipe
        let sx=0; const mc=document.getElementById('main-content');
        mc.addEventListener('touchstart',e=>{sx=e.changedTouches[0].screenX;},{passive:true});
        mc.addEventListener('touchend',e=>{const d=sx-e.changedTouches[0].screenX;if(Math.abs(d)>60)this.switchTab(d>0?'calendar':'today');},{passive:true});
    },

    esc(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;},
    registerSW(){if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});}
};

document.addEventListener('DOMContentLoaded',()=>App.init());
