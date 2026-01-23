---
slug: java-CompletableFuture
title: Java多线程、异步
authors: [ lianghchao ]
tags: [ CompletableFuture ]
---
## CompletableFuture
- CompletableFuture
### 示例1: 使用 supplyAsync 创建有返回值的异步任务
```java
/**
 * 示例1: 使用 supplyAsync 创建有返回值的异步任务
 * 
 * supplyAsync 用于执行有返回值的任务
 * 
 * 使用场景：异步查询数据、调用远程服务
 */
public CompletableFuture<String> createWithSupplyAsync() {
    return CompletableFuture.supplyAsync(() -> {
        logger.info("执行 supplyAsync 任务, 线程: {}", Thread.currentThread().getName());
        // 模拟耗时操作
        sleep(1000);
        return "查询结果: 用户信息";
    }, getExecutor());
}
```

### 示例2: 使用 runAsync 创建无返回值的异步任务
```java
/**
 * 示例2: 使用 runAsync 创建无返回值的异步任务
 * 
 * runAsync 用于执行无返回值的任务
 * 
 * 使用场景：异步记录日志、发送通知
 */
public CompletableFuture<Void> createWithRunAsync() {
    return CompletableFuture.runAsync(() -> {
        logger.info("执行 runAsync 任务, 线程: {}", Thread.currentThread().getName());
        // 模拟耗时操作
        sleep(1000);
        logger.info("任务执行完成");
    }, getExecutor());
}
```

### 示例3: 使用 completedFuture 创建已完成的 CompletableFuture
```java
/**
 * 示例3: 使用 completedFuture 创建已完成的 CompletableFuture
 * 
 * completedFuture 立即返回一个已完成的 Future
 * 
 * 使用场景：返回默认值、缓存命中直接返回
 */
public CompletableFuture<String> createCompletedFuture() {
    logger.info("创建已完成的 CompletableFuture");
    return CompletableFuture.completedFuture("立即返回的结果");
}
```

### 示例4: 使用 thenApply 转换结果
```java
/**
 * 示例4: 使用 thenApply 转换结果
 * 
 * thenApply 用于转换 CompletableFuture 的结果（有返回值）
 * 同步执行，在上一个任务的线程中执行
 * 
 * 使用场景：数据格式转换、结果处理
 */
public CompletableFuture<String> transformWithThenApply() {
    return CompletableFuture.supplyAsync(() -> {
        logger.info("第一步：查询用户ID, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        return 10001L;
    }, getExecutor())
    .thenApply(userId -> {
        logger.info("第二步：根据ID查询用户名, userId: {}, 线程: {}", userId, Thread.currentThread().getName());
        sleep(500);
        return "用户-" + userId;
    })
    .thenApply(username -> {
        logger.info("第三步：格式化用户名, 线程: {}", Thread.currentThread().getName());
        return "【" + username + "】";
    });
}
```

### 示例5: 使用 thenApplyAsync 异步转换结果
```java
/**
 * 示例5: 使用 thenApplyAsync 异步转换结果
 * 
 * thenApplyAsync 用于异步转换结果（使用线程池）
 * 
 * 使用场景：转换操作比较耗时，需要独立线程执行
 */
public CompletableFuture<String> transformWithThenApplyAsync() {
    return CompletableFuture.supplyAsync(() -> {
        logger.info("查询订单, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        return "ORDER-123456";
    }, getExecutor())
    .thenApplyAsync(orderId -> {
        logger.info("处理订单: {}, 线程: {}", orderId, Thread.currentThread().getName());
        sleep(1000);
        return "处理完成: " + orderId;
    }, getExecutor());
}
```

### 示例6: 使用 thenAccept 消费结果（无返回值）
```java
/**
 * 示例6: 使用 thenAccept 消费结果（无返回值）
 * 
 * thenAccept 用于消费结果，不返回新值
 * 
 * 使用场景：记录日志、发送通知、更新状态
 */
public CompletableFuture<Void> consumeWithThenAccept() {
    return CompletableFuture.supplyAsync(() -> {
        logger.info("生成报表, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        return "报表数据";
    }, getExecutor())
    .thenAccept(report -> {
        logger.info("保存报表: {}, 线程: {}", report, Thread.currentThread().getName());
        // 保存到数据库或文件
    });
}
```

### 示例7: 使用 thenRun 执行后续操作（不关心上一步结果）
```java
/**
 * 示例7: 使用 thenRun 执行后续操作（不关心上一步结果）
 * 
 * thenRun 执行 Runnable，不接收参数，不返回结果
 * 
 * 使用场景：清理资源、发送完成通知
 */
public CompletableFuture<Void> runAfterWithThenRun() {
    return CompletableFuture.supplyAsync(() -> {
        logger.info("执行主任务, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        return "主任务结果";
    }, getExecutor())
    .thenRun(() -> {
        logger.info("主任务完成，执行清理工作, 线程: {}", Thread.currentThread().getName());
    });
}
```

### 示例8: 使用 thenCompose 串联两个依赖的异步任务
```java
/**
 * 示例8: 使用 thenCompose 串联两个依赖的异步任务
 * 
 * thenCompose 用于串联两个有依赖关系的 CompletableFuture
 * 第二个任务依赖第一个任务的结果
 * 
 * 使用场景：先查用户ID，再根据ID查订单
 */
public CompletableFuture<String> combineWithThenCompose() {
    return CompletableFuture.supplyAsync(() -> {
        logger.info("步骤1：查询用户ID, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        return 10001L;
    }, getExecutor())
    .thenCompose(userId -> CompletableFuture.supplyAsync(() -> {
        logger.info("步骤2：根据用户ID {} 查询订单, 线程: {}", userId, Thread.currentThread().getName());
        sleep(1000);
        return "用户 " + userId + " 的订单列表";
    }, getExecutor()));
}
```

