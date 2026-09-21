"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, Check, Edit3, Plus, Trash2, Users, X } from "lucide-react";
import {
  createAdminDiscount,
  createAdminMember,
  createAdminSpace,
  deleteAdminDiscount,
  deleteAdminMember,
  deleteAdminSpace,
  getAdminDiscount,
  getAdminDiscounts,
  getAdminMember,
  getAdminMembers,
  getAdminSpace,
  updateAdminDiscount,
  updateAdminMember,
  updateAdminSpace,
  type AdminActionResult,
} from "../../app/admin/actions";

type ValueMap = Record<string, unknown>;
type SpaceType = "desk" | "meeting_room" | "private_office";
type AdminMember = {
  id: number;
  username: string;
  name: string;
  company: string;
  address: string;
  phone: string;
  photo: string;
};
type AdminSpace = {
  id: number;
  name: string;
  price: number;
  type: SpaceType | string;
  capacity: string;
  description: string;
  photo: string;
};
type AdminDiscount = {
  id: number;
  name: string;
  percentage: number;
  startDate: string;
  endDate: string;
};
type CrudTab = "members" | "spaces" | "discounts";
type FormMode = { tab: CrudTab; id?: number } | null;

function record(value: unknown): ValueMap {
  return typeof value === "object" && value !== null ? (value as ValueMap) : {};
}
function dataOf(value: unknown): unknown {
  const source = record(value);
  return source.data ?? value;
}
function listOf(value: unknown): unknown[] {
  const data = dataOf(value);
  if (Array.isArray(data)) return data;
  const source = record(data);
  for (const key of [
    "items",
    "members",
    "spaces",
    "diskon",
    "discounts",
    "results",
  ])
    if (Array.isArray(source[key])) return source[key] as unknown[];
  return [];
}
function text(value: unknown) {
  return typeof value === "string" ? value : "";
}
function number(value: unknown) {
  return typeof value === "number"
    ? value
    : typeof value === "string" && value.trim()
      ? Number(value)
      : 0;
}
function apiMessage(result: AdminActionResult, fallback: string) {
  return typeof result.payload.message === "string"
    ? result.payload.message
    : fallback;
}
function normalizeMembers(value: unknown): AdminMember[] {
  return listOf(value).flatMap((item) => {
    const itemRecord = record(item);
    const id = number(itemRecord.id);
    return id
      ? [
          {
            id,
            username: text(itemRecord.username),
            name: text(itemRecord.nama_member),
            company: text(itemRecord.instansi),
            address: text(itemRecord.alamat),
            phone: text(itemRecord.telp),
            photo: text(itemRecord.foto_url ?? itemRecord.foto),
          },
        ]
      : [];
  });
}
function normalizeSpaces(value: unknown): AdminSpace[] {
  return listOf(value).flatMap((item) => {
    const itemRecord = record(item);
    const id = number(itemRecord.id);
    return id
      ? [
          {
            id,
            name: text(itemRecord.nama_space),
            price: number(itemRecord.harga_per_jam),
            type: text(itemRecord.tipe),
            capacity: text(itemRecord.kapasitas),
            description: text(itemRecord.deskripsi),
            photo: text(itemRecord.foto_url ?? itemRecord.foto),
          },
        ]
      : [];
  });
}
function normalizeDiscounts(value: unknown): AdminDiscount[] {
  return listOf(value).flatMap((item) => {
    const itemRecord = record(item);
    const id = number(itemRecord.id);
    return id
      ? [
          {
            id,
            name: text(itemRecord.nama_diskon),
            percentage: number(itemRecord.persentase_diskon),
            startDate: text(itemRecord.tanggal_awal),
            endDate: text(itemRecord.tanggal_akhir),
          },
        ]
      : [];
  });
}
function inputClass() {
  return "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export default function AdminCrudPanels() {
  const [tab, setTab] = useState<CrudTab>("members");
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [spaces, setSpaces] = useState<AdminSpace[]>([]);
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState<FormMode>(null);
  async function refresh() {
    setLoading(true);
    setError("");
    const [memberResult, spaceResult, discountResult] = await Promise.all([
      getAdminMembers(),
      getAdminSpace(),
      getAdminDiscounts(),
    ]);
    if (memberResult.ok) setMembers(normalizeMembers(memberResult.payload));
    else setError(apiMessage(memberResult, "Member tidak dapat dimuat."));
    if (spaceResult.ok) setSpaces(normalizeSpaces(spaceResult.payload));
    else setError(apiMessage(spaceResult, "Space tidak dapat dimuat."));
    if (discountResult.ok)
      setDiscounts(normalizeDiscounts(discountResult.payload));
    else setError(apiMessage(discountResult, "Diskon tidak dapat dimuat."));
    setLoading(false);
  }
  // Initial data load synchronizes the management panel with the API.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    void refresh();
  }, []);
  async function remove(item: { id: number; label: string }, kind: CrudTab) {
    if (!window.confirm(`Hapus ${item.label}?`)) return;
    setSaving(true);
    const result =
      kind === "members"
        ? await deleteAdminMember(item.id)
        : kind === "spaces"
          ? await deleteAdminSpace(item.id)
          : await deleteAdminDiscount(item.id);
    if (!result.ok) setError(apiMessage(result, "Data tidak dapat dihapus."));
    else {
      setNotice("Data berhasil dihapus.");
      await refresh();
    }
    setSaving(false);
  }
  const currentCount =
    tab === "members"
      ? members.length
      : tab === "spaces"
        ? spaces.length
        : discounts.length;
  return (
    <section
      id="management"
      className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Data Master
          </p>
          <h2 className="mt-1 text-xl font-bold">
            Kelola Member, Ruangan & Diskon
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Seluruh data ditampilkan dari API admin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMode({ tab })}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="mt-4 flex justify-between rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
        >
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="mt-4 flex justify-between rounded-lg bg-primary-light px-3 py-2.5 text-sm text-primary-hover"
        >
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-100 pb-2">
        <TabButton
          active={tab === "members"}
          onClick={() => setTab("members")}
          icon={<Users className="h-4 w-4" />}
        >
          Member
        </TabButton>
        <TabButton
          active={tab === "spaces"}
          onClick={() => setTab("spaces")}
          icon={<Building2 className="h-4 w-4" />}
        >
          Ruangan
        </TabButton>
        <TabButton
          active={tab === "discounts"}
          onClick={() => setTab("discounts")}
          icon={<Check className="h-4 w-4" />}
        >
          Diskon
        </TabButton>
        <span className="ml-auto self-center text-xs text-slate-500">
          {currentCount} data
        </span>
      </div>
      {loading ? (
        <div className="mt-5 h-40 animate-pulse rounded-xl bg-slate-100" />
      ) : tab === "members" ? (
        <MemberTable
          data={members}
          onEdit={(id) => setMode({ tab, id })}
          onDelete={(item) => void remove(item, tab)}
          disabled={saving}
        />
      ) : tab === "spaces" ? (
        <SpaceTable
          data={spaces}
          onEdit={(id) => setMode({ tab, id })}
          onDelete={(item) => void remove(item, tab)}
          disabled={saving}
        />
      ) : (
        <DiscountTable
          data={discounts}
          onEdit={(id) => setMode({ tab, id })}
          onDelete={(item) => void remove(item, tab)}
          disabled={saving}
        />
      )}
      {mode && (
        <CrudModal
          mode={mode}
          onClose={() => setMode(null)}
          onSaved={async (message) => {
            setMode(null);
            setNotice(message);
            await refresh();
          }}
          onError={setError}
          setSaving={setSaving}
        />
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold ${active ? "bg-primary-light text-primary-hover" : "text-slate-500 hover:bg-slate-50"}`}
    >
      {icon}
      {children}
    </button>
  );
}
function TableEmpty({ text: label }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}
function RowActions({
  onEdit,
  onDelete,
  disabled,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onEdit}
        className="rounded-lg p-2 text-slate-500 hover:bg-primary-light hover:text-primary"
      >
        <Edit3 className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
function MemberTable({
  data,
  onEdit,
  onDelete,
  disabled,
}: {
  data: AdminMember[];
  onEdit: (id: number) => void;
  onDelete: (item: { id: number; label: string }) => void;
  disabled: boolean;
}) {
  if (!data.length)
    return (
      <div className="mt-5">
        <TableEmpty text="Belum ada data member dari API." />
      </div>
    );
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Instansi</th>
            <th className="px-4 py-3">Telepon</th>
            <th className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                      {item.name.slice(0, 1) || "—"}
                    </span>
                  )}
                  <span className="font-semibold">{item.name || "—"}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-slate-600">
                {item.username || "—"}
              </td>
              <td className="px-4 py-4 text-slate-600">
                {item.company || "—"}
              </td>
              <td className="px-4 py-4 text-slate-600">{item.phone || "—"}</td>
              <td className="px-4 py-4">
                <RowActions
                  onEdit={() => onEdit(item.id)}
                  onDelete={() =>
                    onDelete({ id: item.id, label: item.name || item.username })
                  }
                  disabled={disabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function SpaceTable({
  data,
  onEdit,
  onDelete,
  disabled,
}: {
  data: AdminSpace[];
  onEdit: (id: number) => void;
  onDelete: (item: { id: number; label: string }) => void;
  disabled: boolean;
}) {
  if (!data.length)
    return (
      <div className="mt-5">
        <TableEmpty text="Belum ada data ruangan dari API." />
      </div>
    );
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Ruangan</th>
            <th className="px-4 py-3">Tipe</th>
            <th className="px-4 py-3">Harga/Jam</th>
            <th className="px-4 py-3">Kapasitas</th>
            <th className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-4">
                <p className="font-semibold">{item.name || "—"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.description || "—"}
                </p>
              </td>
              <td className="px-4 py-4 text-slate-600">{item.type || "—"}</td>
              <td className="px-4 py-4 font-semibold">
                {item.price
                  ? new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(item.price)
                  : "—"}
              </td>
              <td className="px-4 py-4 text-slate-600">
                {item.capacity || "—"}
              </td>
              <td className="px-4 py-4">
                <RowActions
                  onEdit={() => onEdit(item.id)}
                  onDelete={() => onDelete({ id: item.id, label: item.name })}
                  disabled={disabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function DiscountTable({
  data,
  onEdit,
  onDelete,
  disabled,
}: {
  data: AdminDiscount[];
  onEdit: (id: number) => void;
  onDelete: (item: { id: number; label: string }) => void;
  disabled: boolean;
}) {
  if (!data.length)
    return (
      <div className="mt-5">
        <TableEmpty text="Belum ada data diskon dari API." />
      </div>
    );
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Nama Diskon</th>
            <th className="px-4 py-3">Persentase</th>
            <th className="px-4 py-3">Periode</th>
            <th className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-4 font-semibold">{item.name || "—"}</td>
              <td className="px-4 py-4 text-slate-600">{item.percentage}%</td>
              <td className="px-4 py-4 text-slate-600">
                {item.startDate || "—"} — {item.endDate || "—"}
              </td>
              <td className="px-4 py-4">
                <RowActions
                  onEdit={() => onEdit(item.id)}
                  onDelete={() => onDelete({ id: item.id, label: item.name })}
                  disabled={disabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CrudModal({
  mode,
  onClose,
  onSaved,
  onError: _onError,
  setSaving,
}: {
  mode: Exclude<FormMode, null>;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (message: string) => void;
  setSaving: (value: boolean) => void;
}) {
  const [loading, setLoading] = useState(Boolean(mode.id));
  const [form, setForm] = useState<ValueMap>({});
  const [localError, setLocalError] = useState("");
  const editing = mode.id !== undefined;
  useEffect(() => {
    if (!mode.id) return;
    let active = true;
    const id = mode.id;
    async function load() {
      const result =
        mode.tab === "members"
          ? await getAdminMember(id)
          : mode.tab === "spaces"
            ? await getAdminSpace(id)
            : await getAdminDiscount(id);
      if (!active) return;
      if (result.ok) {
        const item = record(dataOf(result.payload));
        setForm(
          mode.tab === "members"
            ? {
                username: text(item.username),
                nama_member: text(item.nama_member),
                instansi: text(item.instansi),
                alamat: text(item.alamat),
                telp: text(item.telp),
                foto: text(item.foto_url ?? item.foto),
              }
            : mode.tab === "spaces"
              ? {
                  nama_space: text(item.nama_space),
                  harga_per_jam: number(item.harga_per_jam),
                  tipe: text(item.tipe),
                  kapasitas: text(item.kapasitas),
                  deskripsi: text(item.deskripsi),
                  foto: text(item.foto_url ?? item.foto),
                }
              : {
                  nama_diskon: text(item.nama_diskon),
                  persentase_diskon: number(item.persentase_diskon),
                  tanggal_awal: text(item.tanggal_awal),
                  tanggal_akhir: text(item.tanggal_akhir),
                },
        );
      } else
        setLocalError(apiMessage(result, "Detail data tidak dapat dimuat."));
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [mode.id, mode.tab]);
  function setField(key: string, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");
    const required =
      mode.tab === "members"
        ? editing
          ? ["username", "nama_member"]
          : ["username", "password", "nama_member"]
        : mode.tab === "spaces"
          ? ["nama_space", "harga_per_jam", "tipe", "kapasitas"]
          : [
              "nama_diskon",
              "persentase_diskon",
              "tanggal_awal",
              "tanggal_akhir",
            ];
    if (required.some((key) => form[key] === undefined || form[key] === "")) {
      setLocalError("Lengkapi field wajib terlebih dahulu.");
      return;
    }
    if (
      mode.tab === "spaces" &&
      !["desk", "meeting_room", "private_office"].includes(String(form.tipe))
    ) {
      setLocalError("Tipe ruangan tidak valid.");
      return;
    }
    const payload = { ...form };
    if (editing && mode.tab === "members" && !payload.password)
      delete payload.password;
    setSaving(true);
    const result =
      mode.tab === "members"
        ? editing
          ? await updateAdminMember(mode.id as number, payload)
          : await createAdminMember(payload)
        : mode.tab === "spaces"
          ? editing
            ? await updateAdminSpace(mode.id as number, payload)
            : await createAdminSpace(payload)
          : editing
            ? await updateAdminDiscount(mode.id as number, payload)
            : await createAdminDiscount(payload);
    setSaving(false);
    if (!result.ok) {
      setLocalError(apiMessage(result, "Perubahan tidak dapat disimpan."));
      return;
    }
    await onSaved(
      `${mode.tab === "members" ? "Member" : mode.tab === "spaces" ? "Space" : "Diskon"} berhasil ${editing ? "diperbarui" : "dibuat"}.`,
    );
  }
  const title = `${editing ? "Edit" : "Tambah"} ${mode.tab === "members" ? "Member" : mode.tab === "spaces" ? "Ruangan" : "Diskon"}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {loading ? (
          <div className="mt-6 h-40 animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <form
            onSubmit={(event) => void submit(event)}
            className="mt-6 space-y-4"
          >
            {mode.tab === "members" ? (
              <>
                <Field
                  label="Username"
                  value={text(form.username)}
                  onChange={(value) => setField("username", value)}
                  required
                />
                <Field
                  label="Nama Member"
                  value={text(form.nama_member)}
                  onChange={(value) => setField("nama_member", value)}
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  value={text(form.password)}
                  onChange={(value) => setField("password", value)}
                  required={!editing}
                />
                <Field
                  label="Instansi"
                  value={text(form.instansi)}
                  onChange={(value) => setField("instansi", value)}
                />
                <Field
                  label="Alamat"
                  value={text(form.alamat)}
                  onChange={(value) => setField("alamat", value)}
                />
                <Field
                  label="Telepon"
                  value={text(form.telp)}
                  onChange={(value) => setField("telp", value)}
                />
                <Field
                  label="Foto"
                  value={text(form.foto)}
                  onChange={(value) => setField("foto", value)}
                />
              </>
            ) : mode.tab === "spaces" ? (
              <>
                <Field
                  label="Nama Space"
                  value={text(form.nama_space)}
                  onChange={(value) => setField("nama_space", value)}
                  required
                />
                <Field
                  label="Harga per Jam"
                  type="number"
                  value={String(form.harga_per_jam ?? "")}
                  onChange={(value) => setField("harga_per_jam", Number(value))}
                  required
                />
                <label className="block text-sm font-semibold text-slate-700">
                  Tipe
                  <select
                    value={text(form.tipe)}
                    onChange={(event) => setField("tipe", event.target.value)}
                    className={`${inputClass()} mt-2`}
                    required
                  >
                    <option value="">Pilih tipe</option>
                    <option value="desk">Personal Desk</option>
                    <option value="meeting_room">Meeting Room</option>
                    <option value="private_office">Private Office</option>
                  </select>
                </label>
                <Field
                  label="Kapasitas"
                  value={text(form.kapasitas)}
                  onChange={(value) => setField("kapasitas", value)}
                  required
                />
                <Field
                  label="Deskripsi"
                  value={text(form.deskripsi)}
                  onChange={(value) => setField("deskripsi", value)}
                />
                <Field
                  label="Foto"
                  value={text(form.foto)}
                  onChange={(value) => setField("foto", value)}
                />
              </>
            ) : (
              <>
                <Field
                  label="Nama Diskon"
                  value={text(form.nama_diskon)}
                  onChange={(value) => setField("nama_diskon", value)}
                  required
                />
                <Field
                  label="Persentase Diskon"
                  type="number"
                  value={String(form.persentase_diskon ?? "")}
                  onChange={(value) =>
                    setField("persentase_diskon", Number(value))
                  }
                  required
                />
                <Field
                  label="Tanggal Awal"
                  type="date"
                  value={text(form.tanggal_awal)}
                  onChange={(value) => setField("tanggal_awal", value)}
                  required
                />
                <Field
                  label="Tanggal Akhir"
                  type="date"
                  value={text(form.tanggal_akhir)}
                  onChange={(value) => setField("tanggal_akhir", value)}
                  required
                />
              </>
            )}
            {(localError || !loading) && localError && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
              >
                {localError}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {editing ? "Memperbarui..." : "Menyimpan..."}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass()} mt-2`}
        required={required}
      />
    </label>
  );
}
