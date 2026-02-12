/**
 * Sprint Tracker — Agent Client Helpers
 * 
 * Convenience module for AI agents to log time and update task status.
 * Agents require this module and call the functions during their work sessions.
 * 
 * Usage:
 *   const tracker = require('./tools/sprint-tracker/tracker_client_helpers');
 *   
 *   // Log time for a phase
 *   await tracker.log_time('btn-pill-variant', {
 *       phase: 'implementation',
 *       session_id: 'conv-abc123',
 *       duration_minutes: 45,
 *       notes: 'Added pill variant CSS and JS class'
 *   });
 *   
 *   // Update task status
 *   await tracker.update_status('btn-pill-variant', 'done');
 *   
 *   // Get stats
 *   const stats = await tracker.get_stats();
 * 
 * Environment Variables:
 *   TRACKER_URL (default: http://localhost:3700)
 */

'use strict';

const http = require('http');
const url = require('url');

const BASE_URL = process.env.TRACKER_URL || 'http://localhost:3700';

// ── HTTP helpers ──────────────────────────────────────────

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const parsed = url.parse(BASE_URL + path);
        const options = {
            hostname: parsed.hostname,
            port: parsed.port,
            path: parsed.path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', err => {
            // If the server isn't running, try direct file access
            reject(new Error(`Sprint Tracker server not reachable at ${BASE_URL}: ${err.message}. Start it with: node tools/sprint-tracker/tracker_server.js`));
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ── Public API ────────────────────────────────────────────

/**
 * Get aggregate stats.
 * @returns {Promise<Object>}
 */
async function get_stats() {
    return request('GET', '/api/stats');
}

/**
 * Get all tasks (with optional filters).
 * @param {Object} [filters] - { status, category, priority }
 * @returns {Promise<Array>}
 */
async function get_tasks(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return request('GET', '/api/tasks' + (params ? '?' + params : ''));
}

/**
 * Get a single task by ID.
 * @param {string} task_id
 * @returns {Promise<Object>}
 */
async function get_task(task_id) {
    return request('GET', `/api/tasks/${task_id}`);
}

/**
 * Update task fields.
 * @param {string} task_id
 * @param {Object} patch - Fields to update (e.g. { status: 'in_progress', notes: '...' })
 * @returns {Promise<Object>}
 */
async function update_task(task_id, patch) {
    return request('PATCH', `/api/tasks/${task_id}`, patch);
}

/**
 * Shorthand: update task status.
 * @param {string} task_id
 * @param {string} status - 'not_started' | 'planning' | 'in_progress' | 'testing' | 'done'
 * @returns {Promise<Object>}
 */
async function update_status(task_id, status) {
    return update_task(task_id, { status });
}

/**
 * Log time spent on a task phase.
 * @param {string} task_id
 * @param {Object} entry - { phase, session_id, duration_minutes, notes, agent }
 *   phase: 'planning' | 'implementation' | 'testing' | 'e2e_testing' | 'bug_fixing'
 * @returns {Promise<Object>}
 */
async function log_time(task_id, entry) {
    return request('POST', `/api/tasks/${task_id}/log`, entry);
}

/**
 * Convenience: start a work phase (sets status + logs start time).
 * Returns a function to call when the phase is complete.
 * @param {string} task_id
 * @param {string} phase
 * @param {string} session_id - Conversation/session identifier
 * @returns {Promise<Function>} Call the returned function with (minutes, notes) to complete the phase.
 */
async function start_phase(task_id, phase, session_id) {
    // Set status based on phase
    const status_map = {
        planning: 'planning',
        implementation: 'in_progress',
        testing: 'testing',
        e2e_testing: 'testing',
        bug_fixing: 'in_progress'
    };
    await update_status(task_id, status_map[phase] || 'in_progress');

    const started_at = new Date().toISOString();

    // Return a completion function
    return async function end_phase(duration_minutes, notes) {
        return log_time(task_id, {
            phase,
            session_id,
            started_at,
            ended_at: new Date().toISOString(),
            duration_minutes,
            notes: notes || '',
            agent: 'antigravity'
        });
    };
}

/**
 * Convenience: mark task as done.
 * @param {string} task_id
 * @returns {Promise<Object>}
 */
async function complete_task(task_id) {
    return update_status(task_id, 'done');
}

module.exports = {
    get_stats,
    get_tasks,
    get_task,
    update_task,
    update_status,
    log_time,
    start_phase,
    complete_task,
    BASE_URL
};
