---
slug: java-design patterns-Chain of Responsibility
title: 责任链模式
authors: [ lianghchao ]
tags: [ design patterns ]
---
## 设计模式之责任链模式
- 下面是一个 使用 Java 手写责任链模式（Chain of Responsibility）实现订单状态管理 的完整示例。该设计允许你通过一系列处理器（Handler）依次处理订单状态变更请求，每个处理器决定是否处理、如何处理，以及是否将请求传递给下一个处理器。
#### 假设订单有以下状态流转规则：
- CREATED → 可支付 → PAID
- PAID → 可发货 → SHIPPED
- SHIPPED → 可确认收货 → COMPLETED
- 任意状态可取消（但已完成的不能取消）
#### 我们用责任链来校验和执行状态变更。

### 🧱 1. 定义订单实体
```java
// Order.java
public class Order {
    private String orderId;
    private OrderStatus status;
    private String action; // 当前请求的操作，如 "pay", "ship", "confirm", "cancel"

    public Order(String orderId, OrderStatus status) {
        this.orderId = orderId;
        this.status = status;
    }

    // Getters and Setters
    public String getOrderId() { return orderId; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    @Override
    public String toString() {
        return "Order{" +
                "orderId='" + orderId + '\'' +
                ", status=" + status +
                ", action='" + action + '\'' +
                '}';
    }
}

```
### 🔗 2. 定义抽象处理器（Handler）
```java
// OrderStatus.java
public enum OrderStatus {
    CREATED,      // 已创建
    PAID,         // 已支付
    SHIPPED,      // 已发货
    COMPLETED,    // 已完成
    CANCELLED     // 已取消
}
```

### 🛠️3. 实现具体处理器

#### 抽象处理器
```java
// OrderHandler.java
public abstract class OrderHandler {
    protected OrderHandler nextHandler;

    public void setNext(OrderHandler next) {
        this.nextHandler = next;
    }

    // 处理订单状态变更
    public final void handle(Order order) {
        if (canHandle(order)) {
            doHandle(order);
        } else if (nextHandler != null) {
            nextHandler.handle(order);
        } else {
            throw new IllegalStateException("无法处理操作: " + order.getAction() + "，当前状态: " + order.getStatus());
        }
    }

    // 子类实现：是否能处理当前请求
    protected abstract boolean canHandle(Order order);

    // 子类实现：具体处理逻辑
    protected abstract void doHandle(Order order);
}
```
#### 支付处理器
```java
// PayHandler.java
public class PayHandler extends OrderHandler {
    @Override
    protected boolean canHandle(Order order) {
        return "pay".equals(order.getAction()) && OrderStatus.CREATED == order.getStatus();
    }

    @Override
    protected void doHandle(Order order) {
        System.out.println("✅ 订单 " + order.getOrderId() + " 支付成功");
        order.setStatus(OrderStatus.PAID);
    }
}
```
#### 发货处理器
```java
// ShipHandler.java
public class ShipHandler extends OrderHandler {
    @Override
    protected boolean canHandle(Order order) {
        return "ship".equals(order.getAction()) && OrderStatus.PAID == order.getStatus();
    }

    @Override
    protected void doHandle(Order order) {
        System.out.println("🚚 订单 " + order.getOrderId() + " 已发货");
        order.setStatus(OrderStatus.SHIPPED);
    }
}
```
#### 确认收货处理器
```java
// ConfirmHandler.java
public class ConfirmHandler extends OrderHandler {
    @Override
    protected boolean canHandle(Order order) {
        return "confirm".equals(order.getAction()) && OrderStatus.SHIPPED == order.getStatus();
    }

    @Override
    protected void doHandle(Order order) {
        System.out.println("📦 订单 " + order.getOrderId() + " 已确认收货");
        order.setStatus(OrderStatus.COMPLETED);
    }
}
```
#### 取消订单处理器（通用）
```java
// CancelHandler.java
public class CancelHandler extends OrderHandler {
    @Override
    protected boolean canHandle(Order order) {
        return "cancel".equals(order.getAction()) &&
               order.getStatus() != OrderStatus.COMPLETED &&
               order.getStatus() != OrderStatus.CANCELLED;
    }

    @Override
    protected void doHandle(Order order) {
        System.out.println("❌ 订单 " + order.getOrderId() + " 已取消");
        order.setStatus(OrderStatus.CANCELLED);
    }
}
```

### 🧪 4. 构建责任链并测试
```java
// OrderChainDemo.java
public class OrderChainDemo {
    public static void main(String[] args) {
        // 构建责任链
        OrderHandler payHandler = new PayHandler();
        OrderHandler shipHandler = new ShipHandler();
        OrderHandler confirmHandler = new ConfirmHandler();
        OrderHandler cancelHandler = new CancelHandler();

        payHandler.setNext(shipHandler);
        shipHandler.setNext(confirmHandler);
        confirmHandler.setNext(cancelHandler);
        // cancelHandler 是最后一个，无需设置 next

        // 测试订单流程
        Order order = new Order("ORD1001", OrderStatus.CREATED);

        // 正常流程：支付 → 发货 → 确认
        order.setAction("pay");
        payHandler.handle(order);
        System.out.println(order);

        order.setAction("ship");
        payHandler.handle(order); // 从链头开始
        System.out.println(order);

        order.setAction("confirm");
        payHandler.handle(order);
        System.out.println(order);

        // 尝试取消已完成订单（应失败）
        order.setAction("cancel");
        try {
            payHandler.handle(order);
        } catch (IllegalStateException e) {
            System.out.println("🚫 " + e.getMessage());
        }

        // 新订单直接取消
        Order order2 = new Order("ORD1002", OrderStatus.CREATED);
        order2.setAction("cancel");
        payHandler.handle(order2);
        System.out.println(order2);
    }
}
```
```java

```