import React from 'react';

class FileItem extends React.Component {
  state = {
    currentProgress: 0
  }
  componentDidMount() {
    this.timer = setInterval(() => {
      if (this.state.currentProgress >= 100)
        clearInterval(this.timer); 
      else {
        const rate = Math.floor(Math.random() * Math.floor(15));
        this.setState(prevState => {
          prevState.currentProgress += rate;
          return prevState;
        })
      }
    }, 1000);
  }
  render() {
    const pg = this.state.currentProgress;
    const {name, size, progress} = this.props.data;
    const iconUrl = "http://icons.iconarchive.com/icons/pixelkit/swanky-outlines/16/02-File-icon.png";
    const progressBg = 'rgba(0,0,0,.05)';
    const style = {
      backgroundImage: `linear-gradient(to right, ${progressBg}, ${progressBg} ${pg}%, transparent ${pg}%)`,
    };
    return (
      <article>
        <h5><img src={iconUrl} alt="file" /> {name}</h5>
        <h5>{(size/1000000).toFixed(2)} MB</h5>
        <h3>{ pg >= 100? '✔' : pg }{ pg < 100 && <small>%</small> }</h3>
        <div className="progress-file">
          <div style={{width:`${pg}%`}}></div>
        </div>
      </article>
    );
  }
}

export default class Uploader extends React.Component {
  state = {
    files: []
  }
  handleInputChange = (e) => {
    const files = Array.from(e.target.files).map(file => {
      const {name, size, lastModified, type, progress = 0} = file;
      return {name, size, lastModified, type, progress};
    });
    this.setState({ files });
  }
  handleSelectFiles = (e) => {
    e.currentTarget.parentElement.querySelector('input').click();
  }
  handleFakeUpdate = (e) => {

  }
  render() {
    const {files} = this.state;
    return (
      <div className="uploader">
        <header>
          <h3>Crack Capture File</h3>
          <button onClick={this.handleSelectFiles}>Browse</button>
          <input multiple
            type="file" 
            className="fileinput"
            onChange={this.handleInputChange} />
        </header>
        <section>
          {
            files.length === 0 ?
              (<h3 className="empty-message">Upload Something!!!</h3>) :
              files.map(file => <FileItem data={file} />)
          }
        </section>
        <footer>
          <div className="progress-general"></div>
          <div className="info">
            <h5>0%</h5>
            <h5>Total 0 MB</h5>
          </div>
        </footer>
      </div>
    );
  }
}