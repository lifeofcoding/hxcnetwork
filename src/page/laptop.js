import React from 'react';
import { Page, Panel, Input, Select, Table, TableHead, TableBody, TableRow, Button, EditableText, Pagination, Breadcrumbs } from 'react-blur-admin';
import { Row, Col } from 'react-flex-proto';
import axios from 'axios';
import eventBus from '../lib/event-bus';
import ReactIframeResizer from 'react-iframe-resizer-super';
 
 
const iframeResizerOptions = { checkOrigin: false, log: true, heightCalculationMethod: 'grow', sizeHeight: true };

export class Laptop extends React.Component {

  render() {
    return (
      <Page title="Laptop">

        <Panel title='Laptop'>
          <ReactIframeResizer iframeResizerOptions={iframeResizerOptions} style={{minHeight:'800px'}} src="http://machine.hxcnetwork.com/vnc_lite.html"></ReactIframeResizer>
        </Panel>

      </Page>
    );
  }
}