### 示例9: 使用 thenCombine 合并两个独立的异步任务结果
```java
/**
 * 示例9: 使用 thenCombine 合并两个独立的异步任务结果
 * 
 * thenCombine 等待两个任务都完成，然后合并结果
 * 两个任务并行执行，互不依赖
 * 
 * 使用场景：同时查询用户信息和订单信息，然后组装
 */
public CompletableFuture<String> combineWithThenCombine() {
    // 任务1：查询用户信息
    CompletableFuture<String> userFuture = CompletableFuture.supplyAsync(() -> {
        logger.info("查询用户信息, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        return "张三";
    }, getExecutor());
    
    // 任务2：查询订单信息
    CompletableFuture<String> orderFuture = CompletableFuture.supplyAsync(() -> {
        logger.info("查询订单信息, 线程: {}", Thread.currentThread().getName());
        sleep(1500);
        return "订单-123";
    }, getExecutor());
    
    // 合并两个结果
    return userFuture.thenCombine(orderFuture, (user, order) -> {
        logger.info("合并结果：用户={}, 订单={}, 线程: {}", user, order, Thread.currentThread().getName());
        return String.format("用户 %s 的订单 %s", user, order);
    });
}
```

### 示例10: 使用 allOf 等待多个任务全部完成
```java
/**
 * 示例10: 使用 allOf 等待多个任务全部完成
 * 
 * allOf 等待所有 CompletableFuture 完成（不关心结果）
 * 
 * 使用场景：批量查询、并行处理多个独立任务
 */
public CompletableFuture<List<String>> waitAllWithAllOf() {
    // 创建多个异步任务
    CompletableFuture<String> task1 = CompletableFuture.supplyAsync(() -> {
        logger.info("任务1执行, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        return "结果1";
    }, getExecutor());
    
    CompletableFuture<String> task2 = CompletableFuture.supplyAsync(() -> {
        logger.info("任务2执行, 线程: {}", Thread.currentThread().getName());
        sleep(1500);
        return "结果2";
    }, getExecutor());
    
    CompletableFuture<String> task3 = CompletableFuture.supplyAsync(() -> {
        logger.info("任务3执行, 线程: {}", Thread.currentThread().getName());
        sleep(800);
        return "结果3";
    }, getExecutor());
    
    // 等待所有任务完成
    return CompletableFuture.allOf(task1, task2, task3)
        .thenApply(v -> {
            logger.info("所有任务完成，收集结果");
            // 收集所有结果
            return Arrays.asList(
                task1.join(),
                task2.join(),
                task3.join()
            );
        });
}
```

### 示例11: 使用 anyOf 等待任意一个任务完成
```java
/**
 * 示例11: 使用 anyOf 等待任意一个任务完成
 * 
 * anyOf 返回最先完成的任务结果
 * 
 * 使用场景：多个数据源查询，取最快返回的结果
 */
public CompletableFuture<String> waitAnyWithAnyOf() {
    CompletableFuture<String> source1 = CompletableFuture.supplyAsync(() -> {
        logger.info("数据源1查询, 线程: {}", Thread.currentThread().getName());
        sleep(1500);
        return "数据源1的结果";
    }, getExecutor());
    
    CompletableFuture<String> source2 = CompletableFuture.supplyAsync(() -> {
        logger.info("数据源2查询, 线程: {}", Thread.currentThread().getName());
        sleep(800);
        return "数据源2的结果";
    }, getExecutor());
    
    CompletableFuture<String> source3 = CompletableFuture.supplyAsync(() -> {
        logger.info("数据源3查询, 线程: {}", Thread.currentThread().getName());
        sleep(1200);
        return "数据源3的结果";
    }, getExecutor());
    
    // 返回最快完成的结果
    return CompletableFuture.anyOf(source1, source2, source3)
        .thenApply(result -> {
            logger.info("最快返回的结果: {}", result);
            return (String) result;
        });
}
```

### 示例12: 使用 exceptionally 处理异常
```java
/**
 * 示例12: 使用 exceptionally 处理异常
 * 
 * exceptionally 捕获异常并返回默认值
 * 
 * 使用场景：异常时返回兜底数据
 */
public CompletableFuture<String> handleExceptionWithExceptionally() {
    return CompletableFuture.supplyAsync(() -> {
        logger.info("执行可能失败的任务, 线程: {}", Thread.currentThread().getName());
        sleep(500);
        // 模拟异常
        if (Math.random() > 0.5) {
            throw new RuntimeException("模拟业务异常");
        }
        return "正常结果";
    }, getExecutor())
    .exceptionally(ex -> {
        logger.error("任务执行失败，返回默认值: {}", ex.getMessage());
        return "默认值";
    });
}
```

### 示例13: 使用 handle 同时处理正常结果和异常
```java
/**
 * 示例13: 使用 handle 同时处理正常结果和异常
 * 
 * handle 无论成功还是失败都会执行
 * 可以获取结果和异常，返回新值
 * 
 * 使用场景：需要统一处理成功和失败情况
 */
public CompletableFuture<String> handleWithHandle() {
    return CompletableFuture.supplyAsync(() -> {
        logger.info("执行任务, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        if (Math.random() > 0.5) {
            throw new RuntimeException("任务失败");
        }
        return "任务成功";
    }, getExecutor())
    .handle((result, ex) -> {
        if (ex != null) {
            logger.error("任务执行异常: {}", ex.getMessage());
            return "异常处理: " + ex.getMessage();
        } else {
            logger.info("任务执行成功: {}", result);
            return "成功处理: " + result;
        }
    });
}
```

