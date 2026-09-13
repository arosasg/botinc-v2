# BotInc current functionality reference

Read-only reference from origin/main `2ca6b4905e44092c6ebddb19724314b6cf2bff72`, inspected September 9, 2026.
This is source evidence for design coverage, not a production implementation or a guarantee about deployed state.
The live BotInc Skills page was inspected separately and showed written/imported skills, workspace sources, Used by assignments, folders, and the existing sidebar.

## Coverage mapping

| Current capability | Simplified destination |
|---|---|
| Home, inbox, issues, runs | Work with source, status, owner, conversation, and details pane |
| Private chat, agent and model selection, thinking, computer | New chat, recent conversations, and composer controls |
| Team chat and channels | Workspace menu > Team conversation; search retains shared conversations |
| Agents and accounts | Settings > Agents & models and Connections |
| Skills, files, imports, enablement, private memory | Settings > Skills & memory |
| Repositories and design systems | Settings > Repositories & design |
| Autopilots, routines, schedules | Settings > Automation |
| Workflow graphs, retries, child runs | Settings > Workflow graphs; task Activity has execution lineage |
| Computers and runtime health | Settings > Computers |
| Wallet, usage, invoices, top-ups, plan | Settings > Plan & credits |
| Workspace members and permissions | Settings > Team & permissions |
| Voice operator | Header Call, with credit and provider recovery states |

## Selected source excerpts

### packages/views/layout/app-sidebar.tsx

```tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@botinc/ui/lib/utils";
import { useScrollFade } from "@botinc/ui/hooks/use-scroll-fade";
import { BotIncIcon, type BotIncIconName } from "@botinc/brand/icon";
import { AppLink, useNavigation } from "../navigation";
import { SidebarDock, type RuntimeAccess } from "./sidebar-dock";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  KeyRound,
  Lock,
  Check,
  X,
} from "lucide-react";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@botinc/ui/components/ui/tooltip";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@botinc/ui/components/ui/collapsible";
import { CappedNumberFlow } from "@botinc/ui/components/ui/number-flow";
import { StatusIcon } from "../issues/components/status-icon";
import { useIssuesScopeStore } from "@botinc/core/issues/stores/issues-scope-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@botinc/ui/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@botinc/ui/components/ui/dropdown-menu";
import { useAuthStore } from "@botinc/core/auth";
import {
  useCurrentWorkspace,
  useWorkspacePaths,
  paths,
  type WorkspacePaths,
} from "@botinc/core/paths";
import { workspaceListOptions, myInvitationListOptions, myAccessOptions, workspaceKeys } from "@botinc/core/workspace/queries";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inboxKeys, deduplicateInboxItems, inboxUnreadSummaryOptions, hasOtherWorkspaceUnread, unreadWorkspaceIds } from "@botinc/core/inbox/queries";
import { chatSessionsOptions } from "@botinc/core/chat/queries";
import { channelsOptions, countUnreadChannels } from "@botinc/core/channels/queries";
import { countUnreadChatMessages } from "@botinc/core/chat/unread";
import { useChatStore } from "@botinc/core/chat";
import { api, ApiError } from "@botinc/core/api";
import { useModalStore } from "@botinc/core/modals";
import { useConfigStore } from "@botinc/core/config";
import { pinListOptions } from "@botinc/core/pins/queries";
import { useDeletePin, useReorderPins } from "@botinc/core/pins/mutations";
import { issueDetailOptions } from "@botinc/core/issues/queries";
import { projectDetailOptions } from "@botinc/core/projects/queries";
import type { MyAccess, PinnedItem } from "@botinc/core/types";
import { ProjectIcon } from "../projects/components/project-icon";
import { useT } from "../i18n";
import { useAppForeground } from "../common/use-app-foreground";
import { memoryIngestionSourcesOptions } from "@botinc/core/memory";
import { useImplementationPattern } from "@botinc/core/workspace";

// Top-level nav items stay active when the user is on a child route
// (e.g. "Projects" stays lit on /:slug/projects/:id). Pinned items keep
// strict equality elsewhere — a pinned project shouldn't highlight on
// sub-pages of itself.
function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

// Stable empty arrays for query defaults. Using an inline `= []` default on
// `useQuery` creates a new array reference on every render when `data` is
// undefined (e.g. query disabled or loading) — which in turn breaks any
// `useEffect`/`useMemo` that depends on the value, and can trigger infinite
// re-render loops when the effect itself calls `setState`.
const EMPTY_PINS: PinnedItem[] = [];
const EMPTY_WORKSPACES: Awaited<ReturnType<typeof api.listWorkspaces>> = [];
const EMPTY_INVITATIONS: Awaited<ReturnType<typeof api.listMyInvitations>> = [];
const EMPTY_INBOX: Awaited<ReturnType<typeof api.listInbox>> = [];
const EMPTY_INBOX_SUMMARY: Awaited<ReturnType<typeof api.getInboxUnreadSummary>> = [];
```

