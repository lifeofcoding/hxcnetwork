import React from 'react';
import ReactDOM from 'react-dom';
import {
  Page,
  Panel,
  Table,
  Modal,
  TableHead,
  TableBody,
  TableRow,
  Button,
  EditableText,
  Pagination,
  Breadcrumbs,
} from 'react-blur-admin';
import {Row, Col} from 'react-flex-proto';
import styles from './result.scss';
import eventBus from '../lib/event-bus';

export class Result extends React.Component {
  constructor(props) {
    super();

    this.state = {
      imageIsReady: false,
      modal: {
        title: '',
        videoId: '',
        show: false,
      },
      loading: true,
    };

    this.timer = null;
    this.el = null;
  }
  componentDidMount() {
    const img = new Image();
    img.src = this.props.result.coverUrl; // by setting an src, you trigger browser download

    img.onload = () => {
      // when it finishes loading, update the component state
      this.setState({imageIsReady: true});
    };
  }

  play(e, result) {
    e.preventDefault();

    let song = {
      title: result.artist + ' - ' + result.title,
      url: '/api/download/' + result.youtubeId,
    };
    eventBus.playSong(song);
  }

  render() {
    const {imageIsReady} = this.state;
    const download = this.props.download;

    let style = {
      background: 'url(' + this.props.result.coverUrl + ')',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '120% auto',
    };

    let blur = {
      filter: 'blur(5px)',
    };

    return (
      <Table style={imageIsReady ? style : blur}>
        <TableBody>
          <TableRow ref={el => (this.el = el)}>
            <td style={{background: 'rgba(0,0,0,0.8)', width: '200px'}}>
              <img src={this.props.result.coverUrl} width="200px" />
            </td>
            <td style={{background: 'rgba(0,0,0,0.8)'}}>
              <a
                href={`#${this.props.result.artist} - ${this.props.result.title}`}
                className={styles.title}
                onClick={e => this.play(e, this.props.result)}
              >
                {this.props.result.artist} - {this.props.result.title}
              </a>

              <p>
                <b>Album:</b> {this.props.result.album}
              </p>
              <p>
                <b>Genre:</b> {this.props.result.genre}
              </p>
            </td>
            <td
              style={{
                background: 'rgba(0,0,0,0.8)',
                verticalAlign: 'middle',
                'text-align': 'center',
              }}
            >
              <Button
                type="info"
                icon={<i className="fa fa-download" />}
                onClick={e => download(this.props.result)}
                title="Download"
                size="sm"
              />
            </td>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
}
