import React from 'react';
import { Page, Panel, Input, Select, Table, TableHead, TableBody, TableRow, Button, EditableText, Pagination, Breadcrumbs } from 'react-blur-admin';
import { Row, Col } from 'react-flex-proto';
import axios from 'axios';
import eventBus from '../lib/event-bus';

export class Cameras extends React.Component {
  constructor(props) {
    super();

    this.state = {
        cameras: [

        ]    
    }
  }

  render() {
    const cameras = (this.state.cameras || []);
    return (
      <Page title="Cameras">
        <Panel title='Cameras'>
            <Row>
                <Col>
                          <embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" autoplay="yes" loop="no" width="300" height="200" target="rtsp://jimmy:9641@192.168.1.100:554/1" />
                <object classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921" codebase="http://download.videolan.org/pub/videolan/vlc/last/win32/axvlc.cab" style="display:none;"></object>
                </Col>
                <Col>
                          <embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" autoplay="yes" loop="no" width="300" height="200" target="rtsp://jimmy:9641@192.168.1.100:554/2" />
                <object classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921" codebase="http://download.videolan.org/pub/videolan/vlc/last/win32/axvlc.cab" style="display:none;"></object>
                </Col>
            </Row>
            <Row>
                <Col>
                          <embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" autoplay="yes" loop="no" width="300" height="200" target="rtsp://jimmy:9641@192.168.1.100:554/3" />
                <object classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921" codebase="http://download.videolan.org/pub/videolan/vlc/last/win32/axvlc.cab" style="display:none;"></object>
                </Col>
                <Col>
                          <embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" autoplay="yes" loop="no" width="300" height="200" target="rtsp://jimmy:9641@192.168.1.100:554/4" />
                <object classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921" codebase="http://download.videolan.org/pub/videolan/vlc/last/win32/axvlc.cab" style="display:none;"></object>
                </Col>
            </Row>
        </Panel>

      </Page>
    );
  }
}

