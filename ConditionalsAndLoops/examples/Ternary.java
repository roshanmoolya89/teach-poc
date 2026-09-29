package ConditionalsAndLoops.examples;

public class Ternary {
    public static void main(String[] args) {
        int marks = 45;
        String result = (marks >= 40) ? "Pass" : "Fail";
        System.out.println("The student has: " + result);
    }
}
