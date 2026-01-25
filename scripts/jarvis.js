#!/usr/bin/env node

/**
 * 🤖 JARVIS - AI Development Assistant CLI
 *
 * Quick commands for Dev Board interaction
 *
 * Usage:
 *   node scripts/jarvis.js board          - Show board summary
 *   node scripts/jarvis.js comments       - Show recent comments
 *   node scripts/jarvis.js say <task_id> <message>  - Post a comment
 *   node scripts/jarvis.js status <task_id> <status> - Update task status
 *   node scripts/jarvis.js create <title> - Create new task
 */

const API_URL = process.env.JARVIS_API || 'https://hr.cspace.uz/api/dev-board/ai-sync';

async function fetchBoard() {
  const res = await fetch(API_URL);
  return res.json();
}

async function postComment(taskId, comment) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'comment', task_id: taskId, comment })
  });
  return res.json();
}

async function updateStatus(taskId, status) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update_status', task_id: taskId, status })
  });
  return res.json();
}

async function createTask(title, priority = 'P1') {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_task', title, priority })
  });
  return res.json();
}

async function main() {
  const [,, command, ...args] = process.argv;

  try {
    switch (command) {
      case 'board': {
        const data = await fetchBoard();
        console.log('\n🤖 JARVIS Dev Board Report\n');
        console.log('═══════════════════════════════════════');
        console.log(`📊 Summary:`);
        console.log(`   Backlog: ${data.summary.backlog}`);
        console.log(`   To Do: ${data.summary.todo}`);
        console.log(`   In Progress: ${data.summary.in_progress}`);
        console.log(`   Testing: ${data.summary.testing}`);
        console.log(`   Done: ${data.summary.done}`);
        console.log(`   Total: ${data.summary.total}`);
        console.log('═══════════════════════════════════════\n');
        break;
      }

      case 'comments': {
        const data = await fetchBoard();
        console.log('\n🤖 JARVIS - Recent Comments\n');
        console.log('═══════════════════════════════════════');
        data.recentComments.slice(0, 10).forEach(c => {
          const time = new Date(c.created_at).toLocaleString();
          console.log(`\n💬 ${c.author} (${time})`);
          console.log(`   Task: ${c.dev_tasks?.title}`);
          console.log(`   "${c.content.substring(0, 100)}${c.content.length > 100 ? '...' : ''}"`);
        });
        console.log('\n═══════════════════════════════════════\n');
        break;
      }

      case 'say': {
        const [taskId, ...messageParts] = args;
        const message = messageParts.join(' ');
        if (!taskId || !message) {
          console.log('Usage: jarvis say <task_id> <message>');
          break;
        }
        const result = await postComment(taskId, message);
        if (result.success) {
          console.log('✅ Comment posted as Jarvis!');
        } else {
          console.log('❌ Failed:', result.error);
        }
        break;
      }

      case 'status': {
        const [taskId, status] = args;
        if (!taskId || !status) {
          console.log('Usage: jarvis status <task_id> <backlog|todo|in_progress|testing|done>');
          break;
        }
        const result = await updateStatus(taskId, status);
        if (result.success) {
          console.log(`✅ Task moved to ${status}!`);
        } else {
          console.log('❌ Failed:', result.error);
        }
        break;
      }

      case 'create': {
        const title = args.join(' ');
        if (!title) {
          console.log('Usage: jarvis create <task title>');
          break;
        }
        const result = await createTask(title);
        if (result.success) {
          console.log(`✅ Task created: ${result.task.id}`);
        } else {
          console.log('❌ Failed:', result.error);
        }
        break;
      }

      default:
        console.log(`
🤖 JARVIS - AI Development Assistant

Commands:
  board              Show board summary
  comments           Show recent comments
  say <id> <msg>     Post comment to task
  status <id> <s>    Update task status
  create <title>     Create new task

Example:
  node scripts/jarvis.js board
  node scripts/jarvis.js say abc-123 "Working on this now!"
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
