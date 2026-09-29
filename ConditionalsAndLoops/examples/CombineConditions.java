package ConditionalsAndLoops.examples;

public class CombineConditions {
    public static void main(String[] args) {
        int age = 25;
        boolean hasLicense = true;

        if (age >= 18 && hasLicense) {
            System.out.println("You can drive.");
        } else {
            System.out.println("You cannot drive.");
        }

        // Example of using OR condition
        int diceRoll = 5;
        if (diceRoll % 2 == 0 || diceRoll == 1) {
            System.out.println("You rolled an even number or a one.");
        } else {
            System.out.println("You rolled an odd number greater than one.");
        }
    }
}
