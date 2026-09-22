"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  Eye,
  Home,
  Info,
  Laptop,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  X,
} from "lucide-react";
import {
  cancelReservation,
  checkDiscount,
  createReservation,
  getActiveDiscounts,
  getAvailability,
  getMyReservationHistory,
  getMyReservations,
  getReservation,
  getReservationTicket,
  getSpace,
  getSpaceTypes,
  getSpaces,
  type BookingActionResult,
} from "./actions";

type ApiRecord = Record<string, unknown>;
type SpaceTypeValue = "desk" | "meeting_room" | "private_office";
type Space = {
  id: number;
  type: SpaceTypeValue;
  typeLabel: string;
  name: string;
  price: number;
  capacity: string;
  description: string;
  owner: string;
  photo?: string;
  facilities: string[];
  icon: LucideIcon;
  accent: string;
};
type SpaceTypeOption = { value: SpaceTypeValue; label: string };
type Discount = { id: number; name: string; percentage: number };
type ValidDiscount = Discount & { code: string };
type Availability = {
  available: boolean;
  message?: string;
  pricePerHour?: number;
  estimatedTotal?: number;
  endTime?: string;
};
type Reservation = {
  id: number;
  code: string;
  spaceName: string;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
  total: number;
  status: string;
};
type TicketData = Reservation & { qrValue?: string; coworkingName?: string; memberName?: string };
type ReservationStatusFilter = "" | "belum_dikonfirm" | "disetujui" | "aktif" | "selesai" | "dibatalkan";

