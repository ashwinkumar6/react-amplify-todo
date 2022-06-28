import React, { useState, useEffect } from 'react';
import { DataStore } from 'aws-amplify';
import { Task } from "../models"

import './todo.scss';

const Todo = (props) => {
    const [itemName, setItemName] = useState("");
    const [itemDesc, setitemDesc] = useState("");
    const [itemDate, setItemDate] = useState("");
    const [itemTime, setitemTime] = useState("");
    const [itemList, setItemList] = useState([]);

    useEffect(() => {
        fetchTasks();
        const subscription = DataStore.observe(Task).subscribe(() => fetchTasks());
        return () => subscription.unsubscribe();
    });

    async function fetchTasks() {
        try {
            const taskList = await DataStore.query(Task);
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
            await DataStore.save(new Task(data));
        } catch (e) {
            console.log("error", e)
        }

        // setItemList([...itemList, data]);
        setItemName("");
        setitemDesc("");
        setItemDate("");
        setitemTime("");
    }

    return (
        <div className='todo-comp'>
            <div className='todo-title'>
                My Todo App
            </div>

            <div className="todo-container">
                <div className="new-item-container">
                    <form>
                        <input required type="text" placeholder="Name" name="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                        <input required type="text" placeholder="Description" name="itemDesc" value={itemDesc} onChange={(e) => setitemDesc(e.target.value)} />
                        <input required type="date" name="itemDate" value={itemDate} onChange={(e) => setItemDate(e.target.value)} />
                        <input required type="time" name="itemTime" value={itemTime} onChange={(e) => setitemTime(e.target.value)} />

                        <i class="fa-solid fa-plus new-item"
                            onClick={createTask}>
                        </i>


                    </form>
                </div>

                <div className='todo-list-container'>
                    {itemList.map((listItem, index) => {
                        const { itemName, itemDesc, itemDate, itemTime, itemComplete } = listItem;

                        return (
                            <div className="todo-list-item" key={index}>

                                <div className={"text-container " + (itemComplete ? "item-checked" : "")} >
                                    <span className='item'>{itemName}</span>
                                    <span className='item'>{itemDesc}</span>
                                    <span className='item'>{`${itemDate} ${itemTime}`}</span>
                                </div>
                                <i class="fa-solid fa-check done-button"
                                    onClick={() => {
                                        itemList[index].itemComplete = !itemList[index].itemComplete;

                                        if (itemList[index].itemComplete) {
                                            itemList.push(...itemList.splice(index, 1));
                                        } else {
                                            itemList.unshift(...itemList.splice(index, 1));
                                        }

                                        setItemList([...itemList]);

                                        // update data to db
                                        // try {
                                        //     await DataStore.save(new Task(data));
                                        // } catch (e) {
                                        //     console.log("error in changing status of task", e)
                                        // }

                                    }}>
                                </i>

                                <i class="fa-solid fa-xmark delete-button"
                                    onClick={async() => {
                                        try {
                                            // itemList.splice(index, 1)
                                            const job = await DataStore.query(Task, itemList[index].id);
                                            await DataStore.delete(job);
                                        } catch (e) {
                                            console.log("error in deleting task", e);
                                        }

                                        // setItemList([...itemList]);

                                        // // update data to db
                                        // try {
                                        //     await DataStore.save(new Task(data));
                                        // } catch (e) {
                                        //     console.log("error in deleting task", e)
                                        // }

                                    }}>
                                </i>
                            </div>)
                    })}
                </div>
            </div>
        </div>

    );
}

export default Todo;