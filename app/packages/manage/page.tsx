"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

import PackageManageLayout, {
  type PackageManageTab,
} from "@/app/components/manage/package/PackageManageLayout";
import PackageManageSummary from "@/app/components/manage/package/PackageManageSummary";
import PackageManageTravellerDetails, {
  type PackageManageTraveller,
} from "@/app/components/manage/package/PackageManageTravellerDetails";
import PackageManageContactDetails, {
  type PackageManageContact,
} from "@/app/components/manage/package/PackageManageContactDetails";
import PackageManageSpecialRequest from "@/app/components/manage/package/PackageManageSpecialRequest";
import PackageManageAddons, {
  getAddOnKey,
  type PackageAddOnOption,
  type PackageAddOnQuote,
} from "@/app/components/manage/package/PackageManageAddons";

type Payload = any;

function dispatchBookingUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT));
}

function savePayload(payloadStorageKey: string | undefined, payload: any) {
  if (typeof window === "undefined") return false;
  if (!payloadStorageKey) return false;

  localStorage.setItem(payloadStorageKey, JSON.stringify(payload));
  dispatchBookingUpdate();
  return true;
}

function getTravellerName(traveller: PackageManageTraveller) {
  return (
    traveller?.fullName ||
    traveller?.name ||
    `${traveller?.firstName || ""} ${traveller?.lastName || ""}`.trim() ||
    "Traveller"
  );
}

function normalizeTravellers(payload: Payload | null): PackageManageTraveller[] {
  const travellerBlock = payload?.traveller || {};

  const list = Array.isArray(travellerBlock?.travellers)
    ? travellerBlock.travellers
    : Array.isArray(payload?.travellers)
    ? payload.travellers
    : [];

  if (list.length) {
    return list.map((item: any, index: number) => {
      const fullName = String(item?.fullName || item?.name || "").trim();
      const nameParts = fullName.split(" ").filter(Boolean);

      return {
        ...item,
        id: item?.id || `traveller-${index + 1}`,
        title: item?.title || item?.salutation || "Mr",
        firstName: item?.firstName || nameParts[0] || "",
        middleName: item?.middleName || "",
        lastName:
          item?.lastName || nameParts.slice(1).join(" ") || "",
        name:
          item?.name ||
          item?.fullName ||
          `${item?.firstName || ""} ${item?.lastName || ""}`.trim(),
        fullName:
          item?.fullName ||
          item?.name ||
          `${item?.firstName || ""} ${item?.lastName || ""}`.trim(),
        gender: item?.gender || "",
        age: item?.age || "",
        travellerType: item?.travellerType || item?.type || "adult",
        type: item?.type || item?.travellerType || "adult",
      };
    });
  }

  const lead = payload?.leadTraveller || {};
  const fullName = String(lead?.fullName || lead?.name || "").trim();
  const nameParts = fullName.split(" ").filter(Boolean);

  return [
    {
      id: "traveller-1",
      title: lead?.title || lead?.salutation || "Mr",
      firstName: lead?.firstName || nameParts[0] || "",
      middleName: lead?.middleName || "",
      lastName: lead?.lastName || nameParts.slice(1).join(" ") || "",
      name:
        lead?.name ||
        lead?.fullName ||
        `${lead?.firstName || ""} ${lead?.lastName || ""}`.trim() ||
        "Traveller",
      fullName:
        lead?.fullName ||
        lead?.name ||
        `${lead?.firstName || ""} ${lead?.lastName || ""}`.trim() ||
        "Traveller",
      gender: lead?.gender || "",
      age: lead?.age || "",
      travellerType: lead?.travellerType || lead?.type || "adult",
      type: lead?.type || lead?.travellerType || "adult",
    },
  ];
}

function normalizeContact(payload: Payload | null): PackageManageContact {
  const travellerBlock = payload?.traveller || {};
  const contact = travellerBlock?.contactDetails || {};
  const lead = payload?.leadTraveller || {};

  return {
    countryCode: contact?.countryCode || lead?.countryCode || "+91",
    mobile:
      contact?.mobile ||
      contact?.phone ||
      lead?.mobile ||
      lead?.phone ||
      "",
    email: contact?.email || lead?.email || "",
  };
}