const navItems = [
  "Ketersediaan Space",
  "Reservasi Saya",
  "Riwayat & Tiket",
];
const typeLabels: Record<SpaceTypeValue, string> = {
  desk: "Personal Desk",
  meeting_room: "Meeting Room",
  private_office: "Private Office",
};
const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null;
}
function toNumber(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}
function toStringValue(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : value !== undefined && value !== null && typeof value !== "object"
      ? String(value)
      : undefined;
}
function findNestedValue(value: unknown, keys: string[], depth = 0): unknown {
  if (!isRecord(value) || depth > 4) return undefined;
  for (const key of keys) if (value[key] !== undefined && value[key] !== null) return value[key];
  for (const nested of Object.values(value)) {
    const found = findNestedValue(nested, keys, depth + 1);
    if (found !== undefined) return found;
  }
  return undefined;
}
function nestedString(value: unknown, keys: string[]) {
  return toStringValue(findNestedValue(value, keys));
}
function nestedNumber(value: unknown, keys: string[]) {
  return toNumber(findNestedValue(value, keys));
}
function getList(payload: ApiRecord): unknown[] {
  for (const candidate of [
    payload.data,
    payload.spaces,
    payload.reservations,
    payload.reservasi,
    payload.discounts,
    payload.types,
    payload.items,
    payload.results,
    payload.rows,
  ]) {
    if (Array.isArray(candidate)) return candidate;
    if (isRecord(candidate))
      for (const key of [
        "items",
        "data",
        "spaces",
        "reservations",
        "reservasi",
        "reservation",
        "discounts",
        "types",
        "results",
        "rows",
      ])
        if (Array.isArray(candidate[key])) return candidate[key];
  }
  if (isRecord(payload.data) && payload.data.id !== undefined)
    return [payload.data];
  if (isRecord(payload.data)) {
    for (const key of ["reservasi", "reservation", "result", "booking"])
      if (isRecord(payload.data[key])) return [payload.data[key]];
  }
  return [];
}
function getObject(payload: ApiRecord) {
  return isRecord(payload.data) ? payload.data : payload;
}
function messageFrom(result: BookingActionResult, fallback: string) {
  return typeof result.payload.message === "string" &&
    result.payload.message.trim()
    ? result.payload.message
    : fallback;
}
function normalizeType(value: unknown): SpaceTypeValue | undefined {
  const normalized = toStringValue(value)
    ?.toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (normalized === "desk" || normalized === "personal_desk") return "desk";
  if (normalized === "meeting_room" || normalized === "meeting")
    return "meeting_room";
  if (normalized === "private_office" || normalized === "office")
    return "private_office";
  return undefined;
}
function getOwner(value: unknown) {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  return (
    toStringValue(value.nama_owner) ??
    toStringValue(value.nama_pengelola) ??
    toStringValue(value.nama) ??
    toStringValue(value.name) ??
    ""
  );
}
function iconFor(type: SpaceTypeValue) {
  return type === "desk"
    ? { icon: Laptop, accent: "bg-sky-50 text-sky-600" }
    : type === "meeting_room"
      ? { icon: Monitor, accent: "bg-violet-50 text-violet-600" }
      : { icon: Home, accent: "bg-primary-light text-primary" };
}
function normalizeFacilities(value: unknown): string[] {
  if (Array.isArray(value))
    return value
      .map(toStringValue)
      .filter((item): item is string => Boolean(item));
  if (typeof value === "string")
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  return [];
}
function normalizeSpaces(payload: ApiRecord): Space[] {
  return getList(payload).flatMap((value) => {
    if (!isRecord(value)) return [];
    // The booking API expects the space primary key (`id_space`). Some catalog
    // responses also include a generic `id` for the resource representation.
    const nestedSpace = isRecord(value.space)
      ? value.space
      : isRecord(value.data)
        ? value.data
        : undefined;
    const id = toNumber(
      nestedSpace?.id_space ??
        nestedSpace?.idSpace ??
        nestedSpace?.space_id ??
        nestedSpace?.spaceId ??
        nestedSpace?.id ??
        value.id_space ??
        value.idSpace ??
        value.space_id ??
        value.spaceId ??
        value.id,
    );
    const type = normalizeType(
      value.tipe ?? value.type ?? value.jenis_space ?? value.kode_tipe,
    );
    if (id === undefined || !type) return [];
    const visual = iconFor(type);
    const facilities = normalizeFacilities(value.fasilitas ?? value.facilities);
    return [
      {
        id,
        type,
        typeLabel: typeLabels[type],
        name:
          toStringValue(value.nama_space) ??
          toStringValue(nestedSpace?.nama_space) ??
          toStringValue(value.nama) ??
          toStringValue(value.name) ??
                  "",
        price: toNumber(value.harga_per_jam ?? value.harga ?? value.price) ?? 0,
        capacity: toStringValue(value.kapasitas ?? value.capacity) ?? "—",
        description: toStringValue(value.deskripsi ?? value.description) ?? "",
        owner: getOwner(value.owner ?? value.pengelola),
        photo:
          toStringValue(value.foto_url) ??
          toStringValue(value.foto) ??
          toStringValue(value.photo),
        facilities,
        ...visual,
      },
    ];
  });
}
function normalizeTypes(payload: ApiRecord): SpaceTypeOption[] {
  return getList(payload).flatMap((value) => {
    const raw = isRecord(value)
      ? (value.tipe ?? value.type ?? value.kode)
      : value;
    const type = normalizeType(raw);
    if (!type) return [];
    return [
      {
        value: type,
        label: isRecord(value)
          ? (toStringValue(value.label) ?? typeLabels[type])
          : typeLabels[type],
      },
    ];
  });
}
function normalizeDiscounts(payload: ApiRecord): Discount[] {
  return getList(payload).flatMap((value) => {
    if (!isRecord(value)) return [];
    const id = toNumber(value.id);
    const name = toStringValue(value.nama_diskon);
    const percentage = toNumber(value.persentase_diskon);
    return id !== undefined && name && percentage !== undefined
      ? [{ id, name, percentage }]
      : [];
  });
}
function booleanValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "tersedia", "available", "yes", "ya"].includes(normalized)) return true;
    if (["false", "0", "tidak tersedia", "unavailable", "tidak"].includes(normalized)) return false;
  }
  if (typeof value === "number" && (value === 0 || value === 1)) return value === 1;
  return undefined;
}
function findAvailabilitySource(value: unknown, depth = 0): ApiRecord | undefined {
  if (!isRecord(value) || depth > 3) return undefined;
  const hasAvailabilityField = ["available", "tersedia", "is_available", "isAvailable"].some((key) => key in value);
  if (hasAvailabilityField) return value;
  for (const key of ["data", "ketersediaan", "availability", "result", "response"]) {
    const nested = findAvailabilitySource(value[key], depth + 1);
    if (nested) return nested;
  }
  return undefined;
}
function normalizeAvailability(payload: ApiRecord): Availability {
  const data = getObject(payload);
  const availabilitySource = findAvailabilitySource(data) ?? data;
  const explicitAvailability = booleanValue(
    availabilitySource.available ??
      availabilitySource.tersedia ??
      availabilitySource.is_available ??
      availabilitySource.isAvailable ??
      (typeof availabilitySource.status === "string" ? availabilitySource.status : undefined),
  );
  const available = explicitAvailability ?? booleanValue(availabilitySource.status) ?? booleanValue(payload.status) ?? false;
  return {
    available,
    message: toStringValue(availabilitySource.message) ?? toStringValue(availabilitySource.pesan) ?? toStringValue(data.message) ?? toStringValue(payload.message),
    pricePerHour: toNumber(availabilitySource.harga_per_jam ?? availabilitySource.price_per_hour),
    estimatedTotal: toNumber(availabilitySource.estimasi_total ?? availabilitySource.estimated_total),
    endTime: toStringValue(availabilitySource.jam_selesai ?? availabilitySource.end_time),
  };
}
function normalizeReservations(payload: ApiRecord): Reservation[] {
  return getList(payload).flatMap((value) => {
    if (!isRecord(value)) return [];
    const source = isRecord(value.reservasi)
      ? value.reservasi
      : isRecord(value.reservation)
        ? value.reservation
        : isRecord(value.booking)
          ? value.booking
          : isRecord(value.data)
            ? value.data
            : value;
    const id = toNumber(
      source.id ??
        source.id_reservasi ??
        source.reservation_id ??
        source.booking_id ??
        value.id ??
        value.id_reservasi,
    );
    if (id === undefined) return [];
    const nested = isRecord(source.space) ? source.space : undefined;
    const payment = isRecord(source.pembayaran)
      ? source.pembayaran
      : isRecord(source.payment)
        ? source.payment
        : isRecord(source.detail_pembayaran)
          ? source.detail_pembayaran
          : undefined;
    return [
      {
        id,
        code:
          nestedString(source, ["kode_booking", "kode_reservasi", "kode", "no_booking", "nomor_booking", "booking_code", "reservation_code"]) ??
          "",
        spaceName:
          toStringValue(source.nama_space) ??
          toStringValue(source.space_name) ??
          toStringValue(source.nama_ruangan) ??
          toStringValue(nested?.nama_space) ??
          toStringValue(nested?.nama) ??
          toStringValue(nested?.name) ??
          "",
        duration: toNumber(source.durasi_jam ?? source.duration) ?? 0,
        date: toStringValue(source.tanggal_reservasi ?? source.tanggal ?? source.date) ?? "",
        startTime: toStringValue(source.jam_mulai ?? source.jam ?? source.start_time) ?? "",
        endTime: toStringValue(source.jam_selesai ?? source.end_time) ?? "",
        total:
          nestedNumber(source, [
            "total_bayar",
            "total_harga",
            "harga_total",
            "total_harga_sewa",
            "total_pembayaran",
            "jumlah_bayar",
            "nominal",
            "amount",
            "total",
          ]) ??
          nestedNumber(payment, ["total_bayar", "total_harga", "nominal", "amount", "total"]) ??
          0,
        status: toStringValue(source.status ?? source.status_reservasi) ?? "",
      },
    ];
  });
}
function normalizeTicket(payload: ApiRecord, fallback: Reservation): TicketData {
  const reservation = normalizeReservations(payload)[0] ?? fallback;
  return {
    ...reservation,
    qrValue: nestedString(payload, ["qr_code", "qr_url", "qr_data", "qrcode", "barcode"]),
    coworkingName: nestedString(payload, ["nama_coworking", "coworking_name", "nama_owner"]),
    memberName: nestedString(payload, ["nama_member", "member_name"]),
  };
}
function statusLabel(status: string) {
  return (
    ((
      {
        belum_dikonfirm: "Belum Dikonfirmasi",
        disetujui: "Disetujui",
        aktif: "Aktif / Digunakan",
        selesai: "Selesai",
        dibatalkan: "Dibatalkan",
      } as Record<string, string>
    )[status] ??
      status) ||
    "Status tidak tersedia"
  );
}
function statusClass(status: string) {
  return status === "disetujui" || status === "aktif"
    ? "bg-emerald-50 text-emerald-700"
    : status === "selesai"
      ? "bg-slate-100 text-slate-600"
      : status === "dibatalkan"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";
}
function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
    >
      {children}
    </label>
  );
}

