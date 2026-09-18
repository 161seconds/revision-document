public class Practice {

    // Thử thách 1: Constructor Chaining
    public static class Vehicle {
        protected String brand;
        protected int speed;

        public Vehicle(String brand, int speed) {
            this.brand = brand;
            this.speed = speed;
        }
    }

    public static class Car extends Vehicle {
        private final int seats;

        public Car(String brand) {
            this(brand, 100, 4); // Chaining nội bộ
        }

        public Car(String brand, int speed, int seats) {
            super(brand, speed); // Chaining lên cha
            this.seats = seats;
        }

        public String getSummary() {
            return brand + "-" + speed + "-" + seats;
        }
    }

    // Thử thách 2: Đa hình runtime
    public abstract static class Payment {
        public abstract String process();
    }

    public static class CreditCardPayment extends Payment {
        @Override
        public String process() { return "CARD"; }
    }

    public static class CryptoPayment extends Payment {
        @Override
        public String process() { return "CRYPTO"; }
    }

    public static String challenge2_executePayment(Payment p) {
        return p.process();
    }

    // Thử thách 3: Interface Default Method & Diamond Problem resolution
    public interface LoggerA {
        default String log() { return "LOG_A"; }
    }

    public interface LoggerB {
        default String log() { return "LOG_B"; }
    }

    public static class CustomLogger implements LoggerA, LoggerB {
        @Override
        public String log() {
            return LoggerA.super.log() + "+" + LoggerB.super.log();
        }
    }

    // Thử thách 4: Enum với logic tìm kiếm theo mã code
    public enum StatusCode {
        OK(200), BAD_REQUEST(400), UNAUTHORIZED(401), NOT_FOUND(404);

        private final int code;
        StatusCode(int code) { this.code = code; }
        public int getCode() { return code; }

        public static StatusCode fromCode(int c) {
            for (StatusCode s : values()) {
                if (s.getCode() == c) return s;
            }
            return null;
        }
    }

    // Thử thách 5: Anonymous Class
    public interface Transformer {
        String transform(String input);
    }

    public static String challenge5_apply(Transformer t, String text) {
        return t.transform(text);
    }

    public static void main(String[] args) {
        System.out.println("Đang kiểm thử Module 02: Core OOP...");

        // Kiểm thử 1: Constructor Chaining
        Car c1 = new Car("Toyota");
        assert "Toyota-100-4".equals(c1.getSummary()) : "Thử thách 1 Thất bại với constructor 1 tham số!";
        Car c2 = new Car("BMW", 250, 2);
        assert "BMW-250-2".equals(c2.getSummary()) : "Thử thách 1 Thất bại với constructor đầy đủ!";
        System.out.println("✅ Thử thách 1: Constructor Chaining this() & super() - VƯỢT QUA");

        // Kiểm thử 2: Đa hình runtime
        Payment p1 = new CreditCardPayment();
        Payment p2 = new CryptoPayment();
        assert "CARD".equals(challenge2_executePayment(p1)) : "Thử thách 2 Thất bại với Card!";
        assert "CRYPTO".equals(challenge2_executePayment(p2)) : "Thử thách 2 Thất bại với Crypto!";
        System.out.println("✅ Thử thách 2: Đa hình runtime (Virtual Method Dispatch) - VƯỢT QUA");

        // Kiểm thử 3: Interface Default Methods Diamond Problem
        CustomLogger logger = new CustomLogger();
        assert "LOG_A+LOG_B".equals(logger.log()) : "Thử thách 3 Thất bại trong giải quyết xung đột Interface!";
        System.out.println("✅ Thử thách 3: Xung đột Default Method trong Interface - VƯỢT QUA");

        // Kiểm thử 4: Enum và tra cứu mã code
        assert StatusCode.fromCode(200) == StatusCode.OK : "Thử thách 4 Thất bại với 200!";
        assert StatusCode.fromCode(404) == StatusCode.NOT_FOUND : "Thử thách 4 Thất bại với 404!";
        assert StatusCode.fromCode(999) == null : "Thử thách 4 Thất bại với mã lạ!";
        System.out.println("✅ Thử thách 4: Enums với Field & Helper Methods - VƯỢT QUA");

        // Kiểm thử 5: Anonymous Class
        String transformed = challenge5_apply(new Transformer() {
            @Override
            public String transform(String input) {
                return input.toUpperCase() + "_MODIFIED";
            }
        }, "java");
        assert "JAVA_MODIFIED".equals(transformed) : "Thử thách 5 Thất bại với Anonymous Class!";
        System.out.println("✅ Thử thách 5: Khởi tạo và thực thi Anonymous Inner Class - VƯỢT QUA");

        System.out.println("\n🎉 5/5 THỬ THÁCH MODULE 02 ĐÃ VƯỢT QUA 100%!");
    }
}
