import NavBar from "./NavBar";
import './DashboardPage.css';
function DashboardPage() {

    const resources = ["HTML & CSS", "JavaScript", "React Guide"];

    const snippets = ["Fetch API", "React useState Object Pattern"];

    const tasks = [
        {
            title: "Complete Register Page",
            completed: true
        },
        
        { 
            title: "Style Login Input Eye Icon", 
            completed: true 
        },
        
        { 
            title: "Connect Dashboard Routes", 
            completed: false 
        }
    ];

    //Counting variables 
    const resourceCount = resources.length;
    const snippetCount = snippets.length;
    const taskCount = tasks.length;
    const completedTaskCount = tasks.filter((task) => task.completed === true).length;

    return(
        <>
        <section className="dashboard-page">
            <NavBar />
            <div className="dashboard-welcome">
                <h2>Good Morning!</h2>
                <p>Keep your learning organized</p>
            </div>
            
<div className="dashboard-stats">
    <div className="stat-card">
        <span className="stat-icon stat-icon-resources"></span>
        <p className="stat-label">Total Resources</p>
        <p className="stat-value">{resourceCount}</p>
        <p className="stat-description">Saved learning materials</p>
    </div>

    <div className="stat-card">
        <span className="stat-icon stat-icon-tasks"></span>
        <p className="stat-label">Total Tasks</p>
        <p className="stat-value">{taskCount}</p>
        <p className="stat-description">Tasks on your list</p>
    </div>

    <div className="stat-card">
        <span className="stat-icon stat-icon-snippets"></span>
        <p className="stat-label">Total Snippets</p>
        <p className="stat-value">{snippetCount}</p>
        <p className="stat-description">Reusable code snippets</p>
    </div>

    <div className="stat-card">
        <span className="stat-icon stat-icon-completed"></span>
        <p className="stat-label">Completed Tasks</p>
        <p className="stat-value">{completedTaskCount}</p>
        <p className="stat-description">Finished tasks</p>
    </div>
</div>


            <div className="quick-actions">
    <h3 className="section-title">Quick actions</h3>

    <div className="quick-actions-list">
        <p className="quick-action-item">Save a resource</p>
        <p className="quick-action-item">Create a snippet</p>
        <p className="quick-action-item">Add a task</p>
    </div>
</div>
        </section>
        </>
    );
}

export default DashboardPage