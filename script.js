let users = [];
let distributionHistory = [];
let roundCounter = 1;

const FIXED_SUPPORT_AMOUNT = 100000;

function byPriority(a, b) {
    if (Number(b.age) !== Number(a.age)) {
        return Number(b.age) - Number(a.age);
    }
    return Number(a.income) - Number(b.income);
}

function showSection(showId) {
    const sectionIds = [
        "mainContainer",
        "userListContainer",
        "budgetContainer",
        "distributionContainer",
        "reportContainer"
    ];

    sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) {
            return;
        }
        el.style.display = id === showId ? "block" : "none";
    });
}

function addToList(name, idCard, age, income, targetGroup) {
    users.push({
        name: String(name).trim(),
        idCard: String(idCard).trim(),
        age: Number(age),
        income: Number(income),
        targetGroup
    });
}

function displayUserList() {
    const userList = document.getElementById("userList");
    if (!userList) {
        return;
    }

    userList.innerHTML = "";
    users.sort(byPriority);

    users.forEach((user, index) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.innerHTML = `${index + 1}. ${user.name} | บัตร: ${user.idCard} | อายุ: ${user.age} | รายได้: ${user.income} | กลุ่ม: ${user.targetGroup}
            <button class="btn btn-warning btn-sm float-end" onclick="editUser(${index})">แก้ไข</button>
            <button class="btn btn-danger btn-sm float-end" onclick="deleteUser(${index})">ลบ</button>`;
        userList.appendChild(listItem);
    });
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAge() {
    return getRandomNumber(20, 80);
}

function getRandomIncome() {
    return getRandomNumber(5000, 30000);
}

function getRandomGroup(age, income) {
    if (age >= 60) {
        return "ผู้สูงอายุ";
    }
    if (income < 10000) {
        return "ผู้มีรายได้น้อย";
    }
    return "เกษตรกร";
}

function getRandomName() {
    const firstNames = ["สมชาย", "สมหญิง", "วิชัย", "พรทิพย์", "จักรพงษ์", "นภา", "อาทิตย์"];
    const lastNames = ["สุขใจ", "ใจดี", "ทองแท้", "มณีรัตน์", "ชัยชนะ", "บุญมา"];
    return `${firstNames[getRandomNumber(0, firstNames.length - 1)]} ${lastNames[getRandomNumber(0, lastNames.length - 1)]}`;
}

function getRandomID() {
    return String(getRandomNumber(1000000000000, 9999999999999));
}

function getGroupCounts() {
    return users.reduce(
        (acc, user) => {
            if (user.targetGroup === "ผู้สูงอายุ") {
                acc.elderly += 1;
            } else if (user.targetGroup === "ผู้มีรายได้น้อย") {
                acc.lowIncome += 1;
            } else if (user.targetGroup === "เกษตรกร") {
                acc.farmer += 1;
            }
            return acc;
        },
        { elderly: 0, lowIncome: 0, farmer: 0 }
    );
}

function readBudgetInputs() {
    const totalBudget = Number(document.getElementById("totalBudget")?.value);
    const elderlyPercentage = Number(document.getElementById("elderlyPercentage")?.value);
    const lowIncomePercentage = Number(document.getElementById("lowIncomePercentage")?.value);
    const farmerPercentage = Number(document.getElementById("farmerPercentage")?.value);

    if (
        Number.isNaN(totalBudget) ||
        Number.isNaN(elderlyPercentage) ||
        Number.isNaN(lowIncomePercentage) ||
        Number.isNaN(farmerPercentage)
    ) {
        alert("กรุณากรอกข้อมูลงบประมาณให้ครบถ้วน");
        return null;
    }

    if (totalBudget < 0 || elderlyPercentage < 0 || lowIncomePercentage < 0 || farmerPercentage < 0) {
        alert("งบประมาณและสัดส่วนต้องไม่ติดลบ");
        return null;
    }

    if (elderlyPercentage + lowIncomePercentage + farmerPercentage !== 100) {
        alert("สัดส่วนทั้งหมดต้องรวมกันเป็น 100%");
        return null;
    }

    return {
        totalBudget,
        elderlyPercentage,
        lowIncomePercentage,
        farmerPercentage
    };
}

function calculateBudgetDistribution(totalBudget, elderlyPercentage, lowIncomePercentage, farmerPercentage) {
    const groupCounts = getGroupCounts();

    const elderlyBudget = (totalBudget * elderlyPercentage) / 100;
    const lowIncomeBudget = (totalBudget * lowIncomePercentage) / 100;
    const farmerBudget = (totalBudget * farmerPercentage) / 100;

    return {
        elderlyBudget,
        lowIncomeBudget,
        farmerBudget,
        elderlyPerPerson: groupCounts.elderly > 0 ? elderlyBudget / groupCounts.elderly : 0,
        lowIncomePerPerson: groupCounts.lowIncome > 0 ? lowIncomeBudget / groupCounts.lowIncome : 0,
        farmerPerPerson: groupCounts.farmer > 0 ? farmerBudget / groupCounts.farmer : 0,
        groupCounts
    };
}

