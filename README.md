This is microsim plugin

### update log

1. 添加动态配置单元的日志,在 vscode setting 界面，User 配置中搜索 microsim 选项，
   其中有 Micro Sim: Units 选项，点击 Edit in settings.json, 即可在配置文件中以字符串数组形式添加需要处理的单元
   如:

```json
{
  // ...
  "microSim.units": [
    "predict_unit",
    "table_walker",
    "icache_l1",
    "icache_l2",
    "mmu_unit",
    "dram_unit",
    "fetch_unit"
  ]
}
```

2. 新加搜索文本高亮功能

#### 构建说明

