import React, { useState, useEffect } from 'react';
import { DataStore, Storage } from 'aws-amplify';
import { Todo } from "../models"
import { downloadBlob } from "../utils/file-utils";
import './todo.scss';

Storage.configure({ level: 'private' });

const TodoComponent = (props) => {
    const [itemName, setItemName] = useState("");
    const [itemDesc, setitemDesc] = useState("");
    const [itemDate, setItemDate] = useState("");
    const [itemTime, setitemTime] = useState("");
    const [itemFile, setItemFile] = useState(null);
    const [itemList, setItemList] = useState([]);

    useEffect(() => {
        fetchTasks();
        const subscription = DataStore.observe(Todo).subscribe(() => fetchTasks());
        return () => subscription.unsubscribe();
    });

    async function fetchTasks() {
        try {
            const taskList = await DataStore.query(Todo);
            // console.log("getting tasklist:", taskList);
            setItemList([...taskList]);
        } catch (e) {
            console.log("error in fetching", e);
        }
    }

    async function createTask() {
        console.log("making api call now");

        const data = {
            "name": itemName,
            "description": itemDesc,
            "date": itemDate,
            "time": itemTime,
            "fileName": itemFile.name,
            "status": false
        }

        // upload file to s3
        uploadFile(itemFile);

        // adding data to db
        try {
            await DataStore.save(new Todo(data));
        } catch (e) {
            console.log("error", e)
        }

        setItemName("");
        setitemDesc("");
        setItemDate("");
        setitemTime("");
        setItemFile(null);
    }

    async function itemCompleted(item) {
        try {
            // update the status of the item
            console.log(item);
            await DataStore.save(
                Todo.copyOf(item, updated => {
                    updated.status = !updated.status;
                })
            );
        } catch (e) {
            console.log("error in marking task complete", e);
        }
    }

    async function deleteItem(item) {
        try {
            await DataStore.delete(item);
        } catch (e) {
            console.log("error in deleting task", e);
        }
    }

    async function uploadFile(file) {
        try {
            await Storage.put(file.name, file, {
                // contentType is optional
                contentType: "image/png",
            });
        } catch (e) {
            console.log("Error uploading file: ", e);
        }
    }

    async function downloadFile(fileName) {
        try {
            const result = await Storage.get(fileName, { download: true });
            downloadBlob(result.Body, fileName);

            // // get key from Storage.list
            // const signedURL = await Storage.get(fileName);
        } catch (e) {
            console.log("unable to get file", e);
        }
    }

    // only displays notCompleted/ pending  items by default
    const renderListItems = (showCompletedItems = false) => {
        return (
            <div className='todo-list-container'>
                {itemList
                    .filter(listItem => listItem.status === showCompletedItems)
                    .map((listItem, index) => {
                        const { id, name, description, date, time, fileName, status } = listItem;

                        return (
                            <div className="todo-list-item" key={id}>
                                <div className={"text-container " + (status ? "item-checked" : "")} >
                                    <span className='item'>{name}</span>
                                    <span className='item'>{description}</span>
                                    <span className='item'>{`${date} ${time}`}</span>
                                    <span className='item fileItem'
                                        onClick={() => { downloadFile(fileName); }}>
                                        {fileName}
                                    </span>
                                </div>

                                <i class="fa-solid fa-check done-button"
                                    onClick={() => { itemCompleted(listItem); }}>
                                </i>

                                <i class="fa-solid fa-xmark delete-button"
                                    onClick={() => { deleteItem(listItem); }}>
                                </i>
                            </div>)
                    })}
            </div>
        );
    }

    return (
        <div className='todo-comp'>
            <div className='todo-title'>
                My Todo App
            </div>

            <div className="todo-container">
                <div className="new-item-container">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        console.log("hit in form");
                        createTask();
                    }} >
                        <input required type="text" placeholder="Name" name="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                        <input required type="text" placeholder="Description" name="itemDesc" value={itemDesc} onChange={(e) => setitemDesc(e.target.value)} />
                        <input required type="date" name="itemDate" value={itemDate} onChange={(e) => setItemDate(e.target.value)} />
                        <input required type="time" name="itemTime" value={itemTime} onChange={(e) => setitemTime(e.target.value)} />

                        <input required type="file" onChange={(e) => { setItemFile(e.target.files[0]) }} />;

                        <input type="submit" class="fa-solid fa-plus new-item" value="&#xf067;" />

                    </form>
                </div>

                {/* render pending items */}
                {renderListItems(false)}

                {/* render completed items */}
                {renderListItems(true)}
            </div>
        </div>

    );
}

export default TodoComponent;