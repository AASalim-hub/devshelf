import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiError } from "../services/api";
import "./DashboardPage.css";

function DashboardPage() {
    const [resources, setResources] = useState([]);
    const [snippets, setSnippets] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const userName = localStorage.getItem("userName") || "there";

    useEffect(() => {
        async function loadDashboard() {
            setLoading(true);
            setError("");

            try {
                const [resourceResponse, snippetResponse, taskResponse] =
                    await Promise.all([
                        api.get("/api/resources"),
                        api.get("/api/snippets"),
                        api.get("/api/tasks"),
                    ]);

                setResources(
                    Array.isArray(resourceResponse.data)
                        ? resourceResponse.data
                        : []
                );

                setSnippets(
                    Array.isArray(snippetResponse.data)
                        ? snippetResponse.data
                        : []
                );

                setTasks(
                    Array.isArray(taskResponse.data)
                        ? taskResponse.data
                        : []
                );
            } catch (err) {
                setError(getApiError(err));
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const completedTaskCount = tasks.filter(
        (task) => task.status === "done"
    ).length;

    const ongoingTaskCount = tasks.filter(
        (task) => task.status === "in-progress"
    ).length;

    const recentItems = [
        ...resources.map((item) => ({
            id: `resource-${item.id}`,
            title: item.title,
            type: "Resource",
            date: item.createdAt,
            href: "/resources",
        })),
        ...snippets.map((item) => ({
            id: `snippet-${item.id}`,
            title: item.title,
            type: "Snippet",
            date: item.createdAt,
            href: "/snippet",
        })),
        ...tasks.map((item) => ({
            id: `task-${item.id}`,
            title: item.title,
            type: "Task",
            date: item.createdAt,
            href: "/task",
        })),
    ]
        .sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 5);

    function displayDate(value) {
        if (!value) return "Date unavailable";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    return (
        <section className="dashboard-page">
            <div className="dashboard-welcome">
    <p className="dashboard-eyebrow">YOUR PERSONAL WORKSPACE</p>

    <h1>Welcome back, {userName}!</h1>

    <p>
        Ready to make progress? Keep your learning resources,
        code snippets, and tasks organised in one place.
    </p>
</div>

            {error && (
                <div className="dashboard-error" role="alert">
                    <strong>We couldn't load your dashboard.</strong>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="dashboard-retry"
                        onClick={() => window.location.reload()}
                    >
                        Try again
                    </button>
                </div>
            )}

            <div className="dashboard-stats">
                <article className="stat-card">
                    <span className="stat-icon stat-icon-resources">R</span>
                    <p className="stat-label">Total resources</p>
                    <p className="stat-value">
                        {loading ? "—" : resources.length}
                    </p>
                    <p className="stat-description">
                        Saved learning materials
                    </p>
                    <Link className="stat-link" to="/resources">
                        View resources →
                    </Link>
                </article>

                <article className="stat-card">
                    <span className="stat-icon stat-icon-tasks">T</span>
                    <p className="stat-label">Total tasks</p>
                    <p className="stat-value">
                        {loading ? "—" : tasks.length}
                    </p>
                    <p className="stat-description">
                        {loading
                            ? "Loading task progress..."
                            : `${ongoingTaskCount} currently ongoing`}
                    </p>
                    <Link className="stat-link" to="/task">
                        View tasks →
                    </Link>
                </article>

                <article className="stat-card">
                    <span className="stat-icon stat-icon-snippets">S</span>
                    <p className="stat-label">Total snippets</p>
                    <p className="stat-value">
                        {loading ? "—" : snippets.length}
                    </p>
                    <p className="stat-description">
                        Reusable code examples
                    </p>
                    <Link className="stat-link" to="/snippet">
                        View snippets →
                    </Link>
                </article>

                <article className="stat-card">
                    <span className="stat-icon stat-icon-completed">✓</span>
                    <p className="stat-label">Finished tasks</p>
                    <p className="stat-value">
                        {loading ? "—" : completedTaskCount}
                    </p>
                    <p className="stat-description">
                        Tasks marked as finished
                    </p>
                    <Link className="stat-link" to="/task">
                        View progress →
                    </Link>
                </article>
            </div>

            <section className="quick-actions">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Quick actions</h2>
                        <p>What would you like to add today?</p>
                    </div>
                </div>

                <div className="quick-actions-list">
                    <Link className="quick-action-item" to="/resources">
                        <span className="quick-action-symbol">+</span>
                        <span>
                            <strong>Save a resource</strong>
                            <small>Keep useful links and learning materials.</small>
                        </span>
                        <span className="quick-action-arrow">→</span>
                    </Link>

                    <Link className="quick-action-item" to="/snippet">
                        <span className="quick-action-symbol">{"</>"}</span>
                        <span>
                            <strong>Create a snippet</strong>
                            <small>Save code you want to reuse.</small>
                        </span>
                        <span className="quick-action-arrow">→</span>
                    </Link>

                    <Link className="quick-action-item" to="/task">
                        <span className="quick-action-symbol">✓</span>
                        <span>
                            <strong>Add a task</strong>
                            <small>Record your next step and track progress.</small>
                        </span>
                        <span className="quick-action-arrow">→</span>
                    </Link>
                </div>
            </section>

            <section className="recent-activity">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Recent activity</h2>
                        <p>Your five most recently created records.</p>
                    </div>
                </div>

                {loading ? (
                    <p className="dashboard-empty">Loading recent activity...</p>
                ) : recentItems.length === 0 ? (
                    <div className="dashboard-empty">
                        <p>No saved items yet.</p>
                        <span>
                            Add a resource, snippet, or task to see it here.
                        </span>
                    </div>
                ) : (
                    <div className="recent-activity-list">
                        {recentItems.map((item) => (
                            <Link
                                className="recent-activity-row"
                                to={item.href}
                                key={item.id}
                            >
                                <span className="recent-type">{item.type}</span>
                                <strong>{item.title || "Untitled"}</strong>
                                <time dateTime={item.date || undefined}>
                                    {displayDate(item.date)}
                                </time>
                                <span className="recent-row-arrow">→</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </section>
    );
}

export default DashboardPage;