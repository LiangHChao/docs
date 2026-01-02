---
slug: java-Proxy Pattern
title: 代理模式
authors: [ lianghchao ]
tags: [ java,Proxy Pattern ]
---
### 代理模式

### jdk动态代理
```java
@RestController
@SpringBootApplication
public class ProxyApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProxyApplication.class, args);
    }

    @Resource
    PaymentService paymentService;

    @GetMapping("test")
    public String index() {
        paymentService.processPayment(new BigDecimal("100"));
        return "Payment processed";
    }

    public interface PaymentService {
        void processPayment(BigDecimal amount);
    }
    // 实现类
    @Service("realPaymentService")
    public static class AlipayPaymentService implements PaymentService {
        @Override
        public void processPayment(BigDecimal amount) {
            System.out.println("支付宝支付: " + amount);
        }
    }

    @Configuration
    public static class JdkProxyFactory {
        @Bean
        @Primary
        public static PaymentService createProxy(@Qualifier("realPaymentService") PaymentService target) {
            return (PaymentService) Proxy.newProxyInstance(
                    target.getClass().getClassLoader(),
                    target.getClass().getInterfaces(),
                    new InvocationHandler() {
                        @Override
                        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                            System.out.println("【JDK代理】支付前日志记录");
                            Object result = method.invoke(target, args);
                            System.out.println("【JDK代理】支付后发送通知");
                            return result;
                        }
                    }
            );
        }
    }


}
```
### cglib动态代理
```java
@RestController
@SpringBootApplication
public class ProxyApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProxyApplication.class, args);
    }

    @Resource
    WechatPaymentService paymentService;

    @GetMapping("test")
    public String index() {
        paymentService.processPayment(new BigDecimal("100"));
        return "Payment processed";
    }

    // 没有实现接口的类
    public static class WechatPaymentService {
        public void processPayment(BigDecimal amount) {
            System.out.println("微信支付: " + amount);
        }

        // final 方法无法被代理
        public final void finalMethod() {
            System.out.println("这是final方法");
        }
    }

    // CGLIB 代理实现
    public static class CglibProxyFactory implements MethodInterceptor {
        private Object target;

        public CglibProxyFactory(Object target) {
            this.target = target;
        }

        public Object getProxy() {
            Enhancer enhancer = new Enhancer();
            enhancer.setSuperclass(target.getClass());
            enhancer.setCallback(this);
            return enhancer.create();
        }

        @Override
        public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
            System.out.println("【CGLIB代理】支付前日志记录");
            Object result = proxy.invokeSuper(obj, args);
            System.out.println("【CGLIB代理】支付后发送通知");
            return result;
        }
    }
    // 配置类：手动创建并注册代理 Bean
    @Configuration
    public static class ProxyConfig {

        @Bean
        @Primary
        public WechatPaymentService wechatPaymentService() {
            // 创建真实对象
            WechatPaymentService target = new WechatPaymentService();
            // 创建 CGLIB 代理
            return (WechatPaymentService) new CglibProxyFactory(target).getProxy();
        }
    }


}
```
## Spring AOP 代理模式

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```
```java
// 主启动类
@SpringBootApplication
@EnableAspectJAutoProxy // 启用 AspectJ 代理（Spring Boot 2.0+ 通常不需要显式添加）
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```
### 切面代码
```java
@Slf4j
@Aspect
@Component
public class LoggingAspect {
    // 基本语法结构
    //execution(modifiers-pattern? ret-type-pattern declaring-type-pattern? name-pattern(param-pattern) throws-pattern?)
    
    // 常用
    //execution(返回类型 包.类.方法(参数))

    // 切点：service 包下所有 public 方法
    @Pointcut("execution(public * com.example.service..*(..))")
    public void serviceMethods() {}
    
    // 匹配 WechatPaymentService 的 processPayment 方法（任意参数）
    @Pointcut("execution(* proxy.ProxyApplication.WechatPaymentService.processPayment(..))")
    public void wechatPaymentServiceProcessPayment() {}

    // 匹配所有返回 void 的方法
    @Pointcut("execution(void com.service.*.*(..))")
    public void voidMethods() {}

    // 匹配所有以 "pay" 开头的方法
    @Pointcut("execution(* com.service.*.pay*(..))")
    public void payMethods() {}

    // 匹配 WechatPaymentService 类中所有 public 方法
    @Pointcut("execution(public * proxy.ProxyApplication.WechatPaymentService.*(..))")
    public void wechatPaymentServiceMethods() {}

    // 匹配 service 包下所有类的所有方法
    @Pointcut("execution(* com.example.service..*(..))")
    public void serviceClassMethods() {}

    // 匹配所有加了 @Transactional 的方法
    @Pointcut("@annotation(org.springframework.transaction.annotation.Transactional)")
    public void transactionalMethods() {}

    // 匹配加了自定义注解的方法
    @Pointcut("@annotation(com.example.annotation.Loggable)")
    public void loggableMethods() {}

    // 匹配所有被 @RestController 标记的类中的方法
    @Pointcut("within(@org.springframework.stereotype.RestController *)")
    public void restControllerMethods() {}

    // 匹配 service 包下所有 save 或 update 开头的方法
    @Pointcut("execution(* com.example.service..save*(..)) || execution(* com.example.service..update*(..))")
    public void saveOrUpdateMethods() {}

    // 排除 toString, hashCode 等方法
    @Pointcut("execution(* com.example.service..*(..)) && !execution(* java.lang.Object.*(..))")
    public void serviceMethodsExcludingToString() {}

    // 环绕通知
    @Around("serviceMethods()")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long duration = System.currentTimeMillis() - start;
        System.out.println(joinPoint.getSignature() + " 执行耗时: " + duration + "ms");
        return result;
    }

    // 前置通知：只对支付方法
    @Before("execution(* com.example.service.*PaymentService.processPayment(..))")
    public void beforePayment(JoinPoint joinPoint) {
        System.out.println("【AOP】准备支付...");
    }
}
```