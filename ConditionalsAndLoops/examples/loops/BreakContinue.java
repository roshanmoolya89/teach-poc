package ConditionalsAndLoops.examples.loops;

public class BreakContinue {
    public static void main(String[] args) {
        // Example of break and continue
        // continue jumps to the next iteration, break leaves the loop completely
        for (int i = 1; i <= 10; i++) {
            if (i == 3) continue;   // skip this iteration
            if (i == 6) break;      // exit the loop entirely
            System.out.println(i);
        }
    }
}
