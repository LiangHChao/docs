---
slug: java-filter-interceptor
title: 过滤器&拦截器
authors: [ lianghchao ]
tags: [ java,filter,interceptor ]
---
### sping boot中的过滤器&拦截器

### mvc交互流程
```text

客户端（浏览器）
↓
[1] HTTP 请求（例如：GET /user/profile 或 /static/logo.png）
↓
[2] Web 容器（Tomcat / Jetty / Undertow）
↓
[3] 所有已注册的 Filter.doFilter()（按 @Order 顺序执行）
│    ← 包括：CharacterEncodingFilter、CorsFilter、自定义 Filter 等
│    ← **静态资源（如 /css/app.css）也会经过此处**
│
│    ┌───────────────────────────────┐
│    │ 在 Filter 中调用 chain.doFilter() │
│    └───────────────────────────────┘
│                      ↓
│             [4] DispatcherServlet（Spring MVC 前端控制器）
│                      ↓
│             [5] HandlerMapping
│                      │ → 尝试匹配 @Controller 中的 @RequestMapping
│                      │
│                      ├─ 若匹配成功（如 /user/profile）→ 进入 Spring MVC 流程
│                      │
│                      └─ 若未匹配（如 /static/logo.png）→
│                           直接由 ResourceHttpRequestHandler 处理，
│                           **跳过所有 Interceptor**，但仍会走后续 Filter
│
│                      ↓（仅对匹配到 Controller 的请求）
│             [6] 执行已注册的 Interceptor.preHandle()
│                      │ → 按 addInterceptor() 注册顺序调用
│                      │ → 若任一返回 false，则中断流程，**不调用 Controller**
│                      │    （但仍会执行后续 Filter 的后半部分和 afterCompletion）
│                      ↓
│             [7] 调用目标 Controller 方法
│                      │ → 参数绑定（@RequestParam, @RequestBody 等）
│                      │ → 执行业务逻辑
│                      ↓
│             [8] Controller 返回结果
│                      │ → ModelAndView（视图） 或 JSON（@RestController）
│                      ↓
│             [9] 执行 Interceptor.postHandle()
│                      │ → 可修改 ModelAndView（仅对视图有效）
│                      │ → **若 Controller 抛异常，此方法不会执行！**
│                      ↓
│             [10] 视图渲染（ViewResolver → Thymeleaf/JSP）
│                      │ → 或直接写 JSON 到 HttpServletResponse（REST）
│                      ↓
│             [11] 执行 Interceptor.afterCompletion()
│                      │ → **无论成功或异常，都会执行**
│                      │ → 可清理 ThreadLocal、记录日志、关闭资源等
│
└──────────────────────↑
│
[12] 继续执行 Filter.doFilter() 的后半部分（响应返回阶段）
│    ← 所有 Filter 的 doFilter() 方法中 chain.doFilter() 之后的代码
│    ← 例如：记录响应时间、修改响应头、GZIP 压缩等
↓
[13] HttpServletResponse 完全写回客户端
↓
客户端收到 HTML / JSON / 静态文件等响应

```

### 拦截器
```java
    /**
     * 登录拦截器：拦截需要登录的接口
     */
    @Component
    public static class LoginInterceptor implements HandlerInterceptor { // 改为 static

        @Override
        public boolean preHandle(HttpServletRequest request,
                                 HttpServletResponse response,
                                 Object handler) throws IOException {

            String uri = request.getRequestURI();
            log.info("LoginInterceptor 拦截请求: {}", uri);

            // 只处理 Controller 请求
            if (!(handler instanceof HandlerMethod)) {
                return true;
            }

            // 模拟未登录
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("未登录，拒绝访问: {}", uri);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=utf-8");
                response.getWriter().write("{\"code\":401, \"msg\":\"请先登录\"}");
                return false;
            }

            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
            log.info("LoginInterceptor 拦截请求完成: {}", response.getStatus());
            HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
        }
    }
```

### 拦截器注册
```java
@Configuration
public static class WebConfig implements WebMvcConfigurer { 

    @Autowired
    private LoginInterceptor loginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 拦截所有，但排除 /public/**
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/public/**");
    }
}
```
### 过滤器
```java
/**
 * 自定义 Filter 1：记录所有请求（包括静态资源）
 */
@Component
@Order(1) // 优先级高（数字小）
public static class MyCustomFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        log.info(">>> MyCustomFilter 开始: {}", req.getRequestURI());

        String token = req.getHeader("Authorization");
        if (token != null){
            // 进入程序
            chain.doFilter(request, response);
        }
        else{
            // 模拟未登录
            log.warn("未登录，拒绝访问: {}", req.getRequestURI());
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json;charset=utf-8");
            httpResponse.getWriter().write("{\"code\":401, \"msg\":\"请先登录\"}");
        }


        log.info("<<< MyCustomFilter 结束: {}", req.getRequestURI());
    }
}
```