### packages/views/skills/components/skill-source-panes.tsx

```tsx
 * three. The old chooser made you commit to a source before you had typed
 * anything, and made changing your mind a trip backwards.
 */

export type SkillSource = "write" | "files" | "url";

/** The design's three source tiles: a label and the one line under it. */
export function SkillSourceRow({
  value,
  onChange,
  extra,
}: {
  value: SkillSource;
  onChange: (next: SkillSource) => void;
  /**
   * A fourth tile for a source the design does not have. The product's
   * runtime-local import is real and reachable today, so it stays.
   */
  extra?: { key: string; label: string; note: string; onPick: () => void };
}) {
  const { t } = useT("skills");
  const sources: { key: SkillSource; label: string; note: string }[] = [
    {
      key: "write",
      label: t(($) => $.create.source.write_label),
      note: t(($) => $.create.source.write_note),
    },
    {
      key: "files",
      label: t(($) => $.create.source.files_label),
      note: t(($) => $.create.source.files_note),
    },
    {
      key: "url",
      label: t(($) => $.create.source.url_label),
      note: t(($) => $.create.source.url_note),
    },
  ];

  const tile = (
    key: string,
    label: string,
    note: string,
    on: boolean,
    pick: () => void,
  ) => (
    <button
      key={key}
      type="button"
      aria-pressed={on}
      onClick={pick}
      className={cn(
        "grid gap-0.5 rounded-frame border px-3 py-2.5 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        on
          ? "border-foreground bg-surface-alt"
          : "border-surface-border bg-card hover:bg-accent",
      )}
    >
      <span className={cn("text-caption", on ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      <span className="text-micro leading-4 text-faint-foreground">{note}</span>
    </button>
  );

  return (
    <div className="grid gap-1.5">
```

### packages/views/agents/components/tabs/skills-tab.tsx

