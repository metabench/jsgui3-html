/**
 * Generate detailed SVG renderings of Key_Value_Table in different
 * situations and themes.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'tmp', 'kv-renderings');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ─── Helpers ────────────────────────────────────────────────────────────
function escapeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderKV(opts) {
    const {
        title,
        subtitle,
        rows,         // [{ key, value, badge?, badgeColor? }]
        theme,        // { bg, cardBg, border, keyColor, valueColor, headerBg, headerColor, stripeBg, fontFamily, badgeBg, badgeColor, copyBtnColor, shadowColor }
        showHeader,
        headerLabels, // [keyLabel, valueLabel]
        showCopyBtn,
        width = 520,
        cornerLabel,  // e.g. "● Production" status dot
        cornerColor,
    } = opts;

    const t = theme;
    const rowH = 38;
    const headerH = showHeader ? 36 : 0;
    const titleH = title ? 48 : 0;
    const subtitleH = subtitle ? 22 : 0;
    const topPad = 16;
    const botPad = 12;
    const tableTop = topPad + titleH + subtitleH;
    const tableH = headerH + rows.length * rowH;
    const totalH = tableTop + tableH + botPad;
    const keyColW = 160;
    const cardR = 10;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH}" viewBox="0 0 ${width} ${totalH}">\n`;
    svg += `<defs>\n`;
    svg += `  <style>\n`;
    svg += `    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap');\n`;
    svg += `  </style>\n`;
    // Card shadow
    svg += `  <filter id="shadow" x="-4%" y="-4%" width="108%" height="112%">\n`;
    svg += `    <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${t.shadowColor || 'rgba(0,0,0,0.08)'}" flood-opacity="1"/>\n`;
    svg += `  </filter>\n`;
    svg += `</defs>\n`;

    // Background
    svg += `<rect width="${width}" height="${totalH}" rx="0" fill="${t.bg}"/>\n`;

    // Card
    const cardX = 0, cardY = 0, cardW = width, cardH = totalH;
    svg += `<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${cardR}" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1" filter="url(#shadow)"/>\n`;

    let y = topPad;

    // Title
    if (title) {
        svg += `<text x="20" y="${y + 22}" font-family="'Inter', sans-serif" font-size="16" font-weight="700" fill="${t.headerColor}">${escapeXml(title)}</text>\n`;
        // Corner label (status dot)
        if (cornerLabel) {
            const dotR = 4;
            const lblW = cornerLabel.length * 7 + 24;
            svg += `<circle cx="${width - lblW}" cy="${y + 18}" r="${dotR}" fill="${cornerColor || '#16a34a'}"/>\n`;
            svg += `<text x="${width - lblW + 8}" y="${y + 22}" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="${cornerColor || '#16a34a'}">${escapeXml(cornerLabel)}</text>\n`;
        }
        y += 30;
    }

    // Subtitle
    if (subtitle) {
        svg += `<text x="20" y="${y + 14}" font-family="'Inter', sans-serif" font-size="12" fill="${t.keyColor}" opacity="0.7">${escapeXml(subtitle)}</text>\n`;
        y += subtitleH;
    }

    if (title || subtitle) y += 6;

    // Header row
    if (showHeader) {
        const labels = headerLabels || ['Property', 'Value'];
        svg += `<rect x="1" y="${y}" width="${cardW - 2}" height="${headerH}" fill="${t.headerBg}"/>\n`;
        svg += `<line x1="1" y1="${y + headerH}" x2="${cardW - 1}" y2="${y + headerH}" stroke="${t.border}" stroke-width="1"/>\n`;
        svg += `<text x="20" y="${y + 23}" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="${t.headerColor}" text-transform="uppercase" letter-spacing="0.05em">${escapeXml(labels[0].toUpperCase())}</text>\n`;
        svg += `<text x="${keyColW + 20}" y="${y + 23}" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="${t.headerColor}" text-transform="uppercase" letter-spacing="0.05em">${escapeXml(labels[1].toUpperCase())}</text>\n`;
        y += headerH;
    }

    // Data rows
    rows.forEach((row, i) => {
        const ry = y + i * rowH;
        const isStriped = i % 2 === 1;

        // Stripe background
        if (isStriped) {
            // Handle bottom corners for last striped row
            if (i === rows.length - 1) {
                svg += `<path d="M1,${ry} H${cardW - 1} V${ry + rowH - cardR} Q${cardW - 1},${ry + rowH} ${cardW - 1 - cardR},${ry + rowH} H${1 + cardR} Q1,${ry + rowH} 1,${ry + rowH - cardR} Z" fill="${t.stripeBg}"/>\n`;
            } else {
                svg += `<rect x="1" y="${ry}" width="${cardW - 2}" height="${rowH}" fill="${t.stripeBg}"/>\n`;
            }
        }

        // Separator line
        if (i > 0) {
            svg += `<line x1="12" y1="${ry}" x2="${cardW - 12}" y2="${ry}" stroke="${t.border}" stroke-width="0.5" opacity="0.5"/>\n`;
        }

        // Key
        svg += `<text x="20" y="${ry + 24}" font-family="'Inter', sans-serif" font-size="13" font-weight="600" fill="${t.keyColor}">${escapeXml(row.key)}</text>\n`;

        // Value
        const valueX = keyColW + 20;
        svg += `<text x="${valueX}" y="${ry + 24}" font-family="'JetBrains Mono', 'Consolas', monospace" font-size="13" font-weight="400" fill="${t.valueColor}">${escapeXml(row.value)}</text>\n`;

        // Badge (optional)
        if (row.badge) {
            const badgeW = row.badge.length * 7.5 + 16;
            const badgeX = valueX + row.value.length * 7.8 + 12;
            const badgeBg = row.badgeColor || t.badgeBg || '#e0f2fe';
            const badgeText = row.badgeTextColor || t.badgeColor || '#0369a1';
            svg += `<rect x="${badgeX}" y="${ry + 10}" width="${badgeW}" height="${18}" rx="9" fill="${badgeBg}"/>\n`;
            svg += `<text x="${badgeX + badgeW / 2}" y="${ry + 23}" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="${badgeText}" text-anchor="middle">${escapeXml(row.badge)}</text>\n`;
        }

        // Copy button (optional)
        if (showCopyBtn) {
            const btnX = cardW - 40;
            svg += `<rect x="${btnX}" y="${ry + 9}" width="${22}" height="${20}" rx="3" fill="transparent" stroke="${t.copyBtnColor || '#ccc'}" stroke-width="1" opacity="0.4"/>\n`;
            svg += `<text x="${btnX + 11}" y="${ry + 23}" font-family="'Inter', sans-serif" font-size="11" fill="${t.copyBtnColor || '#999'}" text-anchor="middle" opacity="0.5">📋</text>\n`;
        }
    });

    svg += `</svg>\n`;
    return svg;
}

// ─── Theme Definitions ──────────────────────────────────────────────────

const lightTheme = {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    border: '#e5e7eb',
    keyColor: '#374151',
    valueColor: '#111827',
    headerBg: '#f9fafb',
    headerColor: '#6b7280',
    stripeBg: '#f9fafb',
    shadowColor: 'rgba(0,0,0,0.06)',
    copyBtnColor: '#9ca3af',
    badgeBg: '#dbeafe',
    badgeColor: '#1d4ed8',
};

const darkTheme = {
    bg: '#0f172a',
    cardBg: '#1e293b',
    border: '#334155',
    keyColor: '#94a3b8',
    valueColor: '#e2e8f0',
    headerBg: '#1a2332',
    headerColor: '#64748b',
    stripeBg: '#162032',
    shadowColor: 'rgba(0,0,0,0.3)',
    copyBtnColor: '#475569',
    badgeBg: '#1e3a5f',
    badgeColor: '#60a5fa',
};

const warmTheme = {
    bg: '#fefce8',
    cardBg: '#fffbeb',
    border: '#fcd34d',
    keyColor: '#92400e',
    valueColor: '#451a03',
    headerBg: '#fef3c7',
    headerColor: '#b45309',
    stripeBg: '#fef9c3',
    shadowColor: 'rgba(146,64,14,0.08)',
    copyBtnColor: '#d97706',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
};

const terminalTheme = {
    bg: '#0c0c0c',
    cardBg: '#1a1a2e',
    border: '#2a2a4a',
    keyColor: '#00ff88',
    valueColor: '#e0e0e0',
    headerBg: '#16162a',
    headerColor: '#00cc66',
    stripeBg: '#151530',
    shadowColor: 'rgba(0,255,136,0.05)',
    copyBtnColor: '#00ff88',
    badgeBg: '#003322',
    badgeColor: '#00ff88',
};

// ─── Rendering Scenarios ────────────────────────────────────────────────

// 1. Server Configuration (Light)
const svg1 = renderKV({
    title: 'Server Configuration',
    subtitle: 'Application runtime settings',
    cornerLabel: 'Running',
    cornerColor: '#16a34a',
    showHeader: true,
    headerLabels: ['Setting', 'Value'],
    rows: [
        { key: 'Host', value: '0.0.0.0' },
        { key: 'Port', value: '3000' },
        { key: 'Environment', value: 'production', badge: 'LIVE', badgeColor: '#dcfce7', badgeTextColor: '#166534' },
        { key: 'Workers', value: '4' },
        { key: 'Max Memory', value: '512 MB' },
        { key: 'Log Level', value: 'info' },
        { key: 'CORS Origin', value: '*' },
        { key: 'SSL', value: 'enabled', badge: 'TLS 1.3', badgeColor: '#dbeafe', badgeTextColor: '#1d4ed8' },
    ],
    theme: lightTheme,
});
fs.writeFileSync(path.join(OUT, 'kv-server-config-light.svg'), svg1);

// 2. Process Info (Dark)
const svg2 = renderKV({
    title: 'Process Information',
    subtitle: 'Node.js runtime details',
    showHeader: false,
    rows: [
        { key: 'PID', value: '24891' },
        { key: 'Node Version', value: 'v20.11.0' },
        { key: 'Platform', value: 'linux x64' },
        { key: 'Uptime', value: '3d 14h 22m', badge: 'HEALTHY', badgeColor: '#1e3a5f', badgeTextColor: '#60a5fa' },
        { key: 'RSS Memory', value: '142.3 MB' },
        { key: 'Heap Used', value: '98.7 MB' },
        { key: 'Heap Total', value: '164.0 MB' },
        { key: 'CPU Usage', value: '12.4%' },
        { key: 'Active Handles', value: '23' },
        { key: 'Event Loop Lag', value: '0.8 ms' },
    ],
    theme: darkTheme,
});
fs.writeFileSync(path.join(OUT, 'kv-process-info-dark.svg'), svg2);

// 3. Environment Variables (Terminal Green-on-Black)
const svg3 = renderKV({
    title: '$ env | grep APP',
    showHeader: true,
    headerLabels: ['Variable', 'Value'],
    rows: [
        { key: 'APP_NAME', value: 'admin-dashboard' },
        { key: 'APP_ENV', value: 'staging', badge: 'STG', badgeColor: '#003322', badgeTextColor: '#00ff88' },
        { key: 'APP_PORT', value: '8080' },
        { key: 'APP_SECRET', value: '••••••••••••' },
        { key: 'APP_DB_HOST', value: 'db.internal.svc' },
        { key: 'APP_DB_PORT', value: '5432' },
        { key: 'APP_REDIS_URL', value: 'redis://cache:6379' },
        { key: 'APP_LOG_FORMAT', value: 'json' },
    ],
    theme: terminalTheme,
    showCopyBtn: true,
});
fs.writeFileSync(path.join(OUT, 'kv-env-vars-terminal.svg'), svg3);

// 4. Database Status (Light with warnings)
const svg4 = renderKV({
    title: 'Database Status',
    subtitle: 'PostgreSQL 15.4 — primary',
    cornerLabel: 'Connected',
    cornerColor: '#16a34a',
    showHeader: true,
    headerLabels: ['Metric', 'Current'],
    rows: [
        { key: 'Connection Pool', value: '18 / 20', badge: '90%', badgeColor: '#fef3c7', badgeTextColor: '#b45309' },
        { key: 'Active Queries', value: '7' },
        { key: 'Avg Query Time', value: '4.2 ms' },
        { key: 'Slow Queries', value: '3', badge: 'WARNING', badgeColor: '#fef3c7', badgeTextColor: '#b45309' },
        { key: 'DB Size', value: '2.4 GB' },
        { key: 'Cache Hit Ratio', value: '99.2%', badge: 'GOOD', badgeColor: '#dcfce7', badgeTextColor: '#166534' },
        { key: 'Replication Lag', value: '0.1 s' },
        { key: 'Last Backup', value: '2h ago' },
    ],
    theme: lightTheme,
});
fs.writeFileSync(path.join(OUT, 'kv-database-status-light.svg'), svg4);

// 5. API Endpoints (Dark)
const svg5 = renderKV({
    title: 'API Health Check',
    subtitle: 'Last checked: 12:58:00 UTC',
    showHeader: true,
    headerLabels: ['Endpoint', 'Latency'],
    showCopyBtn: false,
    width: 480,
    rows: [
        { key: '/api/health', value: '2 ms', badge: 'OK', badgeColor: '#1e3a5f', badgeTextColor: '#34d399' },
        { key: '/api/users', value: '45 ms', badge: 'OK', badgeColor: '#1e3a5f', badgeTextColor: '#34d399' },
        { key: '/api/orders', value: '120 ms', badge: 'SLOW', badgeColor: '#3b1818', badgeTextColor: '#f87171' },
        { key: '/api/reports', value: '890 ms', badge: 'CRITICAL', badgeColor: '#3b1818', badgeTextColor: '#ef4444' },
        { key: '/api/auth', value: '12 ms', badge: 'OK', badgeColor: '#1e3a5f', badgeTextColor: '#34d399' },
        { key: '/api/search', value: '67 ms', badge: 'OK', badgeColor: '#1e3a5f', badgeTextColor: '#34d399' },
    ],
    theme: darkTheme,
});
fs.writeFileSync(path.join(OUT, 'kv-api-health-dark.svg'), svg5);

// 6. User Profile / Session (Warm Theme)
const svg6 = renderKV({
    title: 'Active Session',
    subtitle: 'admin@example.com',
    showHeader: false,
    rows: [
        { key: 'User', value: 'James Mitchell' },
        { key: 'Role', value: 'Administrator', badge: 'ADMIN', badgeColor: '#fef3c7', badgeTextColor: '#b45309' },
        { key: 'Session ID', value: 'sess_a1b2c3d4e5' },
        { key: 'Login Time', value: '2026-02-12 10:30' },
        { key: 'IP Address', value: '192.168.1.42' },
        { key: 'User Agent', value: 'Chrome 122' },
        { key: '2FA', value: 'Enabled', badge: 'TOTP', badgeColor: '#dcfce7', badgeTextColor: '#166534' },
    ],
    theme: warmTheme,
    showCopyBtn: true,
});
fs.writeFileSync(path.join(OUT, 'kv-session-warm.svg'), svg6);

console.log(`Generated 6 SVG renderings in ${OUT}:`);
fs.readdirSync(OUT).filter(f => f.endsWith('.svg')).forEach(f => {
    const stat = fs.statSync(path.join(OUT, f));
    console.log(`  ✓ ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
});