### 完整代码
```java
@Slf4j
@SpringBootApplication
public class MvcTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(MvcTestApplication.class, args);
    }

    @Slf4j
    @RestController
    public static class MyController {

        @GetMapping("/test")
        public String index1() {
            log.info("访问 /test");
            return "Hello MyController!";
        }

        @GetMapping("/public/test")
        public String index2() {
            log.info("访问 /public/test");
            return "Hello Public!";
        }

        @PostMapping("/test2")
        public String index3() {
            log.info("访问 /test2 (POST)");
            return "Hello POST!";
        }
    }

    /**
     * 登录拦截器：拦截需要登录的接口
     */
    @Component
    public static class LoginInterceptor implements HandlerInterceptor { // 改为 static

        @Override
        public boolean preHandle(HttpServletRequest request,
                                 HttpServletResponse response,
                                 Object handler) throws IOException {

            String uri = request.getRequestURI();
            log.info("LoginInterceptor 拦截请求: {}", uri);

            // 只处理 Controller 请求
            if (!(handler instanceof HandlerMethod)) {
                return true;
            }

            // 模拟未登录
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("未登录，拒绝访问: {}", uri);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=utf-8");
                response.getWriter().write("{\"code\":401, \"msg\":\"请先登录\"}");
                return false;
            }

            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
            log.info("LoginInterceptor 拦截请求完成: {}", response.getStatus());
            HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
        }
    }
    @Component
    public static class LoginInterceptor2 implements HandlerInterceptor { // 改为 static

        @Override
        public boolean preHandle(HttpServletRequest request,
                                 HttpServletResponse response,
                                 Object handler) throws IOException {

            String uri = request.getRequestURI();
            log.info("LoginInterceptor2 拦截请求: {}", uri);

            // 只处理 Controller 请求
            if (!(handler instanceof HandlerMethod)) {
                return true;
            }

            // 模拟未登录
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("未登录，拒绝访问: {}", uri);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=utf-8");
                response.getWriter().write("{\"code\":401, \"msg\":\"请先登录\"}");
                return false;
            }

            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
            log.info("LoginInterceptor2 拦截请求完成: {}", response.getStatus());
            HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
        }
    }

    @Configuration
    public static class WebConfig implements WebMvcConfigurer { // 改为 static

        @Autowired
        private LoginInterceptor loginInterceptor;
        @Autowired
        private LoginInterceptor2 loginInterceptor2;

        @Override
        public void addInterceptors(InterceptorRegistry registry) {
            // 拦截所有，但排除 /public/**
            registry.addInterceptor(loginInterceptor)
                    .addPathPatterns("/**")
                    .excludePathPatterns("/public/**");
            registry.addInterceptor(loginInterceptor2)
                    .addPathPatterns("/**")
                    .excludePathPatterns("/public/**");
        }
    }

    /**
     * 自定义 Filter 1：记录所有请求（包括静态资源）
     */
    @Component
    @Order(1) // 优先级高（数字小）
    public static class MyCustomFilter implements Filter {

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            HttpServletRequest req = (HttpServletRequest) request;
            log.info(">>> MyCustomFilter 开始: {}", req.getRequestURI());

            String token = req.getHeader("Authorization");
            if (token != null){
                // 进入程序
                chain.doFilter(request, response);
            }
            else{
                // 模拟未登录
                log.warn("未登录，拒绝访问: {}", req.getRequestURI());
                HttpServletResponse httpResponse = (HttpServletResponse) response;
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.setContentType("application/json;charset=utf-8");
                httpResponse.getWriter().write("{\"code\":401, \"msg\":\"请先登录\"}");
            }


            log.info("<<< MyCustomFilter 结束: {}", req.getRequestURI());
        }
    }

    /**
     * 自定义 Filter 2
     */
    @Component
    @Order(2)
    public static class MyCustomFilter2 implements Filter {

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            HttpServletRequest req = (HttpServletRequest) request;
            log.info(">>> MyCustomFilter2 开始: {}", req.getRequestURI());

            chain.doFilter(request, response);

            log.info("<<< MyCustomFilter2 结束: {}", req.getRequestURI());
        }
    }
}
```