### 示例14: 使用 whenComplete 执行完成后的回调（不改变结果）
```java
/**
 * 示例14: 使用 whenComplete 执行完成后的回调（不改变结果）
 * 
 * whenComplete 在任务完成后执行，不改变结果
 * 可以获取结果和异常，但不能返回新值
 * 
 * 使用场景：记录日志、监控统计、资源清理
 */
public CompletableFuture<String> handleWithWhenComplete() {
    return CompletableFuture.supplyAsync(() -> {
        logger.info("执行业务任务, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        return "业务结果";
    }, getExecutor())
    .whenComplete((result, ex) -> {
        if (ex != null) {
            logger.error("任务执行失败，记录日志: {}", ex.getMessage());
        } else {
            logger.info("任务执行成功，记录日志: {}", result);
        }
    });
}
```

### 示例15: 使用超时控制（兼容 Java 8）
```java
/**
 * 示例15: 使用超时控制（兼容 Java 8）
 *
 * 通过 CompletableFuture.anyOf 实现超时控制
 *
 * 使用场景：防止任务执行时间过长
 */
public CompletableFuture<String> handleTimeout() {
    CompletableFuture<String> taskFuture = CompletableFuture.supplyAsync(() -> {
        logger.info("执行耗时任务, 线程: {}", Thread.currentThread().getName());
        sleep(3000); // 模拟耗时3秒
        return "任务结果";
    }, getExecutor());

    // 创建超时Future
    CompletableFuture<String> timeoutFuture = new CompletableFuture<>();
    ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    scheduler.schedule(() -> {
        timeoutFuture.completeExceptionally(new TimeoutException("任务执行超时"));
        scheduler.shutdown();
    }, 2, TimeUnit.SECONDS);

    // 返回最先完成的
    return CompletableFuture.anyOf(taskFuture, timeoutFuture)
        .thenApply(result -> (String) result)
        .exceptionally(ex -> {
            logger.error("任务超时: {}", ex.getMessage());
            return "超时默认值";
        });
}
```

### 示例16: 超时返回默认值（兼容 Java 8）
```java
/**
 * 示例16: 超时返回默认值（兼容 Java 8）
 *
 * 超时后返回默认值，不抛异常
 *
 * 使用场景：超时后使用兜底数据
 */
public CompletableFuture<String> handleTimeoutWithDefault() {
    CompletableFuture<String> taskFuture = CompletableFuture.supplyAsync(() -> {
        logger.info("执行任务, 线程: {}", Thread.currentThread().getName());
        sleep(3000);
        return "正常结果";
    }, getExecutor());

    // 创建超时Future，超时后完成并返回默认值
    CompletableFuture<String> timeoutFuture = new CompletableFuture<>();
    ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    scheduler.schedule(() -> {
        timeoutFuture.complete("超时默认结果");
        scheduler.shutdown();
    }, 2, TimeUnit.SECONDS);

    // 返回最先完成的
    return CompletableFuture.anyOf(taskFuture, timeoutFuture)
        .thenApply(result -> {
            logger.info("返回结果: {}", result);
            return (String) result;
        });
}
```

### 示例17: 复杂业务场景 - 订单处理流程
```java
/**
 * 示例17: 复杂业务场景 - 订单处理流程
 * 
 * 场景：创建订单需要：
 * 1. 校验库存（并行）
 * 2. 校验用户积分（并行）
 * 3. 创建订单（依赖1、2）
 * 4. 扣减库存（依赖3）
 * 5. 扣减积分（依赖3）
 * 6. 发送通知（依赖3）
 */
public CompletableFuture<String> complexOrderProcess(Long userId, Long productId, Integer quantity) {
    logger.info("开始处理订单：用户={}, 商品={}, 数量={}", userId, productId, quantity);
    
    // 步骤1：并行校验库存和积分
    CompletableFuture<Boolean> checkInventory = CompletableFuture.supplyAsync(() -> {
        logger.info("校验库存, 线程: {}", Thread.currentThread().getName());
        sleep(500);
        return true; // 库存充足
    }, getExecutor());
    
    CompletableFuture<Boolean> checkPoints = CompletableFuture.supplyAsync(() -> {
        logger.info("校验积分, 线程: {}", Thread.currentThread().getName());
        sleep(600);
        return true; // 积分充足
    }, getExecutor());
    
    // 步骤2：等待校验完成，创建订单
    return CompletableFuture.allOf(checkInventory, checkPoints)
        .thenCompose(v -> {
            if (!checkInventory.join() || !checkPoints.join()) {
                return CompletableFuture.completedFuture("订单创建失败：库存或积分不足");
            }
            
            return CompletableFuture.supplyAsync(() -> {
                logger.info("创建订单, 线程: {}", Thread.currentThread().getName());
                sleep(800);
                return "ORDER-" + System.currentTimeMillis();
            }, getExecutor());
        })
        // 步骤3：并行扣减库存和积分
        .thenCompose(orderId -> {
            if (orderId.startsWith("订单创建失败")) {
                return CompletableFuture.completedFuture(orderId);
            }
            
            CompletableFuture<Void> deductInventory = CompletableFuture.runAsync(() -> {
                logger.info("扣减库存，订单: {}, 线程: {}", orderId, Thread.currentThread().getName());
                sleep(400);
            }, getExecutor());
            
            CompletableFuture<Void> deductPoints = CompletableFuture.runAsync(() -> {
                logger.info("扣减积分，订单: {}, 线程: {}", orderId, Thread.currentThread().getName());
                sleep(500);
            }, getExecutor());
            
            return CompletableFuture.allOf(deductInventory, deductPoints)
                .thenApply(v -> orderId);
        })
        // 步骤4：发送通知
        .thenApply(orderId -> {
            if (!orderId.startsWith("订单创建失败")) {
                CompletableFuture.runAsync(() -> {
                    logger.info("发送订单通知，订单: {}, 线程: {}", orderId, Thread.currentThread().getName());
                }, getExecutor());
            }
            return orderId;
        })
        // 步骤5：异常处理
        .exceptionally(ex -> {
            logger.error("订单处理失败: {}", ex.getMessage(), ex);
            return "订单处理异常: " + ex.getMessage();
        })
        // 步骤6：完成回调
        .whenComplete((result, ex) -> {
            if (ex == null) {
                logger.info("订单处理完成: {}", result);
            }
        });
}
```

