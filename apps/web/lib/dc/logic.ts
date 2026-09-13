/* Host for a design-component logic class (the `class Component extends DCLogic`
   shape Claude Design prototypes use). The class owns `state`, mutates it with
   `setState`, and exposes bindings through `renderVals()`. This host keeps the
   same synchronous-state semantics the design runtime has and re-renders the
   React tree after each change. */

"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";

type Props = Record<string, unknown>;
type StateUpdate<S> = Partial<S> | ((prev: S) => Partial<S>);

export class DCLogic<S extends object = Record<string, unknown>> {
  props: Props;
  state: S = {} as S;
  __host?: { setLogicState: (u: StateUpdate<S>, cb?: () => void) => void; forceUpdate: () => void };
  constructor(props?: Props) {
    this.props = props || {};
  }
  setState(update: StateUpdate<S>, cb?: () => void) {
    this.__host?.setLogicState(update, cb);
  }
  forceUpdate() {
    this.__host?.forceUpdate();
  }
  componentDidMount() {}
  componentDidUpdate(_prev?: Props) {}
  componentWillUnmount() {}
  renderVals(): Record<string, unknown> {
    return {};
  }
}

export type LogicClass = new (props?: Props) => DCLogic<object>;

export function useDCLogic(Logic: LogicClass, props: Props): { logic: DCLogic<object>; vals: Record<string, unknown> } {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const pending = useRef<(() => void)[]>([]);
  const mounted = useRef(false);
  const logic = useMemo(() => {
    const l = new Logic(props);
    l.__host = {
      setLogicState: (update, cb) => {
        const prev = l.state;
        const patch = typeof update === "function" ? update(prev) : update;
        l.state = { ...prev, ...patch };
        if (cb) pending.current.push(cb);
        if (mounted.current) bump();
      },
      forceUpdate: () => {
        if (mounted.current) bump();
      },
    };
    if (typeof window !== "undefined") (window as unknown as { __dcLogic?: unknown }).__dcLogic = l;
    return l;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Logic]);
  logic.props = props;

  useEffect(() => {
    mounted.current = true;
    if (typeof window !== "undefined") (window as unknown as { __dcLogic?: unknown }).__dcLogic = logic;
    logic.componentDidMount();
    bump();
    return () => {
      mounted.current = false;
      logic.componentWillUnmount();
    };
  }, [logic]);
  useEffect(() => {
    const cbs = pending.current;
    pending.current = [];
    for (const cb of cbs) cb();
    logic.componentDidUpdate(props);
  });

  const vals = { ...props, ...(logic.renderVals() || {}) };
  return { logic, vals };
}
