package ConditionalsAndLoops.examples.loops;

public class While {
    public static void main(String[] args) {
        // Example of a while loop: repeat until something changes
        // The condition is checked before each run, so the body may run zero times
        int number = 1234;
        int digits = 0;

        while (number > 0) {
            number = number / 10;
            digits++;
        }
        System.out.println("Digits: " + digits);
    }
}
