export function createHabit(name, goalType, goalQuantity) {
    return {
        name: name,
        completedToday: false,
        streak: 0,
        lastCompleted: null,
        goalType: goalType || null,
        goalQuantity: goalQuantity || null,
        completedCount: 0,
        reminder: null
    };
}

export function renderHabits(habits, habitList, updateStreak, renderReminders, saveHabits, scheduleReminder, removeHabitCallback) { // Add removeHabitCallback
    habitList.innerHTML = '';
    habits.forEach((habit, index) => {
        const habitItem = document.createElement('div');
        habitItem.classList.add('habit-item');

        const habitDetails = document.createElement('div');
        habitDetails.classList.add('habit-details');
        let detailsText = `<span>${habit.name}</span> (Streak: ${habit.streak})`;
        if (habit.goalQuantity) {
            detailsText += ` - Goal: ${habit.completedCount}/${habit.goalQuantity} ${habit.goalType}`;
        }
        habitDetails.innerHTML = detailsText;

        const habitActions = document.createElement('div');
        habitActions.classList.add('habit-actions');

        const checkButton = document.createElement('button');
        checkButton.textContent = habit.completedToday ? 'Uncheck' : 'Check';
        checkButton.classList.add(habit.completedToday ? 'uncheck-button' : 'check-button');
        checkButton.addEventListener('click', () => {
            habits[index].completedToday = !habits[index].completedToday;
            if (habit.goalQuantity) {
                habits[index].completedCount = habit.completedToday ? (habits[index].completedCount || 0) + 1 : Math.max(0, (habits[index].completedCount || 0) - 1);
            }
            updateStreak(habits, index);
            renderHabits(habits, habitList, updateStreak, renderReminders, saveHabits, scheduleReminder, removeHabitCallback); // Pass removeHabitCallback
            renderReminders(habits, document.getElementById('reminders-list'));
            saveHabits(habits);
            checkButton.classList.add('animate-check');
            setTimeout(() => checkButton.classList.remove('animate-check'), 300);
        });

        const reminderButton = document.createElement('button');
        reminderButton.textContent = habit.reminder ? 'Reminder Set' : 'Set Reminder';
        reminderButton.classList.add('reminder-button');
        reminderButton.addEventListener('click', () => {
            const reminderTimeStr = prompt(`Set a reminder time for "${habit.name}" (e.g., 8:00 AM or 14:30):`);
            if (reminderTimeStr) {
                habits[index].reminder = reminderTimeStr;
                scheduleReminder(habits[index]);
            } else {
                delete habits[index].reminder;
                // Optionally clear any existing timeout if you implement that
            }
            renderHabits(habits, habitList, updateStreak, renderReminders, saveHabits, scheduleReminder, removeHabitCallback); // Pass removeHabitCallback
            renderReminders(habits, document.getElementById('reminders-list'));
            saveHabits(habits);
        });

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => {
            removeHabitCallback(index); // Call the remove function with the index
        });

        habitActions.appendChild(checkButton);
        habitActions.appendChild(reminderButton);
        habitActions.appendChild(removeButton); // Add the remove button
        habitItem.appendChild(habitDetails);
        habitItem.appendChild(habitActions);
        habitList.appendChild(habitItem);

        if (habit.reminder) {
            scheduleReminder(habit);
        }
    });
}

export function updateStreak(habits, habitIndex) {
    const today = new Date().toDateString();
    const lastCompleted = habits[habitIndex].lastCompleted;

    if (habits[habitIndex].completedToday) {
        if (!lastCompleted || lastCompleted !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastCompleted === yesterday.toDateString()) {
                habits[habitIndex].streak++;
            } else {
                habits[habitIndex].streak = 1;
            }
            habits[habitIndex].lastCompleted = today;
        }
    }
}

export function checkNewDay(habits, saveHabits, renderHabits, renderReminders, habitList, scheduleReminder, removeHabitCallback) { // Pass removeHabitCallback
    const lastCheck = localStorage.getItem('lastCheck');
    const today = new Date().toDateString();
    const currentDayOfWeek = new Date().getDay(); // 0 for Sunday, 6 for Saturday

    if (lastCheck !== today) {
        habits.forEach(habit => {
            habit.completedToday = false;
            if (habit.goalType === 'daily') {
                habit.completedCount = 0; // Reset daily count
            } else if (habit.goalType === 'weekly' && currentDayOfWeek === 0) { // Reset weekly count on Sunday
                habit.completedCount = 0;
            }
            if (habit.reminder) {
                scheduleReminder(habit);
            }
        });
        localStorage.setItem('lastCheck', today);
        saveHabits(habits);
        renderHabits(habits, habitList, updateStreak, renderReminders, saveHabits, scheduleReminder, removeHabitCallback); // Pass removeHabitCallback
    }
}

export function scheduleReminder(habit) {
    if (habit.reminder) {
        let hours, minutes;
        const timeParts = habit.reminder.match(/(\d+):(\d+)/);
        const ampmParts = habit.reminder.match(/(AM|PM)/i);

        if (timeParts) {
            hours = parseInt(timeParts[1], 10);
            minutes = parseInt(timeParts[2], 10);

            if (ampmParts) {
                const ampm = ampmParts[1].toUpperCase();
                if (ampm === 'PM' && hours !== 12) {
                    hours += 12;
                } else if (ampm === 'AM' && hours === 12) {
                    hours = 0;
                }
            }
        } else {
            console.error(`Invalid time format for habit "${habit.name}": ${habit.reminder}`);
            return;
        }

        const now = new Date();
        const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

        // If the reminder time is in the past today, schedule it for tomorrow
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(() => {
            alert(`Reminder: Time to do "${habit.name}"!`);
            // Optionally, re-schedule for the next day
        }, timeUntilReminder);

        console.log(`Reminder set for "${habit.name}" at ${habit.reminder} (${reminderTime.toLocaleTimeString()})`);
    }
}