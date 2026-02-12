#!/usr/bin/env node
/**
 * Sprint Tracker CLI — safe to auto-run
 * 
 * Usage (all operations are local file access, no server needed):
 *   node tools/sprint-tracker/log.js start <task_id>
 *   node tools/sprint-tracker/log.js done <task_id> [minutes] [notes...]
 *   node tools/sprint-tracker/log.js log <task_id> <phase> <minutes> [notes...]
 *   node tools/sprint-tracker/log.js status <task_id> <status>
 *   node tools/sprint-tracker/log.js stats
 *   node tools/sprint-tracker/log.js list [status]
 */

'use strict';

const store = require('./data/backlog_store');

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
    console.log('Usage: node tools/sprint-tracker/log.js <command> [args...]');
    console.log('Commands: start, done, log, status, stats, list');
    process.exit(1);
}

// Ensure data is loaded
store.load(true);

switch (cmd) {
    case 'start': {
        const task_id = args[1];
        if (!task_id) { console.error('Usage: start <task_id>'); process.exit(1); }
        try {
            store.update_task(task_id, { status: 'in_progress' });
            console.log(`✓ ${task_id} → in_progress`);
        } catch (e) { console.error(e.message); process.exit(1); }
        break;
    }

    case 'done': {
        const task_id = args[1];
        const minutes = parseInt(args[2]) || 0;
        const notes = args.slice(3).join(' ') || '';
        if (!task_id) { console.error('Usage: done <task_id> [minutes] [notes...]'); process.exit(1); }
        try {
            if (minutes > 0) {
                store.log_time(task_id, {
                    phase: 'implementation',
                    duration_minutes: minutes,
                    notes,
                    agent: 'antigravity',
                    session_id: 'cli'
                });
            }
            store.update_task(task_id, { status: 'done' });
            const stats = store.get_stats();
            console.log(`✓ ${task_id} → done${minutes ? ' (' + minutes + ' min)' : ''}`);
            console.log(`  Sprint: ${stats.done}/${stats.total} (${stats.percent_done}%) | ${stats.remaining_estimated_days}d remaining`);
        } catch (e) { console.error(e.message); process.exit(1); }
        break;
    }

    case 'log': {
        const task_id = args[1];
        const phase = args[2];
        const minutes = parseInt(args[3]) || 0;
        const notes = args.slice(4).join(' ') || '';
        if (!task_id || !phase) { console.error('Usage: log <task_id> <phase> <minutes> [notes...]'); process.exit(1); }
        try {
            store.log_time(task_id, {
                phase,
                duration_minutes: minutes,
                notes,
                agent: 'antigravity',
                session_id: 'cli'
            });
            console.log(`✓ Logged ${minutes}min ${phase} on ${task_id}`);
        } catch (e) { console.error(e.message); process.exit(1); }
        break;
    }

    case 'status': {
        const task_id = args[1];
        const status = args[2];
        if (!task_id || !status) { console.error('Usage: status <task_id> <status>'); process.exit(1); }
        try {
            store.update_task(task_id, { status });
            console.log(`✓ ${task_id} → ${status}`);
        } catch (e) { console.error(e.message); process.exit(1); }
        break;
    }

    case 'stats': {
        const stats = store.get_stats();
        console.log(`Sprint: ${stats.done}/${stats.total} (${stats.percent_done}%) | ${stats.total_hours}h logged | ${stats.remaining_estimated_days}d remaining`);
        if (stats.categories) {
            for (const [cat, info] of Object.entries(stats.categories)) {
                console.log(`  ${info.label}: ${info.done}/${info.total} (${info.percent}%)`);
            }
        }
        break;
    }

    case 'list': {
        const filter_status = args[1];
        const data = store.load();
        let tasks = data.tasks;
        if (filter_status) {
            tasks = tasks.filter(t => t.status === filter_status);
        }
        tasks.forEach(t => {
            const flag = t.status === 'done' ? '✓' : t.status === 'in_progress' ? '▸' : ' ';
            console.log(`  ${flag} ${t.id.padEnd(30)} ${t.status.padEnd(12)} P${t.priority || 2}`);
        });
        console.log(`\n  ${tasks.length} task(s)`);
        break;
    }

    default:
        console.error('Unknown command:', cmd);
        process.exit(1);
}
