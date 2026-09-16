import { Card, Divider, Table, Space, Button, message } from "antd"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { getCanvasList, del, type ListItem } from "@/request/list"

export default function ListPage() {
  const [messageApi, contextHolder] = message.useMessage()
  const [list, setList] = useState<ListItem[]>([])

  const fresh = () => {
    getCanvasList(
      "",
      (res) => {
        setList(res.content || [])
      },
      (msg) => messageApi.error(msg),
    )
  }

  useEffect(() => {
    fresh()
  }, [])

  const editUrl = (item: ListItem) => `/?id=${item.id}&type=${item.type}`

  const handleDelete = (id: number) => {
    del(
      { id },
      () => {
        messageApi.success("删除成功")
        fresh()
      },
      (msg) => messageApi.error(msg),
    )
  }

  const columns = [
    {
      title: "id",
      key: "id",
      render: (item: ListItem) => <Link to={editUrl(item)}>{item.id}</Link>,
    },
    {
      title: "标题",
      key: "title",
      render: (item: ListItem) => {
        const title = item.title || "未命名"
        return <Link to={editUrl(item)}>{title}</Link>
      },
    },
    {
      title: "动作",
      key: "action",
      render: (item: ListItem) => {
        const { id } = item
        return (
          <Space size="middle">
            <a
              target="_blank"
              rel="noreferrer"
              href={"https://builder-lesson.vercel.app/?id=" + id}
            >
              线上查看（切移动端）
            </a>
            <Link to={editUrl(item)}>编辑</Link>
            <Button danger onClick={() => handleDelete(id)}>
              删除
            </Button>
          </Space>
        )
      },
    },
  ]

  return (
    <Card>
      {contextHolder}
      <Link to="/">新增</Link>
      <Divider />
      <Table
        columns={columns}
        dataSource={list}
        rowKey={(record: ListItem) => record.id}
      />
    </Card>
  )
}
