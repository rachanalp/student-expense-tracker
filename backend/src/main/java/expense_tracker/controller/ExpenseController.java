package expense_tracker.controller;

import expense_tracker.model.Expense;
import expense_tracker.model.User;
import expense_tracker.repository.ExpenseRepository;
import expense_tracker.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseController(
            ExpenseRepository expenseRepository,
            UserRepository userRepository) {

        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }


    // ==========================================
    // GET ALL EXPENSES FOR A USER
    // ==========================================

    @GetMapping("/user/{userId}")
    public List<Expense> getExpensesByUser(
            @PathVariable Long userId) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

        return expenseRepository.findByUser(user);
    }


    // ==========================================
    // ADD EXPENSE
    // ==========================================

    @PostMapping("/user/{userId}")
    public Expense addExpense(
            @PathVariable Long userId,
            @RequestBody Expense expense) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

        expense.setUser(user);

        return expenseRepository.save(expense);
    }


    // ==========================================
    // UPDATE EXPENSE
    // ==========================================

    @PutMapping("/user/{userId}/{expenseId}")
    public Expense updateExpense(
            @PathVariable Long userId,
            @PathVariable Long expenseId,
            @RequestBody Expense updatedExpense) {

        Expense expense =
                expenseRepository
                        .findById(expenseId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Expense not found"
                                )
                        );

        expense.setName(
                updatedExpense.getName()
        );

        expense.setAmount(
                updatedExpense.getAmount()
        );

        expense.setCategory(
                updatedExpense.getCategory()
        );

        expense.setDate(
                updatedExpense.getDate()
        );

        expense.setDescription(
                updatedExpense.getDescription()
        );

        return expenseRepository.save(expense);
    }


    // ==========================================
    // DELETE EXPENSE
    // ==========================================

    @DeleteMapping("/user/{userId}/{expenseId}")
    public void deleteExpense(
            @PathVariable Long userId,
            @PathVariable Long expenseId) {

        Expense expense =
                expenseRepository
                        .findById(expenseId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Expense not found"
                                )
                        );

        expenseRepository.delete(expense);
    }
}