### 示例18: 批量数据处理 - 分片并行处理
```java
/**
 * 示例18: 批量数据处理 - 分片并行处理
 * 
 * 场景：处理10000条数据，分10批，每批1000条并行处理
 */
public CompletableFuture<Integer> batchProcess(List<Long> dataIds) {
    logger.info("开始批量处理，总数: {}", dataIds.size());
    
    // 分片：每批1000条
    int batchSize = 1000;
    List<List<Long>> batches = partition(dataIds, batchSize);
    
    // 为每一批创建异步任务
    List<CompletableFuture<Integer>> futures = batches.stream()
        .map(batch -> CompletableFuture.supplyAsync(() -> {
            logger.info("处理批次，数量: {}, 线程: {}", batch.size(), Thread.currentThread().getName());
            sleep(1000); // 模拟处理
            return batch.size();
        }, getExecutor()))
        .collect(Collectors.toList());
    
    // 等待所有批次完成，汇总结果
    return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
        .thenApply(v -> {
            int total = futures.stream()
                .mapToInt(CompletableFuture::join)
                .sum();
            logger.info("批量处理完成，总处理数: {}", total);
            return total;
        })
        .exceptionally(ex -> {
            logger.error("批量处理失败: {}", ex.getMessage(), ex);
            return 0;
        });
}
```

### 示例19: 多数据源聚合查询
```java
/**
 * 示例19: 多数据源聚合查询
 * 
 * 场景：同时查询用户信息、订单列表、收藏商品，组装成首页数据
 */
public CompletableFuture<String> aggregateUserData(Long userId) {
    logger.info("聚合查询用户数据: {}", userId);
    
    // 并行查询多个数据源
    CompletableFuture<String> userInfo = CompletableFuture.supplyAsync(() -> {
        logger.info("查询用户信息, 线程: {}", Thread.currentThread().getName());
        sleep(800);
        return "用户信息";
    }, getExecutor());
    
    CompletableFuture<String> orderList = CompletableFuture.supplyAsync(() -> {
        logger.info("查询订单列表, 线程: {}", Thread.currentThread().getName());
        sleep(1200);
        return "订单列表";
    }, getExecutor());
    
    CompletableFuture<String> favorites = CompletableFuture.supplyAsync(() -> {
        logger.info("查询收藏商品, 线程: {}", Thread.currentThread().getName());
        sleep(600);
        return "收藏商品";
    }, getExecutor());
    
    CompletableFuture<String> recommendations = CompletableFuture.supplyAsync(() -> {
        logger.info("查询推荐商品, 线程: {}", Thread.currentThread().getName());
        sleep(1000);
        return "推荐商品";
    }, getExecutor());
    
    // 聚合所有结果
    return CompletableFuture.allOf(userInfo, orderList, favorites, recommendations)
        .thenApply(v -> {
            String result = String.format("首页数据: {用户: %s, 订单: %s, 收藏: %s, 推荐: %s}",
                userInfo.join(), orderList.join(), favorites.join(), recommendations.join());
            logger.info("数据聚合完成");
            return result;
        })
        .exceptionally(ex -> {
            logger.error("数据聚合失败: {}", ex.getMessage());
            return "数据加载失败";
        });
}
```

### 示例20: 缓存穿透防护 - 并发请求合并
```java
/**
 * 示例20: 缓存穿透防护 - 并发请求合并
 * 
 * 场景：多个请求同时查询同一个key，只执行一次数据库查询
 */
public CompletableFuture<Object> getDataWithCache(String key) {
    logger.info("查询数据，key: {}", key);
    
    // 模拟：先查缓存
    return CompletableFuture.supplyAsync(() -> {
        logger.info("查询缓存, 线程: {}", Thread.currentThread().getName());
        sleep(100);
        return null; // 缓存未命中
    }, getExecutor())
    .thenCompose(cacheData -> {
        if (cacheData != null) {
            logger.info("缓存命中: {}", cacheData);
            return CompletableFuture.completedFuture(cacheData);
        }
        
        // 缓存未命中，查询数据库
        return CompletableFuture.supplyAsync(() -> {
            logger.info("缓存未命中，查询数据库, 线程: {}", Thread.currentThread().getName());
            sleep(1500); // 模拟数据库查询
            String dbData = "DB数据-" + key;
            
            // 异步更新缓存（不阻塞主流程）
            CompletableFuture.runAsync(() -> {
                logger.info("更新缓存, key: {}", key);
                sleep(200);
            }, getExecutor());
            
            return dbData;
        }, getExecutor());
    })
    .exceptionally(ex -> {
        logger.error("查询失败: {}", ex.getMessage());
        return "默认值";
    });
}
```


