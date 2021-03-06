import React, { useState, useEffect } from 'react';
import { DataStore, Storage } from 'aws-amplify';
import { AmplifyChatbot } from '@aws-amplify/ui-react/legacy';
import { Todo } from '../../models';
import { downloadBlob } from '../../utils/file-utils';
import './todo.scss';


// function getLocalStream() {
//     navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
//         console.log("here0", stream);

//         window.localStream = stream; // A
//         console.log("here1", stream);

//         // window.localAudio.srcObject = stream; // B
//         console.log("here2", stream);

//         // window.localAudio.autoplay = true; // C
//         console.log("here3");

//     }).catch(err => {
//         console.log("u got an error:" + err)
//     });
// }
// getLocalStream();

window.Buffer = window.Buffer || require('buffer').Buffer;

// navigator.mediaDevices.getUserMedia({ audio: true })
//     .then(function (stream) {
//         window.localStream = stream;
//         console.log('You let me use your mic!')
//     })
//     .catch(function (err) {
//         console.log('No mic for you!', err);
    // });


Storage.configure({ level: 'private' });

const TodoComponent = (props) => {
    const [itemName, setItemName] = useState("");
    const [itemDesc, setitemDesc] = useState("");
    const [itemDate, setItemDate] = useState("");
    const [itemTime, setitemTime] = useState("");
    const [itemFile, setItemFile] = useState(null);
    const [itemList, setItemList] = useState([]);

    const handleChatComplete = (event) => {
        const { data, err } = event.detail;
        if (data) alert('Chat fulfilled!', JSON.stringify(data));
        if (err) alert('Chat failed:', err);
    };

    useEffect(() => {
        const chatbotElement = document.querySelector('amplify-chatbot');
        chatbotElement.addEventListener('chatCompleted', handleChatComplete);
        return function cleanup() {
            chatbotElement.removeEventListener('chatCompleted', handleChatComplete);
        };
    }, []);

    useEffect(() => {
        fetchTasks();
        const subscription = DataStore.observe(Todo).subscribe(() => fetchTasks());
        return () => subscription.unsubscribe();
    });

    async function fetchTasks() {
        try {
            const taskList = await DataStore.query(Todo);
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
            <div className='logout-container'>
                <div className='name'>{props.userInfoObj.data.username}</div>
                <button onClick={() => { props.signOut(); }}>
                    sign out
                </button>
            </div>

            <div className='todo-title'>
                My Todo App
            </div>

            <div className="todo-container">
                <div className="new-item-container">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        createTask();
                    }} >
                        <input required className='form-input' type="text" placeholder="Name" name="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                        <input required className='form-input' type="text" placeholder="Description" name="itemDesc" value={itemDesc} onChange={(e) => setitemDesc(e.target.value)} />
                        <input required className='form-input' type="date" name="itemDate" value={itemDate} onChange={(e) => setItemDate(e.target.value)} />
                        <input required className='form-input' type="time" name="itemTime" value={itemTime} onChange={(e) => setitemTime(e.target.value)} />

                        <input required type="file" onChange={(e) => { setItemFile(e.target.files[0]) }} />;

                        <input type="submit" class="fa-solid fa-plus new-item" value="&#xf067;" />

                    </form>
                </div>

                {/* render pending items */}
                {renderListItems(false)}

                {/* render completed items */}
                {renderListItems(true)}

                <AmplifyChatbot
                    style={{ "--height": "25rem", "--width": "22rem" }}
                    botName="BookTrip_dev"
                    botTitle="Book your car (IN DEV)"
                    welcomeMessage="Say, I need to book a car?"
                    textEnabled={true}
                    voiceEnabled={true}
                    conversationModeOn={true}
                />
            </div>
        </div>

    );
}

export default TodoComponent;