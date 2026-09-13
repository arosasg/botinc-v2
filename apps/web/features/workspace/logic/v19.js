/* Workspace v19 logic, from design-ref/Workspace v19.dc.html (the inline
   <script data-dc-script>). Layered over the v16..v19 mixins in this folder.
   Runs in the browser only. Regenerate from the design source; do not edit. */
/* eslint-disable */
// @ts-nocheck
import "./base16.js";
import "./runs16.js";
import "./routing17.js";
import "./flow18.js";
import "./motion19.js";

export function makeWorkspaceLogic(DCLogic) {
function replaceAll16(s, find, to) { return String(s).split(find).join(to); }
class Component extends window.BotincMotionWorkspace19(window.BotincFlowWorkspace18(window.BotincRoutingWorkspace17(window.BotincRunWorkspace16(window.BotincWorkspaceBase16(DCLogic))))) {
  // The Account usage modal duplicated the settings page it linked to, so every
  // route into it navigates straight to Settings > Model accounts instead. The
  // capacity card also gains the brand mark and plan its compact layout shows.
  // The plus menu named the plugin picker "Connectors" and repeated "Plugins"
  // as a footer link. One name, one place: the row is Plugins, it opens a
  // multi-select that stays open while you tick tools, and the footer there
  // navigates to the Plugins page to add more.
  // ------------------------------------------------------- account safety
  // Manage, Review and Open used to toast. Each opens the screen it promises,
  // and the profile rows read their copy back from the same state.
  static SEC19 = {
    twoStep: true, ask: true, sms: false,
    codesLeft: 10, codesWhen: "12 March", codesOpen: false,
    codes: ["4K2P-9QX1", "7M3D-2LB8", "QZ81-4T0V", "5RN7-8HC2", "J09W-1XK4",
      "T62B-7PD5", "N4V8-3GQ0", "8CL2-6WJ7", "R51K-0YM9", "D37X-5ZB1"],
    sessions: [
      { id: "mac", short: "this Mac", name: "This Mac", icon: "monitor", meta: "Chrome 141 \u00b7 macOS 15.4",
        where: "Madrid, ES", ip: "88.14.22.7", when: "Active now", current: true },
      { id: "iphone", short: "iPhone", name: "iPhone 16 Pro", icon: "phone", meta: "BotInc app 2.4",
        where: "Madrid, ES", ip: "88.14.22.7", when: "2 hours ago" },
      { id: "daemon", short: "desktop client", name: "Desktop client", icon: "terminal", meta: "botinc-daemon 0.9.3 \u00b7 on this Mac",
        where: "Madrid, ES", ip: "88.14.22.7", when: "Active now" },
    ],
    keys: [
      { id: "k1", name: "Daemon on this Mac", prefix: "bi_live_7f2c", scope: "Full access", created: "12 March", used: "Active now" },
      { id: "k2", name: "CI \u00b7 botinc/app", prefix: "bi_live_a913", scope: "Read only", created: "4 January", used: "yesterday" },
    ],
    newKey: null,
  };
  sec19() { return this.state.sec19 || Component.SEC19; }
  patchSec19(patch) { this.setState({ sec19: Object.assign({}, this.sec19(), patch) }); }
  countLabel19(n, one, many) { return n + " " + (n === 1 ? one : many); }

  secVals19(v) {
    const st = this.state, s = this.sec19();
    v.twoStepDialog19 = st.dialog === "twoStep19";
    v.devicesDialog19 = st.dialog === "devices19";
    v.keysDialog19 = st.dialog === "apiKeys19";
    if (v.twoStepDialog19 || v.devicesDialog19 || v.keysDialog19) {
      v.modalClass = (v.modalClass || "modal") + " wide sec-modal19";
    }

    // Two-step sign-in: the factors, the way back in, and the limit said out loud.
    v.tsRows19 = [
      { key: "app", title: "Authenticator app",
        copy: s.twoStep ? "Google Authenticator \u00b7 added 12 March" : "Nothing set up yet",
        state: s.twoStep ? "Primary" : "Off", tone: s.twoStep ? "ok19" : "",
        action: s.twoStep ? "Replace" : "Set up",
        act: () => { this.patchSec19({ twoStep: true }); this.toast(s.twoStep ? "Scan the new code on your phone to replace it." : "Two-step sign-in is on."); } },
      { key: "passkey", title: "Passkey as the second step",
        copy: "This Mac and iPhone 16 Pro already hold one", state: "On", tone: "ok19", action: "Passkeys",
        act: () => { this.setState({ dialog: null, pfTab16: "security" }); this.toast("Passkeys are managed in the card above."); } },
      { key: "sms", title: "Text message",
        copy: s.sms ? "+34 \u2022\u2022\u2022 \u2022\u2022\u2022 418 \u00b7 backup only" : "A text can be intercepted. Keep it as a fallback, not the primary.",
        state: s.sms ? "Backup" : "Off", tone: "", action: s.sms ? "Remove" : "Add a number",
        act: () => { this.patchSec19({ sms: !s.sms }); this.toast(s.sms ? "Text backup removed." : "A code was sent to confirm the number."); } },
      { key: "codes", title: "Recovery codes",
        copy: s.codesLeft + " unused \u00b7 generated " + s.codesWhen,
        state: s.codesLeft < 4 ? "Running low" : "Ready", tone: s.codesLeft < 4 ? "bad19" : "ok19",
        action: s.codesOpen ? "Hide" : "View codes",
        act: () => this.patchSec19({ codesOpen: !s.codesOpen }) },
    ];
    const cs = s.codes || [], lines = [];
    for (let i = 0; i < cs.length; i += 2) lines.push(cs.slice(i, i + 2).join("    "));
    v.tsCodesOpen19 = !!s.codesOpen;
    v.tsCodes19 = lines.join("\n");
    v.tsCopyCodes19 = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cs.join("\n"));
      this.toast("Ten codes copied. Store them outside this workspace.");
    };
    v.tsNewCodes19 = () => { this.patchSec19({ codesLeft: 10, codesWhen: "just now" }); this.toast("Ten new codes. The old ten no longer work."); };
    v.tsAsk19 = !!s.ask;
    v.tsAskCls19 = s.ask ? "on" : "";
    v.tsToggleAsk19 = () => this.patchSec19({ ask: !s.ask });
    v.tsOffLabel19 = s.twoStep ? "Turn off two-step sign-in" : "Two-step sign-in is off";
    v.tsTurnOff19 = () => {
      if (!s.twoStep) return;
      this.patchSec19({ twoStep: false, codesOpen: false });
      this.toast("Two-step sign-in is off. Your password is the only lock.");
    };

    // Signed-in devices: every session, and the one you are using now.
    const ses = s.sessions || [];
    v.devSummary19 = this.countLabel19(ses.length, "active session", "active sessions")
      + " \u00b7 signing one out ends the work it started.";
    v.devRows19 = ses.map((d) => Object.assign({}, d, {
      key: d.id, icon: "i15.svg#" + d.icon, notCurrent: !d.current,
      out: () => { this.patchSec19({ sessions: ses.filter((x) => x.id !== d.id) }); this.toast(d.name + " signed out."); },
    }));
    v.devOutAll19 = () => {
      const keep = ses.filter((x) => x.current);
      if (keep.length === ses.length) { this.toast("Nothing else is signed in."); return; }
      this.patchSec19({ sessions: keep });
      this.toast("Signed out everywhere else.");
    };

    // API keys: what each one can do, and a secret shown exactly once.
    const keys = s.keys || [];
    v.akRows19 = keys.map((k) => Object.assign({}, k, {
      key: k.id, full19: k.scope === "Full access",
      scopePick: (e) => this.openMenu14(null, e, ["Read only", "Full access"].map((sc) => ({
        label: sc, on: sc === k.scope,
        run: () => {
          this.patchSec19({ keys: keys.map((x) => (x.id === k.id ? Object.assign({}, x, { scope: sc }) : x)) });
          this.toast(k.name + " is now " + sc.toLowerCase() + ".");
        },
      })), "What this key may do"),
      revoke: () => {
        this.patchSec19({ keys: keys.filter((x) => x.id !== k.id) });
        this.toast(k.name + " revoked. Anything using it stops now.");
      },
    }));
    v.akEmpty19 = !keys.length;
    v.akNote19 = "Read-only by default. A key can do what you can.";
    v.akNew19 = !!s.newKey;
    v.akSecret19 = s.newKey ? s.newKey.secret : "";
    v.akCreate19 = () => {
      const secret = "bi_live_" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 12);
      this.patchSec19({
        newKey: { secret },
        keys: keys.concat([{ id: "k" + Date.now(), name: "New key", prefix: secret.slice(0, 12),
          scope: "Read only", created: "just now", used: "never" }]),
      });
    };
    v.akCopy19 = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v.akSecret19);
      this.toast("Key copied. It is not shown again.");
    };
    v.akDismiss19 = () => this.patchSec19({ newKey: null });
  }

  // ------------------------------------------------- the workflow step pane
  // Every option a step really has, grouped: who does it, what it is told,
  // what it may touch, and what happens when it does not finish.
  static SKILLS19 = ["Release checklist", "Repo conventions", "Design review", "Test writing", "Changelog"];
  gfSkillMenu19(id, event) {
    const node = this.graphNode14(id) || {};
    const on = Array.isArray(node.skills) ? node.skills : [];
    const anchor = (event && event.currentTarget) || this.menuTrigger14;
    const rows = Component.SKILLS19.map((name) => ({
      label: name, on: on.indexOf(name) >= 0,
      run: () => {
        const next = on.indexOf(name) >= 0 ? on.filter((x) => x !== name) : on.concat([name]);
        this.patchNode14(id, { skills: next });
        setTimeout(() => this.gfSkillMenu19(id, { currentTarget: anchor }), 0);
      },
    }));
    this.openMenu14(null, { currentTarget: anchor }, rows, "Skills this step may use", { cls: "menu-rich15" });
  }
  // ---------------------------------------------- round 19b review fixes
  // The mono block in dialogs read like a log file. The same lines render as
  // a properties list, so every dialog in the app speaks the same grammar.
  detailVals19b(v) {
    const text = String(v.genericText || "");
    v.genericLines19 = text.split("\n").filter((l) => l.trim()).map((l, i) => {
      const m = l.match(/^\s*([A-Za-z][^:]{0,40}):\s+(.+)$/);
      const two = l.match(/^\s*(\S.*?)\s{2,}(\S+)\s*$/);
      const hit = m || two;
      return hit
        ? { key: i, pair: true, plain: false, label: hit[1].trim(), value: hit[2].trim() }
        : { key: i, pair: false, plain: true, label: "", value: l.trim() };
    });
  }

  // A workflow is chosen by what it says it is for, so the title and the
  // "when to use it" note are the first thing the editor shows.
  static WF_WHEN19 = {
    "Code review": "A change to code that needs a second pair of eyes before it merges.",
    "Fix and review": "A bug report with a reproduction, in botinc/app. Not design work, not migrations.",
    "Design review": "A change that touches a screen, a component or a design token.",
    "Release notes": "A merged pull request that should be announced.",
    "Ship it": "Work that is approved and only needs merging and announcing.",
  };
  // The note is keyed by the workflow's id, not its title — renaming a
  // workflow must not orphan the one thing dispatch reads.
  wfId19(row) {
    const st = this.state;
    if (row) return row.id || row.name || "";
    return (st.graph14 && st.graph14.id) || st.graphId14 || "";
  }
  wfWhen19(row) {
    const st = this.state;
    const id = this.wfId19(row);
    const saved = (st.wfWhen19 || {})[id];
    if (saved != null) return saved;
    const name = row ? row.name : (st.graphName14 || (st.graph14 && st.graph14.name) || "");
    return Component.WF_WHEN19[name] || "";
  }
  workflowVals19b(v) {
    const st = this.state;
    const side = st.graphSide14 || "node";
    if (Array.isArray(v.graphSideTabs14)) {
      v.graphSideTabs14 = [{
        label: "Workflow", count: 0, hasCount: false, icon16: "i15.svg#git-branch",
        cls: side === "wf19" ? "active" : "",
        open: () => this.setState({ graphSide14: "wf19" }),
      }].concat(v.graphSideTabs14);
    }
    v.wfPane19 = side === "wf19";
    if (v.wfPane19) { v.graphNodePane14 = false; }
    const name = v.graphName14 || "";
    const id = this.wfId19();
    const when = this.wfWhen19();
    v.wfWhen19 = when;
    v.editWfWhen19 = (e) => this.setState((s) => ({
      wfWhen19: Object.assign({}, s.wfWhen19, { [id]: e.target.value }),
    }));
    v.wfDispatchNote19 = when
      ? "Operator reads this when an issue is dispatched and picks the workflow it fits. Nothing runs until a step says so."
      : "Without this note the workflow is never picked on its own \u2014 it can only be run by hand.";
    let peers = (st.workflows14 || []).map((w) => ({ id: w.id, name: w.name })).filter((w) => w.name);
    if (!peers.some((w) => w.id === id)) peers = [{ id, name }].concat(peers);
    v.wfPeers19 = peers.map((p, i) => ({
      key: p.id || p.name, n: i + 1,
      // The row being edited reads its name from the live editor, not the list.
      name: p.id === id ? (name || p.name) : p.name,
      when: this.wfWhen19(p) || "No note yet \u00b7 run by hand only",
      isThis: p.id === id, cls: p.id === id ? "on" : "",
    }));
    v.wfFallbackNote19 = "First fit wins. If no workflow fits, Operator asks you which to run.";
  }

  // The plan was one dense line. It is a card: the plan, the price, what it
  // buys, and when it renews.
  planVals19b(v) {
    const price = String(v.subscriptionPrice || "$0/month");
    const cut = price.indexOf("/");
    v.planAmount19 = cut > 0 ? price.slice(0, cut) : price;
    v.planCadence19 = cut > 0 ? "per " + price.slice(cut + 1) : "";
    v.planFeatures19 = String(v.planDescription || "").split("\u00b7")
      .map((t, i) => ({ key: i, text: t.trim() })).filter((f) => f.text);
  }

  // Auto top-up is a form with a stated outcome, not a printout.
  static TU19 = { amount: "$25", floor: "$5", cap: "$100", card: "Visa \u2022\u2022\u2022\u2022 4242" };
  tu19() { return Object.assign({}, Component.TU19, this.state.tu19 || {}); }
  patchTu19(p) { this.setState({ tu19: Object.assign({}, this.state.tu19 || {}, p) }); }
  openTopup19() {
    if (this.state.member !== "Alex") {
      this.generic("Billing is managed by Alex", "Ask the workspace owner to change automatic payments.");
      return;
    }
    this.setState({ dialog: "topup19", tuDraftOn19: !!this.state.recharge });
  }
  topupVals19b(v) {
    const st = this.state, t = this.tu19();
    v.rechargeSettings = () => this.openTopup19();
    // The summary row reads the saved settings back, not a fixed sentence.
    v.rechargeCopy = st.recharge
      ? "On \u00b7 Add " + t.amount + " below " + t.floor
        + (/no cap/i.test(t.cap) ? " \u00b7 no monthly cap" : " \u00b7 " + t.cap + " monthly cap")
      : "Off \u00b7 You decide when to add credit";
    const on = st.tuDraftOn19 != null ? !!st.tuDraftOn19 : !!st.recharge;
    v.topupDialog19 = st.dialog === "topup19";
    v.tuOn19 = on;
    v.tuOff19 = !on;
    v.tuCls19 = on ? "on" : "";
    v.tuRowsCls19 = on ? "" : "muted19";
    v.tuStateCopy19 = on ? "Credit is added without asking" : "You add credit yourself";
    v.tuToggle19 = () => this.setState({ tuDraftOn19: !on });
    v.tuAmount19 = t.amount; v.tuFloor19 = t.floor; v.tuCap19 = t.cap; v.tuCard19 = t.card;
    const pick = (title, key, options) => (e) => this.openMenu14(null, e,
      options.map((o) => ({ label: o, on: o === t[key], run: () => this.patchTu19({ [key]: o }) })),
      title, { cls: "menu-rich15" });
    v.tuAmountPick19 = pick("How much to add", "amount", ["$10", "$25", "$50", "$100"]);
    v.tuFloorPick19 = pick("When the balance drops below", "floor", ["$2", "$5", "$10", "$25"]);
    v.tuCapPick19 = pick("Never more than", "cap", ["$50", "$100", "$250", "No cap"]);
    v.tuChangeCard19 = () => this.toast("Card entry is out of scope in this preview.");
    const per = parseInt(String(t.amount).replace(/\D/g, ""), 10) || 25;
    const cap = /no cap/i.test(t.cap) ? 0 : (parseInt(String(t.cap).replace(/\D/g, ""), 10) || 0);
    v.tuOutcome19 = !on
      ? "While this is off, a run that needs credit stops and waits for you."
      : cap
        ? t.amount + " is charged each time the balance falls under " + t.floor
          + " \u00b7 at most " + Math.floor(cap / per) + " times a month (" + t.cap + ")."
        : t.amount + " is charged each time the balance falls under " + t.floor + " \u00b7 no monthly limit.";
    v.tuSaveLabel19 = on ? "Turn on auto top-up" : "Save";
    v.tuSave19 = () => {
      this.setState({ recharge: on, dialog: null, tuDraftOn19: null });
      this.toast(on
        ? "Auto top-up on \u00b7 " + t.amount + " below " + t.floor + ", " + t.cap + " a month."
        : "Auto top-up off. You add credit yourself.");
    };
  }

  // "View usage" used to print a text block. It opens the tab that owns it.
  usageDetails19b() {
    this.setState({ billingTab14: "usage" });
    this.setting("billing");
  }
  usageVals19b(v) {
    const st = this.state;
    const tab = st.billingTab14 || "plan";
    if (Array.isArray(v.billingTabs14)) {
      const extra = {
        label: "Usage", count: 0, hasCount: false, icon: this.icon14("chart-no-axes-combined"),
        cls: tab === "usage" ? "active" : "",
        open: () => this.setState({ billingTab14: "usage" }),
      };
      v.billingTabs14 = [v.billingTabs14[0], extra].concat(v.billingTabs14.slice(1));
    }
    v.usageTab19 = tab === "usage";
    v.planTab14 = tab === "plan";
    v.usageDetails = () => this.usageDetails19b();
    if (!v.usageTab19) return;
    const slices = [
      { name: "Models", amount: 9.4, cls: "s1" },
      { name: "Cloud compute", amount: 2.1, cls: "s2" },
      { name: "Calls", amount: 1.1, cls: "s3" },
    ];
    const total = slices.reduce((a, s) => a + s.amount, 0);
    v.usageMonthNote19 = "September 2026 \u00b7 sample data, charged to the workspace balance.";
    v.ugTotal19 = this.cash(total);
    v.ugOfNote19 = "of " + this.cash(75) + " monthly credit";
    v.ugSlices19 = slices.map((s) => ({
      key: s.name, name: s.name, cls: s.cls,
      amount: this.cash(s.amount),
      share: Math.round((s.amount / total) * 100) + "%",
      style: "flex:" + s.amount,
      title: s.name + " \u00b7 " + this.cash(s.amount),
    }));
    v.ugPeople19 = [
      { key: "alex", initial: "A", name: "Alex", meta: "14 issues \u00b7 3 calls", amount: this.cash(9.1) },
      { key: "emre", initial: "E", name: "Emre", meta: "6 issues \u00b7 1 call", amount: this.cash(3.5) },
    ];
    const issues = (st.issues || []).slice(0, 3);
    v.ugTasks19 = issues.map((i) => ({
      key: i.id, id: i.id, title: i.title,
      meta: (i.owner || "Alex") + " \u00b7 " + (i.status || "Todo"),
      amount: this.cash(i.cost || 0.42),
      open: () => this.openIssue(i.id),
    }));
    v.ugFootNote19 = "Every figure leads back to a task receipt. BotInc never resells inference.";
    v.ugInvoices19 = () => this.setState({ billingTab14: "invoices" });
  }

  // ---------------------------------------------- round 19c review fixes
  // The floating conversation is the same conversation. Its rows take the
  // shape the main chat's message component reads, and its composer is the
  // main composer with the dock's own send, draft and stop wired in.
  dockVals19c(v) {
    const st = this.state;
    const me = v.memberName || st.member || "You";
    v.dockRows15 = (v.dockRows15 || []).map((m, i) => {
      const mine = /mine/.test(m.cls || "");
      return Object.assign({}, m, {
        key: m.key || i,
        cls: mine ? "mine" : "operator",
        hasAvatar: !mine,
        avatar: "assets/logo/botinc-mark.svg",
        author: mine ? me : (m.who || "Operator"),
        model: mine ? (m.chip || "") : (m.chip || v.modelLabel11 || ""),
        hasAttachments11: !!m.hasItems,
        attachments11: (m.items || []).map((f, j) => ({ key: j, name: f.name, image: false, url: "" })),
        isOperator11: !mine && !!m.text && !m.hasOptions && !m.hasAction,
        copy11: () => { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m.text || ""); this.toast("Message copied."); },
        quote11: () => this.patchDock15({ draft: m.text || "" }),
      });
    });
    v.dockAttachRows19 = (v.dockAttach15 || []).map((f, i) => Object.assign({}, f, {
      key: f.id || i, image: !!f.image, url: f.url || "", meta: f.meta || "",
      removeLabel: f.removeLabel || "Remove " + f.name, open: () => {},
    }));
    v.dockHasCost19 = false;
    v.dockSendCls19 = v.dockRunning15 ? "queue18" : "";
    // The dock floats now, so it no longer takes the side pane's place: the
    // inspector and the context summary stay available while it is open.
    if (v.dockOpen15) {
      const HIDE = ["landing", "pricing", "plugins10", "profile10", "skills10", "settings"];
      v.inspectorOpen10 = !!st.inspector10 && HIDE.indexOf(st.view) < 0;
      v.inspectorShown16 = !!v.inspectorOpen10 && !(st.cbOn16 || st.voice10);
      v.rootClass = String(v.rootClass || "").replace(/\s*\bdock-open15\b/, "") + " dock-float19";
    }
    // Double-click on the grip flips between the compact size and a large one.
    v.dockToggleSize19 = () => {
      const big = (st.dockW16 || 392) > 480;
      this.setState(big
        ? { dockW16: 392, dockH16: 520 }
        : { dockW16: Math.min(720, Math.max(560, Math.round(window.innerWidth * 0.46))),
            dockH16: Math.min(Math.round(window.innerHeight - 80), 720) });
    };
    v.dockSteer19 = () => { if (typeof this.dockSend15 === "function") this.dockSend15(); else if (v.dockSend15) v.dockSend15({ preventDefault: () => {} }); };
  }

  // Every inspector tab carries its glyph, so a row of seven reads at a glance.
  static TAB_ICONS19 = {
    Issue: "circle-dot", Workflow: "git-branch", "Pull requests": "git-pull-request", Runs: "play",
    Files: "paperclip", Attachments: "paperclip", Preview: "monitor", Usage: "chart-no-axes-combined",
    Details: "info", Live: "activity", Result: "circle-check", Call: "phone", Activity: "activity",
    Output: "terminal", Overview: "layout-dashboard", Run: "play", Conversation: "message-square",
  };
  tabVals19c(v) {
    if (!Array.isArray(v.inspectorTabs12)) return;
    v.inspectorTabs12 = v.inspectorTabs12.map((t) => Object.assign({}, t, {
      icon19: "i15.svg#" + (Component.TAB_ICONS19[t.label] || "circle"),
    }));
  }

  stepVals19(v) {
    const st = this.state;
    const node = st.graph14 && typeof this.graphNode14 === "function" ? this.graphNode14(st.graphSel14) : null;
    v.gfLimits19 = false; v.gfApproval19 = false; v.gfQuestion19 = false;
    v.gfFinish19 = false; v.gfStart19 = false; v.gfHasContext19 = false;
    v.gfPromptTitle19 = "Instruction";
    if (!node) return;
    const id = node.id, type = node.type;
    const patch = (p) => this.patchNode14(id, p);
    // These options are whole sentences; the menu takes its width from them
    // rather than from the little control that opened it.
    const pick = (title, value, options, key) => ({
      label: value,
      pick: (e) => this.openMenu14(null, e, options.map((o) => ({
        label: o, on: o === value, run: () => patch({ [key]: o }),
      })), title, { cls: "menu-rich15 menu-wide19" }),
    });
    v.gfLimits19 = type === "task" || type === "repeat";
    v.gfApproval19 = type === "approval";
    v.gfQuestion19 = type === "question";
    v.gfFinish19 = type === "finish";
    v.gfStart19 = type === "start";
    v.gfHasContext19 = v.gfLimits19;
    v.gfPromptTitle19 = type === "question" ? "What it asks you" : "Instruction";
    v.gfComputer19 = pick("Where it runs", node.computer || "BotInc Cloud",
      ["BotInc Cloud", "This Mac \u00b7 daemon", "Wherever the issue runs"], "computer");
    v.gfContext19 = pick("What it reads", node.context || "The issue and its thread",
      ["The issue and its thread", "The issue, the thread and the repository", "Everything, plus linked designs"], "context");
    v.gfTouch19 = pick("What it may change", node.touch || "Read only",
      ["Read only", "Edit files", "Edit files and run commands"], "touch");
    v.gfCap19 = pick("Spend cap", node.cap || "$1.00",
      ["$0.50", "$1.00", "$2.00", "No cap \u00b7 the task limit applies"], "cap");
    v.gfTimeout19 = pick("Give up after", node.timeout || "15 minutes",
      ["5 minutes", "15 minutes", "30 minutes", "1 hour"], "timeout");
    v.gfRetries19 = pick("Retries", node.retries || "Once", ["None", "Once", "Twice"], "retries");
    v.gfFail19 = pick("If it fails", node.onFail || "Stop the run and tell me",
      ["Stop the run and tell me", "Ask me what to do", "Skip to the next step"], "onFail");
    v.gfProduces19 = pick("What it produces", node.produces || (type === "repeat" ? "A revision of the change" : "A plan in the thread"),
      ["A plan in the thread", "File changes", "A comment on the issue", "A pull request", "A revision of the change"], "produces");
    v.gfElse19 = pick("Otherwise", node.otherwise || "Take the No branch",
      ["Take the No branch", "Stop the run", "Ask me what to do"], "otherwise");
    v.gfApprover19 = pick("Who approves", node.approver || "You",
      ["You", "The issue owner", "Anyone with merge rights"], "approver");
    v.gfRemind19 = pick("Remind after", node.remind || "4 hours",
      ["1 hour", "4 hours", "1 day", "Never"], "remind");
    v.gfWait19 = pick("Wait up to", node.wait || "1 day",
      ["1 hour", "4 hours", "1 day", "As long as it takes"], "wait");
    v.gfThen19 = pick("Then", node.then || "Pause the run",
      ["Pause the run", "Take the safest answer", "Cancel the issue"], "then");
    v.gfReport19 = pick("Reports", node.report || "A comment in the conversation",
      ["A comment in the conversation", "A comment and an email", "Nothing \u00b7 only the record"], "report");
    v.gfAfter19 = pick("Then", node.after || "Leave the issue open",
      ["Leave the issue open", "Move it to review", "Close it"], "after");
    v.gfTrigger19 = pick("Starts when", node.trigger || "A message asks for a change",
      ["A message asks for a change", "An issue is dispatched to this workflow", "A routine fires on a schedule"], "trigger");
    v.gfAsk19 = { on: !!node.askFirst, cls: node.askFirst ? "on" : "", toggle: () => patch({ askFirst: !node.askFirst }) };
    const skills = Array.isArray(node.skills) ? node.skills : [];
    v.gfSkills19 = {
      label: skills.length ? (skills.length === 1 ? skills[0] : skills.length + " skills") : "None",
      pick: (e) => this.gfSkillMenu19(id, e),
    };
  }

  plusMenu15(event, where) {
    const key = this.composerKey15(where);
    const picked = this.tools15(key);
    const connected = this.connectedConnectors15();
    const rows = [
      { label: "Files and folders", icon: this.icon14("paperclip"), run: () => this.filesMenu15(where) },
      { label: "Project", icon: this.icon14("folder"), hint: this.state.project10 || "Product",
        run: () => this.projectPicker11(this.menuTrigger14) },
      { label: "Goal", icon: this.icon14("flag"),
        hint: (() => {
          const g = this.goalText15(where);
          return (!g || g === "Set a goal") ? "Set a goal to keep pursuing" : g;
        })(),
        run: () => { this.closeMenu14(); this.startGoal16(where); } },
      { label: "Plan mode", icon: this.icon14("lightbulb"), on: this.planOn15(key),
        hint: this.planOn15(key) ? "On \u00b7 turn it off" : "Turn plan mode on",
        run: () => this.togglePlan15(where) },
      { label: "Plugins", icon: this.icon14("plug"),
        hint: picked.length ? picked.length + " on" : connected.length + " connected",
        run: () => this.connectorMenu15(this.menuTrigger14, where) },
    ];
    this.setState({ plusWhere15: where || "main" });
    this._plusTrigger16 = event && (event.currentTarget || event.target);
    this.openMenu14(null, event, rows, "Add", { kind: "plus", cls: "menu-rich15" });
  }

  connectorMenu15(trigger, where) {
    const key = this.composerKey15(where);
    const picked = this.tools15(key);
    const connected = this.connectedConnectors15();
    this._pluginTrigger16 = trigger || this._pluginTrigger16 || this._plusTrigger16;
    const reopen = () => this.connectorMenu15(this._pluginTrigger16, where);
    let rows = [].concat(connected.map((c) => ({
      label: c.name, logo: c.logo, logoClass: c.logoClass,
      on: picked.indexOf(c.name) >= 0,
      // Ticking one leaves the menu open, so several can be chosen in a row.
      run: () => { this.toggleTool15(c.name, where); reopen(); },
    })));
    if (!connected.length) rows = rows.concat([{ label: "No connected tools yet", disabled: true }]);
    this.setState({ plusWhere15: where || this.state.plusWhere15 || "main" });
    this.openMenu14(null, { currentTarget: this._pluginTrigger16 }, rows, "Plugins", {
      kind: "connectors", cls: "menu-rich15 menu-plugins16",
      back16: () => this.plusMenu15({ currentTarget: this._plusTrigger16 || this._pluginTrigger16 }, where),
      search: connected.length > 6 ? "Search connected tools" : "",
      cta: { label: "Add more plugins", icon: this.icon14("plus"),
        run: () => { this.closeMenu14(); this.openPlugins10("all"); } },
    });
  }

  // Dictation records in place. Pressing the mic starts it, pressing again stops
  // and drops what was heard into the draft — a modal has no part in it.
  toggleDictation16() {
    if (this.state.rec16) {
      clearInterval(this._rec16);
      const heard = "Let\u2019s unblock the work that needs me.";
      const draft = this.state.view === "thread9" ? this.state.threadDraft9 : this.state.draft;
      this.setDraft12(((draft || "").trim() + " " + heard).trim());
      this.setState({ rec16: false, recSecs16: 0 });
      return;
    }
    this.setState({ rec16: true, recSecs16: 0 });
    clearInterval(this._rec16);
    this._rec16 = setInterval(() => this.setState((s) => ({ recSecs16: (s.recSecs16 || 0) + 1 })), 1000);
  }

  // A picker stays open when a menu is opened from inside it — the base method
  // clears popover10, which dismissed the funding picker on every choice.
  openMenu14(...args) {
    const keep = this.state.popover10;
    super.openMenu14(...args);
    if (keep) this.setState({ popover10: keep });
  }

  // Conversations carry no timestamp of their own, so the card reads it from
  // the issue the conversation is about.
  rowWhen16(row) {
    if (row.when || row.updated) return row.when || row.updated;
    const hit = (this.state.issues || []).find((x) => x.id === row.issueId);
    if (!hit) return "";
    const ago = hit.updatedAgo;
    if (ago == null) return "";
    return this.agoText ? this.agoText(ago) : ago + "m";
  }

  static WORKSPACES16 = [
    { name: "BotInc", slug: "BOTINC", plan: "Team \u00b7 subscription" },
    { name: "Didit Labs", slug: "DIDIT-LABS", plan: "Pro \u00b7 subscription" },
    { name: "Personal", slug: "PERSONAL", plan: "Free \u00b7 credits" },
  ];

  workspaceMenu16(event) {
    const current = this.state.workspace16 || "BotInc";
    const rows = [{ head: "Switch workspace" }].concat(
      Component.WORKSPACES16.map((w) => ({
        label: w.name,
        hint: w.plan,
        on: w.name === current,
        icon: this.icon14("layout-dashboard"),
        run: () => { this.setState({ workspace16: w.name }); this.toast("Switched to " + w.name + "."); },
      })),
      [{ head: "This workspace" },
       { label: "Workspace settings", hint: "Members, limits, data",
         icon: this.icon14("key-round"), run: () => this.setting("team") },
       { head: "Start another" },
       { label: "New workspace", hint: "Its own roster and billing",
         icon: this.icon14("plus"), run: () => { this.closeMenu14(); this.newWorkspace16(); } }]
    );
    this.openMenu14(null, event, rows, "", { kind: "workspace", cls: "menu-rich15 menu-ws16" });
    this.setState({ menuLabel14: "" });
  }

  newWorkspace16() {
    this.setState({
      dialog: "newWorkspace16",
      nwName16: "", nwGlyph16: "N", nwTone16: "blue16", nwKind16: "A new product",
    });
  }

  // General in settings is the same screen as the profile in the corner.
  setting(section) {
    // General and "Your settings" are one page: the profile.
    if (section === "general") { this.openProfile16(); return; }
    if (section === "workflows") {
      this.go("settings", { section: "workflows", settingsHome: false, panel: null, overlay14: null,
        inspector10: false, mobileInspector10: false, popover10: null, menu14: null });
      return;
    }
    if (section === "repos") this.setState({ repoDetail16: false });
    return super.setting(section);
  }

  // Skills at scale: one fixture per connected plugin, so the page is judged
  // against the 500+ it will actually hold.
  static SKILL_PLUGINS16 = [
    ["GitHub", "github", ["pull requests", "issues", "releases", "review comments", "CI failures", "branches"]],
    ["Linear", "linear", ["issues", "cycles", "projects", "triage queue", "roadmap items", "comments"]],
    ["Figma", "figma", ["frames", "components", "variables", "comments", "prototypes", "exports"]],
    ["Slack", "slack", ["threads", "channels", "mentions", "standups", "incident rooms", "reactions"]],
    ["Notion", "notion", ["pages", "databases", "meeting notes", "specs", "decision logs", "wikis"]],
    ["Sentry", "sentry", ["errors", "alerts", "releases", "performance traces", "regressions", "issues"]],
    ["Jira", "jira", ["tickets", "sprints", "epics", "boards", "comments", "workflows"]],
    ["PostHog", "posthog", ["events", "funnels", "feature flags", "session replays", "dashboards", "cohorts"]],
    ["Google Drive", "googledrive", ["documents", "folders", "spreadsheets", "shared drives", "comments", "versions"]],
    ["Gmail", "gmail", ["threads", "drafts", "labels", "attachments", "follow-ups", "newsletters"]],
  ];
  static SKILL_VERBS16 = ["Triage", "Summarize", "Draft replies to", "Review", "Label", "Search", "Compare", "Archive stale"];
  skillFixture16() {
    if (this._skillFix16) return this._skillFix16;
    const out = [];
    let seed = 7;
    const rnd = (n) => { seed = (seed * 9301 + 49297) % 233280; return Math.floor((seed / 233280) * n); };
    for (const [name, logo, objs] of Component.SKILL_PLUGINS16) {
      for (const verb of Component.SKILL_VERBS16) for (const obj of objs) {
        const used = rnd(60);
        out.push({
          key: (name + "-" + verb + "-" + obj).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: verb + " " + obj, source: name, kind: "plugin",
          logo: "assets/brands-v12/" + logo + ".svg",
          copy: verb.replace(/ to$/, "") + " " + name + " " + obj + " when a conversation touches them.",
          used, on: used > 4,
        });
      }
    }
    const ws = ["Release notes in BotInc voice", "Incident write-up", "Design review checklist", "PR description", "Weekly brief", "Customer reply tone",
      "Postmortem template", "Sandbox setup", "Voice call debugging", "Receipt pipeline", "Migration plan", "Accessibility pass",
      "Changelog entry", "Onboarding email", "Pricing page copy", "Data export", "Test plan", "Rollback runbook", "Security review", "Roadmap update",
      "Meeting summary", "Bug repro steps", "Feature flag rollout", "Dependency upgrade", "Localization pass", "Analytics event naming",
      "API error copy", "Support macro", "Retro notes", "Hiring brief", "Design token audit", "Icon request", "Performance budget",
      "Schema change", "Queue backlog", "Cost report", "Model routing note", "Provider outage note", "Trial email", "Refund reply"];
    ws.forEach((n, i) => out.push({ key: "ws-" + i, name: n, source: "Workspace", kind: "workspace", logo: "",
      copy: "Shared by the BotInc workspace \u00b7 " + (i % 3 === 0 ? "Sam" : i % 3 === 1 ? "Alex" : "Emre") + " maintains it.",
      used: (i * 7) % 40 + 1, on: true }));
    this._skillFix16 = out;
    return out;
  }
  // Every routine opens on its overview, with no run record carried over.
  openAuto9(id) {
    const out = super.openAuto9(id);
    this.setState({ rtTab16: "overview", viewedRun10: null });
    return out;
  }

  // A small Markdown reader: headings, lists, code fences, rules, paragraphs.
  md16(text) {
    const out = []; const lines = String(text || "").split("\n"); let code = null; let para = [];
    const flush = () => { if (para.length) { out.push({ p: true, text: para.join(" ") }); para = []; } };
    const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1");
    lines.forEach((raw) => {
      const l = raw.replace(/\s+$/, "");
      if (/^```/.test(l)) { flush(); if (code === null) code = []; else { out.push({ code: true, text: code.join("\n") }); code = null; } return; }
      if (code !== null) { code.push(raw); return; }
      if (!l.trim()) { flush(); return; }
      let m;
      if ((m = l.match(/^#\s+(.*)/))) { flush(); out.push({ h1: true, text: inline(m[1]) }); return; }
      if ((m = l.match(/^#{2,6}\s+(.*)/))) { flush(); out.push({ h2: true, text: inline(m[1]) }); return; }
      if (/^(-{3,}|\*{3,})$/.test(l)) { flush(); out.push({ hr: true }); return; }
      if ((m = l.match(/^\s*[-*]\s+(.*)/))) { flush(); out.push({ li: true, text: inline(m[1]) }); return; }
      if ((m = l.match(/^\s*(\d+)[.)]\s+(.*)/))) { flush(); out.push({ num: true, n: m[1] + ".", text: inline(m[2]) }); return; }
      para.push(inline(l.trim()));
    });
    flush(); if (code !== null) out.push({ code: true, text: code.join("\n") });
    return out.map((b, i) => ({ key: i, ...b }));
  }

  // Routine instructions are documents. The short prompt is the first line of one.
  static INSTR16 = {
    webhook: (p, scope) => "# Fix issues labeled botinc\n\n" + p + "\n\n## When an event arrives\n\n1. Read the issue, its comments and any linked pull request.\n2. Reproduce it in a fresh sandbox on `main`" + (scope ? " of " + scope : "") + ". If it cannot be reproduced, say so and stop.\n3. Write a short plan: what changes, what does not, and the risk.\n\n## While fixing\n\n- Keep the change to the smallest set of files that fixes the report.\n- Add or update a regression test. A fix without a test is not finished.\n- Run the existing test suite before opening anything.\n- Never touch billing, auth or migrations without asking first.\n\n## What to hand back\n\n- Open one work item per issue. Attach the plan, the diff and the test output.\n- Title the work item after the issue, not after the fix.\n- Ask for approval. **Nothing merges itself.**\n\n## Stop when\n\n- The fix needs a schema change or a new dependency.\n- Two review rounds asked for changes.\n- The per-run budget is reached.\n\n```\nlabels: botinc\nrepo: " + (scope || "botinc/app") + "\nreviewer: athena\n```",
    schedule: (p, scope) => "# Morning brief\n\n" + p + "\n\n## Read\n\n- Every open issue in " + (scope || "my work") + ", newest first.\n- Comments and review requests since the last brief.\n- Routines that skipped or failed overnight.\n\n## Write\n\n1. **Needs you** — decisions waiting on me, one line each, with the link.\n2. **Moving** — what progressed, in one sentence.\n3. **Watch** — anything blocked or over budget.\n\nKeep it under 200 words. No greetings, no summary of the summary.\n\n## Do not\n\n- Do not start work, comment or change any status.\n- Do not include issues I closed myself.",
    generic: (p, scope) => "# Routine\n\n" + p + "\n\n## Scope\n\n- " + (scope || "The allowed scope only") + ".\n- Ask before anything that leaves this scope.\n\n## Hand back\n\n- Post the result in this conversation.\n- Open work only when a change is needed.",
  };
  instr16(v) {
    const id = this.state.activeAuto9 || "routine";
    const saved = (this.state.rtInstrBy16 || {})[id];
    if (saved) return saved;
    const kind = /\bat\s+\d{1,2}:\d{2}\b|weekday|daily|weekly|every/i.test(v.autoTrigger9 || "") ? "schedule"
      : /^[\w.-]+\/[\w.-]+$/.test(v.autoScope9 || "") ? "webhook" : "generic";
    return Component.INSTR16[kind](v.autoPrompt9 || "", v.autoScope9 || "");
  }

  openProfile16(tab) {
    const t = this.state;
    const saved = (t.profileSaved10 || {})[t.member] || {};
    this.go("profile10", { profileName10: saved.name || t.member, profileZone10: saved.zone || "Europe/Madrid",
      panel: null, inspector10: false, mobileInspector10: false, menu14: null, pfTab16: tab || t.pfTab16 || "profile" });
  }

  // The name in the corner opens a menu, the way the workspace name does.
  profileMenu16(event) {
    const on = (label, hint, icon, run) => ({ label, hint, icon: this.icon14(icon), run });
    const rows = [
      { head: "Settings" },
      on("Your settings", "Profile, theme, notifications", "user", () => this.openProfile16("profile")),
      on("Workspace settings", "Members, limits, data", "key-round", () => this.setting("team")),
      { head: "Learn" },
      on("Docs", "docs.botinc.ai", "book-open", () => this.toast("Opening docs.botinc.ai")),
      on("Changelog", "What shipped", "history", () => this.toast("Opening the changelog")),
      on("Give feedback", "Straight to the team", "message-circle", () => this.askOperator16("I have feedback about BotInc: ", ["Something is confusing", "Something is broken", "I wish it could\u2026"])),
      { head: "Session" },
      { label: "Sign out", hint: "Dispatched runs carry on", icon: this.icon14("corner-up-left"), cls: "danger16",
        run: () => this.toast("Signed out of this preview.") },
    ];
    this.openMenu14(null, event, rows, "", { kind: "profile", cls: "menu-rich15 menu-me16", tall: true });
    this.setState({ menuLabel14: "" });
  }

  // The routine form always opens on its first page, with a fresh document.
  openAutoForm9(...args) {
    this.setState({ afPage16: "what", afInstr16: null, afMode16: "write" });
    return super.openAutoForm9 ? super.openAutoForm9(...args) : undefined;
  }

  fvGo16(dir) {
    this.setState((s) => {
      const n = (s.fvFiles16 || []).length; if (!n) return {};
      return { fvIndex16: Math.max(0, Math.min(n - 1, (s.fvIndex16 || 0) + dir)) };
    });
  }

  skillMenu16(event, rows, label) {
    this.openMenu14(null, event, rows, label, { kind: "skills", cls: "menu-rich15", tall: rows.length > 8 });
  }

  createWorkspace16() {
    const name = String(this.state.nwName16 || "").trim();
    if (!name) return;
    this.setState({ dialog: null, workspace16: name });
    this.toast("Workspace \u201c" + name + "\u201d created.");
  }

  rowMenu16(row, event) {
    if (event && event.preventDefault) event.preventDefault();
    const id = row.id || row.key || row.title;
    const unread = (this.state.unread16 || {})[id];
    const on = (label, icon, run) => ({ label, icon: this.icon14(icon), run });
    this.openMenu14(null, event, [
      on("Rename", "square-pen", () => this.startRename16(id, row.title)),
      on(row.pinned16 ? "Unpin" : "Pin", "pin", () => row.pin && row.pin()),
      on(unread ? "Mark as read" : "Mark as unread", "mail", () => this.setUnread16(id, !unread)),
      on("Share", "share-2", () => this.shareRow16(row)),
      on("Archive", "archive", () => this.archiveRow16(id, row.title)),
    ], "", { kind: "row", cls: "menu-rich15" });
    // The title is already on the row that was right-clicked; repeating it in
    // caps above the menu just shouted it back.
    this.setState({ menuLabel14: "" });
  }

  startRename16(id, title) {
    this.setState({ renameId16: id, renameDraft16: title || "" });
    setTimeout(() => {
      const el = document.querySelector(".c9-rename16 input");
      if (el && el.select) { el.focus(); el.select(); }
    }, 40);
  }

  commitRename16() {
    const id = this.state.renameId16;
    const name = String(this.state.renameDraft16 || "").trim();
    if (!id) return;
    this.setState((s) => ({
      renameId16: null,
      renamed16: name ? Object.assign({}, s.renamed16, { [id]: name }) : s.renamed16,
    }));
    if (name) this.toast("Renamed to \u201c" + name + "\u201d.");
  }

  setUnread16(id, on) {
    this.setState((s) => ({ unread16: Object.assign({}, s.unread16, { [id]: !!on }) }));
    this.toast(on ? "Marked as unread." : "Marked as read.");
  }

  shareRow16(row) {
    const link = "https://botinc.ai/c/" + String(row.issueId || row.id || "conversation").toLowerCase();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link);
    this.toast("Link copied \u00b7 " + link);
  }

  archiveRow16(id, title) {
    this.setState((s) => ({ archived16: Object.assign({}, s.archived16, { [id]: true }) }));
    this.toast("Archived \u201c" + String(title || "conversation").slice(0, 34) + "\u201d.");
  }

  restoreRow16(id) {
    this.setState((s) => {
      const next = Object.assign({}, s.archived16);
      delete next[id];
      return { archived16: next };
    });
    this.toast("Restored.");
  }

  // One colour per lifecycle stage, used on every surface that shows a status.
  static STATUS_TONE16 = {
    "needs you": "st-needs16", "todo": "st-todo16", "in progress": "st-progress16", "running": "st-progress16",
    "paused": "st-paused16", "in review": "st-review16", "ready for review": "st-review16",
    "blocked": "st-blocked16", "merged": "st-merged16", "merged dev": "st-merged16",
    "done": "st-done16", "canceled": "st-canceled16",
  };
  static STATUS_ICON16 = {
    "needs you": "circle-alert", "todo": "circle-dashed",
    "in progress": "circle-dot", "running": "circle-dot", "paused": "circle-pause",
    "in review": "git-pull-request", "ready for review": "git-pull-request",
    "blocked": "circle-alert", "merged": "git-merge", "merged dev": "git-merge",
    "done": "circle-check", "canceled": "archive",
  };
  statusIcon16(label) {
    const id = Component.STATUS_ICON16[String(label || "").trim().toLowerCase()];
    return id ? "i15.svg#" + id : "";
  }

  statusTone16(label) {
    return Component.STATUS_TONE16[String(label || "").trim().toLowerCase()] || "";
  }

  // The floating conversation is resized from its top-left corner, growing up
  // and to the left from its anchored bottom-right position.
  dockCornerDrag16(event) {
    const box = event.currentTarget.closest("aside");
    if (!box) return;
    const start = box.getBoundingClientRect();
    const x0 = event.clientX, y0 = event.clientY;
    const move = (e) => {
      this.setState({
        dockW16: Math.max(320, Math.min(720, Math.round(start.width + (x0 - e.clientX)))),
        dockH16: Math.max(320, Math.min(Math.round(window.innerHeight - 80), Math.round(start.height + (y0 - e.clientY)))),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    if (event.preventDefault) event.preventDefault();
  }

  dockCornerKey16(event) {
    const step = event.shiftKey ? 48 : 16;
    const w = this.state.dockW16 || 392;
    const h = this.state.dockH16 || 520;
    const map = {
      ArrowLeft: { dockW16: Math.min(720, w + step) },
      ArrowRight: { dockW16: Math.max(320, w - step) },
      ArrowUp: { dockH16: Math.min(window.innerHeight - 80, h + step) },
      ArrowDown: { dockH16: Math.max(320, h - step) },
    };
    if (map[event.key]) { event.preventDefault(); this.setState(map[event.key]); }
  }

  // A call is a bar: who is listening, the microphone, the way out. The device
  // list is where a person expects it — behind the microphone, like Slack.
  static MICS16 = [
    { id: "default", name: "MacBook Pro Microphone", meta: "Built-in" },
    { id: "airpods", name: "AirPods Pro", meta: "Bluetooth \u00b7 82%" },
    { id: "display", name: "Studio Display Microphone", meta: "Thunderbolt" },
  ];
  static OUTS16 = [
    { id: "speakers", name: "MacBook Pro Speakers", meta: "Built-in" },
    { id: "airpods", name: "AirPods Pro", meta: "Bluetooth" },
    { id: "display", name: "Studio Display", meta: "Six-driver" },
  ];

  cbDeviceMenu16(event) {
    const mic = this.state.cbMic16 || "default";
    const out = this.state.cbOut16 || "speakers";
    const rows = [{ head: "Microphone" }]
      .concat(Component.MICS16.map((d) => ({
        label: d.name, hint: d.meta, on: d.id === mic,
        icon: this.icon14("mic"),
        run: () => this.setState({ cbMic16: d.id }),
      })))
      .concat([{ head: "Speaker" }])
      .concat(Component.OUTS16.map((d) => ({
        label: d.name, hint: d.meta, on: d.id === out,
        icon: this.icon14("audio-lines"),
        run: () => this.setState({ cbOut16: d.id }),
      })));
    this.openMenu14(null, event, rows, "Audio", { kind: "audio", cls: "menu-rich15", tall: true });
  }

  // One action for work that needs a person, and a choice of how to take it on.
  fixMenu16(event) {
    this.openMenu14(null, event, [
      { label: "Talk it through", icon: this.icon14("phone"),
        run: () => { this.setState({ cbOn16: true, cbMuted16: false }); } },
      { label: "Message the Operator", icon: this.icon14("message-square"),
        run: () => this.dockOpen15 ? this.dockOpen15() : this.setState({ dock15: "open" }) },
      { label: "Open the first one", icon: this.icon14("arrow-right"),
        run: () => this.unblockNext16() },
    ], "Fix what needs you", { kind: "fix", cls: "menu-rich15" });
  }

  unblockNext16() {
    const v = this.vals14 || {};
    if (typeof v.unblockNext9 === "function") v.unblockNext9();
    else this.setState({ work8View: "needs10", work8Page: 1 });
  }

  cbDrag16(event) {
    const bar = event.currentTarget.closest(".callbar16");
    if (!bar) return;
    const box = bar.getBoundingClientRect();
    const dx = event.clientX - box.left;
    const dy = event.clientY - box.top;
    const move = (e) => this.setState({
      cbX16: Math.max(8, Math.min(window.innerWidth - box.width - 8, e.clientX - dx)),
      cbY16: Math.max(8, Math.min(window.innerHeight - box.height - 8, e.clientY - dy)),
    });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    if (event.preventDefault) event.preventDefault();
  }

  // One way in for every "let the Operator do it" affordance: open the floating
  // conversation with the request already written, so the first thing a person
  // sees is a question about their work rather than an empty form.
  askOperator16(draft, chips) {
    // The draft belongs to the dock's own slot, so it is written through
    // patchDock15 — assigning dockDraft15 is overwritten on the next render.
    this.setState({ dock15: "open", dialog: null, dockChips16: chips || null });
    this.patchDock15({ draft });
    setTimeout(() => {
      const el = document.querySelector(".dock15 textarea");
      if (el && el.focus) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }, 60);
  }

  // Sending hands the page over: the new conversation rises into place rather
   // than replacing the composer in one frame.
  sendComposer10(event) {
    const had = String((this.state.view === "thread9" ? this.state.threadDraft9 : this.state.draft) || "").trim();
    const out = super.sendComposer10(event);
    if (had) {
      this.setState({ handoff16: true });
      clearTimeout(this._handoff16);
      this._handoff16 = setTimeout(() => this.setState({ handoff16: false }), 560);
    }
    return out;
  }

  // The call is the one bar now, and the primer appears only the first time.
  openVoice10() {
    if (this.state.voiceSeen16) { this.connectVoice10(); return; }
    return super.openVoice10();
  }

  connectVoice10() {
    this.setState({ voiceSeen16: true });
    return super.connectVoice10();
  }

  componentDidMount() {
    if (super.componentDidMount) super.componentDidMount();
    const SEL16 = ".c9-scroll16,.inspector-content10,.t9-scroll,.dock-log15," +
      ".model-list11,.menu-rows14,.search-results14,.w8-rows,.pf-rows16," +
      ".ds-rows15,.auto-chat-scroll10,.rt-list16,.prl16,.accounts14,.hover-accounts13,.fv-body16,.sk-list16," +
      ".rp-list17";
    const shade = (el) => {
      if (!el || !el.classList) return;
      const over = el.scrollHeight - el.clientHeight;
      if (over < 8) { el.classList.remove("shade16"); return; }
      el.classList.add("shade16");
      el.style.setProperty("--shade-top16", Math.min(18, el.scrollTop) + "px");
      el.style.setProperty("--shade-bot16", Math.min(20, over - el.scrollTop) + "px");
    };
    // Sideways lists fade at the edge they can still travel toward, the same way.
    const HSEL19 = ".itabs19";
    const hshade = (el) => {
      if (!el || !el.classList) return;
      const over = el.scrollWidth - el.clientWidth;
      if (over < 8) { el.classList.remove("hshade19"); return; }
      el.classList.add("hshade19");
      el.style.setProperty("--shade-l19", Math.min(22, el.scrollLeft) + "px");
      el.style.setProperty("--shade-r19", Math.min(26, over - el.scrollLeft) + "px");
    };
    this._shade16 = (e) => {
      const t = e.target;
      if (!t || !t.matches) return;
      if (t.matches(SEL16)) shade(t);
      if (t.matches(HSEL19)) hshade(t);
    };
    document.addEventListener("scroll", this._shade16, true);
    this._shadeAll16 = () => {
      document.querySelectorAll(SEL16).forEach(shade);
      document.querySelectorAll(HSEL19).forEach(hshade);
    };
    this._shadeTick16 = setInterval(this._shadeAll16, 700);
    requestAnimationFrame(this._shadeAll16);
  }

  componentWillUnmount() {
    if (super.componentWillUnmount) super.componentWillUnmount();
    document.removeEventListener("scroll", this._shade16, true);
    clearInterval(this._shadeTick16);
    clearInterval(this._rec16);
    clearTimeout(this._handoff16);
  }

  openMenu14(a, b, rows, label, opts) {
    this._menuBack16 = (opts && opts.back16) || null;
    return super.openMenu14(a, b, rows, label, opts);
  }

  // The goal is a chip beside the model, edited in place. A dialog for one
  // line of text was a stop the work did not need.
  startGoal16(where) {
    const key = this.composerKey15(where || "main");
    const cur = (this.state.goals12 || {})[key];
    this.setState({ goalEdit16: key, goalDraft16: cur ? cur.text : "" });
    setTimeout(() => {
      const el = document.querySelector(".cbar-goalin16");
      if (el) { el.focus(); el.select && el.select(); }
    }, 40);
  }

  commitGoal16() {
    const key = this.state.goalEdit16;
    if (!key) return;
    const text = String(this.state.goalDraft16 || "").trim();
    this.setState((s) => {
      const goals = Object.assign({}, s.goals12);
      if (text) goals[key] = { text, paused: false };
      else delete goals[key];
      return { goals12: goals, goalEdit16: null };
    });
  }

  renderVals() {
    const v = super.renderVals();
    const st = this.state;
    const gkey = this.composerKey15(this.state.plusWhere15 || "main");
    const goal = (this.state.goals12 || {})[gkey];
    const editing = this.state.goalEdit16 === gkey;
    v.goalChip16 = !!goal || editing;
    v.goalEditing16 = editing;
    v.goalDraft16 = this.state.goalDraft16 || "";
    v.goalFull16 = goal ? goal.text : "";
    v.goalShort16 = goal ? (goal.text.length > 26 ? goal.text.slice(0, 25) + "\u2026" : goal.text) : "Goal";
    v.goalEdit16 = (e) => this.setState({ goalDraft16: e.target.value });
    v.goalKey16 = (e) => {
      if (e.key === "Enter") { e.preventDefault(); this.commitGoal16(); }
      else if (e.key === "Escape") { e.preventDefault(); this.setState({ goalEdit16: null }); }
    };
    v.goalCommit16 = () => this.commitGoal16();
    v.goalOpen16 = () => this.startGoal16(this.state.plusWhere15 || "main");
    v.goalClear16 = () => {
      this.setState((s) => {
        const goals = Object.assign({}, s.goals12);
        delete goals[gkey];
        return { goals12: goals, goalEdit16: null };
      });
    };
    v.planChip16 = this.planOn15(gkey);
    v.planClear16 = () => this.togglePlan15(this.state.plusWhere15 || "main");
    // A — the search tabs name their kind with a glyph.
    if (Array.isArray(v.searchTabs14)) {
      const TI = { All: "layers", Issues: "inbox", Chats: "message-square", Routines: "clock" };
      v.searchTabs14 = v.searchTabs14.map((tab) => ({
        ...tab, icon16: "i15.svg#" + (TI[tab.title] || "layers"),
      }));
    }
    // C — the menu header carries the back arrow.
    if (Array.isArray(v.modelRows11)) {
      v.modelRows11 = v.modelRows11.map((m) => ({
        ...m,
        pick: () => {
          const before17 = this.route17();
          this.setState({ model: m.name, mpMode15: "summary" });
          if (this.state.view === "chat" && this.currentChat()) this.updateChat({ model: m.name });
          this.noteModelChange17(m.name, before17);
        },
      }));
    }
    const DRILL16 = ["Files and folders", "Project", "Plugins", "Add more plugins"];
    if (Array.isArray(v.menuRows14)) {
      v.menuRows14 = v.menuRows14.map((r) =>
        DRILL16.indexOf(r.label) >= 0 ? { ...r, cls: (r.cls || "") + " drill16" } : r);
    }
    // 6 — the inspector stays out of a call.
    v.inspectorShown16 = !!v.inspectorOpen10 && !(st.cbOn16 || st.voice10);
    // 8 — the new-workspace dialog.
    v.newWorkspaceDialog16 = st.dialog === "newWorkspace16";
    const name16 = st.nwName16 || "";
    v.nwName16 = name16;
    v.nwGlyph16 = (name16.trim()[0] || "N").toUpperCase();
    v.nwTone16 = st.nwTone16 || "blue16";
    v.nwEmpty16 = !name16.trim();
    v.nwEditName16 = (e) => this.setState({ nwName16: e.target.value });
    v.nwKey16 = (e) => { if (e.key === "Enter") { e.preventDefault(); this.createWorkspace16(); } };
    v.nwCreate16 = () => this.createWorkspace16();
    v.nwSlug16 = st.nwSlugEdited16
      ? (st.nwSlug16 || "")
      : name16.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    v.nwEditSlug16 = (e) => this.setState({ nwSlug16: e.target.value, nwSlugEdited16: true });
    v.nwTones16 = [
      { key: "blue16", name: "Azure", bg: "var(--blue)" },
      { key: "ink16", name: "Ink", bg: "#0c0a08" },
      { key: "moss16", name: "Moss", bg: "#3a6b2a" },
      { key: "clay16", name: "Clay", bg: "#8c1d1d" },
    ].map((c) => ({
      ...c, style: "background:" + c.bg,
      cls: (st.nwTone16 || "blue16") === c.key ? "on" : "",
      pick: () => this.setState({ nwTone16: c.key }),
    }));
    v.nwKinds16 = ["A new product", "A client project", "Just for me"].map((k) => ({
      key: k, name: k,
      cls: (st.nwKind16 || "A new product") === k ? "on" : "",
      pick: () => this.setState({ nwKind16: k }),
    }));
    // 7 — the profile's three sections.
    const pfTab = st.pfTab16 || "profile";
    v.pfTabs16 = [
      ["profile", "Profile", "user"],
      ["security", "Security", "shield"],
      ["notifs", "Notifications", "bell"],
    ].map(([k, name, icon]) => ({
      key: k, name, icon: "i15.svg#" + icon,
      on: pfTab === k, cls: pfTab === k ? "active" : "",
      open: () => this.setState({ pfTab16: k }),
    }));
    v.pfTabs16.push({
      key: "operator", name: "Operator", icon: "i15.svg#bot",
      on: pfTab === "operator", cls: pfTab === "operator" ? "active" : "",
      open: () => this.setState({ pfTab16: "operator" }),
    });
    v.pfProfile16 = pfTab === "profile";
    v.pfSecurity16 = pfTab === "security";
    v.pfNotifs16 = pfTab === "notifs";
    v.pfOperator16 = pfTab === "operator";
    v.pfScope16 = String(st.member || "You").toUpperCase() + " \u00b7 PERSONAL";
    v.pfSkillsCount16 = ((v.skills10 || []).length + this.skillFixture16().length) + " skills \u00b7 search, turn on or off";
    v.pfOpenSkills16 = () => this.go("skills10", { panel: null, inspector10: false, mobileInspector10: false });
    v.profileMenu = (e) => this.profileMenu16(e);
    v.pfMethodRows16 = [
      { key: "google", title: "Google", copy: "alejandro.rosas@didit.me", state: "Connected",
        icon: "i15.svg#circle-check", action: "Disconnect",
        act: () => this.toast("Google sign-in disconnected.") },
      { key: "github", title: "GitHub", copy: "arosasg", state: "Connected",
        icon: "i15.svg#circle-check", action: "Disconnect",
        act: () => this.toast("GitHub sign-in disconnected.") },
      { key: "email", title: "Email and password", copy: "Last changed 4 months ago", state: "On",
        icon: "i15.svg#mail", action: "Change password",
        act: () => this.toast("A reset link is on its way.") },
    ];
    v.pfPasskeyRows16 = [
      { key: "mac", title: "This Mac", copy: "Touch ID \u00b7 added 12 March", action: "Remove",
        act: () => this.toast("Passkey removed.") },
      { key: "iphone", title: "iPhone 16 Pro", copy: "Face ID \u00b7 added 4 January", action: "Remove",
        act: () => this.toast("Passkey removed.") },
    ];
    v.pfAddPasskey16 = () => this.toast("Your device will ask you to confirm.");
    const safety16 = this.sec19();
    const devs16 = safety16.sessions || [], keys16 = safety16.keys || [];
    v.pfSecurityRows16 = [
      { key: "2fa", title: "Two-step sign-in",
        copy: safety16.twoStep ? "Authenticator app \u00b7 on" : "Off \u00b7 your password is the only lock",
        action: "Manage", act: () => this.open("twoStep19") },
      { key: "sessions", title: "Signed-in devices",
        copy: devs16.length
          ? this.countLabel19(devs16.length, "device", "devices") + " \u00b7 " + devs16.map((d) => d.short).join(", ")
          : "Only this device",
        action: "Review", act: () => this.open("devices19") },
      { key: "keys", title: "API keys",
        copy: keys16.length
          ? this.countLabel19(keys16.length, "key", "keys") + " \u00b7 "
            + (keys16.some((k) => k.scope === "Full access") ? "one with full access" : "read only")
          : "No keys \u00b7 the daemon uses your account",
        action: "Open", act: () => this.open("apiKeys19") },
    ];
    const notif = st.notif16 || { needs: true, done: true, blocked: true, digest: false };
    v.pfNotifRows16 = [
      { key: "needs", title: "Work needs you", copy: "A run stopped for an answer" },
      { key: "blocked", title: "Something is blocked", copy: "An agent raised a blocker" },
      { key: "done", title: "Work finished", copy: "A result is ready to review" },
      { key: "digest", title: "Daily summary", copy: "One note each morning" },
    ].map((r) => ({
      ...r, on: !!notif[r.key], cls: notif[r.key] ? "on" : "",
      toggle: () => this.setState((s) => ({
        notif16: Object.assign({ needs: true, done: true, blocked: true, digest: false },
          s.notif16, { [r.key]: !(s.notif16 || notif)[r.key] }),
      })),
    }));
    // 2 — choosing a repository from what GitHub granted.
    v.repoCount16 = (v.repoTabs14 || []).length + " connected";
    v.repoFromGithub16 = () => this.setState({ dialog: "repoPick16", rpQuery16: "" });
    v.repoPickDialog16 = st.dialog === "repoPick16";
    const q16 = String(st.rpQuery16 || "").trim().toLowerCase();
    const connected16 = (v.repoTabs14 || []).map((r) => r.name);
    const CANDIDATES16 = [
      { name: "botinc/app", note: "TypeScript \u00b7 updated 2 hours ago" },
      { name: "botinc/marketing", note: "TypeScript \u00b7 updated yesterday" },
      { name: "botinc/infra", note: "Terraform \u00b7 updated 3 days ago" },
      { name: "botinc/daemon", note: "Go \u00b7 updated 6 days ago" },
      { name: "botinc/docs", note: "MDX \u00b7 updated last week" },
      { name: "didit-labs/sdk", note: "Go \u00b7 updated 2 weeks ago" },
    ];
    const shown16 = CANDIDATES16.filter((r) => !q16 || r.name.toLowerCase().indexOf(q16) >= 0);
    v.rpQuery16 = st.rpQuery16 || "";
    v.rpEdit16 = (e) => this.setState({ rpQuery16: e.target.value });
    v.rpEmpty16 = !shown16.length;
    v.rpRows16 = shown16.map((r) => {
      const on = connected16.indexOf(r.name) >= 0;
      return {
        key: r.name, name: r.name, note: r.note,
        state: on ? "Connected" : "", cls: on ? "on" : "",
        pick: () => {
          this.setState({ dialog: null });
          if (on) this.toast(r.name + " is already connected.");
          else this.toast(r.name + " connected. Sandbox setup is next.");
        },
      };
    });
    v.rpGrant16 = () => {
      this.setState({ dialog: null });
      this.toast("Opening GitHub to grant access to more repositories.");
    };
    v.menuHasBack16 = typeof this._menuBack16 === "function";
    v.menuBack16 = () => { if (this._menuBack16) this._menuBack16(); };
    const section16 = st.workspaceSection12 === "terminal" ? "preview" : st.workspaceSection12;
    v.fixMenu16 = (e) => this.fixMenu16(e);
    v.w8Import16 = () => this.openImport14();
    v.workspaceMenu = (e) => this.workspaceMenu16(e);
    // The grid lives in a scroll box, so its tooltip is fixed and positioned
    // from the square's own rect — absolute children were clipped by it.
    if (Array.isArray(v.pfWeeks15)) {
      v.pfWeeks15 = v.pfWeeks15.map((w) => ({
        ...w,
        days: (w.days || []).map((d) => ({
          ...d,
          tipIn16: (e) => {
            if (!d.title) return;
            const b = e.currentTarget.getBoundingClientRect();
            // The tooltip is centred on x, so x is clamped to keep its full
            // width on screen for squares near either edge.
            const half = 106;
            const x = Math.max(half + 8, Math.min(window.innerWidth - half - 8, b.left + b.width / 2));
            this.setState({ tip16: { text: d.title, x: Math.round(x), y: Math.round(b.top) } });
          },
          tipOut16: () => this.setState({ tip16: null }),
        })),
      }));
    }
    const tip = st.tip16;
    v.tipOpen16 = !!tip;
    v.tipText16 = tip ? tip.text : "";
    v.tipStyle16 = tip ? "left:" + tip.x + "px;top:" + tip.y + "px" : "";
    v.workspaceName = st.workspace16 || v.workspaceName || "BotInc";

    // 1 · Preview is a context of its own, so it sits beside Files.
    if (Array.isArray(v.inspectorTabs12)) {
      const out = [];
      for (const tab of v.inspectorTabs12) {
        out.push(tab);
        if (/attachments|files/i.test(tab.label || "")) {
          out.push({
            label: "Preview",
            cls: v.filesPane12 && section16 === "preview" ? "selected" : "",
            pick: () => { this.setState({ workspaceSection12: "preview" }); this.openInspector10("files"); },
          });
        }
      }
      v.inspectorTabs12 = out.map((tab) =>
        /attachments|files/i.test(tab.label || "")
          ? { ...tab, cls: v.filesPane12 && section16 !== "preview" ? "selected" : "",
              pick: () => { this.setState({ workspaceSection12: "files" }); this.openInspector10("files"); } }
          : tab);
    }

    // 2 · A new issue starts as a sentence to the Operator, not a blank form.
    v.newIssue = () => this.askOperator16(
      "I want to post a new issue. Ask me what needs to happen, then write it up and dispatch it.",
      ["A bug someone reported", "A change to the product", "Something I noticed myself", "Read it from a repository issue"]);

    // 3 · A routine is set up by being asked about it, not by filling a form.
    v.newAutopilot9 = () => this.askOperator16(
      "Help me set up a routine. Ask what should happen on its own, how it should be triggered, and who should run it.",
      ["Issue intake \u00b7 triage what arrives", "On a schedule \u00b7 every weekday", "On a GitHub event \u00b7 label or PR", "Watch something and tell me"]);
    // The entry path decides what the Operator offers first.
    if (st.dockChips16) {
      v.dockSuggestions15 = st.dockChips16.map((label, i) => ({
        key: "chip" + i, label, ask: () => this.dockSendText15(label),
      }));
      v.dockIntro15 = "Tell me what you want and I will ask the rest \u2014 then write it up for your approval.";
    }

    // 4 · The routine page states what it is before its log.
    v.autoFacts16 = [
      { key: "t", k: "Trigger", v: v.autoTrigger9 || "\u2014", note: v.autoNext9 || "" },
      { key: "o", k: "Runs as", v: v.autoOwner9 || "\u2014", note: [v.autoAgent9, v.autoComputer9].filter(Boolean).join(" \u00b7 ") },
      { key: "r", k: "Result", v: v.autoOutput9 || "\u2014", note: v.autoScope9 || "" },
      { key: "s", k: "State", v: v.autoPauseLabel9 === "Resume autopilot" ? "Paused" : "Active",
        note: v.autoPauseLabel9 === "Resume autopilot" ? "Paused by you" : "Listening for events" },
    ];
    const hc = st.hc16;
    v.hcOpen16 = !!hc;
    v.hcTitle16 = hc ? hc.title : "";
    v.hcWhen16 = hc ? hc.when : "";
    v.hcState16 = hc ? hc.state : "";
    v.hcWhere16 = hc ? hc.where : "";
    v.hcTone16 = hc ? hc.tone : "";
    v.hcIcon16 = hc ? hc.icon : "i15.svg#message-square";
    v.hcStyle16 = hc ? "left:" + hc.x + "px;top:" + hc.y + "px" : "";
    // The bar is dragged by its body, so its position is remembered.
    v.cbStyle16 = st.cbX16 == null
      ? ""
      : "left:" + st.cbX16 + "px;top:" + st.cbY16 + "px;right:auto;bottom:auto;transform:none";
    v.cbDrag16 = (e) => this.cbDrag16(e);

    // The sidebar sections use the Work sections' glyph and type.
    if (Array.isArray(v.conversationGroups12)) {
      // Work's own status names, so a section means the same thing in both
      // places. "Waiting on others" and "Recent" were sidebar-only inventions.
      const RENAME = {
        "waiting on others": "In review",
        "waiting on you": "Needs you",
        "recent": "Done",
        "resolved": "Done",
        "earlier": "Done",
        "archived": "Canceled",
      };
      const GRP = {
        "needs you": ["circle-alert", "st-blocked16"],
        "todo": ["circle-dashed", "st-todo16"],
        "in progress": ["circle-dot", "st-progress16"],
        "in review": ["git-pull-request", "st-review16"],
        "blocked": ["circle-alert", "st-blocked16"],
        "done": ["circle-check", "st-done16"],
        "canceled": ["archive", "st-canceled16"],
      };
      v.conversationGroups12 = v.conversationGroups12.map((g) => {
        const raw = String(g.title || "").trim().toLowerCase();
        const title = RENAME[raw] || g.title;
        const hit = GRP[String(title).trim().toLowerCase()] || ["circle-dashed", "st-todo16"];
        return { ...g, title, icon16: "i15.svg#" + hit[0], tone16: hit[1] };
      });
    }
    const muted = !!st.cbMuted16;
    const mic = Component.MICS16.find((d) => d.id === (st.cbMic16 || "default")) || Component.MICS16[0];
    const out = Component.OUTS16.find((d) => d.id === (st.cbOut16 || "speakers")) || Component.OUTS16[0];
    // One widget for every call, however it was started.
    v.callBar16 = !!st.cbOn16 || !!st.voice10;
    if (st.handoff16) v.rootClass = (v.rootClass || "") + " handoff16";
    // 3 — how the work is paid for, stated on the model button.
    const fundRaw = String(v.mpFunding15 || v.fundingTooltip11 || "");
    const isKey16 = /api|key/i.test(fundRaw);
    const isCredit16 = /credit|wallet|balance/i.test(fundRaw);
    v.fundKind16 = isCredit16 ? "cred16" : isKey16 ? "key16" : "sub16";
    v.fundMark16 = isCredit16
      ? "i15.svg#wallet"
      : isKey16 ? "i15.svg#key-round" : "i15.svg#credit-card";
    // The row inside the selector carries the same mark; the core's own
    // fundingIcon11 showed a key even for a subscription.
    const fundRow16 = String(v.mpFunding15 || "");
    v.fundingIcon11 = /credit|wallet|balance/i.test(fundRow16)
      ? "i15.svg#wallet"
      : /api key|api-key/i.test(fundRow16) ? "i15.svg#key-round" : "i15.svg#credit-card";
    v.mpFundingGo16 = (e) => {
      this._mpFrom16 = true;
      if (v.fundingPicker11) v.fundingPicker11(e);
    };
    v.pickerHasBack16 = !!this._mpFrom16 && !!v.fundingPopover10;
    v.pickerBack16 = () => {
      this._mpFrom16 = false;
      this.setState({ popover10: "model", mpMode15: "summary" });
    };
    v.fundShort16 = isCredit16 ? "CREDIT" : isKey16 ? "API" : "SUB";
    v.cbState16 = muted ? "Microphone off" : "Listening";
    v.cbSub16 = muted
      ? "The Operator cannot hear you"
      : (st.voice10 && st.voiceCaption10) ? st.voiceCaption10 : mic.name + " \u00b7 " + out.name;
    v.cbOrbTone16 = muted ? "cb-quiet16" : "cb-live16";
    v.cbMuted16 = muted;
    v.cbMicCls16 = muted ? "cb-off16" : "";
    v.cbMicIcon16 = muted ? "i15.svg#mic-off" : "i15.svg#mic";
    v.cbMicLabel16 = muted ? "Turn the microphone on" : "Turn the microphone off";
    v.cbToggleMic16 = () => this.setState((s) => ({ cbMuted16: !s.cbMuted16 }));
    v.cbDevice16 = mic.name + " \u00b7 " + out.name;
    v.cbDeviceMenu16 = (e) => this.cbDeviceMenu16(e);
    v.cbEnd16 = () => this.setState({
      cbOn16: false, cbMuted16: false, voice10: false,
      inspector10: false, mobileInspector10: false,
    });
    v.openCall = () => this.setState({ cbOn16: true, cbMuted16: false, dialog: null });
    // The heading says what Work is. The counts are on the tabs already, so
    // repeating them as a KPI line told the reader nothing new.
    v.w8Lede16 = "Everything the company is doing for you. Write what needs to happen and the roster picks it up \u2014 nothing merges without your approval.";

    // The status tabs, minus the aggregate view — that one double-counts the
    // others, which is what made the search note disagree with the row count.
    const statusTabs16 = (v.w8Nav || []).filter(
      (tab) => tab.label !== "Active" && tab.label !== "Open");
    const needsTab16 = statusTabs16.find((tab) => /needs you/i.test(tab.label || ""));

    // The attention actions exist while something is waiting, read from the
    // tab count rather than a list another section used to populate.
    const needs = needsTab16 ? +needsTab16.count || 0 : 0;
    v.hasNeeds16 = needs > 0;
    v.attnLabel16 = "Fix " + needs + (needs === 1 ? " issue" : " issues");

    // Search runs over every status, so the tab counts move as you type.
    const q = String(v.w8Search || "").trim();
    const total = statusTabs16
      .filter((tab) => !/needs you/i.test(tab.label || ""))
      .reduce((n, tab) => n + (+tab.count || 0), 0);
    v.w8SearchWide16 = q.length > 0;
    v.w8SearchNote16 = total
      ? total + (total === 1 ? " match" : " matches") + " across every status \u2014 the tabs below show where they are."
      : "No issue matches \u201c" + q + "\u201d in any status.";

    // A first run is "this workspace holds no issues", not a heading string —
    // the Needs-you view rewrites that heading to "You're all caught up".
    const noIssues16 = !(this.state.issues || []).length;
    v.w8FirstRun16 = noIssues16;
    v.w8EmptyFiltered16 = !!v.w8Empty && !noIssues16;
    if (noIssues16) { v.w8Empty = false; v.w8HasRows = false; v.w8SearchWide16 = false; }
    v.w8FirstSteps16 = [
      { key: 1, n: "1", title: "Write it in plain words", copy: "A sentence is enough. Say what should be true when it is done." },
      { key: 2, n: "2", title: "The roster dispatches itself", copy: "hermes routes it, hephaestus builds, athena reviews independently." },
      { key: 3, n: "3", title: "You approve the result", copy: "The finished work comes back with its diff, its checks and its cost." },
    ];
    v.w8FirstImport16 = () => this.openImport14();
    // Priority as a figure, the source tinted by where the work came from, and
    // the owner named rather than reduced to a letter.
    if (Array.isArray(v.w8Groups)) {
      const PRIO = { urgent: "lv4-16", high: "lv3-16", normal: "lv2-16", low: "lv1-16" };
      const srcTone = (key) => {
        const k = String(key || "").toLowerCase();
        if (/^#\d/.test(k) || /pr|branch|repo|github|commit/.test(k)) return "src-repo16";
        if (/^#/.test(k) || /chat|slack|conversation|thread/.test(k)) return "src-chat16";
        if (/manual|botinc/.test(k)) return "src-manual16";
        return "src-tracker16";
      };
      v.w8Groups = v.w8Groups.map((g) => ({
        ...g,
        rows: (g.rows || []).map((w) => ({
          ...w,
          prioLevel16: PRIO[String(w.priority || "").trim().toLowerCase()] || "lv2-16",
          sourceTone16: srcTone(w.sourceKey),
          ownerName16: String(w.ownerTitle || "").replace(/^(Owner|Assignee)[:\s·]+/i, "").split(" \u00b7 ")[0],
        })),
      }));
    }
    // The entrance plays once per session, on the first load only.
    if (this._launchSeen16 === undefined) {
      this._launchSeen16 = false;
      clearTimeout(this._launchT16);
      this._launchT16 = setTimeout(() => { this._launchSeen16 = true; this.forceUpdate(); }, 2600);
    }
    v.launchIntro16 = this._launchSeen16 ? "" : "launch-intro16";
    v.dockCornerDrag16 = (e) => this.dockCornerDrag16(e);
    v.dockCornerKey16 = (e) => this.dockCornerKey16(e);
    v.dockFloatStyle16 = "width:" + (this.state.dockW16 || 392) + "px;height:" + (this.state.dockH16 || 520) + "px";

    // --- 1 · every status filter carries the colour of its state, and the
    // work that needs a person is one of those states.
    if (Array.isArray(v.w8Nav)) {
      v.w8Nav = v.w8Nav
        .filter((n) => n.label !== "Active" && n.label !== "Open")
        .map((n) => ({
          ...n,
          navCls16: ((n.cls || "") + " " + this.statusTone16(n.label)).trim(),
          iconHref: this.statusIcon16(n.label) || n.iconHref,
        }));
    }

    // --- 2 · archive straight from the row.
    if (Array.isArray(v.conversationGroups12)) {
      const renamed = st.renamed16 || {};
      const unread = st.unread16 || {};
      const archived = st.archived16 || {};
      v.conversationGroups12 = v.conversationGroups12.map((g) => ({
        ...g,
        rows: (g.rows || []).filter((r) => !archived[r.id || r.key || r.title]).map((r) => ({
          ...r,
          title: renamed[r.id || r.key || r.title] || r.title,
          unread16: !!unread[r.id || r.key || r.title],
          renaming16: st.renameId16 === (r.id || r.key || r.title),
          renameDraft16: st.renameDraft16 || "",
          renameEdit16: (e) => this.setState({ renameDraft16: e.target.value }),
          renameKey16: (e) => {
            if (e.key === "Enter") { e.preventDefault(); this.commitRename16(); }
            else if (e.key === "Escape") { e.preventDefault(); this.setState({ renameId16: null }); }
          },
          renameDone16: () => this.commitRename16(),
          // The hover card states what the row is without opening it.
          state16: String(r.subtitle || "").split(" \u00b7 ")[0] || "Conversation",
          where16: String(r.subtitle || "").split(" \u00b7 ").slice(1).join(" \u00b7 ") || "Private",
          when16: r.when || r.updated || "",
          hoverIn16: (e) => {
            const el = e && e.currentTarget;
            if (!el || !el.getBoundingClientRect) return;
            const b = el.getBoundingClientRect();
            clearTimeout(this._hcT16);
            this._hcT16 = setTimeout(() => this.setState({
              hc16: {
                title: r.title,
                when: this.rowWhen16(r),
                state: String(r.subtitle || "").split(" \u00b7 ")[0] || "Conversation",
                where: String(r.subtitle || "").split(" \u00b7 ").slice(1).join(" \u00b7 ") || "Private",
                tone: r.tone || "",
                icon: r.icon || "i15.svg#message-square",
                x: Math.round(b.right + 10),
                y: Math.round(Math.min(b.top - 4, window.innerHeight - 130)),
              },
            }), 260);
          },
          hoverOut16: () => { clearTimeout(this._hcT16); this.setState({ hc16: null }); },
          archive16: (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            this.archiveRow16(r.id || r.key || r.title, r.title);
          },
        })),
      }));
    }

    // --- 5 · the command reads as a command.
    if (Array.isArray(v.searchGroups14)) {
      v.searchGroups14 = v.searchGroups14.map((g) => ({
        ...g,
        rows: (g.rows || []).map((r) =>
          r.title === "Import issues from another tracker" ? { ...r, title: "Import issues" } : r),
      }));
    }
    if (Array.isArray(v.menuRows14)) {
      v.menuRows14 = v.menuRows14.map((r) =>
        r.label === "Import issues from another tracker" ? { ...r, label: "Import issues" } : r);
    }
    // The status pickers carry their colour on the trigger and on every option,
    // so a state is recognisable before the label is read.
    for (const key of ["m14_i8Status", "m14_issueStatus12"]) {
      const sel = v[key];
      if (sel) v[key] = {
        ...sel,
        cls: (sel.cls || "") + " stsel16 sticon-on16 " + this.statusTone16(sel.label),
        icon16: this.statusIcon16(sel.label) || "i15.svg#circle",
      };
    }
    if (this.state.menu14 === "i8Status" || this.state.menu14 === "issueStatus12") {
      v.menuRows14 = (v.menuRows14 || []).map((r) => ({
        ...r,
        cls: (r.cls || "") + " strow16 sticon-on16 " + this.statusTone16(r.label),
        hasIcon: true,
        icon: this.statusIcon16(r.label) || "i15.svg#circle",
      }));
    }
    // "Active" sat in a row of status names but is not one — it is the view of
    // everything unfinished. "Open" says that without competing with a status.
    if (typeof v.w8CountLine === "string") {
      v.w8CountLine = replaceAll16(v.w8CountLine, "active issues", "open issues");
    }
    if (typeof v.w8Summary === "string") {
      v.w8Summary = replaceAll16(v.w8Summary, " active · ", " open · ");
    }
    // --- 2 + 3 · the schedule page says what it is, and the zone sits with
    // the times it applies to.
    v.scheduleSummary14 = "Work that repeats without being asked. Nothing it produces merges itself.";

    // --- 6 · a conversation row can be renamed, pinned, archived or shared.
    if (Array.isArray(v.conversationGroups12)) {
      const renamed = st.renamed16 || {};
      const unread = st.unread16 || {};
      const archived = st.archived16 || {};
      v.conversationGroups12 = v.conversationGroups12.map((g) => ({
        ...g,
        rows: (g.rows || []).filter((r) => !archived[r.id || r.key || r.title]).map((r) => ({
          ...r,
          title: renamed[r.id || r.key || r.title] || r.title,
          unread16: !!unread[r.id || r.key || r.title],
          renaming16: st.renameId16 === (r.id || r.key || r.title),
          renameDraft16: st.renameDraft16 || "",
          renameEdit16: (e) => this.setState({ renameDraft16: e.target.value }),
          renameKey16: (e) => {
            if (e.key === "Enter") { e.preventDefault(); this.commitRename16(); }
            else if (e.key === "Escape") { e.preventDefault(); this.setState({ renameId16: null }); }
          },
          renameDone16: () => this.commitRename16(),
          pinned16: /unpin/i.test(r.pinLabel || ""),
          menu16: (e) => this.rowMenu16({ ...r, pinned16: /unpin/i.test(r.pinLabel || "") }, e),
        })),
      }));
    }

    // --- 8 · comment and tag from the review block. Tagging the Operator is
    // what makes it answer, so the note says so before you post.
    const draft = this.state.rvcDraft16 || "";
    const people = [
      { handle: "operator", label: "Operator" },
      { handle: "alex", label: "Alex" },
      { handle: "emre", label: "Emre" },
    ];
    v.rvcDraft16 = draft;
    v.rvcEdit16 = (e) => this.setState({ rvcDraft16: e.target.value });
    v.rvcEmpty16 = !draft.trim();
    v.rvcPeople16 = people.map((p) => ({
      key: p.handle, handle: p.handle,
      cls: draft.indexOf("@" + p.handle) >= 0 ? "on" : "",
      tag: () => this.setState({
        rvcDraft16: draft.indexOf("@" + p.handle) >= 0 ? draft : (draft.trim() + " @" + p.handle + " ").replace(/^\s+/, ""),
      }),
    }));
    v.rvcWillReply16 = draft.indexOf("@operator") >= 0;
    v.rvcNote16 = "Operator is tagged, so it will reply in the conversation.";
    v.rvcPost16 = () => {
      if (!draft.trim()) return;
      const tagged = draft.indexOf("@operator") >= 0;
      this.setState({ rvcDraft16: "" });
      this.toast(tagged ? "Comment posted. Operator will reply in the conversation." : "Comment posted on this result.");
    };

    // --- 7 · name the workflow this run used before offering its settings.
    v.wfuName16 = "Implement \u2192 review \u2192 gate";
    v.wfuStamp16 = "workspace default";
    v.wfuRows16 = [
      { key: "stages", k: "Stages", v: "4 \u00b7 build, review, gate, finish" },
      { key: "review", k: "Review", v: "Independent, second vendor" },
      { key: "gate", k: "Merge gate", v: "Checks pass \u00b7 human confirms" },
      { key: "budget", k: "Budget", v: "$2 per run \u00b7 20 a day" },
    ];

    // --- 9 + 10 · GitHub-style diff colours, and a coloured diff stat.
    if (Array.isArray(v.resultFiles10)) {
      v.resultFiles10 = v.resultFiles10.map((f) => {
        let n = 0;
        const lines = String(f.preview || "").split("\n").map((text, idx) => {
          const c = text.charAt(0);
          const meta = /^(@@|diff |index |\+\+\+|---)/.test(text);
          const add = !meta && c === "+";
          const del = !meta && c === "-";
          if (!del) n += 1;
          return {
            key: idx,
            cls: meta ? "meta16" : add ? "add16" : del ? "del16" : "ctx16",
            sign: add ? "+" : del ? "\u2212" : "",
            n: meta ? "" : del ? "" : String(n),
            text: meta || (!add && !del) ? text : text.slice(1),
          };
        });
        return { ...f, diffLines16: lines };
      });
    }
    // --- 10 · the tab is called Pull requests.
    if (Array.isArray(v.inspectorTabs12)) {
      v.inspectorTabs12 = v.inspectorTabs12.map((tab) =>
        tab.label === "PR" ? { ...tab, label: "Pull requests" } : tab);
    }
    // Attachments and Preview only. The terminal is the record behind the
    // preview, so it lives there; changed files live with the pull request.
    const section = section16;
    v.attachTitle16 = section === "preview" ? "Preview" : "Attachments";
    v.attachNote16 = section === "preview"
      ? "What the work looks like now, and the run that produced it."
      : "Everything this conversation is working from.";
    v.workspaceTabs12 = [["files", "Shared with the chat"], ["preview", "Preview"]].map(([id, label]) => ({
      label, cls: section === id ? "selected" : "",
      pick: () => this.setState({ workspaceSection12: id }),
    }));
    v.workspaceFiles12 = section === "files";
    v.workspacePreview12 = section === "preview";
    v.workspaceTerminal12 = false;

    // A conversation can carry several pull requests, so the pane opens on a
    // list and the detail is one level in.
    const opened = !!this.state.prOpen16;
    if (v.prPane12) {
      const checksTone = v.prChecksSummary12 && /fail/i.test(v.prChecksSummary12)
        ? "bad16" : /run|pend/i.test(v.prChecksSummary12 || "") ? "warn16" : "ok16";
      const reviewTone = /request/i.test(v.prReviewSummary12 || "") ? "warn16" : "ok16";
      v.prListOpen16 = !opened;
      v.prPane12 = opened;
      v.prListNote16 = "1 open for " + v.inspectorId10 + " \u00b7 " + v.prRepository12;
      const raw = String(v.prTitle12 || "");
      const head = raw.match(/^\s*(?:PR\s*)?(#?\d+)\s*[·\u00b7:-]\s*/i);
      const files = v.resultFiles10 || [];
      // resultFiles10 carries numeric add/remove per file; the row states their sum.
      const diff = files.reduce(
        (acc, f) => ({ add: acc.add + (+f.add || 0), del: acc.del + (+f.remove || 0) }),
        { add: 0, del: 0 }
      );
      // GitHub's own state vocabulary, glyph and colour.
      const GH16 = {
        open: ["git-pull-request", "pro16", "Open"],
        draft: ["git-commit-horizontal", "dra16", "Draft"],
        closed: ["circle-x", "clo16", "Closed"],
        merged: ["git-merge", "mer16", "Merged"],
      };
      const sl = String(v.prState12 || "").toLowerCase();
      const gh = GH16[sl.indexOf("merge") >= 0 ? "merged" : sl.indexOf("draft") >= 0 ? "draft"
        : sl.indexOf("closed") >= 0 ? "closed" : "open"];
      v.prRows16 = [{
        key: "pr-main",
        number: head ? (head[1].charAt(0) === "#" ? head[1] : "#" + head[1]) : "PR",
        title: head ? raw.slice(head[0].length) : raw,
        stateIcon16: "i15.svg#" + gh[0], stateTone16: gh[1], stateWord16: gh[2],
        add16: "+" + diff.add, del16: "\u2212" + diff.del,
        lines16: (diff.add + diff.del) + " lines",
        state: v.prState12, tone: v.prTone12, branch: v.prBranch12,
        checks: v.prChecksSummary12, checksTone,
        checksIcon: checksTone === "bad16" ? "i15.svg#circle-x"
          : checksTone === "warn16" ? "i15.svg#clock" : "i15.svg#circle-check",
        review: v.prReviewSummary12, reviewTone,
        comments: (v.prReviewRows12 || []).length + " comments",
        files: (v.prFileCount12 || 0) + " files",

        open: () => this.setState({ prOpen16: "pr-main" }),
      }];
    } else {
      v.prListOpen16 = false;
      v.prRows16 = [];
      v.prListNote16 = "";
    }
    v.prCloseDetail16 = () => this.setState({ prOpen16: null, prSection12: "overview" });
    for (const k of ["prOverview12", "prFiles12", "prChecksPane12", "prCommits12", "prCommitDetail12", "prReviewsPane12"]) {
      if (v[k]) v[k] = opened;
    }
    const rec = !!this.state.rec16;
    const secs = this.state.recSecs16 || 0;
    v.dictate10 = () => this.toggleDictation16();
    v.dockDictate15 = () => this.toggleDictation16();
    v.rtDictate16 = () => this.toggleDictation16();
    v.micClass16 = rec ? "rec16" : "";
    v.micOnStr16 = rec ? "true" : "false";
    v.micLabel16 = rec
      ? "Stop dictation \u00b7 " + Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0")
      : "Dictate a message";
    const go = () => this.setting("accounts");
    v.accountsOpen13 = false;
    v.usageOverlay12 = false;
    v.allUsage12 = go;
    v.modelAccounts10 = go;
    v.manageAccounts12 = go;
    if (Array.isArray(v.providerGroups13)) {
      v.providerGroups13 = v.providerGroups13.map((p) => ({
        ...p,
        open: go,
        rows: (p.rows || []).map((r) => ({
          ...r,
          open13: go,
          select13: go,
          brand14: p.brand12,
          brandClass14: p.brandClass12,
          plan14: r.plan || "",
          hasPlan14: !!r.plan,
          attention14: !!r.status && r.status !== "Available",
          showId14: !(!!r.status && r.status !== "Available"),
          statusShort14: String(r.status || "")
            .replace("Cloud sign-in needed", "Cloud sign-in")
            .replace("Refresh usage", "Stale"),
          windows: (r.windows || []).map((w) => ({
            ...w,
            initial14: String(w.short14 || w.label || "").charAt(0).toUpperCase(),
            resetShort14: String(w.resetShort14 || "")
              .replace(/^(\w{3}),?\s+/, "$1 ")
              .replace(/\s*·\s*/g, " "),
          })),
        })),
      }));
    }

    // --- Workflows as a settings page (the overlay stays for deep links).
    const wfPage = st.view === "settings" && st.section === "workflows";
    v.workflowsSettings16 = wfPage;
    if (wfPage) {
      v.settingsPage = true;
      v.settingsTitle = "Workflows";
      v.settingsDescription = "The ordered steps behind complex work, versioned on their own.";
      v.settingsIconHref = "i15.svg#git-branch";
      v.settingsScope = "BOTINC \u00b7 SHARED";
    }
    v.wfCount16 = (v.workflowRows14 || []).length + " defined";
    v.workflowsPage16 = () => this.setting("workflows");
    if (Array.isArray(v.settingsHomeGroups7)) {
      v.settingsHomeGroups7 = v.settingsHomeGroups7.map((g) => ({
        ...g, items: (g.items || []).map((r) => /^general$/i.test(r.title || "")
          ? { ...r, title: "Your settings", copy: "Profile, appearance, security, notifications, Operator" } : r),
      }));
    }
    if (Array.isArray(v.settingsAdvanced7)) {
      v.settingsAdvanced7 = v.settingsAdvanced7.map((r) =>
        /workflow/i.test(r.title || "") ? { ...r, open: () => this.setting("workflows") } : r);
    }

    // --- Repositories: the list is the page, a repository is its own page.
    v.repoDetail16 = !!st.repoDetail16;
    v.repoBack16 = () => this.setState({ repoDetail16: false });
    if (Array.isArray(v.repoTabs14)) {
      v.repoTabs14 = v.repoTabs14.map((r) => ({
        ...r, cls: "", on: false,
        open: () => { r.open(); this.setState({ repoDetail16: true }); },
      }));
    }
    if (v.repoDetail16 && v.reposSettings14) v.settingsTitle = v.repoName14 || v.settingsTitle;

    // --- Design sources carry the mark of where they live.
    const DS_LOGO16 = { "BotInc Design System": "assets/brands-v12/claude.svg", "Figma library": "assets/brands-v12/figma.svg" };
    const DS_KIND16 = { "BotInc Design System": "Design system", "Brand assets": "Asset library", "Interface guidance": "Written guidance", "Figma library": "Figma file" };
    v.designRows16 = (v.designRows15 || []).map((d, i) => ({
      ...d, key: d.title || i,
      hasLogo16: !!DS_LOGO16[d.title], logo16: DS_LOGO16[d.title] || "",
      logoCls16: DS_LOGO16[d.title] ? "has-logo16" : "",
      kind16: DS_KIND16[d.title] || "Source",
      updated16: /updated/i.test(d.meta || "") ? String(d.meta).replace(/^Updated\s+/i, "") : /v\d/.test(d.meta || "") ? String(d.meta).split(" \u00b7 ").pop() : d.meta || "\u2014",
    }));

    // --- The routine page: an overview first, its runs one tab over.
    const rtTab = st.rtTab16 || "overview";
    const runs = v.autopilotRuns10 || [];
    const RT16 = {
      done: ["circle-check", "st-done16", "Done"], failed: ["circle-alert", "st-blocked16", "Failed"],
      skipped: ["skip-forward", "st-paused16", "Skipped"], queued: ["clock", "st-todo16", "Queued"],
      running: ["circle-dot", "st-progress16", "Running"],
    };
    const runRow = (r, i) => {
      const t = RT16[String(r.status || "").toLowerCase()] || RT16.done;
      return { ...r, key: (r.title || "") + i, icon16: "i15.svg#" + t[0], tone16: t[1], stateWord16: t[2] };
    };
    v.rtOverview16 = rtTab === "overview";
    v.rtRunsTab16 = rtTab === "runs";
    v.rtTabs16 = [["overview", "Overview", "layout-dashboard", 0], ["runs", "Runs", "history", +v.autoHistoryCount9 || 0]].map(([k, label, icon, count]) => ({
      key: k, label, icon: "i15.svg#" + icon, count, hasCount: count > 0,
      cls: rtTab === k ? "active" : "", open: () => this.setState({ rtTab16: k }),
    }));
    v.rtShowRuns16 = () => this.setState({ rtTab16: "runs" });
    v.rtRunRows16 = runs.map(runRow).map((r) => ({ ...r, open: () => { this.setState({ rrTab16: "run" }); r.open(); } }));
    v.rtRunCount16 = runs.length + (runs.length === 1 ? " run" : " runs") + " in this view";
    v.rtHasMessages16 = (v.autoMessages10 || []).length > 0;
    const paused = v.autoPauseLabel9 === "Resume autopilot";
    const trig = String(v.autoTrigger9 || "");
    const timedR = /\bat\s+\d{1,2}:\d{2}\b|weekday|daily|weekly|every/i.test(trig);
    const trigParts = trig.split(" \u00b7 ");
    const scope = String(v.autoScope9 || "");
    const repo = /^[\w.-]+\/[\w.-]+$/.test(scope) ? scope : "";
    v.rtStateWord16 = v.autoProblem9 ? "Needs attention" : paused ? "Paused" : "Active";
    v.rtStateTone16 = v.autoProblem9 ? "st-blocked16" : paused ? "st-paused16" : "st-done16";
    const rtId = st.activeAuto9 || "routine";
    const rtRepo = (st.rtRepoBy16 || {})[rtId];
    const repoShown = rtRepo === undefined ? repo : rtRepo;
    const lim = (st.rtLimitsBy16 || {})[rtId] || { run: "2", day: "20" };
    const limEditing = !!st.rtLimitEditing16;
    v.rtLimitRun16 = st.rtLimitDraftRun16 ?? lim.run;
    v.rtLimitDay16 = st.rtLimitDraftDay16 ?? lim.day;
    v.rtEditLimitRun16 = (e) => this.setState({ rtLimitDraftRun16: e.target.value });
    v.rtEditLimitDay16 = (e) => this.setState({ rtLimitDraftDay16: e.target.value });
    v.rtLimitCancel16 = () => this.setState({ rtLimitEditing16: false, rtLimitDraftRun16: null, rtLimitDraftDay16: null });
    v.rtLimitSave16 = () => {
      const run = String(st.rtLimitDraftRun16 ?? lim.run), day = String(st.rtLimitDraftDay16 ?? lim.day);
      this.setState((s) => ({ rtLimitEditing16: false, rtLimitDraftRun16: null, rtLimitDraftDay16: null,
        rtLimitsBy16: Object.assign({}, s.rtLimitsBy16, { [rtId]: { run, day } }) }));
      this.toast("Limits saved \u00b7 $" + run + " per run, $" + day + " per day.");
    };
    const repoMenu = (e) => this.openMenu14(null, e, [{ head: "Repository for this routine" }].concat(
      ["botinc/app", "botinc/marketing", "botinc/infra", "botinc/daemon"].map((r) => ({
        label: r, on: repoShown === r, icon: this.icon14("folder-git-2"),
        run: () => { this.setState((s) => ({ rtRepoBy16: Object.assign({}, s.rtRepoBy16, { [rtId]: r }) })); this.toast("Runs now open a sandbox on " + r + "."); },
      })), [{ label: "No repository", hint: "Read only", on: !repoShown, icon: this.icon14("ban"),
        run: () => { this.setState((s) => ({ rtRepoBy16: Object.assign({}, s.rtRepoBy16, { [rtId]: "" }) })); this.toast("This routine no longer touches a repository."); } }]), "", { kind: "rtRepo", cls: "menu-rich15" });
    const openForm = () => v.editAutopilot9 && v.editAutopilot9();
    v.rtDefs16 = [
      { key: "by", icon: "user", k: "Created by", v: v.autoOwner9 || "Alex", note: "Sep 3 \u00b7 runs as " + [v.autoAgent9 || "Operator", v.autoComputer9 || "BotInc Cloud"].join(" \u00b7 ") },
      { key: "repo", icon: "folder-git-2", k: "Repositories", v: repoShown || "None", note: repoShown ? "Each run opens a fresh sandbox on main." : "This routine reads " + (scope || "your work") + " and touches no repository.",
        actionLabel: "Change", act: repoMenu },
      { key: "trigger", icon: timedR ? "calendar-clock" : "zap", k: "Trigger",
        v: timedR ? "On a schedule \u00b7 " + trigParts[0] : "On an event \u00b7 " + (trigParts[0] || "Plugin"),
        note: timedR ? "Runs " + trigParts[0].toLowerCase() + (trigParts[1] ? " in " + trigParts[1] : "") + ", whether or not anything changed."
          : (trigParts[0] || "The plugin") + " sends an event" + (repoShown ? " for " + repoShown : "") + "; the routine runs when it matches \u201c" + (trigParts.slice(1).join(" \u00b7 ") || "the filter") + "\u201d.",
        actionLabel: "Edit", act: openForm },
      { key: "next", icon: "clock", k: "Next run", v: v.autoProblem9 ? "Blocked" : paused ? "Not until resumed" : timedR ? (v.autoNext9 || "\u2014") : "When the next matching event arrives",
        note: v.autoProblem9 ? "Fix the problem above to resume." : paused ? "Resume to pick the schedule back up." : timedR ? "You can also run it now from the header." : (v.autoNext9 || "Listening for events") },
      { key: "result", icon: "inbox", k: "Result", v: v.autoOutput9 || "Result in a conversation", note: scope ? "Scope \u00b7 " + scope : "", actionLabel: "Edit", act: openForm },
      { key: "limits", icon: "wallet", k: "Limits", v: "$" + lim.run + " per run \u00b7 $" + lim.day + " per day", note: "The run stops when either is reached.",
        editing: limEditing, actionLabel: limEditing ? "" : "Change", act: () => this.setState({ rtLimitEditing16: true, rtLimitDraftRun16: lim.run, rtLimitDraftDay16: lim.day }) },
    ].map((d) => ({ ...d, icon: "i15.svg#" + d.icon, hasNote: !!d.note, hasAction: !!d.actionLabel, editing: !!d.editing, cls: d.editing ? "editing16" : "" }));
    // The header menu: duplicate or archive the routine.
    const archived = st.archivedAutos16 || {};
    v.rtMenu16 = (e) => this.openMenu14(null, e, [
      { label: "Duplicate", hint: "Same trigger and instructions", icon: this.icon14("copy"), run: () => this.toast("Copy created \u00b7 \u201c" + (v.autoTitle9 || "Routine") + " (copy)\u201d.") },
      { label: "Open in Work", hint: "Everything this routine created", icon: this.icon14("list-todo"), run: () => this.showWork && this.showWork() },
      { label: "Archive routine", hint: "Stops it and hides it from Schedule", icon: this.icon14("archive"), run: () => {
        const title = v.autoTitle9;
        this.setState((s) => ({ archivedAutos16: Object.assign({}, s.archivedAutos16, { [title]: true }) }));
        this.toast("\u201c" + title + "\u201d archived. It will not run again.");
        if (v.showSchedule9) v.showSchedule9();
      } },
    ], "", { kind: "rtMenu", cls: "menu-rich15" });
    for (const key of ["routineRows14", "upcomingRows14"]) {
      if (Array.isArray(v[key])) v[key] = v[key].filter((r) => !archived[r.title]);
    }
    if (Array.isArray(v.historyRows14)) v.historyRows14 = v.historyRows14.filter((r) => !archived[r.routine]);


    // --- Skills at scale: search, source, sort and a page at a time.
    const own = (v.skills10 || []).map((k, i) => ({
      key: "own-" + i, name: k.name, source: "Personal", kind: "personal", logo: "",
      copy: k.copy || "Personal skill", used: 12 - (i % 5), on: true, open: k.open,
    }));
    const all = own.concat(this.skillFixture16());
    const modes = st.skMode16 || {};
    const skTab = st.skTab16 || "all";
    const skSrc = st.skSrc16 || "";
    const skSort = st.skSort16 || "used";
    const skq = String(st.skQ16 || "").trim().toLowerCase();
    const byTab = all.filter((k) => skTab === "all" || k.kind === skTab);
    let shown = byTab.filter((k) => (!skSrc || k.source === skSrc) &&
      (!skq || k.name.toLowerCase().indexOf(skq) >= 0 || k.source.toLowerCase().indexOf(skq) >= 0));
    shown = shown.slice().sort((a, b) => skSort === "az" ? a.name.localeCompare(b.name)
      : skSort === "on" ? (+(modes[b.key] ?? b.on) - +(modes[a.key] ?? a.on)) || b.used - a.used
      : b.used - a.used);
    const limit = st.skLimit16 || 50;
    const count = (kind) => all.filter((k) => kind === "all" || k.kind === kind).length;
    v.skTotal16 = all.length;
    v.skTabs16 = [["all", "All", "layers"], ["personal", "Personal", "user"], ["workspace", "Workspace", "users"], ["plugin", "From plugins", "plug"]]
      .map(([k, label, icon]) => ({
        key: k, label, icon: "i15.svg#" + icon, count: count(k), cls: skTab === k ? "active" : "",
        open: () => this.setState({ skTab16: k, skSrc16: "", skLimit16: 50 }),
      }));
    v.skQ16 = st.skQ16 || "";
    v.skEdit16 = (e) => this.setState({ skQ16: e.target.value, skLimit16: 50 });
    v.skSourceLabel16 = skSrc || "Every source";
    v.skSourceMenu16 = (e) => this.skillMenu16(e, [{ label: "Every source", on: !skSrc, run: () => this.setState({ skSrc16: "", skLimit16: 50 }) }]
      .concat(["Personal", "Workspace"].concat(Component.SKILL_PLUGINS16.map((p) => p[0])).map((s) => ({
        label: s, on: skSrc === s, hint: all.filter((k) => k.source === s).length + " skills",
        run: () => this.setState({ skSrc16: s, skTab16: "all", skLimit16: 50 }),
      }))), "Source");
    const SORTS16 = [["used", "Most used"], ["az", "A to Z"], ["on", "On first"]];
    v.skSortLabel16 = (SORTS16.find((s) => s[0] === skSort) || SORTS16[0])[1];
    v.skSortMenu16 = (e) => this.skillMenu16(e, SORTS16.map(([k, label]) => ({
      label, on: skSort === k, run: () => this.setState({ skSort16: k }),
    })), "Sort");
    v.skRows16 = shown.slice(0, limit).map((k) => {
      const on = modes[k.key] == null ? k.on : !!modes[k.key];
      return {
        ...k, hasLogo: !!k.logo, on,
        used: k.used ? k.used + (k.used === 1 ? " run" : " runs") : "Not yet",
        mode: on ? "On" : "Off", modeCls: on ? "on" : "",
        modeAria: (on ? "Turn off " : "Turn on ") + k.name,
        toggle: () => this.setState((s) => ({ skMode16: Object.assign({}, s.skMode16, { [k.key]: !on }) })),
        open: k.open || (() => this.generic(k.name, k.source + " skill \u00b7 " + (on ? "on" : "off"), [], {
          genericText: k.copy, genericActionLabel: "Done", genericAction: () => this.setState({ dialog: null }),
        })),
      };
    });
    v.skEmpty16 = !shown.length;
    v.skHasMore16 = shown.length > limit;
    v.skShowing16 = shown.length
      ? "Showing " + Math.min(limit, shown.length) + " of " + shown.length + (skq || skSrc || skTab !== "all" ? " matching" : "") + " skills"
      : "";
    v.skMore16 = () => this.setState((s) => ({ skLimit16: (s.skLimit16 || 50) + 50 }));

    // --- A role, built from named groups and a live summary.
    const rd = st.roleDraft14;
    const perms = this.data14 ? this.data14.permissions : [];
    const has = (id) => !!rd && rd.perms.indexOf(id) >= 0;
    const GROUPS16 = [
      ["Work", "Reading and doing the work itself.", ["work.read", "work.write"]],
      ["Setup", "Repositories, workflows and the tools they use.", ["repos.write", "workflow.write", "integrations.write"]],
      ["Workspace", "People, money and the workspace itself.", ["members.write", "billing.write", "workspace.transfer"]],
    ];
    v.rolePermGroups16 = GROUPS16.map(([title, copy, ids]) => {
      const rows = ids.map((id) => perms.find((p) => p.id === id)).filter(Boolean).map((p) => ({
        key: p.id, title: p.title, copy: p.copy, locked: !!p.ownerOnly,
        on: has(p.id) && !p.ownerOnly, swCls: has(p.id) && !p.ownerOnly ? "on" : "",
        cls: p.ownerOnly ? "locked16" : has(p.id) ? "granted16" : "",
        toggle: () => this.toggleRolePerm14(p.id),
      }));
      const n = rows.filter((r) => r.on).length;
      const m = rows.filter((r) => !r.locked).length;
      return { key: title, title, copy, rows, count: n + " of " + m };
    });
    const grantable = perms.filter((p) => !p.ownerOnly);
    const granted = grantable.filter((p) => has(p.id));
    v.rolePresets16 = (this.data14 ? this.data14.roles : []).filter((r) => !r.custom && r.id !== "owner").map((r) => {
      const set = r.perms.filter((id) => grantable.some((p) => p.id === id));
      const same = !!draft && set.length === granted.length && set.every((id) => has(id));
      return {
        key: r.id, name: r.name, icon: "i15.svg#" + (r.id === "admin" ? "shield-check" : r.id === "member" ? "user-check" : "eye"),
        count: set.length + (set.length === 1 ? " permission" : " permissions"), cls: same ? "on" : "",
        pick: () => this.setState((s) => ({
          roleDraft14: Object.assign({ id: "", name: "", custom: true, usage: "0 members" }, s.roleDraft14, { perms: set.slice() }),
          roleError14: "",
        })),
      };
    });
    v.roleSideName16 = (rd && rd.name.trim()) || "Untitled role";
    v.roleSideCount16 = granted.length + " of " + grantable.length + " permissions";
    v.roleSideTone16 = granted.length === 0 ? "" : granted.length === grantable.length ? "full16" : "part16";

    // --- Back goes one level up: a repository returns to the list.
    const inRepo = !!(v.repoDetail16 && v.reposSettings14);
    v.settingsBackLabel16 = inRepo ? "Repositories" : "Settings";
    v.settingsBackAction16 = inRepo ? v.repoBack16 : v.settingsHomeAction7;
    if (inRepo) v.settingsDescription = "Connection, sandbox startup and environment variables for this repository.";

    // --- Sign-in marks are the provider's own.
    const PF_MARK16 = { google: { glyph: "G" }, github: { logo: "assets/brands-v12/github.svg" } };
    v.pfMethodRows16 = (v.pfMethodRows16 || []).map((r) => {
      const m = PF_MARK16[r.key] || {};
      return { ...r, hasLogo16: !!m.logo, logo16: m.logo || "", hasGlyph16: !!m.glyph, glyph16: m.glyph || "",
        hasIcon16: !m.logo && !m.glyph };
    });
    v.pfPasskeyRows16 = (v.pfPasskeyRows16 || []).map((r) => ({
      ...r, icon16: "i15.svg#" + (r.key === "mac" ? "monitor" : "key-round"),
    }));

    // --- Routine: pause is a state, the tabs are the page's, the form has sections.
    const isPaused = v.autoPauseLabel9 === "Resume autopilot";
    v.rtPauseIcon16 = isPaused ? "i15.svg#play" : "i15.svg#pause";
    v.rtPauseLabel16 = isPaused ? "Resume" : "Pause";
    v.rtTabs16 = (v.rtTabs16 || []).map((t) => ({ ...t, on: !!t.cls }));
    for (const key of ["autoFormTitle9", "autoFormCopy9", "autoPauseLabel9"]) {
      if (typeof v[key] === "string") v[key] = replaceAll16(replaceAll16(v[key], "autopilot", "routine"), "Autopilot", "Routine");
    }
    v.afShowTemplates16 = !/edit/i.test(v.autoFormTitle9 || "");
    v.afWhenNote16 = v.autoIsTimed9 ? (v.autoDraftNext9 ? "Next " + v.autoDraftNext9 : "") : v.autoIsEvent9 ? "Runs when the event arrives" : "";
    // Two pages of set-up, then the review. Instructions are a document, written or previewed.
    if (v.autopilotForm10) {
      const setup = !!v.autoFormSetup9;
      const page = setup ? (st.afPage16 || "what") : "review";
      const draftAuto = st.autoDraft9 || {};
      const formId = st.autoEditing9 || "routine";
      const savedInstr = (st.rtInstrBy16 || {})[formId];
      const baseInstr = savedInstr || (st.autoEditing9
        ? this.instr16({ autoTrigger9: draftAuto.kind === "schedule" ? "Weekdays at " + (draftAuto.time || "09:00") : "GitHub", autoScope9: draftAuto.scope || "", autoPrompt9: draftAuto.prompt || "" })
        : (draftAuto.prompt || ""));
      const instr = st.afInstr16 == null ? baseInstr : st.afInstr16;
      const words = instr.trim().split(/\s+/).filter(Boolean).length;
      v.afPageWhat16 = page === "what";
      v.afPageWhen16 = page === "when";
      v.afStepLabel16 = page === "what" ? "1 / INSTRUCTIONS" : page === "when" ? "2 / TRIGGER, REPOSITORY AND LIMITS" : "3 / REVIEW";
      v.autoFormTitle9 = page === "review" ? "Check this routine" : st.autoEditing9 ? "Edit routine" : "New routine";
      v.afSteps16 = [["what", "Instructions"], ["when", "Trigger and limits"], ["review", "Review"]].map(([k, label], i) => ({
        key: k, n: String(i + 1), label,
        cls: page === k ? "on" : (["what", "when", "review"].indexOf(k) < ["what", "when", "review"].indexOf(page) ? "done" : ""),
        disabled: k === "review" && page !== "review",
        go: () => { if (k === "review") return; this.setState({ afPage16: k, autoFormStep9: "setup" }); },
      }));
      const commitInstr = () => {
        const first = instr.split("\n").map((l) => l.trim()).filter((l) => l && !/^#/.test(l) && !/^```/.test(l))[0] || "";
        this.setState((s) => ({
          rtInstrBy16: Object.assign({}, s.rtInstrBy16, { [formId]: instr }),
          autoDraft9: Object.assign({}, s.autoDraft9, { prompt: first || s.autoDraft9?.prompt || instr.slice(0, 140) }),
        }));
      };
      v.afInstr16 = instr;
      v.afEditInstr16 = (e) => this.setState({ afInstr16: e.target.value });
      v.afInstrCount16 = words + (words === 1 ? " word" : " words");
      v.afInstrFirst16 = instr.split("\n").map((l) => l.trim()).filter((l) => l && !/^#/.test(l))[0] || "";
      v.afBlocks16 = this.md16(instr);
      v.afWriting16 = (st.afMode16 || "write") === "write";
      v.afWriteCls16 = v.afWriting16 ? "on" : "";
      v.afPreviewCls16 = v.afWriting16 ? "" : "on";
      v.afWrite16 = () => this.setState({ afMode16: "write" });
      v.afPreview16 = () => this.setState({ afMode16: "preview" });
      const kind = draftAuto.kind || "schedule";
      v.afIsManual16 = kind === "api";
      v.afKinds16 = [
        ["schedule", "calendar-clock", "On a schedule", "Every weekday, daily or weekly at a set time."],
        ["webhook", "zap", "When an event arrives", "A plugin sends an event that matches a filter."],
        ["api", "hand", "Only when asked", "Run now, or through the API."],
      ].map(([k, icon, title, copy]) => ({
        key: k, icon: "i15.svg#" + icon, title, copy, on: kind === k, cls: kind === k ? "on" : "",
        pick: () => this.setState((s) => ({ autoDraft9: Object.assign({}, s.autoDraft9, { kind: k }) })),
      }));
      const repoNow = /^[\w.-]+\/[\w.-]+$/.test(draftAuto.repo16 || draftAuto.scope || "") ? (draftAuto.repo16 || draftAuto.scope) : (draftAuto.repo16 || "");
      v.afRepoLabel16 = repoNow || "No repository";
      v.afRepoMenu16 = (e) => this.openMenu14(null, e, [{ head: "Repository" }].concat(
        ["botinc/app", "botinc/marketing", "botinc/infra", "botinc/daemon"].map((r) => ({
          label: r, on: repoNow === r, icon: this.icon14("folder-git-2"),
          run: () => this.setState((s) => ({ autoDraft9: Object.assign({}, s.autoDraft9, { repo16: r, scope: s.autoDraft9?.scope || r }) })),
        })), [{ label: "No repository", hint: "Read only", on: !repoNow, icon: this.icon14("ban"),
          run: () => this.setState((s) => ({ autoDraft9: Object.assign({}, s.autoDraft9, { repo16: "" }) })) }]), "", { kind: "afRepo", cls: "menu-rich15" });
      v.afBackLabel16 = page === "what" ? "Cancel" : "Back";
      v.afBack16 = () => page === "what" ? this.setState({ dialog: null })
        : page === "when" ? this.setState({ afPage16: "what" })
        : this.setState({ autoFormStep9: "setup", afPage16: "when" });
      v.afNextLabel16 = page === "what" ? "Trigger and limits" : page === "when" ? "Review" : (v.autoFormNextLabel9 || "Save");
      v.afNext16 = () => {
        if (page === "what") {
          if (!String(draftAuto.title || "").trim()) { this.setState({ autoFormError9: "Give the routine a name." }); return; }
          if (!instr.trim()) { this.setState({ autoFormError9: "Write what the routine should do." }); return; }
          commitInstr(); this.setState({ afPage16: "when", autoFormError9: "" }); return;
        }
        commitInstr();
        if (v.autoFormNext9) v.autoFormNext9();
      };
    }

    // --- Instructions read as a document and are edited in place.
    if (st.view === "auto9") {
      const text = this.instr16(v);
      const blocks = this.md16(text);
      const words = text.trim().split(/\s+/).length;
      const editing = !!st.rtEditing16;
      const open = !!st.rtInstrOpen16;
      v.rtInstrBlocks16 = blocks;
      v.rtInstrMeta16 = words + " words \u00b7 Markdown" + ((st.rtInstrBy16 || {})[st.activeAuto9] ? " \u00b7 edited by you" : "");
      v.rtInstrLong16 = blocks.length > 8 && !editing;
      v.rtInstrClamp16 = v.rtInstrLong16 && !open ? "clamped16" : "";
      v.rtInstrToggle16 = () => this.setState((s) => ({ rtInstrOpen16: !s.rtInstrOpen16 }));
      v.rtInstrToggleLabel16 = open ? "Show less" : "Read all";
      v.rtInstrToggleIcon16 = open ? "i15.svg#chevron-up" : "i15.svg#chevron-down";
      v.rtEditing16 = editing;
      v.rtDraft16 = editing ? (st.rtDraft16 ?? text) : text;
      v.rtDraftCount16 = String(v.rtDraft16 || "").trim().split(/\s+/).filter(Boolean).length + " words";
      v.rtEditStart16 = () => {
        this.setState({ rtEditing16: true, rtDraft16: text, rtInstrOpen16: true });
        setTimeout(() => { const el = document.querySelector(".rt-instredit16"); if (el) el.focus(); }, 160);
      };
      v.rtEditDraft16 = (e) => this.setState({ rtDraft16: e.target.value });
      v.rtEditCancel16 = () => this.setState({ rtEditing16: false });
      v.rtEditSave16 = () => {
        const next = String(st.rtDraft16 ?? text);
        this.setState((s) => ({ rtEditing16: false, rtInstrBy16: Object.assign({}, s.rtInstrBy16, { [s.activeAuto9 || "routine"]: next }) }));
        this.toast("Instructions saved. Future runs use this version.");
      };
    }

    // --- The file viewer: one file at a time, the rest a step away.
    const fvFiles = st.fvFiles16 || [];
    v.fileViewDialog16 = st.dialog === "fileView16" && fvFiles.length > 0;
    if (v.fileViewDialog16) {
      v.dialogOpen = true;
      v.modalClass = String(v.modalClass || "modal") + " wide fv-modal16";
      const ix = Math.max(0, Math.min(fvFiles.length - 1, st.fvIndex16 || 0));
      const f = fvFiles[ix];
      const KIND16 = { md: "md", markdown: "md", patch: "diff", diff: "diff", log: "text", txt: "text", json: "text", ts: "text", tsx: "text", js: "text", css: "text", yml: "text", yaml: "text", sh: "text", pdf: "pdf", png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image" };
      const ext = String(f.name).split(".").pop().toLowerCase();
      const kind = f.kind16 || KIND16[ext] || "text";
      const ICON16 = { md: "file-text", diff: "file-code", text: "file-code", pdf: "receipt", image: "image" };
      v.fvIsImage16 = kind === "image"; v.fvUrl16 = f.url || "";
      v.fvName16 = f.name; v.fvMeta16 = f.meta || ""; v.fvKind16 = kind;
      v.fvIcon16 = "i15.svg#" + (f.icon || ICON16[kind]);
      v.fvIsMd16 = kind === "md"; v.fvIsDiff16 = kind === "diff"; v.fvIsText16 = kind === "text"; v.fvIsPdf16 = kind === "pdf";
      v.fvBlocks16 = kind === "md" || kind === "pdf" ? this.md16(f.body) : [];
      v.fvPages16 = f.pages || 3;
      let n = 0;
      v.fvLines16 = String(f.body || "").split("\n").map((t, i) => {
        const c = t.charAt(0); const meta = /^(@@|diff |index |\+\+\+|---)/.test(t);
        const add = kind === "diff" && !meta && c === "+"; const del = kind === "diff" && !meta && c === "-";
        if (!del) n += 1;
        return { key: i, cls: meta ? "meta16" : add ? "add16" : del ? "del16" : "ctx16", sign: add ? "+" : del ? "\u2212" : "",
          n: meta || del ? "" : String(n), text: kind === "diff" && (add || del) ? t.slice(1) : t };
      });
      v.fvIndex16 = ix + 1; v.fvTotal16 = fvFiles.length;
      v.fvFirst16 = ix === 0; v.fvLast16 = ix === fvFiles.length - 1;
      v.fvPrev16 = () => this.fvGo16(-1); v.fvNext16 = () => this.fvGo16(1);
      v.fvKey16 = (e) => { if (e.key === "ArrowLeft") this.fvGo16(-1); else if (e.key === "ArrowRight") this.fvGo16(1); };
      v.fvStrip16 = fvFiles.map((s, i) => ({
        key: i, name: s.name, icon: "i15.svg#" + (s.icon || ICON16[s.kind16 || KIND16[String(s.name).split(".").pop().toLowerCase()] || "text"]),
        cls: i === ix ? "on" : "", pick: () => this.setState({ fvIndex16: i }),
      }));
      v.fvAttach16 = () => { this.setState({ dialog: null }); this.toast(f.name + " added to the conversation."); };
      v.fvDownload16 = () => this.toast("Downloading " + f.name + "\u2026");
    }

    // --- Every file and receipt in the app opens in the same viewer, siblings a step away.
    const openSet = (files, i) => this.setState({ dialog: "fileView16", fvFiles16: files, fvIndex16: i });
    const asFile = (f) => ({ name: f.name, meta: f.meta || [f.kind, f.stats].filter(Boolean).join(" \u00b7 "), body: f.body || "",
      kind16: /changed file|diff/i.test(f.kind || "") || /^[+-][^+-]/m.test(f.body || "") ? "diff" : undefined });
    const convFiles = [].concat(v.sourceFiles13 || [], v.fileRows13 || []).map(asFile);
    for (const key of ["sourceFiles13", "fileRows13", "peekSources13"]) {
      if (Array.isArray(v[key])) v[key] = v[key].map((f) => {
        const at = convFiles.findIndex((x) => x.name === f.name);
        return at < 0 ? f : { ...f, open: () => openSet(convFiles, at) };
      });
    }
    const attachSet = (list) => list.map((a) => a.image
      ? { name: a.name, meta: "Image" + (a.size ? " \u00b7 " + Math.round(a.size / 1024) + " KB" : ""), url: a.url, kind16: "image", body: "" }
      : { name: a.name, meta: a.meta || "Attachment", body: a.body || a.preview || (a.name + "\n\nAttached to this conversation."), url: a.url });
    for (const key of ["messages", "autoMessages10", "teamMessages"]) {
      if (Array.isArray(v[key])) v[key] = v[key].map((m) => !Array.isArray(m.attachments11) || !m.attachments11.length ? m : {
        ...m, attachments11: m.attachments11.map((a, i) => ({ ...a, open: () => openSet(attachSet(m.attachments11), i) })),
      });
    }
    const receipt = (g) => {
      const kind = g.kind === "invoice" ? "Invoice" : g.kind === "credit" ? "Credit note" : "Usage receipt";
      const id = g.id || (g.meta || "").match(/[A-Z]{2,5}-\d{3,}/) || "";
      return { name: (kind.toLowerCase().replace(/\s+/g, "-")) + "-" + String(id || g.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".pdf",
        meta: "PDF \u00b7 1 page \u00b7 " + (g.meta || ""), pages: 1, kind16: "pdf",
        body: "# " + kind + "\n\nBotInc \u00b7 " + (g.meta || "") + "\n\n## " + g.title + "\n\n- Amount: **" + g.amount + "**\n- Status: " + (g.state || (g.kind === "credit" ? "Granted" : "Settled")) + "\n- Billed to: Alex \u00b7 alejandro.rosas@didit.me\n\n---\n\nIncluded monthly credit is granted with the subscription and expires at the next refresh. Purchased credit is billed separately and carries forward. Provider subscription quota is never billed here.\n\nSample record. No live transaction." };
    };
    if (Array.isArray(v.ledgerRows)) {
      const set = v.ledgerRows.map(receipt);
      v.ledgerRows = v.ledgerRows.map((r, i) => ({ ...r, open: () => openSet(set, i) }));
    }
    if (Array.isArray(v.invoiceRows14)) {
      const set = v.invoiceRows14.map((r) => receipt({ ...r, kind: "invoice" }));
      v.invoiceRows14 = v.invoiceRows14.map((r, i) => ({ ...r, open: () => openSet(set, i) }));
    }

    // --- The editor's side tabs carry the Work rail's glyphs.
    if (Array.isArray(v.graphSideTabs14)) {
      const GI = { step: "square", checks: "shield-check", test: "play", versions: "history" };
      v.graphSideTabs14 = v.graphSideTabs14.map((t) => ({ ...t, icon16: "i15.svg#" + (GI[String(t.label || "").toLowerCase()] || "circle") }));
    }

    // --- General settings carry the Operator preferences.
    if (v.generalSettings14) v.settingsDescription = "How Operator works with you, appearance, notifications and shortcuts.";

    // --- A routine run opens as its own record in the inspector.
    const vr = st.viewedRun10;
    const rrOpen = st.view === "auto9" && !!vr && !!st.inspector10;
    v.routineRunPane16 = rrOpen;
    if (rrOpen) {
      // Closing the pane also closes the record, so the next open starts clean.
      const closeRun = v.collapsePane11;
      v.collapsePane11 = () => { this.setState({ viewedRun10: null }); if (closeRun) closeRun(); };
      v.conversationPane12 = false; v.filesPane12 = false; v.usagePane12 = false;
      v.outputPane12 = false; v.activityPane12 = false; v.runsPane12 = false; v.issuePane12 = false; v.prListOpen16 = false;
      v.inspectorScope10 = "Routine";
      const rrTab = st.rrTab16 || "run";
      v.inspectorTabs12 = [["run", "Overview"], ["conversation", "Run"], ["files", "Files"], ["usage", "Usage"]].map(([k, label]) => ({
        label, cls: rrTab === k ? "selected" : "", pick: () => this.setState({ rrTab16: k }),
      }));
      v.rrRunTab16 = rrTab === "run";
      v.rrFilesTab16 = rrTab === "files";
      v.rrUsageTab16 = rrTab === "usage";
      const runsAll = v.autopilotRuns10 || [];
      const idx = runsAll.findIndex((r) => r.title === vr.label && r.when === vr.when);
      v.rrNumber16 = "#" + (idx >= 0 ? runsAll.length - idx : runsAll.length);
      const status = String(vr.state || "").toLowerCase();
      const t = RT16[status] || RT16.done;
      const issueId = (String(vr.detail || "").match(/\b[A-Z]{2,5}-\d+\b/) || [])[0] || "";
      const src = v.autoTrigger9 || "";
      const skipped = status === "skipped", failed = status === "failed", queued = status === "queued";
      const timed = /\bat\s+\d{1,2}:\d{2}\b|weekday|daily|weekly|every/i.test(src);
      const at = (src.match(/\b(\d{1,2}:\d{2})\b/) || [])[1] || "09:00";
      const at2 = at.replace(/^(\d{1,2}):(\d{2})$/, (m, hh, mm) => hh + ":" + String((+mm + 1) % 60).padStart(2, "0"));
      const filterRaw = timed ? "" : (src.split(" \u00b7 ").slice(1).join(" \u00b7 ") || "");
      const filter = /\//.test(filterRaw) && !/label|issue|pull|event|#/i.test(filterRaw) ? "" : filterRaw;
      v.rrRoutine16 = v.autoTitle9 || "Routine";
      v.rrTitle16 = vr.label || "Run";
      v.rrWhen16 = vr.when || "";
      v.rrState16 = t[2];
      v.rrTone16 = t[1];
      v.rrIcon16 = "i15.svg#" + t[0];
      v.rrDetail16 = vr.detail || "";
      v.rrFacts16 = [
        { key: "trigger", k: "Trigger", v: src.split(" \u00b7 ")[0] || "Schedule" },
        { key: "dur", k: "Duration", v: skipped ? "0s" : queued ? "\u2014" : failed ? "1m 08s" : "2m 41s" },
        { key: "cost", k: "Cost", v: skipped || queued ? "$0.00" : failed ? "$0.09" : "$0.31" },
        { key: "model", k: "Model", v: skipped || queued ? "\u2014" : "Claude Sonnet 5" },
      ];
      const steps = skipped ? [
        ["circle-check", "st-done16", "Trigger fired", src, "10:00:00"],
        ["circle-alert", "st-blocked16", "Connection check failed", "Gmail token expired on Sep 8. Nothing was read.", "10:00:01"],
        ["skip-forward", "st-paused16", "Run skipped", "No messages read or sent. The routine keeps its schedule.", "10:00:01"],
      ] : queued ? [
        ["circle-check", "st-done16", "Trigger fired", src, vr.when],
        ["clock", "st-todo16", "Waiting for a sandbox", "Two runs ahead in the queue.", ""],
      ] : failed ? [
        ["circle-check", "st-done16", "Trigger fired", src, "09:41:02"],
        ["circle-check", "st-done16", "Read the source", "Operator read the event and its context.", "09:41:04"],
        ["circle-alert", "st-blocked16", "Run failed", vr.detail || "The sandbox returned an error.", "09:42:10"],
      ] : timed ? [
        ["circle-check", "st-done16", "Scheduled run started", src, at + ":00"],
        ["circle-check", "st-done16", "Read your open work", (v.autoScope9 || "Your work in BotInc") + " \u00b7 6 issues, 3 need you", at + ":07"],
        ["circle-check", "st-done16", "Wrote the brief", "Claude Sonnet 5 \u00b7 what moved, what needs a decision, what is next", at + ":52"],
        ["circle-check", "st-done16", "Posted to this conversation", "3 decisions highlighted for " + (v.autoOwner9 || "you") + ".", at2 + ":04"],
      ] : issueId ? [
        ["circle-check", "st-done16", "Event received", src, "09:41:02"],
        ...(filter ? [["circle-check", "st-done16", "Matched the filter", filter, "09:41:02"]] : []),
        ["circle-check", "st-done16", "Read the issue", "Reproduced the report and checked recent commits on main.", "09:41:14"],
        ["circle-check", "st-done16", "Prepared the fix plan", "hephaestus \u00b7 Claude Sonnet 5 \u00b7 3 files in scope", "09:42:51"],
        ["circle-check", "st-done16", "Created " + issueId, "Work \u00b7 " + (v.autoOwner9 || "you") + " approves before anything merges.", "09:43:43"],
      ] : [
        ["circle-check", "st-done16", "Event received", src, "09:41:02"],
        ...(filter ? [["circle-check", "st-done16", "Matched the filter", filter, "09:41:02"]] : []),
        ["circle-check", "st-done16", "Did the work", "Claude Sonnet 5 \u00b7 read the event and acted within " + (v.autoScope9 || "the allowed scope") + ".", "09:42:10"],
        ["circle-check", "st-done16", "Posted the result", "Result posted to this conversation.", "09:42:38"],
      ];
      v.rrSteps16 = steps.map(([icon, tone, title, copy, at], i) => ({ key: i, icon: "i15.svg#" + icon, tone, title, copy, at }));
      v.rrHasOutput16 = !queued;
      v.rrOutputTitle16 = skipped || failed ? "What the Operator reported" : "What the Operator posted";
      v.rrOutput16 = skipped
        ? "I could not reach Gmail because its connection expired. I did not read or send anything. Reconnect it and I will pick up the next scheduled run."
        : failed ? "The run stopped before a result. I kept the logs; nothing was changed in the repository."
        : timed ? "Good morning. Six issues are open; three need you: BOT-241 wants an approval, BOT-250 has a review asking for changes, and the receipt pipeline is blocked on a Gmail reconnect. Everything else is moving."
        : issueId ? "A labeled issue arrived and matched this routine. I reproduced it, scoped the fix to the call-switching path and opened " + issueId + " for your approval. Nothing merges until you say so."
        : "Done. The result is in this conversation.";
      v.rrFacts16[0].v = timed ? "Schedule" : v.rrFacts16[0].v;
      v.rrHasIssue16 = !!issueId;
      v.rrIssue16 = issueId;
      v.rrOpenIssue16 = () => this.openIssue && this.openIssue(issueId);
      v.rrCanRetry16 = skipped || failed;
      v.rrRetryLabel16 = skipped ? "Reconnect and retry" : "Retry run";
      v.rrRetry16 = () => skipped ? (v.fixAutopilot10 && v.fixAutopilot10()) : (v.runAutopilot9 && v.runAutopilot9());
      v.rrAsk16 = () => this.askOperator16("About the run \u201c" + (vr.label || "") + "\u201d " + (vr.when || "") + ": what did you do, and why?", ["Show me the log", "Why this outcome?", "Run it again"]);
      v.rrFoot16 = "Recorded activity of this routine. Nothing here runs again unless you ask.";
      // Files the run left behind — opened in the viewer, with the others one step away.
      const files = skipped || queued ? [] : failed ? [
        { name: "run.log", icon: "terminal", meta: "Log \u00b7 14 KB", body: "09:41:02 trigger received\n09:41:04 context loaded\n09:41:05 sandbox ubuntu-24.04 started\n09:42:10 sandbox exited 137 (out of memory)\n09:42:10 run failed" },
      ] : timed ? [
        { name: "brief.md", icon: "file-text", meta: "Markdown \u00b7 2.1 KB \u00b7 posted to this conversation", body: "# Morning brief\n\n## Needs you (3)\n\n- **BOT-241** \u2014 approve the voice fix. Checks pass, athena approved.\n- **BOT-250** \u2014 review asked for changes on the receipt parser.\n- **Receipts** \u2014 Gmail needs reconnecting; the 10:00 routine skipped.\n\n## Moving (3)\n\n- BOT-242 draft recovery \u2014 hephaestus is on the second attempt.\n- BOT-244, BOT-246 \u2014 in review.\n\n## Watch\n\n- Claude subscription at 78% of the 5-hour window." },
        { name: "sources.json", icon: "file-code", meta: "JSON \u00b7 what the brief read", body: "{\n  \"issues\": 6,\n  \"comments_since\": \"2026-09-10T09:00:00Z\",\n  \"routines_skipped\": [\"ap-inbox\"]\n}" },
      ] : issueId ? [
        { name: "plan.md", icon: "file-text", meta: "Markdown \u00b7 1.4 KB \u00b7 attached to " + issueId, body: "# Fix plan \u2014 " + issueId + "\n\n## What is wrong\n\nSwitching workspaces during a call tears down the voice session because the provider client is re-created with the workspace context.\n\n## Change\n\n1. Keep the voice session alive across workspace switches.\n2. Re-bind the session to the new workspace instead of ending it.\n3. Add a regression test for the switch.\n\n## Not changing\n\n- Billing, auth, migrations.\n\n## Risk\n\nLow. Three files, one behaviour." },
        { name: "voice-switch.patch", icon: "file-code", meta: "Diff \u00b7 3 files \u00b7 +48 \u221212", body: "diff --git a/apps/web/voice/session.ts b/apps/web/voice/session.ts\n@@ -41,7 +41,9 @@ export function onWorkspaceChange(next) {\n   const session = current();\n-  session.end();\n-  start(next);\n+  if (!session.keepAlive) session.end();\n+  else session.rebind(next);\n+  if (!session.keepAlive) start(next);\n }\ndiff --git a/apps/web/voice/session.test.ts b/apps/web/voice/session.test.ts\n@@ -0,0 +1,6 @@\n+test('keeps the call across a workspace switch', async () => {\n+  const s = await startCall();\n+  switchWorkspace('didit-labs');\n+  expect(s.state).toBe('live');\n+});" },
        { name: "repro.log", icon: "terminal", meta: "Log \u00b7 6 KB", body: "> pnpm test voice\n\n RUN  apps/web/voice/session.test.ts\n \u2713 keeps the call across a workspace switch (1.2s)\n \u2713 ends the call on sign-out (0.3s)\n\n Tests  2 passed (2)\n Duration  1.9s" },
        { name: "issue-412-export.pdf", icon: "file-text", meta: "PDF \u00b7 3 pages \u00b7 the GitHub issue as received", pages: 3, body: "# botinc/app #412 \u2014 Voice call fails when switching workspaces\n\nOpened by mgarcia \u00b7 labeled botinc\n\n## Steps\n\n1. Start a call.\n2. Switch to another workspace.\n3. The call drops.\n\n## Expected\n\nThe call continues." },
      ] : [
        { name: "result.md", icon: "file-text", meta: "Markdown \u00b7 posted to this conversation", body: "# Result\n\n" + (vr.detail || "") },
      ];
      const openViewer = (i) => () => this.setState({ dialog: "fileView16", fvFiles16: files, fvIndex16: i });
      v.rrFiles16 = files.map((f, i) => ({ key: i, name: f.name, meta: f.meta, icon: "i15.svg#" + f.icon, open: openViewer(i) }));
      v.rrNoFiles16 = !files.length;
      v.rrFilesNote16 = files.length ? files.length + (files.length === 1 ? " file" : " files") + " produced by this run. Open one and step through the rest." : "";
      // The issues this run opened.
      const known = this.state.issues || [];
      const ids = Array.from(new Set(String(vr.detail || "").match(/\b[A-Z]{2,5}-\d+\b/g) || []));
      const made = ids.length && !timed ? ids.map((id) => ({ id, title: (known.find((x) => x.id === id) || {}).title || String(vr.detail || "").split(" \u00b7 ").slice(1).join(" \u00b7 "), sample: !known.some((x) => x.id === id) }))
        .concat(issueId === "BOT-241" ? [{ id: "BOT-243", title: "Regression test for workspace switch", sample: !known.some((x) => x.id === "BOT-243") }] : []) : [];
      v.rrHasIssues16 = made.length > 0;
      v.rrIssuesLabel16 = made.length === 1 ? "1 issue created" : made.length + " issues created";
      v.rrIssues16 = made.map((m) => {
        const hit = known.find((x) => x.id === m.id);
        const state = hit ? hit.status : "Todo";
        return { key: m.id, id: m.id, title: m.title, state, tone: this.statusTone16(state),
          open: () => m.sample ? this.toast(m.id + " is a sample in this design.") : this.openIssue(m.id) };
      });
      // The conversation the run had, tool calls included.
      const say = (who, at, text, avatar) => ({ key: who + at + text.length, isSay: true, who, at, text, hasAvatar: !!avatar, avatar: avatar || "", initial: who.charAt(0), cls: avatar ? "" : "rr-human16" });
      const tool = (icon, tone, title, code, copy, at) => ({ key: title + at, isTool: true, icon: "i15.svg#" + icon, tone, title, code, hasCode: !!code, copy, at });
      const OP = "assets/agents/operator.svg";
      v.rrConv16 = skipped ? [
        tool("zap", "st-done16", "Trigger fired", "", src, "10:00:00"),
        tool("plug", "st-blocked16", "Connect Gmail", "gmail.auth.refresh", "401 \u00b7 token expired Sep 8", "10:00:01"),
        say("Operator", "10:00:01", "I could not reach Gmail because its connection expired. I did not read or send anything. Reconnect it and I will pick up the next scheduled run.", OP),
      ] : queued ? [tool("clock", "st-todo16", "Queued", "", "Two runs ahead. Nothing has started.", vr.when)]
      : failed ? [
        tool("zap", "st-done16", "Trigger fired", "", src, "09:41:02"),
        tool("terminal", "st-done16", "Sandbox started", "ubuntu-24.04 \u00b7 2 vCPU", "", "09:41:05"),
        tool("circle-alert", "st-blocked16", "Sandbox exited 137", "pnpm install", "Out of memory during install", "09:42:10"),
        say("Operator", "09:42:10", "The run stopped before a result. I kept the logs; nothing was changed in the repository.", OP),
      ] : timed ? [
        tool("calendar-clock", "st-done16", "Scheduled run started", "", src, at + ":00"),
        tool("inbox", "st-done16", "Read open work", "issues.list scope=" + (v.autoScope9 || "mine"), "6 issues \u00b7 14 comments since yesterday", at + ":07"),
        tool("history", "st-done16", "Read overnight routines", "routines.status", "1 skipped \u00b7 ap-inbox", at + ":09"),
        say("Operator", at + ":52", "Good morning. Six issues are open; three need you: BOT-241 wants an approval, BOT-250 has a review asking for changes, and the receipt pipeline is blocked on a Gmail reconnect. Everything else is moving.", OP),
        tool("file-text", "st-done16", "Posted brief.md", "", "To this conversation", at2 + ":04"),
      ] : [
        tool("zap", "st-done16", "Event received", "issues.labeled", src, "09:41:02"),
        tool("book-open", "st-done16", "Read the issue", "github.issues.get #412", "Title, 3 comments, no linked PR", "09:41:06"),
        say("Operator", "09:41:14", "The report is reproducible: switching workspaces mid-call tears down the voice session. I will keep the session alive and re-bind it, add a regression test, and open work for your approval.", OP),
        tool("terminal", "st-done16", "Reproduced in a sandbox", "pnpm test voice --filter switch", "1 failing \u00b7 as reported", "09:41:40"),
        tool("file-code", "st-done16", "Edited 3 files", "apps/web/voice/session.ts +2", "session.ts, session.test.ts, index.ts", "09:42:31"),
        tool("terminal", "st-done16", "Ran the suite", "pnpm test", "2 passed", "09:42:51"),
        say("athena", "09:43:20", "Independent review: the change is scoped to the session lifecycle. Approving with one note \u2014 the sign-out path still ends the call, which is correct.", "assets/pantheon/athena.webp"),
        say("Operator", "09:43:43", "Opened " + issueId + " with the plan, the diff and the test output. Nothing merges until you approve it.", OP),
        tool("list-todo", "st-done16", "Created " + issueId, "", "Work \u00b7 waiting for approval", "09:43:43"),
      ];
      v.rrConvNote16 = "Everything the Operator said and did in this run, in order.";
      v.rrConvTab16 = rrTab === "conversation";
      // The same thread component the issue runs use: says, folded tool groups, a result.
      const groupsOpen = st.rrGroups16 || {};
      const entries = [];
      let bucket = null;
      const closeBucket = () => { if (bucket) { entries.push(bucket); bucket = null; } };
      v.rrConv16.forEach((c, i) => {
        if (c.isTool) {
          if (!bucket) {
            const gid = "g" + i;
            const isOpen = groupsOpen[gid] !== undefined ? !!groupsOpen[gid] : i === 0;
            bucket = { key: gid, isTools: true, cls: "tools16", gid, open: isOpen, rows: [], time: c.at, icon: c.icon,
              toggle: () => this.setState((s) => ({ rrGroups16: Object.assign({}, s.rrGroups16, { [gid]: !isOpen }) })) };
          }
          bucket.rows.push({ key: c.key, icon: c.icon, title: c.code || c.title, meta: c.code ? c.title : c.copy,
            hasState: c.tone === "st-blocked16", state: "Failed", tone: "bad16",
            hasOut: !!(c.code && c.copy), out: c.copy, cls: c.tone === "st-blocked16" ? "bad16" : "" });
          return;
        }
        closeBucket();
        entries.push({ key: c.key, isSay: true, cls: c.avatar ? (c.who === "Operator" ? "op16" : "agent16") : "human16",
          who: c.who, time: c.at, text: c.text, isOperator: c.who === "Operator", isAgent: !!c.avatar && c.who !== "Operator",
          isHuman: !c.avatar, initial: c.initial, avatar: c.avatar });
      });
      closeBucket();
      v.rrEntries16 = entries.map((e) => e.isTools ? {
        ...e, label: e.rows.length === 1 ? e.rows[0].meta || e.rows[0].title : e.rows.length + " actions",
        meta: e.rows.map((r) => r.meta || r.title).filter(Boolean).slice(0, 2).join(" \u00b7 ") + (e.rows.length > 2 ? " \u00b7 \u2026" : ""),
        aria: (e.open ? "Collapse " : "Expand ") + e.rows.length + " tool calls",
      } : e).concat(queued ? [] : [{
        key: "result", isResult: true, cls: "result16", icon: "i15.svg#" + t[0], title: t[2] + " \u00b7 " + (vr.label || "Run"), time: vr.when || "",
        text: v.rrOutput16,
        facts: [{ k: "Duration", v: v.rrFacts16[1].v }, { k: "Cost", v: v.rrFacts16[2].v }, { k: "Model", v: v.rrFacts16[3].v }]
          .concat(v.rrHasIssues16 ? [{ k: "Created", v: v.rrIssues16.map((x) => x.id).join(", ") }] : []).map((f, i) => ({ key: i, ...f })),
      }]);
      v.rrOutcome16 = v.rrOutput16;
      v.rrConvSub16 = "Claude Sonnet 5 \u00b7 " + (v.rrConv16.length) + " entries \u00b7 " + (vr.when || "");
      v.rrDetailsOpen16 = !!st.rrDetailsOpen16;
      v.rrToggleDetails16 = () => this.setState((s) => ({ rrDetailsOpen16: !s.rrDetailsOpen16 }));
      v.rrDetails16 = [
        { key: "started", k: "Started", v: (v.rrConv16[0] || {}).at || vr.when || "" },
        { key: "ended", k: "Ended", v: (v.rrConv16[v.rrConv16.length - 1] || {}).at || "" },
        { key: "trigger", k: "Trigger", v: src },
        { key: "runsas", k: "Runs as", v: (v.autoOwner9 || "Alex") + " \u00b7 Operator \u00b7 BotInc Cloud" },
        { key: "instr", k: "Instructions", v: "Version of Sep 3" },
      ];
      // What the run cost.
      const costN = skipped || queued ? 0 : failed ? 0.09 : timed ? 0.12 : 0.31;
      const limitN = 2;
      v.rrCost16 = this.cash(costN);
      v.rrLimit16 = this.cash(limitN);
      v.rrBudgetLeft16 = this.cash(limitN - costN);
      v.rrBudgetStyle16 = "width:" + Math.round((costN / limitN) * 100) + "%";
      v.rrFunded16 = "Alex\u2019s Claude subscription";
      v.rrUsageRows16 = [
        { key: "model", hasLogo: true, logo: "assets/brands-v12/claude.svg", title: "Model work", copy: costN ? "Claude Sonnet 5 \u00b7 subscription" : "No model call", amount: this.cash(costN ? costN - 0.02 : 0) },
        { key: "cloud", hasLogo: false, icon: "i15.svg#monitor", title: "Cloud compute", copy: costN ? "BotInc Cloud \u00b7 credit" : "No sandbox started", amount: this.cash(costN ? 0.02 : 0) },
      ];
      v.rrUsageFacts16 = [
        { key: "in", k: "Tokens in", v: costN ? (timed ? "18,240" : "42,910") : "0" },
        { key: "out", k: "Tokens out", v: costN ? (timed ? "1,180" : "6,402") : "0" },
        { key: "dur", k: "Duration", v: v.rrFacts16[1].v },
        { key: "sandbox", k: "Sandbox", v: costN ? "Ubuntu 24.04 \u00b7 2 vCPU" : "\u2014" },
      ];
    }
    // The activity year is always the last twelve months, and its columns are
    // sized from the data so the months line up with the squares at any width.
    v.pfRange15 = "Last 12 months";
    const weeks19 = (v.pfWeeks15 || []).length;
    v.pfMonthsStyle19 = "grid-template-columns:repeat(" + Math.max(1, weeks19) + ",minmax(4px,1fr))";
    // A label in the last two columns would hang off the card's right edge; the
    // first column already names that month.
    if (Array.isArray(v.pfMonths15)) {
      v.pfMonths15 = v.pfMonths15.filter((m) => {
        const col = parseInt(String(m.style).replace(/[^0-9]/g, ""), 10);
        return !(col && col > weeks19 - 2);
      });
    }
    this.secVals19(v);
    this.stepVals19(v);
    this.detailVals19b(v);
    this.workflowVals19b(v);
    this.planVals19b(v);
    this.topupVals19b(v);
    this.usageVals19b(v);
    this.dockVals19c(v);
    this.tabVals19c(v);
    return v;
  }
}
  return Component;
}
