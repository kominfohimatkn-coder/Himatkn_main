/**
 * Daftar key setting publik.
 *
 * WAJIB sinkron dengan `Backend/app/services/site_settings.py`
 * (`_REGISTRY_ORDER`): urutan dan isi harus sama persis. Skrip pemeriksaan
 * read-only di luar repo membandingkan daftar ini dengan registry backend.
 */
export const PUBLIC_SETTING_KEYS = [
  "brand_name",
  "brand_subtitle",
  "footer_copyright",
  "footer_institution",
  "bank_soal_url",
  "instagram_url",
  "instagram_label",
  "contact_email",
  "secretariat_address",
  "maps_url",
  "maps_embed_url",
  "hero_eyebrow",
  "hero_title",
  "hero_emphasis",
  "hero_description",
  "hero_image",
  "hero_image_alt",
  "hero_primary_label",
  "hero_secondary_label",
  "about_eyebrow",
  "about_title",
  "about_description",
  "about_item_1_tag",
  "about_item_1_title",
  "about_item_1_description",
  "about_item_2_tag",
  "about_item_2_title",
  "about_item_2_description",
  "about_item_3_tag",
  "about_item_3_title",
  "about_item_3_description",
  "program_eyebrow",
  "program_title",
  "program_empty_text",
  "news_eyebrow",
  "news_title",
  "news_empty_text",
  "news_more_label",
  "structure_eyebrow",
  "structure_title",
  "structure_description",
  "structure_note",
  "structure_button_label",
  "contact_eyebrow",
  "contact_title",
  "contact_description",
  "contact_button_label",
] as const;

export type PublicSettingKey = (typeof PUBLIC_SETTING_KEYS)[number];

export type PublicSettings = Record<PublicSettingKey, string>;

export interface PublicSettingsResponse {
  settings: PublicSettings;
}

export type AdminSettingType =
  | "text"
  | "multiline"
  | "url"
  | "email"
  | "image";

export type AdminSettingGroup =
  | "brand"
  | "links"
  | "contact"
  | "hero"
  | "about"
  | "program"
  | "news"
  | "structure";

export interface AdminSettingItem {
  key: PublicSettingKey;
  group: AdminSettingGroup;
  type: AdminSettingType;
  label: string;
  value: string;
  default: string;
  max_length: number;
  allowed_hosts: string[];
  updated_by: number | null;
  updated_at: string | null;
  /** Hanya ada pada item bertipe `image`; `""` bila belum ada gambar. */
  preview_url?: string;
}

export interface AdminSettingsResponse {
  items: AdminSettingItem[];
  /** Key lama di DB yang tidak ada di registry backend. */
  unknown_keys: string[];
}

export interface AdminSettingUpdatePayload {
  setting_value: string | null;
  value_type?: string;
}

export interface AdminSettingUpdateResponse {
  key: string;
  value: string;
  type: string;
  updated_by: number | null;
}

export interface AdminSettingsPatchPayload {
  values: Record<string, string>;
}

export interface AdminSettingsPatchResponse {
  updated: string[];
  settings: Record<string, string>;
}

export interface AdminSettingsDeleteResponse {
  deleted: string;
  value: string | null;
}
