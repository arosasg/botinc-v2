/* eslint-disable */
// @ts-nocheck
// V19 — motion. One system for the whole app: screens settle in with a short
// skeleton beat and a staggered rise, panes slide, widths ease, overlays pop.
// The CSS does the moving; this layer only names the moments.
(function () {
  var SKELETON_MS = 420;   // how long a screen shows placeholder rows before its content rises
  var REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.BotincMotionWorkspace19 = function (Base) {
    return class extends Base {
      componentWillUnmount() {
        if (super.componentWillUnmount) super.componentWillUnmount();
        clearTimeout(this._skel19); clearTimeout(this._sbDrag19);
      }
      // A screen change shows the page's skeleton for one beat, then the rows rise.
      beat19() {
        if (REDUCED) return;
        var self = this;
        clearTimeout(this._skel19);
        this.setState({ loading19: true });
        this._skel19 = setTimeout(function () { self.setState({ loading19: false }); }, SKELETON_MS);
      }
      go(view, patch) {
        var changed = view !== this.state.view;
        var out = super.go(view, patch);
        if (changed) this.beat19();
        return out;
      }
      openIssue(...args) {
        var before = this.state.activeIssue, view = this.state.view;
        var out = super.openIssue(...args);
        if (this.state.activeIssue !== before || view !== this.state.view) this.beat19();
        return out;
      }
      loadChat9(...args) {
        var before = this.state.activeChat;
        var out = super.loadChat9(...args);
        if (this.state.activeChat !== before) this.beat19();
        return out;
      }
      openInspector10(tab) {
        var wasOpen = !!this.state.inspector10, prev = this.state.inspectorTab10;
        var out = super.openInspector10(tab);
        // A pane that is already open swaps its content with a beat of its own.
        if (wasOpen && prev !== this.state.inspectorTab10) {
          var self = this; clearTimeout(this._paneSkel19);
          this.setState({ paneLoading19: true });
          this._paneSkel19 = setTimeout(function () { self.setState({ paneLoading19: false }); }, 260);
        }
        return out;
      }
      // Widths ease unless a pointer is dragging them.
      dragSidebar12(e) {
        var self = this;
        this.setState({ sbDragging19: true });
        var up = function () { document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up); self.setState({ sbDragging19: false }); };
        document.addEventListener("pointerup", up); document.addEventListener("pointercancel", up);
        return super.dragSidebar12(e);
      }
      renderVals() {
        var v = super.renderVals();
        var s = this.state;
        v.rootClass = (v.rootClass || "") + " app-v19"
          + (s.loading19 ? " loading19" : "")
          + (s.paneLoading19 ? " pane-loading19" : "")
          + (s.sbDragging19 ? " sb-dragging19" : "");
        return v;
      }
    };
  };
})();

