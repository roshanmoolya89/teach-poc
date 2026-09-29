# Conditional Statements and Loops (Java)

**Audience:** beginners | **Duration:** ~90 minutes | **Prerequisites:** variables, data types, operators

## Learning outcomes

By the end, learners can:

1. Make a program choose between paths using `if`, `else if`, `else`, `switch`, and the ternary operator
2. Repeat work using `for`, `while`, and `do-while`
3. Control loops with `break` and `continue`
4. Pick the right loop for a given problem

---

## Part 1: Conditional statements

A program normally runs top to bottom. A **conditional** lets it choose which lines to run based on a condition that evaluates to `true` or `false`.

### 1.1 `if`, `else if`, `else`

```java
public class GradeChecker {
    public static void main(String[] args) {
        int marks = 72;

        if (marks >= 90) {
            System.out.println("Grade A");
        } else if (marks >= 75) {
            System.out.println("Grade B");
        } else if (marks >= 60) {
            System.out.println("Grade C");
        } else {
            System.out.println("Needs improvement");
        }
    }
}
```

**Output:** `Grade C`

**Key points**

- Conditions are checked **top to bottom**; the first true one runs and the rest are skipped.
- Order matters. If `marks >= 60` came first, a score of 95 would wrongly print Grade C.
- The condition must be a `boolean`. Unlike some languages, `if (1)` is a compile error in Java.

### 1.2 Combining conditions

| Operator | Meaning                | Example                    |
| -------- | ---------------------- | -------------------------- |
| `&&`     | AND (both true)        | `age >= 18 && hasId`       |
| `\|\|`   | OR (at least one true) | `isWeekend \|\| isHoliday` |
| `!`      | NOT (flips the value)  | `!isLoggedIn`              |

```java
int age = 20;
boolean hasId = true;

if (age >= 18 && hasId) {
    System.out.println("Entry allowed");
}
```

> `&&` and `||` **short-circuit**: in `a && b`, if `a` is false, `b` is never evaluated. This is why `if (obj != null && obj.isValid())` is safe.

### 1.3 `switch`

Use `switch` when comparing one value against many fixed options.

```java
int day = 3;

switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Invalid day");
}
```

**Common mistake:** forgetting `break`. Without it, execution **falls through** into the next case.

Modern Java (14+) offers a cleaner form with no fall-through:

```java
String name = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    default -> "Invalid day";
};
```

### 1.4 Ternary operator

A one-line `if/else` that produces a value:

```java
String result = (marks >= 40) ? "Pass" : "Fail";
```

Use it for simple choices only. Nested ternaries are hard to read.

---

## Part 2: Loops

A **loop** repeats a block of code while a condition holds.

### 2.1 `for` loop: when you know how many times

```java
for (int i = 1; i <= 5; i++) {
    System.out.println("Count: " + i);
}
```

Anatomy: `for (initialization; condition; update)`

**How it runs:**

1. `int i = 1` runs once
2. `i <= 5` is checked; if false, the loop ends
3. The body runs
4. `i++` runs, then go back to step 2

### 2.2 `while` loop: when you repeat until something changes

```java
int number = 1234;
int digits = 0;

while (number > 0) {
    number = number / 10;
    digits++;
}
System.out.println("Digits: " + digits);
```

**Output:** `Digits: 4`

The condition is checked **before** each run, so the body may run zero times.

### 2.3 `do-while` loop: run at least once

```java
int choice;
do {
    System.out.println("Menu: 1. Play  2. Quit");
    choice = 2; // imagine this comes from user input
} while (choice != 2);
```

The condition is checked **after** the body, so it always runs at least once. Good for menus and input validation.

### 2.4 Enhanced `for` (for-each)

```java
int[] scores = {80, 65, 92};

for (int s : scores) {
    System.out.println(s);
}
```

Use it to read every element of an array or collection. Use the regular `for` when you need the index.

### 2.5 Choosing a loop

| Situation                            | Best choice |
| ------------------------------------ | ----------- |
| Fixed number of repetitions          | `for`       |
| Repeat until a condition changes     | `while`     |
| Must run at least once               | `do-while`  |
| Visit every item in an array or list | for-each    |

