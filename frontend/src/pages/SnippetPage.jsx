import { useEffect, useMemo, useState } from "react";
import api, { getApiError } from "../services/api";
import { formatDateTime } from "../utils/formatDate";
import "./SnippetPage.css";

const emptyForm = {
    title: "",
    description: "",
    code: "",
    language: "javascript",
    tags: "",
};

function SnippetPage() {
    const [snippets, setSnippets] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [languageFilter, setLanguageFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function loadSnippets() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/snippets");
            setSnippets(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSnippets();
    }, []);

    const filteredSnippets = useMemo(() => {
        const query = search.trim().toLowerCase();

        return snippets.filter((snippet) => {
            const matchesLanguage =
                languageFilter === "all" ||
                (snippet.language || "").toLowerCase() === languageFilter;

            const tagText = Array.isArray(snippet.tags)
                ? snippet.tags.join(" ")
                : snippet.tags || "";

            const searchableText = [
                snippet.title,
                snippet.description,
                snippet.language,
                tagText,
                snippet.code,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return matchesLanguage && searchableText.includes(query);
        });
    }, [snippets, search, languageFilter]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function startEditing(snippet) {
        setEditingId(snippet.id);
        setForm({
            title: snippet.title || "",
            description: snippet.description || "",
            code: snippet.code || "",
            language: snippet.language || "javascript",
            tags: Array.isArray(snippet.tags)
                ? snippet.tags.join(", ")
                : snippet.tags || "",
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
            setError("Please enter a title for this snippet.");
            return;
        }

        if (!form.code.trim()) {
            setError("Please enter the code you want to save.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            code: form.code,
            language: form.language,
            tags: form.tags.trim(),
        };

        setSaving(true);

        try {
            if (editingId !== null) {
                await api.put(`/api/snippets/${editingId}`, payload);
                setMessage("Snippet updated successfully.");
            } else {
                await api.post("/api/snippets", payload);
                setMessage("Snippet saved successfully.");
            }

            setForm(emptyForm);
            setEditingId(null);
            await loadSnippets();
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(snippet) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${snippet.title}"? This cannot be undone.`
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            await api.delete(`/api/snippets/${snippet.id}`);
            setSnippets((current) =>
                current.filter((item) => item.id !== snippet.id)
            );
            if (editingId === snippet.id) cancelEditing();
            setMessage("Snippet deleted successfully.");
        } catch (err) {
            setError(getApiError(err));
        }
    }

    async function copyCode(code) {
        try {
            await navigator.clipboard.writeText(code);
            setMessage("Code copied to clipboard.");
            setError("");
        } catch {
            setError("Could not copy automatically. Select the code and copy it manually.");
            setMessage("");
        }
    }

    function getTags(tags) {
        if (Array.isArray(tags)) return tags;
        if (typeof tags === "string" && tags.trim()) {
            return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
        }
        return [];
    }

    return (
        <main className="snippet-page">
            <header className="snippet-heading">
                <div>
                    <p className="eyebrow">YOUR CODE LIBRARY</p>
                    <h1>Snippets</h1>
                    <p className="page-description">
                        Keep useful code examples organised so you can find and reuse them.
                    </p>
                </div>

                <div className="snippet-count">
                    <strong>{snippets.length}</strong>
                    <span>saved snippets</span>
                </div>
            </header>

            <section className="snippet-form-card">
                <div className="section-heading">
                    <div>
                        <h2>{editingId !== null ? "Edit snippet" : "Save a snippet"}</h2>
                        <p>
                            {editingId !== null
                                ? "Make your changes and save them."
                                : "Save a useful piece of code with a description and tags."}
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

                <form className="snippet-form" onSubmit={handleSubmit}>
                    <label>
                        Snippet title *
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Fetch data with async/await"
                            maxLength={150}
                            required
                        />
                    </label>

                    <label>
                        Programming language
                        <select
                            name="language"
                            value={form.language}
                            onChange={handleChange}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="jsx">JSX / React</option>
                            <option value="typescript">TypeScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="python">Python</option>
                            <option value="csharp">C#</option>
                            <option value="sql">SQL</option>
                            <option value="json">JSON</option>
                            <option value="bash">Bash / Terminal</option>
                            <option value="other">Other</option>
                        </select>
                    </label>

                    <label className="snippet-full-width">
                        Description
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="What does this code do?"
                            rows={3}
                            maxLength={2000}
                        />
                    </label>

                    <label className="snippet-full-width">
                        Code *
                        <textarea
                            className="code-input"
                            name="code"
                            value={form.code}
                            onChange={handleChange}
                            placeholder={"// Paste your code here"}
                            rows={9}
                            required
                            spellCheck={false}
                        />
                    </label>

                    <label className="snippet-full-width">
                        Tags
                        <input
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="react, api, fetch (separate tags with commas)"
                            maxLength={500}
                        />
                    </label>

                    {error && <p className="feedback error-message">{error}</p>}
                    {message && <p className="feedback success-message">{message}</p>}

                    <div className="snippet-full-width form-actions">
                        <button type="submit" className="primary-button" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId !== null
                                  ? "Save changes"
                                  : "Save snippet"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="snippet-history">
                <div className="section-heading">
                    <div>
                        <h2>Snippet history</h2>
                        <p>Search, copy, update, or remove saved code.</p>
                    </div>
                    <span className="result-count">
                        {filteredSnippets.length} result
                        {filteredSnippets.length === 1 ? "" : "s"}
                    </span>
                </div>

                <div className="snippet-filters">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search title, code, description, or tags..."
                        aria-label="Search snippets"
                    />

                    <select
                        value={languageFilter}
                        onChange={(event) => setLanguageFilter(event.target.value)}
                        aria-label="Filter snippets by language"
                    >
                        <option value="all">All languages</option>
                        <option value="javascript">JavaScript</option>
                        <option value="jsx">JSX / React</option>
                        <option value="typescript">TypeScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="python">Python</option>
                        <option value="csharp">C#</option>
                        <option value="sql">SQL</option>
                        <option value="json">JSON</option>
                        <option value="bash">Bash / Terminal</option>
                        <option value="other">Other</option>
                    </select>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={loadSnippets}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="empty-state">Loading your snippets...</div>
                ) : error && snippets.length === 0 ? (
                    <div className="empty-state">
                        <h3>We couldn’t load your snippets</h3>
                        <p>{error}</p>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={loadSnippets}
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredSnippets.length === 0 ? (
                    <div className="empty-state">
                        <h3>{search || languageFilter !== "all" ? "No matching snippets" : "No snippets yet"}</h3>
                        <p>
                            {search || languageFilter !== "all"
                                ? "Try another search phrase or language."
                                : "Save your first code snippet using the form above."}
                        </p>
                    </div>
                ) : (
                    <div className="snippet-grid">
                        {filteredSnippets.map((snippet) => (
                            <article className="snippet-card" key={snippet.id}>
                                <div className="snippet-card-top">
                                    <span className="language-pill">
                                        {snippet.language || "other"}
                                    </span>
                                    <span className="status-pill">
                                        {snippet.updatedAt &&
                                        snippet.createdAt &&
                                        new Date(snippet.updatedAt).getTime() >
                                            new Date(snippet.createdAt).getTime()
                                            ? "Updated"
                                            : "Saved"}
                                    </span>
                                </div>

                                <h3>{snippet.title}</h3>

                                {snippet.description && (
                                    <p className="snippet-description">
                                        {snippet.description}
                                    </p>
                                )}

                                {getTags(snippet.tags).length > 0 && (
                                    <div className="snippet-tags">
                                        {getTags(snippet.tags).map((tag, index) => (
                                            <span key={`${tag}-${index}`}>#{tag}</span>
                                        ))}
                                    </div>
                                )}

                                <pre className="snippet-code">
                                    <code>{snippet.code}</code>
                                </pre>

                                <div className="snippet-date">
                                    <span>Created</span>
                                    <time dateTime={snippet.createdAt || undefined}>
                                        {formatDateTime(snippet.createdAt)}
                                    </time>
                                </div>

                                {snippet.updatedAt &&
                                    snippet.createdAt &&
                                    new Date(snippet.updatedAt).getTime() >
                                        new Date(snippet.createdAt).getTime() && (
                                        <div className="snippet-date">
                                            <span>Last updated</span>
                                            <time dateTime={snippet.updatedAt}>
                                                {formatDateTime(snippet.updatedAt)}
                                            </time>
                                        </div>
                                    )}

                                <div className="snippet-actions">
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => copyCode(snippet.code || "")}
                                    >
                                        Copy code
                                    </button>
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => startEditing(snippet)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="danger-button"
                                        onClick={() => handleDelete(snippet)}
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

export default SnippetPage;