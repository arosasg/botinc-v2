/* eslint-disable */
// @ts-nocheck
// V18 — the workflow lives in the issue's side pane and the header shows where
// the run is; the model picker is one searchable list grouped by provider with
// a single Auto on top. Layered over V17: window.BotincFlowWorkspace18(Base).
(function () {
  var DONE = { done: 1, needs: 1, skipped: 1 };
  var mmss = function (ms) {
    var s = Math.max(0, Math.floor(ms / 1000)), m = Math.floor(s / 60), h = Math.floor(m / 60);
    s = s % 60; m = m % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  };
  var firstWord = function (label) { return String(label || "").split(/[\s\u00b7]/)[0].toLowerCase(); };
  // The wider catalog behind each provider. The first three of a section are
  // the provider's own headline models; the rest sit behind "Show more".
  var MODELS18 = {
    claude: ["Claude Haiku 5", "Claude Opus 4.1", "Claude Sonnet 4.5", "Claude Haiku 4.5"],
    codex: ["GPT-5.5 Codex", "GPT-5.4 Mini", "o5", "o4-mini"],
    openrouter: ["Claude Fable 5", "Claude Haiku 5", "GPT-5.5 Codex", "Gemini 3 Pro", "Gemini 3 Flash", "DeepSeek V4", "Kimi K3", "Qwen 3.5 Coder", "Grok 5"],
  };
  var FEATURED18 = 3;

  window.BotincFlowWorkspace18 = function (Base) {
    return class extends Base {
      componentDidMount() {
        if (super.componentDidMount) super.componentDidMount();
        var self = this;
        this._wfStart18 = {};
        // A second-hand for the running step. Ticks only while something runs.
        this._wfTick18 = setInterval(function () { if (self._wfTicking18 && self.state.view === "thread9") self.forceUpdate(); }, 1000);
      }
      componentWillUnmount() {
        if (super.componentWillUnmount) super.componentWillUnmount();
        clearInterval(this._wfTick18);
      }

      // ------------------------------------------------------ model picker
      accountServes(a, m) {
        return super.accountServes(a, m) || (MODELS18[a.provider] || []).indexOf(m) >= 0;
      }
      mpModels18(p) {
        var out = (p.models || []).slice();
        (MODELS18[p.id] || []).forEach(function (m) { if (out.indexOf(m) < 0) out.push(m); });
        return out;
      }
      mpDrill15() {
        super.mpDrill15();
        this.setState({ mpQuery18: "", mpMore18: {} });
        setTimeout(function () { var el = document.querySelector(".mp-search18 input"); if (el && el.focus) el.focus(); }, 40);
      }
      pickModel18(model, providerId) {
        var before = this.route17();
        this.setState({ model: model, provider10: providerId || this.state.provider10 || "claude", mpMode15: "summary", mpQuery18: "" });
        if (this.state.view === "chat" && this.currentChat()) this.updateChat({ model: model });
        this.noteModelChange17(model, before);
      }
      mpGroups18() {
        var self = this, s = this.state, q = String(s.mpQuery18 || "").trim().toLowerCase();
        var model = s.model || "Auto";
        var provs = this.providerCatalog().filter(function (p) { return p.routable && p.models && p.models.length; });
        var curProv = provs.find(function (p) { return p.id === s.provider10 && p.models.indexOf(model) >= 0; })
          || provs.find(function (p) { return p.models.indexOf(model) >= 0; });
        return provs.map(function (p) {
          var accts = self.accountsFor(s.member).filter(function (a) {
            return a.provider === p.id && self.accountUsable(a) && (a.kind === "subscription" || (a.kind === "api" && a.enabled));
          });
          var live = accts.filter(function (a) { var l = self.minLeft17(a); return a.kind === "api" || l === null || l > 0; }).length;
          var meta = p.kind === "api" ? (accts.length ? "API key \u00b7 pays per call" : "No key connected")
            : accts.length ? live + " of " + accts.length + " account" + (accts.length === 1 ? "" : "s") + " live" : "No account connected";
          var hit = p.name.toLowerCase().indexOf(q) >= 0;
          var all = self.mpModels18(p);
          var matched = all.filter(function (m) { return !q || hit || m.toLowerCase().indexOf(q) >= 0; });
          var expanded = !!(s.mpMore18 || {})[p.id];
          var hidden = !q && !expanded && matched.length > FEATURED18 ? matched.length - FEATURED18 : 0;
          var shown = hidden ? matched.slice(0, FEATURED18) : matched;
          var rows = shown.map(function (m) {
            var serving = accts.filter(function (a) { return self.accountServes(a, m); });
            var subs = serving.filter(function (a) { return a.kind === "subscription"; })
              .sort(function (a, b) { return (self.minLeft17(b) === null ? 100 : self.minLeft17(b)) - (self.minLeft17(a) === null ? 100 : self.minLeft17(a)); });
            var best = subs[0], l = best ? self.minLeft17(best) : null;
            var copy = p.kind === "api" ? (serving.length ? "Via your " + p.name + " key" : "Connect a key to use it")
              : best ? self.acctName17(best) + (l === null ? "" : " \u00b7 " + (100 - l) + "% used") + (subs.length > 1 ? " \u00b7 +" + (subs.length - 1) + " more" : "")
              : serving.length ? "API key only" : "No account serves it";
            var bar = self.routeBar17(l);
            var on = m === model && curProv && curProv.id === p.id;
            return { key: p.id + "|" + m, name: m, copy: copy, cls: (on ? "selected" : "") + (!serving.length ? " unavailable" : ""), check: on ? "\u2713" : "",
              hasBar: !!best && l !== null, barStyle: bar.style, barTone: bar.tone, barTitle: best ? self.acctName17(best) + " \u00b7 " + (100 - l) + "% used" : "",
              pick: function () { self.pickModel18(m, p.id); } };
          });
          var canFold = !q && matched.length > FEATURED18;
          return { key: p.id, id: p.id, name: p.name, meta: meta, rows: rows,
            hasMore: canFold, expanded: expanded, moreLabel: hidden ? "Show " + hidden + " more" : "Show less",
            toggleMore: function () { self.setState({ mpMore18: Object.assign({}, s.mpMore18 || {}, { [p.id]: !expanded }) }); },
            logo: p.id === "openrouter" ? "assets/providers/openrouter.svg" : "assets/providers/" + p.id + "-v8.svg",
            logoClass: p.id === "codex" ? "mono-logo" : "" };
        }).filter(function (g) { return g.rows.length; });
      }

      // ------------------------------------ editing, queueing, steering
      openIssue(...args) {
        var out = super.openIssue(...args);
        if (this.state.editIdx18 != null) this.setState({ editIdx18: null });
        return out;
      }
      threadList18() {
        var issue = this.state.view === "thread9" ? this.issue() : null;
        return issue ? ((this.state.threadMessages9 || {})[issue.id] || []) : [];
      }
      setThread18(list) {
        var issue = this.issue();
        this.setState({ threadMessages9: Object.assign({}, this.state.threadMessages9 || {}, { [issue.id]: list }) });
      }
      // A steer lands now: the running step reads it before its next action.
      steer18(text) {
        text = String(text || "").trim();
        var issue = this.state.view === "thread9" ? this.issue() : null;
        if (!text) return;
        if (!issue) {
          var chat = this.currentChat(); if (!chat) return;
          this.updateChat({ messages: (chat.messages || []).concat([{ author: this.state.member, text: text, hasAvatar: false, cls: "message user-message" }]) });
          this.setDraft12("");
          this.toast("Sent now. The current turn continues with your note.");
          return;
        }
        this.appendThread9(issue.id, this.state.member, text);
        this._lastSend17 = Date.now(); this._lastSendKey17 = this.convKey17();
        this.logRoute17({ text: "Steered mid-run \u00b7 the running step takes this into account before its next action", tone: "tone-midrun17", seq: this.threadList18().length + 1 });
        this.setDraft12("");
        this.toast("Sent now. The current turn continues with your note.");
      }
      // Editing an earlier message replays the conversation from that point.
      editSend18() {
        var s = this.state, i = s.editIdx18, text = String(s.editDraft18 || "").trim();
        if (i == null || !text) return;
        var list = this.threadList18();
        var dropped = list.length - i - 1;
        this.setThread18(list.slice(0, i));
        this.setState({ editIdx18: null });
        var self = this;
        setTimeout(function () {
          self.setDraft12(text);
          setTimeout(function () {
            self.sendComposer11();
            self.logRoute17({ text: "Message edited \u00b7 " + (dropped > 0 ? dropped + " later message" + (dropped === 1 ? "" : "s") + " replaced" : "resent") + " \u00b7 files already changed stay", tone: "", seq: i + 1 });
          }, 0);
        }, 0);
      }
      forkFrom18(i) {
        var t = this.state, o = this.issue();
        if (!o) return;
        var msgs = this.threadList18().slice(0, i + 1);
        var s = [{ author: t.member, text: o.description, hasAvatar: false, cls: "message user-message" }]
          .concat(msgs.map(function (d) { return { author: d.who, text: d.text, hasAvatar: d.who === "Operator", cls: "message" }; }));
        var id = "fork-" + Date.now();
        var chat = { id: id, title: "Fork \u00b7 " + o.title, agent: "operator", model: t.model, phase: "paused", result: false, messages: s, forkOf18: o.id, forkAt18: i + 1 };
        this.setState({ chats: Object.assign({}, t.chats, { [t.member]: [chat].concat(t.chats[t.member] || []) }) });
        this.loadChat9(id);
        this.toast("Forked after message " + (i + 1) + ". " + o.id + " is untouched.");
      }

      // ----------------------------------------------- where the run is
      wfGraph18() {
        var id = this.detectWorkflow17();
        var g = (this.stashGraph14() || {})[id];
        var w = (this.state.workflows14 || []).find(function (x) { return x.id === id; });
        return g && g.draft ? { id: id, graph: g.draft, meta: w || {} } : null;
      }
      wfOrder18(graph) {
        var byId = {}; graph.nodes.forEach(function (n) { byId[n.id] = n; });
        var main = [], loops = [], seen = {};
        var start = graph.nodes.find(function (n) { return n.type === "start"; }) || graph.nodes[0];
        var queue = start ? [start.id] : [];
        while (queue.length) {
          var id = queue.shift();
          if (seen[id] || !byId[id]) continue;
          seen[id] = true;
          var n = byId[id];
          if (n.type === "repeat") { loops.push(n); continue; }
          main.push(n);
          graph.edges.filter(function (e) { return e.from === id; }).forEach(function (e) { queue.push(e.to); });
        }
        return { main: main, loops: loops };
      }
      wfMatchStage18(node, stages, used) {
        var first = firstWord(node.label);
        var i = stages.findIndex(function (st, k) {
          if (used[k]) return false;
          return node.type === "repeat" ? /follow-up|revis/i.test(st.stage) : firstWord(st.stage) === first;
        });
        if (i < 0) return null;
        used[i] = true;
        return stages[i];
      }
      wfPlan18() {
        var issue = this.state.view === "thread9" ? this.issue() : null;
        if (!issue) return null;
        var g = this.wfGraph18(); if (!g) return null;
        var self = this, ord = this.wfOrder18(g.graph), used = {};
        var stages = this.stageData12(issue) || [];
        var status = issue.status;
        var finished = status === "Merged dev" || status === "Done";
        var inReview = status === "Ready for review", running = status === "Running", paused = status === "Paused";
        var blocked = status === "Blocked", canceled = status === "Canceled";
        var decision = this.decision9(issue.id);
        var reviews = stages.filter(function (x) { return /^Review/.test(x.stage); });
        var revised = stages.some(function (x) { return x.status === "Changes requested"; }) && stages.some(function (x) { return /follow-up|revis/i.test(x.stage); });
        var steps = ord.main.map(function (n) {
          var stage = n.type === "task" ? self.wfMatchStage18(n, stages, used) : null, st;
          if (n.type === "start") st = stages.length || finished ? "done" : "upcoming";
          else if (n.type === "task") st = stage ? (stage.status === "In progress" ? "running" : stage.status === "Paused" ? "paused" : stage.status === "Changes requested" ? "needs" : "done") : finished ? "done" : "upcoming";
          else if (n.type === "condition") st = finished || inReview || (reviews.length && reviews.every(function (x) { return x.status !== "In progress"; }) && !running) ? "done" : "upcoming";
          else if (n.type === "approval") st = finished ? "done" : inReview ? "waiting" : "upcoming";
          else if (n.type === "question") st = finished ? "done" : decision && !decision.resolved && decision.kind === "answer" ? "waiting" : "upcoming";
          else if (n.type === "finish") st = finished ? "done" : "upcoming";
          else st = "upcoming";
          return { n: n, stage: stage, st: st };
        });
        var cur = steps.find(function (x) { return !DONE[x.st]; }) || null;
        // A condition takes no time. If the run sits on one, the work is really
        // in the last task before it (the reviews are still coming back).
        if (cur && cur.n.type === "condition" && (running || paused || blocked || this.midRun17())) {
          var idx = steps.indexOf(cur), prev = null;
          for (var k = idx - 1; k >= 0; k--) if (steps[k].n.type === "task") { prev = steps[k]; break; }
          if (prev) { prev.st = "upcoming"; cur = prev; }
        }
        var mid = this.midRun17();
        var since = null;
        if (cur) {
          if (canceled) cur.st = "canceled";
          else if (blocked) cur.st = "stuck";
          else if (paused && cur.st !== "waiting") cur.st = "paused";
          else if (mid) cur.st = "running";
          else if (running && cur.st === "upcoming") cur.st = "running";
          if (cur.st === "running") {
            if (mid) since = this._lastSend17;
            else { this._wfStart18 = this._wfStart18 || {}; since = this._wfStart18[issue.id] = this._wfStart18[issue.id] || (Date.now() - 134000); }
          }
        }
        var loops = ord.loops.map(function (n) {
          var stage = self.wfMatchStage18(n, stages, used);
          var tries = stage ? 1 : 0;
          return { n: n, stage: stage, st: stage ? "done" : "idle", tries: tries, limit: Number(n.limit || 1) };
        });
        return { issue: issue, graph: g, stages: stages, steps: steps, loops: loops, cur: cur, since: since, finished: finished && !cur, revised: revised, decision: decision, mid: mid };
      }
      wfStepDetail18(x, plan) {
        var n = x.n, stage = x.stage, self = this;
        if (n.type === "task" || n.type === "repeat") {
          var head = (n.model || "Auto") + " \u00b7 " + (n.effort || "Medium") + " effort";
          if (stage) return head + " \u00b7 " + stage.duration + " \u00b7 " + this.cash(stage.cost);
          var r = this.route17(n.model || "Auto");
          return head + " \u00b7 would run on " + this.routeLabel17(r);
        }
        if (n.type === "condition") return this.ruleLabel14(n) + (DONE[x.st] ? " \u2192 " + (plan.revised ? "no once, then yes" : "yes") : "");
        if (n.type === "approval") return x.st === "waiting" ? "Waiting for you since " + this.wfLastWhen18(plan) + ". Nothing merges on its own." : DONE[x.st] ? "Approved by you" : n.note || "Stops for you before merge";
        if (n.type === "question") return x.st === "waiting" ? "Waiting for your answer" : n.note || "Asks you before continuing";
        if (n.type === "finish") return DONE[x.st] ? "Result reported \u00b7 pull request linked" : n.note || "Reports the result";
        if (n.type === "start") return plan.stages.length ? "Started " + plan.stages[0].when : n.note || "";
        return n.note || "";
      }
      wfLastWhen18(plan) {
        var last = plan.stages[plan.stages.length - 1];
        return last ? String(last.when).replace(/^.*,\s*/, "") : "just now";
      }
      wfStateLabel18(x, plan) {
        if (x.st === "running") return plan.since ? mmss(Date.now() - plan.since) : "Running";
        return { done: x.n.type === "approval" ? "Approved" : "Done", needs: "Changes", waiting: "Waiting", stuck: "Stuck", paused: "Paused", canceled: "Canceled", idle: "Not needed", upcoming: "" }[x.st] || "";
      }
      wfTone18(plan) {
        if (!plan.cur) return plan.finished ? "finished" : "idle";
        return { running: "running", waiting: "waiting", stuck: "stuck", paused: "paused", canceled: "stuck", upcoming: "queued" }[plan.cur.st] || "queued";
      }

      // ------------------------------------------------------- renderVals
      renderVals() {
        var v = super.renderVals();
        var self = this, s = this.state;
        var o = function (patch) { self.setState(patch); };

        // Model picker: one searchable list, Auto on top, providers as sections.
        var q = String(s.mpQuery18 || "").trim();
        v.mpQuery18 = s.mpQuery18 || "";
        v.mpHasQuery18 = !!q;
        v.mpQueryEdit18 = function (e) { o({ mpQuery18: e.target.value }); };
        v.mpQueryClear18 = function () { o({ mpQuery18: "" }); var el = document.querySelector(".mp-search18 input"); if (el) el.focus(); };
        v.mpQueryKey18 = function (e) { if (e.key === "Escape" && q) { e.stopPropagation(); o({ mpQuery18: "" }); } };
        if (v.mpPickList15) {
          v.mpGroups18 = this.mpGroups18();
          v.mpShowAuto18 = !q || "auto".indexOf(q.toLowerCase()) >= 0;
          v.mpEmpty18 = !v.mpShowAuto18 && !v.mpGroups18.length;
          var ra = this.route17("Auto");
          v.mpAutoCopy18 = "Best fit for each task" + (ra.account ? " \u00b7 next on " + this.acctName17(ra.account) : ra.kind === "credits" ? " \u00b7 BotInc credits" : "");
          v.mpAutoCls18 = (s.model || "Auto") === "Auto" ? "selected" : "";
          v.mpAutoCheck18 = (s.model || "Auto") === "Auto" ? "\u2713" : "";
          v.mpPickAuto18 = function () { self.pickModel18("Auto", s.provider10); };
          v.pickerClass11 = (v.pickerClass11 || "") + " mp-list18";
        } else { v.mpGroups18 = []; v.mpShowAuto18 = false; v.mpEmpty18 = false; }

        // Editing, queueing and steering in the conversation.
        var running18 = !!v.running12;
        var editIdx = s.editIdx18;
        if (s.view === "thread9" && Array.isArray(v.threadMessages9)) {
          var real = -1;
          v.threadMessages9 = v.threadMessages9.map(function (m) {
            if (m.route17) return m;
            var i = ++real, mine = m.who === s.member, editing = mine && editIdx === i;
            return Object.assign({}, m, {
              mine18: mine, editing18: editing, cls18: (mine ? "mine18" : "") + (editing ? " editing18" : ""),
              edit18: function () { o({ editIdx18: i, editDraft18: m.text }); setTimeout(function () { var el = document.querySelector(".msg-edit18 textarea"); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 40); },
              fork18: function () { self.forkFrom18(i); },
              copy18: function () { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m.text); self.toast("Message copied."); },
            });
          });
        }
        v.editDraft18 = s.editDraft18 || "";
        v.editDraftEdit18 = function (e) { o({ editDraft18: e.target.value }); };
        v.editCancel18 = function () { o({ editIdx18: null }); };
        v.editSend18 = function () { self.editSend18(); };
        v.editSteer18 = function () { var t = String(s.editDraft18 || "").trim(); o({ editIdx18: null }); self.steer18(t); };
        v.editQueue18 = function () {
          var t = String(s.editDraft18 || "").trim(); if (!t) return;
          var key = self.key12();
          o({ editIdx18: null, queues12: Object.assign({}, s.queues12 || {}, { [key]: ((s.queues12 || {})[key] || []).concat([{ id: "q" + Date.now(), text: t, attachments: [] }]) }) });
          self.toast("Queued. It goes out when the current turn finishes.");
        };
        v.editKey18 = function (e) {
          if (e.key === "Escape") { e.preventDefault(); o({ editIdx18: null }); }
          else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (running18) v.editSteer18(); else self.editSend18(); }
        };
        v.editHint18 = running18 ? "Steer sends it now and the current turn reads it. Queue sends it after." : "Replies after this message are replaced. Files already changed stay.";
        var qkey = this.key12(), qlist = (s.queues12 || {})[qkey] || [];
        var setQueue = function (next) { o({ queues12: Object.assign({}, s.queues12 || {}, { [qkey]: next }) }); };
        var move = function (from, to) { if (to < 0 || to >= qlist.length) return; var n = qlist.slice(); var it = n.splice(from, 1)[0]; n.splice(to, 0, it); setQueue(n); };
        var base12 = Array.isArray(v.queueRows12) ? v.queueRows12 : [];
        v.queueRows18 = qlist.map(function (q, i) {
          var b = base12[i] || {};
          return { key: q.id, n: i + 1, text: q.text, first: i === 0, last: i === qlist.length - 1,
            up: function () { move(i, i - 1); }, down: function () { move(i, i + 1); },
            edit: b.edit || function () {}, remove: b.remove || function () { setQueue(qlist.filter(function (x) { return x.id !== q.id; })); },
            steer: function () { setQueue(qlist.filter(function (x) { return x.id !== q.id; })); setTimeout(function () { self.steer18(q.text); }, 0); } };
        });
        v.queueHint18 = running18 ? "sent in this order when the current turn finishes" : "sent in this order when the run resumes";
        v.queueMany18 = qlist.length > 1;
        v.queueClear18 = function () { setQueue([]); };
        v.steerNow18 = function () { var d = s.view === "thread9" ? s.threadDraft9 : s.draft; self.steer18(d); };
        v.sendLabel18 = running18 ? "Queue message \u00b7 sent after the current turn" : "Send message";
        v.sendIcon18 = running18 ? "i15.svg#clock" : "i15.svg#arrow-up";
        v.sendCls18 = running18 ? "queue-send18" : "";

        // The workflow: header line + side pane.
        var plan = s.view === "thread9" ? this.wfPlan18() : null;
        this._wfTicking18 = !!(plan && plan.cur && plan.cur.st === "running");
        v.wfLive18 = !!plan && (plan.stages.length > 0 || plan.finished);
        v.wfPane18 = s.view === "thread9" && s.inspectorTab10 === "workflow";
        v.openWorkflowPane18 = function () { self.openInspector10("workflow"); };
        if (Array.isArray(v.inspectorTabs12) && s.view === "thread9") {
          var at = v.inspectorTabs12.findIndex(function (t) { return t.label === "Issue"; });
          var tab = { label: "Workflow", cls: s.inspectorTab10 === "workflow" ? "selected" : "", pick: function () { self.openInspector10("workflow"); } };
          v.inspectorTabs12 = v.inspectorTabs12.slice(0, at + 1).concat([tab], v.inspectorTabs12.slice(at + 1));
        }
        if (plan) {
          var tone = this.wfTone18(plan), cur = plan.cur, name = plan.graph.graph.name || plan.graph.meta.name || "Workflow";
          var pick = this.workflowPick17();
          var elapsed = plan.since ? mmss(Date.now() - plan.since) : "";
          v.wfLiveTone18 = tone;
          v.wfDots18 = plan.steps.filter(function (x) { return x.n.type !== "start"; }).map(function (x) {
            return { key: x.n.id, cls: x === cur ? "now" : x.st === "needs" ? "needs" : DONE[x.st] ? "done" : "" };
          });
          v.wfLiveStep18 = cur ? cur.n.label : plan.finished ? "Finished" : name;
          v.wfLiveMeta18 = name + " \u00b7 " + (!cur ? (plan.finished ? "all steps done" : "not started")
            : cur.st === "running" ? (elapsed || "running") : cur.st === "waiting" ? "waiting for you" : cur.st === "stuck" ? "stuck" : cur.st === "paused" ? "paused" : cur.st === "canceled" ? "canceled" : "up next");
          v.wfLiveTitle18 = name + ": " + v.wfLiveStep18 + " \u00b7 " + v.wfLiveMeta18.split(" \u00b7 ")[1] + ". Open the workflow pane.";

          v.wfPaneName18 = name;
          v.wfPaneVersion18 = "v" + (plan.graph.graph.version || 1) + " \u00b7 " + (pick === "auto" ? "chosen by Auto" : "forced for this conversation");
          v.wfPaneLede18 = plan.graph.meta.meta || (plan.steps.length + " steps");
          var stageOf = cur && cur.stage;
          var curModel = cur && (cur.n.model || (stageOf && stageOf.model));
          var curRoute = curModel ? this.route17(curModel) : null;
          var acctText = stageOf ? (function () { var c = self.candidates17(s.member, stageOf.model)[0]; return c ? self.acctName17(c) + " \u00b7 sub" : "BotInc credits"; })() : curRoute ? self.routeLabel17(curRoute) : "";
          if (!cur) {
            v.wfNowEyebrow18 = plan.finished ? "Finished" : "Not started";
            v.wfNowTitle18 = plan.finished ? "Every step done" : "Waiting for the first request";
            v.wfNowCopy18 = plan.finished ? plan.stages.length + " run" + (plan.stages.length === 1 ? "" : "s") + " \u00b7 " + this.cash(plan.stages.reduce(function (n, x) { return n + (x.cost || 0); }, 0)) + " \u00b7 result reported in the conversation." : "The workflow starts when a message asks for a change.";
            v.wfNowHasAction18 = false;
          } else if (cur.st === "running") {
            v.wfNowEyebrow18 = plan.mid ? "Running \u00b7 resumed by your message" : "Running now";
            v.wfNowTitle18 = cur.n.label + (curModel ? " \u00b7 " + curModel : "");
            v.wfNowCopy18 = (acctText ? acctText + " \u00b7 " : "") + elapsed + " elapsed. " + (stageOf ? stageOf.summary + "." : plan.mid ? "Working through your message." : "Working on it.");
            v.wfNowHasAction18 = !!stageOf; v.wfNowActionLabel18 = "Open thread";
            v.wfNowAction18 = function () { self.openInspector10("runs"); self.rtOpen16(stageOf.id); };
          } else if (cur.st === "waiting") {
            v.wfNowEyebrow18 = "Waiting for you";
            v.wfNowTitle18 = cur.n.label;
            v.wfNowCopy18 = cur.n.type === "approval" ? (plan.revised ? "Both reviews approved the revised change. " : "Both reviews approved. ") + "Since " + this.wfLastWhen18(plan) + " \u00b7 nothing merges until you do." : "The run asked you a question and stopped until it is answered.";
            v.wfNowHasAction18 = true; v.wfNowActionLabel18 = cur.n.type === "approval" ? "Review the change" : "Answer";
            v.wfNowAction18 = function () { if (cur.n.type === "approval") self.openInspector10("pr"); else if (typeof v.headNeedGo15 === "function") v.headNeedGo15(); else self.openInspector10("issue"); };
          } else if (cur.st === "stuck" || cur.st === "canceled") {
            var d = plan.decision;
            v.wfNowEyebrow18 = cur.st === "canceled" ? "Canceled" : "Stuck";
            v.wfNowTitle18 = cur.n.label + (curModel ? " \u00b7 " + curModel : "");
            v.wfNowCopy18 = cur.st === "canceled" ? "The issue was canceled here. Nothing else runs." : (d && d.reason ? d.reason : "Blocked at this step.") + (d && d.kind === "connection" ? " Reconnect to continue." : d && d.kind === "funding" ? " Choose how to pay to continue." : " Fix the blocker and the run resumes here.");
            v.wfNowHasAction18 = cur.st !== "canceled"; v.wfNowActionLabel18 = d && d.kind === "funding" ? "Choose funding" : d && d.kind === "connection" ? "Reconnect" : "Open issue";
            v.wfNowAction18 = function () { if (typeof v.headNeedGo15 === "function" && d && !d.resolved) v.headNeedGo15(); else self.openInspector10("issue"); };
          } else if (cur.st === "paused") {
            v.wfNowEyebrow18 = "Paused";
            v.wfNowTitle18 = cur.n.label + (curModel ? " \u00b7 " + curModel : "");
            v.wfNowCopy18 = "Paused by " + (plan.issue.owner || "the owner") + ". Resumes from this step.";
            v.wfNowHasAction18 = true; v.wfNowActionLabel18 = "Resume";
            v.wfNowAction18 = function () { self.changeStatus12("Running"); };
          } else {
            v.wfNowEyebrow18 = "Up next";
            v.wfNowTitle18 = cur.n.label + (curModel ? " \u00b7 " + curModel : "");
            v.wfNowCopy18 = (curRoute ? "Would run on " + this.routeLabel17(curRoute) + ". " : "") + "Starts when the step before it finishes.";
            v.wfNowHasAction18 = false;
          }
          var openId = s.wfOpen18 === undefined ? (cur ? cur.n.id : "") : s.wfOpen18;
          var row = function (x, isLoop) {
            var n = x.n, stage = x.stage, open = openId === n.id;
            var facts = [];
            if (n.type === "task" || n.type === "repeat") {
              facts.push({ key: "model", k: "Model", v: stage ? stage.model : n.model || "Auto" });
              var acc = stage ? self.candidates17(s.member, stage.model)[0] : null;
              var r = !stage ? self.route17(n.model || "Auto") : null;
              facts.push({ key: "acct", k: stage ? "Account" : "Would run on", v: stage ? (acc ? self.acctName17(acc) : "BotInc credits") : self.routeLabel17(r) });
              facts.push({ key: "effort", k: "Effort", v: n.effort || "Medium" });
              if (stage) { facts.push({ key: "dur", k: "Duration", v: stage.duration }); facts.push({ key: "cost", k: "Cost", v: self.cash(stage.cost) }); facts.push({ key: "when", k: "Started", v: stage.when }); }
              if (isLoop) facts.push({ key: "tries", k: "Attempts", v: x.tries + " of " + x.limit });
            } else if (n.type === "condition") {
              facts.push({ key: "rule", k: "Rule", v: self.ruleLabel14(n) });
              facts.push({ key: "in", k: "Inputs", v: plan.reviews18 || (plan.stages.filter(function (y) { return /^Review/.test(y.stage); }).map(function (y) { return y.status; }).join(", ") || "not yet") });
            } else if (n.type === "approval") {
              facts.push({ key: "owner", k: "Owner", v: plan.issue.owner || s.member });
              facts.push({ key: "state", k: "State", v: x.st === "waiting" ? "Waiting since " + self.wfLastWhen18(plan) : DONE[x.st] ? "Approved" : "Not reached" });
            }
            var stateCls = x.st === "running" ? "now running" : x.st === "waiting" ? "now waiting" : x.st === "stuck" || x.st === "canceled" ? "now stuck" : x.st === "paused" ? "now paused" : x.st;
            return { key: n.id, label: n.label, icon: self.nodeIcon14(n.type), detail: self.wfStepDetail18(x, plan), state: isLoop && stage ? x.tries + " of " + x.limit : self.wfStateLabel18(x, plan),
              cls: (x === cur && x.st === "upcoming" ? "now queued" : stateCls) + (isLoop ? " loop" : "") + (open ? " open" : ""), open: open,
              toggle: function () { o({ wfOpen18: open ? "" : n.id }); },
              facts: facts, hasNote: !!(stage && stage.summary) || (!stage && !!n.prompt), note: stage ? stage.summary : n.prompt || "",
              hasRun: !!stage, openRun: function () { self.openInspector10("runs"); self.rtOpen16(stage.id); } };
          };
          v.wfSteps18 = plan.steps.map(function (x) { return row(x, false); }).concat(plan.loops.map(function (x) { return row(x, true); }));
          var spent = this.spent17(), limit = this.taskLimit17();
          v.wfSpend18 = this.cash(spent) + " of " + this.cash(limit) + " task limit \u00b7 " + plan.stages.length + " run" + (plan.stages.length === 1 ? "" : "s");
        } else {
          v.wfDots18 = []; v.wfSteps18 = []; v.wfLiveTone18 = ""; v.wfNowHasAction18 = false;
        }
        return v;
      }
    };
  };
})();

