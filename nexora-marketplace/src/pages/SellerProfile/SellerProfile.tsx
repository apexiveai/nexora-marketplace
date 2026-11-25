import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Store,
  Building2,
  MapPin,
  ShieldCheck,
  Globe,
  Camera,
  Upload,
  Save,
  ChevronRight,
  FileText,
  UserRound,
} from "lucide-react";
import "./SellerProfile.css";

type Tab =
  | "general"
  | "store"
  | "business"
  | "address"
  | "verification"
  | "localization";

interface ProfileForm {
  storeName: string;
  storeSlug: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  legalName: string;
  businessType: string;
  registrationNumber: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  currency: string;
  language: string;
}

const initialForm: ProfileForm = {
  storeName: "",
  storeSlug: "",
  description: "",
  email: "",
  phone: "",
  website: "",
  legalName: "",
  businessType: "",
  registrationNumber: "",
  country: "",
  city: "",
  address: "",
  postalCode: "",
  currency: "USD",
  language: "English",
};

const tabs = [
  { id: "general", label: "General Profile", icon: UserRound },
  { id: "store", label: "Store Identity", icon: Store },
  { id: "business", label: "Business Information", icon: Building2 },
  { id: "address", label: "Business Address", icon: MapPin },
  { id: "verification", label: "Verification Center", icon: ShieldCheck },
  { id: "localization", label: "Localization", icon: Globe },
] as const;

