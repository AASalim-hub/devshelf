import { useEffect, useMemo, useState } from "react";
import api, { getApiError } from "../services/api";
import { formatDateTime } from "../utils/formatDate";
import "./ResourcesPage.css";

const emptyForm = {
    title: "",
    url: "",
    type: "article",
    notes: "",
};

function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function loadResources() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/resources");
            setResources(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadResources();
    }, []);

    const filteredResources = useMemo(() => {
        const query = search.trim().toLowerCase();

        return resources.filter((resource) => {
            const matchesType =
                typeFilter === "all" || resource.type === typeFilter;

            const searchableText = [
                resource.title,
                resource.url,
                resource.type,
                resource.notes,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return matchesType && searchableText.includes(query);
        });
    }, [resources, search, typeFilter]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function startEditing(resource) {
        setEditingId(resource.id);
        setForm({
            title: resource.title || "",
            url: resource.url || "",
            type: resource.type || "article",
            notes: resource.notes || "",
        });
        setError("");
        setMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelEditing() {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!form.title.trim()) {
            setError("Please enter a title for this resource.");
            return;
        }

        if (!form.url.trim()) {
            setError("Please enter the resource URL.");
            return;
        }

        try {
            new URL(form.url);
        } catch {
            setError("Enter a valid URL, including https:// or http://.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            url: form.url.trim(),
            type: form.type,
            notes: form.notes.trim(),
        };

        setSaving(true);

        try {
            if (editingId !== null) {
                await api.put(`/api/resources/${editingId}`, payload);
                setMessage("Resource updated successfully.");
            } else {
                await api.post("/api/resources", payload);
                setMessage("Resource saved successfully.");
            }

            setForm(emptyForm);
            setEditingId(null);
            await loadResources();
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(resource) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${resource.title}"? This cannot be undone.`
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            await api.delete(`/api/resources/${resource.id}`);
            setResources((current) =>
                current.filter((item) => item.id !== resource.id)
            );
            if (editingId === resource.id) cancelEditing();
            setMessage("Resource deleted successfully.");
        } catch (err) {
            setError(getApiError(err));
        }
    }

    return (
        <main className="resource-page">
            <header className="page-heading">
                <div>
                    <p className="eyebrow">YOUR KNOWLEDGE LIBRARY</p>
                    <h1>Resources</h1>
                    <p className="page-description">
                        Save useful articles, videos, tools, and documentation in one place.
                    </p>
                </div>

                <div className="page-count">
                    <strong>{resources.length}</strong>
                    <span>saved resources</span>
                </div>
            </header>

            <section className="resource-form-card">
                <div className="section-heading">
                    <div>
                        <h2>{editingId !== null ? "Edit resource" : "Add a resource"}</h2>
                        <p>
                            {editingId !== null
                                ? "Update the details and save your changes."
                                : "Keep the links and notes you want to find again."}
                        </p>
                    </div>

                    {editingId !== null && (
                        <button
                            type="button"
                            className="text-button"
                            onClick={cancelEditing}
                        >
                            Cancel editing
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="resource-form">
                    <label>
                        Resource title *
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. React documentation"
                            maxLength={150}
                            required
                        />
                    </label>

                    <label>
                        Resource URL *
                        <input
                            name="url"
                            type="url"
                            value={form.url}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            required
                        />
                    </label>

                    <label>
                        Resource type
                        <select name="type" value={form.type} onChange={handleChange}>
                            <option value="article">Article</option>
                            <option value="video">Video</option>
                            <option value="tool">Tool</option>
                            <option value="docs">Documentation</option>
                            <option value="other">Other</option>
                        </select>
                    </label>

                    <label className="full-width">
                        Notes
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Why is this useful? What do you want to remember?"
                            rows={4}
                            maxLength={3000}
                        />
                    </label>

                    {error && <p className="feedback error-message">{error}</p>}
                    {message && <p className="feedback success-message">{message}</p>}

                    <div className="form-actions full-width">
                        <button type="submit" className="primary-button" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId !== null
                                  ? "Save changes"
                                  : "Save resource"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="resource-history">
                <div className="section-heading">
                    <div>
                        <h2>Resource history</h2>
                        <p>Search and manage the resources you have saved.</p>
                    </div>
                    <span className="result-count">
                        {filteredResources.length} result
                        {filteredResources.length === 1 ? "" : "s"}
                    </span>
                </div>

                <div className="resource-filters">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search titles, URLs, types, or notes..."
                        aria-label="Search resources"
                    />

                    <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                        aria-label="Filter resources by type"
                    >
                        <option value="all">All types</option>
                        <option value="article">Articles</option>
                        <option value="video">Videos</option>
                        <option value="tool">Tools</option>
                        <option value="docs">Documentation</option>
                        <option value="other">Other</option>
                    </select>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={loadResources}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="empty-state">Loading your resources...</div>
                ) : error && resources.length === 0 ? (
                    <div className="empty-state">
                        <h3>We couldn’t load your resources</h3>
                        <p>{error}</p>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={loadResources}
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="empty-state">
                        <h3>{search || typeFilter !== "all" ? "No matching resources" : "No resources yet"}</h3>
                        <p>
                            {search || typeFilter !== "all"
                                ? "Try a different search phrase or filter."
                                : "Save your first resource using the form above."}
                        </p>
                    </div>
                ) : (
                    <div className="resource-grid">
                        {filteredResources.map((resource) => (
                            <article className="resource-card" key={resource.id}>
                                <div className="resource-card-top">
                                    <span className="type-pill">
                                        {resource.type || "other"}
                                    </span>
                                    <span className="status-pill">
                                        {resource.updatedAt &&
                                        resource.createdAt &&
                                        new Date(resource.updatedAt).getTime() >
                                            new Date(resource.createdAt).getTime()
                                            ? "Updated"
                                            : "Saved"}
                                    </span>
                                </div>

                                <h3>{resource.title}</h3>

                                {resource.notes && (
                                    <p className="resource-notes">{resource.notes}</p>
                                )}

                                <a
                                    className="resource-link"
                                    href={resource.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Open resource <span aria-hidden="true">↗</span>
                                </a>

                                <div className="resource-date">
                                    <span>Created</span>
                                    <time dateTime={resource.createdAt || undefined}>
                                        {formatDateTime(resource.createdAt)}
                                    </time>
                                </div>

                                {resource.updatedAt &&
                                    resource.createdAt &&
                                    new Date(resource.updatedAt).getTime() >
                                        new Date(resource.createdAt).getTime() && (
                                        <div className="resource-date">
                                            <span>Last updated</span>
                                            <time dateTime={resource.updatedAt}>
                                                {formatDateTime(resource.updatedAt)}
                                            </time>
                                        </div>
                                    )}

                                <div className="card-actions">
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => startEditing(resource)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="danger-button"
                                        onClick={() => handleDelete(resource)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default ResourcesPage;