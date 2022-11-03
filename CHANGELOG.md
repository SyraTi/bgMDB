# Changelog


## 1.0.5 - 2022-11-03

### FEATURE
- 命令现在可以使用 bgmdb help 查看帮助。
- 对于RSS中名称完全相同的剧集，现在会取最新上传的进行去重。[#4](https://github.com/SyraTi/bgMDB/issues/4)

## 1.0.4 - 2022-09-30

### BUG FIX

修复bgmi organize在轮询时出现异常导致整理失败的问题。现在对于无法解析的gid会直接放弃，需要手动整理。

## 1.0.3 - 2022-09-30


### BUG FIX

修复bgmi organize在轮询至未解析的磁力链时出现的undefined异常。


## 1.0.1 - 2022-09-30


### BREAKING CHANGE

更改docker目录结构，将数据部分修改为volume，后续可保留数据更新。


## 1.0.0 - 2022-09-29

发布首个版本
