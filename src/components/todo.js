import React, { useState } from 'react';
import './todo.scss';

const Todo = (props) => {
    const [itemName, setItemName] = useState("");
    const [itemDesc, setitemDesc] = useState("");
    const [itemDate, setItemDate] = useState("");
    const [itemTime, setitemTime] = useState("");
    const [itemList, setItemList] = useState([]);

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
                            onClick={() => {
                                const itemComplete = false
                                setItemList([...itemList, { itemName, itemDesc, itemDate, itemTime, itemComplete }]);
                                setItemName("");
                                setitemDesc("");
                                setItemDate("");
                                setitemTime("");
                            }}>
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
                                    }}>
                                </i>

                                <i class="fa-solid fa-xmark delete-button"
                                    onClick={() => {
                                        itemList.splice(index, 1)
                                        setItemList([...itemList]);
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