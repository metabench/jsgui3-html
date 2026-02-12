/**
 * Backlog Store
 * 
 * Read/write module for backlog.json.
 * Provides CRUD operations and time logging for sprint tasks.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'backlog.json');

let _cache = null;

/**
 * Load backlog from disk (with caching).
 * @param {boolean} [force=false] - Force re-read from disk.
 * @returns {Object} The full backlog object.
 */
function load(force = false) {
    if (_cache && !force) return _cache;
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    _cache = JSON.parse(raw);
    return _cache;
}

/**
 * Save backlog to disk (atomic write via temp file).
 * @param {Object} [data] - Data to save (defaults to cache).
 */
function save(data) {
    data = data || _cache;
    if (!data) throw new Error('No data to save');
    data.meta.last_updated = new Date().toISOString();
    const tmp = DATA_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, DATA_PATH);
    _cache = data;
}

/**
 * Get tasks with optional filtering.
 * @param {Object} [filters] - { status, category, priority, control, tag }
 * @returns {Array} Filtered tasks.
 */
function get_tasks(filters = {}) {
    const data = load();
    let tasks = data.tasks;

    if (filters.status) {
        tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters.category) {
        tasks = tasks.filter(t => t.category === filters.category);
    }
    if (filters.priority) {
        tasks = tasks.filter(t => t.priority === filters.priority);
    }
    if (filters.control) {
        tasks = tasks.filter(t => t.control === filters.control);
    }
    if (filters.tag) {
        tasks = tasks.filter(t => t.tags && t.tags.includes(filters.tag));
    }
    if (filters.chapter) {
        tasks = tasks.filter(t => t.chapter === filters.chapter);
    }

    return tasks;
}

/**
 * Get a single task by ID.
 * @param {string} id - Task ID.
 * @returns {Object|null} Task or null.
 */
function get_task(id) {
    const data = load();
    return data.tasks.find(t => t.id === id) || null;
}

/**
 * Update a task (partial patch).
 * @param {string} id - Task ID.
 * @param {Object} patch - Fields to update.
 * @returns {Object} Updated task.
 */
function update_task(id, patch) {
    const data = load();
    const task = data.tasks.find(t => t.id === id);
    if (!task) throw new Error(`Task not found: ${id}`);

    // Apply patch (shallow merge, except nested objects)
    for (const [key, value] of Object.entries(patch)) {
        if (key === 'id') continue; // Can't change ID
        if (key === 'time_logs') continue; // Use log_time instead
        if (key === 'phase_totals') continue; // Computed from logs
        task[key] = value;
    }

    // Auto-set completed_at when status changes to done
    if (patch.status === 'done' && !task.completed_at) {
        task.completed_at = new Date().toISOString();
    }

    save(data);
    return task;
}

/**
 * Log time spent on a task phase.
 * @param {string} task_id - Task ID.
 * @param {Object} entry - { phase, session_id, started_at, ended_at, duration_minutes, notes, agent }
 * @returns {Object} Updated task.
 */
function log_time(task_id, entry) {
    const data = load();
    const task = data.tasks.find(t => t.id === task_id);
    if (!task) throw new Error(`Task not found: ${task_id}`);

    const valid_phases = data.phases || ['planning', 'implementation', 'testing', 'e2e_testing', 'bug_fixing'];
    if (!valid_phases.includes(entry.phase)) {
        throw new Error(`Invalid phase: ${entry.phase}. Valid: ${valid_phases.join(', ')}`);
    }

    const log_entry = {
        session_id: entry.session_id || 'unknown',
        agent: entry.agent || 'antigravity',
        phase: entry.phase,
        started_at: entry.started_at || new Date().toISOString(),
        ended_at: entry.ended_at || null,
        duration_minutes: entry.duration_minutes || entry.minutes || 0,
        notes: entry.notes || ''
    };

    task.time_logs.push(log_entry);

    // Recompute phase totals
    task.phase_totals = { planning: 0, implementation: 0, testing: 0, e2e_testing: 0, bug_fixing: 0 };
    for (const log of task.time_logs) {
        if (log.phase && log.duration_minutes) {
            task.phase_totals[log.phase] = (task.phase_totals[log.phase] || 0) + log.duration_minutes;
        }
    }

    save(data);
    return task;
}

