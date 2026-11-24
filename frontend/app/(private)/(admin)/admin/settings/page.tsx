"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  Eye,
  FileText,
  ImageIcon,
  Link2,
  Mail,
  Network,
  RefreshCw,
  Settings,
  Users,
} from "lucide-react";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { Badge } from "@/components/admin/shared/Badge";
import { Notice } from "@/components/admin/shared/Notice";
import { PageHead } from "@/components/admin/shared/PageHead";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { useToast } from "@/components/admin/shared/Toast";
import { Button } from "@/components/ui/Button";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import {
  deleteAdminSetting,
  getAdminSettings,
  patchAdminSettings,
} from "@/features/settings/admin-api";
import type { AdminSettingItem } from "@/features/settings/types";
import { getApiErrorMessage, isApiError } from "@/lib/api/errors";

import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import SettingsGroupForm from "@/features/settings/components/admin/SettingsGroupForm";
import UnknownKeysPanel from "@/features/settings/components/admin/UnknownKeysPanel";
import {
  buildSettingsGroups,
  validateSettingValue,
  type SettingsGroup,
} from "@/features/settings/components/admin/settings-utils";

/** Ikon dan halaman situs untuk tiap bagian (mengikuti GROUP_ICONS di Design/admin). */
const GROUP_ICONS: Record<string, ReactNode> = {
  brand: <Building2 />,
  links: <Link2 />,
  contact: <Mail />,
  hero: <ImageIcon />,
  about: <Users />,
  program: <CalendarDays />,
  news: <FileText />,
  structure: <Network />,
};

const GROUP_SITE_HREF: Record<string, string> = {
  brand: "/",
  links: "/",
  contact: "/",
  hero: "/",
  about: "/#tentang",
  program: "/#program-kerja",
  news: "/publikasi",
  structure: "/struktur",
};

function changedItemsForGroup(
  group: SettingsGroup,
  values: Record<string, string>,
): AdminSettingItem[] {
  return group.items.filter(
    (item) => (values[item.key] ?? item.value) !== item.value,
  );
}

