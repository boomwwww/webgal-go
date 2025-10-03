import fs from 'node:fs'
import path from 'node:path'
import { getAllDirsByName } from './utils'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.resolve(__dirname, '..')

const getAllNodeModulesDirs = async () => {
  const dirs = await getAllDirsByName('node_modules', rootDir)
  return dirs
}

const getAllDistDirs = async () => {
  const dirs = await getAllDirsByName('dist', rootDir)
  return dirs
}

const main = async () => {
  console.log('正在项目中查找所有的node_modules文件夹和dist文件夹')
  const allDirs = [...(await getAllNodeModulesDirs()), ...(await getAllDistDirs())]
  console.log(`找到${allDirs.length}个文件夹`)
  console.log(allDirs)

  for (const dir of allDirs) {
    console.log(`正在删除${dir}`)
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

main()
