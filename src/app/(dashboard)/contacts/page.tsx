
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  Building2,
  Pencil,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserPlus,
} from "lucide-react";

type ContactStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "customer"
  | "lost";

type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  source: string | null;
  status: ContactStatus;
  createdAt: string;
};

type ContactForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  source: string;
  status: ContactStatus;
};

const emptyForm: ContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  source: "",
  status: "new",
};

const statusStyles: Record<ContactStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  qualified: "bg-purple-50 text-purple-700",
  customer: "bg-emerald-50 text-emerald-700",
  lost: "bg-red-50 text-red-700",
};

const statusLabels: Record<ContactStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  customer: "Customer",
  lost: "Lost",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<Contact | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(`/api/contacts?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch contacts.");
      }

      setContacts(result.data || []);
      setTotal(result.pagination?.total || 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timeout);
  }, [message]);

  const openAddModal = () => {
    setSelectedContact(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);

    setForm({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      jobTitle: contact.jobTitle || "",
      source: contact.source || "",
      status: contact.status || "new",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setSelectedContact(null);
    setForm(emptyForm);
    setError("");
  };

  const updateField = (
    field: keyof ContactForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.firstName.trim() &&
      !form.lastName.trim() &&
      !form.email.trim() &&
      !form.phone.trim()
    ) {
      setError("Please enter a name, email or phone number.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(selectedContact);

      const response = await fetch(
        isEditing
          ? `/api/contacts/${selectedContact!.id}`
          : "/api/contacts",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save contact.");
      }

      setModalOpen(false);
      setSelectedContact(null);
      setForm(emptyForm);
      setMessage(
        isEditing
          ? "Contact updated successfully."
          : "Contact added successfully."
      );

      await fetchContacts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (contact: Contact) => {
    setSelectedContact(contact);
    setError("");
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedContact) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/contacts/${selectedContact.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete contact.");
      }

      setDeleteModalOpen(false);
      setSelectedContact(null);
      setMessage("Contact deleted successfully.");

      if (contacts.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await fetchContacts();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const fullName = (contact: Contact) =>
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    "Unnamed Contact";

  const firstLetter = (contact: Contact) =>
    (contact.firstName || contact.email || "?")
      .charAt(0)
      .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7FAFA] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={16} />
              <span>CRM</span>
              <span>/</span>
              <span className="font-medium text-[#0F766E]">
                Contacts
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Contacts
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage and organize all your contacts in one place.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59]"
          >
            <Plus size={18} />
            Add Contact
          </button>
        </div>

        {/* Success message */}
        {message && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span className="font-medium">{message}</span>
            <button
              onClick={() => setMessage("")}
              className="ml-auto"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Error message */}
        {error && !modalOpen && !deleteModalOpen && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Contacts</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {total.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-teal-50 p-3 text-[#0F766E]">
                <Users size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Showing Contacts</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {contacts.length}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <UserPlus size={23} />
              </div>
            </div>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Search and actions */}
          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-gray-900">
                All Contacts
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                View, edit and manage your contacts.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search contacts..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-teal-50 sm:w-64"
                />
              </div>

              <button
                onClick={fetchContacts}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <Loader2
                          size={25}
                          className="animate-spin text-[#0F766E]"
                        />
                        <span className="text-sm">Loading contacts...</span>
                      </div>
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="rounded-full bg-teal-50 p-4 text-[#0F766E]">
                          <Users size={28} />
                        </div>
                        <p className="mt-4 font-semibold text-gray-800">
                          No contacts found
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Add a new contact or try a different search.
                        </p>
                        <button
                          onClick={openAddModal}
                          className="mt-4 text-sm font-semibold text-[#0F766E] hover:underline"
                        >
                          + Add your first contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="transition hover:bg-gray-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-[#0F766E]">
                            {firstLetter(contact)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {fullName(contact)}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {contact.jobTitle || "Contact"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={15} className="text-gray-400" />
                          {contact.email || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={15} className="text-gray-400" />
                          {contact.phone || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 size={15} className="text-gray-400" />
                          {contact.company || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[contact.status]}`}
                        >
                          {statusLabels[contact.status]}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(contact)}
                            title="Edit contact"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-[#0F766E]"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => openDeleteModal(contact)}
                            title="Delete contact"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {total === 0 ? 0 : (page - 1) * limit + 1}
              </span>
              {" "}to{" "}
              <span className="font-semibold text-gray-800">
                {Math.min(page * limit, total)}
              </span>
              {" "}of{" "}
              <span className="font-semibold text-gray-800">
                {total}
              </span>
              {" "}contacts
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((previous) => previous - 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((previous) => previous + 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedContact ? "Edit Contact" : "Add New Contact"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedContact
                    ? "Update contact information."
                    : "Enter the details to create a new contact."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 p-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="First Name"
                  value={form.firstName}
                  onChange={(value) => updateField("firstName", value)}
                  placeholder="Enter first name"
                />

                <FormField
                  label="Last Name"
                  value={form.lastName}
                  onChange={(value) => updateField("lastName", value)}
                  placeholder="Enter last name"
                />

                <FormField
                  label="Email Address"
                  value={form.email}
                  onChange={(value) => updateField("email", value)}
                  placeholder="example@email.com"
                  type="email"
                />

                <FormField
                  label="Phone Number"
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="Enter phone number"
                />

                <FormField
                  label="Company"
                  value={form.company}
                  onChange={(value) => updateField("company", value)}
                  placeholder="Company name"
                />

                <FormField
                  label="Job Title"
                  value={form.jobTitle}
                  onChange={(value) => updateField("jobTitle", value)}
                  placeholder="Job title"
                />

                <FormField
                  label="Source"
                  value={form.source}
                  onChange={(value) => updateField("source", value)}
                  placeholder="Website, referral, etc."
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Contact Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField("status", event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-teal-50"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : selectedContact
                    ? "Update Contact"
                    : "Create Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Delete Contact?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {selectedContact ? fullName(selectedContact) : "this contact"}
              </span>
              ? This action cannot be undone.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  if (saving) return;
                  setDeleteModalOpen(false);
                  setSelectedContact(null);
                  setError("");
                }}
                disabled={saving}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable form input
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-50"
      />
    </div>
  );
}
