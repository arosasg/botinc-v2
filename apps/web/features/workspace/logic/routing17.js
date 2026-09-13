/* eslint-disable */
// @ts-nocheck
// V17 — routing transparency, funding policy, workflow choice, and the
// workflow editor's Checks / Test / Versions panes.
// Layered over the V16 run workspace: window.BotincRoutingWorkspace17(Base).
(function () {
  var KIND_LABEL = { subscription: "SUB", api: "API KEY", credits: "CREDIT", wait: "WAIT", ask: "ASK", blocked: "NO ACCOUNT" };
  var KIND_CLS = { subscription: "k-sub17", api: "k-api17", credits: "k-credit17", wait: "k-wait17", ask: "k-ask17", blocked: "k-bad17" };
  var STEP_COST = 0.06; // simulated spend per model step, in USD
  var STEP_USE = 6;     // simulated quota per model step, in percent of the tightest window

  window.BotincRoutingWorkspace17 = function (Base) {
    return class extends Base {
      constructor(p) {
        super(p);
        // A step may leave the model to the router.
        var m = this.menus14 && this.menus14.graphNodeModel14;
        if (m && !m.options.some(function (o) { return o.label === "Auto"; })) {
          this.menus14 = Object.assign({}, this.menus14, { graphNodeModel14: Object.assign({}, m, { options: [{ label: "Auto" }].concat(m.options) }) });
        }
      }
      componentDidMount() {
        if (super.componentDidMount) super.componentDidMount();
        var self = this;
        // Direct chats with the Operator that are not issues. Two samples so the
        // sidebar section reads right; one of them created issues.
        setTimeout(function () {
          var chats = Object.assign({}, self.state.chats || {});
          var mk = function (id, title, ask, answer, spawned) {
            return { id: id, title: title, phase: "done", agent: "operator", model: "Auto", spawned17: spawned || [], messages: [
              { author: self.state.member, model: "", hasAvatar: false, cls: "message user-message", text: ask },
              { author: "Operator", model: "Claude Sonnet 5", hasAvatar: true, cls: "message assistant-message", text: answer },
            ] };
          };
          Object.keys(chats).forEach(function (member) {
            if ((chats[member] || []).length) return;
            chats[member] = [
              mk("chat17-a", "Split the auth work into issues", "Break the auth hardening plan into issues I can hand to the team.", "Done. Three issues are on the board: BOT-341 rate limiter on refresh, BOT-342 verifySession header trust, BOT-343 session tests. Each has its own conversation.", ["BOT-341", "BOT-342", "BOT-343"]),
              mk("chat17-b", "Why did Friday's deploy stall", "Why did the Friday deploy sit in review for six hours?", "Two reviewers were out. The review workflow waited for the second approval; nothing was blocked on code."),
            ];
          });
          self.setState({ chats: chats });
        }, 0);
      }
      // --------------------------------------------------- workflow funding
      wfFund17(id) { return (this.state.graphFunding17 || {})[id || (this.state.graph14 || {}).id] || "subs-then-credits"; }
      wfFundLabel17(k) { return k === "subs" ? "Subscriptions only" : k === "credits" ? "BotInc credits" : "Subscriptions, then credits within the limit"; }
      gfMenu17(e) {
        var self = this, id = (this.state.graph14 || {}).id, cur = this.wfFund17(id);
        var rows = [
          { id: "subs", label: "Subscriptions only", hint: "Never spends credit \u00b7 waits for a reset when every account is at 100%", icon: this.icon14("credit-card") },
          { id: "subs-then-credits", label: "Subscriptions, then credits", hint: "Your accounts first \u00b7 credits only within the issue's task limit", icon: this.icon14("wallet") },
          { id: "credits", label: "BotInc credits", hint: "Workspace credit for every step \u00b7 your subscriptions stay untouched", icon: this.icon14("wallet") },
        ];
        this.openMenu14(null, e, rows.map(function (r) {
          return { label: r.label, hint: r.hint, icon: r.icon, on: r.id === cur, run: function () {
            self.setState({ graphFunding17: Object.assign({}, self.state.graphFunding17 || {}, { [id]: r.id }) }); self.closeMenu14();
          } };
        }), "This workflow pays with", { kind: "gf-fund", cls: "menu-rich15" });
      }
      // ------------------------------------------------------------ helpers
      convKey17() {
        var s = this.state;
        var issue = s.view === "thread9" ? this.issue() : null;
        return issue ? "issue:" + issue.id : "chat:" + (s.activeChat || "main");
      }
      use17(id) { return (this.state.routeUse17 || {})[id] || 0; }
      windows17(acc) {
        var self = this;
        return this.measuredWindows(acc).map(function (w) {
          var left = Math.max(0, 100 - w.percent - self.use17(acc.id));
          return { label: w.label, left: left, resets: w.resets || "" };
        });
      }
      minLeft17(acc) {
        var ws = this.windows17(acc);
        if (!ws.length) return null;
        return Math.min.apply(null, ws.map(function (w) { return w.left; }));
      }
      tightest17(acc) {
        var ws = this.windows17(acc);
        if (!ws.length) return null;
        return ws.reduce(function (a, b) { return b.left < a.left ? b : a; });
      }
      acctName17(a) { return a.label || a.plan || this.provider8(a.provider).name; }
      acctMeta17(a) { return a.identity + (a.plan ? " \u00b7 " + a.plan : ""); }
      acctLogo17(a) { return this.brand12(this.provider8(a.provider).name); }
      modelLogo17(model) {
        if (!model || model === "Auto") return { brand12: "", brandClass12: "" };
        return this.brand12(/^GPT/.test(model) ? "Codex" : "Claude");
      }
      leftText17(a) {
        var l = this.minLeft17(a);
        return l === null ? "usage not reported" : (100 - l) + "% used";
      }
      resetAt17(a) {
        var t = this.tightest17(a);
        return (t && t.resets) || a.limitedUntil || "the next window";
      }
      policy17(member) { return (this.state.fallbackPolicies10 || {})[member || this.state.member] || "ask"; }
      policyText17(p) {
        return p === "credits" ? "Then BotInc credits, within the task limit"
          : p === "wait" ? "Then wait for a subscription to reset"
          : "Then ask you before using credits";
      }
      candidates17(member, model) {
        var self = this;
        return this.accountsFor(member).filter(function (a) {
          return a.kind === "subscription" && self.provider8(a.provider).routable && self.accountUsable(a)
            && (!a.where || a.where === "BotInc Cloud") && self.accountServes(a, model);
        }).sort(function (a, b) {
          var order = ["claude", "codex"];
          return (order.indexOf(a.provider) - order.indexOf(b.provider))
            || ((b.active ? 1 : 0) - (a.active ? 1 : 0))
            || (self.worstPercent(a) + self.use17(a.id)) - (self.worstPercent(b) + self.use17(b.id));
        });
      }
      // ------------------------------------------------------- the ladder
      // The conversation's routing ladder: ordered steps of model + account.
      // Automatic from the chosen model and the connected accounts; editable.
      catalog17() { var m = this.menus14 && this.menus14.graphNodeModel14; return (m ? m.options.map(function (o) { return o.label; }) : []).filter(function (x) { return x && x !== "Auto"; }); }
      providerOf17(model) { return /^GPT/.test(model) ? "codex" : /^Claude/.test(model) ? "claude" : "other"; }
      ladderModels17(model) {
        var self = this, cat = this.catalog17();
        if (!model || model === "Auto") return cat;
        var p = this.providerOf17(model), i = cat.indexOf(model);
        var same = cat.filter(function (m, k) { return k > i && self.providerOf17(m) === p; });
        var others = cat.filter(function (m) { return self.providerOf17(m) !== p; });
        return [model].concat(same, others);
      }
      defaultPlan17(member, model) {
        // Every account for the chosen model, then one account per fallback
        // model down the ladder, then API keys. The terminal policy is shown
        // separately and comes from the funding settings.
        var self = this, steps = [], seen = {};
        this.ladderModels17(model).forEach(function (m, mi) {
          var cands = self.candidates17(member, m);
          if (mi > 0 && model !== "Auto") cands = cands.slice(0, 1);
          cands.forEach(function (a) {
            var k = m + "|" + a.id;
            if (!seen[k] && steps.length < 10) { seen[k] = 1; steps.push({ model: m, accId: a.id }); }
          });
        });
        this.accountsFor(member).filter(function (a) { return a.kind === "api" && a.enabled; }).forEach(function (a) {
          var m = self.ladderModels17(model).find(function (mm) { return self.accountServes(a, mm); }) || model || "Auto";
          if (steps.length < 12) steps.push({ model: m, accId: a.id, api: true });
        });
        return steps;
      }
      plan17() { var custom = (this.state.routePlan17 || {})[this.convKey17()]; return custom || this.defaultPlan17(this.state.member, this.state.model || "Auto"); }
      setPlan17(plan) {
        var key = this.convKey17(), self = this;
        this.setState({ routePlan17: Object.assign({}, this.state.routePlan17 || {}, { [key]: plan }) });
      }
      stepLive17(st) {
        var a = this.accountById(this.state.member, st.accId);
        if (!a) return false;
        if (st.api) return true;
        var l = this.minLeft17(a);
        return l === null || l > 0;
      }
      planRoute17(member) {
        var self = this; member = member || this.state.member;
        var model = this.state.model || "Auto";
        if (this.fundingMode(member) === "credits") return { kind: "credits", model: model, next: "Charged to workspace credit. Your subscriptions stay untouched." };
        var plan = this.plan17(), live = plan.filter(function (s) { return self.stepLive17(s); }), st = live[0];
        if (st) {
          var acc = this.accountById(member, st.accId), after = live[1];
          return { kind: st.api ? "api" : "subscription", model: st.model, account: acc, left: st.api ? null : this.minLeft17(acc), candidates: [],
            next: after ? "Then " + after.model + " · " + this.acctName17(this.accountById(member, after.accId)) : this.policyText17(this.policy17(member)) };
        }
        var policy = this.policy17(member);
        if (policy === "credits") return { kind: "credits", model: model, fallback: true, next: "Every step of the ladder is at 100%. Credits pay, within the task limit." };
        if (policy === "wait") return { kind: "wait", model: model, next: "Every step of the ladder is at 100%. Waiting for the first reset." };
        return { kind: "ask", model: model, next: "Every step of the ladder is at 100%. BotInc asks you before spending credit." };
      }
      openMenu14(e, t, i, o, s) {
        // Menus opened from the routing picker keep the picker underneath.
        var keep = (this.state.popover10 === "route" || this._rpKeep17) && s && /^rp-/.test(s.kind || "");
        this._rpKeep17 = !!keep;
        var r = super.openMenu14(e, t, i, o, s);
        if (keep) this.setState({ popover10: "route" });
        return r;
      }
      fakeAnchor17(e) { var el = e && (e.currentTarget || e.target); return el ? { currentTarget: el, target: el } : e; }
      rpStepMenu17(e, i) {
        var self = this, anchor = this.fakeAnchor17(e), plan = this.plan17().slice(), st = plan[i];
        var acc = this.accountById(this.state.member, st.accId);
        var later = function (fn) { self.closeMenu14(); setTimeout(fn, 0); };
        this.openMenu14(null, anchor, [
          { label: "Move up", icon: this.icon14("arrow-up"), hint: i === 0 ? "Already first" : "", run: function () { if (i > 0) { plan.splice(i, 1); plan.splice(i - 1, 0, st); self.setPlan17(plan); } self.closeMenu14(); } },
          { label: "Move down", icon: this.icon14("arrow-down"), hint: i === plan.length - 1 ? "Already last" : "", run: function () { if (i < plan.length - 1) { plan.splice(i, 1); plan.splice(i + 1, 0, st); self.setPlan17(plan); } self.closeMenu14(); } },
          { label: "Change model", hint: st.model, icon: this.icon14("sparkles"), run: function () { later(function () { self.rpModelMenu17(anchor, i); }); } },
          { label: "Change account", hint: acc ? self.acctName17(acc) : "", icon: this.icon14("user"), run: function () { later(function () { self.rpAccountMenu17(anchor, i); }); } },
          { label: "Remove step", icon: this.icon14("trash-2"), run: function () { plan.splice(i, 1); self.setPlan17(plan); self.closeMenu14(); } },
        ], "Step " + (i + 1), { kind: "rp-step", cls: "menu-rich15 rp-menu-wide17" });
      }
      rpServing17(model) {
        var self = this, member = this.state.member;
        return this.accountsFor(member).filter(function (a) { return (a.kind === "subscription" || (a.kind === "api" && a.enabled)) && self.accountServes(a, model) && self.accountUsable(a); });
      }
      // Provider first, then the model on the accounts that serve it, each with usage.
      rpProviders17() {
        var self = this, member = this.state.member, out = [];
        this.catalog17().forEach(function (m) {
          var p = self.providerOf17(m);
          var row = out.find(function (x) { return x.id === p; });
          if (!row) { row = { id: p, name: p === "codex" ? "Codex" : p === "claude" ? "Claude" : "Other", models: [] }; out.push(row); }
          row.models.push(m);
        });
        return out.map(function (row) {
          var accts = self.accountsFor(member).filter(function (a) { return (a.kind === "subscription" || (a.kind === "api" && a.enabled)) && self.accountUsable(a) && row.models.some(function (m) { return self.accountServes(a, m); }); });
          var live = accts.filter(function (a) { return a.kind === "api" || (self.minLeft17(a) === null || self.minLeft17(a) > 0); });
          return Object.assign(row, { accounts: accts, live: live.length, logo: self.brand12(row.name) });
        });
      }
      rpProviderMenu17(anchor, title, onModel) {
        var self = this, rows = this.rpProviders17();
        this.openMenu14(null, anchor, rows.map(function (p) {
          return Object.assign({ label: p.name }, p.logo && p.logo.brand12 ? { logo: p.logo.brand12, logoClass: p.logo.brandClass12 || "" } : { icon: self.icon14("sparkles") }, {
            hint: p.accounts.length ? p.live + "/" + p.accounts.length + " accounts live" : "No account",
            run: function () { self.closeMenu14(); setTimeout(function () { self.rpModelList17(anchor, title, p, onModel); }, 0); } });
        }), title, { kind: "rp-provider", cls: "menu-rich15 rp-menu-wide17" });
      }
      rpModelList17(anchor, title, p, onModel) {
        var self = this, rows = [];
        rows.push({ label: "All providers", icon: this.icon14("arrow-left"), run: function () { self.closeMenu14(); setTimeout(function () { self.rpProviderMenu17(anchor, title, onModel); }, 0); } });
        p.models.forEach(function (m) {
          var serving = p.accounts.filter(function (a) { return self.accountServes(a, m); });
          var subs = serving.filter(function (a) { return a.kind === "subscription"; });
          var best = subs.slice().sort(function (a, b) { return (self.minLeft17(b) || 0) - (self.minLeft17(a) || 0); })[0];
          var hint = !serving.length ? "No account serves it"
            : best ? self.acctName17(best) + " " + self.leftText17(best) + (subs.length > 1 ? " · +" + (subs.length - 1) : "") + (serving.length > subs.length ? " · API" : "")
            : "API key only";
          rows.push({ label: m, hint: hint, run: function () { self.closeMenu14(); onModel(m, best || serving[0] || null); } });
        });
        this.openMenu14(null, anchor, rows, title + " · " + p.name, { kind: "rp-model", cls: "menu-rich15 rp-menu-wide17" });
      }
      rpModelMenu17(anchor, i) {
        var self = this;
        this.rpProviderMenu17(anchor, "Model for step " + (i + 1), function (m, a) {
          var plan = self.plan17().slice(), st = plan[i];
          var serving = self.rpServing17(m), keep = serving.find(function (x) { return x.id === st.accId; });
          var acc = keep || a;
          plan[i] = { model: m, accId: acc ? acc.id : st.accId, api: acc ? acc.kind === "api" : st.api };
          self.setPlan17(plan);
        });
      }
      rpAccountMenu17(anchor, i) {
        var self = this, plan = this.plan17().slice(), st = plan[i];
        var rows = this.rpServing17(st.model).map(function (a) {
          return { label: self.acctName17(a), on: a.id === st.accId, hint: a.kind === "api" ? "API key · pays per call" : self.acctMeta17(a) + " · " + self.leftText17(a), run: function () {
            plan[i] = { model: st.model, accId: a.id, api: a.kind === "api" }; self.setPlan17(plan); self.closeMenu14();
          } };
        });
        this.openMenu14(null, anchor, rows.length ? rows : [{ label: "No account serves " + st.model, hint: "Connect one in Settings", run: function () { self.closeMenu14(); } }], "Account for step " + (i + 1), { kind: "rp-acct", cls: "menu-rich15 rp-menu-wide17" });
      }
      rpAddMenu17(e) {
        var self = this, anchor = this.fakeAnchor17(e);
        this.rpProviderMenu17(anchor, "Add a step", function (m, a) {
          var plan = self.plan17().slice();
          var used = plan.filter(function (s) { return s.model === m; }).map(function (s) { return s.accId; });
          var fresh = self.rpServing17(m).find(function (x) { return used.indexOf(x.id) < 0; }) || a;
          if (fresh) { plan.push({ model: m, accId: fresh.id, api: fresh.kind === "api" }); self.setPlan17(plan); }
        });
      }
      pickerPosition11(e, t, i) {
        if (e === "funding") {
          var fo = Math.min(380, i.width - 24), fn = t.top > (i.height - t.bottom);
          var fp = { left: Math.max(12, Math.min(t.left, i.width - fo - 12)), width: fo, maxHeight: fn ? Math.min(560, t.top - 24) : i.height - t.bottom - 24 };
          if (fn) fp.bottom = i.height - t.top + 9; else fp.top = Math.min(t.bottom + 9, i.height - 140);
          return fp;
        }
        if (e !== "route") return super.pickerPosition11(e, t, i);
        var o = Math.min(400, i.width - 24), n = t.top > (i.height - t.bottom);
        var pos = { left: Math.max(12, Math.min(t.left, i.width - o - 12)), width: o, maxHeight: n ? Math.min(600, t.top - 24) : i.height - t.bottom - 24 };
        if (n) pos.bottom = i.height - t.top + 9; else pos.top = Math.min(t.bottom + 9, i.height - 140);
        return pos;
      }
      // One routing decision: who serves the next call for `model`.
      route17(model, member) {
        var self = this;
        if (!model) return this.planRoute17(member);
        member = member || this.state.member;
        model = model || this.state.model || "Auto";
        var policy = this.policy17(member);
        if (this.fundingMode(member) === "credits") {
          return { kind: "credits", model: model, next: "Charged to workspace credit. Your subscriptions stay untouched." };
        }
        var cands = this.candidates17(member, model);
        var live = cands.filter(function (a) { var l = self.minLeft17(a); return l === null || l > 0; });
        var acc = live[0], after = live[1];
        if (acc) {
          return {
            kind: "subscription", model: model, account: acc, left: this.minLeft17(acc), candidates: cands,
            next: after ? "Then " + this.acctName17(after) + " \u00b7 " + this.leftText17(after) : this.policyText17(policy),
          };
        }
        var key = this.accountsFor(member).find(function (a) { return a.kind === "api" && a.enabled && self.accountServes(a, model); });
        var who = model === "Auto" ? "every subscription" : "every subscription that serves " + model;
        if (policy === "credits") return { kind: "credits", model: model, fallback: true, candidates: cands, next: this.capital17(who) + " is exhausted. Credits pay, within the task limit." };
        if (policy === "wait") return { kind: "wait", model: model, account: cands[0], candidates: cands, next: this.capital17(who) + " is exhausted. Waiting for " + (cands[0] ? this.acctName17(cands[0]) + " to reset at " + this.resetAt17(cands[0]) : "a reset") + "." };
        if (key) return { kind: "api", model: model, account: key, candidates: cands, next: "Every subscription is exhausted. Your " + this.provider8(key.provider).name + " key pays, within the task limit." };
        return { kind: "ask", model: model, candidates: cands, next: this.capital17(who) + " is exhausted. BotInc asks you before spending credit." };
      }
      capital17(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
      routeLabel17(r) {
        return r.kind === "credits" ? "BotInc credits"
          : r.kind === "wait" ? "Waiting for reset"
          : r.kind === "ask" ? "Asks before credits"
          : r.account ? this.acctName17(r.account) : "No account";
      }
      routeBar17(left) {
        // The bar fills with what is used; it turns amber past 80% and red when the window is gone.
        var used = left === null || left === undefined ? 0 : 100 - left;
        var tone = used >= 100 ? "bar-out17" : used > 80 ? "bar-low17" : used >= 50 ? "bar-mid17" : "bar-ok17";
        return { style: "width:" + Math.max(2, Math.min(100, used)) + "%", tone: tone };
      }
      routeRow17(r) {
        // Flat fields the template can read for any routing decision.
        var acc = r.account;
        var logo = acc ? this.acctLogo17(acc) : this.modelLogo17(r.model);
        var left = acc ? this.minLeft17(acc) : null;
        var bar = this.routeBar17(left);
        var t = acc ? this.tightest17(acc) : null;
        return {
          routeModel17: r.model || "Auto",
          routeAccount17: this.routeLabel17(r),
          routeAccountLabel17: acc ? this.acctName17(acc) : this.routeLabel17(r),
          routeAccountMeta17: acc ? this.acctMeta17(acc) : "",
          routeKind17: KIND_LABEL[r.kind] || r.kind,
          routeKindCls17: KIND_CLS[r.kind] || "",
          routeHasAccount17: !!acc,
          routeHasLogo17: !!logo.brand12,
          routeLogo17: logo.brand12,
          routeLogoClass17: logo.brandClass12,
          routeHasBar17: acc ? left !== null : false,
          routeLeft17: left === null ? "" : (100 - left) + "% used",
          routeBarStyle17: bar.style,
          routeTone17: r.kind === "subscription" ? bar.tone : r.kind === "credits" ? "tone-credit17" : r.kind === "api" ? "tone-api17" : "tone-warn17",
          routeResets17: t && t.resets ? "resets " + t.resets : "",
          routeNext17: r.next || "",
        };
      }
      taskLimit17() {
        var s = this.state;
        var issue = s.view === "thread9" ? this.issue() : null;
        if (issue) return issue.taskLimit || 2;
        return (s.chatLimit17 || {})[this.convKey17()] || 1;
      }
      logRoute17(entry) {
        var key = this.convKey17();
        var log = Object.assign({}, this.state.routeLog17 || {});
        var now = new Date();
        var time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
        var issue = this.state.view === "thread9" ? this.issue() : null;
        var seq = entry.seq != null ? entry.seq : (issue ? ((this.state.threadMessages9 || {})[issue.id] || []).length : 0);
        log[key] = (log[key] || []).concat([Object.assign({ time: time }, entry, { seq: seq })]);
        this.setState({ routeLog17: log });
      }
      routeEntry17(r, prefix) {
        var acc = r.account;
        var logo = acc ? this.acctLogo17(acc) : this.modelLogo17(r.model);
        var left = acc ? this.minLeft17(acc) : null;
        var text = prefix + " " + (r.model || "Auto") + " \u00b7 " + this.routeLabel17(r) + " \u00b7 " + (KIND_LABEL[r.kind] || r.kind).toLowerCase();
        if (acc && left !== null) text += " \u00b7 " + (100 - left) + "% used" + (this.resetAt17(acc) ? ", resets " + this.resetAt17(acc) : "");
        return { text: text, tone: r.kind === "subscription" ? "" : r.kind === "credits" ? "tone-credit17" : "tone-warn17", logo: logo.brand12, logoClass: logo.brandClass12, hasLeft: acc && left !== null, left: left === null ? null : 100 - left, barStyle: this.routeBar17(left).style };
      }

      // ---------------------------------------------------- overrides: live
      chooseModel10(model) {
        var before = this.route17();
        super.chooseModel10(model);
        this.noteModelChange17(model, before);
      }
      midRun17() {
        // The Operator is still answering for ~25s after a send in this conversation.
        return !!this._lastSend17 && this._lastSendKey17 === this.convKey17() && Date.now() - this._lastSend17 < 25000;
      }
      noteModelChange17(model, before) {
        if (before && before.model === model) return;
        var after = this.route17(model);
        var swapped = (before && before.account && after.account && before.account.id !== after.account.id) || (before && before.kind !== after.kind);
        var mid = this.midRun17();
        var entry = this.routeEntry17(after, mid ? "Model changed mid-run \u00b7 " + (before ? before.model : "Auto") + " \u2192" : "Model changed to");
        if (swapped && after.account) entry.text += " \u00b7 account switched" + (before.account ? " from " + this.acctName17(before.account) : "");
        if (mid) entry.tone = "tone-midrun17";
        this.logRoute17(entry);
        if (after.kind !== "subscription" && after.kind !== "credits") this.toast("No live subscription serves " + model + ". " + after.next);
      }
      sendComposer10(e) {
        var s = this.state;
        var draft = (s.view === "thread9" ? s.threadDraft9 : s.draft || "").trim();
        var before = this.route17();
        var issue = s.view === "thread9" ? this.issue() : null;
        var seq = issue ? ((s.threadMessages9 || {})[issue.id] || []).length + 1 : 0;
        super.sendComposer10(e);
        if (!draft) return;
        var prevKey = this.convKey17();
        var last = ((s.routeLog17 || {})[prevKey] || []).filter(function (x) { return x.accountId; }).slice(-1)[0];
        var mid = this.midRun17();
        if (before.account && last && last.accountId !== before.account.id) {
          var lastAcc = this.accountById(s.member, last.accountId);
          this.logRoute17({ seq: seq, text: "Switched account" + (mid ? " mid-run" : "") + " \u00b7 " + (lastAcc ? this.acctName17(lastAcc) + " is out of quota until " + this.resetAt17(lastAcc) : "the previous account is out of quota") + " \u2192 " + this.acctName17(before.account), tone: mid ? "tone-midrun17" : "tone-warn17" });
        }
        this._lastSend17 = Date.now(); this._lastSendKey17 = prevKey;
        if (before.account) {
          var use = Object.assign({}, this.state.routeUse17 || {});
          use[before.account.id] = (use[before.account.id] || 0) + STEP_USE;
          this.setState({ routeUse17: use });
        }
        var spent = Object.assign({}, this.state.routeSpend17 || {});
        spent[prevKey] = (spent[prevKey] || 0) + (before.kind === "wait" || before.kind === "ask" ? 0 : STEP_COST);
        this.setState({ routeSpend17: spent });
        var entry = this.routeEntry17(this.route17(before.model), "Sent with");
        entry.accountId = before.account ? before.account.id : "";
        entry.seq = seq;
        if (before.kind === "wait") entry.text = "Held \u00b7 " + before.next;
        if (before.kind === "ask") entry.text = "Held \u00b7 " + before.next;
        this.logRoute17(entry);
        var afterAcc = before.account ? this.minLeft17(before.account) : null;
        if (before.account && afterAcc !== null && afterAcc <= 0) {
          var nxt = this.route17(before.model);
          this.logRoute17({ seq: seq, text: this.acctName17(before.account) + " exhausted \u00b7 resets " + this.resetAt17(before.account) + " \u00b7 next message: " + (nxt.account ? this.acctName17(nxt.account) + " \u00b7 " + (KIND_LABEL[nxt.kind] || "").toLowerCase() : nxt.next), tone: "tone-warn17" });
        }
      }
      historyRows13() {
        return super.historyRows13().map(function (m) { return Object.assign({}, m, { plain17: !m.isWork, route17: false }); });
      }
      routeNotes17() {
        var self = this;
        var issue = this.issue();
        var log = ((this.state.routeLog17 || {})["issue:" + (issue ? issue.id : "")] || []).filter(function (x) { return !x.hist; });
        return log.map(function (x, i) {
          return {
            key: "route17-" + i, seq: x.seq || 0, route17: true, who: "BotInc", text: x.text, when: x.time, time: x.time,
            routeTone: x.tone || "", hasLogo: !!x.logo, logo: x.logo || "", logoClass: x.logoClass || "",
            hasLeft: !!x.hasLeft, left: x.hasLeft ? x.left + "% used" : "", barStyle: x.barStyle || "", hasAttachments11: false, attachments11: [],
          };
        });
      }
      historyNotes17() {
        var issue = this.issue();
        var log = ((this.state.routeLog17 || {})["issue:" + (issue ? issue.id : "")] || []).filter(function (x) { return x.hist; });
        return log.map(function (x, i) {
          return { key: "hroute17-" + i, back: x.back || 0, route17: true, plain17: false, isWork: false, cls: "route-entry17", text: x.text, time: x.time,
            routeTone: x.tone || "", hasLogo: !!x.logo, logo: x.logo || "", logoClass: x.logoClass || "", hasLeft: !!x.hasLeft, left: x.hasLeft ? x.left + "% used" : "", barStyle: x.barStyle || "" };
        });
      }
      mergeHistoryNotes17(rows) {
        var notes = this.historyNotes17();
        if (!notes.length) return rows;
        var out = [];
        for (var i = 0; i <= rows.length; i++) {
          var back = rows.length - i;
          notes.filter(function (n) { return Math.min(n.back, rows.length) === back; }).forEach(function (n) { out.push(n); });
          if (i < rows.length) out.push(rows[i]);
        }
        return out;
      }
      mergeNotes17(messages) {
        var notes = this.routeNotes17();
        if (!notes.length) return messages;
        var out = [];
        for (var i = 0; i <= messages.length; i++) {
          notes.filter(function (n) { return Math.min(n.seq, messages.length) === i; }).forEach(function (n) { out.push(n); });
          if (i < messages.length) out.push(Object.assign({ route17: false }, messages[i]));
        }
        return out;
      }
      editTaskLimit17(e) {
        // Inline, inside the model popover: presets, a field, save. No modal.
        var self = this;
        if (this.state.popover10 !== "model") this.openPicker11("model", e);
        setTimeout(function () { self.setState({ limitEdit17: true, limitDraft17: String(self.taskLimit17()), limitError17: "" }); }, 0);
      }
      closePicker11() { if (this.state.limitEdit17) this.setState({ limitEdit17: false, limitError17: "" }); return super.closePicker11 ? super.closePicker11() : undefined; }
      saveTaskLimit17(n) {
        var issue = this.state.view === "thread9" ? this.issue() : null;
        var key = this.convKey17();
        var cur = this.taskLimit17(), spent = this.spent17();
        if (!Number.isFinite(n) || n <= spent) { this.setState({ limitError17: "Choose an amount above the " + this.cash(spent) + " already used." }); return; }
        if (issue) this.patchIssue({ taskLimit: n });
        else this.setState({ chatLimit17: Object.assign({}, this.state.chatLimit17 || {}, { [key]: n }) });
        this.setState({ limitEdit17: false, limitError17: "" });
        if (n !== cur) this.logRoute17({ text: "Task limit changed \u00b7 " + this.cash(cur) + " \u2192 " + this.cash(n), tone: "" });
      }
      spent17() {
        var issue = this.state.view === "thread9" ? this.issue() : null;
        var extra = (this.state.routeSpend17 || {})[this.convKey17()] || 0;
        return (issue ? issue.cost || 0 : 0) + extra;
      }

      // ------------------------------------------------- workflow selection
      workflowList17() { return this.state.workflows14 || []; }
      detectWorkflow17() {
        var s = this.state;
        var issue = s.view === "thread9" ? this.issue() : null;
        if (issue) return issue.source === "Chat" ? "wf-research" : "wf-review";
        var draft = (s.draft || "").toLowerCase();
        return /research|compare|why|what is|brief/.test(draft) ? "wf-research" : /typo|small|quick|rename|bump/.test(draft) ? "wf-fix" : "wf-review";
      }
      workflowPick17() { return (this.state.workflowPick17 || {})[this.convKey17()] || "auto"; }
      workflowSteps17(id) {
        var self = this;
        var g = (this.stashGraph14() || {})[id];
        if (!g || !g.draft) return [];
        var graph = g.draft, byId = {};
        graph.nodes.forEach(function (n) { byId[n.id] = n; });
        var order = [], seen = {};
        var start = graph.nodes.find(function (n) { return n.type === "start"; }) || graph.nodes[0];
        var queue = start ? [start.id] : [];
        while (queue.length) {
          var id2 = queue.shift();
          if (seen[id2] || !byId[id2]) continue;
          seen[id2] = true; order.push(byId[id2]);
          graph.edges.filter(function (e) { return e.from === id2; }).forEach(function (e) { queue.push(e.to); });
        }
        return order.map(function (n) {
          var detail = n.type === "task" || n.type === "repeat" ? (n.model || "Model") + " \u00b7 " + (n.effort || "Medium") + " effort" + (n.type === "repeat" ? " \u00b7 up to " + (n.limit || 1) + " attempts" : "")
            : n.type === "condition" ? self.ruleLabel14(n)
            : n.type === "approval" ? "Waits for you. Nothing merges on its own."
            : n.type === "question" ? "Asks you before continuing"
            : n.note || "";
          var route = (n.type === "task" || n.type === "repeat") ? self.route17(n.model) : null;
          if (route) detail += " \u00b7 " + self.routeLabel17(route) + " (" + (KIND_LABEL[route.kind] || "").toLowerCase() + ")";
          return { key: n.id, label: n.label, detail: detail, icon: self.nodeIcon14(n.type), cls: "wfs-" + n.type + "17" };
        });
      }

      // ------------------------------------------- workflow editor: test
      testCases17() {
        return [
          { id: "clean", title: "Reviews approve first time", copy: "Every condition takes its yes branch.", icon: "i15.svg#circle-check" },
          { id: "revise", title: "Changes requested once", copy: "The first review says no, the revision passes.", icon: "i15.svg#refresh-cw" },
          { id: "stuck", title: "Changes requested every time", copy: "Shows what happens at the attempt limit.", icon: "i15.svg#triangle-alert" },
          { id: "quota", title: "Subscription runs out mid-run", copy: "The first account exhausts after two steps.", icon: "i15.svg#wallet" },
        ];
      }
      traceGraph17(caseId) {
        var self = this;
        var e = this.state.graph14, t = [], i = 0, guard = 0, attempts = {};
        var out = function (id) { return e.edges.filter(function (m) { return m.from === id; }); };
        var node = e.nodes.find(function (n) { return n.type === "start"; });
        var push = function (n, detail, tone, extra) { t.push(Object.assign({ step: ++i, title: n.label, detail: detail, tone: tone || "ok14", node: n.id }, extra || {})); };
        if (!node) return [{ step: 1, title: "Cannot start", detail: "This workflow has no start step.", tone: "bad14" }];
        var member = this.state.member, sim = {}, spend = 0, stepsRun = 0, reviewNo = caseId === "clean" ? 0 : caseId === "revise" ? 1 : caseId === "stuck" ? 99 : 0;
        var routeStep = function (n) {
          stepsRun++;
          var model = n.model || "Auto";
          var cands = self.candidates17(member, model).filter(function (a) { var l = self.minLeft17(a); return l === null || (l - (sim[a.id] || 0)) > 0; });
          var acc = cands[0];
          var kind = "subscription", left = null;
          var wf = self.wfFund17();
          if (!acc) {
            var p = self.policy17(member);
            kind = wf === "credits" ? "credits" : wf === "subs" ? "wait" : self.fundingMode(member) === "credits" ? "credits" : p === "credits" ? "credits" : p === "wait" ? "wait" : "ask";
          } else {
            sim[acc.id] = (sim[acc.id] || 0) + STEP_USE;
            left = Math.max(0, (self.minLeft17(acc) || 0) - sim[acc.id]);
            if (caseId === "quota" && stepsRun === 2) { sim[acc.id] += left; left = 0; }
          }
          if (wf === "credits" || self.fundingMode(member) === "credits") { kind = "credits"; acc = null; }
          spend += kind === "wait" || kind === "ask" ? 0 : STEP_COST;
          var logo = acc ? self.acctLogo17(acc) : self.modelLogo17(model);
          var bar = self.routeBar17(left);
          return {
            hasRoute: true, routeModel: model, routeAccount: acc ? self.acctName17(acc) : kind === "credits" ? "BotInc credits" : kind === "wait" ? "waits for reset" : "asks you first",
            kind: KIND_LABEL[kind], kindCls: KIND_CLS[kind], hasLogo: !!logo.brand12, logo: logo.brand12, logoClass: logo.brandClass12,
            barStyle: bar.style, left: left === null ? "" : (100 - left) + "% used", routeTone: kind === "subscription" ? bar.tone : "tone-warn17", stops: kind === "wait" || kind === "ask", accId: acc ? acc.id : "",
          };
        };
        var lastByProvider = {};
        var withRoute = function (n, detail, tone) {
          var model = n.model || "Auto";
          var provider = /^GPT/.test(model) ? "codex" : /^Claude/.test(model) ? "claude" : "";
          var prevId = provider ? lastByProvider[provider] : "";
          var prev = prevId ? self.accountById(member, prevId) : null;
          var r = routeStep(n);
          // A switch is only a switch when the account that served this model
          // before is now exhausted — a different provider is not a switch.
          if (prev && r.accId && r.accId !== prevId && self.accountServes(prev, model)
              && Math.max(0, (self.minLeft17(prev) || 0) - (sim[prevId] || 0)) <= 0) {
            t.push({ step: ++i, title: "Account switched", detail: self.acctName17(prev) + " ran out of quota, so this step moved to " + r.routeAccount + ".", tone: "warn14", cls: "switch17" });
          }
          if (r.accId && provider) lastByProvider[provider] = r.accId;
          push(n, detail, r.stops ? "warn14" : tone, r);
          return r;
        };
        while (node && guard++ < 40) {
          if (node.type === "start") push(node, "Sample run started from a conversation turn.");
          else if (node.type === "task") {
            var r1 = withRoute(node, (node.effort || "Medium") + " effort \u00b7 returned an artifact revision.");
            if (r1.stops) { t.push({ step: ++i, title: r1.kind === "WAIT" ? "Waiting for a reset" : "Waiting for you", detail: r1.kind === "WAIT" ? "Every subscription that serves " + (node.model || "the model") + " is exhausted. The run resumes when one resets." : "Every subscription is exhausted. The run asks before spending credit.", tone: "warn14" }); break; }
          }
          else if (node.type === "repeat") {
            var lim = Number(node.limit || 1);
            attempts[node.id] = (attempts[node.id] || 0) + 1;
            if (attempts[node.id] > lim) { push(node, "Attempt limit of " + lim + " already used. The run stops and asks the execution owner instead of trying again.", "bad14"); break; }
            var r2 = withRoute(node, "Attempt " + attempts[node.id] + " of " + lim + ". Changes applied and handed back to the reviewers.", attempts[node.id] === lim ? "warn14" : "ok14");
            if (r2.stops) break;
          }
          else if (node.type === "approval") { push(node, "Stops here and waits for the execution owner. Nothing merges on its own.", "warn14"); t.push({ step: ++i, title: "Waiting for you", detail: "A test run cannot approve on your behalf, so the simulation ends at this gate.", tone: "warn14" }); break; }
          else if (node.type === "question") { push(node, "Asks the requester a structured question and waits.", "warn14"); t.push({ step: ++i, title: "Waiting for an answer", detail: "A test run does not invent the answer, so the simulation ends here.", tone: "warn14" }); break; }
          else if (node.type === "finish") { push(node, node.note || "Reported the result in the conversation."); break; }
          else if (node.type === "condition") {
            if (!node.rule || node.rule === "custom") { push(node, "This custom expression needs a defined test input. Choose a review rule to try the sample cases.", "warn14"); break; }
            var no = reviewNo > 0; if (no) reviewNo--;
            var inputs = no ? [{ approved: false, blocking: true }, { approved: true, blocking: false }] : [{ approved: true, blocking: false }, { approved: true, blocking: false }];
            var yes = node.rule === "any-approved" ? inputs.some(function (x) { return x.approved; }) : node.rule === "no-blocking" ? !inputs.some(function (x) { return x.blocking; }) : inputs.every(function (x) { return x.approved; });
            var branch = yes ? "yes" : "no";
            push(node, "Inputs: " + inputs.map(function (x) { return x.approved ? "approved" : "changes requested"; }).join(" + ") + ". " + this.ruleLabel14(node) + " \u2192 " + branch + ".", yes ? "ok14" : "warn14", { cls: "branch17" });
            var edge = out(node.id).find(function (x) { return (x.kind || x.label) === branch; }) || out(node.id)[0];
            if (!edge) { t.push({ step: ++i, title: "Stopped", detail: "This condition has no matching branch.", tone: "bad14" }); break; }
            node = this.graphNode14(edge.to); continue;
          }
          var next = out(node.id);
          if (!next.length) { if (node.type !== "finish") t.push({ step: ++i, title: "Stopped", detail: node.label + " has no outgoing edge.", tone: "bad14" }); break; }
          if (next.length > 1 && node.type !== "condition") {
            var stop = false;
            for (var k = 0; k < next.length; k++) {
              var par = this.graphNode14(next[k].to);
              if (par) { var rp = withRoute(par, "Ran in parallel on the same revision."); if (rp.stops) stop = true; }
            }
            if (stop) break;
            var first = this.graphNode14(next[0].to), nxtEdge = first ? out(first.id)[0] : null;
            node = nxtEdge ? this.graphNode14(nxtEdge.to) : null; continue;
          }
          node = this.graphNode14(next[0].to);
        }
        var accounts = {}; t.forEach(function (x) { if (x.accId) accounts[x.accId] = true; });
        this._traceMeta17 = { steps: t.length, spend: spend, accounts: Object.keys(accounts).length, stopsAt: (function () { var last = t.filter(function (x) { return x.tone === "warn14" || x.tone === "bad14"; }).slice(-1)[0] || {}; return /Waiting for you/.test(last.title) ? "Your approval" : /Waiting for an answer/.test(last.title) ? "Your answer" : /Waiting for a reset/.test(last.title) ? "Quota reset" : last.title || "Finish"; })(), ended: t.some(function (x) { return x.title === "Finish"; }) };
        return t;
      }
      runTest17(all) {
        var caseId = this.state.testCase17 || "revise";
        var trace = this.traceGraph17(caseId);
        this.setState({ graphTrace14: trace, graphSide14: "test", traceShown17: all === false ? 1 : trace.length, traceMeta17: this._traceMeta17 });
        if (all !== false) this.toast("Test simulated in isolation. No model was called and no run was recorded.");
      }
      stepTest17() {
        var s = this.state;
        if (!(s.graphTrace14 || []).length) { this.runTest17(false); return; }
        var shown = Math.min((s.traceShown17 || s.graphTrace14.length) + 1, s.graphTrace14.length);
        this.setState({ traceShown17: shown });
      }

      // ----------------------------------------- workflow editor: checks
      checkGroups17() {
        var self = this;
        var issues = this.state.graphIssues14;
        var ran = Array.isArray(issues);
        var groups = [
          { id: "config", title: "Configuration", icon: "i15.svg#sliders-horizontal", copy: "Every task has a model and an instruction; every condition has a rule.", match: /-config$|-cond$/ },
          { id: "reach", title: "Reachability", icon: "i15.svg#git-branch", copy: "One start, one path from it into every step.", match: /^no-start$|^many-start$|-unreach$/ },
          { id: "edges", title: "Exits and edges", icon: "i15.svg#spline", copy: "No dangling edges, no step a run would stop in.", match: /-exit$|-dangling$|^finish$/ },
          { id: "branch", title: "Branches and joins", icon: "i15.svg#git-merge", copy: "Conditions connect both yes and no; parallel reviews join on one revision.", match: /-branch$/ },
          { id: "loops", title: "Bounded loops", icon: "i15.svg#refresh-cw", copy: "Every cycle passes through a repeat with a maximum number of attempts.", match: /-limit$|^cycle$/ },
        ];
        var used = {};
        var rows = groups.map(function (g) {
          var mine = ran ? issues.filter(function (v) { return g.match.test(v.id); }) : [];
          mine.forEach(function (v) { used[v.id] = true; });
          return self.checkGroupRow17(g, ran, mine);
        });
        if (ran) {
          var rest = issues.filter(function (v) { return !used[v.id]; });
          if (rest.length) rows.push(this.checkGroupRow17({ id: "other", title: "Other", icon: "i15.svg#circle-alert", copy: "" }, true, rest));
        }
        // Model routing is checked live against the connected accounts.
        var routing = [];
        var member = this.state.member;
        (this.state.graph14.nodes || []).forEach(function (n) {
          if (n.type !== "task" && n.type !== "repeat") return;
          var r = self.route17(n.model || "Auto", member);
          if (r.kind === "subscription" || r.kind === "credits" && !r.fallback) return;
          routing.push({ id: n.id + "-route", tone: r.kind === "ask" || r.kind === "wait" ? "warn14" : "warn14", title: n.label + " has no live subscription for " + (n.model || "Auto"), copy: r.next, node: n.id });
        });
        rows.push(this.checkGroupRow17({ id: "routing", title: "Model routing", icon: "i15.svg#waypoints", copy: "Each step's model has a connected account with quota, or a fallback you chose.", live: true }, true, routing));
        return rows;
      }
      checkGroupRow17(g, ran, mine) {
        var self = this;
        var bad = mine.filter(function (v) { return v.tone === "bad14"; }).length;
        var warn = mine.length - bad;
        return {
          key: g.id, title: g.title, icon: g.icon, copy: g.copy,
          status: !ran ? "Not run" : !mine.length ? "Passed" : bad ? bad + " blocking" + (warn ? " \u00b7 " + warn + " warning" + (warn === 1 ? "" : "s") : "") : warn + " warning" + (warn === 1 ? "" : "s"),
          cls: !ran ? "chk-idle17" : !mine.length ? "chk-ok17" : bad ? "chk-bad17" : "chk-warn17",
          hasIssues: mine.length > 0,
          issues: mine.map(function (v) {
            return { key: v.id, title: v.title, copy: v.copy, tone: v.tone, icon: v.tone === "bad14" ? "i15.svg#circle-x" : "i15.svg#triangle-alert",
              action: v.node ? "Fix" : g.id === "routing" ? "Funding" : "",
              open: function () {
                if (g.id === "routing" && !v.node) { self.closeGraph14(); self.openPicker11("funding"); return; }
                if (v.node) self.setState({ graphSel14: v.node, graphSide14: "node" });
              } };
          }),
        };
      }

      // ------------------------------------------ workflow editor: versions
      activateVersion17(id) {
        var s = this.state;
        var vs = (s.graphVersions14 || []).map(function (v) {
          return v.id === id ? Object.assign({}, v, { state: "Active", tone: "ok14", meta: "Re-activated just now \u00b7 " + (v.meta || "").split(" \u00b7 ").slice(1).join(" \u00b7 ") })
            : v.state === "Active" ? Object.assign({}, v, { state: "Historical", tone: "" }) : v;
        });
        var graphs = Object.assign({}, s.graphs14 || {});
        if (graphs[s.graph14.id]) graphs[s.graph14.id] = Object.assign({}, graphs[s.graph14.id], { versions: vs });
        this.setState({ graphVersions14: vs, graphs14: graphs });
        this.toast(id.toUpperCase() + " is active for new runs. Recorded runs keep the version they executed.");
      }
      versionRows17() {
        var self = this;
        return (this.state.graphVersions14 || []).map(function (v) {
          var parts = String(v.meta || "").split(" \u00b7 ");
          var head = parts[0] || "", rest = parts.slice(1);
          var date = head.replace(/^(Activated|Created|Re-activated)\s*/i, "");
          var verb = /^Created/i.test(head) ? "Created" : /^Re-activated/i.test(head) ? "Re-activated" : "Activated";
          var runs = rest.find(function (x) { return /run/.test(x); }) || "No recorded runs";
          var copy = rest.filter(function (x) { return !/run/.test(x); }).join(" \u00b7 ");
          var active = v.state === "Active";
          return {
            key: v.id, name: v.name, state: v.state, date: verb + " " + date,
            pill: active ? "active" : v.state === "Draft" ? "draft" : "hist",
            cls: active ? "current17" : "",
            copy: copy || (active ? "The version new runs start from." : "Kept for the runs that executed it."),
            runs: runs.replace(/ executed this version$/, ""),
            isActive: active, canActivate: !active && v.state !== "Draft",
            activate: function () { self.activateVersion17(v.id); },
          };
        });
      }

      // -------------------------------------------------- autopilot model
      afModel17() { return (this.state.autoDraft9 || {}).model17 || "Auto"; }
      afFund17() { return (this.state.autoDraft9 || {}).fund17 || "subscription"; }
      patchAutoDraft17(patch) { this.setState({ autoDraft9: Object.assign({}, this.state.autoDraft9 || {}, patch) }); }
      afModelMenu17(e) {
        var self = this;
        var models = ["Auto", "Claude Opus 5", "Claude Sonnet 5", "Claude Fable 5", "GPT-6 Astra", "GPT-5.6 Sol"];
        this.openMenu14(null, e, models.map(function (m) {
          var logo = self.modelLogo17(m);
          var r = self.route17(m);
          return { label: m, logo: logo.brand12 || undefined, logoClass: logo.brandClass12, icon: logo.brand12 ? undefined : self.icon14("sparkles"),
            hint: m === "Auto" ? "Best fit per run" : self.routeLabel17(r),
            on: self.afModel17() === m, run: function () { self.patchAutoDraft17({ model17: m }); self.closeMenu14(); } };
        }), "Model for runs", { kind: "af-model", cls: "menu-rich15" });
      }
      afFundMenu17(e) {
        var self = this;
        var rows = [
          { id: "subscription", label: "Subscriptions first", hint: "Your accounts, then the fallback you chose", icon: this.icon14("credit-card") },
          { id: "credits", label: "BotInc credits", hint: "Workspace credit, never your subscriptions", icon: this.icon14("wallet") },
        ];
        this.openMenu14(null, e, rows.map(function (r) {
          return { label: r.label, hint: r.hint, icon: r.icon, on: self.afFund17() === r.id, run: function () { self.patchAutoDraft17({ fund17: r.id }); self.closeMenu14(); } };
        }), "Pay with", { kind: "af-fund", cls: "menu-rich15" });
      }
      afRoute17() {
        var model = this.afModel17();
        if (this.afFund17() === "credits") return { kind: "credits", model: model, next: "" };
        return this.route17(model);
      }

      // Sample routing rows for a thread that has none yet, so the log shows
      // what a send, a mid-run re-route and an exhausted account look like.
      seedDemoRoutes17() {
        var s = this.state;
        if (s.view !== "thread9") return;
        var issue = this.issue(); if (!issue) return;
        var key = this.convKey17();
        this._seeded17 = this._seeded17 || {};
        if (this._seeded17[key] || ((s.routeLog17 || {})[key] || []).length) return;
        var hist = this.historyRows13().length;
        var n = ((s.threadMessages9 || {})[issue.id] || []).length;
        if (hist < 3 && n < 2) return;
        this._seeded17[key] = true;
        var self = this;
        var useHist = hist >= 3;
        var at = function (k) { return useHist ? { hist: true, back: 4 - k } : { seq: k }; };
        var cands = this.candidates17(s.member, "Claude Sonnet 5");
        var a0 = cands[0], a1 = cands[1];
        if (!a0) return;
        var row = function (acc, left) { var logo = self.acctLogo17(acc); return { logo: logo.brand12, logoClass: logo.brandClass12, hasLeft: true, left: 100 - left, barStyle: self.routeBar17(left).style }; };
        setTimeout(function () {
          var log = Object.assign({}, self.state.routeLog17 || {});
          var rows = [
            Object.assign(at(1), { time: "09:41", tone: "", text: "Sent with Claude Opus 5 \u00b7 " + self.acctName17(a0) + " \u00b7 sub \u00b7 57% used, resets 14:00" }, row(a0, 43)),
            Object.assign(at(2), { time: "09:44", tone: "tone-midrun17", text: "Model changed mid-run \u00b7 Claude Opus 5 \u2192 Claude Sonnet 5 \u00b7 " + self.acctName17(a0) + " \u00b7 sub \u00b7 63% used" }, row(a0, 37)),
          ];
          if (a1 && (useHist || n >= 3)) rows.push(Object.assign(at(3), { time: "09:52", tone: "tone-midrun17", text: "Switched account mid-run \u00b7 " + self.acctName17(a0) + " ran out (resets 14:00) \u2192 " + self.acctName17(a1) + " \u00b7 sub \u00b7 18% used" }, row(a1, 82)));
          log[key] = rows.concat(log[key] || []);
          self.setState({ routeLog17: log });
        }, 0);
      }

      // ------------------------------------------------------- renderVals
      renderVals() {
        var v = super.renderVals();
        var self = this;
        var s = this.state;
        var o = function (patch) { self.setState(patch); };

        // Live routing for the next message.
        var r = this.route17();
        Object.assign(v, this.routeRow17(r));
        v.routeTitle17 = "Next message: " + v.routeModel17 + " \u00b7 " + v.routeAccount17 + " \u00b7 " + v.routeKind17 + (v.routeLeft17 ? " \u00b7 " + v.routeLeft17 : "") + ". " + r.next;
        // The routing picker: the ladder, editable.
        var member17 = s.member, key17 = this.convKey17();
        v.routePopover17 = s.popover10 === "route";
        if (v.routePopover17) v.popoverTitle10 = "Routing for this conversation";
        v.routePicker17 = function (e) { self._rpAnchor17 = e && (e.currentTarget || e.target); self.openPicker11("route", e); };
        var plan17 = this.plan17(), custom17 = !!(s.routePlan17 || {})[key17];
        var firstLive17 = -1; plan17.forEach(function (st, i) { if (firstLive17 < 0 && self.stepLive17(st)) firstLive17 = i; });
        v.rpSteps17 = plan17.map(function (st, i) {
          var a = self.accountById(member17, st.accId);
          var logo = a ? self.acctLogo17(a) : self.modelLogo17(st.model);
          var l = a && !st.api ? self.minLeft17(a) : null, t = a && !st.api ? self.tightest17(a) : null;
          var live = self.stepLive17(st);
          var meta = st.api ? "pays per call · within the task limit" : !a ? "account missing" : l === null ? "no usage data" : (!live && t && t.resets ? "resets " + t.resets : "");
          return { key: st.model + "|" + st.accId + "|" + i, n: i + 1, model: st.model, account: a ? self.acctName17(a) : "No account", meta: meta, metaSep: meta ? " · " : "",
            logo: logo.brand12, logoClass: logo.brandClass12, hasLogo: !!logo.brand12, hasBar: !st.api && l !== null, barStyle: self.routeBar17(l).style, barTone: self.routeBar17(l).tone, used: l === null ? "" : (100 - l) + "%",
            kind: st.api ? "API KEY" : "SUB", kindCls: st.api ? "k-api17" : "k-sub17", cls: i === firstLive17 ? "now" : !live ? "spent" : "",
            menu: function (e) { self.rpStepMenu17(e, i); } };
        });
        var pol17 = this.policy17(member17), polKind17 = pol17 === "credits" ? "credits" : pol17 === "wait" ? "wait" : "ask";
        v.rpEndTitle17 = pol17 === "credits" ? "BotInc credits" : pol17 === "wait" ? "Wait for the first reset" : "Ask you first";
        v.rpEndMeta17 = "when every step above is at 100%" + (pol17 === "credits" ? " · within the task limit" : "");
        v.rpEndKind17 = KIND_LABEL[polKind17]; v.rpEndCls17 = KIND_CLS[polKind17];
        v.rpCustom17 = custom17;
        v.rpSummary17 = plan17.length + " step" + (plan17.length === 1 ? "" : "s") + " · " + (custom17 ? "edited by you" : "automatic from " + (s.model || "Auto") + " and your accounts") + ". The first with usage left takes the next call.";
        v.rpReset17 = function () { var p = Object.assign({}, s.routePlan17 || {}); delete p[key17]; o({ routePlan17: p }); };
        v.rpAdd17 = function (e) { self.rpAddMenu17(e); };
        v.rpFunding17 = function (e) { self.openPicker11("funding", e); };
        // Funding: one list of complete strategies instead of a mode plus a fallback.
        var fMode17 = this.fundingMode(member17), fPol17 = this.policy17(member17);
        var accts17 = this.accountsFor(member17).filter(function (a) { return (a.kind === "subscription" || (a.kind === "api" && a.enabled)) && self.accountUsable(a); });
        var subs17 = accts17.filter(function (a) { return a.kind === "subscription"; }), keys17 = accts17.length - subs17.length;
        var live17 = subs17.filter(function (a) { var l = self.minLeft17(a); return l === null || l > 0; }).length;
        v.fpLead17 = "After the routing ladder \u00b7 " + live17 + " of " + subs17.length + " subscriptions live" + (keys17 ? " \u00b7 " + keys17 + " API key" + (keys17 === 1 ? "" : "s") : "");
        var setFund17 = function (mode, pol) { return function () {
          var patch = { funding: Object.assign({}, s.funding || {}, { [member17]: mode }) };
          if (pol) patch.fallbackPolicies10 = Object.assign({}, s.fallbackPolicies10 || {}, { [member17]: pol });
          o(patch);
          self.logRoute17({ text: "Funding changed \u00b7 " + (mode === "credits" ? "BotInc credits only" : "your accounts, then " + (pol === "credits" ? "credits" : pol === "wait" ? "wait for a reset" : "ask")), tone: "" });
        }; };
        var fpDefs17 = [
          { id: "ask", mode: "subscription", pol: "ask", title: "Your accounts, then ask", copy: "When every step is at 100% the run pauses and asks you.", kind: "ASK", kindCls: "k-ask17" },
          { id: "credits", mode: "subscription", pol: "credits", title: "Your accounts, then credits", copy: "When every step is at 100% credits continue, within the task limit.", kind: "CREDIT", kindCls: "k-credit17" },
          { id: "wait", mode: "subscription", pol: "wait", title: "Your accounts, then wait", copy: "When every step is at 100% the run waits for the first reset. Never spends credit.", kind: "WAIT", kindCls: "k-wait17" },
          { id: "only", mode: "credits", pol: null, title: "BotInc credits only", copy: "Every call on workspace credit, within the task limit. Your accounts stay untouched.", kind: "CREDIT", kindCls: "k-credit17" },
        ];
        v.fpRows17 = fpDefs17.map(function (d) {
          var on = d.mode === "credits" ? fMode17 === "credits" : fMode17 !== "credits" && fPol17 === d.pol;
          return { key: d.id, title: d.title, copy: d.copy, kind: d.kind, kindCls: d.kindCls, cls: on ? "on" : "", checkedStr: on ? "true" : "false", pick: setFund17(d.mode, d.pol) };
        });
        v.fpLadder17 = function (e) { self.closePicker11(); setTimeout(function () { var el = document.querySelector(".rh-main17"); self._rpAnchor17 = el; self.openPicker11("route", { currentTarget: el }); }, 0); };
        // Workflow editor: what a step does when its model has nothing left.
        var nm17 = v.m14_graphNodeModel14 && v.m14_graphNodeModel14.label;
        if (nm17 === "Auto") v.nodeRouteNote17 = "Auto lets the router choose: the first account with usage left, in the order of the issue's routing ladder.";
        else if (nm17) {
          var lad = this.defaultPlan17(member17, nm17), f = lad[0], nxt = lad.find(function (st) { return st.model !== nm17; });
          var fa = f && this.accountById(member17, f.accId), na = nxt && this.accountById(member17, nxt.accId);
          v.nodeRouteNote17 = (fa ? "Runs on " + this.acctName17(fa) + " while it has usage, then the next account with " + nm17 + ". " : "No connected account serves " + nm17 + ". ")
            + (na ? "When every " + nm17 + " account is at 100% it moves to " + nxt.model + " on " + this.acctName17(na) + ", then down the ladder. " : "")
            + "After the ladder: " + this.wfFundLabel17(this.wfFund17()).toLowerCase() + ".";
        } else v.nodeRouteNote17 = "";
        v.routeHeading17 = r.model === "Auto" ? "Auto \u00b7 first account" : r.kind === "subscription" ? "Runs on" : r.kind === "credits" ? "Paid with" : "Routing";
        v.routeCopy17 = r.kind === "credits" ? "BotInc credits pay for model and cloud work. Your subscriptions stay untouched." : r.next;
        v.routeWindows17 = r.account ? this.windows17(r.account).map(function (w) {
          var bar = self.routeBar17(w.left);
          return { key: w.label, label: { SESSION: "Session", WEEK: "Week", WEEKLY: "Week", FABLE: "Fable" }[w.label] || w.label, left: (100 - w.left) + "% used", style: bar.style, tone: bar.tone, resets: w.resets ? "resets " + w.resets : "" };
        }) : [];
        var spent = this.spent17(), limit = this.taskLimit17();
        v.routeCostShort17 = this.cash(spent) + " / " + String(this.cash(limit)).replace(/^\$/, "");
        // What happens after the current account: the live queue, then the policy.
        var chain = [];
        if (r.kind === "subscription" && r.account) {
          // The current account is the "Runs on" card above; the chain lists what follows it.
          var liveQ = (r.candidates || []).filter(function (a) { var l = self.minLeft17(a); return a.id !== r.account.id && (l === null || l > 0); }).slice(0, 2);
          liveQ.forEach(function (a) {
            var l = self.minLeft17(a), t = self.tightest17(a);
            chain.push({ key: a.id, title: self.acctName17(a), cls: "", kind: "SUB", kindCls: "k-sub17",
              meta: (l === null ? "no usage data" : (100 - l) + "% used") + (t && t.resets ? " \u00b7 resets " + String(t.resets).replace(/,\s*\w+ \d+\s*\u00b7?\s*/, " ") : "") });
          });
          var pol = this.policy17();
          chain.push({ key: "policy", cls: "end", title: pol === "credits" ? "BotInc credits" : pol === "wait" ? "Wait for a reset" : "Ask you first",
            kind: KIND_LABEL[pol === "credits" ? "credits" : pol === "wait" ? "wait" : "ask"], kindCls: KIND_CLS[pol === "credits" ? "credits" : pol === "wait" ? "wait" : "ask"],
            meta: "all accounts at 100%" + (pol === "credits" ? " \u00b7 within " + this.cash(limit) : "") });
        }
        v.routeChain17 = chain; v.routeHasChain17 = chain.length > 0;
        this.seedDemoRoutes17();
        v.routeLimit17 = this.cash(limit);
        v.routeSpent17 = this.cash(spent);
        v.conversationCost10 = this.cash(spent);
        v.routeLimitRow17 = "Task limit " + this.cash(limit) + " \u00b7 " + this.cash(spent) + " used";
        v.editTaskLimit17 = function (e) { self.editTaskLimit17(e); };
        v.limitEditing17 = s.popover10 === "model" && !!s.limitEdit17;
        v.limitDraft17 = s.limitDraft17 == null ? String(limit) : s.limitDraft17;
        v.limitError17 = s.limitError17 || "";
        v.limitDraftEdit17 = function (e) { o({ limitDraft17: e.target.value, limitError17: "" }); };
        v.limitEditCancel17 = function () { o({ limitEdit17: false, limitError17: "" }); };
        v.limitEditSave17 = function () { self.saveTaskLimit17(Number(s.limitDraft17 == null ? limit : s.limitDraft17)); };
        v.limitPresets17 = [1, 2, 5, 10, 25].map(function (n) {
          var on = Number(v.limitDraft17) === n;
          return { key: n, label: self.cash(n), cls: on ? "on" : "", pick: function () { self.saveTaskLimit17(n); } };
        });
        if (s.view === "thread9" && Array.isArray(v.threadMessages9)) v.threadMessages9 = this.mergeNotes17(v.threadMessages9);
        if (s.view === "thread9" && Array.isArray(v.scenarioRows13) && v.scenarioRows13.length) v.scenarioRows13 = this.mergeHistoryNotes17(v.scenarioRows13);
        // Funding switches announce themselves in the conversation.
        var wrap = function (name, text) {
          var fn = v[name];
          if (typeof fn !== "function") return;
          v[name] = function (e) { fn(e); setTimeout(function () { self.logRoute17(self.routeEntry17(self.route17(), text)); }, 0); };
        };
        wrap("useSubscriptions11", "Funding changed \u00b7 subscriptions first \u00b7");
        wrap("useCredits11", "Funding changed \u00b7 BotInc credits \u00b7");

        // Chats are their own thing in the sidebar: direct conversations with the
        // Operator that may create issues but are not issues.
        if (Array.isArray(v.conversationGroups12)) {
          var chats = (s.chats || {})[s.member] || [];
          var rows = chats.filter(function (c) { return !c.isTeam; }).map(function (c) {
            var on = s.view === "chat" && s.activeChat === c.id;
            var noop = function () {};
            return { id: "chat:" + c.id, key: "chat:" + c.id, title: c.title + ((c.spawned17 || []).length ? " \u00b7 " + c.spawned17.length + " issues" : ""), tone: "st-chat17", icon: "i15.svg#message-square",
              selected: on, cls: "c9-row c9-chat17" + (on ? " selected" : ""), current: on ? "page" : "false", renaming16: false, unread16: false,
              pinClass: "", pinLabel: "Pin " + c.title, pin: noop, archive16: noop, menu16: noop, hoverIn16: noop, hoverOut16: noop,
              open: function () { self.loadChat9(c.id); } };
          });
          if (rows.length) v.conversationGroups12 = [{ title: "Chats", key: "chats17", count: rows.length, rows: rows, more: false, moreLabel: "", toggle: function () {}, icon16: "i15.svg#message-square", tone16: "st-chat17" }].concat(v.conversationGroups12);
        }
        // Which workflow ran this issue. Chosen by the issue, never in the composer.
        var wfl = this.workflowList17(), wfById = {}; wfl.forEach(function (w) { wfById[w.id] = w; });
        var issueWf = s.view === "thread9" ? wfById[this.detectWorkflow17()] : null;
        v.issueWorkflow17 = issueWf ? issueWf.name + (issueWf.state ? " \u00b7 " + issueWf.state.toLowerCase() : "") : "No workflow";
        v.issueWorkflowTitle17 = issueWf ? "Ran the " + issueWf.name + " workflow. Open it in the editor." : "";
        v.openIssueWorkflow17 = function () { if (issueWf) self.openGraph14(issueWf.id); };
        var gfk = this.wfFund17();
        v.gfLabel17 = this.wfFundLabel17(gfk);
        v.gfShort17 = gfk === "subs" ? "Subscriptions only" : gfk === "credits" ? "BotInc credits" : "Subscriptions, then credits";
        v.gfMenu17 = function (e) { self.gfMenu17(e); };

        // Workflow choice for this conversation.
        var pick = this.workflowPick17();
        var detected = this.detectWorkflow17();
        var list = this.workflowList17();
        var byId = {}; list.forEach(function (w) { byId[w.id] = w; });
        var effective = pick === "auto" ? detected : pick;
        var peekRow = s.wfPeek17 || pick;            // row under the pointer: "auto" or a workflow id
        var peekGraph = peekRow === "auto" ? detected : peekRow;
        v.wfShort17 = (byId[effective] ? byId[effective].name : "Workflow") + (pick === "auto" ? " \u00b7 auto" : "");
        v.wfRowLabel17 = pick === "auto" ? "Workflow \u00b7 Auto \u2192 " + (byId[detected] ? byId[detected].name : "best fit") : "Workflow \u00b7 " + (byId[pick] ? byId[pick].name : pick);
        v.mpWorkflows17 = s.popover10 === "model" && s.mpMode15 === "workflows";
        if (v.mpWorkflows17) {
          v.pickerClass11 = (v.pickerClass11 || "") + " wf-wide17";
          var mL = /left:(-?\d+)px/.exec(v.pickerStyle11 || "");
          if (mL) v.pickerStyle11 += ";--pl:" + mL[1] + "px";
        }
        v.mpWorkflowsGo17 = function () { o({ mpMode15: "workflows", wfPeek17: pick }); };
        v.routeWfOpen17 = function (e) { self.openPicker11("model", e); setTimeout(function () { o({ mpMode15: "workflows", wfPeek17: pick }); }, 0); };
        var setPick = function (id) {
          o({ workflowPick17: Object.assign({}, s.workflowPick17 || {}, { [self.convKey17()]: id }), wfPeek17: id });
          self.logRoute17({ text: "Workflow " + (id === "auto" ? "set to Auto \u00b7 best fit now is " + (byId[detected] ? byId[detected].name : "chosen on send") : "forced \u00b7 " + (byId[id] ? byId[id].name : id) + " runs for this conversation"), tone: "" });
        };
        v.wfRows17 = [{ id: "auto", name: "Auto", meta: "Best fit from your workflows \u00b7 now " + (byId[detected] ? byId[detected].name : "\u2014"), icon: "i15.svg#sparkles" }]
          .concat(list.map(function (w) { return { id: w.id, name: w.name, meta: w.meta || w.state || "", icon: self.icon14(w.icon || "git-branch") }; }))
          .map(function (w) {
            var selected = w.id === pick;
            return { key: w.id, name: w.name, meta: w.meta, icon: w.icon, selected: selected, check: selected ? "\u2713" : "",
              cls: (selected ? "selected " : "") + (w.id === peekRow ? "peeked17" : ""),
              peek: function () { if (self.state.wfPeek17 !== w.id) o({ wfPeek17: w.id }); },
              pick: function () { setPick(w.id); } };
          });
        var peekWf = byId[peekGraph];
        v.wfPeekEyebrow17 = peekRow === "auto" ? "Auto would run" : "Forced workflow";
        v.wfPeekTitle17 = peekWf ? peekWf.name : "";
        v.wfPeekMeta17 = peekWf ? (peekWf.meta || "") + (peekWf.state ? " \u00b7 " + peekWf.state : "") : "";
        v.wfPeekSteps17 = peekGraph ? this.workflowSteps17(peekGraph) : [];
        v.wfPeekOpen17 = function () { self.closePicker11(); self.openGraph14(peekGraph); };
        v.wfPeekCanUse17 = peekRow !== pick;
        v.wfPeekUse17 = function () { setPick(peekRow); };

        // ---- workflow editor panes
        if (s.overlay14 === "graph" && s.graph14) {
          v.checkGroups17 = this.checkGroups17();
          var ran = Array.isArray(s.graphIssues14);
          var blocking = ran ? s.graphIssues14.filter(function (x) { return x.tone === "bad14"; }).length : 0;
          var warnings = v.checkGroups17.reduce(function (n, g) { return n + (g.cls === "chk-warn17" ? g.issues.length : 0); }, 0);
          v.checksSummary17 = !ran ? "Not checked since the last change" : blocking ? blocking + " blocking \u00b7 fix before activating" : warnings ? "Ready to activate \u00b7 " + warnings + " routing warning" + (warnings === 1 ? "" : "s") : "Every check passed";
          v.checksTone17 = !ran ? "" : blocking ? "bad14" : warnings ? "warn14" : "ok14";
          v.checksIcon17 = !ran ? "i15.svg#circle-dashed" : blocking ? "i15.svg#circle-x" : warnings ? "i15.svg#triangle-alert" : "i15.svg#circle-check";

          var cases = this.testCases17(), cur = s.testCase17 || "revise";
          v.graphCases17 = cases.map(function (c) { return Object.assign({}, c, { key: c.id, on: c.id === cur, cls: c.id === cur ? "on" : "", pick: function () { o({ testCase17: c.id, graphTrace14: [], traceShown17: 0 }); } }); });
          v.runTest17 = function () { self.runTest17(true); };
          v.stepTest17 = function () { self.stepTest17(); };
          var trace = s.graphTrace14 || [];
          var shown = s.traceShown17 ? Math.min(s.traceShown17, trace.length) : trace.length;
          v.stepLabel17 = trace.length && shown < trace.length ? "Next step (" + shown + " of " + trace.length + ")" : "Step through";
          v.graphTrace17 = trace.slice(0, shown).map(function (x, idx) { return Object.assign({ key: idx, cls: "", hasRoute: false }, x, { tone: x.tone || "ok14" }); });
          v.traceHasMore17 = shown < trace.length;
          v.traceMoreNote17 = (trace.length - shown) + " more step" + (trace.length - shown === 1 ? "" : "s") + ". Press Next step or Run whole test.";
          var meta = s.traceMeta17 || this._traceMeta17 || {};
          v.traceFacts17 = trace.length ? [
            { key: "steps", k: "Steps", v: String(trace.length), tone: "" },
            { key: "stop", k: meta.ended ? "Ends at" : "Stops at", v: meta.ended ? "Finish" : (meta.stopsAt || "\u2014"), tone: meta.ended ? "ok14" : "warn14" },
            { key: "cost", k: "Est. spend", v: this.cash(meta.spend || 0), tone: "" },
            { key: "acc", k: "Accounts", v: String(meta.accounts || 0), tone: "" },
          ] : [];

          v.graphVersions17 = this.versionRows17();
          v.graphDraft17 = this.graphDirty14();
          v.graphNextVersion17 = "v" + ((s.graph14.version || 0) + 1);
          v.graphDraftCopy17 = s.graph14.version ? "Changes on the canvas that no version carries yet. Run the checks, then activate." : "This workflow has never been activated. Activate to make it available to new runs.";
        }

        // ---- autopilot form + record
        var afm = this.afModel17(), afr = this.afRoute17();
        var afLogo = this.modelLogo17(afm), afAccLogo = afr.account ? this.acctLogo17(afr.account) : afLogo;
        v.afModel17 = afm; v.afModelHasLogo17 = !!afLogo.brand12; v.afModelLogo17 = afLogo.brand12; v.afModelLogoClass17 = afLogo.brandClass12;
        v.afFund17 = this.afFund17() === "credits" ? "BotInc credits" : "Subscriptions first";
        v.afModelMenu17 = function (e) { self.afModelMenu17(e); };
        v.afFundMenu17 = function (e) { self.afFundMenu17(e); };
        v.afRouteAccount17 = this.routeLabel17(afr);
        v.afRouteMeta17 = afr.account ? this.acctMeta17(afr.account) + " \u00b7 " + this.leftText17(afr.account) : afr.kind === "credits" ? "Workspace credit \u00b7 never your subscriptions" : afr.next;
        v.afRouteKind17 = KIND_LABEL[afr.kind] || afr.kind; v.afRouteKindCls17 = KIND_CLS[afr.kind] || "";
        v.afRouteHasLogo17 = !!afAccLogo.brand12; v.afRouteLogo17 = afAccLogo.brand12; v.afRouteLogoClass17 = afAccLogo.brandClass12;
        // Recorded routine runs name what served them.
        var recorded = function (i) {
          var accs = self.candidates17(s.member, "Claude Sonnet 5");
          var a = accs[i % Math.max(1, accs.length)];
          return a ? { model: "Claude Sonnet 5", account: self.acctName17(a), kind: "SUB", meta: self.acctMeta17(a) } : { model: "Claude Sonnet 5", account: "BotInc credits", kind: "CREDIT", meta: "" };
        };
        if (Array.isArray(v.historyRows14)) {
          v.historyRows14 = v.historyRows14.map(function (h, i) {
            var skipped = /skipped|failed|queued|waiting/i.test(String(h.title) + String(h.detail));
            var rr = recorded(i);
            return Object.assign({}, h, { hasRoute17: !skipped, route17: rr.model + " \u00b7 " + rr.account + " \u00b7 " + rr.kind, routeIcon17: "i15.svg#waypoints" });
          });
        }
        var curAuto = this.auto9 ? this.auto9() : null;
        v.autoModel17 = (curAuto && curAuto.model17) || "Claude Sonnet 5";
        var ar = curAuto && curAuto.fund17 === "credits" ? { kind: "credits", model: v.autoModel17 } : this.route17(v.autoModel17);
        v.autoRoute17 = this.routeLabel17(ar) + " \u00b7 " + (KIND_LABEL[ar.kind] || "").toLowerCase() + (ar.account ? " \u00b7 " + this.leftText17(ar.account) : "");
        if (Array.isArray(v.rrDetails16) && v.rrFacts16) {
          var rr0 = recorded(0);
          v.rrDetails16 = v.rrDetails16.concat([
            { key: "model17", k: "Model", v: v.rrFacts16[3] ? v.rrFacts16[3].v : rr0.model },
            { key: "acct17", k: "Account", v: rr0.account + (rr0.meta ? " \u00b7 " + rr0.meta : "") },
            { key: "paid17", k: "Paid with", v: rr0.kind === "SUB" ? "Subscription" : rr0.kind === "CREDIT" ? "BotInc credits" : "API key" },
          ]);
          if (Array.isArray(v.rrUsageRows16) && v.rrUsageRows16[0]) {
            v.rrUsageRows16 = v.rrUsageRows16.map(function (u, i) { return i === 0 && /subscription/.test(u.copy) ? Object.assign({}, u, { copy: u.copy.replace("subscription", rr0.account + " \u00b7 subscription") }) : u; });
            v.rrFunded16 = rr0.account + " (" + s.member + "\u2019s Claude subscription)";
          }
        }
        return v;
      }
    };
  };
})();