```tsx
}) {
  const { t } = useT("agents");
  const qc = useQueryClient();
  const wsId = useWorkspaceId();
  const { data: workspaceSkills = [], isLoading } = useQuery(
    skillListOptions(wsId),
  );
  const runtimeId =
    runtime?.runtime_mode === "local" && runtime.status === "online"
      ? runtime.id
      : null;
  const runtimeQuery = useQuery(runtimeCapabilitiesOptions(runtimeId));
  const [busyId, setBusyId] = useState<string | null>(null);
  const carried = useMemo(
    () => new Map(agent.skills.map((skill) => [skill.id, skill])),
    [agent.skills],
  );
  const chips = useMemo(() => {
    const available = new Map(workspaceSkills.map((skill) => [skill.id, skill]));
    const attached = agent.skills.flatMap((skill) => {
      const row = available.get(skill.id);
      return row ? [row] : [];
    });
    return [
      ...attached,
      ...workspaceSkills.filter((skill) => !carried.has(skill.id)),
    ];
  }, [workspaceSkills, carried, agent.skills]);

  const refreshAgent = async () => {
    await qc.invalidateQueries({ queryKey: workspaceKeys.agents(wsId) });
  };

  const handleGrant = async (skill: SkillSummary) => {
    setBusyId(skill.id);
    try {
      await api.addAgentSkills(agent.id, { skill_ids: [skill.id] });
      await refreshAgent();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t(($) => $.tab_body.skills.grant_failed_toast),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (skillId: string) => {
    setBusyId(skillId);
    try {
      await api.removeAgentSkill(agent.id, skillId);
      await refreshAgent();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t(($) => $.tab_body.skills.remove_failed_toast),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleEnabled = async (skillId: string, enabled: boolean) => {
    setBusyId(skillId);
    try {
      await api.setAgentSkillEnabled(agent.id, skillId, enabled);
      await refreshAgent();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t(($) => $.tab_body.skills.toggle_failed_toast),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRuntimeToggle = async (
    skill: RuntimeLocalSkillSummary,
    enabled: boolean,
  ) => {
    if (!runtime || !skill.root) return;
    const busyKey = runtimeSkillIdentity(skill);
    setBusyId(busyKey);
    try {
      await api.setAgentRuntimeSkillEnabled(agent.id, {
        runtime_id: runtime.id,
        root: skill.root,
        key: skill.key,
        name: skill.name,
        plugin: skill.plugin,
        enabled,
      });
      await refreshAgent();
```

### server/internal/billing/catalog_v1.json

```json
{
  "version": "v1",
  "effective_from": "2026-08-26T00:00:00Z",
  "currency": "USD",
  "ticks_per_usd": 10000000000,
  "wallet_defaults": {
    "trial_credit_ticks": 20000000000,
    "trial_credit_ttl_days": 30,
    "per_task_cap_ticks": 50000000000,
    "minimum_topup_ticks": 50000000000,
    "minimum_dispatch_seconds": 1800
  },
  "entitlements": [
    {
      "tier": "free",
      "monthly_price_ticks": 0,
      "annual_price_ticks": 0,
      "concurrent_tasks": 1,
      "agent_roster_size": 8,
      "autopilot_runs_per_month": 100,
      "included_storage_gb": 1
    },
    {
      "tier": "pro",
      "monthly_lookup_key": "pro_monthly",
      "annual_lookup_key": "pro_annual",
      "monthly_price_ticks": 750000000000,
      "annual_price_ticks": 7500000000000,
      "concurrent_tasks": 5,
      "agent_roster_size": null,
      "autopilot_runs_per_month": 10000,
      "included_storage_gb": 10
    },
    {
      "tier": "team",
      "monthly_lookup_key": "team_monthly",
      "annual_lookup_key": "team_annual",
      "monthly_price_ticks": 1500000000000,
      "annual_price_ticks": 15000000000000,
      "concurrent_tasks": null,
      "agent_roster_size": null,
      "autopilot_runs_per_month": 100000,
      "included_storage_gb": 50
    }
  ],
  "trial": {
    "duration_days": 14,
    "max_workspaces_per_user": 3,
    "notification_days": [7, 12, 14],
    "disposable_email_domains": [
      "10minutemail.com",
      "guerrillamail.com",
      "mailinator.com",
      "tempmail.com",
      "yopmail.com"
    ]
  },
  "prices": [
    {
      "id": "cloud_sandbox_vcpu",
      "meter": "compute",
      "unit": "vcpu_hour",
      "price_ticks": 800000000,
      "billing_granularity": "second"
    },
    {
      "id": "cloud_sandbox_memory",
      "meter": "compute",
      "unit": "gib_hour",
      "price_ticks": 225000000,
      "billing_granularity": "second"
    },
    {
      "id": "attachment_storage",
      "meter": "storage",
      "unit": "gb_month",
      "price_ticks": 1000000000,
      "billing_granularity": "gb_hour",
      "free_allowance": 1,
      "hours_per_month": 730
    },
    {
      "id": "managed_model_tokens",
      "meter": "model_tokens",
      "unit": "provider_reported_token_cost",
      "markup_basis_points": 1000
    },
    {
      "id": "byo_accounts_and_local_runtimes",
      "meter": "none",
      "unit": "none",
      "price_ticks": 0,
      "fee_basis_points": 500
    },
    {
      "id": "topup_fee",
      "meter": "none",
      "unit": "topup",
      "fee_basis_points": 500,
      "minimum_fee_ticks": 6000000000
    }
  ]
}

```

