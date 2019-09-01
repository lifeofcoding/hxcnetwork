import React from 'react';
import styles from './loading.scss';

export class Loading extends React.Component {
  constructor(props) {
    super();

    this.state = {
      show: false
    }
  }

  render() {
    return (
      <div className={styles.spinnerWrapper}>
        <div className={styles.spinner}>
          <div className={styles.spinnerCircle+' '+styles.spinnerCircleOuter}></div>
          <div className={styles.spinnerCircle+' '+styles.spinnerCircleInner}></div>
          <div className={styles.spinnerCircle+' '+styles.spinnerCircleSingle1}></div>
          <div className={styles.spinnerCircle+' '+styles.spinnerCircleSingle2}></div>
          <div className={styles.text}>...loading...</div>
        </div>
      </div>
    )
  }
}
