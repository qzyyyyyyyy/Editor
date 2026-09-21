import { Button, Form, Input, Checkbox, Modal, message } from 'antd'
import { login, logout, register } from '@/services/authService'
import docCookies from '../utils/cookies'

export default function Login() {
  const [messageApi, contextHolder] = message.useMessage()

  // 校验登录
  const auth = docCookies.getItem('sessionId')
  const name = docCookies.getItem('name')

  const handleOk = () => {
    window.location.reload()
  }

  // 用户已经登录，显示登录信息
  if (auth) {
    return (
      <>
        {contextHolder}
        <Button
          style={{ float: 'right', marginTop: 16 }}
          onClick={() =>
            logout(
              () => {
                messageApi.success('已退出登录')
                handleOk()
              },
              (msg) => messageApi.error(msg)
            )
          }
        >
          {name} 退出登录
        </Button>
      </>
    )
  }

  // 用户未登录，显示登录/注册弹窗
  const onFinish = ({
    name,
    password,
    register_login,
  }: {
    name: string
    password: string
    register_login: boolean
  }) => {
    if (register_login) {
      registerAndLogin({ name, password })
    } else {
      login(
        { name, password },
        () => {
          messageApi.success('登录成功')
          handleOk()
        },
        (msg) => messageApi.error(msg)
      )
    }
  }

  const onFinishFailed = () => {
    messageApi.warning('请先完整填写用户名和密码')
  }

  const registerAndLogin = (values: { name: string; password: string }) => {
    register(
      values,
      () => {
        messageApi.success('注册成功，正在登录...')
        login(
          values,
          () => {
            messageApi.success('登录成功')
            handleOk()
          },
          (msg) => messageApi.error(msg)
        )
      },
      (msg) => messageApi.error(msg)
    )
  }

  return (
    <Modal title="注册与登录" closable={false} open={true} footer={[]}>
      {contextHolder}
      <p className="red">登录之后才可使用~</p>
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="name"
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
          ]}
        >
          <Input placeholder="至少 2 个字符" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[
            {
              required: true,
              message: '请输入密码!',
            },
          ]}
        >
          <Input.Password placeholder="至少 4 位" />
        </Form.Item>
        <Form.Item
          name="register_login"
          valuePropName="checked"
          wrapperCol={{ offset: 7 }}
        >
          <Checkbox className="red">注册并登录</Checkbox>
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