### server/internal/handler/voice_gate.go

```go
package handler

import (
	"context"
	"os"
	"strconv"
	"strings"

	"github.com/arosasg/botinc/server/internal/featureflags"
	"github.com/arosasg/botinc/server/internal/voice"
	"github.com/arosasg/botinc/server/pkg/featureflag"
)

// Voice operator stage 5 (BOT-577): the rollout gate and the kill switch.
//
// Both answer exactly one question - may a NEW call start right now - and
// neither can touch a call that is already running. That asymmetry is the
// whole design: an operator who flips the kill switch during an incident
// wants the calls in flight to finish their sentence and settle their rows,
// not to be cut mid-turn leaving orphaned provider calls behind.
//
// Two independent controls, in refusal order:
//
//  1. BOTINC_VOICE_KILL_SWITCH - a deployment-wide stop, read from the
//     environment on every start so a secret refresh applies it without a
//     restart. It outranks the flag: an incident switch that a per-workspace
//     rule could override would not be a switch.
//  2. The voice_operator feature flag, evaluated with the workspace attached,
//     which is how a staged rollout admits one workspace at a time.

// EnvVoiceKillSwitch is the deployment-wide stop for new voice calls.
const EnvVoiceKillSwitch = "BOTINC_VOICE_KILL_SWITCH"

// voiceStartGate implements voice.StartGate against the deployment's feature
// flags and the environment kill switch.
type voiceStartGate struct{ flags *featureflag.Service }

// VoiceStartGate returns the gate the voice manager consults on every start.
func VoiceStartGate(flags *featureflag.Service) voice.StartGate {
	return voiceStartGate{flags: flags}
}

// AllowVoiceStart reports whether this workspace may start a new call, and
// says which control refused when it may not. The sentences are deliberately
// different: "paused right now" tells a caller to wait, while "not enabled
// yet" tells them to ask an admin. A caller who cannot tell those apart
// retries the wrong one.
func (g voiceStartGate) AllowVoiceStart(ctx context.Context, workspaceID, callerID string) (bool, string, string) {
	if voiceKillSwitchEngaged() {
		return false, voice.RefusalDisabled, "Voice calls are paused on this deployment right now. Calls already in progress are finishing normally."
	}
	flagCtx := featureflags.VoiceOperatorContext(ctx, workspaceID, callerID)
	if !featureflags.VoiceOperatorEnabled(flagCtx, g.flags) {
		return false, voice.RefusalDisabled, "The voice operator is not enabled for this workspace yet. A workspace admin can request access."
	}
	return true, "", ""
}

// voiceKillSwitchEngaged reads the switch from the environment on every call.
// Re-reading is the point: an operator rotating the value through a secret
// refresh must not have to restart the API to stop new calls.
func voiceKillSwitchEngaged() bool {
	raw := strings.TrimSpace(os.Getenv(EnvVoiceKillSwitch))
	if raw == "" {
		return false
	}
	engaged, err := strconv.ParseBool(raw)
	if err != nil {
		// An unparseable kill switch fails CLOSED. The variable is only
		// ever set during an incident, and refusing new calls is the
		// recoverable mistake of the two.
		return true
	}
	return engaged
}

```

