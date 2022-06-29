import React, { useState, useEffect } from 'react';
import { DataStore } from 'aws-amplify';
import { Todo } from "../models"

import './todo.scss';

const TodoComponent = (props) => {
    const [itemName, setItemName] = useState("");
    const [itemDesc, setitemDesc] = useState("");
    const [itemDate, setItemDate] = useState("");
    const [itemTime, setitemTime] = useState("");
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
            "status": false
        }

        // adding data to db
        try {
            await DataStore.save(new Todo(data));
        } catch (e) {
            console.log("error", e)
        }

        // setItemList([...itemList, data]);
        setItemName("");
        setitemDesc("");
        setItemDate("");
        setitemTime("");
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

    // only displays notCompleted/ pending  items by default
    const renderListItems = (showCompletedItems = false) => {
        return (
            <div className='todo-list-container'>
                {itemList
                    .filter(listItem => listItem.status === showCompletedItems)
                    .map((listItem, index) => {
                        const { id, name, description, date, time, status } = listItem;

                        return (
                            <div className="todo-list-item" key={id}>
                                <div className={"text-container " + (status ? "item-checked" : "")} >
                                    <span className='item'>{name}</span>
                                    <span className='item'>{description}</span>
                                    <span className='item'>{`${date} ${time}`}</span>
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