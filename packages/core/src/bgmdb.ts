#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { program } from 'commander'
import MikanAni from './MikanAni.class'
import TMDB from './tmdb.class.js'
import rl from './readline'
import aria2Conn from './aria2Conn'

const BGMDB_SESSION_PATH = process.env.BGMDB_SESSION_PATH ?? './bgmdb.session'

if (!fs.existsSync(BGMDB_SESSION_PATH)) {
  fs.writeFileSync(BGMDB_SESSION_PATH, JSON.stringify({ bangumi: [] }))
}
enum ACTIONS {
  ADD = 'add',
  LIST = 'list',
  REMOVE = 'remove',
  UPDATE = 'update',
  MARK = 'mark',
  ORGANIZE = 'organize',
}
;(async () => {
  const session: Session = JSON.parse(
    fs.readFileSync(BGMDB_SESSION_PATH, { encoding: 'utf-8' }) || '{}'
  )
  session.bangumi = session.bangumi || []
  try {
    program
      .command(ACTIONS.ADD)
      .description('新增番剧订阅')
      .argument('<tmdb-url>', 'TMDB链接')
      .action(async (tmdbLink) => {
        let metaInfo = await TMDB.parse(tmdbLink)
        console.log('解析成功！', metaInfo)
        if (session.bangumi.find((bgm) => bgm.id === metaInfo.id)) {
          const ifContinue = await new Promise((resolve) => {
            rl.question(
              `${metaInfo.chineseName}/${metaInfo.localName}${metaInfo.releaseDate} 已经被添加过，是否要覆盖？(y/n)`,
              (yesOrNo: string) => {
                if (yesOrNo.toLowerCase() === 'y') resolve(true)
                resolve(false)
              }
            )
          })
          if (!ifContinue) return
        }
        metaInfo = await MikanAni.match(metaInfo)
        session.bangumi = session.bangumi.filter(
          (bgm) => bgm.id !== metaInfo.id
        )
        session.bangumi.push(metaInfo)
        fs.writeFileSync(BGMDB_SESSION_PATH, JSON.stringify(session))
        console.log('任务已结束！')
      })
    program
      .command(ACTIONS.UPDATE)
      .description('更新番剧订阅')
      .action(async () => {
        for (let i = 0; i < session.bangumi.length; i++) {
          session.bangumi[i].downloadTasks = [
            ...session.bangumi[i].downloadTasks,
            ...(await MikanAni.update(session.bangumi[i])),
          ]
        }
        fs.writeFileSync(BGMDB_SESSION_PATH, JSON.stringify(session))
      })
    program
      .command(ACTIONS.LIST)
      .description('查看订阅列表')
      .action(() => {
        session.bangumi.forEach((bgm, index) => {
          console.log(
            `${index + 1}.${bgm.chineseName}/${bgm.localName}${bgm.releaseDate}`
          )
        })
      })
    program
      .command(ACTIONS.REMOVE)
      .description('删除指定订阅')
      .argument('<bangumi-name>', '番剧译名or原产地名称')
      .action((targetName) => {
        const target = session.bangumi.find(
          (bgm) =>
            bgm.chineseName === targetName || bgm.localName === targetName
        )
        if (!target) {
          console.log('没有找到目标番剧！')
        } else {
          session.bangumi = session.bangumi.filter(
            (bgm) => bgm.id !== target.id
          )
          console.log(
            `'${target.chineseName}/${target.localName}${target.releaseDate}已被移除订阅！`
          )
        }
        fs.writeFileSync(BGMDB_SESSION_PATH, JSON.stringify(session))
      })

    program
      .command(ACTIONS.MARK)
      .description('标记番剧下载进度')
      .argument('<bangumi-name>', '番剧译名or原产地名称')
      .argument('<season>', '需要设置进度的季，例如S1、S2')
      .argument('<episode>', '需要设置的集数进度，从0开始')
      .action((targetName, targetSeasonKey, targetProgress) => {
        if (
          targetName &&
          targetSeasonKey &&
          targetProgress !== undefined &&
          !Number.isNaN(Number(targetProgress))
        ) {
          targetProgress = Number(targetProgress)
          const targetBangumi = session.bangumi.find(
            (bgm) =>
              bgm.chineseName === targetName || bgm.localName === targetName
          )
          if (!targetBangumi) {
            console.log('没有找到目标番剧！')
            return
          }
          const targetSeason = targetBangumi.seasons.find(
            (season) =>
              season.index === targetSeasonKey ||
              season.title === targetSeasonKey
          )
          if (!targetSeason) {
            console.log('没有找到目标季！')
            return
          }
          const currentProgress = targetSeason.episodes.reduce(
            (max, cur) => (cur.index > max ? cur.index : max),
            0
          )
          if (Number(targetProgress) > currentProgress) {
            console.log('标记的进度大于当前实际进度，请先fetch！')
            return
          }
          targetSeason.progress = Number(targetProgress)
          fs.writeFileSync(BGMDB_SESSION_PATH, JSON.stringify(session))
          console.log(
            `'${targetBangumi.chineseName}/${targetBangumi.localName}${targetBangumi.releaseDate}-${targetSeason.index}${targetSeason.title} 的当前进度已经被设置为${targetProgress}！`
          )
        }
      })

    program
      .command(ACTIONS.ORGANIZE)
      .description('整理文件目录树，方便元数据刮削')
      .action(async () => {
        for (let i = 0; i < session.bangumi.length; i++) {
          const notCompletes = []
          for (let j = 0; j < session.bangumi[i].downloadTasks.length; j++) {
            try {
              const task = session.bangumi[i].downloadTasks[j]
              const { followedBy } = await aria2Conn.call(
                'tellStatus',
                task.gid,
                ['followedBy']
              )
              if (!followedBy || !followedBy[0]) {
                continue
              }
              const { status, files } = await aria2Conn.call(
                'tellStatus',
                followedBy[0],
                ['status', 'files']
              )
              console.log(
                `发现任务, status->${status}, 包含 ${files?.[0].path} 等文件。 `
              )
              if (status === 'complete') {
                files.forEach((file: { path: string }) => {
                  const oldPath = file.path
                  const newPath = path.resolve(
                    file.path,
                    `../${task.episode}${path.extname(file.path)}`
                  )
                  console.log(
                    `正在重命名文件，oldPath->${oldPath}, newPath->${newPath}`
                  )
                  fs.renameSync(oldPath, newPath)
                })
              } else {
                notCompletes.push(task)
              }
            } catch (e) {
              console.log('任务异常，bgmdb无法继续追踪，请手动进行调整！', e)
            }
          }
          session.bangumi[i].downloadTasks = notCompletes
        }
        fs.writeFileSync(BGMDB_SESSION_PATH, JSON.stringify(session))
      })

    await program.parseAsync(process.argv)
  } catch (e) {
    console.log(e)
  }
  rl.close()
  process.exit(0)
})()