function renderBudgetResult(result) {
    const budgetResult = document.getElementById("budgetResult");
    const budgetResultList = document.getElementById("budgetResultList");
    if (!budgetResult || !budgetResultList) {
        return;
    }

    budgetResultList.innerHTML = `
        <li class="list-group-item">กลุ่มผู้สูงอายุ: ${result.elderlyBudget.toFixed(2)} บาท (${result.groupCounts.elderly} คน, เฉลี่ย ${result.elderlyPerPerson.toFixed(2)} บาท/คน)</li>
        <li class="list-group-item">กลุ่มผู้มีรายได้น้อย: ${result.lowIncomeBudget.toFixed(2)} บาท (${result.groupCounts.lowIncome} คน, เฉลี่ย ${result.lowIncomePerPerson.toFixed(2)} บาท/คน)</li>
        <li class="list-group-item">กลุ่มเกษตรกร: ${result.farmerBudget.toFixed(2)} บาท (${result.groupCounts.farmer} คน, เฉลี่ย ${result.farmerPerPerson.toFixed(2)} บาท/คน)</li>
    `;
    budgetResult.style.display = "block";
}

function calculateDistributionRound() {
    const budgetInputs = readBudgetInputs();
    let remaining = budgetInputs ? budgetInputs.totalBudget : 0;

    const orderedUsers = [...users].sort(byPriority);
    const roundData = orderedUsers.map((user) => {
        let status = "รอคิว";
        let amount = 0;

        if (remaining >= FIXED_SUPPORT_AMOUNT) {
            amount = FIXED_SUPPORT_AMOUNT;
            remaining -= FIXED_SUPPORT_AMOUNT;
            status = "ได้รับแล้ว";
        }

        return {
            name: user.name,
            idCard: user.idCard,
            age: user.age,
            income: user.income,
            targetGroup: user.targetGroup,
            amount,
            status,
            round: roundCounter
        };
    });

    return {
        roundData,
        distributedAmount: roundData.reduce((sum, x) => sum + x.amount, 0),
        remainingBudget: remaining
    };
}

function displayDistributionStats() {
    const distributionList = document.getElementById("distributionList");
    const distributedAmountEl = document.getElementById("distributedAmount");
    const remainingBudgetEl = document.getElementById("remainingBudget");
    const roundCounterDisplay = document.getElementById("roundCounterDisplay");

    if (!distributionList || !distributedAmountEl || !remainingBudgetEl || !roundCounterDisplay) {
        return;
    }

    distributionList.innerHTML = "";

    if (users.length === 0) {
        distributedAmountEl.innerText = "0";
        remainingBudgetEl.innerText = "0";
        roundCounterDisplay.innerText = "0";
        return;
    }

    const result = calculateDistributionRound();
    distributionHistory.push(result.roundData);

    result.roundData.forEach((entry) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");

        const badgeClass =
            entry.status === "ได้รับแล้ว"
                ? "success"
                : "warning";

        listItem.innerHTML = `${entry.name} | อายุ: ${entry.age} | รายได้: ${entry.income} | กลุ่ม: ${entry.targetGroup}
            <span class="badge bg-${badgeClass}">${entry.status}${entry.amount > 0 ? ` (${entry.amount.toLocaleString()} บาท)` : ""}</span>`;
        distributionList.appendChild(listItem);
    });

    distributedAmountEl.innerText = result.distributedAmount.toLocaleString();
    remainingBudgetEl.innerText = result.remainingBudget.toLocaleString();
    roundCounterDisplay.innerText = String(roundCounter);

    roundCounter += 1;
}