function SpaceCard({
  space,
  selected,
  onSelect,
}: {
  space: Space;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = space.icon;
  const [detail, setDetail] = useState<Space | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");
  async function showDetails() {
    setLoadingDetail(true);
    setDetailError("");
    const result = await getSpace(space.id);
    if (result.ok) {
      const nextDetail = normalizeSpaces(result.payload)[0];
      if (nextDetail) setDetail(nextDetail);
      else
        setDetailError("Detail space tidak memiliki data yang valid dari API.");
    } else
      setDetailError(messageFrom(result, "Detail space tidak dapat dimuat."));
    setLoadingDetail(false);
  }
  return (
    <>
      <article
        className={`group w-full rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md sm:p-5 ${selected ? "border-primary ring-2 ring-primary/15" : "border-slate-200/80"}`}
      >
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${space.accent}`}
            >
              {space.photo ? (
                <span
                  aria-hidden="true"
                  className="h-full w-full rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url("${space.photo}")` }}
                />
              ) : (
                <Icon aria-hidden="true" className="h-5 w-5" />
              )}
            </span>
            {selected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-bold text-primary-hover">
                <Check aria-hidden="true" className="h-3.5 w-3.5" /> Ruangan
                Terpilih
              </span>
            )}
          </div>
          <p className="mt-4 text-xs font-semibold text-primary">
            {space.typeLabel}
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900">
            {space.name}
          </h3>
          {space.description && (
            <p className="mt-1 text-xs text-slate-500">{space.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
            {space.owner && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-slate-400"
                />
                {space.owner}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users
                aria-hidden="true"
                className="h-3.5 w-3.5 text-slate-400"
              />
              {space.capacity}
            </span>
          </div>
          {space.facilities.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {space.facilities.map((facility) => (
                  <span
                    key={facility}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                  >
                    <Check
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-emerald-600"
                    />
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex items-end justify-between gap-3">
            <span className="text-xs text-slate-500">Harga dari API</span>
            <span className="text-base font-extrabold text-slate-900">
              {formatRupiah(space.price)}{" "}
              <span className="text-xs font-medium text-slate-500">/ jam</span>
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => void showDetails()}
          className="mt-4 w-full rounded-lg border border-primary/30 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary-light"
        >
          Lihat Detail
        </button>
      </article>
      {(loadingDetail || detailError || detail) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`space-detail-${space.id}`}
        >
          <article className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Detail Space
                </p>
                <h2
                  id={`space-detail-${space.id}`}
                  className="mt-1 text-2xl font-bold"
                >
                  {detail?.name ?? space.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetail(null);
                  setDetailError("");
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                aria-label="Tutup detail"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {loadingDetail ? (
              <div className="mt-5 h-32 animate-pulse rounded-xl bg-slate-100" />
            ) : detailError ? (
              <p
                role="alert"
                className="mt-5 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {detailError}
              </p>
            ) : (
              detail && (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Tipe</p>
                      <p className="mt-1 font-bold">{detail.typeLabel}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Kapasitas</p>
                      <p className="mt-1 font-bold">{detail.capacity}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Harga per jam</p>
                      <p className="mt-1 font-bold">
                        {formatRupiah(detail.price)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Owner/Coworking</p>
                      <p className="mt-1 font-bold">{detail.owner || "—"}</p>
                    </div>
                  </div>
                  {detail.description && (
                    <p className="mt-5 text-sm leading-6 text-slate-600">
                      {detail.description}
                    </p>
                  )}
                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect();
                        setDetail(null);
                      }}
                      className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
                    >
                      Pilih Space
                    </button>
                  </div>
                </>
              )
            )}
          </article>
        </div>
      )}
    </>
  );
}
function ReservationCard({
  reservation,
  onCancel,
  cancelling,
}: {
  reservation: Reservation;
  onCancel: (id: number) => void;
  cancelling: boolean;
}) {
  const [panel, setPanel] = useState<"detail" | "ticket" | null>(null);
  const [panelReservation, setPanelReservation] = useState<Reservation>(reservation);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState("");
  const canCancel = ["belum_dikonfirm", "disetujui"].includes(reservation.status);
  async function openPanel(kind: "detail" | "ticket") {
    setPanel(kind);
    if (kind === "ticket") setTicket(null);
    setPanelLoading(true);
    setPanelError("");
    const result = kind === "detail" ? await getReservation(reservation.id) : await getReservationTicket(reservation.id);
    if (result.ok) {
      const nextReservation = normalizeReservations(result.payload)[0] ?? reservation;
      setPanelReservation(nextReservation);
      if (kind === "ticket") setTicket(normalizeTicket(result.payload, nextReservation));
    }
    else setPanelError(messageFrom(result, kind === "detail" ? "Detail reservasi tidak dapat dimuat." : "E-ticket tidak dapat dimuat."));
    setPanelLoading(false);
  }
  return (
    <>
      <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          {reservation.code && <p className="text-xs font-bold text-slate-400">{reservation.code}</p>}
          {reservation.spaceName && <h3 className="mt-1 text-sm font-bold text-slate-900">{reservation.spaceName}</h3>}
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass(reservation.status)}`}
        >
          {statusLabel(reservation.status)}
        </span>
      </div>
      <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <p>
          {reservation.date} · {reservation.startTime}
          {reservation.endTime ? `–${reservation.endTime}` : ""} ·{" "}
          {reservation.duration} jam
        </p>
        <div className="flex items-center justify-between">
          <span>Total Bayar</span>
          <span className="font-extrabold text-slate-900">
            {formatRupiah(reservation.total)}
          </span>
        </div>
      </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={() => void openPanel("detail")} disabled={panelLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><Eye className="h-3.5 w-3.5" />Detail</button>
          <button type="button" onClick={() => void openPanel("ticket")} disabled={panelLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-light px-2.5 py-1.5 text-xs font-bold text-primary-hover hover:bg-primary hover:text-white disabled:opacity-50"><Ticket className="h-3.5 w-3.5" />E-ticket</button>
          {canCancel && <button type="button" onClick={() => onCancel(reservation.id)} disabled={cancelling} className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60">{cancelling ? "Membatalkan..." : "Batalkan"}</button>}
        </div>
      </article>
      {panel && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" role="dialog" aria-modal="true" aria-label={panel === "detail" ? "Detail reservasi" : "E-ticket reservasi"}><article className={`w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg ${panel === "ticket" ? "print:shadow-none" : ""}`}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-primary">{panel === "detail" ? "Detail Reservasi" : "E-ticket RuangKerja"}</p><h2 className="mt-1 text-xl font-extrabold">{panelReservation.code}</h2></div><button type="button" onClick={() => setPanel(null)} aria-label="Tutup"><X className="h-5 w-5 text-slate-500" /></button></div>{panelLoading ? <p className="mt-6 text-sm text-slate-500">Memuat data dari API...</p> : panelError ? <p role="alert" className="mt-6 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{panelError}</p> : panel === "ticket" && ticket ? <div className="mt-6 rounded-xl border-2 border-dashed border-primary/30 p-5"><div className="text-center"><p className="text-sm font-extrabold text-primary">{ticket.coworkingName ?? "RuangKerja"}</p><p className="mt-1 text-xs text-slate-500">Bukti reservasi coworking space</p></div><div className="my-5 border-t border-dashed border-slate-200" /><div className="grid gap-3 text-sm sm:grid-cols-2"><InfoRow label="Kode booking" value={ticket.code} /><InfoRow label="Member" value={ticket.memberName ?? "Member"} /><InfoRow label="Space" value={ticket.spaceName} /><InfoRow label="Status" value={statusLabel(ticket.status)} /><InfoRow label="Tanggal" value={ticket.date} /><InfoRow label="Jadwal" value={`${ticket.startTime}${ticket.endTime ? ` - ${ticket.endTime}` : ""}`} /><InfoRow label="Durasi" value={`${ticket.duration} jam`} /><InfoRow label="Total" value={formatRupiah(ticket.total)} /></div>{ticket.qrValue && /^(data:image|https?:\/\/)/.test(ticket.qrValue) ? <div className="mt-5 text-center"><img src={ticket.qrValue} alt="QR code e-ticket" className="mx-auto h-32 w-32 object-contain" /><p className="mt-2 text-[11px] text-slate-500">Scan QR untuk detail reservasi</p></div> : <p className="mt-5 text-center text-xs text-slate-500">QR belum disediakan oleh response backend.</p>}</div> : <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2"><InfoRow label="Space" value={panelReservation.spaceName} /><InfoRow label="Status" value={statusLabel(panelReservation.status)} /><InfoRow label="Tanggal" value={panelReservation.date} /><InfoRow label="Jadwal" value={`${panelReservation.startTime}${panelReservation.endTime ? ` - ${panelReservation.endTime}` : ""}`} /><InfoRow label="Durasi" value={`${panelReservation.duration} jam`} /><InfoRow label="Total" value={formatRupiah(panelReservation.total)} /></div>}<div className="mt-6 flex gap-2"><button type="button" onClick={() => setPanel(null)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Tutup</button>{panel === "ticket" && <button type="button" onClick={() => window.print()} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover">Cetak E-ticket</button>}</div></article></div>}
    </>
  );
}
function InfoRow({ label, value }: { label: string; value: string }) { if (!value) return null; return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-800">{value}</p></div>; }

export default function MemberBookingPage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceTypes, setSpaceTypes] = useState<SpaceTypeOption[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [reservationStatus, setReservationStatus] = useState<ReservationStatusFilter>("");
  const [historyMonth, setHistoryMonth] = useState(new Date().getMonth() + 1);
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear());
  const [activeType, setActiveType] = useState<SpaceTypeValue | "">("");
  const [search, setSearch] = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [promo, setPromo] = useState("");
  const [validDiscount, setValidDiscount] = useState<ValidDiscount | null>(
    null,
  );
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [createdReservation, setCreatedReservation] =
    useState<Reservation | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [spaceError, setSpaceError] = useState("");
  const [accountError, setAccountError] = useState("");
  const [notice, setNotice] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const selectedSpace = useMemo(
    () => spaces.find((space) => space.id === selectedSpaceId),
    [spaces, selectedSpaceId],
  );
  const subtotal =
    availability?.estimatedTotal ??
    (availability?.pricePerHour ?? selectedSpace?.price ?? 0) * duration;
  const discountAmount = validDiscount
    ? (subtotal * validDiscount.percentage) / 100
    : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  useEffect(() => {
    let active = true;
    async function loadMeta() {
      const [typesResult, discountsResult] = await Promise.all([
        getSpaceTypes(),
        getActiveDiscounts(),
      ]);
      if (!active) return;
      if (typesResult.ok) setSpaceTypes(normalizeTypes(typesResult.payload));
      else
        setSpaceError(
          messageFrom(typesResult, "Tipe space tidak dapat dimuat."),
        );
      if (discountsResult.ok)
        setDiscounts(normalizeDiscounts(discountsResult.payload));
    }
    void loadMeta();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoadingSpaces(true);
      const result = await getSpaces(activeType || undefined, search);
      if (!active) return;
      if (result.ok) {
        const nextSpaces = normalizeSpaces(result.payload);
        setSpaces(nextSpaces);
        setSelectedSpaceId((current) =>
          nextSpaces.some((space) => space.id === current)
            ? current
            : (nextSpaces[0]?.id ?? null),
        );
        setSpaceError("");
      } else {
        setSpaces([]);
        setSelectedSpaceId(null);
        setSpaceError(messageFrom(result, "Space tidak dapat dimuat."));
      }
      setLoadingSpaces(false);
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [activeType, search]);
  async function loadReservations(status = reservationStatus) {
    setLoadingAccount(true);
    const result = await getMyReservations(status || undefined);
    if (result.ok) {
      const listedReservations = normalizeReservations(result.payload);
      const hydratedReservations = await Promise.all(
        listedReservations.map(async (reservation) => {
          if (reservation.code && reservation.spaceName && reservation.total > 0) return reservation;
          const detailResult = await getReservation(reservation.id);
          return detailResult.ok
            ? (normalizeReservations(detailResult.payload)[0] ?? reservation)
            : reservation;
        }),
      );
      setReservations(hydratedReservations);
      setAccountError("");
    } else
      setAccountError(
        messageFrom(result, "Reservasi Anda tidak dapat dimuat."),
      );
    setLoadingAccount(false);
  }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReservations();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reservationStatus]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setAvailability(null);
      if (!selectedSpaceId || !date || !startTime) return;
      setLoadingAvailability(true);
      const result = await getAvailability({
        idSpace: selectedSpaceId,
        tanggal: date,
        jamMulai: startTime,
        durasiJam: duration,
      });
      if (!active) return;
      if (result.ok) setAvailability(normalizeAvailability(result.payload));
      else
        setError(
          messageFrom(result, "Ketersediaan space tidak dapat diperiksa."),
        );
      setLoadingAvailability(false);
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [selectedSpaceId, date, startTime, duration]);
  async function validatePromo() {
    const code = promo.trim();
    if (!code) {
      setValidDiscount(null);
      return;
    }
    setLoadingPromo(true);
    setError("");
    const result = await checkDiscount(code);
    if (result.ok) {
      const data = getObject(result.payload);
      const id = toNumber(data.id);
      const percentage = toNumber(data.persentase_diskon);
      if (id !== undefined && percentage !== undefined)
        setValidDiscount({ id, name: code, code, percentage });
      else {
        setValidDiscount(null);
        setError("Response promo tidak memiliki detail diskon yang valid.");
      }
    } else {
      setValidDiscount(null);
      setError(messageFrom(result, "Kode promo tidak valid."));
    }
    setLoadingPromo(false);
  }
  async function handleReservationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!selectedSpaceId || !date || !startTime) {
      setError("Pilih space, tanggal, dan jam mulai terlebih dahulu.");
      return;
    }
    if (!availability?.available) {
      setError(
        availability?.message ?? "Space belum tersedia untuk jadwal ini.",
      );
      return;
    }
    setSubmitting(true);
    const result = await createReservation({
      idSpace: selectedSpaceId,
      tanggalReservasi: date,
      jamMulai: startTime,
      durasiJam: duration,
      ...(validDiscount
        ? { idDiskon: validDiscount.id, kodePromo: validDiscount.code }
        : {}),
    });
    if (result.ok) {
      const listedReservation = normalizeReservations(result.payload)[0] ?? null;
      const detailResult = listedReservation
        ? await getReservation(listedReservation.id)
        : null;
      const reservation = detailResult?.ok
        ? (normalizeReservations(detailResult.payload)[0] ?? listedReservation)
        : listedReservation;
      setCreatedReservation(reservation);
      setNotice(
        "Reservasi berhasil dibuat. Status mengikuti response backend.",
      );
      await loadReservations();
    } else setError(messageFrom(result, "Reservasi tidak dapat dibuat."));
    setSubmitting(false);
  }
  async function loadHistoryFor(month = historyMonth, year = historyYear) {
    setShowHistory(true);
    setLoadingHistory(true);
    const result = await getMyReservationHistory(month, year);
    if (result.ok) setHistory(normalizeReservations(result.payload));
    else
      setAccountError(
        messageFrom(result, "Riwayat reservasi tidak dapat dimuat."),
      );
    setLoadingHistory(false);
  }
  async function loadHistory() { await loadHistoryFor(); }
  async function handleCancel(id: number) {
    setCancellingId(id);
    const result = await cancelReservation(id);
    if (result.ok) await loadReservations();
    else
      setAccountError(messageFrom(result, "Reservasi tidak dapat dibatalkan."));
    setCancellingId(null);
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); }

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-lg"
            aria-label="Beranda RuangKerja"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md">
              <Building2 aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Ruang<span className="text-teal-600">Kerja</span>
              </span>
              <span className="-mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Coworking Space
              </span>
            </span>
          </Link>
          <div className="relative hidden min-w-0 max-w-xs flex-1 md:block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              aria-label="Cari space atau lokasi"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari space atau lokasi..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-primary"
            />
          </div>
          <nav
            className="hidden flex-1 items-center justify-center gap-5 lg:flex"
            aria-label="Navigasi member"
          >
            {navItems.map((item, index) => (
              <a
                key={item}
                href={
                  index === 0
                    ? "#availability"
                    : index === 1
                      ? "#reservations"
                      : "#history"
                }
                onClick={
                  index === 2
                    ? (event) => {
                        event.preventDefault();
                        void loadHistory();
                      }
                    : undefined
                }
                className={`whitespace-nowrap py-3 text-xs font-semibold hover:text-primary ${index === 0 ? "border-b-2 border-primary text-primary" : "text-slate-500"}`}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <span
              aria-label="Profil member"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white"
            >
              <Users aria-hidden="true" className="h-4 w-4" />
            </span>
            <Link href="/member/profile" className="hidden text-xs font-bold text-slate-500 hover:text-primary sm:block">Profile</Link>
            <button type="button" onClick={() => void logout()} className="hidden items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary sm:flex"><LogOut className="h-3.5 w-3.5" />Logout</button>
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="border-t border-slate-100 px-4 py-3 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:px-2">
              {navItems.map((item, index) => (
                <a
                  key={item}
                  href={
                    index === 0
                      ? "#availability"
                      : index === 1
                        ? "#reservations"
                        : "#history"
                  }
                  onClick={(event) => {
                    setMobileMenuOpen(false);
                    if (index === 2) {
                      event.preventDefault();
                      void loadHistory();
                    }
                  }}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${index === 0 ? "bg-primary-light text-primary-hover" : "text-slate-600"}`}
                >
                  {item}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span>Portal Member</span>
              <span aria-hidden="true">•</span>
              <span>Ketersediaan Space</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pilih Ruang Kerja Ideal Anda
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Pilih space dan jadwal dari ketersediaan backend untuk membuat
              reservasi.
            </p>
          </div>
        </div>
        <section className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            <button
              type="button"
              onClick={() => setActiveType("")}
              className={`h-9 shrink-0 rounded-lg px-3.5 text-xs font-bold ${activeType === "" ? "bg-primary text-white" : "bg-slate-50 text-slate-600"}`}
            >
              Semua
            </button>
            {spaceTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setActiveType(type.value)}
                className={`h-9 shrink-0 rounded-lg px-3.5 text-xs font-bold ${activeType === type.value ? "bg-primary text-white" : "bg-slate-50 text-slate-600"}`}
              >
                {type.label}
              </button>
            ))}
          </div>
          {spaceError && (
            <p className="mt-3 flex gap-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {spaceError}
            </p>
          )}
        </section>
        <div
          id="availability"
          className="mt-8 grid items-start gap-6 lg:grid-cols-12"
        >
          <section className="lg:col-span-7 xl:col-span-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Space Tersedia</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Data space berasal dari katalog backend.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {spaces.length} pilihan
              </span>
            </div>
            {loadingSpaces ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-64 animate-pulse rounded-xl bg-slate-200/70"
                  />
                ))}
              </div>
            ) : spaceError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700"
              >
                Gagal memuat data space. {spaceError}
              </div>
            ) : spaces.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                Belum ada space yang tersedia dari API.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {spaces.map((space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    selected={space.id === selectedSpaceId}
                    onSelect={() => setSelectedSpaceId(space.id)}
                  />
                ))}
              </div>
            )}
          </section>
          <aside className="lg:sticky lg:top-5 lg:col-span-5 xl:col-span-4">
            <form
              onSubmit={handleReservationSubmit}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    Langkah 1 dari 2
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Buat Reservasi</h2>
                </div>
                <CalendarDays
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
              </div>
              {selectedSpace ? (
                <div className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${selectedSpace.accent}`}
                  >
                    {selectedSpace.photo ? (
                      <span
                        className="h-full w-full rounded-lg bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${selectedSpace.photo}")`,
                        }}
                      />
                    ) : (
                      <selectedSpace.icon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {selectedSpace.typeLabel}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {selectedSpace.name} · {selectedSpace.capacity}
                    </p>
                    <p className="mt-1 text-xs font-bold text-primary">
                      {formatRupiah(selectedSpace.price)} / jam
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  Pilih space dari katalog API.
                </p>
              )}
              <div className="mt-5 space-y-4">
                <div>
                  <FieldLabel htmlFor="reservation-date">
                    Tanggal Sewa
                  </FieldLabel>
                  <input
                    id="reservation-date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel htmlFor="start-time">Jam Mulai</FieldLabel>
                    <div className="relative">
                      <Clock3
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(event) => setStartTime(event.target.value)}
                        className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-2 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel htmlFor="duration">Durasi</FieldLabel>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(event) =>
                        setDuration(Number(event.target.value))
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value={1}>1 jam</option>
                      <option value={2}>2 jam</option>
                      <option value={3}>3 jam</option>
                      <option value={4}>4 jam</option>
                      <option value={8}>8 jam</option>
                    </select>
                  </div>
                </div>
                <div>
                  <FieldLabel htmlFor="promo">Kode Promo / Diskon</FieldLabel>
                  <div className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Coffee
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        id="promo"
                        value={promo}
                        onChange={(event) => {
                          setPromo(event.target.value);
                          setValidDiscount(null);
                        }}
                        placeholder="Masukkan kode promo"
                        className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => void validatePromo()}
                      disabled={!promo.trim() || loadingPromo}
                      className="h-11 rounded-lg border border-slate-200 px-3 text-xs font-bold disabled:opacity-50"
                    >
                      {loadingPromo ? (
                        <LoaderCircle
                          className="h-4 w-4 animate-spin"
                          aria-label="Memvalidasi promo"
                        />
                      ) : (
                        "Validasi"
                      )}
                    </button>
                  </div>
                  {discounts.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Promo aktif dari API:{" "}
                      {discounts.map((discount) => discount.name).join(", ")}
                    </p>
                  )}
                  {validDiscount && (
                    <p className="mt-1.5 text-xs font-medium text-emerald-600">
                      {validDiscount.code} valid · diskon{" "}
                      {validDiscount.percentage}%
                    </p>
                  )}
                </div>
              </div>
              {loadingAvailability && (
                <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />{" "}
                  Memeriksa ketersediaan...
                </p>
              )}
              {availability && (
                <p
                  className={`mt-4 flex gap-2 rounded-lg px-3 py-2.5 text-xs ${availability.available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                >
                  <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {availability.message ??
                    (availability.available
                      ? "Space tersedia."
                      : "Jadwal yang dipilih tidak tersedia.")}
                </p>
              )}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal estimasi</span>
                  <span>{subtotal > 0 ? formatRupiah(subtotal) : "—"}</span>
                </div>
                {validDiscount && (
                  <div className="mt-2 flex justify-between text-sm text-emerald-600">
                    <span>Diskon API ({validDiscount.percentage}%)</span>
                    <span>− {formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-bold">Total Estimasi</span>
                  <span className="text-xl font-extrabold text-primary">
                    {subtotal > 0 ? formatRupiah(estimatedTotal) : "—"}
                  </span>
                </div>
              </div>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700"
                >
                  {error}
                </p>
              )}
              {notice && (
                <p
                  role="status"
                  className="mt-4 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700"
                >
                  {notice}
                </p>
              )}
              {createdReservation && (
                <div className="mt-4 rounded-lg bg-primary-light p-3 text-xs text-primary-hover">
                  <p className="font-bold">{createdReservation.code}</p>
                  <p className="mt-1">
                    Status: {statusLabel(createdReservation.status)} · Total:{" "}
                    {formatRupiah(createdReservation.total)}
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={
                  submitting || loadingAvailability || !availability?.available
                }
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />{" "}
                    Mengirim...
                  </>
                ) : (
                  <>
                    Lanjutkan Reservasi{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
                <ShieldCheck
                  className="h-3.5 w-3.5 text-primary"
                  aria-hidden="true"
                />{" "}
                Harga final mengikuti backend
              </p>
            </form>
          </aside>
        </div>

        <section
          id="reservations"
          className="mt-12 border-t border-slate-200/80 pt-8"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Ringkasan akun
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                Aktivitas & Reservasi Saya
              </h2>
            </div>
            <div className="flex items-center gap-2"><select value={reservationStatus} onChange={(event) => setReservationStatus(event.target.value as ReservationStatusFilter)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"><option value="">Semua status</option><option value="belum_dikonfirm">Menunggu</option><option value="disetujui">Disetujui</option><option value="aktif">Aktif</option><option value="selesai">Selesai</option><option value="dibatalkan">Dibatalkan</option></select><button type="button" onClick={() => void loadReservations()} className="text-xs font-bold text-primary">Refresh</button></div>
          </div>
          {accountError && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700"
            >
              {accountError}
            </p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <CalendarDays
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                <span className="text-xs text-slate-500">Total Reservasi</span>
              </div>
              <p className="mt-4 text-2xl font-extrabold">
                {loadingAccount ? "—" : reservations.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles
                  className="h-5 w-5 text-emerald-600"
                  aria-hidden="true"
                />
                <span className="text-xs text-slate-500">
                  Total Pengeluaran
                </span>
              </div>
              <p className="mt-4 text-2xl font-extrabold">
                {loadingAccount
                  ? "—"
                  : formatRupiah(
                      reservations.reduce((sum, item) => sum + item.total, 0),
                    )}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {loadingAccount ? (
              <div className="lg:col-span-3 rounded-xl bg-slate-100 p-8 text-center text-sm text-slate-500">
                Memuat reservasi...
              </div>
            ) : reservations.length === 0 ? (
              <div className="lg:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                Belum ada reservasi dari API.
              </div>
            ) : (
              reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={(id) => void handleCancel(id)}
                  cancelling={cancellingId === reservation.id}
                />
              ))
            )}
          </div>
        </section>
        {showHistory && (
          <section
            id="history"
            className="mt-10 border-t border-slate-200/80 pt-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Riwayat & Tiket
                </p>
                <h2 className="mt-1 text-2xl font-bold">Riwayat Reservasi</h2>
              </div>
              <div className="flex items-center gap-2"><select value={historyMonth} onChange={(event) => setHistoryMonth(Number(event.target.value))} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"><option value={1}>Januari</option><option value={2}>Februari</option><option value={3}>Maret</option><option value={4}>April</option><option value={5}>Mei</option><option value={6}>Juni</option><option value={7}>Juli</option><option value={8}>Agustus</option><option value={9}>September</option><option value={10}>Oktober</option><option value={11}>November</option><option value={12}>Desember</option></select><select value={historyYear} onChange={(event) => setHistoryYear(Number(event.target.value))} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"><option value={historyYear - 1}>{historyYear - 1}</option><option value={historyYear}>{historyYear}</option><option value={historyYear + 1}>{historyYear + 1}</option></select><button type="button" onClick={() => void loadHistory()} className="rounded-lg bg-primary px-2.5 py-2 text-xs font-bold text-white">Muat</button><button type="button" onClick={() => setShowHistory(false)} className="text-xs font-bold text-slate-500">Tutup</button></div>
            </div>
            {loadingHistory ? (
              <p className="mt-5 text-sm text-slate-500">
                Memuat riwayat dari API...
              </p>
            ) : history.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                Belum ada riwayat reservasi.
              </p>
            ) : (
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {history.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={(id) => void handleCancel(id)}
                    cancelling={cancellingId === reservation.id}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <footer className="mt-8 border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl justify-between px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
          <span>
            <strong className="text-slate-700">RuangKerja</strong> · Coworking
            Space
          </span>
          <span>© 2026 RuangKerja Coworking</span>
        </div>
      </footer>
    </div>
  );
}
