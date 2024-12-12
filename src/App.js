import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const link = "https://assignment-5-backend-485d.onrender.com";
    const [task, setTask] = useState("");
    const [completeness, setCompleteness] = useState("");
    const [itemIdToDelete, setItemIdToDelete] = useState("");
    const [items, setItems] = useState([]);
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editedTask, setEditedTask] = useState("");
    const [editedDescription, setEditedDescription] = useState("");


    const handleOnSubmit = async (e) => {
        e.preventDefault();
        let taskCompleteness = completeness === '' ? 'unfinished' : completeness;
        let taskDescription = description === '' ? '*' : description;

        let result = await fetch(
            `${link}/register`, {
            method: "POST",
            body: JSON.stringify({ task, description: taskDescription, completeness: taskCompleteness }),
            headers: {
                'Content-Type': 'application/json',
            },
        }
        );
        result = await result.json();
        if (result) {
            // alert("Data saved successfully");
            setTask("");
            setDescription("");
            setCompleteness("");
            fetchItems();
        }
    };

    // Deletion - Delete user by ID
    const handleOnDelete = async (id) => {
        const result = await fetch(
            `${link}/delete/${id}`, // Use itemIdToDelete directly in the URL
            {
                method: "DELETE", // Use DELETE method
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const response = await result.json();

        if (result.status === 200) {
            // alert(`Task deleted successfully.`);
            setItemIdToDelete(""); // Reset the input field
            fetchItems();
        } else {
            alert(response.message || "Error deleting user.");
        }
    };

    const fetchItems = async () => {
        try {
            const result = await fetch(`${link}/items`);
            const data = await result.json();
            setItems(data);
        } catch (error) {
            console.error("Error fetching items:");
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCompletenessToggle = async (itemId, currentCompleteness) => {
        try {
            const newCompleteness = currentCompleteness === 'complete' ? 'todo' : 'complete';

            const result = await fetch(`${link}/update/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completeness: newCompleteness })
            });

            if (result.status === 200) {
                // Update the local state by fetching the updated data
                fetchItems();
            } else {
                alert('Error updating task status');
            }
        } catch (error) {
            console.error('Error updating completeness:', error);
            alert('Error updating task status');
        }
    };

    const handleEdit = async (itemId) => {
        if (editingId === itemId) {
            try {
                const result = await fetch(`${link}/update/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        task: editedTask,
                        description: editedDescription,
                        completeness: items.find(item => item._id === itemId).completeness
                    })
                });

                if (result.status === 200) {
                    setEditingId(null);
                    fetchItems();
                } else {
                    alert('Error updating task');
                }
            } catch (error) {
                console.error('Error updating task:', error);
                alert('Error updating task');
            }
        } else {
            const item = items.find(item => item._id === itemId);
            setEditedTask(item.task);
            setEditedDescription(item.description);
            setEditingId(itemId);
        }
    };

    return (
        <>
            <div className="container">
                <h1>To Do List</h1>
                <div className="layout-container">
                    {/* Left Side - Forms */}
                    <div className="forms-container">
                        {/* Form to Register User */}
                        <form onSubmit={handleOnSubmit}>
                            <input
                                type="text"
                                placeholder="Task"
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Description (Optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <button type="submit">Submit</button>
                        </form>

                    </div>

                    {/* Right Side - Tasks List */}
                    <div className="tasks-container">
                        <div className="items-grid">
                            {items.map((item) => (
                                <div key={item._id} className="item-box" style={{
                                    backgroundColor: item.completeness === 'complete' ? '#9EFD38' : '#FFFAD1'
                                }}>
                                    <div className="task-date">
                                        {new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                    </div>

                                    <div className={`task-text ${item.completeness === 'complete' ? 'completed' : ''}`}>
                                        {editingId === item._id ? (
                                            <input
                                                type="text"
                                                value={editedTask}
                                                onChange={(e) => setEditedTask(e.target.value)}
                                            />
                                        ) : (
                                            item.task
                                        )}
                                    </div>
                                    <div className={`task-text ${item.completeness === 'complete' ? 'completed-description' : ''}`}>
                                        {editingId === item._id ? (
                                            <input
                                                type="text"
                                                value={editedDescription}
                                                onChange={(e) => setEditedDescription(e.target.value)}
                                            />
                                        ) : (
                                            item.description
                                        )}
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => handleCompletenessToggle(item._id, item.completeness)}
                                        style={{
                                            backgroundColor: item.completeness === 'complete' ? 'green' : 'red',
                                            color: 'white'
                                        }}
                                    >
                                        {item.completeness === 'complete' ? 'complete' : 'todo'}
                                    </button>
                                    <container>

                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(item._id)}
                                        >
                                            {editingId === item._id ? 'save' : 'edit'}
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleOnDelete(item._id)}
                                        >
                                            ⌫
                                        </button>

                                    </container>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
