const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Time_Picker — Time selection with optional analog clock face.
 *
 * Sub-components (all toggleable):
 *   - Digital Display  (always shown)
 *   - Clock Face       (show_clock, default: true)
 *   - Spinners         (show_spinners, default: false)
 *   - Presets          (show_presets, default: false)
 *
 * @param {Object}  spec
 * @param {string}  [spec.value='12:00']         Initial time HH:MM or HH:MM:SS
 * @param {boolean} [spec.show_clock=true]       Show analog clock face
 * @param {number}  [spec.clock_size=200]        Clock diameter in px
 * @param {string}  [spec.clock_style='modern']  'modern'|'classic'|'minimal'
 * @param {boolean} [spec.show_ticks=true]       Tick marks on clock
 * @param {boolean} [spec.show_numbers=true]     Hour numbers on clock
 * @param {boolean} [spec.show_second_hand=false] Second hand
 * @param {string}  [spec.clock_bg='']           Custom clock background
 * @param {string}  [spec.hand_color='']         Custom hand color
 * @param {boolean} [spec.use_24h=true]          24-hour mode
 * @param {boolean} [spec.show_seconds=false]    Show seconds
 * @param {boolean} [spec.show_spinners=false]   Number spinners
 * @param {boolean} [spec.show_presets=false]     Preset buttons
 * @param {Array}   [spec.presets]               Preset time strings
 * @param {string}  [spec.min_time=null]         Min constraint
 * @param {string}  [spec.max_time=null]         Max constraint
 * @param {number}  [spec.step_minutes=1]        Minute increment (1,5,10,15,30)
 */
