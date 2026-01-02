---
slug: java-annotation
title: sping boot 注解
authors: [ lianghchao ]
tags: [ annotation ]
---
## 注解 注解本身只是“标记”
- 注解（Annotation）是 Java 5.0 引入的，用于给 Java 源代码添加元信息。
### 条件化配置注解（高级）
- 用于按条件创建 Bean，实现灵活配置：
```java
@Configuration
public class ConditionalConfig {
    
    @Bean
    @ConditionalOnProperty(name = "cache.enabled", havingValue = "true")
    public CacheManager redisCacheManager() {
        return new RedisCacheManager();
    }
    
    @Bean
    @ConditionalOnMissingBean(CacheManager.class) // 如果容器中没有 CacheManager 才创建
    public CacheManager defaultCacheManager() {
        return new SimpleCacheManager();
    }
}
```
常用条件注解：
- @ConditionalOnClass：类路径存在某类
- @ConditionalOnMissingBean：容器中缺少某 Bean
- @ConditionalOnProperty：配置属性满足条件
- @Profile("dev")：仅在 dev 环境生效

#### Spring Boot 中注解（如 @Transactional、@Autowired、@Cacheable 等）之所以能“自动生效”，背后依赖多种底层机制协同工作，主要包括：

1. 反射（Reflection）
2. 代理模式（Proxy Pattern） → JDK 动态代理 / CGLIB
3. AOP（面向切面编程）
4. Bean 生命周期回调（PostProcessor）

### BeanPostProcessor —— 在 Bean 初始化时处理注解
- Spring 在创建 Bean 的过程中，会调用一系列 BeanPostProcessor 来处理注解：


| PostProcessor                          | 	处理的注解                      | 	功能         |
|----------------------------------------|-----------------------------|-------------|
| AutowiredAnnotationBeanPostProcessor   | 	@Autowired, @Value         | 	依赖注入       |
| CommonAnnotationBeanPostProcessor      | 	@Resource, @PostConstruct  | 	JSR-250 支持 |
| PersistenceAnnotationBeanPostProcessor | 	@PersistenceContext        | 	JPA 支持     |
| AsyncAnnotationBeanPostProcessor       | 	@Async                     | 	异步代理       |
| InfrastructureAdvisorAutoProxyCreator  | 	@Transactional, @Cacheable | 	创建 AOP 代理  |