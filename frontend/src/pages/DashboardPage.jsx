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
                    <p>Resources</p>
                    <p>{resourceCount}</p>
                    <p>Saved Learning Materials</p>
                </div>

                <div>
                    <span></span>
                    <p>Tasks</p>
                    <p>{taskCount}</p>
                    <p>Task To Complete</p>
                </div>

                <div>
                    <span></span>
                    <p>Snippets</p>
                    <p>{snippetCount}</p>
                    <p>Reusable Code Snippets</p>
                </div>

                <div>
                    <span></span>
                    <p>Compelet</p>
                    <p>{completedTaskCount}</p>
                    <p>Finished Tasks</p>
                </div>
            </div>
        </section>
        </>
    );
}

export default DashboardPage