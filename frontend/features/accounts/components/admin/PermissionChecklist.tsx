"use client";

import { useMemo } from "react";

import { Checkbox } from "@/components/ui/Checkbox";

import { applyPermissionImplications } from "../../api";
import { getImpliedPermissionNames } from "../../permissions";

import type { PermissionCatalogResponse } from "../../types";

interface PermissionChecklistProps {
  catalog: PermissionCatalogResponse;
  selected: readonly string[];
  disabled?: boolean;
  onChange: (next: string[]) => void;
}

export default function PermissionChecklist({
  catalog,
  selected,
  disabled = false,
  onChange,
}: PermissionChecklistProps) {
  const alwaysGranted = useMemo(
    () => new Set(catalog.always_granted),
    [catalog.always_granted],
  );

  const expanded = useMemo(
    () => new Set(applyPermissionImplications(selected, catalog)),
    [catalog, selected],
  );

  const impliedNames = useMemo(
    () => getImpliedPermissionNames([...expanded], catalog),
    [expanded, catalog],
  );

  const visibleModules = catalog.items.filter(
    (module) => module.available && module.permissions.length > 0,
  );

  function togglePermission(name: string, checked: boolean) {
    if (checked) {
      onChange([...new Set([...selected, name])]);
      return;
    }

    onChange(selected.filter((permission) => permission !== name));
  }

  return (
    <section aria-labelledby="permission-checklist-title" className="space-y-3">
      <div>
        <h3
          id="permission-checklist-title"
          className="text-sm font-semibold text-bg-dark"
        >
          Izin akun
        </h3>

        <p className="mt-1 text-xs leading-5 text-ink-soft">
          Centang izin yang diberikan. Izin turunan otomatis ikut tercentang
          dan tidak dapat dilepas selama izin yang membutuhkannya masih
          tercentang.
        </p>
      </div>

      <div className="space-y-3">
        {visibleModules.map((module) => (
          <fieldset
            key={module.key}
            className="border border-paper-line bg-bg-light p-4"
          >
            <legend className="px-1 text-sm font-semibold text-bg-dark">
              {module.label}
            </legend>

            <div className="mt-2 space-y-3">
              {module.permissions.map((permission) => {
                const always = alwaysGranted.has(permission.name);
                const checked =
                  always || expanded.has(permission.name);
                const implied =
                  !always && checked && impliedNames.has(permission.name);

                return (
                  <Checkbox
                    key={permission.name}
                    name="permissions"
                    value={permission.name}
                    checked={checked}
                    disabled={disabled || always || implied}
                    onChange={(event) =>
                      togglePermission(
                        permission.name,
                        event.target.checked,
                      )
                    }
                    label={permission.label}
                    description={
                      always
                        ? "Selalu diberikan"
                        : implied
                          ? "Otomatis dari izin lain yang dipilih"
                          : undefined
                    }
                  />
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {selected.length === 0 && (
        <p className="text-xs leading-5 text-ink-soft">
          Tanpa centang, akun hanya mendapat akses Dashboard.
        </p>
      )}
    </section>
  );
}
