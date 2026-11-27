import { useEffect, useRef, useState } from "react";
import type { DragEvent, FormEvent } from "react";
import {
  Check,
  ImagePlus,
  MapPin,
  Play,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import "./SellerProfile.css";

type RequestStatus = "New" | "Quoted" | "Won";

interface SellerProfileData {
  name: string;
  location: string;
  categories: string;
  summary: string;
}

interface SellerPhoto {
  id: string;
  caption: string;
  url: string;
}

interface SellerVideo {
  id: string;
  title: string;
  videoId: string;
}

interface BuyerRequest {
  id: string;
  buyer: string;
  details: string;
  amount: number;
  status: RequestStatus;
}

const requestStatuses: RequestStatus[] = ["New", "Quoted", "Won"];
const maxPhotoBytes = 5 * 1024 * 1024;
const initialProfile: SellerProfileData = {
  name: "",
  location: "",
  categories: "",
  summary: "",
};

function getYouTubeId(value: string) {
  const text = value.trim();
  if (/^[\w-]{11}$/.test(text)) return text;
  if (!text) return null;

  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^(www\.|m\.)/i, "").toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    let id: string | null = null;

    if (host === "youtu.be") {
      id = parts[0] ?? null;
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.searchParams.get("v");
      if (!id && parts.length > 1 && ["embed", "shorts", "live", "v"].includes(parts[0])) {
        id = parts[1];
      }
    }

    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SellerProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [photos, setPhotos] = useState<SellerPhoto[]>([]);
  const [videos, setVideos] = useState<SellerVideo[]>([]);
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [photoCaption, setPhotoCaption] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [buyer, setBuyer] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [budget, setBudget] = useState("1500");
  const [modalOpen, setModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState("");
  const [videoFeedback, setVideoFeedback] = useState("");
  const [toast, setToast] = useState("");
  const photoUrls = useRef(new Set<string>());
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      photoUrls.current.forEach((url) => URL.revokeObjectURL(url));
      photoUrls.current.clear();
    },
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!modalOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setModalOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modalOpen]);

  function updateProfile(field: keyof SellerProfileData, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handlePhotoFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    if (!selected.length) return;

    const valid = selected.filter(
      (file) => file.type.startsWith("image/") && file.size <= maxPhotoBytes,
    );
    const skipped = selected.length - valid.length;

    if (!valid.length) {
      setPhotoFeedback(
        selected.some((file) => file.size > maxPhotoBytes)
          ? "Each photo must be 5 MB or smaller."
          : "Please select valid image files.",
      );
      return;
    }

    const added = valid.map((file, index) => {
      const url = URL.createObjectURL(file);
      photoUrls.current.add(url);
      const filename = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
      const caption = photoCaption.trim();
      return {
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        caption: caption ? (valid.length > 1 ? `${caption} (${index + 1})` : caption) : filename || "Seller Photo",
        url,
      };
    });

    setPhotos((current) => [...current, ...added]);
    setPhotoCaption("");
    setPhotoFeedback(
      skipped
        ? `Added ${valid.length} photo(s); skipped ${skipped} invalid or over-size file(s).`
        : `Added ${valid.length} photo(s) to your profile.`,
    );
    setToast(valid.length === 1 ? "Photo uploaded" : `${valid.length} photos uploaded`);
    if (photoInput.current) photoInput.current.value = "";
  }

  function handlePhotoDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    handlePhotoFiles(event.dataTransfer.files);
  }

  function removePhoto(photo: SellerPhoto) {
    URL.revokeObjectURL(photo.url);
    photoUrls.current.delete(photo.url);
    setPhotos((current) => current.filter((item) => item.id !== photo.id));
    setToast("Photo removed");
  }

  function addVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = getYouTubeId(videoUrl);
    if (!id) {
      setVideoFeedback("Enter a valid YouTube URL or 11-character video ID.");
      return;
    }

    setVideos((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: videoTitle.trim() || "Seller Showcase Video",
        videoId: id,
      },
    ]);
    setVideoTitle("");
    setVideoUrl("");
    setVideoFeedback("");
    setToast("YouTube video added");
  }

  function submitBuyerRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(budget);
    if (!buyer.trim() || !requestDetails.trim() || !Number.isFinite(amount) || amount < 1) {
      return;
    }

    setRequests((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        buyer: buyer.trim(),
        details: requestDetails.trim(),
        amount,
        status: "New",
      },
      ...current,
    ]);
    setBuyer("");
    setRequestDetails("");
    setBudget("1500");
    setModalOpen(false);
    setToast("Quote / order request submitted");
  }

  const categories = profile.categories
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);

  return (
    <main className="seller-page seller-dashboard">
      <div className="seller-heading">
        <div>
          <span className="eyebrow">SELLER CENTER / PROFILE</span>
          <h1>Seller Profile Dashboard</h1>
          <p>Manage your public profile and buyer quote requests.</p>
        </div>
        <button
          className="save-profile"
          type="button"
          onClick={() =>
            setToast("Preview updated. Connect a backend to save permanently.")
          }
        >
          <Check size={16} />
          Save Seller Profile
        </button>
      </div>

      <div className="seller-dashboard-grid">
        <div className="seller-dashboard-main">
          <section className="dashboard-card">
            <div className="dashboard-card-heading">
              <div>
                <span className="eyebrow">STEP 1</span>
                <h2>Seller Profile Editor</h2>
                <p>Set up your profile, upload photos and add YouTube videos.</p>
              </div>
              <span className="dashboard-plan-pill">Seller Profile Subscription</span>
            </div>

            <div className="form-grid dashboard-profile-fields">
              <label className="profile-field">
                <span>Seller Profile Name</span>
                <input
                  value={profile.name}
                  onChange={(event) => updateProfile("name", event.target.value)}
                  placeholder="Enter seller profile name"
                />
              </label>
              <label className="profile-field">
                <span>Location / Coverage Area</span>
                <input
                  value={profile.location}
                  onChange={(event) => updateProfile("location", event.target.value)}
                  placeholder="e.g., Yangon · Metro & Industrial Zones"
                />
              </label>
              <label className="profile-field dashboard-field-wide">
                <span>Category / Offerings</span>
                <input
                  value={profile.categories}
                  onChange={(event) => updateProfile("categories", event.target.value)}
                  placeholder="Separate offerings with commas"
                />
                <small>Separate categories or offerings with commas.</small>
              </label>
              <label className="profile-field dashboard-field-wide">
                <span>Short Summary</span>
                <textarea
                  rows={3}
                  value={profile.summary}
                  onChange={(event) => updateProfile("summary", event.target.value)}
                  placeholder="Describe what you deliver and why buyers should contact you..."
                />
              </label>
            </div>

            <div className="dashboard-subsection">
              <div className="dashboard-subsection-heading">
                <div>
                  <strong>Direct Photo Upload</strong>
                  <p>Choose photos from your device or drag and drop them here.</p>
                </div>
                <ImagePlus size={19} />
              </div>
              <div className="photo-upload-row">
                <input
                  value={photoCaption}
                  onChange={(event) => setPhotoCaption(event.target.value)}
                  placeholder="Optional photo caption"
                  aria-label="Optional photo caption"
                />
                <label
                  className={`photo-dropzone ${isDragging ? "is-dragging" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handlePhotoDrop}
                >
                  <Upload size={19} />
                  <span>Choose Photos or Drag &amp; Drop</span>
                  <small>JPG, PNG, WebP · Up to 5 MB each</small>
                  <input
                    ref={photoInput}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      if (event.target.files) handlePhotoFiles(event.target.files);
                    }}
                  />
                </label>
              </div>
              {photoFeedback && (
                <p className="dashboard-feedback" role="status">{photoFeedback}</p>
              )}
              <div className="dashboard-media-list">
                {photos.length ? (
                  photos.map((photo) => (
                    <div className="dashboard-media-item" key={photo.id}>
                      <img src={photo.url} alt={photo.caption} />
                      <div>
                        <strong>{photo.caption}</strong>
                        <small>Uploaded file · Ready for preview</small>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${photo.caption}`}
                        onClick={() => removePhoto(photo)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="dashboard-empty">No photos uploaded yet.</p>
                )}
              </div>
            </div>

            <div className="dashboard-subsection">
              <div className="dashboard-subsection-heading">
                <div>
                  <strong>YouTube Video Links</strong>
                  <p>Paste a watch link, short link, Shorts URL or video ID.</p>
                </div>
                <Play size={18} />
              </div>
              <form className="video-add-form" onSubmit={addVideo}>
                <input
                  value={videoTitle}
                  onChange={(event) => setVideoTitle(event.target.value)}
                  placeholder="Video title (optional)"
                  aria-label="Video title"
                />
                <input
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="YouTube URL or 11-character ID"
                  aria-label="YouTube URL or video ID"
                  required
                />
                <button className="save-profile" type="submit">
                  <Plus size={16} />
                  Add Video
                </button>
              </form>
              {videoFeedback && (
                <p className="dashboard-feedback dashboard-feedback-error" role="alert">
                  {videoFeedback}
                </p>
              )}
              <div className="dashboard-media-list">
                {videos.length ? (
                  videos.map((video) => (
                    <div className="dashboard-media-item" key={video.id}>
                      <div className="video-list-icon"><Play size={15} /></div>
                      <div>
                        <strong>{video.title}</strong>
                        <small>youtube.com/watch?v={video.videoId}</small>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${video.title}`}
                        onClick={() => {
                          setVideos((current) =>
                            current.filter((item) => item.id !== video.id),
                          );
                          setToast("Video removed");
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="dashboard-empty">No YouTube links added yet.</p>
                )}
              </div>
            </div>
          </section>

          <section className="dashboard-card">
            <div className="dashboard-card-heading">
              <div>
                <span className="eyebrow">STEP 2</span>
                <h2>Seller Profile Subscription</h2>
                <p>One simple seller profile subscription, with no transaction commission.</p>
              </div>
            </div>
            <div className="subscription-summary">
              <ShieldCheck size={22} />
              <div>
                <strong>Seller Profile</strong>
                <p>Monthly pricing is confirmed directly with NEXORA.</p>
              </div>
            </div>
          </section>

          <section className="dashboard-card">
            <div className="dashboard-card-heading">
              <div>
                <span className="eyebrow">STEP 3</span>
                <h2>Quotes &amp; Orders List</h2>
                <p>Review and update quote or order requests from buyers.</p>
              </div>
            </div>
            <div className="request-list">
              {requests.length ? (
                requests.map((request) => (
                  <article className="request-item" key={request.id}>
                    <div className="request-details">
                      <div>
                        <strong>{request.buyer}</strong>
                        <b>{formatMoney(request.amount)}</b>
                      </div>
                      <p>{request.details}</p>
                    </div>
                    <div className="request-statuses" aria-label="Request status">
                      {requestStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={`request-status ${status.toLowerCase()} ${
                            request.status === status ? "active" : ""
                          }`}
                          aria-pressed={request.status === status}
                          onClick={() =>
                            setRequests((current) =>
                              current.map((item) =>
                                item.id === request.id ? { ...item, status } : item,
                              ),
                            )
                          }
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <p className="dashboard-empty">
                  No buyer inquiries yet. New requests submitted through your public profile will appear here.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="seller-preview" id="live-seller-profile-preview">
          <section className="preview-card">
            <div className="preview-card-heading">
              <div>
                <span className="eyebrow">LIVE SELLER PROFILE PREVIEW</span>
                <h2>Public Seller Profile</h2>
              </div>
              <span>Seller Profile</span>
            </div>
            <div className="preview-card-content">
              <div className="preview-details">
                <h3>{profile.name.trim() || "Seller Profile Name"}</h3>
                <p className="preview-location">
                  <MapPin size={14} />
                  {profile.location.trim() || "Location / Coverage Area"}
                </p>
                <div className="preview-categories">
                  {categories.length ? (
                    categories.map((category, index) => (
                      <span key={`${category}-${index}`}>{category}</span>
                    ))
                  ) : (
                    <small>No categories listed</small>
                  )}
                </div>
                <p className="preview-summary">
                  {profile.summary.trim() || "Add a short summary to introduce your business to buyers."}
                </p>
              </div>
              <button
                className="preview-quote-button"
                type="button"
                onClick={() => setModalOpen(true)}
              >
                Request Quote / Order
              </button>

              <div className="preview-gallery">
                <div className="preview-section-title">
                  <strong>Photo Gallery</strong>
                  <span>{photos.length} {photos.length === 1 ? "photo" : "photos"}</span>
                </div>
                {photos.length ? (
                  <div className="preview-photo-grid">
                    {photos.map((photo) => (
                      <figure key={photo.id}>
                        <img src={photo.url} alt={photo.caption} />
                        <figcaption>{photo.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-empty">No photos in the profile gallery yet.</p>
                )}
              </div>

              <div className="preview-gallery">
                <div className="preview-section-title">
                  <strong>YouTube Video Previews</strong>
                  <span>{videos.length} {videos.length === 1 ? "video" : "videos"}</span>
                </div>
                {videos.length ? (
                  <div className="preview-video-list">
                    {videos.map((video) => (
                      <article key={video.id}>
                        <div className="preview-video-frame">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.videoId)}`}
                            title={video.title}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <a
                          href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.videoId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {video.title}
                        </a>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-empty">No YouTube video previews yet.</p>
                )}
              </div>
            </div>
          </section>
        </aside>
      </div>

      <p className="dashboard-notice">
        Profile edits, photos, videos and inquiries are held in this browser session only. Permanent storage requires a connected backend.
      </p>

      {modalOpen && (
        <div
          className="quote-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <section
            className="quote-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-modal-title"
          >
            <div className="quote-modal-heading">
              <div>
                <span className="eyebrow">BUYER INQUIRY</span>
                <h2 id="quote-modal-title">Request Quote / Order</h2>
                <p>Sending to: {profile.name.trim() || "Seller Profile"}</p>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setModalOpen(false)}
              >
                <X size={19} />
              </button>
            </div>
            <form onSubmit={submitBuyerRequest}>
              <label className="profile-field">
                <span>Buyer Name or Company</span>
                <input
                  autoFocus
                  value={buyer}
                  onChange={(event) => setBuyer(event.target.value)}
                  placeholder="e.g., Yangon Logistics Hub"
                  required
                />
              </label>
              <label className="profile-field">
                <span>Quote or Order Details</span>
                <input
                  value={requestDetails}
                  onChange={(event) => setRequestDetails(event.target.value)}
                  placeholder="Describe your request"
                  required
                />
              </label>
              <label className="profile-field">
                <span>Estimated Value (USD)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  required
                />
              </label>
              <div className="quote-modal-actions">
                <button
                  type="button"
                  className="cancel-quote"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button className="save-profile" type="submit">Submit Request</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="dashboard-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </main>
  );
}