function normalizeSelectedAddOns(payload: Payload | null): PackageAddOnOption[] {
  const addOn = payload?.addOn || {};

  const candidates = [
    addOn?.selectedAddOns,
    addOn?.addons,
    addOn?.items,
    payload?.selectedAddOns,
    payload?.addons,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) {
      return item.map((addon: any, index: number) => ({
        id: addon?.id || addon?.key || `addon-${index + 1}`,
        title: addon?.title || addon?.name || addon?.label || "Package Add-on",
        name: addon?.name || addon?.title || addon?.label || "Package Add-on",
        description: addon?.description || addon?.subtitle || addon?.type || "",
        price: Number(addon?.price || addon?.amount || 0),
        type: addon?.type || "",
      }));
    }
  }

  return [];
}

function normalizeAvailableAddOns(payload: Payload | null): PackageAddOnOption[] {
  const addOn = payload?.addOn || {};
  const summary = payload?.summary || {};

  const candidates = [
    addOn?.availableAddOns,
    addOn?.availableOptions,
    addOn?.options,
    payload?.availableAddOns,
    summary?.availableAddOns,
  ];

  for (const item of candidates) {
    if (Array.isArray(item) && item.length) {
      return item.map((addon: any, index: number) => ({
        id: addon?.id || addon?.key || `addon-${index + 1}`,
        title: addon?.title || addon?.name || addon?.label || "Package Add-on",
        name: addon?.name || addon?.title || addon?.label || "Package Add-on",
        description: addon?.description || addon?.subtitle || addon?.type || "",
        price: Number(addon?.price || addon?.amount || 0),
        type: addon?.type || "",
      }));
    }
  }

  const selected = normalizeSelectedAddOns(payload);

  if (selected.length) return selected;

  return [
    {
      id: "travel-insurance-upgrade",
      title: "Travel Insurance Upgrade",
      description: "Enhanced package protection add-on",
      price: Number(payload?.fare?.insuranceAmount || 0),
      type: "insurance",
    },
    {
      id: "private-transfer-upgrade",
      title: "Private Transfer Upgrade",
      description: "Upgrade shared transfers to private transfers",
      price: 2500,
      type: "transfer",
    },
    {
      id: "activity-pack-upgrade",
      title: "Activity Pack Upgrade",
      description: "Add curated sightseeing/activity experience",
      price: 3500,
      type: "activity",
    },
  ].filter((item) => item.price > 0 || item.id !== "travel-insurance-upgrade");
}