### 完整示例代码
```java
import com.ruoyi.common.utils.spring.SpringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * CompletableFuture 使用示例
 * 
 * CompletableFuture 是 Java 8 引入的异步编程工具，支持：
 * 1. 异步任务执行
 * 2. 任务结果转换
 * 3. 多任务组合
 * 4. 异常处理
 * 5. 超时控制
 * 
 * @author ruoyi
 */
@Component
public class CompletableFutureExample {
    
    private static final Logger logger = LoggerFactory.getLogger(CompletableFutureExample.class);
    
    /**
     * 自定义线程池（当项目未配置时使用）
     */
    private volatile ExecutorService customExecutor;
    
    /**
     * 获取线程池执行器
     * 优先使用项目配置的线程池，如果不存在则创建自定义线程池
     */
    private Executor getExecutor() {
        try {
            // 尝试获取项目配置的线程池
            if (SpringUtils.containsBean("threadPoolTaskExecutor")) {
                ThreadPoolTaskExecutor bean = SpringUtils.getBean("threadPoolTaskExecutor");
                if (bean != null) {
                    return bean.getThreadPoolExecutor();
                }
            }
        } catch (Exception e) {
            logger.warn("未找到项目配置的线程池，使用自定义线程池");
        }
        
        // 双重检查锁创建自定义线程池
        if (customExecutor == null) {
            synchronized (this) {
                if (customExecutor == null) {
                    customExecutor = createCustomExecutor();
                    logger.info("创建自定义线程池完成");
                }
            }
        }
        return customExecutor;
    }
    
    /**
     * 创建自定义线程池
     */
    private ExecutorService createCustomExecutor() {
        int corePoolSize = Runtime.getRuntime().availableProcessors();
        int maxPoolSize = corePoolSize * 2;
        long keepAliveTime = 60L;
        int queueCapacity = 1000;
        
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            corePoolSize,
            maxPoolSize,
            keepAliveTime,
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(queueCapacity),
            new ThreadFactory() {
                private int count = 0;
                @Override
                public Thread newThread(Runnable r) {
                    Thread thread = new Thread(r, "CompletableFuture-" + (++count));
                    thread.setDaemon(false);
                    return thread;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
        
        return executor;
    }
    
    /**
     * 应用关闭时清理自定义线程池
     */
    @PreDestroy
    public void destroy() {
        if (customExecutor != null && !customExecutor.isShutdown()) {
            logger.info("关闭自定义线程池");
            customExecutor.shutdown();
            try {
                if (!customExecutor.awaitTermination(60, TimeUnit.SECONDS)) {
                    customExecutor.shutdownNow();
                    if (!customExecutor.awaitTermination(60, TimeUnit.SECONDS)) {
                        logger.error("线程池未能正常关闭");
                    }
                }
            } catch (InterruptedException e) {
                customExecutor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }
    
    // ==================== 一、创建 CompletableFuture ====================
    
    /**
     * 示例1: 使用 supplyAsync 创建有返回值的异步任务
     * 
     * supplyAsync 用于执行有返回值的任务
     * 
     * 使用场景：异步查询数据、调用远程服务
     */
    public CompletableFuture<String> createWithSupplyAsync() {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("执行 supplyAsync 任务, 线程: {}", Thread.currentThread().getName());
            // 模拟耗时操作
            sleep(1000);
            return "查询结果: 用户信息";
        }, getExecutor());
    }
    
    /**
     * 示例2: 使用 runAsync 创建无返回值的异步任务
     * 
     * runAsync 用于执行无返回值的任务
     * 
     * 使用场景：异步记录日志、发送通知
     */
    public CompletableFuture<Void> createWithRunAsync() {
        return CompletableFuture.runAsync(() -> {
            logger.info("执行 runAsync 任务, 线程: {}", Thread.currentThread().getName());
            // 模拟耗时操作
            sleep(1000);
            logger.info("任务执行完成");
        }, getExecutor());
    }
    
    /**
     * 示例3: 使用 completedFuture 创建已完成的 CompletableFuture
     * 
     * completedFuture 立即返回一个已完成的 Future
     * 
     * 使用场景：返回默认值、缓存命中直接返回
     */
    public CompletableFuture<String> createCompletedFuture() {
        logger.info("创建已完成的 CompletableFuture");
        return CompletableFuture.completedFuture("立即返回的结果");
    }
    
    // ==================== 二、结果转换 ====================
    
    /**
     * 示例4: 使用 thenApply 转换结果
     * 
     * thenApply 用于转换 CompletableFuture 的结果（有返回值）
     * 同步执行，在上一个任务的线程中执行
     * 
     * 使用场景：数据格式转换、结果处理
     */
    public CompletableFuture<String> transformWithThenApply() {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("第一步：查询用户ID, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            return 10001L;
        }, getExecutor())
        .thenApply(userId -> {
            logger.info("第二步：根据ID查询用户名, userId: {}, 线程: {}", userId, Thread.currentThread().getName());
            sleep(500);
            return "用户-" + userId;
        })
        .thenApply(username -> {
            logger.info("第三步：格式化用户名, 线程: {}", Thread.currentThread().getName());
            return "【" + username + "】";
        });
    }
    
    /**
     * 示例5: 使用 thenApplyAsync 异步转换结果
     * 
     * thenApplyAsync 用于异步转换结果（使用线程池）
     * 
     * 使用场景：转换操作比较耗时，需要独立线程执行
     */
    public CompletableFuture<String> transformWithThenApplyAsync() {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("查询订单, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            return "ORDER-123456";
        }, getExecutor())
        .thenApplyAsync(orderId -> {
            logger.info("处理订单: {}, 线程: {}", orderId, Thread.currentThread().getName());
            sleep(1000);
            return "处理完成: " + orderId;
        }, getExecutor());
    }
    
    /**
     * 示例6: 使用 thenAccept 消费结果（无返回值）
     * 
     * thenAccept 用于消费结果，不返回新值
     * 
     * 使用场景：记录日志、发送通知、更新状态
     */
    public CompletableFuture<Void> consumeWithThenAccept() {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("生成报表, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            return "报表数据";
        }, getExecutor())
        .thenAccept(report -> {
            logger.info("保存报表: {}, 线程: {}", report, Thread.currentThread().getName());
            // 保存到数据库或文件
        });
    }
    
    /**
     * 示例7: 使用 thenRun 执行后续操作（不关心上一步结果）
     * 
     * thenRun 执行 Runnable，不接收参数，不返回结果
     * 
     * 使用场景：清理资源、发送完成通知
     */
    public CompletableFuture<Void> runAfterWithThenRun() {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("执行主任务, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            return "主任务结果";
        }, getExecutor())
        .thenRun(() -> {
            logger.info("主任务完成，执行清理工作, 线程: {}", Thread.currentThread().getName());
        });
    }
    
    // ==================== 三、组合多个 CompletableFuture ====================
    
    /**
     * 示例8: 使用 thenCompose 串联两个依赖的异步任务
     * 
     * thenCompose 用于串联两个有依赖关系的 CompletableFuture
     * 第二个任务依赖第一个任务的结果
     * 
     * 使用场景：先查用户ID，再根据ID查订单
     */
    public CompletableFuture<String> combineWithThenCompose() {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("步骤1：查询用户ID, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            return 10001L;
        }, getExecutor())
        .thenCompose(userId -> CompletableFuture.supplyAsync(() -> {
            logger.info("步骤2：根据用户ID {} 查询订单, 线程: {}", userId, Thread.currentThread().getName());
            sleep(1000);
            return "用户 " + userId + " 的订单列表";
        }, getExecutor()));
    }
    
    /**
     * 示例9: 使用 thenCombine 合并两个独立的异步任务结果
     * 
     * thenCombine 等待两个任务都完成，然后合并结果
     * 两个任务并行执行，互不依赖
     * 
     * 使用场景：同时查询用户信息和订单信息，然后组装
     */
    public CompletableFuture<String> combineWithThenCombine() {
        // 任务1：查询用户信息
        CompletableFuture<String> userFuture = CompletableFuture.supplyAsync(() -> {
            logger.info("查询用户信息, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            return "张三";
        }, getExecutor());
        
        // 任务2：查询订单信息
        CompletableFuture<String> orderFuture = CompletableFuture.supplyAsync(() -> {
            logger.info("查询订单信息, 线程: {}", Thread.currentThread().getName());
            sleep(1500);
            return "订单-123";
        }, getExecutor());
        
        // 合并两个结果
        return userFuture.thenCombine(orderFuture, (user, order) -> {
            logger.info("合并结果：用户={}, 订单={}, 线程: {}", user, order, Thread.currentThread().getName());
            return String.format("用户 %s 的订单 %s", user, order);
        });
    }
    
    /**
     * 示例10: 使用 allOf 等待多个任务全部完成
     * 
     * allOf 等待所有 CompletableFuture 完成（不关心结果）
     * 
     * 使用场景：批量查询、并行处理多个独立任务
     */
    public CompletableFuture<List<String>> waitAllWithAllOf() {
        // 创建多个异步任务
        CompletableFuture<String> task1 = CompletableFuture.supplyAsync(() -> {
            logger.info("任务1执行, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            return "结果1";
        }, getExecutor());
        
        CompletableFuture<String> task2 = CompletableFuture.supplyAsync(() -> {
            logger.info("任务2执行, 线程: {}", Thread.currentThread().getName());
            sleep(1500);
            return "结果2";
        }, getExecutor());
        
        CompletableFuture<String> task3 = CompletableFuture.supplyAsync(() -> {
            logger.info("任务3执行, 线程: {}", Thread.currentThread().getName());
            sleep(800);
            return "结果3";
        }, getExecutor());
        
        // 等待所有任务完成
        return CompletableFuture.allOf(task1, task2, task3)
            .thenApply(v -> {
                logger.info("所有任务完成，收集结果");
                // 收集所有结果
                return Arrays.asList(
                    task1.join(),
                    task2.join(),
                    task3.join()
                );
            });
    }
    
    /**
     * 示例11: 使用 anyOf 等待任意一个任务完成
     * 
     * anyOf 返回最先完成的任务结果
     * 
     * 使用场景：多个数据源查询，取最快返回的结果
     */
    public CompletableFuture<String> waitAnyWithAnyOf() {
        CompletableFuture<String> source1 = CompletableFuture.supplyAsync(() -> {
            logger.info("数据源1查询, 线程: {}", Thread.currentThread().getName());
            sleep(1500);
            return "数据源1的结果";
        }, getExecutor());
        
        CompletableFuture<String> source2 = CompletableFuture.supplyAsync(() -> {
            logger.info("数据源2查询, 线程: {}", Thread.currentThread().getName());
            sleep(800);
            return "数据源2的结果";
        }, getExecutor());
        
        CompletableFuture<String> source3 = CompletableFuture.supplyAsync(() -> {
            logger.info("数据源3查询, 线程: {}", Thread.currentThread().getName());
            sleep(1200);
            return "数据源3的结果";
        }, getExecutor());
        
        // 返回最快完成的结果
        return CompletableFuture.anyOf(source1, source2, source3)
            .thenApply(result -> {
                logger.info("最快返回的结果: {}", result);
                return (String) result;
            });
    }
    
    // ==================== 四、异常处理 ====================
    
    /**
     * 示例12: 使用 exceptionally 处理异常
     * 
     * exceptionally 捕获异常并返回默认值
     * 
     * 使用场景：异常时返回兜底数据
     */
    public CompletableFuture<String> handleExceptionWithExceptionally() {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("执行可能失败的任务, 线程: {}", Thread.currentThread().getName());
            sleep(500);
            // 模拟异常
            if (Math.random() > 0.5) {
                throw new RuntimeException("模拟业务异常");
            }
            return "正常结果";
        }, getExecutor())
        .exceptionally(ex -> {
            logger.error("任务执行失败，返回默认值: {}", ex.getMessage());
            return "默认值";
        });
    }
    
    /**
     * 示例13: 使用 handle 同时处理正常结果和异常
     * 
     * handle 无论成功还是失败都会执行
     * 可以获取结果和异常，返回新值
     * 
     * 使用场景：需要统一处理成功和失败情况
     */
    public CompletableFuture<String> handleWithHandle() {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("执行任务, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            if (Math.random() > 0.5) {
                throw new RuntimeException("任务失败");
            }
            return "任务成功";
        }, getExecutor())
        .handle((result, ex) -> {
            if (ex != null) {
                logger.error("任务执行异常: {}", ex.getMessage());
                return "异常处理: " + ex.getMessage();
            } else {
                logger.info("任务执行成功: {}", result);
                return "成功处理: " + result;
            }
        });
    }
    
    /**
     * 示例14: 使用 whenComplete 执行完成后的回调（不改变结果）
     * 
     * whenComplete 在任务完成后执行，不改变结果
     * 可以获取结果和异常，但不能返回新值
     * 
     * 使用场景：记录日志、监控统计、资源清理
     */
    public CompletableFuture<String> handleWithWhenComplete() {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("执行业务任务, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            return "业务结果";
        }, getExecutor())
        .whenComplete((result, ex) -> {
            if (ex != null) {
                logger.error("任务执行失败，记录日志: {}", ex.getMessage());
            } else {
                logger.info("任务执行成功，记录日志: {}", result);
            }
        });
    }
    
    // ==================== 五、超时控制 ====================
    
    /**
     * 示例15: 使用超时控制（兼容 Java 8）
     *
     * 通过 CompletableFuture.anyOf 实现超时控制
     *
     * 使用场景：防止任务执行时间过长
     */
    public CompletableFuture<String> handleTimeout() {
        CompletableFuture<String> taskFuture = CompletableFuture.supplyAsync(() -> {
            logger.info("执行耗时任务, 线程: {}", Thread.currentThread().getName());
            sleep(3000); // 模拟耗时3秒
            return "任务结果";
        }, getExecutor());

        // 创建超时Future
        CompletableFuture<String> timeoutFuture = new CompletableFuture<>();
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.schedule(() -> {
            timeoutFuture.completeExceptionally(new TimeoutException("任务执行超时"));
            scheduler.shutdown();
        }, 2, TimeUnit.SECONDS);

        // 返回最先完成的
        return CompletableFuture.anyOf(taskFuture, timeoutFuture)
            .thenApply(result -> (String) result)
            .exceptionally(ex -> {
                logger.error("任务超时: {}", ex.getMessage());
                return "超时默认值";
            });
    }

    /**
     * 示例16: 超时返回默认值（兼容 Java 8）
     *
     * 超时后返回默认值，不抛异常
     *
     * 使用场景：超时后使用兜底数据
     */
    public CompletableFuture<String> handleTimeoutWithDefault() {
        CompletableFuture<String> taskFuture = CompletableFuture.supplyAsync(() -> {
            logger.info("执行任务, 线程: {}", Thread.currentThread().getName());
            sleep(3000);
            return "正常结果";
        }, getExecutor());

        // 创建超时Future，超时后完成并返回默认值
        CompletableFuture<String> timeoutFuture = new CompletableFuture<>();
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.schedule(() -> {
            timeoutFuture.complete("超时默认结果");
            scheduler.shutdown();
        }, 2, TimeUnit.SECONDS);

        // 返回最先完成的
        return CompletableFuture.anyOf(taskFuture, timeoutFuture)
            .thenApply(result -> {
                logger.info("返回结果: {}", result);
                return (String) result;
            });
    }
    
    // ==================== 六、实战综合案例 ====================
    
    /**
     * 示例17: 复杂业务场景 - 订单处理流程
     * 
     * 场景：创建订单需要：
     * 1. 校验库存（并行）
     * 2. 校验用户积分（并行）
     * 3. 创建订单（依赖1、2）
     * 4. 扣减库存（依赖3）
     * 5. 扣减积分（依赖3）
     * 6. 发送通知（依赖3）
     */
    public CompletableFuture<String> complexOrderProcess(Long userId, Long productId, Integer quantity) {
        logger.info("开始处理订单：用户={}, 商品={}, 数量={}", userId, productId, quantity);
        
        // 步骤1：并行校验库存和积分
        CompletableFuture<Boolean> checkInventory = CompletableFuture.supplyAsync(() -> {
            logger.info("校验库存, 线程: {}", Thread.currentThread().getName());
            sleep(500);
            return true; // 库存充足
        }, getExecutor());
        
        CompletableFuture<Boolean> checkPoints = CompletableFuture.supplyAsync(() -> {
            logger.info("校验积分, 线程: {}", Thread.currentThread().getName());
            sleep(600);
            return true; // 积分充足
        }, getExecutor());
        
        // 步骤2：等待校验完成，创建订单
        return CompletableFuture.allOf(checkInventory, checkPoints)
            .thenCompose(v -> {
                if (!checkInventory.join() || !checkPoints.join()) {
                    return CompletableFuture.completedFuture("订单创建失败：库存或积分不足");
                }
                
                return CompletableFuture.supplyAsync(() -> {
                    logger.info("创建订单, 线程: {}", Thread.currentThread().getName());
                    sleep(800);
                    return "ORDER-" + System.currentTimeMillis();
                }, getExecutor());
            })
            // 步骤3：并行扣减库存和积分
            .thenCompose(orderId -> {
                if (orderId.startsWith("订单创建失败")) {
                    return CompletableFuture.completedFuture(orderId);
                }
                
                CompletableFuture<Void> deductInventory = CompletableFuture.runAsync(() -> {
                    logger.info("扣减库存，订单: {}, 线程: {}", orderId, Thread.currentThread().getName());
                    sleep(400);
                }, getExecutor());
                
                CompletableFuture<Void> deductPoints = CompletableFuture.runAsync(() -> {
                    logger.info("扣减积分，订单: {}, 线程: {}", orderId, Thread.currentThread().getName());
                    sleep(500);
                }, getExecutor());
                
                return CompletableFuture.allOf(deductInventory, deductPoints)
                    .thenApply(v -> orderId);
            })
            // 步骤4：发送通知
            .thenApply(orderId -> {
                if (!orderId.startsWith("订单创建失败")) {
                    CompletableFuture.runAsync(() -> {
                        logger.info("发送订单通知，订单: {}, 线程: {}", orderId, Thread.currentThread().getName());
                    }, getExecutor());
                }
                return orderId;
            })
            // 步骤5：异常处理
            .exceptionally(ex -> {
                logger.error("订单处理失败: {}", ex.getMessage(), ex);
                return "订单处理异常: " + ex.getMessage();
            })
            // 步骤6：完成回调
            .whenComplete((result, ex) -> {
                if (ex == null) {
                    logger.info("订单处理完成: {}", result);
                }
            });
    }
    
    /**
     * 示例18: 批量数据处理 - 分片并行处理
     * 
     * 场景：处理10000条数据，分10批，每批1000条并行处理
     */
    public CompletableFuture<Integer> batchProcess(List<Long> dataIds) {
        logger.info("开始批量处理，总数: {}", dataIds.size());
        
        // 分片：每批1000条
        int batchSize = 1000;
        List<List<Long>> batches = partition(dataIds, batchSize);
        
        // 为每一批创建异步任务
        List<CompletableFuture<Integer>> futures = batches.stream()
            .map(batch -> CompletableFuture.supplyAsync(() -> {
                logger.info("处理批次，数量: {}, 线程: {}", batch.size(), Thread.currentThread().getName());
                sleep(1000); // 模拟处理
                return batch.size();
            }, getExecutor()))
            .collect(Collectors.toList());
        
        // 等待所有批次完成，汇总结果
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> {
                int total = futures.stream()
                    .mapToInt(CompletableFuture::join)
                    .sum();
                logger.info("批量处理完成，总处理数: {}", total);
                return total;
            })
            .exceptionally(ex -> {
                logger.error("批量处理失败: {}", ex.getMessage(), ex);
                return 0;
            });
    }
    
    /**
     * 示例19: 多数据源聚合查询
     * 
     * 场景：同时查询用户信息、订单列表、收藏商品，组装成首页数据
     */
    public CompletableFuture<String> aggregateUserData(Long userId) {
        logger.info("聚合查询用户数据: {}", userId);
        
        // 并行查询多个数据源
        CompletableFuture<String> userInfo = CompletableFuture.supplyAsync(() -> {
            logger.info("查询用户信息, 线程: {}", Thread.currentThread().getName());
            sleep(800);
            return "用户信息";
        }, getExecutor());
        
        CompletableFuture<String> orderList = CompletableFuture.supplyAsync(() -> {
            logger.info("查询订单列表, 线程: {}", Thread.currentThread().getName());
            sleep(1200);
            return "订单列表";
        }, getExecutor());
        
        CompletableFuture<String> favorites = CompletableFuture.supplyAsync(() -> {
            logger.info("查询收藏商品, 线程: {}", Thread.currentThread().getName());
            sleep(600);
            return "收藏商品";
        }, getExecutor());
        
        CompletableFuture<String> recommendations = CompletableFuture.supplyAsync(() -> {
            logger.info("查询推荐商品, 线程: {}", Thread.currentThread().getName());
            sleep(1000);
            return "推荐商品";
        }, getExecutor());
        
        // 聚合所有结果
        return CompletableFuture.allOf(userInfo, orderList, favorites, recommendations)
            .thenApply(v -> {
                String result = String.format("首页数据: {用户: %s, 订单: %s, 收藏: %s, 推荐: %s}",
                    userInfo.join(), orderList.join(), favorites.join(), recommendations.join());
                logger.info("数据聚合完成");
                return result;
            })
            .exceptionally(ex -> {
                logger.error("数据聚合失败: {}", ex.getMessage());
                return "数据加载失败";
            });
    }
    
    /**
     * 示例20: 缓存穿透防护 - 并发请求合并
     * 
     * 场景：多个请求同时查询同一个key，只执行一次数据库查询
     */
    public CompletableFuture<Object> getDataWithCache(String key) {
        logger.info("查询数据，key: {}", key);
        
        // 模拟：先查缓存
        return CompletableFuture.supplyAsync(() -> {
            logger.info("查询缓存, 线程: {}", Thread.currentThread().getName());
            sleep(100);
            return null; // 缓存未命中
        }, getExecutor())
        .thenCompose(cacheData -> {
            if (cacheData != null) {
                logger.info("缓存命中: {}", cacheData);
                return CompletableFuture.completedFuture(cacheData);
            }
            
            // 缓存未命中，查询数据库
            return CompletableFuture.supplyAsync(() -> {
                logger.info("缓存未命中，查询数据库, 线程: {}", Thread.currentThread().getName());
                sleep(1500); // 模拟数据库查询
                String dbData = "DB数据-" + key;
                
                // 异步更新缓存（不阻塞主流程）
                CompletableFuture.runAsync(() -> {
                    logger.info("更新缓存, key: {}", key);
                    sleep(200);
                }, getExecutor());
                
                return dbData;
            }, getExecutor());
        })
        .exceptionally(ex -> {
            logger.error("查询失败: {}", ex.getMessage());
            return "默认值";
        });
    }
    
    // ==================== 工具方法 ====================
    
    /**
     * 睡眠指定毫秒数
     */
    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("线程被中断", e);
        }
    }
    
    /**
     * 将列表分片
     * 修复：使用索引避免 indexOf 性能问题
     */
    private <T> List<List<T>> partition(List<T> list, int batchSize) {
        if (list == null || list.isEmpty() || batchSize <= 0) {
            return new ArrayList<>();
        }
        
        List<List<T>> result = new ArrayList<>();
        int size = list.size();
        for (int i = 0; i < size; i += batchSize) {
            result.add(list.subList(i, Math.min(i + batchSize, size)));
        }
        return result;
    }
}

```