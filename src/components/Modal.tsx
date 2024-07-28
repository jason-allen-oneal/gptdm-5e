import React from 'react';
import styles from '@/styles/Modal.module.css';

const Modal = ({ isOpen, onClose, children }) => {
  console.log('Modal isOpen:', isOpen);
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;