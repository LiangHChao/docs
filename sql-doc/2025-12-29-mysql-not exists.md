---
slug: mysql-exists
title: Mysql EXISTS
authors: [ lianghchao ]
tags: [ mysql ]
---

### NOT EXISTS的使用及*逆向思维*
- 查询护士能做的项目ID-护士必须要能做项目中所有核心项目

```sql
SELECT DISTINCT csp.project_id
FROM project csp
WHERE csp.status = '0'  -- 假设项目有状态字段，0=启用（按实际调整）
  AND NOT EXISTS (
    SELECT 1
    FROM project_item pci
             JOIN item ci ON pci.item_id = ci.item_id
    WHERE pci.project_id = csp.project_id
      AND pci.del_flag = '0'
      AND ci.is_core_item = '1'
      AND ci.status = '0'
      AND NOT EXISTS (
        SELECT 1
        FROM nurse_project_rel r
        WHERE r.nurse_id = #{nurseId}
          AND r.item_id = ci.item_id
          AND r.is_valid = '1'
          AND r.del_flag = '0'
    )
);
```