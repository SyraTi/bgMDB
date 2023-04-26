// @ts-ignore
import Aria2 from 'aria2'

const { BGMDB_ARIA2_HOST, BGMDB_ARIA2_PORT, BGMDB_ARIA2_SECRET } = process.env
const aria2 = new Aria2({
  host: BGMDB_ARIA2_HOST,
  port: BGMDB_ARIA2_PORT,
  secure: false,
  secret: BGMDB_ARIA2_SECRET,
  path: '/jsonrpc',
})

export default aria2
