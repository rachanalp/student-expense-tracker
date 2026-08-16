// ==========================================
// STUDENT EXPENSE TRACKER
// COMPLETE SCRIPT.JS
// ==========================================


// ==========================================
// USER LOGIN
// ==========================================

const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
);

if (!loggedInUser) {
    window.location.href = "login.html";
}


// ==========================================
// WELCOME USER
// ==========================================

const welcomeUser =
    document.getElementById("welcomeUser");

if (welcomeUser && loggedInUser) {
    welcomeUser.textContent =
        "👋 Welcome, " + loggedInUser.name;
}


// ==========================================
// API
// ==========================================

const API_URL =
    "http://localhost:8080/api/expenses/user/" +
    loggedInUser.id;


// ==========================================
// FORM ELEMENTS
// ==========================================

const expenseName =
    document.getElementById("expenseName");

const expenseAmount =
    document.getElementById("expenseAmount");

const expenseDate =
    document.getElementById("expenseDate");

const expenseCategory =
    document.getElementById("expenseCategory");

const expenseDescription =
    document.getElementById("expenseDescription");

const addExpenseButton =
    document.getElementById("addExpense");

const cancelEditButton =
    document.getElementById("cancelEdit");

const expenseList =
    document.getElementById("expenseList");

const searchExpense =
    document.getElementById("searchExpense");

const filterCategory =
    document.getElementById("filterCategory");

const sortExpenses =
    document.getElementById("sortExpenses");


// ==========================================
// EDIT MODE
// ==========================================

let editingExpenseId = null;


// ==========================================
// BUDGET
// ==========================================

let monthlyBudget =
    Number(
        localStorage.getItem("monthlyBudget")
    ) || 10000;


// ==========================================
// EXPENSE DATA
// ==========================================

let expenses = [];

let expenseChart = null;

let monthlyExpenseChart = null;


// ==========================================
// LOAD EXPENSES
// ==========================================

async function loadExpenses() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "Failed to load expenses"
            );
        }

        expenses =
            await response.json();

        displayExpenses();

        updateSummary();

        updateChart();

        updateMonthlyExpenseChart();

    } catch (error) {

        console.error(
            "Error loading expenses:",
            error
        );

        alert(
            "Could not connect to the backend. Make sure Spring Boot is running."
        );
    }
}


// ==========================================
// DISPLAY EXPENSES
// ==========================================