export default function SettingsPage() {
  const { admin, can } = useAuth();
  const toast = useToast();

  const canView = can(PERMISSIONS.SETTINGS_VIEW);
  const canManage = can(PERMISSIONS.SETTINGS_MANAGE);

  const [items, setItems] = useState<AdminSettingItem[]>([]);
  const [unknownKeys, setUnknownKeys] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [activeGroup, setActiveGroup] = useState("");
  const [pendingGroup, setPendingGroup] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>(
    {},
  );
  const [groupError, setGroupError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [resetTarget, setResetTarget] =
    useState<AdminSettingItem | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState("");

  const [unknownTarget, setUnknownTarget] = useState<string | null>(null);
  const [unknownBusy, setUnknownBusy] = useState(false);
  const [unknownError, setUnknownError] = useState("");
  const [unknownMessage, setUnknownMessage] = useState("");

  useEffect(() => {
    if (!canView) return;

    const controller = new AbortController();

    void getAdminSettings({ signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;

        setItems(result.items);
        setUnknownKeys(result.unknown_keys);
        setValues(
          Object.fromEntries(
            result.items.map((item) => [item.key, item.value]),
          ),
        );
        setFieldErrors({});
        setGroupError("");
        setSuccessMessage("");
        setActiveGroup((current) =>
          result.items.some((item) => item.group === current)
            ? current
            : (result.items[0]?.group ?? ""),
        );
        setLoadError("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        setLoadError(
          getApiErrorMessage(
            err,
            "Pengaturan situs gagal dimuat. Coba lagi.",
          ),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [canView, refreshKey]);

  const groups = buildSettingsGroups(items);
  const currentGroup =
    groups.find((group) => group.key === activeGroup) ??
    groups[0] ??
    null;

  const effectiveGroupKey = currentGroup?.key ?? "";

  const dirtyCounts: Record<string, number> = {};

  for (const group of groups) {
    dirtyCounts[group.key] = changedItemsForGroup(
      group,
      values,
    ).length;
  }

  const hasUnsavedChanges = Object.values(dirtyCounts).some(
    (count) => count > 0,
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function handleLinkClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");

      if (
        !anchor ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      if (
        !window.confirm(
          "Ada perubahan pengaturan yang belum disimpan. Yakin ingin meninggalkan halaman ini?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [hasUnsavedChanges]);

  if (!admin) return null;

  function reloadSettings() {
    setLoadError("");
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  }

  function resetGroupDraft(groupKey: string) {
    const group = groups.find((entry) => entry.key === groupKey);

    if (!group) return;

    setValues((current) => {
      const next = { ...current };

      for (const item of group.items) {
        next[item.key] = item.value;
      }

      return next;
    });

    setFieldErrors((current) => {
      const next = { ...current };

      for (const item of group.items) {
        delete next[item.key];
      }

      return next;
    });

    setGroupError("");
    setSuccessMessage("");
  }

  function selectGroup(groupKey: string) {
    if (groupKey === effectiveGroupKey) return;

    const dirtyCount = dirtyCounts[effectiveGroupKey] ?? 0;

    if (dirtyCount > 0) {
      setPendingGroup(groupKey);
      return;
    }

    setActiveGroup(groupKey);
    setGroupError("");
    setSuccessMessage("");
  }

  function confirmGroupChange() {
    if (!pendingGroup) return;

    if (effectiveGroupKey) {
      resetGroupDraft(effectiveGroupKey);
    }

    setActiveGroup(pendingGroup);
    setPendingGroup(null);
  }

  function handleFieldChange(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!(key in current)) return current;

      const next = { ...current };
      delete next[key];

      return next;
    });
    setGroupError("");
    setSuccessMessage("");
  }

  async function saveGroup() {
    if (!currentGroup || !canManage || isSaving) return;

    const changedItems = changedItemsForGroup(currentGroup, values);

    if (changedItems.length === 0) return;

    const nextErrors: Record<string, string> = {};
    const payload: Record<string, string> = {};

    for (const item of changedItems) {
      const rawValue = values[item.key] ?? item.value;
      const validationError = validateSettingValue(item, rawValue);

      if (validationError) {
        nextErrors[item.key] = validationError;
      } else {
        payload[item.key] = rawValue;
      }
    }

    setFieldErrors(nextErrors);
    setSuccessMessage("");

    if (Object.keys(nextErrors).length > 0) {
      setGroupError(
        `${Object.keys(nextErrors).length} kolom perlu diperbaiki. Belum ada perubahan yang disimpan.`,
      );
      return;
    }

    setIsSaving(true);
    setGroupError("");

    try {
      const response = await patchAdminSettings(payload);
      const savedAt = new Date().toISOString();

      setItems((current) =>
        current.map((item) => {
          const nextValue = response.settings[item.key];

          if (nextValue === undefined) return item;

          return {
            ...item,
            value: nextValue,
            updated_by: admin?.id ?? null,
            updated_at: savedAt,
          };
        }),
      );

      setValues((current) => {
        const next = { ...current };

        for (const [key, value] of Object.entries(response.settings)) {
          next[key] = value;
        }

        return next;
      });

      setFieldErrors({});
      setSuccessMessage(
        `${response.updated.length} perubahan pada bagian ${currentGroup.label} disimpan.`,
      );
      toast("Pengaturan disimpan.");
    } catch (err: unknown) {
      if (isApiError(err) && err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
        setGroupError(
          `Validasi gagal. ${Object.keys(err.errors).length} kolom perlu diperbaiki; belum ada perubahan yang disimpan.`,
        );
      } else {
        setGroupError(
          getApiErrorMessage(
            err,
            "Pengaturan gagal disimpan. Coba lagi.",
          ),
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  function requestReset(item: AdminSettingItem) {
    setResetError("");
    setResetTarget(item);
  }

  async function confirmReset() {
    if (!resetTarget || resetBusy) return;

    const target = resetTarget;

    setResetBusy(true);
    setResetError("");

    try {
      const response = await deleteAdminSetting(target.key);
      const nextValue = response.value ?? target.default;

      setItems((current) =>
        current.map((item) =>
          item.key === target.key
            ? {
                ...item,
                value: nextValue,
                updated_by: null,
                updated_at: null,
              }
            : item,
        ),
      );

      setValues((current) => ({
        ...current,
        [target.key]: nextValue,
      }));

      setFieldErrors((current) => {
        const next = { ...current };
        delete next[target.key];

        return next;
      });

      setGroupError("");
      setSuccessMessage(
        target.default
          ? `“${target.label}” dikembalikan ke nilai bawaan.`
          : `“${target.label}” dikosongkan.`,
      );
      setResetTarget(null);
    } catch (err: unknown) {
      setResetError(
        getApiErrorMessage(
          err,
          "Pengaturan gagal dikembalikan ke bawaan. Coba lagi.",
        ),
      );
    } finally {
      setResetBusy(false);
    }
  }

  async function confirmDeleteUnknown() {
    if (!unknownTarget || unknownBusy) return;

    const key = unknownTarget;

    setUnknownBusy(true);
    setUnknownError("");

    try {
      await deleteAdminSetting(key);

      setUnknownKeys((current) =>
        current.filter((entry) => entry !== key),
      );
      setUnknownMessage("Pengaturan lama dihapus.");
      setUnknownTarget(null);
    } catch (err: unknown) {
      setUnknownError(
        getApiErrorMessage(
          err,
          "Pengaturan lama gagal dihapus. Coba lagi.",
        ),
      );
    } finally {
      setUnknownBusy(false);
    }
  }

  return (
    <RequirePermission permission={PERMISSIONS.SETTINGS_VIEW}>
      <AdminPage>
        <PageHead
          label="Sistem"
          title="Pengaturan Situs"
          description="Pilih bagian website untuk mengubah teks dan tautan yang tampil di situs publik. Kolom yang dikosongkan akan kembali ke nilai bawaan atau disembunyikan."
        />

        {!canManage ? (
          <Notice icon={<Eye aria-hidden="true" />} className="mb-4">
            <strong>Mode lihat saja.</strong> Akun Anda dapat melihat pengaturan situs
            tetapi tidak dapat mengubahnya (butuh izin “Mengubah pengaturan”).
          </Notice>
        ) : null}

        {isLoading ? (
          <div role="status" aria-label="Memuat pengaturan" className="grid gap-4">
            <div className="h-[92px] animate-pulse rounded-[4px] bg-green-900/5" />
            <div className="h-[360px] animate-pulse rounded-[4px] bg-green-900/5" />
          </div>
        ) : loadError ? (
          <div className="rounded-[4px] border border-line bg-white">
            <StateBlock
              tone="error"
              icon={<RefreshCw />}
              label="Gagal memuat"
              title="Pengaturan tidak dapat dimuat"
              action={
                <Button variant="outline" onClick={reloadSettings}>
                  <RefreshCw aria-hidden="true" /> Coba lagi
                </Button>
              }
            >
              {loadError}
            </StateBlock>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-[4px] border border-line bg-white">
            <StateBlock icon={<Settings />} label="Pengaturan" title="Pengaturan belum tersedia">
              Backend belum mengirim daftar pengaturan situs.
            </StateBlock>
          </div>
        ) : currentGroup ? (
          <div className="grid gap-4">
            <div className="rounded-[4px] border border-line bg-white p-4 max-[640px]:p-3">
              <SelectMenu
                label="Bagian website"
                value={effectiveGroupKey}
                onChange={selectGroup}
                options={groups.map((group) => ({
                  value: group.key,
                  label: group.label,
                  description: group.description,
                  icon: GROUP_ICONS[group.key] ?? <Settings />,
                  badge: dirtyCounts[group.key] ? (
                    <Badge tone="amber">{dirtyCounts[group.key]}</Badge>
                  ) : undefined,
                }))}
              />
            </div>

            <SettingsGroupForm
              key={currentGroup.key}
              group={currentGroup}
              siteHref={GROUP_SITE_HREF[currentGroup.key]}
              values={values}
              disabled={!canManage}
              errors={fieldErrors}
              error={groupError}
              success={successMessage}
              isSaving={isSaving}
              onChange={handleFieldChange}
              onSave={() => {
                void saveGroup();
              }}
              onDiscard={() => resetGroupDraft(currentGroup.key)}
              onResetRequest={requestReset}
            />
          </div>
        ) : null}

        {!isLoading && !loadError ? (
          <UnknownKeysPanel
            keys={unknownKeys}
            message={unknownMessage}
            onDeleteRequest={(key) => {
              setUnknownError("");
              setUnknownTarget(key);
            }}
          />
        ) : null}

        <ConfirmDialog
          open={pendingGroup !== null}
          title="Pindah bagian pengaturan?"
          eyebrow="Perubahan belum disimpan"
          tone="default"
          confirmLabel="Pindah bagian"
          busyLabel="Berpindah..."
          description={`Ada ${
            dirtyCounts[effectiveGroupKey] ?? 0
          } perubahan yang belum disimpan di bagian ini. Jika Anda berpindah bagian, perubahan tersebut akan hilang.`}
          onCancel={() => setPendingGroup(null)}
          onConfirm={confirmGroupChange}
        />

        {resetTarget && (
          <ConfirmDialog
            open
            title={
              resetTarget.default
                ? `Kembalikan “${resetTarget.label}” ke bawaan?`
                : `Kosongkan “${resetTarget.label}”?`
            }
            eyebrow="Reset pengaturan"
            tone="default"
            confirmLabel={
              resetTarget.default ? "Kembalikan" : "Kosongkan"
            }
            busy={resetBusy}
            error={resetError}
            description={
              resetTarget.default
                ? `Nilai akan kembali menjadi “${resetTarget.default}”.`
                : "Kolom akan dikosongkan sehingga elemennya disembunyikan dari situs."
            }
            onCancel={() => {
              if (resetBusy) return;
              setResetTarget(null);
              setResetError("");
            }}
            onConfirm={() => {
              void confirmReset();
            }}
          />
        )}

        {unknownTarget && (
          <ConfirmDialog
            open
            title="Hapus pengaturan lama ini?"
            eyebrow="Pengaturan tidak dikenal"
            busy={unknownBusy}
            error={unknownError}
            description={
              <>
                Data <code className="break-all">{unknownTarget}</code>{" "}
                tidak dipakai situs. Menghapusnya tidak mengubah tampilan
                situs.
              </>
            }
            onCancel={() => {
              if (unknownBusy) return;
              setUnknownTarget(null);
              setUnknownError("");
            }}
            onConfirm={() => {
              void confirmDeleteUnknown();
            }}
          />
        )}
      </AdminPage>
    </RequirePermission>
  );
}