class Time_Picker extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'time_picker';

        // Capture config before super()
        const initial_value = spec.value || '12:00';
        const cfg = {
            show_clock: spec.show_clock !== false,
            clock_size: spec.clock_size || 200,
            clock_style: spec.clock_style || 'modern',
            show_ticks: spec.show_ticks !== false,
            show_numbers: spec.show_numbers !== false,
            show_second_hand: !!spec.show_second_hand,
            clock_bg: spec.clock_bg || '',
            hand_color: spec.hand_color || '',
            use_24h: spec.use_24h !== false,
            show_seconds: !!spec.show_seconds,
            show_spinners: !!spec.show_spinners,
            show_presets: !!spec.show_presets,
            presets: spec.presets || ['Now', '09:00', '12:00', '17:00'],
            min_time: spec.min_time || null,
            max_time: spec.max_time || null,
            step_minutes: spec.step_minutes || 1,
        };

        super(spec);
        this.add_class('time-picker');
        this.add_class(`tp-style-${cfg.clock_style}`);

        this._cfg = cfg;

        // Parse initial time
        const parsed = Time_Picker.parse_time(initial_value);
        this._hours = parsed.hours;
        this._minutes = this._clamp_minutes(parsed.minutes);
        this._seconds = parsed.seconds;
        this._am_pm = parsed.am_pm; // 'AM' or 'PM' (only used in 12h mode)

        if (!spec.el) {
            this.compose();
        }
    }

    // ── Public API ──

    get hours() { return this._hours; }
    get minutes() { return this._minutes; }
    get seconds() { return this._seconds; }

    get value() {
        const hh = String(this._hours).padStart(2, '0');
        const mm = String(this._minutes).padStart(2, '0');
        if (this._cfg.show_seconds) {
            const ss = String(this._seconds).padStart(2, '0');
            return `${hh}:${mm}:${ss}`;
        }
        return `${hh}:${mm}`;
    }

    get display_value() {
        if (this._cfg.use_24h) return this.value;
        let h = this._hours % 12;
        if (h === 0) h = 12;
        const mm = String(this._minutes).padStart(2, '0');
        const suffix = this._hours < 12 ? 'AM' : 'PM';
        if (this._cfg.show_seconds) {
            const ss = String(this._seconds).padStart(2, '0');
            return `${h}:${mm}:${ss} ${suffix}`;
        }
        return `${h}:${mm} ${suffix}`;
    }

    get is_am() { return this._hours < 12; }
    get is_pm() { return this._hours >= 12; }

    set_time(hours, minutes, seconds) {
        this._hours = this._clamp_hours(hours);
        this._minutes = this._clamp_minutes(minutes);
        this._seconds = is_defined(seconds) ? Math.max(0, Math.min(59, seconds)) : this._seconds;
        this._on_change();
    }

    set_value(time_str) {
        const parsed = Time_Picker.parse_time(time_str);
        this._hours = parsed.hours;
        this._minutes = parsed.minutes;
        this._seconds = parsed.seconds;
        this._on_change();
    }

    toggle_am_pm() {
        if (this._hours < 12) {
            this._hours += 12;
        } else {
            this._hours -= 12;
        }
        this._on_change();
    }

    increment_hours(delta = 1) {
        this._hours = ((this._hours + delta) % 24 + 24) % 24;
        this._hours = this._clamp_hours(this._hours);
        this._on_change();
    }

    increment_minutes(delta) {
        if (delta === undefined) delta = this._cfg.step_minutes;
        let m = this._minutes + delta;
        if (m >= 60) { this._minutes = m - 60; this.increment_hours(1); return; }
        if (m < 0) { this._minutes = m + 60; this.increment_hours(-1); return; }
        this._minutes = m;
        this._on_change();
    }

    increment_seconds(delta = 1) {
        let s = this._seconds + delta;
        if (s >= 60) { s -= 60; this.increment_minutes(1); return; }
        if (s < 0) { s += 60; this.increment_minutes(-1); return; }
        this._seconds = s;
        this._on_change();
    }

    // ── Constraints ──

    _clamp_hours(h) {
        h = Math.max(0, Math.min(23, h));
        if (this._cfg.min_time) {
            const min = Time_Picker.parse_time(this._cfg.min_time);
            if (h < min.hours || (h === min.hours && this._minutes < min.minutes)) {
                h = min.hours;
            }
        }
        if (this._cfg.max_time) {
            const max = Time_Picker.parse_time(this._cfg.max_time);
            if (h > max.hours || (h === max.hours && this._minutes > max.minutes)) {
                h = max.hours;
            }
        }
        return h;
    }

    _clamp_minutes(m) {
        m = Math.max(0, Math.min(59, m));
        // Snap to step
        const step = this._cfg.step_minutes;
        if (step > 1) {
            m = Math.round(m / step) * step;
            if (m >= 60) m = 60 - step;
        }
        return m;
    }

    // ── Composition ──

    compose() {
        const { context } = this;
        const cfg = this._cfg;

        // ── Digital Display ──
        this._display_wrap = new Control({ context, tag_name: 'div' });
        this._display_wrap.add_class('tp-display');

        this._display_time = new Control({ context, tag_name: 'span' });
        this._display_time.add_class('tp-display-time');
        this._display_time.add(this.display_value);
        this._display_wrap.add(this._display_time);

        // AM/PM toggle (12h mode only)
        if (!cfg.use_24h) {
            this._am_pm_btn = new Control({ context, tag_name: 'button' });
            this._am_pm_btn.add_class('tp-ampm-btn');
            this._am_pm_btn.dom.attributes.type = 'button';
            this._am_pm_btn.add(this._hours < 12 ? 'AM' : 'PM');
            this._display_wrap.add(this._am_pm_btn);
        }

        this.add(this._display_wrap);

        // ── Clock Face ──
        if (cfg.show_clock) {
            const sz = cfg.clock_size;
            this._clock_wrap = new Control({ context, tag_name: 'div' });
            this._clock_wrap.add_class('tp-clock-wrap');
            this._clock_wrap.dom.attributes.style = `width:${sz}px;height:${sz}px`;

            this._clock_canvas = new Control({ context, tag_name: 'canvas' });
            this._clock_canvas.add_class('tp-clock-canvas');
            this._clock_canvas.dom.attributes.width = String(sz);
            this._clock_canvas.dom.attributes.height = String(sz);
            this._clock_wrap.add(this._clock_canvas);

            this.add(this._clock_wrap);
        }

        // ── Spinners ──
        if (cfg.show_spinners) {
            this._spinners_wrap = new Control({ context, tag_name: 'div' });
            this._spinners_wrap.add_class('tp-spinners');

            const make_spinner = (label, cls) => {
                const col = new Control({ context, tag_name: 'div' });
                col.add_class('tp-spinner-col');

                const lbl = new Control({ context, tag_name: 'span' });
                lbl.add_class('tp-spinner-label');
                lbl.add(label);
                col.add(lbl);

                const up = new Control({ context, tag_name: 'button' });
                up.add_class('tp-spinner-up');
                up.add_class(cls + '-up');
                up.dom.attributes.type = 'button';
                up.add('▲');
                col.add(up);

                const val = new Control({ context, tag_name: 'span' });
                val.add_class('tp-spinner-val');
                val.add_class(cls + '-val');
                col.add(val);

                const down = new Control({ context, tag_name: 'button' });
                down.add_class('tp-spinner-down');
                down.add_class(cls + '-down');
                down.dom.attributes.type = 'button';
                down.add('▼');
                col.add(down);

                this._spinners_wrap.add(col);
                return { up, down, val };
            };

            this._spinner_h = make_spinner('H', 'tp-h');
            this._spinner_m = make_spinner('M', 'tp-m');
            if (cfg.show_seconds) {
                this._spinner_s = make_spinner('S', 'tp-s');
            }

            this.add(this._spinners_wrap);
        }

        // ── Presets ──
        if (cfg.show_presets) {
            this._presets_wrap = new Control({ context, tag_name: 'div' });
            this._presets_wrap.add_class('tp-presets');

            cfg.presets.forEach(preset => {
                const btn = new Control({ context, tag_name: 'button' });
                btn.add_class('tp-preset-btn');
                btn.dom.attributes.type = 'button';
                btn.dom.attributes['data-time'] = preset;
                btn.add(preset);
                this._presets_wrap.add(btn);
            });

            this.add(this._presets_wrap);
        }
    }

    // ── Change handler ──

    _on_change() {
        // Update digital display
        if (this._display_time && this._display_time.dom.el) {
            this._display_time.dom.el.textContent = this.display_value;
        }
        // Update AM/PM button
        if (this._am_pm_btn && this._am_pm_btn.dom.el) {
            this._am_pm_btn.dom.el.textContent = this._hours < 12 ? 'AM' : 'PM';
        }
        // Redraw clock
        if (this._clock_canvas && this._clock_canvas.dom.el) {
            this._draw_clock();
        }
        // Update spinner values
        if (this._spinner_h && this._spinner_h.val.dom.el) {
            this._spinner_h.val.dom.el.textContent = String(this._hours).padStart(2, '0');
            this._spinner_m.val.dom.el.textContent = String(this._minutes).padStart(2, '0');
            if (this._spinner_s) {
                this._spinner_s.val.dom.el.textContent = String(this._seconds).padStart(2, '0');
            }
        }

        this.raise('change', {
            value: this.value,
            hours: this._hours,
            minutes: this._minutes,
            seconds: this._seconds,
        });
    }

    // ── Reconnect DOM refs for hydration (when compose was skipped) ──
    _reconnect_from_dom() {
        const el = this.dom.el;
        if (!el) return;

        const q = (cls) => {
            const found = el.querySelector('.' + cls);
            return found ? { dom: { el: found } } : null;
        };

        // Digital display
        if (!this._display_time) this._display_time = q('tp-display-time');

        // AM/PM button
        if (!this._am_pm_btn) this._am_pm_btn = q('tp-ampm-btn');

        // Clock canvas
        if (!this._clock_canvas) this._clock_canvas = q('tp-clock-canvas');

        // Spinners: each is { up, down, val } with dom.el
        const reconnect_spinner = (cls) => {
            const upEl = el.querySelector('.' + cls + '-up');
            const downEl = el.querySelector('.' + cls + '-down');
            const valEl = el.querySelector('.' + cls + '-val');
            if (!upEl && !downEl && !valEl) return null;
            return {
                up: { dom: { el: upEl } },
                down: { dom: { el: downEl } },
                val: { dom: { el: valEl } }
            };
        };
        if (!this._spinner_h) this._spinner_h = reconnect_spinner('tp-h');
        if (!this._spinner_m) this._spinner_m = reconnect_spinner('tp-m');
        if (!this._spinner_s) this._spinner_s = reconnect_spinner('tp-s');

        // Presets
        if (!this._presets_wrap) this._presets_wrap = q('tp-presets');

        // Read initial time from the digital display
        if (this._display_time && this._display_time.dom.el) {
            const text = this._display_time.dom.el.textContent.trim();
            const parsed = Time_Picker.parse_time(text);
            if (parsed) {
                this._hours = parsed.hours;
                this._minutes = parsed.minutes;
                this._seconds = parsed.seconds;
            }
        }
    }

    // ── Activation ──

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        // Reconnect DOM references if hydrating
        this._reconnect_from_dom();

        // Draw initial clock
        if (this._clock_canvas && this._clock_canvas.dom.el) {
            this._draw_clock();

            // Click on clock to set time
            this._clock_canvas.dom.el.addEventListener('click', (e) => {
                this._handle_clock_click(e);
            });
        }

        // AM/PM toggle
        if (this._am_pm_btn && this._am_pm_btn.dom.el) {
            this._am_pm_btn.dom.el.addEventListener('click', () => {
                this.toggle_am_pm();
            });
        }

        // Spinners
        if (this._spinner_h) {
            this._spinner_h.up.dom.el.addEventListener('click', () => this.increment_hours(1));
            this._spinner_h.down.dom.el.addEventListener('click', () => this.increment_hours(-1));
            this._spinner_m.up.dom.el.addEventListener('click', () => this.increment_minutes());
            this._spinner_m.down.dom.el.addEventListener('click', () => this.increment_minutes(-this._cfg.step_minutes));
            if (this._spinner_s) {
                this._spinner_s.up.dom.el.addEventListener('click', () => this.increment_seconds(1));
                this._spinner_s.down.dom.el.addEventListener('click', () => this.increment_seconds(-1));
            }
            // Set initial values
            this._spinner_h.val.dom.el.textContent = String(this._hours).padStart(2, '0');
            this._spinner_m.val.dom.el.textContent = String(this._minutes).padStart(2, '0');
            if (this._spinner_s) {
                this._spinner_s.val.dom.el.textContent = String(this._seconds).padStart(2, '0');
            }
        }

        // Presets
        if (this._presets_wrap && this._presets_wrap.dom.el) {
            this._presets_wrap.dom.el.addEventListener('click', (e) => {
                const btn = e.target.closest('.tp-preset-btn');
                if (!btn) return;
                const time_str = btn.getAttribute('data-time');
                if (time_str === 'Now') {
                    const now = new Date();
                    this.set_time(now.getHours(), now.getMinutes(), now.getSeconds());
                } else {
                    this.set_value(time_str);
                }
            });
        }
    }

    // ── Clock drawing ──

    _draw_clock() {
        const canvas = this._clock_canvas.dom.el;
        if (!canvas || !canvas.getContext) return;
        const ctx = canvas.getContext('2d');
        const cfg = this._cfg;
        const sz = cfg.clock_size;
        const cx = sz / 2, cy = sz / 2;
        const r = sz / 2 - 8;

        ctx.clearRect(0, 0, sz, sz);

        // Background
        const bg = cfg.clock_bg || (cfg.clock_style === 'modern' ? '#1e293b' : '#ffffff');
        const fg = cfg.clock_style === 'modern' ? '#e2e8f0' : '#1e293b';
        const accent = cfg.hand_color || '#3b82f6';

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.strokeStyle = cfg.clock_style === 'minimal' ? 'transparent' : (cfg.clock_style === 'modern' ? '#334155' : '#94a3b8');
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ticks
        if (cfg.show_ticks) {
            for (let i = 0; i < 60; i++) {
                const angle = (i * 6 - 90) * Math.PI / 180;
                const isHour = i % 5 === 0;
                const len = isHour ? 10 : 4;
                const outerR = r - 2;
                const innerR = outerR - len;
                ctx.beginPath();
                ctx.moveTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
                ctx.lineTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
                ctx.strokeStyle = isHour ? fg : (cfg.clock_style === 'modern' ? '#475569' : '#cbd5e1');
                ctx.lineWidth = isHour ? 2 : 1;
                ctx.stroke();
            }
        }

        // Numbers
        if (cfg.show_numbers) {
            ctx.font = `${cfg.clock_style === 'minimal' ? '600 ' : '500 '}${Math.round(r * 0.16)}px 'Inter', system-ui, sans-serif`;
            ctx.fillStyle = fg;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 1; i <= 12; i++) {
                const angle = (i * 30 - 90) * Math.PI / 180;
                const numR = r - 22;
                const x = cx + numR * Math.cos(angle);
                const y = cy + numR * Math.sin(angle);
                ctx.fillText(String(i), x, y);
            }
        }

        // Hour hand
        const hourAngle = ((this._hours % 12) + this._minutes / 60) * 30 - 90;
        const hourRad = hourAngle * Math.PI / 180;
        const hourLen = r * 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + hourLen * Math.cos(hourRad), cy + hourLen * Math.sin(hourRad));
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Minute hand
        const minAngle = (this._minutes + this._seconds / 60) * 6 - 90;
        const minRad = minAngle * Math.PI / 180;
        const minLen = r * 0.7;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + minLen * Math.cos(minRad), cy + minLen * Math.sin(minRad));
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Second hand
        if (cfg.show_second_hand) {
            const secAngle = this._seconds * 6 - 90;
            const secRad = secAngle * Math.PI / 180;
            const secLen = r * 0.75;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + secLen * Math.cos(secRad), cy + secLen * Math.sin(secRad));
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.fill();
    }

    _handle_clock_click(e) {
        const canvas = this._clock_canvas.dom.el;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const sz = this._cfg.clock_size;
        const cx = sz / 2, cy = sz / 2;
        const x = e.clientX - rect.left - cx;
        const y = e.clientY - rect.top - cy;
        const dist = Math.sqrt(x * x + y * y);
        const r = sz / 2 - 8;

        let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
        if (angle < 0) angle += 360;

        // Determine if clicking in the hour zone (inner) or minute zone (outer)
        if (dist < r * 0.6) {
            // Hour zone — map angle to hour
            let hour = Math.round(angle / 30);
            if (hour === 0) hour = 12;
            if (!this._cfg.use_24h || this._hours < 12) {
                this._hours = hour === 12 ? 0 : hour;
            } else {
                this._hours = hour === 12 ? 12 : hour + 12;
            }
        } else {
            // Minute zone
            let minute = Math.round(angle / 6);
            if (minute >= 60) minute = 0;
            // Snap to step
            const step = this._cfg.step_minutes;
            minute = Math.round(minute / step) * step;
            if (minute >= 60) minute = 0;
            this._minutes = minute;
        }
        this._on_change();
    }

    // ── Static helpers ──

    static parse_time(str) {
        if (!str || typeof str !== 'string') return { hours: 12, minutes: 0, seconds: 0, am_pm: 'PM' };
        str = str.trim();

        // Check for AM/PM
        const ampm_match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/);
        if (ampm_match) {
            let h = parseInt(ampm_match[1], 10);
            const m = parseInt(ampm_match[2], 10);
            const s = ampm_match[3] ? parseInt(ampm_match[3], 10) : 0;
            const period = ampm_match[4] ? ampm_match[4].toUpperCase() : null;

            if (period === 'PM' && h < 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;

            return {
                hours: Math.max(0, Math.min(23, h)),
                minutes: Math.max(0, Math.min(59, m)),
                seconds: Math.max(0, Math.min(59, s)),
                am_pm: h < 12 ? 'AM' : 'PM',
            };
        }

        return { hours: 12, minutes: 0, seconds: 0, am_pm: 'PM' };
    }
}

