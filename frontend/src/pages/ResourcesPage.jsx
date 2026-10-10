function ResourcesPage() {

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

    let resourceCount = resources.length;
    let snippetCount = snippets.length;
    let taskCount = tasks.length;
    let completedTaskCount = tasks.filter((task) => task.completed === true).length;

    
    return(
        <>
        <section>
            <div>
                <h1>Resources</h1>
            </div>
        </section>
        </>
    );
}


export default ResourcesPage