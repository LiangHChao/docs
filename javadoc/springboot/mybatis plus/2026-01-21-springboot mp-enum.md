---
slug: springboot-mp-enum
title: springboot mp使用enum
authors: [ lianghchao ]
tags: [ java, mp, enum ]
---

## springboot mp业务中使用Enum管理状态
### 添加配置
```yml
mybatis-plus:
  configuration:
    default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
```
### 枚举实现
```java
@Getter
public enum OrderBusinessStatusEnum implements IEnum<String> {
    PENDING_CONFIRM("10", "待审核"),
    CONFIRMED("20", "已审核"),
    ACCEPTED("30", "已出发"),
    PROCESSING("40", "服务中"),
    COMPLETED("50", "已完成"),
    CLOSED("60", "已关闭");

    private final String code;
    private final String desc;

    OrderBusinessStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    /**
     * 根据字符串 code 获取枚举（严格匹配）
     */
    public static OrderBusinessStatusEnum fromCode(String code) {
        if (code == null) {
            throw new IllegalArgumentException("订单状态码不能为 null");
        }
        for (OrderBusinessStatusEnum status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("无效的订单状态码: " + code);
    }

    /**
     * 安全版本：code 不存在时返回 null
     */
    public static OrderBusinessStatusEnum fromCodeOrNull(String code) {
        if (code == null) {
            return null;
        }
        for (OrderBusinessStatusEnum status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    @Override
    public String getValue() {
        return this.code;
    }

    /**
     * code序列化展示
     */
    @JsonValue
    public String getValueForJson() {
        return this.code;
    }
}
```
### 解决GetMapping实体Bo无法转换问题
```java
@GetMapping("/list")
public TableDataInfo<CareOrderVo> list(@Validated(QueryGroup.class) CareOrderBo bo, PageQuery pageQuery);
```
#### 解决GetMapping实体Bo无法转换问题
```java
@Configuration
public class ResourcesConfig implements WebMvcConfigurer
{
    @Override
    public void addFormatters(FormatterRegistry registry) {
        // 字符串 → OrderStatusEnum
        registry.addConverter(String.class, OrderStatusEnum.class, OrderStatusEnum::fromCode);
        // 字符串 → OrderBusinessStatusEnum
        registry.addConverter(String.class, OrderBusinessStatusEnum.class, OrderBusinessStatusEnum::fromCode);

        registry.addConverter(String.class, OrderCommentStatusEnum.class, OrderCommentStatusEnum::fromCode);
        registry.addConverter(String.class, AfterSaleStatusEnum.class, AfterSaleStatusEnum::fromCode);
    }
}
```
### 实体中使用
```java
public class CareOrder extends BaseEntity {

    private static final long serialVersionUID = 1L;
    /**
     * 订单状态
     */
    private OrderStatusEnum status;
    /**
     * 业务状态
     */
    private OrderBusinessStatusEnum businessStatus;
}
```