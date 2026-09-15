/* Host for a design-component logic class (the `class Component extends DCLogic`
   shape Claude Design prototypes use). The class owns `state`, mutates it with
   `setState`, and exposes bindings through `renderVals()`. This host keeps the
   same synchronous-state semantics the design runtime has and re-renders the
   React tree after each change. */

"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

type Props = Record<string, unknown>;
type StateUpdate<S> = Partial<S> | ((prev: S) => Partial<S>);

export class DCLogic<S extends object = Record<string, unknown>> {
  props: Props;
  state: S = {} as S;
  __host?: {
    setLogicState: (u: StateUpdate<S>, cb?: () => void) => void;
    forceUpdate: () => void;
    deferRender: (fn: () => void, delayMs: number) => void;
    flushRender: () => void;
  };
  constructor(props?: Props) {
    this.props = props || {};
  }
  setState(update: StateUpdate<S>, cb?: () => void) {
    this.__host?.setLogicState(update, cb);
  }
  forceUpdate() {
    this.__host?.forceUpdate();
  }
  /* Coalesce the re-render for high-frequency input. State changes made inside
     `fn` merge immediately, so `state` is current for anything that reads it,
     but the React tree refreshes once after `delayMs` of quiet, or as soon as
     any other setState or flushRender() happens. Without a host, `fn` runs as
     usual. */
  deferRender(fn: () => void, delayMs = 200) {
    if (this.__host) this.__host.deferRender(fn, delayMs);
    else fn();
  }
  flushRender() {
    this.__host?.flushRender();
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
 // Deferred rendering: while `deferDepth` is raised, state merges but the
 // revision does not tick; the first quiet `delayMs` (or any undeferred change)
 // publishes everything that accumulated.
 let deferDepth=0;let deferred=false;let timer:ReturnType<typeof setTimeout>|undefined;
 const notify=()=>{if(timer!==undefined){clearTimeout(timer);timer=undefined}deferred=false;revision++;for(const listener of listeners)listener()};
 const schedule=(delayMs:number)=>{if(timer!==undefined)clearTimeout(timer);timer=setTimeout(()=>{timer=undefined;if(deferred)notify()},delayMs)};
 logic.__host={
  setLogicState:(update,cb)=>{logic.state={...logic.state,...(typeof update==="function"?update(logic.state):update)};if(cb)pending.push(cb);if(deferDepth>0)deferred=true;else notify()},
  forceUpdate:notify,
  deferRender:(fn,delayMs)=>{deferDepth++;try{fn()}finally{deferDepth--}if(deferDepth===0&&deferred)schedule(delayMs)},
  flushRender:()=>{if(deferred)notify()},
 };
 return {logic,subscribe:(listener:()=>void)=>{listeners.add(listener);return ()=>{listeners.delete(listener)}},snapshot:()=>revision,
  mount:()=>{(window as unknown as {__dcLogic?:unknown}).__dcLogic=logic;logic.componentDidMount();notify();return ()=>{if(timer!==undefined){clearTimeout(timer);timer=undefined}logic.componentWillUnmount()}},
  update:(next:Props)=>{logic.props=next;for(const cb of pending.splice(0))cb();logic.componentDidUpdate(next)}
 };
}
/* The mounted logic instance, for components that need more than the view-model
   (the composer defers its re-render through it). */
export const DCLogicContext = createContext<DCLogic<object> | null>(null);
export function useDCLogicInstance(): DCLogic<object> | null {
  return useContext(DCLogicContext);
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
