import React from 'react'
import './App.css';
// import { Component } from 'react'
import { Upload, Button, message } from 'antd'
import 'antd/dist/antd.css';
// import ImgCrop from 'antd-img-crop';
import ImgCrop from './antd-img-crop';

function App () {
  const props = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  const onError = (error) => {
    console.log(error)
  }
  return (
    <div className="App">
      <div >
        <ImgCrop onError={onError}>
          <Upload {...props}>
            <Button>Click to Upload</Button>
          </Upload>
        </ImgCrop>
      </div>
    </div>
  );
}
export default App;
