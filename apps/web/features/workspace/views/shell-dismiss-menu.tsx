/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function ShellDismissMenu({ v }: { v: Vals }) {
  return (
    v.menuOpen14 ? (
      <>
        <button className="menu-scrim14" aria-label="Dismiss menu" onClick={v.closeMenu14} />
        <div
          className={`menu14 ${v.menuClass15}`}
          style={css(v.menuStyle14)}
          role="dialog"
          aria-label={v.menuLabel14}
          onKeyDown={v.menuKey14}
        >
          {v.menuHasTitle14 ? (
            <>
              <p className="menu-title14">
                {v.menuHasBack16 ? (
                  <>
                    <button type="button" className="menu-back16" aria-label="Back" onClick={v.menuBack16}>
                      <svg
                        className="ui-icon use14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <use href="/i15.svg#chevron-left" />
                      </svg>
                    </button>
                  </>
                ) : null}
                {interp(v.menuLabel14)}
              </p>
            </>
          ) : null}
          {v.menuHasSearch15 ? (
            <>
              <label className="menu-search15">
                <svg
                  className="ui-icon use14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <use href="/i15.svg#search" />
                </svg>
                <span className="sr-only">{interp(v.menuSearchHint15)}</span>
                <input placeholder={v.menuSearchHint15} value={v.menuSearch15} onInput={v.editMenuSearch15} />
              </label>
            </>
          ) : null}
          <div className="menu-rows14" role="listbox" aria-label={v.menuLabel14}>
            {(v.menuRows14 ?? []).map((o: any, i: number) => (
              <Fragment key={i}>
                {o.isHead ? (
                  <>
                    <p className="menu-head15">{interp(o.label)}</p>
                  </>
                ) : null}
                {o.isRow ? (
                  <>
                    <button
                      type="button"
                      className={`menu-row14 ${o.cls}`}
                      role="option"
                      aria-selected={o.selected}
                      disabled={o.disabled}
                      onClick={o.pick}
                    >
                      {o.hasLogo ? (
                        <>
                          <img className={`menu-logo15 ${o.logoClass}`} src={o.logo} alt="" />
                        </>
                      ) : null}
                      {o.hasIcon ? (
                        <>
                          <svg
                            className="ui-icon use14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <use href={o.icon} />
                          </svg>
                        </>
                      ) : null}
                      <span>{interp(o.label)}</span>
                      {o.hasHint ? (
                        <>
                          <em className="menu-hint15">{interp(o.hint)}</em>
                        </>
                      ) : null}
                      <svg
                        className="ui-icon use14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <use href="/i15.svg#check" />
                      </svg>
                    </button>
                  </>
                ) : null}
              </Fragment>
            ))}
            {v.menuEmpty15 ? (
              <>
                <p className="menu-empty15">{interp(v.menuEmptyCopy15)}</p>
              </>
            ) : null}
          </div>
          {v.menuHasCta15 ? (
            <>
              <button className="menu-cta15" onClick={v.menuCta15}>
                <svg
                  className="ui-icon use14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <use href={v.menuCtaIcon15} />
                </svg>
                <span>{interp(v.menuCtaLabel15)}</span>
                <svg
                  className="ui-icon use14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <use href="/i15.svg#chevron-right" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      </>
    ) : null
  );
}
