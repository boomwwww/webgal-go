/**
 * 通过名称获取所有文件夹
 */
export const getAllDirsByName = async (name, root, options = { ignore: ['node_modules'] }) => {
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
  await walk(root)
  return dirs
}