function displayExpenses() {

    expenseList.innerHTML = "";


    const searchText =
        searchExpense
            ? searchExpense.value
                .toLowerCase()
                .trim()
            : "";


    const selectedCategory =
        filterCategory
            ? filterCategory.value
            : "all";


    const selectedSort =
        sortExpenses
            ? sortExpenses.value
            : "newest";


    // ======================================
    // FILTER
    // ======================================

    let filteredExpenses =
        expenses.filter(function (expense) {

            const name =
                (expense.name || "")
                    .toLowerCase();

            const category =
                (expense.category || "")
                    .toLowerCase();

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


    // ======================================
    // SORT
    // ======================================

    if (selectedSort === "newest") {

        filteredExpenses.sort(
            function (a, b) {

                return new Date(b.date) -
                    new Date(a.date);
            }
        );

    } else if (selectedSort === "oldest") {

        filteredExpenses.sort(
            function (a, b) {

                return new Date(a.date) -
                    new Date(b.date);
            }
        );

    } else if (selectedSort === "highest") {

        filteredExpenses.sort(
            function (a, b) {

                return Number(b.amount) -
                    Number(a.amount);
            }
        );

    } else if (selectedSort === "lowest") {

        filteredExpenses.sort(
            function (a, b) {

                return Number(a.amount) -
                    Number(b.amount);
            }
        );
    }


    // ======================================
    // NO RESULTS
    // ======================================

    if (filteredExpenses.length === 0) {

        if (expenses.length === 0) {

            expenseList.innerHTML =
                "<li>No expenses added yet.</li>";

        } else {

            expenseList.innerHTML =
                "<li>No matching expenses found.</li>";
        }

        return;
    }


    // ======================================
    // DISPLAY
    // ======================================

    filteredExpenses.forEach(
        function (expense) {

            const expenseItem =
                document.createElement("li");


            const info =
                document.createElement("div");

            info.className =
                "expense-info";


            const title =
                document.createElement("strong");

            title.textContent =
                expense.name;


            const amount =
                document.createElement("span");

            amount.textContent =
                "₹" + Number(expense.amount);


            const details =
                document.createElement("small");

            details.textContent =
                expense.category +
                " • " +
                expense.date;


            const description =
                document.createElement("small");

            description.textContent =
                expense.description ||
                "No description";


            info.appendChild(title);
            info.appendChild(amount);
            info.appendChild(details);
            info.appendChild(description);


            // ==================================
            // EDIT
            // ==================================

            const editButton =
                document.createElement("button");

            editButton.textContent =
                "Edit";

            editButton.addEventListener(
                "click",
                function () {

                    editExpense(expense);
                }
            );


            // ==================================
            // DELETE
            // ==================================

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent =
                "Delete";

            deleteButton.addEventListener(
                "click",
                function () {

                    deleteExpense(
                        expense.id
                    );
                }
            );


            expenseItem.appendChild(info);

            expenseItem.appendChild(
                editButton
            );

            expenseItem.appendChild(
                deleteButton
            );


            expenseList.appendChild(
                expenseItem
            );
        }
    );
}


// ==========================================
// SEARCH
// ==========================================

if (searchExpense) {

    searchExpense.addEventListener(
        "input",
        displayExpenses
    );
}


// ==========================================
// FILTER
// ==========================================

if (filterCategory) {

    filterCategory.addEventListener(
        "change",
        displayExpenses
    );
}


// ==========================================
// SORT
// ==========================================

if (sortExpenses) {

    sortExpenses.addEventListener(
        "change",
        displayExpenses
    );
}


// ==========================================
// ADD / UPDATE EXPENSE
// ==========================================

if (addExpenseButton) {

    addExpenseButton.addEventListener(
        "click",
        async function () {

            const name =
                expenseName.value.trim();

            const amount =
                Number(expenseAmount.value);

            const category =
                expenseCategory.value;

            const date =
                expenseDate.value;

            const description =
                expenseDescription
                    ? expenseDescription.value.trim()
                    : "";


            // ==================================
            // VALIDATION
            // ==================================

            if (
                name === "" ||
                amount <= 0 ||
                category === "" ||
                date === ""
            ) {

                alert(
                    "Please fill all the required fields."
                );

                return;
            }


            const expenseData = {

                name: name,

                amount: amount,

                category: category,

                date: date,

                description: description
            };


            try {

                // ==================================
                // UPDATE
                // ==================================

                if (editingExpenseId !== null) {

                    const response =
                        await fetch(
                            API_URL +
                            "/" +
                            editingExpenseId,
                            {

                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        expenseData
                                    )
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Failed to update expense"
                        );
                    }


                    const updatedExpense =
                        await response.json();


                    expenses =
                        expenses.map(
                            function (item) {

                                return item.id ===
                                    editingExpenseId
                                    ? updatedExpense
                                    : item;
                            }
                        );


                    alert(
                        "Expense updated successfully!"
                    );


                }

                // ==================================
                // ADD
                // ==================================

                else {

                    const response =
                        await fetch(
                            API_URL,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        expenseData
                                    )
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Failed to save expense"
                        );
                    }


                    const savedExpense =
                        await response.json();


                    expenses.push(
                        savedExpense
                    );


                    alert(
                        "Expense added successfully!"
                    );
                }


                // ==================================
                // RESET
                // ==================================

                resetExpenseForm();


                displayExpenses();

                updateSummary();

                updateChart();

                updateMonthlyExpenseChart();


            } catch (error) {

                console.error(
                    "Error:",
                    error
                );

                alert(
                    "Could not save the expense. Check that the backend is running."
                );
            }
        }
    );
}


// ==========================================
// EDIT EXPENSE
// ==========================================

