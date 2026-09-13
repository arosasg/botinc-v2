/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";

export function ShellSidebar({ v }: { v: Vals }) {
  return (
    <aside className="sidebar sidebar9 sidebar12" style={css(v.sidebarStyle12)} aria-label="Workspace navigation">
      <div
        className="sidebar-divider12"
        role="separator"
        tabIndex={0}
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        aria-valuemin={200}
        aria-valuemax={380}
        aria-valuenow={v.sidebarWidth12}
        onPointerDown={v.dragSidebar12}
        onKeyDown={v.sidebarKey12}
        onDoubleClick={v.resetSidebar12}
      />
      <button className="workspace-button" onClick={v.workspaceMenu}>
        <img src="/assets/logo/botinc-mark.svg" alt="" />
        <span>BotInc</span>
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
          <use href="/i15.svg#chevrons-up-down" />
        </svg>
      </button>
      <div className="nav-main">
        <button className="nav-row" onClick={v.newChat}>
          <span className="nav-icon">
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
              <use href="/i15.svg#square-pen" />
            </svg>
          </span>
          New chat<span className="shortcut">⌘ N</span>
        </button>
        <button className={v.workNavClass} onClick={v.showWork}>
          <span className="nav-icon">
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
              <use href="/i15.svg#list-todo" />
            </svg>
          </span>
          Work
          {v.attentionCount ? (
            <>
              <span className="count">{interp(v.attentionCount)}</span>
            </>
          ) : null}
        </button>
        <button className={v.scheduleNav9} onClick={v.showSchedule9}>
          <span className="nav-icon">
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
              <use href="/i15.svg#calendar" />
            </svg>
          </span>
          Schedule
        </button>
        <button className="nav-row" onClick={v.plugins10}>
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
            <use href="/i15.svg#plug" />
          </svg>
          <span>Plugins</span>
        </button>
        <button className="nav-row" onClick={v.searchAll}>
          <span className="nav-icon">
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
          </span>
          Search<span className="shortcut">⌘ K</span>
        </button>
      </div>
      <div className="recents c9-recents recents12">
        <div className="sidebar-separator12" />
        <div className="c9-scroll16">
          {(v.conversationGroups12 ?? []).map((g: any, i: number) => (
            <Fragment key={i}>
              <section className="c9-group">
                <h3>
                  <span className={`c9-gicon16 ${g.tone16}`}>
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
                      <use href={g.icon16} />
                    </svg>
                  </span>
                  <b>{interp(g.title)}</b>
                  <span>{interp(g.count)}</span>
                </h3>
                {(g.rows ?? []).map((c: any, i: number) => (
                  <Fragment key={i}>
                    <div className="sidebar-item12">
                      <button
                        className={c.cls}
                        onClick={c.open}
                        onContextMenu={c.menu16}
                        onMouseEnter={c.hoverIn16}
                        onMouseLeave={c.hoverOut16}
                        onFocus={c.hoverIn16}
                        onBlur={c.hoverOut16}
                        aria-current={c.current}
                      >
                        <span className={`c9-status ${c.tone}`}>
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
                            <use href={c.icon} />
                          </svg>
                        </span>
                        <span className="c9-row-copy fade16">
                          {c.renaming16 ? (
                            <>
                              <span className="c9-rename16">
                                <input
                                  value={c.renameDraft16}
                                  onInput={c.renameEdit16}
                                  onKeyDown={c.renameKey16}
                                  onBlur={c.renameDone16}
                                  aria-label="Rename conversation"
                                />
                              </span>
                            </>
                          ) : null}
                          {!c.renaming16 ? (
                            <>
                              <strong>{interp(c.title)}</strong>
                            </>
                          ) : null}
                        </span>
                        {c.unread16 ? (
                          <>
                            <i className="c9-unread16" aria-label="Unread" />
                          </>
                        ) : null}
                      </button>
                      <span className="c9-acts16">
                        <button
                          className={`pin12 ${c.pinClass}`}
                          aria-label={c.pinLabel}
                          title={c.pinLabel}
                          onClick={c.pin}
                        >
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
                            <use href="/i15.svg#pin" />
                          </svg>
                        </button>
                        <button
                          className="pin12 arch16"
                          aria-label="Archive conversation"
                          title="Archive conversation"
                          onClick={c.archive16}
                        >
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
                            <use href="/i15.svg#archive" />
                          </svg>
                        </button>
                        <button
                          className="pin12 rowmenu16"
                          aria-label="More actions"
                          title="More actions"
                          onClick={c.menu16}
                        >
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
                            <use href="/i15.svg#ellipsis" />
                          </svg>
                        </button>
                      </span>
                    </div>
                  </Fragment>
                ))}
                {g.more ? (
                  <>
                    <button className="show-more12" onClick={g.toggle}>
                      {interp(g.moreLabel)}{" "}
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
                        <use href="/i15.svg#chevron-down" />
                      </svg>
                    </button>
                  </>
                ) : null}
              </section>
            </Fragment>
          ))}
          {v.noConversations9 ? (
            <>
              <p className="sidebar-empty">Your work will appear here.</p>
            </>
          ) : null}
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="provider-strip13 provider-strip14" aria-label="Provider capacity index">
          {(v.providerGroups13 ?? []).map((p: any, i: number) => (
            <Fragment key={i}>
              <div className="provider-group13">
                <button className="provider-button13" aria-label={p.aria14} onClick={p.open}>
                  <span className={`provider-orbit13 orbit14 ${p.indexTone14}`} style={css(p.ringStyle14)}>
                    <img className={`brand12 ${p.brandClass12}`} src={p.brand12} alt="" />
                  </span>
                  <small className={`orbit-index14 ${p.indexTone14}`}>{interp(p.index14)}</small>
                </button>
                <section className="provider-hover13" aria-label={`${p.name} capacity index`}>
                  <header>
                    <img className={`brand12 ${p.brandClass12}`} src={p.brand12} alt="" />
                    <span>
                      <strong>{interp(p.name)}</strong>
                      <small>
                        {interp(p.count)} personal accounts · {interp(v.memberName)}
                      </small>
                    </span>
                    <button className="text-button" onClick={p.open}>
                      View all{" "}
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
                        <use href="/i15.svg#arrow-up-right" />
                      </svg>
                    </button>
                  </header>
                  <div className="index-card14">
                    <div className="index-head14">
                      <span className={`index-value14 ${p.indexTone14}`}>{interp(p.index14)}</span>
                      <span>
                        <strong>{interp(p.indexTitle14)}</strong>
                        <small>{interp(p.indexMethod14)}</small>
                      </span>
                    </div>
                    <div className="index-counts14">
                      <span>
                        <b>{interp(p.includedCount14)}</b>in the average
                      </span>
                      <span>
                        <b>{interp(p.excludedCount14)}</b>excluded
                      </span>
                      <span>
                        <b>{interp(p.routableCount14)}</b>can run now
                      </span>
                      <span>
                        <b>{interp(p.capacityOnlyCount14)}</b>capacity only
                      </span>
                      <span>
                        <b>{interp(p.limitedCount14)}</b>at limit
                      </span>
                      <span>
                        <b>{interp(p.reconnectCount14)}</b>reconnect
                      </span>
                      <span>
                        <b>{interp(p.unknownCount14)}</b>unknown
                      </span>
                      <span>
                        <b>{interp(p.availableCount14)}</b>available
                      </span>
                    </div>
                    <p className="index-warn14">
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
                        <use href="/i15.svg#info" />
                      </svg>
                      {interp(p.indexCaveat14)}
                    </p>
                  </div>
                  <div className="hover-accounts13">
                    {(p.rows ?? []).map((a: any, i: number) => (
                      <Fragment key={i}>
                        <button className="hover-account13 hacct16" onClick={a.open13}>
                          <span className="hacct-top16">
                            <img className={`brand12 ${a.brandClass14}`} src={a.brand14} alt="" />
                            <strong>{interp(a.label)}</strong>
                            {a.hasPlan14 ? (
                              <>
                                <em className="hacct-plan16">{interp(a.plan14)}</em>
                              </>
                            ) : null}
                            {a.showId14 ? (
                              <>
                                <em className="hacct-id16">{interp(a.identity)}</em>
                              </>
                            ) : null}
                            {a.attention14 ? (
                              <>
                                <em className="hacct-attn16" title={a.identity}>
                                  {interp(a.statusShort14)}
                                </em>
                              </>
                            ) : null}
                            <b className={`hacct-left16 ${a.tone13}`}>{interp(a.remaining13)}</b>
                          </span>
                          <span className="hacct-line16">
                            {(a.windows ?? []).map((w: any, i: number) => (
                              <Fragment key={i}>
                                <span className="hw16">
                                  <span className="hw-k16">{interp(w.initial14)}</span>
                                  <span className={`hw-v16 ${w.tone14}`}>{interp(w.leftLabel14)}</span>
                                  <span className="hw-r16" title={w.reset}>
                                    {interp(w.resetShort14)}
                                  </span>
                                </span>
                              </Fragment>
                            ))}
                            {a.noWindows14 ? (
                              <>
                                <span className="hw-none16">No window reported</span>
                              </>
                            ) : null}
                          </span>
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </section>
              </div>
            </Fragment>
          ))}
          <button className="icon-button" aria-label="View all model account usage" onClick={v.allUsage12}>
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
              <use href="/i15.svg#ellipsis" />
            </svg>
          </button>
        </div>
        <button className="nav-row" onClick={v.showSettings}>
          <span className="nav-icon">
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
              <use href="/i15.svg#settings" />
            </svg>
          </span>
          Settings
        </button>
        <button className="profile-button" onClick={v.profileMenu}>
          <span className="person-avatar">{interp(v.memberInitial)}</span>
          <span>
            <strong>{interp(v.memberName)}</strong>
            <small>
              {interp(v.plan)} · {interp(v.balanceText)} left
            </small>
          </span>
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
            <use href="/i15.svg#chevrons-up-down" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
