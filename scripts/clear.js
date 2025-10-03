import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 通过名称获取所有文件夹
 */
const getAllDirsByName = async (name, options = {}) => {
  const { ignore = [] } = options
  const dirs = []
  const walk = async (dir) => {
    try {
      const files = await fs.promises.readdir(dir)
      for (const file of files) {
        const filePath = path.join(dir, file)
        try {
          const stat = await fs.promises.stat(filePath)
          if (stat.isDirectory()) {
            if (file === name) {
              dirs.push(filePath)
            } else if (!ignore.includes(file)) {
              await walk(filePath)
            }
          }
        } catch (e) {
          console.log(`---错误信息---`)

          console.log(`无法访问${filePath}`)
          console.error(e)
          console.log(`---`)

          continue
        }
      }
    } catch (e) {
      console.log(`---发生错误---`)
      console.error(e)
      console.log(`---`)
      return
    }
  }
  await walk(path.join(__dirname, '..'))
  return dirs
}

const getAllNodeModulesDirs = async () => {
  const dirs = await getAllDirsByName('node_modules', { ignore: ['node_modules'] })
  return dirs
}

const getAllDistDirs = async () => {
  const dirs = await getAllDirsByName('dist', { ignore: ['node_modules'] })
  return dirs
}

const main = async () => {
  console.log('正在项目中查找所有的node_modules文件夹和dist文件夹')
  const allDris = [...(await getAllNodeModulesDirs()), ...(await getAllDistDirs())]
  console.log(`找到${allDris.length}个文件夹`)
  console.log(allDris)

  for (const dir of allDris) {
    console.log(`正在删除${dir}`)
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

main()
