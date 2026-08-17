(() => {
  'use strict';

  const BUILD = '70';
  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const storageKey = (y, m) => `fc_${y}_${m}`;

  function readMonth(y, m) {
    try { return JSON.parse(localStorage.getItem(storageKey(y, m))) || {}; }
    catch { return {}; }
  }

  function writeMonth(y, m, value) {
    localStorage.setItem(storageKey(y, m), JSON.stringify(value));
  }

  function mins(t) {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  function hm(value) {
    return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
  }

  function ymd(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function overlaps(a, b, c, d) { return a < d && c < b; }

  function eventsFor(date) {
    const raw = readMonth(date.getFullYear(), date.getMonth());
    return raw[String(date.getDate())]?.events || [];
  }

  function freeSlots(date, startMin, endMin, step = 30) {
    const busy = eventsFor(date)
      .filter(e => !e.done)
      .map(e => e.allday
        ? [0, 1440]
        : [mins(e.start || '00:00'), mins(e.end || e.start || '23:59')]);

    const out = [];
    for (let start = startMin; start + step <= endMin; start += step) {
      const end = start + step;
      if (!busy.some(([a, b]) => overlaps(start, end, a, b))) out.push([start, end]);
    }
    return out;
  }

  function contiguous(slots, duration) {
    const need = Math.ceil(duration / 30);
    for (let i = 0; i < slots.length; i++) {
      let end = slots[i][1];
      let count = 1;
      if (need === 1) return slots[i];
      for (let j = i + 1; j < slots.length && slots[j][0] === end; j++) {
        end = slots[j][1];
        count++;
        if (count >= need) return [slots[i][0], end];
      }
    }
    return null;
  }

  function findSlot({ deadline, duration, from = '09:00', to = '22:00' }) {
    const now = new Date();
    const end = new Date(`${deadline}T23:59:00`);
    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (; cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      let start = mins(from);
      const finish = mins(to);
      if (cursor.toDateString() === now.toDateString()) {
        start = Math.max(start, Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30);
      }
      const hit = contiguous(freeSlots(cursor, start, finish), duration);
      if (hit) return { date: new Date(cursor), start: hit[0], end: hit[1] };
    }
    return null;
  }

  function addEvent(task, slot) {
    const y = slot.date.getFullYear();
    const m = slot.date.getMonth();
    const day = String(slot.date.getDate());
    const raw = readMonth(y, m);
    raw[day] = raw[day] || { events: [] };
    raw[day].events = raw[day].events || [];
    raw[day].events.push({
      id: task.id || `auto_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: task.title,
      memo: task.memo || `FocusCal 自動配置 · 期限 ${task.deadline}`,
      cat: task.cat || 'work',
      pri: task.priority || 'high',
      allday: false,
      start: hm(slot.start),
      end: hm(slot.end),
      done: false,
      peekVisibility: task.peekVisibility || 'full',
      autoPlanned: true,
      autoDeadline: task.deadline,
      autoDuration: Number(task.duration) || 60,
      createdAt: task.createdAt || Date.now(),
      replannedAt: task.replannedAt || null
    });
    writeMonth(y, m, raw);
    return { y, m, d: Number(day), start: hm(slot.start), end: hm(slot.end) };
  }

  function missedAutoTasks(daysBack = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tasks = [];
    for (let i = 1; i <= daysBack; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = String(d.getDate());
      const raw = readMonth(y, m);
      for (const e of raw[day]?.events || []) {
        if (e.autoPlanned && !e.done) tasks.push({ e, y, m, day });
      }
    }
    return tasks;
  }

  function removeTask(task) {
    const raw = readMonth(task.y, task.m);
    const arr = raw[task.day]?.events || [];
    const pos = arr.findIndex(e => e.id === task.e.id);
    if (pos < 0) return;
    arr.splice(pos, 1);
    raw[task.day].events = arr;
    writeMonth(task.y, task.m, raw);
  }

  function plusDaysIso(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return ymd(d);
  }

  function replanMissed() {
    const list = missedAutoTasks();
    let moved = 0;
    let failed = 0;

    for (const taskRecord of list) {
      removeTask(taskRecord);
      const event = taskRecord.e;
      const originalDeadline = event.autoDeadline || plusDaysIso(7);
      const deadline = originalDeadline >= ymd(new Date()) ? originalDeadline : plusDaysIso(7);
      const duration = event.autoDuration || Math.max(30, mins(event.end) - mins(event.start) || 60);
      const task = {
        ...event,
        deadline,
        duration,
        replannedAt: Date.now(),
        memo: `${event.memo || ''}\nFocusCal 自動リプラン`.trim()
      };
      const slot = findSlot({ deadline, duration, from: '09:00', to: '22:00' });
      if (slot) {
        addEvent(task, slot);
        moved++;
      } else {
        addEvent(task, {
          date: new Date(taskRecord.y, taskRecord.m, Number(taskRecord.day)),
          start: mins(event.start || '09:00'),
          end: mins(event.end || '10:00')
        });
        failed++;
      }
    }

    try { window.dispatchEvent(new Event('focuscal:data-changed')); } catch {}
    return { moved, failed, total: list.length };
  }

  const CSS = `
    #fc-ai-overlay{display:none;position:fixed;inset:0;z-index:196;background:rgba(4,4,10,.78);backdrop-filter:blur(10px);align-items:flex-end;justify-content:center}
    #fc-ai-overlay.open{display:flex}
    #fc-ai-sheet{width:min(720px,100%);max-height:92dvh;overflow:auto;background:var(--surface,#13131f);border:1px solid var(--border2,#2c2c46);border-radius:22px 22px 0 0;padding:12px 16px 30px}
    .fc-ai-title{font-size:.9rem;font-weight:900;margin:8px 0 4px}.fc-ai-sub{font-size:.58rem;color:var(--muted);line-height:1.6;margin-bottom:14px}
    .fc-ai-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fc-ai-grid .wide{grid-column:1/-1}
    .fc-ai-in{width:100%;background:var(--bg2);border:1px solid var(--border2);border-radius:11px;color:var(--text);padding:11px;font-size:.7rem}
    .fc-ai-btn{border:0;border-radius:12px;padding:12px;font-weight:850;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;width:100%;margin-top:12px}
    .fc-ai-btn.secondary{background:var(--surface2);border:1px solid var(--border2)}
    .fc-ai-res{margin-top:12px;padding:11px;border:1px solid var(--border);border-radius:11px;font-size:.64rem;color:var(--text2);line-height:1.7}
  `;

  function mount() {
    if ($('#fc-ai-overlay')) return;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', `
      <div id="fc-ai-overlay"><div id="fc-ai-sheet">
        <div id="fc-ai-head"><div class="fc-ai-title">🧠 自動予定最適化</div><div class="fc-ai-sub">期限から逆算して空き時間へ配置。予定が崩れた時は、未完了の自動予定を未来へ組み直します。</div></div>
        <div class="fc-ai-grid">
          <input id="fc-ai-title" class="fc-ai-in wide" placeholder="やること（例：資料作成）">
          <input id="fc-ai-duration" class="fc-ai-in" type="number" min="30" step="30" value="60" placeholder="必要分数">
          <input id="fc-ai-deadline" class="fc-ai-in" type="date">
          <input id="fc-ai-from" class="fc-ai-in" type="time" value="09:00">
          <input id="fc-ai-to" class="fc-ai-in" type="time" value="22:00">
        </div>
        <button id="fc-ai-run" class="fc-ai-btn">空き時間に自動配置</button>
        <button id="fc-ai-replan" class="fc-ai-btn secondary">崩れた予定を自動リプラン</button>
        <div id="fc-ai-res" class="fc-ai-res">予定を入力してください。</div>
      </div></div>`);

    const settings = $('#settings-btn');
    const button = document.createElement('button');
    button.className = 'nav-btn';
    button.id = 'fc-ai-btn';
    button.textContent = '🧠';
    button.title = '自動予定最適化';
    settings?.parentNode?.insertBefore(button, settings);

    const tomorrow = new Date(Date.now() + 864e5);
    $('#fc-ai-deadline').value = ymd(tomorrow);
    button.onclick = () => $('#fc-ai-overlay').classList.add('open');
    $('#fc-ai-overlay').onclick = e => {
      if (e.target.id === 'fc-ai-overlay') e.currentTarget.classList.remove('open');
    };

    $('#fc-ai-run').onclick = () => {
      const task = {
        title: $('#fc-ai-title').value.trim(),
        duration: Number($('#fc-ai-duration').value) || 60,
        deadline: $('#fc-ai-deadline').value,
        from: $('#fc-ai-from').value,
        to: $('#fc-ai-to').value
      };
      if (!task.title || !task.deadline) {
        $('#fc-ai-res').textContent = 'やることと期限を入力してください。';
        return;
      }
      const slot = findSlot(task);
      if (!slot) {
        $('#fc-ai-res').textContent = '指定期間に必要な連続空き時間がありません。時間帯か期限を広げてください。';
        return;
      }
      const result = addEvent(task, slot);
      $('#fc-ai-res').textContent = `✅ ${result.y}/${result.m + 1}/${result.d} ${result.start}〜${result.end} に「${task.title}」を配置しました。`;
      navigator.vibrate?.(12);
      window.FocusCalTelemetry?.track('auto_plan_created', { duration: task.duration });
      try { window.dispatchEvent(new Event('focuscal:data-changed')); } catch {}
    };

    $('#fc-ai-replan').onclick = () => {
      const result = replanMissed();
      $('#fc-ai-res').textContent = result.total
        ? `🔄 ${result.total}件を確認し、${result.moved}件を未来の空き時間へ再配置しました。${result.failed ? ` ${result.failed}件は空き時間がなく元の日付へ戻しました。` : ''}`
        : '再配置が必要な未完了の自動予定はありません。';
      window.FocusCalTelemetry?.track('auto_replan', { moved: result.moved, failed: result.failed });
    };

    if (window.FocusCalSheetGestures) {
      const handle = window.FocusCalSheetGestures.ensureHandle($('#fc-ai-sheet'), $('#fc-ai-head'));
      window.FocusCalSheetGestures.attach($('#fc-ai-sheet'), handle);
    }
  }

  function run() {
    mount();
    window.FocusCalAutoPlanner = { findSlot, addEvent, replanMissed, build: BUILD };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