function sumAddOns(addOns: PackageAddOnOption[]) {
  return addOns.reduce((sum, item) => sum + Number(item?.price || 0), 0);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PackageManagePageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [activeTab, setActiveTab] = useState<PackageManageTab>("summary");
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [travellers, setTravellers] = useState<PackageManageTraveller[]>([]);
  const [contact, setContact] = useState<PackageManageContact>({
    countryCode: "+91",
    mobile: "",
    email: "",
  });
  const [specialRequest, setSpecialRequest] = useState("");
  const [activeAddOns, setActiveAddOns] = useState<PackageAddOnOption[]>([]);

  const loadBooking = () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    const all = getAllBookings();
    const found =
      all.find((item) => item.id === bookingId && item.type === "package") ||
      null;

    setBooking(found);

    if (found?.payloadStorageKey) {
      const savedPayload = getBookingPayload<Payload>(found.payloadStorageKey);

      setPayload(savedPayload ? { ...savedPayload } : null);
      setTravellers(normalizeTravellers(savedPayload));
      setContact(normalizeContact(savedPayload));
      setSpecialRequest(savedPayload?.specialRequest || "");
      setActiveAddOns(normalizeSelectedAddOns(savedPayload));
    } else {
      setPayload(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadBooking();

    window.addEventListener(BOOKING_UPDATED_EVENT, loadBooking);
    window.addEventListener("storage", loadBooking);
    window.addEventListener("focus", loadBooking);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadBooking);
      window.removeEventListener("storage", loadBooking);
      window.removeEventListener("focus", loadBooking);
    };
  }, [bookingId]);

  const summary = payload?.summary || {};
  const fare = payload?.fare || {};
  const payment = payload?.payment || {};
  const managePayment = payload?.managePayment || {};

  const packageTitle = summary?.packageTitle || booking?.title || "Package Booking";
  const routeLabel = summary?.route || "Package Route";
  const travelDate = summary?.travelDate || booking?.travelDate || "";

  const availableAddOns = useMemo(() => {
    return normalizeAvailableAddOns(payload);
  }, [payload]);

  const currentAddOnsTotal = useMemo(() => {
    const selected = normalizeSelectedAddOns(payload);
    const fromPayload =
      Number(payload?.addOn?.totalAmount || 0) ||
      Number(payload?.addOn?.total || 0) ||
      Number(payload?.fare?.addonsTotal || 0);

    return fromPayload || sumAddOns(selected);
  }, [payload]);

  const activeAddOnIds = useMemo(() => {
    return activeAddOns.map((item) => getAddOnKey(item));
  }, [activeAddOns]);

  const addOnQuote = useMemo<PackageAddOnQuote>(() => {
    const oldTotal = Number(currentAddOnsTotal || 0);
    const newTotal = sumAddOns(activeAddOns);
    const difference = newTotal - oldTotal;

    return {
      oldTotal,
      newTotal,
      difference,
      settlementMode:
        difference > 0
          ? "payment"
          : difference < 0
          ? "wallet_credit"
          : "save",
    };
  }, [currentAddOnsTotal, activeAddOns]);

  const bookedAt =
    managePayment?.paidAt ||
    payment?.paidAt ||
    payload?.bookedOn ||
    payload?.paidAt ||
    booking?.bookingDate ||
    "";

  const totalTravellers =
    Number(payment?.totalTravellers || summary?.totalAdults || 0) ||
    travellers.length ||
    1;

  const fareSummary = {
    basePrice: Number(fare?.basePrice || 0),
    upgradedDiffTotal: Number(fare?.upgradedDiffTotal || 0),
    feesAndTaxes: Number(fare?.feesAndTaxes || 0),
    insuranceAmount: Number(fare?.insuranceAmount || 0),
    couponDiscount: Number(fare?.couponDiscount || 0),
    tplCreditUsed: Number(fare?.tplCreditUsed || 0),
    totalAmount:
      Number(managePayment?.updatedTotalAmount || 0) ||
      Number(fare?.finalPayableAmount || fare?.grandTotal || booking?.amount || 0),
  };

  const handleSaveTravellers = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextTravellers = travellers.map((item, index) => ({
      ...item,
      id: item.id || `traveller-${index + 1}`,
      name: getTravellerName(item),
      fullName: getTravellerName(item),
    }));

    const nextPayload = {
      ...payload,
      traveller: {
        ...(payload.traveller || {}),
        travellers: nextTravellers,
        contactDetails: {
          ...(payload.traveller?.contactDetails || {}),
          countryCode: contact.countryCode || "+91",
          mobile: contact.mobile,
          email: contact.email,
        },
      },
      leadTraveller: {
        ...(payload.leadTraveller || {}),
        ...nextTravellers[0],
        name: getTravellerName(nextTravellers[0] || {}),
        fullName: getTravellerName(nextTravellers[0] || {}),
        mobile: contact.mobile || payload?.leadTraveller?.mobile || "",
        email: contact.email || payload?.leadTraveller?.email || "",
      },
    };

    savePayload(booking.payloadStorageKey, nextPayload);
    setPayload(nextPayload);
    alert("Traveller details updated successfully.");
  };

  const handleSaveContact = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      traveller: {
        ...(payload.traveller || {}),
        contactDetails: {
          ...(payload.traveller?.contactDetails || {}),
          countryCode: contact.countryCode || "+91",
          mobile: contact.mobile,
          email: contact.email,
        },
      },
      leadTraveller: {
        ...(payload.leadTraveller || {}),
        mobile: contact.mobile,
        phone: contact.mobile,
        email: contact.email,
      },
    };

    savePayload(booking.payloadStorageKey, nextPayload);
    setPayload(nextPayload);
    alert("Contact details updated successfully.");
  };

  const handleSaveSpecialRequest = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      specialRequest,
      summary: {
        ...(payload.summary || {}),
        specialRequest,
      },
    };

    savePayload(booking.payloadStorageKey, nextPayload);
    setPayload(nextPayload);
    alert("Special request updated successfully.");
  };

  const handleToggleAddOn = (addOn: PackageAddOnOption) => {
    const key = getAddOnKey(addOn);

    setActiveAddOns((prev) => {
      const exists = prev.some((item) => getAddOnKey(item) === key);

      if (exists) {
        return prev.filter((item) => getAddOnKey(item) !== key);
      }

      return [...prev, addOn];
    });
  };

  const handleAddOnContinue = () => {
    if (!booking?.payloadStorageKey || !payload) return;

    const nextPayload = {
      ...payload,
      manageDraft: {
        ...(payload.manageDraft || {}),
        section: "package-addons",
        selectedAddOns: activeAddOns,
        addOnQuote,
      },
    };

    savePayload(booking.payloadStorageKey, nextPayload);

    window.location.href = `/manage/payment?bookingId=${encodeURIComponent(
      booking.id
    )}&section=package-addons&type=package`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8 text-sm text-[#6b7280]">
          Loading package manage booking...
        </div>
      </main>
    );
  }

  if (!booking || !payload) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-[1440px] rounded-[28px] border border-black/5 bg-white p-8">
          <h1 className="text-xl font-bold text-[#111827]">
            Package booking not found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <PackageManageLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      bookingId={booking.id}
      packageTitle={packageTitle}
      routeLabel={routeLabel}
      travelDateLabel={formatDateOnly(travelDate)}
    >
      {activeTab === "summary" && (
        <PackageManageSummary
          bookingStatus={booking.status}
          bookedAt={formatDateTime(bookedAt)}
          packageTitle={packageTitle}
          packageSlug={summary?.packageSlug}
          routeLabel={routeLabel}
          travelDate={formatDateOnly(travelDate)}
          variant={summary?.variant}
          originCity={summary?.originCity}
          days={Number(summary?.days || 0)}
          nights={Number(summary?.nights || 0)}
          travellersLabel={booking.travellers || `${totalTravellers} Traveller`}
          fareSummary={fareSummary}
        />
      )}

      {activeTab === "traveller-details" && (
        <PackageManageTravellerDetails
          travellers={travellers}
          onChange={setTravellers}
          onSave={handleSaveTravellers}
        />
      )}

      {activeTab === "contact-details" && (
        <PackageManageContactDetails
          contact={contact}
          onChange={setContact}
          onSave={handleSaveContact}
        />
      )}

      {activeTab === "special-request" && (
        <PackageManageSpecialRequest
          value={specialRequest}
          onChange={setSpecialRequest}
          onSave={handleSaveSpecialRequest}
        />
      )}

      {activeTab === "package-addons" && (
        <PackageManageAddons
          currentAddOnsTotal={currentAddOnsTotal}
          selectedAddOns={normalizeSelectedAddOns(payload)}
          availableAddOns={availableAddOns}
          activeAddOnIds={activeAddOnIds}
          onToggleAddOn={handleToggleAddOn}
          quote={addOnQuote}
          onContinue={handleAddOnContinue}
        />
      )}
    </PackageManageLayout>
  );
}

export default function PackageManagePage() {
  return (
    <Suspense fallback={<div />}>
      <PackageManagePageContent />
    </Suspense>
  );
}