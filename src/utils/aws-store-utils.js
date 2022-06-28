import { DataStore } from "@aws-amplify/datastore";
import { Tasks } from "../models"

async function fetchTasks() {
    const taskList = await DataStore.query(Tasks);
    return taskList;
}

async function createTask(task) {
    await DataStore.save(new Task({...task}));
}