// ── Static CSS ──
Time_Picker.css = `
.time-picker {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #1e293b;
    border-radius: 10px;
    font-family: 'Inter', system-ui, sans-serif;
    color: #e2e8f0;
}

/* Digital display */
.tp-display {
    display: flex;
    align-items: center;
    gap: 8px;
}
.tp-display-time {
    font-size: 28px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: 1px;
    color: #f1f5f9;
}
.tp-ampm-btn {
    background: #334155;
    border: 1px solid #475569;
    color: #e2e8f0;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
}
.tp-ampm-btn:hover { background: #475569; }

/* Clock */
.tp-clock-wrap {
    position: relative;
    cursor: pointer;
}
.tp-clock-canvas {
    display: block;
    border-radius: 50%;
}

/* Spinners */
.tp-spinners {
    display: flex;
    gap: 8px;
}
.tp-spinner-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}
.tp-spinner-label {
    font-size: 10px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
}
.tp-spinner-up, .tp-spinner-down {
    background: #334155;
    border: 1px solid #475569;
    color: #e2e8f0;
    border-radius: 4px;
    width: 28px;
    height: 22px;
    font-size: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
}
.tp-spinner-up:hover, .tp-spinner-down:hover { background: #475569; }
.tp-spinner-val {
    font-size: 18px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    min-width: 28px;
    text-align: center;
}

/* Presets */
.tp-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}
.tp-preset-btn {
    background: #0f172a;
    border: 1px solid #334155;
    color: #94a3b8;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}
.tp-preset-btn:hover {
    background: #1e293b;
    border-color: #3b82f6;
    color: #e2e8f0;
}

/* Classic style overrides */
.tp-style-classic .time-picker { background: #fff; color: #1e293b; }
.tp-style-classic .tp-display-time { color: #1e293b; }

/* Minimal style */
.tp-style-minimal .tp-clock-canvas { border: none; }
`;

module.exports = Time_Picker;
