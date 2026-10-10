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
        <section className="resources-page-container">
            <div className="resources-header-section">
                <h1 className="resources-main-title">Resources</h1>
                <p className="resources-subtitle">Save and organize useful learning materials.</p>
            </div>
            <hr className="resources-divider" />
            <div className="resource-form-card">
                <h3 className="resource-form-title">Add a new resource</h3>
                <form onSubmit={handleSubmit} className="resource-form">
                    <div className="resource-form-group">
                        <label htmlFor="resource" className="resource-label">Resource title:</label>
                        <input 
                            id="resource"
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={resourceHandle}
                            className="resource-input"
                        />
                        {errors.title && <p className="resource-error-message">{errors.title}</p>}                        
                    </div>

                    <div className="resource-form-group">
                        <label htmlFor="resource-URL" className="resource-label">Resource URL:</label>
                        <input 
                            id="resource-URL"
                            type="url" 
                            name="url"
                            value={formData.url}
                            onChange={resourceHandle}
                            className="resource-input"
                        />
                        {errors.url && <p className="resource-error-message">{errors.url}</p>}
                    </div>

                    <div className="resource-form-group">
                        <label htmlFor="category" className="resource-label">Category:</label>
                        <select 
                            name="category" 
                            id="category"  
                            value={formData.category}
                            onChange={resourceHandle}
                            className="resource-select"
                        >
                            <option value="" className="resource-option-placeholder">-- Select a category --</option>
                            <option value="Documentation" className="resource-option">Documentation</option>
                            <option value="Tutorial" className="resource-option">Tutorial</option>
                            <option value="Course" className="resource-option">Course</option>
                            <option value="Tool" className="resource-option">Tool</option>
                            <option value="Other" className="resource-option">Other</option>
                        </select>       
                        {errors.category && <p className="resource-error-message">{errors.category}</p>}               
                    </div>

                    <div className="resource-form-group">
                        <label htmlFor="description" className="resource-label">Description (optional)</label>
                        <textarea 
                            id="description" 
                            placeholder="Add notes about this resource..."
                            name="description"
                            value={formData.description}
                            onChange={resourceHandle}
                            rows={5}
                            className="resource-textarea"
                        />
                    </div>
                    <Button type="submit" variant="primary" className="resource-submit-button">+ Save Resource</Button>      
                </form>
            </div>

            <div className="resources-counter-section">
                <h4 className="resources-counter-title">Your resources</h4>
                <p className="resources-counter-text">{resources.length} saved</p>
            </div>

            <div className="resources-history-section">
                <span className="resources-history-decorator"></span>
                <h4 className="resources-history-title">{resources.length !== 0 ? "Resources history" : "No resources yet"}</h4>
                <div className="resources-table-header"> 
                    <h5 className="resources-table-th">Title</h5> 
                    <h5 className="resources-table-th">URL</h5> 
                    <h5 className="resources-table-th">Category</h5> 
                    <h5 className="resources-table-th">Description</h5> 
                </div>
                {resources.length === 0 ? (
                    <p className="resources-empty-fallback">Resources you save will appear here.</p>
                ) : (
                    <ul className="resources-history-list">
                        {resources.map((resource, index) => {
                            return (
                                <li key={index} className="resources-history-item">
                                    <article className="resource-item-article">
                                        <strong className="resource-item-title">{resource.title}</strong> 
                                        <span className="resource-item-url"> {resource.url} </span> 
                                        <span className="resource-item-category"> {resource.category} </span>
                                        <span className="resource-item-description"> {resource.description} </span>
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
