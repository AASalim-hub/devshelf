
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiError } from "../services/api";
import "./GlobalSearch.css";

function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const searchTerm = query.trim();

        if (searchTerm.length < 2) {
            setResults([]);
            setError("");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function searchEverything() {
            setLoading(true);
            setError("");

            try {
                const [resourcesResponse, snippetsResponse, tasksResponse] =
                    await Promise.all([
                        api.get("/api/resources"),
                        api.get("/api/snippets"),
                        api.get("/api/tasks"),
                    ]);

                if (cancelled) return;

                const resources = Array.isArray(resourcesResponse.data)
                    ? resourcesResponse.data
                    : [];

                const snippets = Array.isArray(snippetsResponse.data)
                    ? snippetsResponse.data
                    : [];

                const tasks = Array.isArray(tasksResponse.data)
                    ? tasksResponse.data
                    : [];

                const term = searchTerm.toLowerCase();

                const matches = [
                    ...resources
                        .filter((item) =>
                            [
                                item.title,
                                item.url,
                                item.type,
                                item.notes,
                            ].some((value) =>
                                String(value || "").toLowerCase().includes(term)
                            )
                        )
                        .map((item) => ({
                            id: `resource-${item.id}`,
                            title: item.title || "Untitled resource",
                            detail: item.url || item.type || "Resource",
                            type: "Resource",
                            href: "/resources",
                            date: item.createdAt,
                        })),

                    ...snippets
                        .filter((item) =>
                            [
                                item.title,
                                item.description,
                                item.code,
                                item.language,
                                Array.isArray(item.tags)
                                    ? item.tags.join(" ")
                                    : item.tags,
                            ].some((value) =>
                                String(value || "").toLowerCase().includes(term)
                            )
                        )
                        .map((item) => ({
                            id: `snippet-${item.id}`,
                            title: item.title || "Untitled snippet",
                            detail: item.language || "Snippet",
                            type: "Snippet",
                            href: "/snippet",
                            date: item.createdAt,
                        })),

                    ...tasks
                        .filter((item) =>
                            [
                                item.title,
                                item.description,
                                item.status,
                                item.priority,
                                item.project,
                            ].some((value) =>
                                String(value || "").toLowerCase().includes(term)
                            )
                        )
                        .map((item) => ({
                            id: `task-${item.id}`,
                            title: item.title || "Untitled task",
                            detail: [
                                item.project,
                                item.status === "in-progress"
                                    ? "Ongoing"
                                    : item.status === "done"
                                      ? "Finished"
                                      : item.status === "todo"
                                        ? "To do"
                                        : item.status,
                            ]
                                .filter(Boolean)
                                .join(" · "),
                            type: "Task",
                            href: "/task",
                            date: item.createdAt,
                        })),
                ];

                matches.sort((a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    return dateB - dateA;
                });

                setResults(matches.slice(0, 12));
            } catch (err) {
                if (!cancelled) {
                    setError(getApiError(err));
                    setResults([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        searchEverything();

        return () => {
            cancelled = true;
        };
    }, [query]);

    function handleResultClick() {
        setIsOpen(false);
        setQuery("");
        setResults([]);
    }

    return (
        <div className="global-search">
            <label className="global-search-label" htmlFor="global-search-input">
                Search your DevShelf
            </label>

            <div className="global-search-control">
                <span className="global-search-icon" aria-hidden="true">
                    ⌕
                </span>

                <input
                    id="global-search-input"
                    type="search"
                    value={query}
                    placeholder="Search resources, snippets, tasks..."
                    autoComplete="off"
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            setIsOpen(false);
                        }
                    }}
                    aria-expanded={isOpen && query.trim().length >= 2}
                    aria-controls="global-search-results"
                />

                {query && (
                    <button
                        type="button"
                        className="global-search-clear"
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                            setError("");
                            setIsOpen(false);
                        }}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>

            {isOpen && query.trim().length >= 2 && (
                <div
                    className="global-search-results"
                    id="global-search-results"
                    role="region"
                    aria-label="Search results"
                >
                    {loading && (
                        <p className="global-search-message">
                            Searching your saved items...
                        </p>
                    )}

                    {!loading && error && (
                        <p className="global-search-message global-search-error">
                            {error}
                        </p>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <p className="global-search-message">
                            No matches found for “{query.trim()}”.
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        results.map((item) => (
                            <Link
                                key={item.id}
                                to={item.href}
                                className="global-search-result"
                                onClick={handleResultClick}
                            >
                                <span className="global-search-result-type">
                                    {item.type}
                                </span>

                                <span className="global-search-result-content">
                                    <strong>{item.title}</strong>
                                    <small>{item.detail}</small>
                                </span>

                                <span
                                    className="global-search-result-arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </Link>
                        ))}
                </div>
            )}
        </div>
    );
}

export default GlobalSearch;
