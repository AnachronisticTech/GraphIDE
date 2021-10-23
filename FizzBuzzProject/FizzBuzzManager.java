package FizzBuzzProject;
import java.util.List;
import java.util.ArrayList;

public class FizzBuzzManager {
    public FizzBuzzManager() {

    }

    public List<Integer> go(int from, int to) {
        List<Integer> list = new ArrayList<>();
        for(int i = from; i <= to; i++) {
            if(i % 3 == 0 && i % 5 == 0 && i % 15 != 0) {
                list.add(i);
            }
        }
        return list;
    }

    public String[] whatever(String args){
        System.out.println(":(");
        return null;
    }
}