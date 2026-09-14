/* Host for a design-component logic class (the `class Component extends DCLogic`
   shape Claude Design prototypes use). The class owns `state`, mutates it with
   `setState`, and exposes bindings through `renderVals()`. This host keeps the
   same synchronous-state semantics the design runtime has and re-renders the
   React tree after each change. */

"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

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

// Mutable design logic is an external store. React subscribes to revisions;
// mutations and lifecycle callbacks happen outside rendering.
function createStore(Logic:LogicClass,props:Props) {
 const logic=new Logic(props);let revision=0;const listeners=new Set<()=>void>();const pending:(()=>void)[]=[];
 const notify=()=>{revision++;for(const listener of listeners)listener()};
 logic.__host={setLogicState:(update,cb)=>{logic.state={...logic.state,...(typeof update==="function"?update(logic.state):update)};if(cb)pending.push(cb);notify()},forceUpdate:notify};
 return {logic,subscribe:(listener:()=>void)=>{listeners.add(listener);return ()=>{listeners.delete(listener)}},snapshot:()=>revision,
  mount:()=>{(window as unknown as {__dcLogic?:unknown}).__dcLogic=logic;logic.componentDidMount();notify();return ()=>logic.componentWillUnmount()},
  update:(next:Props)=>{logic.props=next;for(const cb of pending.splice(0))cb();logic.componentDidUpdate(next)}
 };
}
export function useDCLogic(Logic:LogicClass,props:Props):{logic:DCLogic<object>;vals:Record<string,unknown>}{
 // One class instance per constructor; props changes are delivered below.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 const store=useMemo(()=>createStore(Logic,props),[Logic]);
 useSyncExternalStore(store.subscribe,store.snapshot,store.snapshot);
 useEffect(()=>store.mount(),[store]);
 useEffect(()=>{store.update(props)});
 return {logic:store.logic,vals:{...props,...store.logic.renderVals()}};
}
