---
slug: mysql-field
title: Mysql Field
authors: [ lianghchao ]
tags: [ mysql ]
---

以下是按出现频率从高到低的通用字段分类排行，包含字段名、类型建议及原因：
🏆 T0 级：几乎每张表必备 (95%+)
这些字段是数据管理的基石，用于标识记录、追踪时间和逻辑删除。

| 排名 | 字段名 | 推荐类型 | 作用与备注 |
| :--- | :--- | :--- | :--- |
| 1 | **id** | BIGINT / INT | 主键。现代高并发系统推荐 BIGINT (配合雪花算法) 或 BIGINT UNSIGNED (自增)。避免使用 UUID 作为物理主键（除非有特殊分片需求），因为会影响索引性能。 |
| 2 | **created_at** | DATETIME / TIMESTAMP | 创建时间。用于排序、统计新增数据。默认值通常设为 CURRENT_TIMESTAMP。 |
| 3 | **updated_at** | DATETIME / TIMESTAMP | 更新时间。用于缓存失效判断、数据同步。默认值设为 CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP。 |
| 4 | **is_deleted** | TINYINT(1) | 逻辑删除标记。0=正常，1=删除。生产环境严禁物理删除数据，必须保留痕迹。 |

🥈 T1 级：业务核心字段 (80%+)
这些字段用于描述数据的归属、状态和版本控制。

| 排名 | 字段名 | 推荐类型 | 作用与备注 |
| :--- | :--- | :--- | :--- |
| 5 | **status** | TINYINT / INT | 状态位。如订单状态（0-待支付，1-已支付...）。比用字符串枚举更节省空间且查询更快。 |
| 6 | **version** | INT | 乐观锁版本号。用于解决并发更新冲突（CAS 机制），电商库存、账户余额表必备。 |
| 7 | **user_id / uid** | BIGINT | 关联用户ID。绝大多数业务数据都需要知道”是谁”产生的。注意类型要与用户表主键一致。 |
| 8 | **name / title** | VARCHAR(64/128) | 名称/标题。最基础的描述信息。长度视业务而定，常用 VARCHAR(64) 或 VARCHAR(128)。 |
| 9 | **code / no** | VARCHAR(32/64) | 业务编号。如订单号、流水号、商品编码。通常唯一索引。 |

🥉 T2 级：运营与审计字段 (60%+)
用于后台管理、问题排查和数据权限控制。

| 排名 | 字段名 | 推荐类型 | 作用与备注 |
| :--- | :--- | :--- | :--- |
| 10 | **creator_id** | BIGINT | 创建人ID。区别于 user_id (业务属主)，这是操作系统的账号 ID，用于审计”谁建的”。 |
| 11 | **updater_id** | BIGINT | 更新人ID。最后修改该记录的人。 |
| 12 | **remark / desc** | VARCHAR(255) / TEXT | 备注/描述。用于存储非结构化简短说明。短则 VARCHAR(255)，长则 TEXT。 |
| 13 | **sort / order_num** | INT | 排序号。用于前端列表自定义排序（如置顶、拖拽排序）。默认通常为 0 或 999。 |
| 14 | **tenant_id** | BIGINT | 租户ID。SaaS 多租户架构必备，用于数据隔离。 |

---

### 常用 SQL 字段速查表

#### 基础类型字段

| 字段名 | 推荐类型 | 使用场景 |
| :--- | :--- | :--- |
| id | BIGINT UNSIGNED | 主键，自增ID |
| uuid | CHAR(36) / VARCHAR(36) | 分布式唯一标识 |
| name | VARCHAR(64/128) | 名称、标题 |
| title | VARCHAR(128/255) | 标题、显示名 |
| description | VARCHAR(500) / TEXT | 描述详情 |

#### 状态与枚举

| 字段名 | 推荐类型 | 使用场景 |
| :--- | :--- | :--- |
| status | TINYINT / INT | 通用状态 |
| type | TINYINT / INT | 类型区分 |
| level | TINYINT / INT | 优先级/等级 |
| flag | TINYINT(1) | 标记位 |

#### 金额与数量

| 字段名 | 推荐类型 | 使用场景 |
| :--- | :--- | :--- |
| amount | DECIMAL(10,2) | 金额（精确到分） |
| price | DECIMAL(10,2) | 价格 |
| quantity | INT / BIGINT | 数量 |
| balance | DECIMAL(20,2) | 余额 |

#### 时间字段

| 字段名 | 推荐类型 | 使用场景 |
| :--- | :--- | :--- |
| start_time | DATETIME | 开始时间 |
| end_time | DATETIME | 结束时间 |
| expire_time | DATETIME | 过期时间 |
| publish_time | DATETIME | 发布时间 |

#### 关联与外键

| 字段名 | 推荐类型 | 使用场景 |
| :--- | :--- | :--- |
| user_id | BIGINT | 用户ID |
| parent_id | BIGINT | 父级ID（树形结构） |
| order_id | BIGINT | 订单ID |
| category_id | BIGINT | 分类ID |

#### 其他常用

| 字段名 | 推荐类型 | 使用场景 |
| :--- | :--- | :--- |
| mobile | VARCHAR(11) | 手机号 |
| email | VARCHAR(255) | 邮箱 |
| avatar | VARCHAR(500) | 头像URL |
| ip_address | VARCHAR(45) | IP地址 |
| view_count | INT / BIGINT | 浏览次数 |
| like_count | INT / BIGINT | 点赞数 |
| comment_count | INT / BIGINT | 评论数 |