import { useState } from "react";
import Button from "../components/Button";

function ResourcesPage() {
    const [formData, setformData] = useState({
        title: "",
        url: "",
        category: "",
        description: ""
    });

    const [errors, setErrors] = useState({
        title: "",
        url: "",
        category: ""
    });

    const [resources, setResources] = useState([
        { title: "AA Salim", url: "http://localhost:5173/resources", category: "Documentation", description: "On going project" }
    ]);

    const resourceHandle = (event) => {
        const { name, value } = event.target;

        setformData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        let valid = true;
        let newErrors = { title: "", url: "", category: "" };

        if (!formData.title.trim()) {
            newErrors.title = "Resource title is required.";
            valid = false;
        }

        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

        if (!formData.url.trim()) {
            newErrors.url = "Resource URL is required.";
            valid = false;
        } else if (!urlPattern.test(formData.url.trim())) {
            newErrors.url = "Please enter a valid web address (e.g., https://example.com).";
            valid = false;
        }

        if (!formData.category.trim()) {
            newErrors.category = "Please select a category.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        const isFormValid = validateForm();

        if (isFormValid) {
            setResources((prevResources) => [
                ...prevResources,
                formData
            ]);

            setformData({
                title: "",
                url: "",
                category: "",
                description: ""
            });
        }
    };

    return (
        <>
        <section>
            <div>
                <h1>Resources</h1>
                <p>Save and organize useful learning materials.</p>
            </div>
            <hr />
            <div>
                <h3>Add a new resource</h3>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="resource">Resource title:</label>
                        <input 
                            id="resource"
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={resourceHandle}
                        />
                        <p>{errors.title}</p>                        
                    </div>

                    <div>
                        <label htmlFor="resource-URL">Resource URL:</label>
                        <input 
                            id="resource-URL"
                            type="url" 
                            name="url"
                            value={formData.url}
                            onChange={resourceHandle}
                        />
                        <p>{errors.url}</p>
                    </div>

                    <div>
                        <label htmlFor="category">Category:</label>
                        <select 
                            name="category" 
                            id="category"  
                            value={formData.category}
                            onChange={resourceHandle}
                        >
                            <option value="">-- Select a category --</option>
                            <option value="Documentation">Documentation</option>
                            <option value="Tutorial">Tutorial</option>
                            <option value="Course">Course</option>
                            <option value="Tool">Tool</option>
                            <option value="Other">Other</option>
                        </select>       
                        <p>{errors.category}</p>               
                    </div>

                    <div>
                        <label htmlFor="description">Description (optional)</label>
                        <textarea 
                            id="description" 
                            placeholder="Add notes about this resource..."
                            name="description"
                            value={formData.description}
                            onChange={resourceHandle}
                            rows={5}
                        />
                    </div>
                    <Button type="submit" variant="primary" className="login-button">+ Save Resource</Button>      
                </form>
            </div>

            <div>
                <h4>Your resources</h4>
                <p>{resources.length} saved</p>
            </div>

            <div>
                <span></span>
                <h4>{resources.length !== 0 ? "Resources history" : "No resources yet"}</h4>
                <div> <h5>Title</h5> <h5>URL</h5> <h5>Category</h5> <h5>Description</h5> </div>
                {resources.length === 0 ? (
                    <p>Resources you save will appear here.</p>
                ) : (
                    <ul>
                        {resources.map((resource, index) => {
                            return (
                                <li key={index}>
                                    <article>
                                        <strong>{resource.title}</strong> 
                                        <span> {resource.url} </span> 
                                        <span> {resource.category} </span>
                                        <span> {resource.description} </span>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
        </>
    );
}

export default ResourcesPage;