---

## Part 3: `break` and `continue`

```java
for (int i = 1; i <= 10; i++) {
    if (i == 3) continue;   // skip this iteration
    if (i == 6) break;      // exit the loop entirely
    System.out.println(i);
}
```

**Output:** `1 2 4 5`

- `continue` jumps to the next iteration.
- `break` leaves the loop completely.

---

## Part 4: Nested loops

A loop inside a loop. The inner loop runs fully for every single pass of the outer loop.

```java
for (int row = 1; row <= 4; row++) {
    for (int col = 1; col <= row; col++) {
        System.out.print("* ");
    }
    System.out.println();
}
```

**Output:**

```
*
* *
* * *
* * * *
```

---

## Part 5: Where this is used in practice

### 5.1 Real-world analogies

Every decision and repetition in daily life maps directly to these constructs.

| Real-world situation                                             | Construct             | Why it fits                                |
| ---------------------------------------------------------------- | --------------------- | ------------------------------------------ |
| Traffic light: red means stop, yellow means slow, green means go | `if / else if / else` | One outcome chosen from ordered conditions |
| ATM menu: press 1 for balance, 2 for withdrawal, 3 for exit      | `switch`              | One value compared against fixed options   |
| Airport security: allowed only if ticket is valid AND ID matches | `&&`                  | Every condition must hold                  |
| Discount applies if member OR order above 2000                   | `\|\|`                | Any one condition is enough                |
| Washing machine repeats the rinse cycle 3 times                  | `for`                 | Known number of repetitions                |
| Stirring soup until it thickens                                  | `while`               | Repeat until a condition changes           |
| Asking for a password again until it is correct                  | `do-while`            | Must ask at least once                     |
| A teacher marking every paper in a pile                          | for-each              | Visit every item once                      |
| Skipping a damaged item on a conveyor belt                       | `continue`            | Skip one item, carry on                    |
| Stopping the search once you find your keys                      | `break`               | Exit as soon as the goal is met            |

### 5.2 Practical code examples

**Login with limited attempts** (`do-while`, `break`, conditionals)

```java
String correctPin = "4321";
int attempts = 0;
boolean unlocked = false;

while (attempts < 3) {
    String entered = "4321"; // imagine this comes from user input
    if (entered.equals(correctPin)) {
        unlocked = true;
        break;               // stop asking once correct
    }
    attempts++;
    System.out.println("Wrong PIN. Attempts left: " + (3 - attempts));
}

System.out.println(unlocked ? "Access granted" : "Account locked");
```

Used in: banking apps, phone lock screens, any login form.

**Shopping cart total with discount** (for-each, `if`)

```java
double[] prices = {499.0, 1299.0, 250.0};
double total = 0;

for (double p : prices) {
    total += p;
}

if (total > 2000) {
    total = total * 0.90;    // 10% discount
} else if (total > 1000) {
    total = total * 0.95;    // 5% discount
}
System.out.println("Payable: " + total);
```

Used in: e-commerce checkout, billing systems, invoice generators.

**Find the first matching record** (`for`, `break`)

```java
String[] users = {"asha", "ravi", "meena", "john"};
String target = "meena";
int foundAt = -1;

for (int i = 0; i < users.length; i++) {
    if (users[i].equals(target)) {
        foundAt = i;
        break;               // no need to check the rest
    }
}
System.out.println(foundAt >= 0 ? "Found at index " + foundAt : "Not found");
```

Used in: search boxes, contact lookup, checking whether an email is already registered.

**Filtering valid data** (`for`, `continue`)

```java
int[] ages = {25, -1, 31, 0, 42};
int validCount = 0;

for (int age : ages) {
    if (age <= 0) continue;  // skip bad data
    validCount++;
}
System.out.println("Valid entries: " + validCount);
```

Used in: cleaning form submissions, processing CSV files, importing data.

**Menu-driven program** (`while`, `switch`)

