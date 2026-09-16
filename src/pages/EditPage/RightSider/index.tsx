import { useState } from "react"
import useEditStore from "@/store/editStore"
import EditCmp from "./EditCmp"
import EditCanvas from "./EditCanvas"
import EditMultiCmps from "./EditMultiCmps"
import styles from "./index.module.less"

// 画布
export default function RightSider() {
  const [showEdit, setShowEdit] = useState(false)

  const canvas = useEditStore((state) => state.canvas)
  const assembly = useEditStore((state) => state.assembly)

  const assemblySize = assembly.size

  return (
    <div className={styles.main}>
      <div
        className={styles.switch}
        onClick={() => {
          setShowEdit(!showEdit)
        }}
      >
        {showEdit ? "隐藏编辑区域" : "显示编辑区域"}
      </div>

      {showEdit &&
        (assemblySize === 0 ? (
          <EditCanvas canvas={canvas} />
        ) : assemblySize === 1 ? (
          <EditCmp selectedCmp={canvas.cmps[Array.from(assembly)[0]]} />
        ) : (
          <EditMultiCmps />
        ))}
    </div>
  )
}
