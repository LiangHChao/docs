---
slug: java-design patterns-spring boot
title: spring boot中常见的设计模式
authors: [ lianghchao ]
tags: [ java,file ]
---


### Spring Boot 常见设计模式应用详解
Spring Boot（基于 Spring Framework）在底层架构和日常开发中广泛运用了多种经典设计模式。这些模式是其高内聚、低耦合、可扩展、易维护特性的核心支撑。本文系统梳理 Spring Boot 中最常见且关键的 10 种设计模式，结合原理说明与代码示例，帮助开发者深入理解框架本质并写出更优雅的代码。

### 1. 工厂模式（Factory Pattern）
#### 📌 应用场景
- Bean 的创建与管理
- 解耦对象实例化逻辑，由容器统一负责

#### 🔧 核心实现
- BeanFactory：基础工厂接口
- ApplicationContext：高级工厂（继承 BeanFactory），支持 AOP、事件、国际化等
#### 💡 示例
```java
// 开发者无需手动 new，由 Spring 工厂创建
@Service
public class UserService { }

// 获取 Bean
UserService user = applicationContext.getBean(UserService.class);
```
#### ✅ 优势
- 隐藏复杂创建逻辑（如依赖注入、代理生成）
- 支持单例、原型等多种作用域
- 便于单元测试（可替换 mock 实现）
### 2. 单例模式（Singleton Pattern）
#### 📌 应用场景
- Spring 默认 Bean 作用域
- 确保全局唯一实例（节省内存资源）

#### 🔧 核心实现
```text
容器启动时预初始化单例 Bean
存储于 ConcurrentHashMap<String, Object> singletonObjects
线程安全由双重检查锁 + volatile 保证

```
#### 💡 示例
```java
@Service
public class OrderService {
// 整个应用生命周期内仅有一个实例
}
```
#### ⚠️ 注意事项
- 不要在单例 Bean 中保存请求级状态（线程不安全！）
- 如需多例，使用 @Scope("prototype")
### 3. 代理模式（Proxy Pattern）
#### 📌 应用场景
- AOP 功能实现（事务、缓存、安全、日志等）
- 在不修改目标类的前提下增强行为

#### 🔧 核心实现

| 代理类型 | 触发条件 | 特点 |
|---------|---------|------|
| JDK 动态代理 | 目标类实现接口 | 基于反射，性能较好 |
| CGLIB 代理 | 目标类未实现接口 | 生成子类，可代理 final 方法 |
#### 💡 示例
```java
@Service
public class PaymentService {

   @Transactional // Spring 生成代理，在方法前后添加事务控制
   public void pay() {
   // 业务逻辑
   }
}
```
#### 🔍 验证代理
- 注入时打印类型：System.out.println(paymentService.getClass())
- 输出类似：class com.example.PaymentService$$EnhancerBySpringCGLIB$$xxx
### 4. 模板方法模式（Template Method Pattern）
#### 📌 应用场景
- 封装固定流程，开放可变步骤
- 避免重复编写样板代码（如 JDBC、HTTP 调用）

#### 🔧 核心实现
- 抽象父类定义算法骨架
- 子类/回调函数实现具体步骤
#### 💡 示例：RedisTemplate
```java
// RedisTemplate.java (简化版源码逻辑)
public <T> T execute(RedisCallback<T> action) {
  // 1️⃣ 获取连接（不变）
  RedisConnectionFactory factory = getConnectionFactory();
  RedisConnection conn = factory.getConnection();

  try {
    // 2️⃣ 执行用户自定义逻辑（可变）← 回调点！
    T result = action.doInRedis(conn);

    // 3️⃣ 反序列化结果（不变）
    return deserializeResult(result);

  } catch (Exception e) {
    // 4️⃣ 异常转换（不变）
    throw convertRedisAccessException(e);
  } finally {
    // 5️⃣ 释放资源（不变）
    conn.close();
  }
}
```
#### 1：基础用法（显式回调）
- 用户重写 RedisCallback中的方法实现实现自定义
```java
@Autowired
private RedisTemplate<String, Object> redisTemplate;

public String getValue(String key) {
    return redisTemplate.execute(new RedisCallback<String>() {
        @Override
        public String doInRedis(RedisConnection connection) throws DataAccessException {
            // 👇 只需关注这一行：执行 GET 命令
            byte[] value = connection.get(key.getBytes(StandardCharsets.UTF_8));
            return value != null ? new String(value, StandardCharsets.UTF_8) : null;
        }
    });
}
```
#### 2：Lambda 表达式（推荐）
```java
public Long incrementCounter(String key) {
    return redisTemplate.execute(connection -> 
        connection.incr(key.getBytes(StandardCharsets.UTF_8))
    );
}
```
#### 复杂操作（Hash 操作）
```java
public Map<byte[], byte[]> getHashAll(String hashKey) {
    return redisTemplate.execute(connection -> 
        connection.hGetAll(hashKey.getBytes(StandardCharsets.UTF_8))
    );
}
```
#### 🌟 其他应用
- RedisTemplate：封装 Redis 连接操作
- RestTemplate：封装 HTTP 请求处理
- AbstractRoutingDataSource：多数据源路由模板
### 5. 观察者模式（Observer Pattern）
#### 📌 应用场景
- 事件驱动架构
- 解耦事件发布者与监听者（一对多依赖）

