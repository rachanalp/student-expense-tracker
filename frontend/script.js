const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const addExpenseButton = document.getElementById("addExpense");
const expenseList = document.getElementById("expenseList");

let totalSpent = 0;
const monthlyBudget = 10000;

addExpenseButton.addEventListener("click", function () {
    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;

    if (name === "" || amount <= 0 || category === "") {
        alert("Please fill all the fields.");
        return;
    }

    totalSpent += amount;

    const expenseItem = document.createElement("li");
    expenseItem.textContent = name + " - ₹" + amount + " - " + category;

    expenseList.appendChild(expenseItem);

    document.querySelector(".summary div:nth-child(2) p").textContent =
        "₹" + totalSpent;

    document.querySelector(".summary div:nth-child(3) p").textContent =
        "₹" + (monthlyBudget - totalSpent);

    expenseName.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "";
});