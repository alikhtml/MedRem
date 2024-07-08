document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name');
    const dosageInput = document.getElementById('dosage');
    const timeInput = document.getElementById('time');
    const addMedicineBtn = document.getElementById('addMedicineBtn');
    const medicineList = document.getElementById('medicineList');

    // Запрос разрешения на отправку уведомлений
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

    const loadMedicines = () => {
        const medicines = JSON.parse(localStorage.getItem('medicines')) || [];
        medicineList.innerHTML = '';
        medicines.forEach((med, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong>${med.name}</strong> - ${med.dosage} - ${med.time} - ${med.taken ? 'Taken' : ''}
                </div>
                <div>
                    ${!med.taken ? `<button class="confirm-btn" onclick="confirmIntake(${index})">Confirm Intake</button>` : ''}
                    <button class="delete-btn" onclick="deleteMedicine(${index})">Delete</button>
                </div>
            `;
            medicineList.appendChild(li);
        });
    };

    const saveMedicines = (medicines) => {
        localStorage.setItem('medicines', JSON.stringify(medicines));
    };

    const sendNotification = (name, time) => {
        if (Notification.permission === 'granted') {
            new Notification('Medicine Reminder', {
                body: `Time to take your medicine: ${name} at ${time}`,
            });
        }
    };

    addMedicineBtn.addEventListener('click', () => {
        const name = nameInput.value;
        const dosage = dosageInput.value;
        const time = timeInput.value;
        if (name && dosage && time) {
            const medicines = JSON.parse(localStorage.getItem('medicines')) || [];
            medicines.push({ name, dosage, time, taken: false });
            saveMedicines(medicines);
            loadMedicines();
            nameInput.value = '';
            dosageInput.value = '';
            timeInput.value = '';
            sendNotification(name, time); // Отправляем уведомление при добавлении нового лекарства
        }
    });

    window.confirmIntake = (index) => {
        const medicines = JSON.parse(localStorage.getItem('medicines')) || [];
        medicines[index].taken = true;
        saveMedicines(medicines);
        loadMedicines();
    };

    window.deleteMedicine = (index) => {
        const medicines = JSON.parse(localStorage.getItem('medicines')) || [];
        medicines.splice(index, 1);
        saveMedicines(medicines);
        loadMedicines();
    };

    // Периодическая проверка времени для отправки напоминаний
    const checkMedicines = () => {
        const medicines = JSON.parse(localStorage.getItem('medicines')) || [];
        const now = new Date();
        medicines.forEach(med => {
            if (!med.taken) {
                const [hours, minutes] = med.time.split(':').map(Number);
                const medTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
                if (now.getTime() >= medTime.getTime() && now.getTime() <= medTime.getTime() + 60000) { // Период в 1 минуту
                    sendNotification(med.name, med.time);
                }
            }
        });
    };

    loadMedicines();
    setInterval(checkMedicines, 60000); // Проверка каждые 60 секунд
});
