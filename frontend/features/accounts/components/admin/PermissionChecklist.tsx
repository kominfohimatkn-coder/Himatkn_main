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
    <section aria-labelledby="permission-checklist-title" className="grid gap-3">
      <div>
        <h3
          id="permission-checklist-title"
          className="text-[11px] font-semibold tracking-[0.08em] text-green-900 uppercase"
        >
          Izin akun
        </h3>

        <p className="mt-1 text-xs leading-5 text-muted">
          Centang izin yang diberikan. Izin turunan otomatis ikut tercentang
          selama izin yang membutuhkannya masih tercentang.
        </p>
      </div>

      <div className="grid items-start gap-3 min-[641px]:grid-cols-2">
        {visibleModules.map((module) => (
          <fieldset
            key={module.key}
            className="rounded-[4px] border border-line bg-white px-4 pt-1 pb-4"
          >
            <legend className="px-1 font-serif text-sm font-bold text-green-900">
              {module.label}
            </legend>

            <div className="mt-1 grid gap-2.5">
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
                          ? "Otomatis dari izin lain"
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
        <p className="text-xs leading-5 text-muted">
          Tanpa centang, akun hanya mendapat akses Dashboard.
        </p>
      )}
    </section>
  );
}