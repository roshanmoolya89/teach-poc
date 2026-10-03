package ConditionalsAndLoops.examples.loops;

public class DoWhile {
    public static void main(String[] args) {
        // Example of a do-while loop: run at least once
        // The condition is checked after the body
        int choice;
        do {
            System.out.println("Menu: 1. Play  2. Quit");
            choice = 2; // imagine this comes from user input
        } while (choice != 2);
    }
}
