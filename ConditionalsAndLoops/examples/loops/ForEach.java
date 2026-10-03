package ConditionalsAndLoops.examples.loops;

public class ForEach {
    public static void main(String[] args) {
        // Example of an enhanced for (for-each) loop
        // Reads every element of an array or collection, in order
        int[] scores = {80, 65, 92};

        for (int s : scores) {
            System.out.println(s);
        }
    }
}
