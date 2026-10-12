import { useEffect, useMemo, useState } from "react";
import api, { getApiError } from "../services/api";
import { formatDateTime } from "../utils/formatDate";
import "./TaskPage.css";

const emptyForm = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    project: "",
    dueDate: "",
};

const statusLabels = {
    todo: "To do",
    "in-progress": "Ongoing",
    done: "Finished",
};

function formatDueDateForInput(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60_000
    );

    return localDate.toISOString().slice(0, 16);
}

function formatDueDate(value) {
    if (!value) return "No due date";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function TaskPage() {
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function loadTasks() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/tasks");
            setTasks(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTasks();
    }, []);

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const matchesStatus =
                statusFilter === "all" || task.status === statusFilter;
            const matchesPriority =
                priorityFilter === "all" || task.priority === priorityFilter;

            const searchableText = [
                task.title,
                task.description,
                task.project,
                task.status,
                task.priority,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
                matchesStatus &&
                matchesPriority &&
                searchableText.includes(query)
            );
        });
    }, [tasks, search, statusFilter, priorityFilter]);

    const taskCounts = useMemo(() => {
        return {
            total: tasks.length,
            todo: tasks.filter((task) => task.status === "todo").length,
            ongoing: tasks.filter((task) => task.status === "in-progress").length,
            finished: tasks.filter((task) => task.status === "done").length,
        };
    }, [tasks]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function startEditing(task) {
        setEditingId(task.id);
        setForm({
            title: task.title || "",
            description: task.description || "",
            status: task.status || "todo",
            priority: task.priority || "medium",
            project: task.project || "",
            dueDate: formatDueDateForInput(task.dueDate),
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
            setError("Please enter a title for this task.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            status: form.status,
            priority: form.priority,
            project: form.project.trim(),
            dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        };

        setSaving(true);

        try {
            if (editingId !== null) {
                await api.put(`/api/tasks/${editingId}`, payload);
                setMessage("Task updated successfully.");
            } else {
                await api.post("/api/tasks", payload);
                setMessage("Task created successfully.");
            }

            setForm(emptyForm);
            setEditingId(null);
            await loadTasks();
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setSaving(false);
        }
    }

    async function changeStatus(task, newStatus) {
        setError("");
        setMessage("");

        try {
            await api.patch(`/api/tasks/${task.id}/status`, {
                status: newStatus,
            });

            setTasks((current) =>
                current.map((item) =>
                    item.id === task.id ? { ...item, status: newStatus } : item
                )
            );

            setMessage(`Task status changed to "${statusLabels[newStatus]}".`);
        } catch (err) {
            setError(getApiError(err));
        }
    }

    async function handleDelete(task) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${task.title}"? This cannot be undone.`
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            await api.delete(`/api/tasks/${task.id}`);
            setTasks((current) =>
                current.filter((item) => item.id !== task.id)
            );
            if (editingId === task.id) cancelEditing();
            setMessage("Task deleted successfully.");
        } catch (err) {
            setError(getApiError(err));
        }
    }

    return (
        <main className="task-page">
            <header className="task-heading">
                <div>
                    <p className="eyebrow">YOUR WORKSPACE</p>
                    <h1>Tasks</h1>
                    <p className="page-description">
                        Organise your work, track progress, and keep your next steps clear.
                    </p>
                </div>

                <div className="task-total">
                    <strong>{taskCounts.total}</strong>
                    <span>total tasks</span>
                </div>
            </header>

            <section className="task-summary" aria-label="Task status summary">
                <div className="summary-card">
                    <span className="summary-dot todo-dot" />
                    <div>
                        <strong>{taskCounts.todo}</strong>
                        <span>To do</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="summary-dot ongoing-dot" />
                    <div>
                        <strong>{taskCounts.ongoing}</strong>
                        <span>Ongoing</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="summary-dot finished-dot" />
                    <div>
                        <strong>{taskCounts.finished}</strong>
                        <span>Finished</span>
                    </div>
                </div>
            </section>

            <section className="task-form-card">
                <div className="section-heading">
                    <div>
                        <h2>{editingId !== null ? "Edit task" : "Create a task"}</h2>
                        <p>
                            {editingId !== null
                                ? "Update the task details and save your changes."
                                : "Write down the next thing you need to get done."}
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

                <form className="task-form" onSubmit={handleSubmit}>
                    <label>
                        Task title *
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Finish the resources page"
                            maxLength={150}
                            required
                        />
                    </label>

                    <label>
                        Project
                        <input
                            name="project"
                            value={form.project}
                            onChange={handleChange}
                            placeholder="e.g. DevShelf"
                            maxLength={150}
                        />
                    </label>

                    <label>
                        Status
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="todo">To do</option>
                            <option value="in-progress">Ongoing</option>
                            <option value="done">Finished</option>
                        </select>
                    </label>

                    <label>
                        Priority
                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </label>

                    <label>
                        Due date and time
                        <input
                            name="dueDate"
                            type="datetime-local"
                            value={form.dueDate}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="task-full-width">
                        Description
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Add steps, context, or details..."
                            rows={4}
                            maxLength={3000}
                        />
                    </label>

                    {error && <p className="feedback error-message">{error}</p>}
                    {message && <p className="feedback success-message">{message}</p>}

                    <div className="task-full-width form-actions">
                        <button type="submit" className="primary-button" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId !== null
                                  ? "Save changes"
                                  : "Create task"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="task-history">
                <div className="section-heading">
                    <div>
                        <h2>Task history</h2>
                        <p>Search tasks, update their status, or edit their details.</p>
                    </div>
                    <span className="result-count">
                        {filteredTasks.length} result
                        {filteredTasks.length === 1 ? "" : "s"}
                    </span>
                </div>

                <div className="task-filters">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search task, description, or project..."
                        aria-label="Search tasks"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        aria-label="Filter tasks by status"
                    >
                        <option value="all">All statuses</option>
                        <option value="todo">To do</option>
                        <option value="in-progress">Ongoing</option>
                        <option value="done">Finished</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(event) => setPriorityFilter(event.target.value)}
                        aria-label="Filter tasks by priority"
                    >
                        <option value="all">All priorities</option>
                        <option value="low">Low priority</option>
                        <option value="medium">Medium priority</option>
                        <option value="high">High priority</option>
                    </select>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={loadTasks}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="empty-state">Loading your tasks...</div>
                ) : error && tasks.length === 0 ? (
                    <div className="empty-state">
                        <h3>We couldn’t load your tasks</h3>
                        <p>{error}</p>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={loadTasks}
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <h3>
                            {search || statusFilter !== "all" || priorityFilter !== "all"
                                ? "No matching tasks"
                                : "No tasks yet"}
                        </h3>
                        <p>
                            {search || statusFilter !== "all" || priorityFilter !== "all"
                                ? "Try changing your search or filters."
                                : "Create your first task using the form above."}
                        </p>
                    </div>
                ) : (
                    <div className="task-list">
                        {filteredTasks.map((task) => (
                            <article className="task-card" key={task.id}>
                                <div className="task-card-header">
                                    <div className="task-title-area">
                                        <span
                                            className={`task-status status-${task.status || "todo"}`}
                                        >
                                            {statusLabels[task.status] || "To do"}
                                        </span>
                                        <span
                                            className={`priority-pill priority-${task.priority || "medium"}`}
                                        >
                                            {task.priority || "medium"} priority
                                        </span>
                                    </div>
                                    <h3>{task.title}</h3>
                                    {task.project && (
                                        <p className="task-project">
                                            Project: {task.project}
                                        </p>
                                    )}
                                </div>

                                {task.description && (
                                    <p className="task-description">
                                        {task.description}
                                    </p>
                                )}

                                <div className="task-metadata">
                                    <div>
                                        <span>Created</span>
                                        <time dateTime={task.createdAt || undefined}>
                                            {formatDateTime(task.createdAt)}
                                        </time>
                                    </div>
                                    <div>
                                        <span>Due date</span>
                                        <time dateTime={task.dueDate || undefined}>
                                            {formatDueDate(task.dueDate)}
                                        </time>
                                    </div>
                                    {task.updatedAt &&
                                        task.createdAt &&
                                        new Date(task.updatedAt).getTime() >
                                            new Date(task.createdAt).getTime() && (
                                            <div>
                                                <span>Last updated</span>
                                                <time dateTime={task.updatedAt}>
                                                    {formatDateTime(task.updatedAt)}
                                                </time>
                                            </div>
                                        )}
                                </div>

                                <div className="task-card-actions">
                                    <label className="status-change">
                                        Change status
                                        <select
                                            value={task.status || "todo"}
                                            onChange={(event) =>
                                                changeStatus(task, event.target.value)
                                            }
                                            aria-label={`Change status for ${task.title}`}
                                        >
                                            <option value="todo">To do</option>
                                            <option value="in-progress">Ongoing</option>
                                            <option value="done">Finished</option>
                                        </select>
                                    </label>

                                    <div className="task-buttons">
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() => startEditing(task)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="danger-button"
                                            onClick={() => handleDelete(task)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default TaskPage;