function editExpense(expense) {

    editingExpenseId =
        expense.id;


    expenseName.value =
        expense.name || "";

    expenseAmount.value =
        expense.amount || "";

    expenseDate.value =
        expense.date || "";

    expenseCategory.value =
        expense.category || "";


    if (expenseDescription) {

        expenseDescription.value =
            expense.description || "";
    }


    addExpenseButton.textContent =
        "Update Expense";


    if (cancelEditButton) {

        cancelEditButton
            .classList
            .remove("hidden");
    }


    const formTitle =
        document.getElementById(
            "formTitle"
        );


    if (formTitle) {

        formTitle.textContent =
            "Edit Expense";
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// CANCEL EDIT
// ==========================================

if (cancelEditButton) {

    cancelEditButton.addEventListener(
        "click",
        resetExpenseForm
    );
}


// ==========================================
// RESET FORM
// ==========================================

function resetExpenseForm() {

    editingExpenseId = null;


    expenseName.value = "";

    expenseAmount.value = "";

    expenseCategory.value = "";

    expenseDate.value = "";


    if (expenseDescription) {

        expenseDescription.value = "";
    }


    addExpenseButton.textContent =
        "Add Expense";


    if (cancelEditButton) {

        cancelEditButton
            .classList
            .add("hidden");
    }


    const formTitle =
        document.getElementById(
            "formTitle"
        );


    if (formTitle) {

        formTitle.textContent =
            "Add Expense";
    }
}


// ==========================================
// DELETE EXPENSE
// ==========================================

async function deleteExpense(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                API_URL + "/" + id,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete expense"
            );
        }


        expenses =
            expenses.filter(
                function (expense) {

                    return expense.id !== id;
                }
            );


        displayExpenses();

        updateSummary();

        updateChart();

        updateMonthlyExpenseChart();


        alert(
            "Expense deleted successfully!"
        );


    } catch (error) {

        console.error(
            "Error deleting expense:",
            error
        );

        alert(
            "Could not delete expense."
        );
    }
}


// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {

    let totalSpent = 0;


    expenses.forEach(
        function (expense) {

            totalSpent +=
                Number(expense.amount);
        }
    );


    const remainingBudget =
        monthlyBudget -
        totalSpent;


    const totalElement =
        document.getElementById(
            "totalSpent"
        );

    const remainingElement =
        document.getElementById(
            "remainingBudget"
        );

    const expenseCount =
        document.getElementById(
            "expenseCount"
        );

    const budgetDisplay =
        document.getElementById(
            "budgetDisplay"
        );

    const budgetPercentage =
        document.getElementById(
            "budgetPercentage"
        );

    const progressFill =
        document.getElementById(
            "progressFill"
        );

    const averageExpense =
        document.getElementById(
            "averageExpense"
        );

    const topCategory =
        document.getElementById(
            "topCategory"
        );


    // ======================================
    // BASIC SUMMARY
    // ======================================

    if (totalElement) {

        totalElement.textContent =
            "₹" + totalSpent;
    }


    if (remainingElement) {

        remainingElement.textContent =
            "₹" + remainingBudget;
    }


    if (expenseCount) {

        expenseCount.textContent =
            expenses.length;
    }


    if (budgetDisplay) {

        budgetDisplay.textContent =
            "₹" + monthlyBudget;
    }


    // ======================================
    // BUDGET USAGE
    // ======================================

    let percentage = 0;


    if (monthlyBudget > 0) {

        percentage =
            (totalSpent /
                monthlyBudget) *
            100;
    }


    if (progressFill) {

        progressFill.style.width =
            Math.min(
                percentage,
                100
            ) + "%";
    }


    if (budgetPercentage) {

        if (percentage >= 100) {

            budgetPercentage.textContent =
                "⚠️ Budget exceeded! " +
                Math.round(percentage) +
                "%";

        } else if (percentage >= 70) {

            budgetPercentage.textContent =
                "⚠️ " +
                Math.round(percentage) +
                "% used";

        } else {

            budgetPercentage.textContent =
                Math.round(percentage) +
                "% used";
        }
    }


    // ======================================
    // AVERAGE EXPENSE
    // ======================================

    let average = 0;


    if (expenses.length > 0) {

        average =
            totalSpent /
            expenses.length;
    }


    if (averageExpense) {

        averageExpense.textContent =
            "₹" +
            Math.round(average);
    }


    // ======================================
    // TOP CATEGORY
    // ======================================

    const categoryTotals = {};


    expenses.forEach(
        function (expense) {

            const category =
                expense.category ||
                "Other";

            const amount =
                Number(expense.amount);


            if (categoryTotals[category]) {

                categoryTotals[category] +=
                    amount;

            } else {

                categoryTotals[category] =
                    amount;
            }
        }
    );


    let highestCategory =
        "None";

    let highestAmount = 0;


    Object.keys(
        categoryTotals
    ).forEach(
        function (category) {

            if (
                categoryTotals[category] >
                highestAmount
            ) {

                highestAmount =
                    categoryTotals[category];

                highestCategory =
                    category;
            }
        }
    );


    if (topCategory) {

        topCategory.textContent =
            highestCategory;
    }
}


