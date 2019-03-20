import React, { useContext } from 'react';
import 'antd/dist/antd.css';
import { Modal, Button } from 'antd';
import { ModalProvider, ModalContext } from 'react-promisify-modal';

function Page() {
  // 第二步: 从useContext中获取 openModal方法
  const { openModal } = useContext(ModalContext);

  // 第三步: 定义打开对话框回调方法
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
  };

  return <Button onClick={openModalCallback}>点我打开对话框</Button>;
}

function App() {
  return (
    // 第一步: 引入 ModalProvider
    <ModalProvider>
      <Page />
    </ModalProvider>
  );
}

export default App;