export default function SellerProfile() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [, setLogoFile] = useState<File | null>(null);
  const [, setBannerFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [logoPreview, bannerPreview]);

  function updateField(
    field: keyof ProfileForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setMessage("");
  }

  function handleImage(
    file: File | undefined,
    type: "logo" | "banner"
  ) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must not exceed 5 MB.");
      return;
    }

    const url = URL.createObjectURL(file);

    if (type === "logo") {
      setLogoPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return url;
      });
      setLogoFile(file);
    } else {
      setBannerPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return url;
      });
      setBannerFile(file);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.storeName.trim()) {
      setActiveTab("store");
      setMessage("Please enter your store name.");
      return;
    }

    if (!form.email.trim()) {
      setActiveTab("general");
      setMessage("Please enter your business email.");
      return;
    }

    setMessage(
      "Profile validated successfully. Backend integration is required to save permanently."
    );
  }

  function handleDocuments(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files);

    const valid = selected.filter(
      (file) =>
        file.size <= 10 * 1024 * 1024 &&
        /\.(pdf|jpg|jpeg|png)$/i.test(file.name)
    );

    setDocuments((previous) => [...previous, ...valid]);
    setMessage("");
  }

  return (
    <main className="seller-page">
      <div className="seller-heading">
        <div>
          <span className="eyebrow">SELLER CENTER / ACCOUNT</span>
          <h1>Seller Profile</h1>
          <p>
            Manage your business identity and marketplace presence.
          </p>
        </div>

        <span className="verification-badge">
          <ShieldCheck size={16} />
          Verification Pending
        </span>
      </div>

      <section className="seller-overview">
        <div className="store-avatar">
          {logoPreview ? (
            <img src={logoPreview} alt="Store logo preview" />
          ) : (
            <Store size={32} />
          )}
        </div>

        <div className="store-summary">
          <span className="eyebrow">YOUR STORE</span>
          <h2>{form.storeName || "Your Store Name"}</h2>
          <p>{form.email || "seller@example.com"}</p>
          <span className="seller-id">
            SELLER ID: NOT ASSIGNED
          </span>
        </div>

        <span className="seller-status">NEW SELLER</span>
      </section>

      <div className="seller-management">
        <aside className="seller-navigation">
          <div className="seller-nav-heading">
            <span>ACCOUNT SETTINGS</span>
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                className={`seller-nav-item ${
                  activeTab === tab.id ? "selected" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage("");
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                <ChevronRight size={15} />
              </button>
            );
          })}
        </aside>

        <form className="seller-form" onSubmit={handleSubmit}>
          {activeTab === "general" && (
            <>
              <SectionHeading
                title="General Profile"
                description="Your primary seller account information."
              />

              <div className="form-grid">
                <Field label="Business Email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    placeholder="business@example.com"
                    required
                  />
                </Field>

                <Field label="Contact Phone">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    placeholder="+1 000 000 0000"
                  />
                </Field>

                <Field label="Business Website">
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) =>
                      updateField("website", e.target.value)
                    }
                    placeholder="https://example.com"
                  />
                </Field>
              </div>
            </>
          )}

          {activeTab === "store" && (
            <>
              <SectionHeading
                title="Store Identity"
                description="Customize how customers recognize your store."
              />

              <Field label="Store Logo">
                <label className="upload-box logo-upload">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" />
                  ) : (
                    <Camera size={28} />
                  )}
                  <span>
                    <strong>Upload Store Logo</strong>
                    <small>PNG, JPG or WebP · Maximum 5 MB</small>
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      handleImage(e.target.files?.[0], "logo")
                    }
                    hidden
                  />
                </label>
              </Field>

              <Field label="Store Banner">
                <label className="upload-box banner-upload">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner preview" />
                  ) : (
                    <Upload size={25} />
                  )}
                  <span>
                    <strong>Upload Store Banner</strong>
                    <small>Recommended 1600 × 500 pixels</small>
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      handleImage(e.target.files?.[0], "banner")
                    }
                    hidden
                  />
                </label>
              </Field>

              <div className="form-grid">
                <Field label="Store Name" required>
                  <input
                    value={form.storeName}
                    onChange={(e) =>
                      updateField("storeName", e.target.value)
                    }
                    placeholder="Enter your store name"
                    required
                  />
                </Field>

                <Field label="Store URL Slug" required>
                  <input
                    value={form.storeSlug}
                    onChange={(e) =>
                      updateField(
                        "storeSlug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                      )
                    }
                    placeholder="your-store"
                    required
                  />
                </Field>
              </div>

              <Field label="Store Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Tell customers about your store..."
                  rows={5}
                />
              </Field>
            </>
          )}

          {activeTab === "business" && (
            <>
              <SectionHeading
                title="Business Information"
                description="Provide accurate legal business information."
              />

              <div className="form-grid">
                <Field label="Legal Business Name" required>
                  <input
                    value={form.legalName}
                    onChange={(e) =>
                      updateField("legalName", e.target.value)
                    }
                    placeholder="Registered legal company name"
                  />
                </Field>

                <Field label="Business Type">
                  <select
                    value={form.businessType}
                    onChange={(e) =>
                      updateField("businessType", e.target.value)
                    }
                  >
                    <option value="">Select business type</option>
                    <option value="individual">Individual</option>
                    <option value="sole_proprietorship">
                      Sole Proprietorship
                    </option>
                    <option value="partnership">Partnership</option>
                    <option value="company">Corporation / Company</option>
                    <option value="other">Other</option>
                  </select>
                </Field>

                <Field label="Registration Number">
                  <input
                    value={form.registrationNumber}
                    onChange={(e) =>
                      updateField(
                        "registrationNumber",
                        e.target.value
                      )
                    }
                    placeholder="Business registration number"
                  />
                </Field>
              </div>

              <div className="notice-panel">
                <ShieldCheck size={20} />
                <p>
                  Legal business information may be used for
                  verification and regulatory compliance.
                  Only submit accurate information.
                </p>
              </div>
            </>
          )}

          {activeTab === "address" && (
            <>
              <SectionHeading
                title="Business Address"
                description="Your registered business location."
              />

              <div className="form-grid">
                <Field label="Country Code" required>
                  <input
                    value={form.country}
                    onChange={(e) =>
                      updateField(
                        "country",
                        e.target.value.toUpperCase().slice(0, 2)
                      )
                    }
                    placeholder="US"
                    maxLength={2}
                  />
                </Field>

                <Field label="City">
                  <input
                    value={form.city}
                    onChange={(e) =>
                      updateField("city", e.target.value)
                    }
                    placeholder="City"
                  />
                </Field>

                <Field label="Postal Code">
                  <input
                    value={form.postalCode}
                    onChange={(e) =>
                      updateField("postalCode", e.target.value)
                    }
                    placeholder="Postal code"
                  />
                </Field>
              </div>

              <Field label="Full Business Address">
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    updateField("address", e.target.value)
                  }
                  placeholder="Street, building, district..."
                  rows={4}
                />
              </Field>
            </>
          )}

          {activeTab === "verification" && (
            <>
              <SectionHeading
                title="Verification Center"
                description="Prepare the documents required to verify your seller account."
              />

              <div className="verification-summary">
                <ShieldCheck size={32} />
                <div>
                  <strong>Verification not submitted</strong>
                  <p>
                    Your account is awaiting business verification.
                  </p>
                </div>
              </div>

              <Field label="Verification Document">
                <label className="upload-box document-upload">
                  <FileText size={28} />
                  <span>
                    <strong>Select verification documents</strong>
                    <small>PDF, JPG or PNG · Maximum 10 MB per file</small>
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleDocuments(e.target.files)
                    }
                    hidden
                  />
                </label>
              </Field>

              {documents.length > 0 && (
                <div className="document-list">
                  {documents.map((file, index) => (
                    <div className="document-item" key={`${file.name}-${index}`}>
                      <FileText size={18} />
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDocuments((previous) =>
                            previous.filter((_, i) => i !== index)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="notice-panel">
                <ShieldCheck size={20} />
                <p>
                  Document selection is currently local only.
                  Secure upload, document encryption and
                  verification review will be connected to
                  the backend later.
                </p>
              </div>
            </>
          )}

          {activeTab === "localization" && (
            <>
              <SectionHeading
                title="Store Localization"
                description="Set your preferred language and default currency."
              />

              <div className="form-grid">
                <Field label="Preferred Language">
                  <select
                    value={form.language}
                    onChange={(e) =>
                      updateField("language", e.target.value)
                    }
                  >
                    <option>English</option>
                    <option>Myanmar</option>
                    <option>Chinese</option>
                    <option>Japanese</option>
                    <option>Thai</option>
                  </select>
                </Field>

                <Field label="Default Currency">
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      updateField("currency", e.target.value)
                    }
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - Pound Sterling</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="MMK">MMK - Myanmar Kyat</option>
                  </select>
                </Field>
              </div>

              <div className="notice-panel">
                <Globe size={20} />
                <p>
                  The seller's default currency is not necessarily
                  the currency displayed to every customer.
                  Customer display currencies will be handled
                  by the pricing engine.
                </p>
              </div>
            </>
          )}

          {message && (
            <div className="form-message" role="status">
              {message}
            </div>
          )}

          <div className="form-actions">
            <span>Changes are not saved to the server yet.</span>
            <button className="save-profile" type="submit">
              <Save size={17} />
              Validate Profile
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="section-heading">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="profile-field">
      <span>
        {label}
        {required && <b className="required-mark"> *</b>}
      </span>
      {children}
    </label>
  );
}