#### 🔧 核心实现
- 事件发布：ApplicationEventPublisher.publishEvent()
- 事件监听：@EventListener 注解方法
#### 💡 示例
```java
// 1. 定义事件
public class OrderCreatedEvent extends ApplicationEvent {
    public OrderCreatedEvent(String orderId) { super(orderId); }
}

// 2. 发布事件
@Service
public class OrderService {
@Autowired
private ApplicationEventPublisher publisher;

    public void createOrder() {
        // ... 业务逻辑
        publisher.publishEvent(new OrderCreatedEvent("123"));
    }
}

// 3. 监听事件
@Component
public class EmailListener {
   @EventListener
   public void handle(OrderCreatedEvent event) {
       sendEmail(event.getSource().toString());
   }
}
```
#### 🌐 内置事件
- ContextRefreshedEvent：容器刷新完成
- ContextClosedEvent：容器关闭
- ServletRequestHandledEvent：HTTP 请求处理完成
### 6. 策略模式（Strategy Pattern）
#### 📌 应用场景
- 运行时动态选择算法
- 替代复杂的 if-else 或 switch 语句

#### 🔧 核心实现
```text
定义策略接口
多个实现类注册为 Spring Bean 
通过 Map<String, Strategy> 自动注入所有实现

```
#### 💡 示例：支付方式
```java
// 1. 策略接口
public interface PayStrategy {
    void pay(BigDecimal amount);
}

// 2. 具体策略
@Service("alipay")
public class AlipayStrategy implements PayStrategy { }

@Service("wechat")
public class WechatPayStrategy implements PayStrategy { }

// 3. 上下文调用
@Service
public class PayService {
// Spring 自动注入所有 PayStrategy Bean 到 Map
private final Map<String, PayStrategy> strategies;

    public PayService(Map<String, PayStrategy> strategies) {
        this.strategies = strategies;
    }
    
    public void execute(String type, BigDecimal amount) {
        strategies.get(type).pay(amount); // 动态选择
    }
}
```
#### 🌟 典型应用
- 文件存储策略（本地/OSS/MinIO）
- 消息推送策略（短信/邮件/站内信）
- 计费策略（按次/包月/阶梯）
### 7. 装饰器模式（Decorator Pattern）
#### 📌 应用场景
- 动态添加职责而不改变原对象
- 扩展 HttpServletRequest/Response 功能

#### 🔧 核心实现
- 继承 HttpServletRequestWrapper
- 重写需要增强的方法
#### 💡 示例：参数解密
```java
public class DecryptRequestWrapper extends HttpServletRequestWrapper {
   
   public DecryptRequestWrapper(HttpServletRequest request) {
    super(request);
   }
   
   @Override
   public String getParameter(String name) {
      String value = super.getParameter(name);
      return value != null ? decrypt(value) : null; // 添加解密逻辑
   }
   
   private String decrypt(String encrypted) {
      // 解密实现
      return encrypted;
   }
}
   
// 在 Filter 中使用
@Component
public class DecryptFilter implements Filter {
   public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
      DecryptRequestWrapper wrapper = new DecryptRequestWrapper((HttpServletRequest) req);
      chain.doFilter(wrapper, res);
   }
}
```
### 8. 适配器模式（Adapter Pattern）
#### 📌 应用场景
- 兼容不同接口规范
- 使不兼容的类能协同工作

#### 🔧 核心实现
- HandlerAdapter：适配不同类型的 Controller
- 日志门面：SLF4J 适配 Logback/Log4j
#### 💡 手写一个适配器模式示例
- 假设我们要将 旧版支付接口 适配为 新版统一支付接口。

#### 1：定义目标接口（新版）
```java
// 新版统一支付接口
public interface PaymentProcessor {
  boolean pay(String orderId, BigDecimal amount);
}
```
#### 2：旧版接口（旧版）
```java
// 第三方支付宝 SDK（不可修改）
public class AlipayClient {
    public String sendPayment(String tradeNo, double money) {
        // 返回 "SUCCESS" 或错误码
        return "SUCCESS";
    }
}

```
#### 3：创建适配器
```java
// 适配器：将 AlipayClient 适配为 PaymentProcessor
@Component
public class AlipayAdapter implements PaymentProcessor {
    
    private final AlipayClient alipayClient;
    
    public AlipayAdapter() {
        this.alipayClient = new AlipayClient(); // 或通过 DI 注入
    }
    
    @Override
    public boolean pay(String orderId, BigDecimal amount) {
        // 1. 转换参数类型（BigDecimal → double）
        double money = amount.doubleValue();
        
        // 2. 调用旧接口
        String result = alipayClient.sendPayment(orderId, money);
        
        // 3. 转换返回值（String → boolean）
        return "SUCCESS".equals(result);
    }
}
```
#### 4：使用适配器
```java
@Service
public class OrderService {
    
    // 依赖抽象，而非具体实现
    private final PaymentProcessor paymentProcessor;
    
    public OrderService(PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor; // Spring 自动注入 AlipayAdapter
    }
    
    public void completeOrder(String orderId, BigDecimal amount) {
        if (paymentProcessor.pay(orderId, amount)) {
            // 支付成功
        }
    }
}
```
#### 如果有多个实现？怎么办？
#### 用 @Primary 指定首选
```java
@Component
@Primary // 👈 默认优先使用这个
public class AlipayAdapter implements PaymentProcessor {  }
```
#### 用 @Qualifier 指定
```java
@Service
public class OrderService {

    private final PaymentProcessor paymentProcessor;

    public OrderService(@Qualifier("wechatPayAdapter") PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }
}
```
#### 按条件注册（高级）
```java
@Component
@ConditionalOnProperty(name = "payment.provider", havingValue = "alipay")
public class AlipayAdapter implements PaymentProcessor {  }
```
#### yml中配置
```yml
payment:
  provider: alipay
```


