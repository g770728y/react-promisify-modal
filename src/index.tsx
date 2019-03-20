import React, { useState } from 'react';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// typescript 类型信息      //////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type openModalHandler = <R>(promisifyModal: PromisifyModal<R>) => Promise<R>;

// 返回结果的handler
type onOkHandler<R> = (result: R) => void;

// 直接关闭对话框的handler
type onCancelHandler = () => void;

// 内部对话框组件的props
type PromisifyModalProps<R> = {
  show: boolean;
  onOk: onOkHandler<R>;
  onCancel: onCancelHandler;
};

type PromisifyModal<R = any> = React.FC<PromisifyModalProps<R>>;

// 一个modal的状态
interface ModalState<R = any> {
  // 用于查找 ( 由于 延迟删除 modalState 的原因, 可能导致  modalState 与 modal 无法一一对应)
  id: number;
  // 是否显示此对话框
  show: boolean;
  // 使用 showModal(({show, onResult}) => <Modal show={show} >....</Modal>)
  // 此时 showModal 的参数, 实质上相当于一个 ModalComponnet 组件
  Modal: PromisifyModal<R>;
  // 对话框在确认时, 使用 resolve 向调用者返回参数( 返回的参数 将通过 then(result => {}))  方式 通知调用方 )
  resolve: (result: R) => void;
  reject: (e?: Error) => void;
  // 关闭时间: 关闭后1秒将从栈中移除
  // 不能在关闭对话框时, 直接移出栈的原因是: 对话框将没有关闭动画
  expiredAt?: Date;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// 代码                     //////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 对话框的id( 支持 多重对话框, 使用 stack 维护 )
let id = 0;

export const ModalContext = React.createContext<{
  openModal?: openModalHandler;
}>({});

export const ModalProvider: React.SFC = ({ children }) => {
  const [modalStates, _setModalStates] = useState<ModalState[]>([]);

  const modalStatesRef = React.useRef(modalStates);

  const setModalStates = (states: ModalState[]) => {
    _setModalStates(states);
    modalStatesRef.current = states;
  };

  // 由于被ModalContext.Provider 使用, openModal 的引用不可变!
  // 所以最终使用了 modalStatesRef
  const openModal = React.useCallback((Modal: PromisifyModal) => {
    const p = new Promise<any>((resolve, reject) => {
      const newModalStates = [
        ...modalStatesRef.current,
        {
          id: id++,
          show: true,
          Modal,
          resolve,
          reject
        }
      ];
      setModalStates(newModalStates);
    }).catch(e => {
      if (e.message === 'modal-hided') {
        // 忽略对话框关闭
      } else {
        throw e;
      }
    });

    return p;
  }, []);

  // 如果有关闭对话框, 那么仅设置状态, 并记录关闭时间, 留待定时器清除
  const [needClearExpired, setNeedClearExpired] = useState(false);
  // 引用可变, 无需使用 modalStatesRef
  const hideModal = React.useCallback(
    (id: number) => {
      const idx = modalStates.findIndex(state => state.id === id);
      const reject = modalStates[idx].reject;
      const newModalStates = [
        ...modalStates.slice(0, idx),
        { ...modalStates[idx], show: false, expiredAt: new Date() },
        ...modalStates.slice(idx + 1)
      ];
      setModalStates(newModalStates);
      setNeedClearExpired(true);
      reject(new Error('modal-hided'));
    },
    [modalStates]
  );

  // 如果有关闭对话框 , 那么 5 秒后清除 ( 目的是维持关闭动画 )
  React.useEffect(() => {
    if (!needClearExpired) return;
    const timeoutHandler = setTimeout(clearExpiredState, 5000);

    function clearExpiredState() {
      console.log('clear: ');
      const validModalStates = modalStatesRef.current.filter(s => {
        return (
          !s.expiredAt || new Date().getTime() - s.expiredAt.getTime() < 1000
        );
      });
      setModalStates(validModalStates);
      setNeedClearExpired(false);
    }

    return () => clearTimeout(timeoutHandler);
  }, [needClearExpired]);

  return (
    <ModalContext.Provider value={{ openModal }}>
      {children}
      {modalStates.map(({ id, show, Modal, resolve }) => {
        const onOk = (result: any) => {
          resolve(result);
          hideModal(id);
        };
        return (
          <Modal
            key={id}
            show={show}
            onOk={onOk}
            onCancel={() => hideModal(id)}
          />
        );
      })}
    </ModalContext.Provider>
  );
};
