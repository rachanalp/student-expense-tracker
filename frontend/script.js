// ========================================
// ELEMENTS
// ========================================

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseDate = document.getElementById("expenseDate");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDescription = document.getElementById("expenseDescription");

const addExpenseButton = document.getElementById("addExpense");
const cancelEditButton = document.getElementById("cancelEdit");

const expenseList = document.getElementById("expenseList");

const searchExpense = document.getElementById("searchExpense");
const filterCategory = document.getElementById("filterCategory");
const sortExpenses = document.getElementById("sortExpenses");

const budgetDisplay = document.getElementById("budgetDisplay");
const totalSpentDisplay = document.getElementById("totalSpent");
const remainingBudgetDisplay = document.getElementById("remainingBudget");
const expenseCountDisplay = document.getElementById("expenseCount");

const budgetPercentage = document.getElementById("budgetPercentage");
const progressFill = document.getElementById("progressFill");

const changeBudgetButton = document.getElementById("changeBudget");


// ========================================
// DATA
// ========================================

// Load existing expenses
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Convert old expenses into the new format
expenses = expenses.map(function (expense, index) {

    return {
        id: expense.id || (Date.now() + index),
        name: expense.name || "",
        amount: Number(expense.amount) || 0,
        date: expense.date || "",
        category: expense.category || "Other",
        description: expense.description || ""
    };

});

// Save converted expenses
localStorage.setItem(
    "expenses",
    JSON.stringify(expenses)
);


// Monthly budget
let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 10000;


// Currently edited expense
let editingExpenseId = null;


// Chart
let expenseChart = null;


// ========================================
// SAVE DATA
// ========================================

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