#### 🌐 其他应用
- HttpMessageConverter：适配不同数据格式（JSON/XML）
- TaskExecutor：适配不同线程池实现
### 9. 建造者模式（Builder Pattern）
#### 📌 应用场景
- 构建复杂对象
- 提供流畅的链式调用 API

#### 🔧 核心实现
- 提供 Builder 内部类或独立 Builder 类
- 逐步设置属性，最后调用 build() 生成对象
#### 💡 示例：RestTemplateBuilder
```java
@Bean
public RestTemplate restTemplate(RestTemplateBuilder builder) {
return builder
.setConnectTimeout(Duration.ofMillis(5000))
.setReadTimeout(Duration.ofMillis(5000))
.defaultHeader("User-Agent", "MyApp/1.0")
.build(); // 最终构建 RestTemplate
}
```
#### 🌟 其他应用
- WebClient.Builder（WebFlux）
- DataSourceBuilder（数据源配置）
### 10. 责任链模式（Chain of Responsibility）
#### 📌 应用场景
- 请求的层层处理
- 解耦请求发送者与处理者

#### 🔧 核心实现
- FilterChain：Servlet 规范中的过滤器链
- HandlerInterceptor：Spring MVC 拦截器链
#### 💡 示例：Filter Chain
```java
@Component
public class AuthFilter implements Filter {
@Override
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
// 前置处理：认证检查
if (!isValidToken(req)) {
((HttpServletResponse) res).sendError(401);
return;
}

    chain.doFilter(req, res); // 传递给下一个 Filter
    
    // 后置处理：记录日志
    log.info("Request processed");
}
}
```
#### 🔁 执行流程
```text
Client → [Filter1] → [Filter2] → ... → [Servlet] → ... → [Filter2] → [Filter1] → Client
```
### 📊 设计模式速查表

| 设计模式 | Spring Boot 应用场景 | 关键组件/注解                          | 适用问题 |
|---------|------------------|----------------------------------|---------|
| 工厂模式 | Bean 创建与管理 | @Bean, ApplicationContext        | 对象创建耦合 |
| 单例模式 | 默认 Bean 作用域 | @Scope("singleton")              | 资源浪费、状态共享 |
| 代理模式 | AOP（事务/缓存/安全） | @Transactional, CGLIB            | 横切关注点侵入业务 |
| 模板方法 | JdbcTemplate, RedisTemplate | JdbcTemplate                     | 重复样板代码 |
| 观察者模式 | 事件驱动 | @EventListener, ApplicationEvent | 模块间强耦合 |
| 策略模式 | 多实现动态选择 | Map(String, T), @Qualifier       | 复杂条件分支 |
| 装饰器模式 | HttpServletRequest 增强 | HttpServletRequestWrapper        | 静态继承导致类爆炸 |
| 适配器模式 | HandlerAdapter, 日志门面 | HandlerAdapter                   | 接口不兼容 |
| 建造者模式 | RestTemplateBuilder, WebClient | RestTemplateBuilder              | 复杂对象构造 |
| 责任链模式 | Filter, Interceptor | FilterChain                      | 请求处理逻辑分散 |
### 💡 实践建议

- 优先使用 Spring 内置模式
  - 如需事务 → 用 @Transactional（代理模式），而非手动 try-catch
- 避免过度设计
  - 简单场景无需强行套用模式（如只有两个策略时，if-else 更清晰）
- 结合业务场景选择
  - 高频变化的算法 → 策略模式
  - 需要记录操作日志 → 代理模式 + 观察者模式
  - 多步骤固定流程 → 模板方法
- 阅读 Spring 源码加深理解
  - AbstractAutowireCapableBeanFactory（工厂+单例）
  - JdkDynamicAopProxy（代理）
  - ApplicationEventMulticaster（观察者）

> 🌟 记住：设计模式是手段，不是目的。目标是写出高内聚、低耦合、易维护的代码。

文档版本：v1.0

适用 Spring Boot 版本：2.x / 3.x

最后更新：2026年1月