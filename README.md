# bgMDB
bgMDB是一个用于订阅TMDB番剧的CLI工具.

bgMDB的初衷是为了自动化 **番剧订阅+EMBY/jellyfin/plex元数据刮削** 这一过程，所以bgMDB的目标是 **订阅一次，观看一季**。

在拥有EMBY/jellyfin/plex 与 Aria2 配合的场景下，不再需要任何的手动操作，即可即时更新番剧。

## 整体思路
bgMDB的整体思路是 **TMDB获取番剧信息->使用蜜柑计划RSS获取下载链接->发送至Aria2下载**

*PS：未来的路线可能开放其他RSS源及下载工具或者可自定义，见：[TODO](https://github.com/SyraTi/bgMDB#TODO)

## 一条命令订阅
```shell
# 使用TMDB链接进行订阅
> bgmdb add 'https://www.themoviedb.org/tv/94631'
```

## 部署
使用docker（推荐）
```shell
docker pull syrati/bgmdb
# 这里用到的环境变量会在下文逐个讲解，请按照自己的实际情况填写
# 建议将/home/bgmdb/data目录挂载至宿主机，后续更新能够保留订阅信息
docker run -d \
  -e BGMDB_SAVE_PATH='/path/to/save_bangumi' \
  -e BGMDB_ARIA2_HOST='aria2.xxx.com' \
  -e BGMDB_ARIA2_PORT=6800 \
  -e BGMDB_ARIA2_SECRET='' \
  -e BGMDB_SESSION_PATH='/home/bgmdb/data/bgmdb.session' \
  -v ~/bgmdb/data:/home/bgmdb/data \ 
  syrati/bgmdb
```
使用node
```shell
npm install -g bgmdb
export BGMDB_SAVE_PATH='/path/to/save_bangumi'
export .... #环境变量同上 
```

## 升级最新版本
```shell
npm install -g bgmdb@latest
```

### 环境变量
| 变量名             | 描述                                                    |
|-----------------|-------------------------------------------------------|
| BGMDB_SAVE_PATH | 番剧保存路径，此处需要特别声明的是，该路径会同时被bgMDB与Aria2访问，请确保两者之间的路径一致性。 |
| BGMDB_ARIA2_HOST | 能够访问到Aria2的Hostname                                   |
| BGMDB_ARIA2_PORT | Aria2的JSONRPC端口，如果没有对Aria2的配置做过更改，可以直接使用默认值6800       |
| BGMDB_ARIA2_SECRET | Aria2的JSONRPC SECRET                                  |
| BGMDB_SESSION_PATH | bgMDB的session路径，一般情况下无需更改                             |

## 使用
### 订阅番剧
```shell
# 使用TMDB链接进行订阅
> bgmdb add 'https://www.themoviedb.org/tv/94631'

# 输出TMDB解析结果
解析成功！ {
  id: '/tv/94631',
  chineseName: '放学后海堤日记',
  releaseDate: '(2020)',
  localName: '放課後ていぼう日誌',
  link: 'https://www.themoviedb.org/tv/94631',
  downloadTasks: [],
  seasons: [ { index: 'S1', title: '第 1 季', progress: 0, episodes: [] } ]
}
《放学后海堤日记》RSS匹配开始！
现在开始匹配《S1-第 1 季》
请输入《S1-第 1 季》对应的蜜柑计划RSS链接，如需要略过本季可以直接留空
例如：https://mikanani.me/RSS/Bangumi?bangumiId=2206&subgroupid=37

# 输入字幕组RSS链接
> https://mikanani.me/RSS/Bangumi?bangumiId=2206&subgroupid=37

# 对订阅结果进行筛选
当前筛选后的结果如下： [
  '第12话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第12话][1080p_AVC][简体]',
  '第12话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第12话][1080p_AVC][繁体]',
  '第11话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第11话][1080p_AVC][简体]',
  '第11话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第11话][1080p_AVC][繁体]',
  '第10话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第10话][1080p_AVC][简体]',
  '第10话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第10话][1080p_AVC][繁体]',
  '第9话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第09话][1080p_AVC][简体]',
  '第9话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第09话][1080p_AVC][繁体]',
  '第8话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第08话][1080p_AVC][简体]',
  '第8话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第08话][1080p_AVC][繁体]',
  '第7话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第07话][1080p_AVC][简体]',
  '第7话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第07话][1080p_AVC][繁体]',
  '第6话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第06话][1080p_AVC][简体]',
  '第6话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第06话][1080p_AVC][繁体]',
  '第5话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第05话][1080p_AVC][简体]',
  '第5话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第05话][1080p_AVC][繁体]',
  '第4话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第04话][1080p_AVC][简体]',
  '第4话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第04话][1080p_AVC][繁体]',
  '第3话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第03话][1080p_AVC][简体]',
  '第3话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第03话][1080p_AVC][繁体]',
  '第2话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第02话][1080p_AVC][简体]',
  '第2话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第02话][1080p_AVC][繁体]',
  '第1话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第01话][1080p_AVC][简体]',
  '第1话 | 标题：【千夏字幕组】【放学後堤防日记_Houkago Teibou Nisshi】[第01话][1080p_AVC][繁体]'
]
*发现有重复的话/集*
请继续完善筛选条件：
1.条件可以留空
2.筛选只适用于标题
请输入想要包含的文字，多个请以英文逗号(,)隔开, 当前值：无
# 输入筛选的文本，可以留空，大小写不敏感，即1080p与1080P是等价的
> 1080p,简体

请输入想要排除的文字，多个请以英文逗号(,)隔开, 当前值：无
# 输入需要排除的文本，可以留空，大小写不敏感
> 繁体

请输入想要匹配的正则表达式，如/^123$/gi, 当前值：无
# 输入筛选用的正则表达式，可以留空
>

# 当筛选结果的集数连贯并且不重复时，筛选结束
当前筛选后的结果如下： [
  '第12话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第12话][1080p_AVC][简体]',
  '第11话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第11话][1080p_AVC][简体]',
  '第10话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第10话][1080p_AVC][简体]',
  '第9话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第09话][1080p_AVC][简体]',
  '第8话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第08话][1080p_AVC][简体]',
  '第7话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第07话][1080p_AVC][简体]',
  '第6话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第06话][1080p_AVC][简体]',
  '第5话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第05话][1080p_AVC][简体]',
  '第4话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第04话][1080p_AVC][简体]',
  '第3话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第03话][1080p_AVC][简体]',
  '第2话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第02话][1080p_AVC][简体]',
  '第1话 | 标题：【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第01话][1080p_AVC][简体]'
]
筛选完成！
匹配完成！ 需要下载全部已有内容吗？(y/n)
# 可以选择立即下载，也可以后续使用bgmdb update手动下载
> y

放学后海堤日记 开始下载...
保存路径：/mnt/media/bangumi/放課後ていぼう日誌(2020) 
S1-第 1 季 开始下载...
保存路径：/mnt/media/bangumi/放課後ていぼう日誌(2020)/S1 
第12话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第12话][1080p_AVC][简体] 已发送至Aria2.
第11话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第11话][1080p_AVC][简体] 已发送至Aria2.
第10话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第10话][1080p_AVC][简体] 已发送至Aria2.
第9话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第09话][1080p_AVC][简体] 已发送至Aria2.
第8话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第08话][1080p_AVC][简体] 已发送至Aria2.
第7话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第07话][1080p_AVC][简体] 已发送至Aria2.
第6话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第06话][1080p_AVC][简体] 已发送至Aria2.
第5话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第05话][1080p_AVC][简体] 已发送至Aria2.
第4话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第04话][1080p_AVC][简体] 已发送至Aria2.
第3话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第03话][1080p_AVC][简体] 已发送至Aria2.
第2话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第02话][1080p_AVC][简体] 已发送至Aria2.
第1话 | 【千夏字幕组】【放学后堤防日记_Houkago Teibou Nisshi】[第01话][1080p_AVC][简体] 已发送至Aria2.
任务已结束！
# 完成番剧订阅
```
### 更新番剧
```shell
# docker中默认设置了crontab任务 在使用docker的情况下一般不需要手动触发更新
bgmdb update
```
### 整理番剧目录树
```shell
# docker中默认设置了crontab任务 在使用docker的情况下一般不需要手动触发整理任务
bgmdb organize

# 运行完成后的目录树如下
-- 放課後ていぼう日誌(2020)
 - S1
  - 1.mp4
  - 2.mp4
  - ...
  - 12.mp4
```
为了方便emby/plex/jellyfin等多媒体软件进行元数据的刮削，我们一般会将目录树整理成可以识别的形式。bgMDB总结出的格式为：```原产地名称(年份)/S${季编号}/${集编号}.mp4```。

但是由于aria2提供的能力有限，无法在建立下载任务的同时重命名bt下载的文件，所以需要在任务下载完成后进行重命名。```bgmdb organize``` 就是为了完成这个任务。

当bgmdb建立下载任务时，会记录任务的id，```bgmdb organize```会向aria2请求任务的状态，当任务被标记为完成时，将对目标文件进行整理的相关操作。如果运行时发现有个别任务未完成，那么只会处理已完成的任务。所以本命令一般需要轮询执行。docker中已经包含了轮询的crontab任务，如果使用node版本，则需要额外建立轮询任务。
### 查看已订阅的番剧
```shell
> bgmdb list
# 输出列表 中文名/原产地名称(年份)
1.放学后海堤日记/放課後ていぼう日誌(2020)
```
### 取消订阅番剧
```shell
# 这里使用TMDB提供的中文名或者原产地名称都可以
bgmdb remove 放学后海堤日记
# or
bgmdb remove 放課後ていぼう日誌
```
### 设置当前订阅进度
```shell
# 设置成功后 下一次bgmdb update将会从设置的集数开始下载
bgmdb mark 放学后海堤日记 S1 1
```

## TODO
- 更加完善的crontab日志
- 由于docker不完全依赖npm包，所以不需要同步版本号发布，近期会将docker与npm包拆分成两个仓库。
- 由于aria下载未完成的文件可能也会被EMBY/jellyfin/plex扫描到，造成观看体验的影响，后续可能会考虑增加临时目录，下载完成后再移动到目标位置。
- 由于本仓库使用了TMDB作为**番剧名称/发布年份/季/话**的信息来源，未来解析更多的元数据，直接完成元信息的刮削似乎也是可行的。
- 在有足够的精力下，会考虑将RSS相关逻辑封装抽象出来，允许继承以实现更多的RSS源。
- 同样，在有足够的精力下，会考虑兼容更多的下载工具，例如Transmission等。

## Thanks
灵感来源：[BGmi/BGmi](https://github.com/BGmi/BGmi)

*由于BGmi设计上追求简洁，对EMBY/jellyfin/plex不做考虑，而我对于python也不尽熟悉，因此使用熟悉的node完成了本项目。