```java
boolean running = true;
while (running) {
    int choice = 3; // imagine this comes from user input
    switch (choice) {
        case 1 -> System.out.println("Checking balance...");
        case 2 -> System.out.println("Withdrawing...");
        case 3 -> { System.out.println("Goodbye"); running = false; }
        default -> System.out.println("Invalid option");
    }
}
```

Used in: ATMs, command-line tools, kiosks, game menus.

### 5.3 Where these appear in web development

Since many learners will work on websites, here is the same idea in JavaScript:

```javascript
// Loop: build a list of product cards from data
const products = ["Laptop", "Phone", "Tablet"];
products.forEach((name) => {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="card">${name}</div>`,
  );
});

// Conditional: show or hide a message based on state
if (cartItems.length === 0) {
  emptyMessage.style.display = "block";
} else {
  emptyMessage.style.display = "none";
}
```

Every time a page shows a list of results, hides an empty section, or validates a form field, a loop or conditional is running behind it.

### 5.4 Class discussion prompts

- Pick an app you used today. Where could you spot a loop? Where a conditional?
- What would happen to the login example if the `break` were removed?
- Why would a `for` loop be a poor fit for "keep asking until the PIN is right"?

---

## Common mistakes to point out

| Mistake                     | Example                                       | Result                           |
| --------------------------- | --------------------------------------------- | -------------------------------- |
| Infinite loop               | `while (i < 5)` with no `i++`                 | Program never ends               |
| Off-by-one                  | `i <= arr.length` instead of `i < arr.length` | `ArrayIndexOutOfBoundsException` |
| `=` vs `==`                 | `if (x = 5)`                                  | Compile error in Java            |
| Missing `break` in `switch` |                                               | Unexpected fall-through          |
| Semicolon after `for(...)`  | `for (...);`                                  | Loop body is empty               |

---

## Practice exercises

**Level 1: Warm-up**

1. Print whether a number is positive, negative, or zero.
2. Print numbers 1 to 20 using a `for` loop.
3. Print the sum of numbers from 1 to 100.

**Level 2: Applying it** 4. Check if a year is a leap year (divisible by 4, but century years must be divisible by 400). 5. Print the multiplication table of any number. 6. Count how many digits a number has. 7. Print all even numbers between 1 and 50, skipping multiples of 10.

**Level 3: Thinking** 8. FizzBuzz: for 1 to 30, print "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for both, otherwise the number. 9. Check whether a number is prime. 10. Print this pattern:

```
    *
   ***
  *****
 *******
```

<details>
<summary>Solution: Exercise 4 (leap year)</summary>

```java
int year = 2024;
if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
    System.out.println("Leap year");
} else {
    System.out.println("Not a leap year");
}
```

</details>

<details>
<summary>Solution: Exercise 8 (FizzBuzz)</summary>

```java
for (int i = 1; i <= 30; i++) {
    if (i % 15 == 0)      System.out.println("FizzBuzz");
    else if (i % 3 == 0)  System.out.println("Fizz");
    else if (i % 5 == 0)  System.out.println("Buzz");
    else                  System.out.println(i);
}
```

Note the `% 15` check comes first. That is the ordering point from section 1.1.

</details>

---

## Cheat sheet

```java
// Conditionals
if (cond) { } else if (cond) { } else { }
switch (x) { case 1: ...; break; default: ... }
String r = cond ? "yes" : "no";

// Loops
for (int i = 0; i < n; i++) { }
while (cond) { }
do { } while (cond);
for (Type item : collection) { }

// Control
break;      // leave loop
continue;   // next iteration
```

## Teaching notes

- Have learners **predict the output before running** each example.
- Deliberately break one example (remove `i++`) and let them see the infinite loop and fix it.
- Trace a `for` loop on a whiteboard with a table of `i` values. It makes the flow concrete.


// Control
break;      // leave loop
continue;   // next iteration
```

## Teaching notes

- Have learners **predict the output before running** each example.
- Deliberately break one example (remove `i++`) and let them see the infinite loop and fix it.
- Trace a `for` loop on a whiteboard with a table of `i` values. It makes the flow concrete.
