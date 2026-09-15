"use client";

/* Landing v4. Markup ported 1:1 from the design so the brand CSS applies
   unchanged; every binding reads from the view-model in use-landing.ts. */

import { Fragment } from "react";
import { css } from "@/lib/dc/css";
import { interp } from "@/lib/dc/interp";
import { DotWave } from "./dot-wave";
import { ThreadShell } from "./thread-shell";
import { EmailSignIn } from "./email-sign-in";
import { useLanding } from "./use-landing";

export function LandingView({ onEnterWorkspace }: { onEnterWorkspace?: () => void }) {
  const v = useLanding({ onEnterWorkspace });
  return (
    <div className={v.rootClass}>
      {v.onLanding ? (
        <>
          <main data-screen-label="Landing">
            <header className="nav">
              <button className="logo" onClick={v.goTop}>
                <img src="/assets/logo/botinc-mark.svg" alt="" />
                BotInc
              </button>
              <nav className="nav-links">
                <button onClick={v.goHow}>How it works</button>
                <button onClick={v.goRouting}>Smart routing</button>
                <button onClick={v.goAutos}>Autopilots</button>
                <button onClick={v.goModels}>Models</button>
                <button onClick={v.goPlans}>Pricing</button>
              </nav>
              <div className="nav-actions">
                <button className="tbtn muted" onClick={v.openApps}>
                  <svg className="ico">
                    <use href="/i15.svg#download" />
                  </svg>
                  Download
                </button>
                <button className="tbtn muted" onClick={v.startFree}>
                  Sign in
                </button>
                <button className="btn accent" onClick={v.startFree}>
                  Start free
                </button>
              </div>
            </header>
            <section className="hero" id="top">
              <div className="hero-field" aria-hidden="true">
                <DotWave gap={16} dot={1} force={18} radius={120} speed={600} band={100} life={2} opacity={0.10} color="#0c0a08" />
              </div>
              <div className="hero-copy">
                <h1>
                  Coding that never stops.
                  <br />
                  <span>Fixes that never ship unreviewed.</span>
                </h1>
                <p className="lead">
                  Connect Sentry. Errors become reviewed pull requests, routed across the subscriptions you already pay for.
                  Nothing merges itself.
                </p>
                <div className="hero-cta">
                  <button className="btn accent lg" onClick={v.startFree}>
                    Start free
                  </button>
                  <button className="btn lg" onClick={v.openMac}>
                    <svg className="ico fill">
                      <use href="/assets/icons/platforms.svg#apple" />
                    </svg>
                    Download for Mac
                  </button>
                </div>
                <small>Runs remotely, 24/7 · $2 starter credit · No card</small>
              </div>
              <div>
                <div className="demo" aria-label="The BotInc workspace fixing a Sentry error on its own">
                  <div className="demo-inner">
                    <div style={{ display: "block", width: "100%", height: "100%" }}><ThreadShell
                      d={v.d}
                      steps={v.dSteps}
                      theme={v.theme}
                      readOnly={true}
                      value={v.d?.typed}
                      autosCount={v.autosCount}
                      balance="$2.00"
                      view={v.demoView}
                      setView={v.setDemoView} /></div>
                  </div>
                </div>
                <div className="demo-caption">
                  <span>
                    <i />
                    {interp(v.d?.caption)}
                  </span>
                  <button className="tbtn" onClick={v.replay}>
                    Replay
                  </button>
                </div>
              </div>
            </section>
            <section className="rail" id="how">
              <div className="rail-head">
                <h2>Four steps. One of them is yours.</h2>
              </div>
              <div className="rail-track">
                <i className="rail-line" />
                <i className="rail-fill" style={css(v.d?.railStyle)} />
                <div className={v.d?.step1}>
                  <span className="rail-dot">
                    <svg className="ico">
                      <use href="/i15.svg#plug" />
                    </svg>
                  </span>
                  <span className="n">01 · CONNECT</span>
                  <h3>Connect what you run.</h3>
                  <p>Sentry, Linear, GitHub. Read-only until you approve.</p>
                </div>
                <div className={v.d?.step2}>
                  <span className="rail-dot">
                    <svg className="ico">
                      <use href="/i15.svg#zap" />
                    </svg>
                  </span>
                  <span className="n">02 · AUTOPILOT</span>
                  <h3>Errors become issues.</h3>
                  <p>Each one gets a priority and an owner.</p>
                </div>
                <div className={v.d?.step3}>
                  <span className="rail-dot">
                    <svg className="ico">
                      <use href="/i15.svg#waypoints" />
                    </svg>
                  </span>
                  <span className="n">03 · WORKFLOW</span>
                  <h3>The workflow fixes it.</h3>
                  <p>Plan, implement, review, verify. Routed so it never stalls.</p>
                </div>
                <div className={v.d?.step4}>
                  <span className="rail-dot">
                    <svg className="ico">
                      <use href="/i15.svg#hand" />
                    </svg>
                  </span>
                  <span className="n">04 · YOU</span>
                  <h3>You approve.</h3>
                  <p>A pull request waits with what changed and what it cost.</p>
                </div>
              </div>
            </section>
            <section className="band" id="routing">
              <div className="grid2 routing-grid">
                <div className="band-head">
                  <span className="eb">SMART ROUTING</span>
                  <h2>Your subscriptions, never idle. Your runs, never stopped.</h2>
                  <p>
                    Claude Code stops when your account hits its limit. BotInc doesn&apos;t. Each run starts on the account
                    with the most capacity left and, when it runs dry, continues on the next one. No re-login, no lost
                    context.
                  </p>
                  <div className="route-facts">
                    <div className="rf">
                      <strong>Least-used first</strong>
                      <span>Every subscription gets used before any is wasted.</span>
                    </div>
                    <div className="rf">
                      <strong>Switches mid-run</strong>
                      <span>Same context, same thread, nothing to log into.</span>
                    </div>
                    <div className="rf">
                      <strong>Runs in the cloud</strong>
                      <span>Close the lid. The pull request is waiting in the morning.</span>
                    </div>
                    <div className="rf">
                      <strong>API only if you allow it</strong>
                      <span>Spill over at list price + 10%, or wait for the reset.</span>
                    </div>
                  </div>
                </div>
                <div className="router" aria-label="Live routing example">
                  <div className="router-head">
                    <span>
                      <svg className="ico">
                        <use href="/i15.svg#waypoints" />
                      </svg>
                      Routing · BOT-42 · Implement
                    </span>
                    <span className="mono">{interp(v.r?.elapsed)}</span>
                  </div>
                  <div className="router-run">
                    <span className="mono">RUN</span>
                    <span className="bar">
                      <i style={css(v.r?.runStyle)} />
                    </span>
                    <span className="mono">{interp(v.r?.pct)}</span>
                  </div>
                  <div className="accounts">
                    {(v.r?.accounts ?? []).map((a: any, i: number) => (
                      <Fragment key={i}>
                        <div className={a.cls}>
                          {a.isClaude ? (
                            <>
                              <img src="/assets/brands-v12/claude.svg" alt="" />
                            </>
                          ) : null}
                          {a.isClaude2 ? (
                            <>
                              <img src="/assets/brands-v12/claude.svg" alt="" />
                            </>
                          ) : null}
                          {a.isCodex ? (
                            <>
                              <img src="/assets/brands-v12/codex.svg" alt="" />
                            </>
                          ) : null}
                          {a.isCursor ? (
                            <>
                              <img src="/assets/coding-accounts/cursor.svg" alt="" />
                            </>
                          ) : null}
                          {a.isCopilot ? (
                            <>
                              <img src="/assets/coding-accounts/copilot.svg" alt="" />
                            </>
                          ) : null}
                          {a.isApi ? (
                            <>
                              <img src="/assets/coding-accounts/deepseek.svg" alt="" />
                            </>
                          ) : null}
                          <span className="acc-name">
                            <strong>{interp(a.name)}</strong>
                            <small>{interp(a.plan)}</small>
                          </span>
                          <span className="cap">
                            <i style={css(a.capStyle)} />
                          </span>
                          <span className="mono acc-left">{interp(a.left)}</span>
                          <span className="acc-state">{interp(a.state)}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div className="router-log">
                    {(v.r?.log ?? []).map((l: any, i: number) => (
                      <Fragment key={i}>
                        <p className={l.cls}>
                          <span className="mono">{interp(l.t)}</span>
                          <span>{interp(l.text)}</span>
                        </p>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <section className="band" id="quality">
              <div className="wf-head">
                <div className="band-head">
                  <span className="eb">THE WORKFLOW</span>
                  <h2>Every fix passes the same gate.</h2>
                  <p>
                    One workflow keeps bad code out of main, whether the issue came from Sentry at 3 a.m. or from you. Watch
                    BOT-42 go through it.
                  </p>
                </div>
                <div className="wf-def" data-glow="">
                  <div className="wf-def-top">
                    <span>
                      <svg className="ico">
                        <use href="/i15.svg#waypoints" />
                      </svg>
                      Fix &amp; review
                    </span>
                    <small>DEFAULT · 5 STEPS · EDITABLE</small>
                  </div>
                  <ol className="wf-rules">
                    <li>
                      <b>on</b>
                      <span>issue filed by Issue intake, or by you</span>
                    </li>
                    <li>
                      <b>plan</b>
                      <span>model: auto → Claude Opus 5 · output: cause, files, tests</span>
                    </li>
                    <li>
                      <b>implement</b>
                      <span>model: auto · tests: required · branch per issue</span>
                    </li>
                    <li>
                      <b>review</b>
                      <span>
                        model: <em>different from author</em> · max rounds: 3
                      </span>
                    </li>
                    <li>
                      <b>verify</b>
                      <span>full suite · clean sandbox · red goes back</span>
                    </li>
                    <li>
                      <b>approval</b>
                      <span>human: required · merge: never automatic</span>
                    </li>
                  </ol>
                </div>
              </div>
              <div className="gate-wrap">
                <div className="gate-track">
                  <i className="gate-line" />
                  <span className={v.g?.tokenCls} style={css(v.g?.tokenStyle)}>
                    <svg className="ico">
                      <use href="/i15.svg#git-pull-request" />
                    </svg>
                    BOT-42<small>{interp(v.g?.tokenNote)}</small>
                  </span>
                </div>
                <div className="gate">
                  {(v.g?.steps ?? []).map((st: any, i: number) => (
                    <Fragment key={i}>
                      <div className={st.cls}>
                        <div className="gs-top">
                          <span className="n">{interp(st.n)}</span>
                          <span className={st.stCls}>
                            <i />
                            {interp(st.state)}
                          </span>
                        </div>
                        <div className="gs-model">
                          {st.isClaude ? (
                            <>
                              <img src="/assets/brands-v12/claude.svg" alt="" />
                            </>
                          ) : null}
                          {st.isCodex ? (
                            <>
                              <img src="/assets/brands-v12/codex.svg" alt="" />
                            </>
                          ) : null}
                          {st.isBot ? (
                            <>
                              <img src="/assets/logo/botinc-mark.svg" alt="" />
                            </>
                          ) : null}
                          {st.isYou ? (
                            <>
                              <svg className="ico">
                                <use href="/i15.svg#hand" />
                              </svg>
                            </>
                          ) : null}
                          <span>{interp(st.model)}</span>
                        </div>
                        <h3>{interp(st.title)}</h3>
                        <p>{interp(st.copy)}</p>
                        <code>{interp(st.out)}</code>
                        <span className="gs-gate">GATE · {interp(st.gate)}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
              <p className="fine">Edit it, add a step, or write your own. The default is strict.</p>
            </section>
            <section className="band" id="autos">
              <div className="band-head">
                <h2>Autopilots that come switched on.</h2>
                <p>
                  Three routines close the loop from alert to merged fix. Turn any off, or ask your Operator for a new one.
                </p>
              </div>
              <div className="autos">
                <article className="autocard" data-glow="">
                  <div>
                    <h3>
                      <svg className="ico">
                        <use href="/i15.svg#zap" />
                      </svg>
                      Issue intake
                    </h3>
                    <p>Every new error becomes an issue with a priority, a release and an owner. Duplicates merge.</p>
                    <div className="flow">
                      <img src="/assets/connectors/sentry.png" alt="Sentry" />
                      <img src="/assets/connectors/posthog.png" alt="PostHog" />
                      <img src="/assets/connectors/si/grafana.svg" alt="" />
                      <img src="/assets/connectors/linear.png" alt="Linear" />
                      <span className="arrow">→</span>Issues<em>· 4m 12s avg</em>
                    </div>
                  </div>
                  <span className="switch" aria-hidden="true" />
                </article>
                <article className="autocard" data-glow="">
                  <div>
                    <h3>
                      <svg className="ico">
                        <use href="/i15.svg#git-pull-request" />
                      </svg>
                      Fix &amp; review
                    </h3>
                    <p>Plan → Implement → Review → Verify. The reviewer is never the model that wrote the code.</p>
                    <div className="flow">
                      <img src="/assets/brands-v12/claude.svg" alt="Claude" />
                      <img src="/assets/brands-v12/codex.svg" alt="Codex" />
                      <span className="arrow">→</span>
                      <img src="/assets/connectors/github.png" alt="GitHub" />
                      Pull request<em>· waits for you</em>
                    </div>
                  </div>
                  <span className="switch" aria-hidden="true" />
                </article>
                <article className="autocard" data-glow="">
                  <div>
                    <h3>
                      <svg className="ico">
                        <use href="/i15.svg#eye" />
                      </svg>
                      Regression watch
                    </h3>
                    <p>After each merge, watch the error for 24 hours. If it returns, the issue reopens.</p>
                    <div className="flow">
                      <img src="/assets/connectors/sentry.png" alt="Sentry" />
                      <img src="/assets/connectors/datadog.png" alt="Datadog" />
                      <span className="arrow">→</span>Reopen or close<em>· 24h</em>
                    </div>
                  </div>
                  <span className="switch" aria-hidden="true" />
                </article>
              </div>
            </section>
            <section className="band" id="connectors">
              <div className="band-head">
                <h2>Connect what you already run.</h2>
                <p>Read-only until you approve a change.</p>
              </div>
              <div className="conngrid">
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/sentry.png" alt="" />
                  Sentry
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/posthog.png" alt="" />
                  PostHog
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/si/grafana.svg" alt="" />
                  Grafana
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/datadog.png" alt="" />
                  Datadog
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/si/newrelic.svg" alt="" />
                  New Relic
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/honeycomb.png" alt="" />
                  Honeycomb
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/incident-io.png" alt="" />
                  incident.io
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/linear.png" alt="" />
                  Linear
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/github.png" alt="" />
                  GitHub
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/gitlab.png" alt="" />
                  GitLab
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/slack.png" alt="" />
                  Slack
                </div>
                <div className="conn" data-glow="">
                  <img src="/assets/connectors/vercel.png" alt="" />
                  Vercel
                </div>
              </div>
            </section>
            <section className="band" id="models">
              <div className="grid2">
                <div className="band-head">
                  <h2>Your models. Your subscriptions.</h2>
                  <p>
                    Connect the plans you already pay for; runs on them cost no credit. Unfiltered open-weight models from
                    day one.
                  </p>
                </div>
                <div className="models">
                  <div className="modelrow" data-glow="">
                    <img src="/assets/brands-v12/claude.svg" alt="" />
                    <div>
                      <h3>Claude</h3>
                      <p>Opus plans, Sonnet builds.</p>
                    </div>
                    <span className="tag">$0 CREDIT</span>
                  </div>
                  <div className="modelrow" data-glow="">
                    <img src="/assets/brands-v12/codex.svg" alt="" />
                    <div>
                      <h3>Codex</h3>
                      <p>Reviews code a different model wrote.</p>
                    </div>
                    <span className="tag">$0 CREDIT</span>
                  </div>
                  <div className="modelrow" data-glow="">
                    <span className="m">
                      <svg className="ico">
                        <use href="/i15.svg#eye" />
                      </svg>
                    </span>
                    <div>
                      <h3>Unfiltered open-weight models</h3>
                      <p>No provider refusals. Your workspace, your rules.</p>
                      <div className="chips">
                        <span>DeepSeek 4.1 Flash Uncensored</span>
                        <span>GLM 5.3 Flash Uncensored</span>
                        <span>+ 6 more</span>
                      </div>
                    </div>
                    <span className="tag hi">DAY ONE</span>
                  </div>
                  <div className="modelrow" data-glow="">
                    <img src="/assets/brands-v12/openrouter.svg" alt="" />
                    <div>
                      <h3>Anything else</h3>
                      <p>Any model via OpenRouter, list price + 10%.</p>
                    </div>
                    <span className="tag">METERED</span>
                  </div>
                </div>
              </div>
            </section>
            <section className="inverse" id="apps">
              <div className="inv-inner">
                <div className="inv-grid">
                  <div className="band-head">
                    <span className="eb">DESKTOP · MOBILE · YOUR HARDWARE</span>
                    <h2>On your desk. In your pocket.</h2>
                    <p>
                      Browser, desktop, phone. The desktop daemon drives the coding CLIs you already licence, on your own
                      machine, for $0.00.
                    </p>
                    <div className="inv-cta">
                      <button className="btn accent lg" onClick={v.openMac}>
                        <svg className="ico fill">
                          <use href="/assets/icons/platforms.svg#apple" />
                        </svg>
                        Download for Mac
                      </button>
                      <button className="btn ghost lg" onClick={v.openApps}>
                        All platforms
                      </button>
                    </div>
                  </div>
                  <div className="devices">
                    <button className="device" data-glow="dark" onClick={v.openMac}>
                      <svg className="ico fill">
                        <use href="/assets/icons/platforms.svg#apple" />
                      </svg>
                      <strong>macOS</strong>
                      <small>Apple silicon · Intel</small>
                    </button>
                    <button className="device" data-glow="dark" onClick={v.openWin}>
                      <svg className="ico fill">
                        <use href="/assets/icons/platforms.svg#windows" />
                      </svg>
                      <strong>Windows</strong>
                      <small>Windows 11</small>
                    </button>
                    <button className="device" data-glow="dark" onClick={v.openIos}>
                      <svg className="ico fill">
                        <use href="/assets/icons/platforms.svg#apple" />
                      </svg>
                      <strong>iPhone</strong>
                      <small>App Store</small>
                    </button>
                    <button className="device" data-glow="dark" onClick={v.openAndroid}>
                      <svg className="ico fill">
                        <use href="/assets/icons/platforms.svg#google-play" />
                      </svg>
                      <strong>Android</strong>
                      <small>Google Play</small>
                    </button>
                  </div>
                </div>
                <div className="harness">
                  <span className="eb">16 CODING HARNESSES · LOCAL RUNTIMES FREE FOREVER</span>
                  <div className="hlogos">
                    <span className="hl">
                      <img src="/assets/coding-accounts/claude-code.svg" alt="" />
                      Claude Code
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/codex.svg" alt="" />
                      Codex
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/cursor.svg" alt="" />
                      Cursor Agent
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/copilot.svg" alt="" />
                      Copilot CLI
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/gemini.svg" alt="" />
                      Gemini CLI
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/opencode.svg" alt="" />
                      OpenCode
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/hermes.webp" alt="" />
                      Hermes
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/kimi.svg" alt="" />
                      Kimi
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/qwen-code.svg" alt="" />
                      Qwen Code
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/kiro.svg" alt="" />
                      Kiro CLI
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/antigravity.png" alt="" />
                      Antigravity
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/openclaw.svg" alt="" />
                      OpenClaw
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/codebuddy.svg" alt="" />
                      CodeBuddy
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/pi.svg" alt="" />
                      Pi
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/qoder.svg" alt="" />
                      Qoder CLI
                    </span>
                    <span className="hl">
                      <img src="/assets/coding-accounts/trae.png" alt="" />
                      Trae CLI
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <section className="band" id="plans">
              <div className="band-head">
                <h2>The tier gates scale, never features.</h2>
                <p>Every feature is on Free. Per workspace, unlimited members. 14 days of Team to start, no card.</p>
              </div>
              <div className="toggle" role="group" aria-label="Billing period">
                <button className={v.monthlyCls} onClick={v.setMonthly}>
                  Monthly
                </button>
                <button className={v.annualCls} onClick={v.setAnnual}>
                  Annual <small>2 months free</small>
                </button>
              </div>
              <div className="plans">
                {(v.plans ?? []).map((p: any, i: number) => (
                  <Fragment key={i}>
                    <article className={p.cls} data-glow="">
                      <div className="plan-top">
                        <h3>{interp(p.name)}</h3>
                        <span className="tag">{interp(p.tag)}</span>
                      </div>
                      <p className="price">
                        {interp(p.price)}
                        <small>{interp(p.unit)}</small>
                      </p>
                      <p className="price-note">{interp(p.sub)}</p>
                      <p className="conc">
                        {interp(p.conc)}
                        <small>fixes running at the same time</small>
                      </p>
                      <ul>
                        <li>
                          <b>{interp(p.runs)}</b>
                          <span>autopilot runs a month</span>
                        </li>
                        <li>
                          <b>{interp(p.storage)}</b>
                          <span>storage included</span>
                        </li>
                      </ul>
                      <button className={p.btnCls} onClick={v.startFree}>
                        {interp(p.cta)}
                      </button>
                      <p className="plan-fine">{interp(p.note)}</p>
                    </article>
                  </Fragment>
                ))}
              </div>
              <div className="strip">
                <span className="eb">FREE FOREVER</span>
                <span>Local runtimes</span>
                <span>Your own accounts</span>
                <span>Every feature</span>
                <button className="tbtn" onClick={v.openMeters}>
                  Metered prices →
                </button>
              </div>
            </section>
            <section className="close">
              <h2>
                Connect Sentry.
                <br />
                Wake up to pull requests.
              </h2>
              <p>About two minutes. Nothing merges without you.</p>
              <button className="btn accent lg" onClick={v.startFree}>
                Start free
              </button>
            </section>
            <footer className="foot2">
              <div className="foot-grid">
                <div className="foot-brand">
                  <span className="logo">
                    <img src="/assets/logo/botinc-mark.svg" alt="" />
                    BotInc
                  </span>
                  <p>Errors come in. Pull requests come out.</p>
                  <span className="eb">APACHE 2.0 · NO CARD · UNINSTALLS IN ONE COMMAND</span>
                </div>
                <div className="foot-col">
                  <h4>Product</h4>
                  <button onClick={v.goHow}>How it works</button>
                  <button onClick={v.goRouting}>Smart routing</button>
                  <button onClick={v.goAutos}>Autopilots</button>
                  <button onClick={v.goModels}>Models</button>
                  <button onClick={v.goPlans}>Pricing</button>
                </div>
                <div className="foot-col">
                  <h4>Apps</h4>
                  <button onClick={v.openMac}>macOS</button>
                  <button onClick={v.openWin}>Windows</button>
                  <button onClick={v.openIos}>iPhone</button>
                  <button onClick={v.openAndroid}>Android</button>
                  <button onClick={v.openApps}>Install the daemon</button>
                </div>
                <div className="foot-col">
                  <h4>Company</h4>
                  <span>Documentation</span>
                  <span>GitHub</span>
                  <span>About</span>
                  <span>Privacy</span>
                  <span>Terms</span>
                </div>
              </div>
              <div className="foot-bottom">
                <span>© 2026 BotInc, Inc. · San Francisco</span>
                <div>
                  <button onClick={v.toggleTheme}>{interp(v.appearance)} appearance</button>
                  <span>See how Operator works</span>
                </div>
              </div>
            </footer>
          </main>
        </>
      ) : null}
      {v.onSignin ? (
        <>
          <div className="ob-shell">
            <div className="ob-field" aria-hidden="true">
              <DotWave gap={14} dot={1} force={22} radius={132} speed={640} band={112} life={2.2} opacity={0.14} color="255,255,255" />
            </div>
            <div className="ob-scrim" aria-hidden="true" />
            <header className="nav">
              <button className="logo" onClick={v.back}>
                <img src="/assets/logo/botinc-mark.svg" alt="" />
                BotInc
              </button>
              <button className="tbtn muted" onClick={v.back}>
                Back
              </button>
            </header>
            <main className="ob" data-screen-label="Onboarding 1 · Sign in">
              <div className="ob-card narrow">
                <div className="ob-progress">
                  <i className="on" />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <img className="mark" src="/assets/logo/botinc-mark.svg" alt="" />
                <h1>Open your workspace.</h1>
                <p>Free to start. 14 days of Team included. No card.</p>
                <button className="btn lg full" onClick={v.googleSignIn}>
                  <img src="/assets/brands-v15/google.svg" alt="" />
                  Continue with Google
                </button>
                <button className="btn lg full" onClick={v.githubSignIn}>
                  <img src="/assets/brands-v12/github.svg" alt="" />
                  Continue with GitHub
                </button>
                <div className="or">
                  <span>or</span>
                </div>
                <EmailSignIn v={v} />
              </div>
            </main>
          </div>
        </>
      ) : null}
      {v.onGoals ? (
        <>
          <div className="ob-shell">
            <div className="ob-field" aria-hidden="true">
              <DotWave gap={14} dot={1} force={22} radius={132} speed={640} band={112} life={2.2} opacity={0.14} color="255,255,255" />
            </div>
            <div className="ob-scrim" aria-hidden="true" />
            <header className="nav">
              <button className="logo" onClick={v.back}>
                <img src="/assets/logo/botinc-mark.svg" alt="" />
                BotInc
              </button>
              <button className="tbtn muted" onClick={v.toConnect}>
                Skip
              </button>
            </header>
            <main className="ob" data-screen-label="Onboarding 2 · What to handle">
              <div className="ob-card">
                <div className="ob-progress">
                  <i className="on" />
                  <i className="on" />
                  <i />
                  <i />
                  <i />
                </div>
                <h1>What should BotInc handle for you?</h1>
                <p>Pick any. This decides which connections and autopilots come next.</p>
                <div className="goals">
                  {(v.goals ?? []).map((g: any, i: number) => (
                    <Fragment key={i}>
                      <button className={g.cls} data-glow="" onClick={g.toggle} aria-pressed={g.on}>
                        <span className="gi">
                          <svg className="ico">
                            <use href={g.href} />
                          </svg>
                        </span>
                        <span className="gt">
                          {interp(g.t)}
                          <small>{interp(g.sub)}</small>
                        </span>
                        <span className="glogos">
                          {g.hasSentry ? (
                            <>
                              <img src="/assets/connectors/sentry.png" alt="" />
                            </>
                          ) : null}
                          {g.hasPosthog ? (
                            <>
                              <img src="/assets/connectors/posthog.png" alt="" />
                            </>
                          ) : null}
                          {g.hasLinear ? (
                            <>
                              <img src="/assets/connectors/linear.png" alt="" />
                            </>
                          ) : null}
                          {g.hasGithub ? (
                            <>
                              <img src="/assets/connectors/github.png" alt="" />
                            </>
                          ) : null}
                          {g.hasClaude ? (
                            <>
                              <img src="/assets/brands-v12/claude.svg" alt="" />
                            </>
                          ) : null}
                          {g.hasCodex ? (
                            <>
                              <img src="/assets/brands-v12/codex.svg" alt="" />
                            </>
                          ) : null}
                        </span>
                        <span className="box">
                          {g.on ? (
                            <>
                              <svg className="ico">
                                <use href="/i15.svg#check" />
                              </svg>
                            </>
                          ) : null}
                        </span>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div className="ob-actions">
                  <button className="btn accent lg full" onClick={v.toConnect}>
                    Continue
                  </button>
                </div>
              </div>
            </main>
          </div>
        </>
      ) : null}
      {v.onConnect ? (
        <>
          <div className="ob-shell">
            <div className="ob-field" aria-hidden="true">
              <DotWave gap={14} dot={1} force={22} radius={132} speed={640} band={112} life={2.2} opacity={0.14} color="255,255,255" />
            </div>
            <div className="ob-scrim" aria-hidden="true" />
            <header className="nav">
              <button className="logo" onClick={v.back}>
                <img src="/assets/logo/botinc-mark.svg" alt="" />
                BotInc
              </button>
              <button className="tbtn muted" onClick={v.toModels}>
                Skip for now
              </button>
            </header>
            <main className="ob" data-screen-label="Onboarding 3 · Connect">
              <div className="ob-card">
                <div className="ob-progress">
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                  <i />
                  <i />
                </div>
                <h1>Connect what you already run.</h1>
                <p>Read-only until you approve a change. {interp(v.connectHint)}.</p>
                <div className="cards">
                  {(v.sources ?? []).map((c: any, i: number) => (
                    <Fragment key={i}>
                      <div className={c.cls} data-glow="">
                        {c.isSentry ? (
                          <>
                            <img src="/assets/connectors/sentry.png" alt="" />
                          </>
                        ) : null}
                        {c.isPosthog ? (
                          <>
                            <img src="/assets/connectors/posthog.png" alt="" />
                          </>
                        ) : null}
                        {c.isDatadog ? (
                          <>
                            <img src="/assets/connectors/datadog.png" alt="" />
                          </>
                        ) : null}
                        {c.isLinear ? (
                          <>
                            <img src="/assets/connectors/linear.png" alt="" />
                          </>
                        ) : null}
                        {c.isGithub ? (
                          <>
                            <img src="/assets/connectors/github.png" alt="" />
                          </>
                        ) : null}
                        {c.isGrafana ? (
                          <>
                            <img src="/assets/connectors/si/grafana.svg" alt="" />
                          </>
                        ) : null}
                        {c.isNewrelic ? (
                          <>
                            <img src="/assets/connectors/si/newrelic.svg" alt="" />
                          </>
                        ) : null}
                        {c.required ? (
                          <>
                            <span className="req">REQUIRED</span>
                          </>
                        ) : null}
                        <h3>{interp(c.name)}</h3>
                        <p>{interp(c.sub)}</p>
                        {c.done ? (
                          <>
                            <span className="ok">
                              <svg className="ico">
                                <use href="/i15.svg#check" />
                              </svg>
                              Connected
                            </span>
                          </>
                        ) : null}
                        {c.pending ? (
                          <>
                            <button className="btn sm" onClick={c.connect}>
                              Connect
                            </button>
                          </>
                        ) : null}
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div className="ob-actions">
                  <button className="btn accent lg full" onClick={v.toModels}>
                    Continue
                  </button>
                  <button className="tbtn muted" onClick={v.backGoals}>
                    Back
                  </button>
                </div>
                <p className="ob-fine">Connections are authorized after you sign in. Nothing is read without your approval.</p>
              </div>
            </main>
          </div>
        </>
      ) : null}
      {v.onModels ? (
        <>
          <div className="ob-shell">
            <div className="ob-field" aria-hidden="true">
              <DotWave gap={14} dot={1} force={22} radius={132} speed={640} band={112} life={2.2} opacity={0.14} color="255,255,255" />
            </div>
            <div className="ob-scrim" aria-hidden="true" />
            <header className="nav">
              <button className="logo" onClick={v.back}>
                <img src="/assets/logo/botinc-mark.svg" alt="" />
                BotInc
              </button>
              <button className="tbtn muted" onClick={v.toAutos}>
                Use BotInc credit
              </button>
            </header>
            <main className="ob" data-screen-label="Onboarding 4 · Models">
              <div className="ob-card">
                <div className="ob-progress">
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                  <i />
                </div>
                <h1>Connect the subscriptions you already pay for.</h1>
                <p>
                  Runs start on the account with the most capacity left and switch mid-task when one hits its limit. Nothing
                  stops, nothing to log into again. Runs on your accounts cost no credit.
                </p>
                <div className="cards">
                  <div className="card d1" data-glow="">
                    <img src="/assets/brands-v12/claude.svg" alt="" />
                    <h3>Claude</h3>
                    <p>Your Anthropic subscription. Plans and implements.</p>
                    {v.claudeOn ? (
                      <>
                        <span className="ok">
                          <svg className="ico">
                            <use href="/i15.svg#check" />
                          </svg>
                          Connected
                        </span>
                      </>
                    ) : null}
                    {!v.claudeOn ? (
                      <>
                        <button className="btn sm" onClick={v.connectClaude}>
                          Connect
                        </button>
                      </>
                    ) : null}
                  </div>
                  <div className="card d2" data-glow="">
                    <img src="/assets/brands-v12/codex.svg" alt="" />
                    <h3>Codex</h3>
                    <p>Your OpenAI subscription. Reviews the code.</p>
                    {v.codexOn ? (
                      <>
                        <span className="ok">
                          <svg className="ico">
                            <use href="/i15.svg#check" />
                          </svg>
                          Connected
                        </span>
                      </>
                    ) : null}
                    {!v.codexOn ? (
                      <>
                        <button className="btn sm" onClick={v.connectCodex}>
                          Connect
                        </button>
                      </>
                    ) : null}
                  </div>
                  <div className="card d3" data-glow="">
                    <img src="/assets/coding-accounts/cursor.svg" alt="" />
                    <h3>Cursor</h3>
                    <p>Your Cursor Pro plan. Joins the rotation.</p>
                    {v.cursorOn ? (
                      <>
                        <span className="ok">
                          <svg className="ico">
                            <use href="/i15.svg#check" />
                          </svg>
                          Connected
                        </span>
                      </>
                    ) : null}
                    {!v.cursorOn ? (
                      <>
                        <button className="btn sm" onClick={v.connectCursor}>
                          Connect
                        </button>
                      </>
                    ) : null}
                  </div>
                  <div className="card d4" data-glow="">
                    <img src="/assets/coding-accounts/copilot.svg" alt="" />
                    <h3>Copilot</h3>
                    <p>Your GitHub Copilot seat. Joins the rotation.</p>
                    {v.copilotOn ? (
                      <>
                        <span className="ok">
                          <svg className="ico">
                            <use href="/i15.svg#check" />
                          </svg>
                          Connected
                        </span>
                      </>
                    ) : null}
                    {!v.copilotOn ? (
                      <>
                        <button className="btn sm" onClick={v.connectCopilot}>
                          Connect
                        </button>
                      </>
                    ) : null}
                  </div>
                  <div className="card d5" data-glow="">
                    <span className="glyph">
                      <svg className="ico" style={{ width: "15px", height: "15px" }}>
                        <use href="/i15.svg#eye" />
                      </svg>
                    </span>
                    <h3>Unfiltered models</h3>
                    <p>DeepSeek 4.1 Flash, GLM 5.3 Flash, Qwen 4, Llama 5. No provider filter.</p>
                    <button
                      className={v.uncCls}
                      onClick={v.toggleUnc}
                      role="switch"
                      aria-label="Unfiltered models"
                      style={{ marginTop: "4px" }}
                    />
                  </div>
                </div>
                <div className="apirow">
                  <div>
                    <strong>When every subscription is out</strong>
                    <p>{interp(v.apiCopy)}</p>
                  </div>
                  <button className={v.apiCls} onClick={v.toggleApi} role="switch" aria-label="API fallback" />
                </div>
                <div className="ob-actions">
                  <button className="btn accent lg full" onClick={v.toAutos}>
                    Continue
                  </button>
                  <button className="tbtn muted" onClick={v.backConnect}>
                    Back
                  </button>
                </div>
                <p className="ob-fine">
                  Review always runs on a different model than the one that wrote the code. Unfiltered models are metered
                  like any other.
                </p>
              </div>
            </main>
          </div>
        </>
      ) : null}
      {v.onAutos ? (
        <>
          <div className="ob-shell">
            <div className="ob-field" aria-hidden="true">
              <DotWave gap={14} dot={1} force={22} radius={132} speed={640} band={112} life={2.2} opacity={0.14} color="255,255,255" />
            </div>
            <div className="ob-scrim" aria-hidden="true" />
            <header className="nav">
              <button className="logo" onClick={v.back}>
                <img src="/assets/logo/botinc-mark.svg" alt="" />
                BotInc
              </button>
            </header>
            <main className="ob" data-screen-label="Onboarding 5 · Autopilots">
              <div className="ob-card">
                <div className="ob-progress">
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                  <i className="on" />
                </div>
                <h1>These start the moment you open the workspace.</h1>
                <p>Watching {interp(v.repoLabel)}. Nothing merges without your approval.</p>
                <div className="autolist">
                  {(v.autos ?? []).map((a: any, i: number) => (
                    <Fragment key={i}>
                      <div className={a.rowCls}>
                        <div>
                          <h3>
                            <svg className="ico">
                              <use href={a.href} />
                            </svg>
                            {interp(a.t)}
                          </h3>
                          <p>{interp(a.sub)}</p>
                          <div className="flow">
                            {a.isIntake ? (
                              <>
                                <img src="/assets/connectors/sentry.png" alt="" />
                                <img src="/assets/connectors/posthog.png" alt="" />
                                <img src="/assets/connectors/si/grafana.svg" alt="" />
                                <span className="arrow">→</span>Issues
                              </>
                            ) : null}
                            {a.isFix ? (
                              <>
                                <img src="/assets/brands-v12/claude.svg" alt="" />
                                <img src="/assets/brands-v12/codex.svg" alt="" />
                                <span className="arrow">→</span>
                                <img src="/assets/connectors/github.png" alt="" />
                                Pull request
                              </>
                            ) : null}
                            {a.isWatch ? (
                              <>
                                <img src="/assets/connectors/sentry.png" alt="" />
                                <span className="arrow">→</span>Reopen or close<em>· 24h</em>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <button className={a.cls} onClick={a.toggle} role="switch" aria-label={a.t} />
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div className="ob-actions">
                  <button className="btn accent lg full" onClick={v.finish}>
                    Turn on {interp(v.autosPlural)} and open my workspace
                  </button>
                  <button className="tbtn muted" onClick={v.backModels}>
                    Back
                  </button>
                </div>
              </div>
            </main>
          </div>
        </>
      ) : null}
      {v.inApp ? (
        <>
          <div className="appwrap" data-screen-label="Workspace · first fix underway">
            <div style={{ display: "block", width: "100%", height: "100%" }}><ThreadShell
              d={v.l}
              steps={v.lSteps}
              msgs={v.msgs}
              introRows={v.introRows}
              arriving={v.arriving}
              callOn={v.callOn}
              callText={v.callText}
              callEnd={v.callEnd}
              view={v.appView}
              setView={v.setAppView}
              theme={v.theme}
              value={v.draft}
              onChange={v.editDraft}
              onKeyDown={v.keyDown}
              send={v.send}
              sendDisabled={v.cannotSend}
              approve={v.approve}
              openReceipt={v.openReceipt}
              getApps={v.openApps}
              openPlans={v.openPlans}
              toggleTheme={v.toggleTheme}
              autosCount={v.autosCount}
              balance={v.balanceLabel}
              showAppsNote={true}
              loading={v.booting} /></div>
          </div>
        </>
      ) : null}
      {v.dialogOpen ? (
        <>
          <div
            className="modal-shade l4-dlg app app-v9 app-v10 app-v11 app-v12 app-v13 app-v14 app-v19"
            data-theme={v.theme}
            onClick={v.backdrop}
          >
            <section className={v.dialogCls} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
              <button className="modal-close icon-button" aria-label="Close dialog" onClick={v.closeDialog}>
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
                  <use href="/i15.svg#x" />
                </svg>
              </button>
              {v.connectDialog ? (
                <>
                  <span className="eyebrow">{interp(v.connectApp)} · YOUR CONNECTION</span>
                  <h2 id="dialog-title">{interp(v.connectTitle)}</h2>
                  <p className="dialog-copy">{interp(v.connectCopy)}</p>
                  <label className="field-label" htmlFor="connection-scope">
                    {interp(v.scopeLabel)}
                  </label>
                  <input
                    id="connection-scope"
                    className="field"
                    value={v.scope}
                    onChange={v.editScope}
                    aria-label="Connection scope"
                  />
                  <div className="permission-box">
                    <strong>What your Operator can access</strong>
                    <p>{interp(v.permissions)}</p>
                  </div>
                  {v.isIssueSource ? (
                    <>
                      <label className="check-row">
                        <input type="checkbox" checked={true} readOnly={true} />
                        <span>
                          Bring selected issues into shared Work.
                          <small>Members with access can see their titles, descriptions, and results.</small>
                        </span>
                      </label>
                    </>
                  ) : null}
                  <div className="dialog-actions">
                    <button className="small-button" onClick={v.closeDialog}>
                      Cancel
                    </button>
                    <button className="small-button primary" onClick={v.finishConnect}>
                      {interp(v.connectButton)}
                    </button>
                  </div>
                  <p className="fine">Sign in to authorize this connection securely.</p>
                </>
              ) : null}
              {v.accountDialog ? (
                <>
                  <h2 id="dialog-title">Add a model account</h2>
                  <p className="dialog-copy">Your subscription or your API key. Only your work can use it.</p>
                  <div className="account-methods10">
                    <button className={v.signinCls} onClick={v.setSignin}>
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
                        <use href="/i15.svg#user-round" />
                      </svg>
                      Sign in
                    </button>
                    <button className={v.apiClsBtn} onClick={v.setApi}>
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
                        <use href="/i15.svg#key-round" />
                      </svg>
                      API key
                    </button>
                  </div>
                  {v.isSignin ? (
                    <>
                      {(v.providers ?? []).map((p: any, i: number) => (
                        <Fragment key={i}>
                          <button className="picker-row10" onClick={p.pick}>
                            {p.isClaude ? (
                              <>
                                <img className="brand12" src="/assets/brands-v12/claude.svg" alt="" />
                              </>
                            ) : null}
                            {p.isCodex ? (
                              <>
                                <img className="brand12 mono12" src="/assets/brands-v12/codex.svg" alt="" />
                              </>
                            ) : null}
                            {p.isCursor ? (
                              <>
                                <img className="brand12" src="/assets/coding-accounts/cursor.svg" alt="" />
                              </>
                            ) : null}
                            {p.isCopilot ? (
                              <>
                                <img className="brand12" src="/assets/coding-accounts/copilot.svg" alt="" />
                              </>
                            ) : null}
                            {p.isGemini ? (
                              <>
                                <img className="brand12" src="/assets/coding-accounts/gemini.svg" alt="" />
                              </>
                            ) : null}
                            {p.isOpenrouter ? (
                              <>
                                <img className="brand12" src="/assets/brands-v12/openrouter.svg" alt="" />
                              </>
                            ) : null}
                            <span>
                              <strong>{interp(p.name)}</strong>
                              <small>{interp(p.copy)}</small>
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
                              <use href="/i15.svg#chevron-right" />
                            </svg>
                          </button>
                        </Fragment>
                      ))}
                    </>
                  ) : null}
                  {v.isApi ? (
                    <>
                      <label className="field-label" htmlFor="api-key">
                        {interp(v.accountApp)} API key
                      </label>
                      <input id="api-key" className="field" placeholder="sk-…" aria-label="API key" />
                      <div className="dialog-actions">
                        <button className="small-button" onClick={v.closeDialog}>
                          Cancel
                        </button>
                        <button className="small-button primary" onClick={v.finishAccount}>
                          Add account
                        </button>
                      </div>
                    </>
                  ) : null}
                  <p className="fine">
                    Sign in to continue to the provider&apos;s secure authorization screen.
                  </p>
                </>
              ) : null}
              {v.plansDialog ? (
                <>
                  <span className="eyebrow">PLANS AND CREDITS</span>
                  <h2 id="dialog-title">The tier gates scale, never features.</h2>
                  <p className="dialog-copy">
                    Every feature is on Free. Paid plans run more sessions at once. Usage prices are identical on every
                    tier.
                  </p>
                  <button className="menu-row">
                    <span>Free · 1 concurrent session</span>
                    <span>$0</span>
                  </button>
                  <button className="menu-row">
                    <span>Pro · 5 concurrent sessions</span>
                    <span>$75 / mo</span>
                  </button>
                  <button className="menu-row">
                    <span>Team · unlimited sessions · shared work</span>
                    <span>$150 / mo</span>
                  </button>
                  <p className="fine">Per workspace, USD before tax. Your 14 days of Team are running. Top-ups from $5.</p>
                </>
              ) : null}
              {v.receiptDialog ? (
                <>
                  <span className="eyebrow">RECEIPT · BOT-42</span>
                  <h2 id="dialog-title">Recompute discount and tax on every quantity change.</h2>
                  <div className="line">
                    <span>Plan · Claude Opus 5 · your subscription</span>
                    <span>$0.00</span>
                  </div>
                  <div className="line">
                    <span>Implement · Claude Sonnet 5 · your subscription</span>
                    <span>$0.00</span>
                  </div>
                  <div className="line">
                    <span>Review · GPT-6 Astra · pooled, list +10%</span>
                    <span>$0.00</span>
                  </div>
                  <div className="line">
                    <span>Cloud sandbox · 2 vCPU · 4 GiB · 1m 26s</span>
                    <span>$0.02</span>
                  </div>
                  <div className="line total">
                    <span>Total from credit</span>
                    <span>$0.02</span>
                  </div>
                  <p className="fine">Illustrative usage. Actual receipts come from completed runs.</p>
                </>
              ) : null}
              {v.metersDialog ? (
                <>
                  <span className="eyebrow">METERED PRICES · IDENTICAL ON EVERY TIER</span>
                  <h2 id="dialog-title">Metered prices, unrounded.</h2>
                  <p className="dialog-copy">Anything on your own hardware or your own provider accounts is free.</p>
                  <table className="meters">
                    <tbody>
                      <tr>
                        <td>Cloud sandbox compute, billed per second</td>
                        <td>$0.08 / vCPU-h + $0.0225 / GiB-h</td>
                      </tr>
                      <tr>
                        <td>Reference: 2 vCPU + 4 GiB</td>
                        <td>$0.25 / hour</td>
                      </tr>
                      <tr>
                        <td>Storage beyond the tier, prorated hourly</td>
                        <td>$0.10 / GB-month</td>
                      </tr>
                      <tr>
                        <td>Managed model tokens, pooled accounts</td>
                        <td>list price + 10%</td>
                      </tr>
                      <tr>
                        <td>Unfiltered open-weight models</td>
                        <td>list price + 10%</td>
                      </tr>
                      <tr>
                        <td>Top-up fee</td>
                        <td>5%, $0.60 minimum</td>
                      </tr>
                      <tr>
                        <td>Local runtimes · BYO provider accounts</td>
                        <td>$0.00</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="fine">
                    Per-task cap $5 by default. Alerts at 50 / 80 / 100%. Running tasks are never killed for a low balance.
                    Credits expire after 12 months.
                  </p>
                </>
              ) : null}
              {v.appsDialog ? (
                <>
                  <span className="eyebrow">DESKTOP AND MOBILE</span>
                  <h2 id="dialog-title">{interp(v.appTitle)}</h2>
                  <p className="dialog-copy">{interp(v.appCopy)}</p>
                  <div className="plat-tabs" role="tablist">
                    <button className={v.tabMac} role="tab" onClick={v.openMac}>
                      <svg className="ico fill">
                        <use href="/assets/icons/platforms.svg#apple" />
                      </svg>
                      macOS
                    </button>
                    <button className={v.tabWin} role="tab" onClick={v.openWin}>
                      <svg className="ico fill">
                        <use href="/assets/icons/platforms.svg#windows" />
                      </svg>
                      Windows
                    </button>
                    <button className={v.tabIos} role="tab" onClick={v.openIos}>
                      <svg className="ico fill">
                        <use href="/assets/icons/platforms.svg#apple" />
                      </svg>
                      iPhone
                    </button>
                    <button className={v.tabAndroid} role="tab" onClick={v.openAndroid}>
                      <svg className="ico fill">
                        <use href="/assets/icons/platforms.svg#google-play" />
                      </svg>
                      Android
                    </button>
                  </div>
                  {v.appIsDesktop ? (
                    <>
                      <div className="dl-card">
                        <span className="dl-mark">
                          <svg className="ico fill">
                            <use href={v.appMarkHref} />
                          </svg>
                        </span>
                        <div>
                          <strong>{interp(v.appFile)}</strong>
                          <small>{interp(v.appReq)}</small>
                        </div>
                        <button className="btn accent" onClick={v.fakeDownload}>
                          <svg className="ico">
                            <use href="/i15.svg#download" />
                          </svg>
                          Download
                        </button>
                      </div>
                      {v.appIsMac ? (
                        <>
                          <p className="ob-label" style={{ marginTop: "2px" }}>
                            Or install the daemon alone
                          </p>
                          <div className="cmd">
                            <code>curl -fsSL https://botinc.ai/install | bash</code>
                            <button className="tbtn" onClick={v.copyInstall}>
                              {interp(v.copyLabel)}
                            </button>
                          </div>
                        </>
                      ) : null}
                      {v.appIsWin ? (
                        <>
                          <p className="ob-label" style={{ marginTop: "2px" }}>
                            Or install the daemon alone
                          </p>
                          <div className="cmd">
                            <code>winget install BotInc.Daemon</code>
                            <button className="tbtn" onClick={v.copyInstall}>
                              {interp(v.copyLabel)}
                            </button>
                          </div>
                        </>
                      ) : null}
                      <p className="fine">
                        The desktop app runs your local coding CLIs on your own hardware. Local runtimes cost $0.00.
                      </p>
                    </>
                  ) : null}
                  {v.appIsMobile ? (
                    <>
                      <div className="qr-card">
                        {v.appIsIos ? (
                          <>
                            <img
                              src="https://api.qrserver.com/v1/create-qr-code/?size=336x336&margin=0&data=https%3A%2F%2Fapps.apple.com%2Fapp%2Fbotinc%2Fid6740000000"
                              alt="QR code to the App Store listing"
                              width="168"
                              height="168"
                            />
                          </>
                        ) : null}
                        {v.appIsAndroid ? (
                          <>
                            <img
                              src="https://api.qrserver.com/v1/create-qr-code/?size=336x336&margin=0&data=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dai.botinc.console"
                              alt="QR code to the Google Play listing"
                              width="168"
                              height="168"
                            />
                          </>
                        ) : null}
                        <div className="qr-side">
                          <span className="store-badge">
                            <svg className="ico fill">
                              <use href={v.appMarkHref} />
                            </svg>
                            <span>
                              <small>{interp(v.storeKicker)}</small>
                              <strong>{interp(v.storeName)}</strong>
                            </span>
                          </span>
                          <p>
                            Point your camera at the code. It opens the {interp(v.storeName)} listing on your phone. The
                            console travels; the daemon stays home.
                          </p>
                          <code className="mono">{interp(v.storeUrl)}</code>
                        </div>
                      </div>
                      <div className="dlg-actions">
                        <button className="btn" onClick={v.copyStore}>
                          {interp(v.copyLabel)}
                        </button>
                        <button className="btn accent" onClick={v.fakeDownload}>
                          Open the listing
                        </button>
                      </div>
                      <p className="fine">Push when a fix is ready. Nothing merges without you.</p>
                    </>
                  ) : null}
                </>
              ) : null}
              {v.previewDialog ? (
                <>
                  <span className="eyebrow">INTERACTIVE PREVIEW</span>
                  <h2 id="dialog-title">Try the flow.</h2>
                  <p className="dialog-copy">Prototype controls, separate from the customer experience.</p>
                  <button className="menu-row" onClick={v.restart}>
                    <span>Landing page</span>
                    <span>→</span>
                  </button>
                  <button className="menu-row" onClick={v.toSignin}>
                    <span>1 · Sign in</span>
                    <span>→</span>
                  </button>
                  <button className="menu-row" onClick={v.toGoals}>
                    <span>2 · What to handle</span>
                    <span>→</span>
                  </button>
                  <button className="menu-row" onClick={v.toConnectS}>
                    <span>3 · Connect</span>
                    <span>→</span>
                  </button>
                  <button className="menu-row" onClick={v.toModelsS}>
                    <span>4 · Models</span>
                    <span>→</span>
                  </button>
                  <button className="menu-row" onClick={v.toAutosS}>
                    <span>5 · Autopilots</span>
                    <span>→</span>
                  </button>
                  <button className="menu-row" onClick={v.toApp}>
                    <span>Workspace · first fix underway</span>
                    <span>→</span>
                  </button>
                  <button className="menu-row" onClick={v.toggleTheme}>
                    <span>Appearance</span>
                    <span>{interp(v.appearance)}</span>
                  </button>
                </>
              ) : null}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