/**
 * Get aggregate statistics.
 * @returns {Object} Stats summary.
 */
function get_stats() {
    const data = load();
    const tasks = data.tasks;

    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const in_progress = tasks.filter(t => t.status === 'in_progress' || t.status === 'planning' || t.status === 'testing').length;
    const not_started = tasks.filter(t => t.status === 'not_started').length;

    // Time spent
    let total_minutes = 0;
    const phase_minutes = { planning: 0, implementation: 0, testing: 0, e2e_testing: 0, bug_fixing: 0 };
    for (const task of tasks) {
        for (const [phase, mins] of Object.entries(task.phase_totals || {})) {
            phase_minutes[phase] = (phase_minutes[phase] || 0) + mins;
            total_minutes += mins;
        }
    }

    // Estimated vs actual for completed tasks
    const completed = tasks.filter(t => t.status === 'done');
    let total_estimated_days = 0;
    let total_actual_days = 0;
    for (const task of completed) {
        total_estimated_days += task.estimated_days || 0;
        const actual_mins = Object.values(task.phase_totals || {}).reduce((a, b) => a + b, 0);
        total_actual_days += actual_mins / 480; // 8-hour day
    }

    // Remaining estimate
    const remaining = tasks.filter(t => t.status !== 'done');
    const remaining_estimated_days = remaining.reduce((sum, t) => sum + (t.estimated_days || 0), 0);

    // Per-category breakdown
    const categories = {};
    for (const [key, label] of Object.entries(data.categories || {})) {
        const cat_tasks = tasks.filter(t => t.category === key);
        const cat_done = cat_tasks.filter(t => t.status === 'done').length;
        categories[key] = {
            label,
            total: cat_tasks.length,
            done: cat_done,
            percent: cat_tasks.length > 0 ? Math.round((cat_done / cat_tasks.length) * 100) : 0,
            estimated_days: cat_tasks.reduce((s, t) => s + (t.estimated_days || 0), 0)
        };
    }

    // Recent activity (last 10 time logs across all tasks)
    const all_logs = [];
    for (const task of tasks) {
        for (const log of task.time_logs || []) {
            all_logs.push({ ...log, task_id: task.id, task_title: task.title });
        }
    }
    all_logs.sort((a, b) => (b.started_at || '').localeCompare(a.started_at || ''));
    const recent_activity = all_logs.slice(0, 10);

    return {
        total,
        done,
        in_progress,
        not_started,
        percent_done: Math.round((done / total) * 100),
        total_minutes,
        total_hours: Math.round(total_minutes / 60 * 10) / 10,
        phase_minutes,
        estimated_days_total: tasks.reduce((s, t) => s + (t.estimated_days || 0), 0),
        remaining_estimated_days,
        accuracy: total_estimated_days > 0 ? Math.round((total_actual_days / total_estimated_days) * 100) : null,
        categories,
        recent_activity
    };
}

/**
 * Add a new task.
 * @param {Object} task - Task object (must have id and title).
 * @returns {Object} Created task.
 */
function add_task(task) {
    const data = load();
    if (!task.id || !task.title) throw new Error('Task must have id and title');
    if (data.tasks.find(t => t.id === task.id)) throw new Error(`Task already exists: ${task.id}`);

    const new_task = {
        id: task.id,
        title: task.title,
        category: task.category || 'polish',
        chapter: task.chapter || '',
        control: task.control || null,
        priority: task.priority || 'P1',
        estimated_days: task.estimated_days || 1,
        status: 'not_started',
        tags: task.tags || [],
        notes: task.notes || '',
        time_logs: [],
        phase_totals: { planning: 0, implementation: 0, testing: 0, e2e_testing: 0, bug_fixing: 0 },
        completed_at: null
    };

    data.tasks.push(new_task);
    save(data);
    return new_task;
}

/**
 * Delete a task.
 * @param {string} id - Task ID.
 * @returns {boolean} True if deleted.
 */
function delete_task(id) {
    const data = load();
    const idx = data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    data.tasks.splice(idx, 1);
    save(data);
    return true;
}

module.exports = {
    load,
    save,
    get_tasks,
    get_task,
    update_task,
    log_time,
    get_stats,
    add_task,
    delete_task,
    DATA_PATH
};
