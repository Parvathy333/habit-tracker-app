import { createHabit, renderHabits, updateStreak, checkNewDay, scheduleReminder } from './habitFunctions.js';

document.addEventListener('DOMContentLoaded', () => {
    const addHabitButton = document.getElementById('add-habit-button');
    const habitList = document.getElementById('habit-list');
    const remindersList = document.getElementById('reminders-list');
    let habits = loadHabits();

    function saveHabits(currentHabits) {
        localStorage.setItem('habits', JSON.stringify(currentHabits || habits));
    }

    function loadHabits() {
        const storedHabits = localStorage.getItem('habits');
        return storedHabits ? JSON.parse(storedHabits) : [];
    }

    function renderReminders(currentHabits, remindersListElement) {
        remindersListElement.innerHTML = '';
        const todayReminders = (currentHabits || habits).filter(habit => habit.reminder);
        if (todayReminders.length > 0) {
            todayReminders.forEach(habit => {
                const reminderItem = document.createElement('li');
                reminderItem.textContent = `${habit.name} at ${habit.reminder}`;
                remindersListElement.appendChild(reminderItem);
            });
        } else {
            const noRemindersItem = document.createElement('li');
            noRemindersItem.textContent = 'No reminders set for today.';
            remindersListElement.appendChild(noRemindersItem);
        }
    }

    function removeHabit(indexToRemove) {
        if (confirm(`Are you sure you want to remove "${habits[indexToRemove].name}"?`)) {
            habits.splice(indexToRemove, 1);
            saveHabits(habits);
            renderHabits(habits, habitList, updateStreak, renderReminders, saveHabits, scheduleReminder, removeHabit); // Pass removeHabit
            renderReminders(habits, remindersList);
        }
    }

    addHabitButton.addEventListener('click', () => {
        const newHabitName = prompt('Enter the name of the new habit:');
        if (newHabitName) {
            const goalType = prompt('Set a goal type (daily or weekly):').toLowerCase();
            const goalQuantity = parseInt(prompt(`Set a ${goalType} goal quantity:`));
            const newHabit = createHabit(newHabitName, goalType, goalQuantity);
            habits.push(newHabit);
            renderHabits(habits, habitList, updateStreak, renderReminders, saveHabits, scheduleReminder, removeHabit); // Pass removeHabit
            renderReminders(habits, remindersList);
            saveHabits(habits);
        }
    });

    checkNewDay(habits, saveHabits, renderHabits, renderReminders, habitList, scheduleReminder, removeHabit); // Pass removeHabit
    renderHabits(habits, habitList, updateStreak, renderReminders, saveHabits, scheduleReminder, removeHabit); // Pass removeHabit
    habits.forEach(habit => {
        if (habit.reminder) {
            scheduleReminder(habit);
        }
    });
    renderReminders(habits, remindersList);
});