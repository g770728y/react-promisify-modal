## React-Promisify-Modal

命令式打开对话框, 并用 promise 返回结果

---

## 开始使用

### 安装

```tsx
npm install -S react-promisify-modal
or
yarn add react-promisify-modal
```

### 使用

```tsx
openModal(({show, onOk, onCancel}) => (
  <Modal
    title="对话框"
    visible={show}
    onOk={() => onOk('finally')}
    onCancel={onCancel}
  >
      ...
  </Modal>))

.then(result => {
  // 使用 result
  ...
})
```

### Demo

[Demo](https://g770728y.github.io/react-promisify-modal/)

---

## 特性

- `openModal`直接打开对话框
- `openModal`返回一个`promise`, 在`then`方法里可以用到对话框的返回值
- 支持打开多重对话框
- `Modal`安装在当前组件树里, 共享`context`
- 使用`typescript`开发(暂时没有办法约定返回值类型, 后面会想办法补上)
- 无依赖, 含类型注释共 143 行

### 限制:

- 暂时只支持**模态对话框**, 非模态对话框可能关闭顺序有问题
- 由于用到了`hooks`, 因此只支持 `react 16.8.0` 以上版本

---

## 思考

某复杂前端项目, 需要连续打开三层对话框, 每层对话框都要使用父容器的状态\
可想而知, 无论如何优化, 父容器都非常臃肿, 而且操作非常不顺畅\
后来采用`渲染对话框到document.body, 脱离当前渲染树`的黑客式做法, 转换成`promise`写法, 操作非常连贯\
美中不足的是: 这样对话框无法用到`context`
另外有几个项目也做到了将 `modal` 转换为 `promise`, 但有的不支持多`modal`, 有的局限太大, 都不满足需求
所以有了本项目

---

## 原理

TODO

---

## 使用教程

### 1. 安装

```bash
npm install --save react-promisify-modal
```

### 2. 基础设置

需要在根组件上配置`ModalProvider`:

App.ts

```tsx
import { ModalProvider } from 'react-promisify-modal';

const App = () => (
  <ModalProvider>
    <Page />
  </ModalProvider>
);
```

Page.ts

```tsx
import React, {useContext}from 'react';
import {ModalContext, openModal} from 'react-promisify-modal';

const openModalCallback = () => {
  ...
  这里是打开对话框的语句, 见 第3步
  ...
}

return <Button onClick={openModalCallback}>打开对话框</Button>

```

### 3. 写 openModalCallback 方法

最简单的写法:

```tsx
const openModalCallback = () => {
  // 第四步: 直接用 openModal 打开对话框, 并通过then获取返回值
  openModal(({ show, onOk, onCancel }) => {
    return (
      <Modal
        title="Basic Modal"
        visible={show}
        // 第五步: 通过onOk回传结果
        // onOk 可以用在 按钮 或 其它ui元素 中, 比如: <button onClick={()=>onOk(42)}
        // onOk 当然也可以用在异步方法里 , 比如 : save({}).then(result => onOk(result))
        // 它仅是一个方法
        onOk={() => onOk('finally')}
        onCancel={onCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    );
  })
    // 第六步: 对话框关闭后, 可以通过then接收到 第五步 的内容
    .then(result => console.log(result)); // <== 打印 'finally'
```

进阶写法:
注意`openModal`的参数, 其实是一个`FunctionalComponent`, 其签名为:

```tsx
type PromisifyModalProps<R> = {
  show: boolean;
  onOk: onOkHandler<R>;
  onCancel: onCancelHandler;
};

type PromisifyModal<R = any> = React.FC<PromisifyModalProps<R>>;
```

所以你完全可以使用一个函数式组件, 避免将所有内容放在一起\
那么, 如果对话框使用函数式组件, Modal 如何使用 Page 的内容状态呢?
通过属性下传即可( TODO: 补示范代码 )

---

## License

MIT © [g770728y](https://github.com/g770728y)