// ==========================================
// CATEGORY CHART
// ==========================================

function updateChart() {

    const canvas =
        document.getElementById(
            "expenseChart"
        );


    if (!canvas) {
        return;
    }


    const categoryTotals = {};


    expenses.forEach(
        function (expense) {

            const category =
                expense.category ||
                "Other";

            const amount =
                Number(expense.amount);


            if (categoryTotals[category]) {

                categoryTotals[category] +=
                    amount;

            } else {

                categoryTotals[category] =
                    amount;
            }
        }
    );


    const categories =
        Object.keys(
            categoryTotals
        );

    const amounts =
        Object.values(
            categoryTotals
        );


    if (expenseChart) {

        expenseChart.destroy();
    }


    expenseChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: categories,

                    datasets: [
                        {

                            label:
                                "Amount Spent (₹)",

                            data: amounts
                        }
                    ]
                },

                options: {

                    responsive: true,

                    scales: {

                        y: {

                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


// ==========================================
// MONTHLY CHART
// ==========================================

function updateMonthlyExpenseChart() {

    const canvas =
        document.getElementById(
            "monthlyExpenseChart"
        );


    if (!canvas) {
        return;
    }


    const monthlyTotals = {};


    expenses.forEach(
        function (expense) {

            if (!expense.date) {
                return;
            }


            const month =
                expense.date.substring(
                    0,
                    7
                );


            const amount =
                Number(expense.amount);


            if (monthlyTotals[month]) {

                monthlyTotals[month] +=
                    amount;

            } else {

                monthlyTotals[month] =
                    amount;
            }
        }
    );


    const months =
        Object.keys(
            monthlyTotals
        ).sort();


    const amounts =
        months.map(
            function (month) {

                return monthlyTotals[month];
            }
        );


    if (monthlyExpenseChart) {

        monthlyExpenseChart.destroy();
    }


    monthlyExpenseChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: months,

                    datasets: [
                        {

                            label:
                                "Monthly Spending (₹)",

                            data: amounts,

                            tension: 0.3
                        }
                    ]
                },

                options: {

                    responsive: true,

                    scales: {

                        y: {

                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


// ==========================================
// CHANGE BUDGET
// ==========================================

const changeBudgetButton =
    document.getElementById(
        "changeBudget"
    );


if (changeBudgetButton) {

    changeBudgetButton.addEventListener(
        "click",
        function () {

            const newBudget =
                prompt(
                    "Enter your monthly budget:",
                    monthlyBudget
                );


            if (newBudget === null) {
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


            localStorage.setItem(
                "monthlyBudget",
                monthlyBudget
            );


            updateSummary();


            alert(
                "Budget updated successfully!"
            );
        }
    );
}


// ==========================================
// LOGOUT
// ==========================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "loggedInUser"
            );

            window.location.href =
                "login.html";
        }
    );
}


// ==========================================
// START APPLICATION
// ==========================================

loadExpenses();