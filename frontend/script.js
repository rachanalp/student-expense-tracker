const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const addExpenseButton = document.getElementById("addExpense");
const expenseList = document.getElementById("expenseList");

let totalSpent = 0;
const monthlyBudget = 10000;

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function displayExpenses() {
    expenseList.innerHTML = "";
    totalSpent = 0;

    if (expenses.length === 0) {
        expenseList.innerHTML = "<li>No expenses added yet.</li>";
        updateSummary();
        return;
    }

    expenses.forEach(function (expense) {
        totalSpent += expense.amount;

        const expenseItem = document.createElement("li");

        expenseItem.textContent =
            expense.name + " - ₹" + expense.amount + " - " + expense.category;

        expenseList.appendChild(expenseItem);
    });

    updateSummary();
}

function updateSummary() {
    document.querySelector(".summary div:nth-child(2) p").textContent =
        "₹" + totalSpent;

    document.querySelector(".summary div:nth-child(3) p").textContent =
        "₹" + (monthlyBudget - totalSpent);
}

addExpenseButton.addEventListener("click", function () {

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;

    if (name === "" || amount <= 0 || category === "") {
        alert("Please fill all the fields.");
        return;
    }

    const newExpense = {
        name: name,
        amount: amount,
        category: category
    };

    expenses.push(newExpense);

    localStorage.setItem("expenses", JSON.stringify(expenses));

    displayExpenses();

    expenseName.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "";
});

displayExpenses();