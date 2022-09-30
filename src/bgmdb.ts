#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import MikanAni from './MikanAni.class.js'
import TMDB from './TMDB.class.js'
import rl from './readline.js'
import aria2Conn from './aria2Conn.js'

const args: string[] = process.argv.slice(2)
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
    switch (args[0]) {
      case ACTIONS.ADD: {
        const tmdbLink: string = args[1]
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
          if (!ifContinue) break
        }
        metaInfo = await MikanAni.match(metaInfo)
        session.bangumi = session.bangumi.filter(
          (bgm) => bgm.id !== metaInfo.id
        )
        session.bangumi.push(metaInfo)
        fs.writeFileSync(BGMDB_SESSION_PATH, JSON.stringify(session))
        console.log('任务已结束！')
        break
      }
      case ACTIONS.UPDATE: {
        for (let i = 0; i < session.bangumi.length; i++) {
          session.bangumi[i].downloadTasks = [
            ...session.bangumi[i].downloadTasks,
            ...(await MikanAni.update(session.bangumi[i])),
          ]
        }
        fs.writeFileSync(BGMDB_SESSION_PATH, JSON.stringify(session))
        break
      }
      case ACTIONS.LIST: {
        session.bangumi.forEach((bgm, index) => {
          console.log(
            `${index + 1}.${bgm.chineseName}/${bgm.localName}${bgm.releaseDate}`
          )
        })
        break
      }
      case ACTIONS.REMOVE: {
        const targetName: string = args[1]
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
        break
      }
      case ACTIONS.MARK: {
        const targetName: string = args[1]
        const targetSeasonKey: string = args[2]
        if (
          targetName &&
          targetSeasonKey &&
          args[3] !== undefined &&
          !Number.isNaN(Number(args[3]))
        ) {
          const targetProgress: number = Number(args[3])
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
        break
      }
      case ACTIONS.ORGANIZE:
        for (let i = 0; i < session.bangumi.length; i++) {
          const notCompletes = []
          for (let j = 0; j < session.bangumi[i].downloadTasks.length; j++) {
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
          }
          session.bangumi[i].downloadTasks = notCompletes
        }
        fs.writeFileSync(BGMDB_SESSION_PATH, JSON.stringify(session))
        break
      default:
        break
    }
  } catch (e) {
    console.log(e)
  }
  rl.close()
  process.exit(0)
})()