function saveBudget() {

    localStorage.setItem(
        "monthlyBudget",
        monthlyBudget
    );

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {

    if (!dateString) {
        return "No date";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    let total = 0;

    expenses.forEach(function (expense) {

        total += Number(expense.amount);

    });


    const remaining =
        monthlyBudget - total;


    let percentage = 0;

    if (monthlyBudget > 0) {

        percentage =
            (total / monthlyBudget) * 100;

    }


    budgetDisplay.textContent =
        "₹" + monthlyBudget.toLocaleString("en-IN");


    totalSpentDisplay.textContent =
        "₹" + total.toLocaleString("en-IN");


    remainingBudgetDisplay.textContent =
        "₹" + remaining.toLocaleString("en-IN");


    expenseCountDisplay.textContent =
        expenses.length;


    const displayedPercentage =
        Math.min(Math.round(percentage), 100);


    budgetPercentage.textContent =
        displayedPercentage + "%";


    progressFill.style.width =
        displayedPercentage + "%";

}


// ========================================
// DISPLAY EXPENSES
// ========================================

function displayExpenses() {

    expenseList.innerHTML = "";


    // SEARCH TEXT

    const searchText =
        searchExpense.value.trim().toLowerCase();


    // CATEGORY

    const selectedCategory =
        filterCategory.value;


    // FILTER

    let filteredExpenses =
        expenses.filter(function (expense) {

            const name =
                expense.name.toLowerCase();

            const category =
                expense.category.toLowerCase();

            const description =
                (expense.description || "")
                    .toLowerCase();


            const matchesSearch =
                name.includes(searchText) ||
                category.includes(searchText) ||
                description.includes(searchText);


            const matchesCategory =
                selectedCategory === "all" ||
                expense.category === selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    // ========================================
    // SORT
    // ========================================

    const sortType =
        sortExpenses.value;


    if (sortType === "newest") {

        filteredExpenses.sort(function (a, b) {

            return (
                new Date(b.date) -
                new Date(a.date)
            );

        });

    }


    if (sortType === "oldest") {

        filteredExpenses.sort(function (a, b) {

            return (
                new Date(a.date) -
                new Date(b.date)
            );

        });

    }


    if (sortType === "highest") {

        filteredExpenses.sort(function (a, b) {

            return (
                Number(b.amount) -
                Number(a.amount)
            );

        });

    }


    if (sortType === "lowest") {

        filteredExpenses.sort(function (a, b) {

            return (
                Number(a.amount) -
                Number(b.amount)
            );

        });

    }


    // ========================================
    // NO RESULTS
    // ========================================

    if (filteredExpenses.length === 0) {

        const emptyMessage =
            document.createElement("li");

        emptyMessage.className =
            "empty-message";


        if (expenses.length === 0) {

            emptyMessage.textContent =
                "No expenses added yet.";

        } else {

            emptyMessage.textContent =
                "No matching expenses found.";

        }


        expenseList.appendChild(
            emptyMessage
        );

        return;

    }


    // ========================================
    // CREATE EXPENSE ITEMS
    // ========================================

    filteredExpenses.forEach(function (expense) {

        const listItem =
            document.createElement("li");

        listItem.className =
            "expense-item";


        // ------------------------------------
        // EXPENSE INFORMATION
        // ------------------------------------

        const info =
            document.createElement("div");

        info.className =
            "expense-info";


        const name =
            document.createElement("div");

        name.className =
            "expense-name";

        name.textContent =
            expense.name;


        const details =
            document.createElement("div");

        details.className =
            "expense-details";

        details.textContent =
            expense.category +
            " • ₹" +
            Number(expense.amount)
                .toLocaleString("en-IN") +
            " • " +
            formatDate(expense.date);


        info.appendChild(name);
        info.appendChild(details);


        // ------------------------------------
        // DESCRIPTION
        // ------------------------------------

        if (expense.description) {

            const description =
                document.createElement("div");

            description.className =
                "expense-description";

            description.textContent =
                expense.description;

            info.appendChild(description);

        }


        // ------------------------------------
        // BUTTONS
        // ------------------------------------

        const actions =
            document.createElement("div");

        actions.className =
            "expense-actions";


        // EDIT BUTTON

        const editButton =
            document.createElement("button");

        editButton.className =
            "edit-button";

        editButton.textContent =
            "Edit";


        editButton.addEventListener(
            "click",
            function () {

                startEditing(expense);

            }
        );


        // DELETE BUTTON

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-button";

        deleteButton.textContent =
            "Delete";


        deleteButton.addEventListener(
            "click",
            function () {

                deleteExpense(expense.id);

            }
        );


        actions.appendChild(editButton);
        actions.appendChild(deleteButton);


        // ------------------------------------
        // ADD TO LIST
        // ------------------------------------

        listItem.appendChild(info);
        listItem.appendChild(actions);

        expenseList.appendChild(listItem);

    });

}


// ========================================
// ADD EXPENSE
// ========================================

addExpenseButton.addEventListener(
    "click",
    function () {

        const name =
            expenseName.value.trim();

        const amount =
            Number(expenseAmount.value);

        const date =
            expenseDate.value;

        const category =
            expenseCategory.value;

        const description =
            expenseDescription.value.trim();


        // VALIDATION

        if (
            name === "" ||
            amount <= 0 ||
            date === "" ||
            category === ""
        ) {

            alert(
                "Please fill in the expense name, amount, date and category."
            );

            return;

        }


        // ====================================
        // UPDATE EXISTING EXPENSE
        // ====================================

        if (editingExpenseId !== null) {

            expenses =
                expenses.map(function (expense) {

                    if (
                        expense.id ===
                        editingExpenseId
                    ) {

                        return {

                            id: expense.id,

                            name: name,

                            amount: amount,

                            date: date,

                            category: category,

                            description: description

                        };

                    }

                    return expense;

                });


            editingExpenseId =
                null;


            addExpenseButton.textContent =
                "Add Expense";


            cancelEditButton.classList.add(
                "hidden"
            );

        }


        // ====================================
        // ADD NEW EXPENSE
        // ====================================

        else {

            const newExpense = {

                id: Date.now(),

                name: name,

                amount: amount,

                date: date,

                category: category,

                description: description

            };


            expenses.push(
                newExpense
            );

        }


        saveExpenses();

        clearForm();

        refreshApp();

    }
);


// ========================================
// EDIT EXPENSE
// ========================================

function startEditing(expense) {

    editingExpenseId =
        expense.id;


    expenseName.value =
        expense.name;


    expenseAmount.value =
        expense.amount;


    expenseDate.value =
        expense.date;


    expenseCategory.value =
        expense.category;


    expenseDescription.value =
        expense.description || "";


    addExpenseButton.textContent =
        "Save Changes";


    cancelEditButton.classList.remove(
        "hidden"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// CANCEL EDIT
// ========================================

cancelEditButton.addEventListener(
    "click",
    function () {

        editingExpenseId =
            null;


        clearForm();


        addExpenseButton.textContent =
            "Add Expense";


        cancelEditButton.classList.add(
            "hidden"
        );

    }
);


// ========================================
// DELETE EXPENSE
// ========================================

function deleteExpense(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmed) {
        return;
    }


    expenses =
        expenses.filter(
            function (expense) {

                return expense.id !== id;

            }
        );


    saveExpenses();

    refreshApp();

}


// ========================================
// CLEAR FORM
// ========================================

function clearForm() {

    expenseName.value = "";

    expenseAmount.value = "";

    expenseDate.value = "";

    expenseCategory.value = "";

    expenseDescription.value = "";

}


// ========================================
// CHANGE BUDGET
// ========================================

changeBudgetButton.addEventListener(
    "click",
    function () {

        const newBudget =
            prompt(
                "Enter your monthly budget:",
                monthlyBudget
            );


        if (
            newBudget === null ||
            newBudget.trim() === ""
        ) {

            return;

        }


        const budget =
            Number(newBudget);


        if (
            isNaN(budget) ||
            budget <= 0
        ) {

            alert(
                "Please enter a valid budget."
            );

            return;

        }


        monthlyBudget =
            budget;


        saveBudget();

        updateDashboard();

    }
);


// ========================================
// SEARCH
// ========================================

searchExpense.addEventListener(
    "input",
    function () {

        displayExpenses();

    }
);


// ========================================
// CATEGORY FILTER
// ========================================

filterCategory.addEventListener(
    "change",
    function () {

        displayExpenses();

    }
);


// ========================================
// SORT
// ========================================

sortExpenses.addEventListener(
    "change",
    function () {

        displayExpenses();

    }
);


// ========================================
// CHART
// ========================================

function updateChart() {

    const categoryTotals = {};


    expenses.forEach(
        function (expense) {

            const category =
                expense.category;


            if (
                categoryTotals[category]
            ) {

                categoryTotals[category] +=
                    Number(expense.amount);

            } else {

                categoryTotals[category] =
                    Number(expense.amount);

            }

        }
    );


    const categories =
        Object.keys(categoryTotals);


    const amounts =
        Object.values(categoryTotals);


    const canvas =
        document.getElementById(
            "expenseChart"
        );


    if (!canvas) {
        return;
    }


    if (expenseChart) {

        expenseChart.destroy();

    }


    expenseChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        categories,

                    datasets: [

                        {

                            label:
                                "Expenses",

                            data:
                                amounts

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false

                }

            }
        );

}


// ========================================
// REFRESH APP
// ========================================

function refreshApp() {

    displayExpenses();

    updateDashboard();

    updateChart();

}


// ========================================
// START APPLICATION
// ========================================

refreshApp();