function generateReport() {
    const reportList = document.getElementById("reportList");
    const reportDistributedAmount = document.getElementById("reportDistributedAmount");
    const reportRemainingBudget = document.getElementById("reportRemainingBudget");
    const tableBody = document.getElementById("TableBody") || document.getElementById("reportTableBody");

    if (!reportList || !reportDistributedAmount || !reportRemainingBudget) {
        return;
    }

    reportList.innerHTML = "";
    if (tableBody) {
        tableBody.innerHTML = "";
    }

    if (users.length === 0) {
        reportDistributedAmount.innerText = "0";
        reportRemainingBudget.innerText = "0";
        return;
    }

    const latestRound = distributionHistory.length > 0
        ? distributionHistory[distributionHistory.length - 1]
        : calculateDistributionRound().roundData;

    const summary = {
        "ผู้สูงอายุ": { count: 0, amount: 0 },
        "ผู้มีรายได้น้อย": { count: 0, amount: 0 },
        "เกษตรกร": { count: 0, amount: 0 }
    };

    latestRound.forEach((entry) => {
        if (entry.amount > 0) {
            summary[entry.targetGroup].count += 1;
            summary[entry.targetGroup].amount += entry.amount;
        }
    });

    const distributed = latestRound.reduce((sum, entry) => sum + entry.amount, 0);
    const budgetInputs = readBudgetInputs();
    const totalBudget = budgetInputs ? budgetInputs.totalBudget : 0;
    const remaining = Math.max(totalBudget - distributed, 0);

    reportList.innerHTML = `
        <li class="list-group-item"><strong>ผู้สูงอายุ:</strong> ${summary["ผู้สูงอายุ"].count} คน | ใช้ไป: ${summary["ผู้สูงอายุ"].amount.toLocaleString()} บาท</li>
        <li class="list-group-item"><strong>ผู้มีรายได้น้อย:</strong> ${summary["ผู้มีรายได้น้อย"].count} คน | ใช้ไป: ${summary["ผู้มีรายได้น้อย"].amount.toLocaleString()} บาท</li>
        <li class="list-group-item"><strong>เกษตรกร:</strong> ${summary["เกษตรกร"].count} คน | ใช้ไป: ${summary["เกษตรกร"].amount.toLocaleString()} บาท</li>
    `;

    if (tableBody) {
        ["ผู้สูงอายุ", "ผู้มีรายได้น้อย", "เกษตรกร"].forEach((groupName) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${groupName}</td>
                <td>${summary[groupName].count}</td>
                <td>${summary[groupName].amount.toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    reportDistributedAmount.innerText = distributed.toLocaleString();
    reportRemainingBudget.innerText = remaining.toLocaleString();
}

function editUser(index) {
    const user = users[index];
    if (!user) {
        return;
    }

    document.getElementById("name").value = user.name;
    document.getElementById("idCard").value = user.idCard;
    document.getElementById("age").value = user.age;
    document.getElementById("income").value = user.income;
    document.getElementById("targetGroup").value = user.targetGroup;

    users.splice(index, 1);
    displayUserList();
    showSection("mainContainer");
}

function deleteUser(index) {
    users.splice(index, 1);
    displayUserList();
}

window.editUser = editUser;
window.deleteUser = deleteUser;

document.getElementById("manualForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const idCard = document.getElementById("idCard").value;
    const age = Number(document.getElementById("age").value);
    const income = Number(document.getElementById("income").value);
    const targetGroup = document.getElementById("targetGroup").value;

    if (!name || !idCard || Number.isNaN(age) || Number.isNaN(income) || !targetGroup) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    addToList(name, idCard, age, income, targetGroup);
    event.target.reset();
});

document.getElementById("showList")?.addEventListener("click", () => {
    displayUserList();
    showSection("userListContainer");
});

document.getElementById("backButton")?.addEventListener("click", () => {
    showSection("mainContainer");
});

document.getElementById("showBudgetForm")?.addEventListener("click", () => {
    showSection("budgetContainer");
});

document.getElementById("backToMainFromBudget")?.addEventListener("click", () => {
    showSection("mainContainer");
});

document.getElementById("calculateBudget")?.addEventListener("click", () => {
    const inputs = readBudgetInputs();
    if (!inputs) {
        return;
    }
    const result = calculateBudgetDistribution(
        inputs.totalBudget,
        inputs.elderlyPercentage,
        inputs.lowIncomePercentage,
        inputs.farmerPercentage
    );
    renderBudgetResult(result);
});

document.getElementById("deleteAllButton")?.addEventListener("click", () => {
    if (!confirm("คุณต้องการลบข้อมูลทั้งหมดหรือไม่?")) {
        return;
    }
    users = [];
    displayUserList();
});

document.getElementById("randomBulkData")?.addEventListener("click", () => {
    const count = Number(document.getElementById("randomCount").value);
    if (Number.isNaN(count) || count <= 0) {
        alert("กรุณากรอกจำนวนที่ต้องการสุ่มให้ถูกต้อง!");
        return;
    }

    for (let i = 0; i < count; i += 1) {
        const age = getRandomAge();
        const income = getRandomIncome();
        const targetGroup = getRandomGroup(age, income);
        addToList(getRandomName(), getRandomID(), age, income, targetGroup);
    }
});

document.getElementById("showDistribution")?.addEventListener("click", () => {
    displayDistributionStats();
    showSection("distributionContainer");
});

document.getElementById("backToMain")?.addEventListener("click", () => {
    showSection("mainContainer");
});

document.getElementById("showReport")?.addEventListener("click", () => {
    generateReport();
    showSection("reportContainer");
});

document.getElementById("backToMainFromReport")?.addEventListener("click", () => {
    showSection("mainContainer");
});