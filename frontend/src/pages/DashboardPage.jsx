import NavBar from "./NavBar";
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
        <section>
            <NavBar />
            <h2>Good Morning!</h2>
            <p>Keep your learning organized</p>
            <div>
                <div>
                    <span></span>
                    <p>Total Resources</p>
                    <p>{resourceCount}</p>
                    <p>Saved learning materials</p>
                </div>

                <div>
                    <span></span>
                    <p>Total Tasks</p>
                    <p>{taskCount}</p>
                    <p>Tasks on your list</p>
                </div>

                <div>
                    <span></span>
                    <p>Total Snippets</p>
                    <p>{snippetCount}</p>
                    <p>Reusable code snippets</p>
                </div>

                <div>
                    <span></span>
                    <p>Completed Tasks</p>
                    <p>{completedTaskCount}</p>
                    <p>Finished tasks</p>
                </div>
            </div>

            <div>
                <h3>Quick actions</h3>
                <p>Save a resource</p>
                <p>Create a snippet</p>
                <p>Add a task</p>
            </div>
        </section>
        </>
    );
}

export default DashboardPage